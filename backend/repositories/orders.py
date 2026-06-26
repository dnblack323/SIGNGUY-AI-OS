from pymongo import ASCENDING, DESCENDING, ReturnDocument

try:
    from ..shared.dates import utc_now
    from ..shared.ids import new_id
    from ..shared.indexes import ensure_collection_indexes
except ImportError:
    from shared.dates import utc_now
    from shared.ids import new_id
    from shared.indexes import ensure_collection_indexes


class OrdersRepository:
    collections = ("orders", "order_items", "order_item_specs", "order_item_pricing_snapshots", "order_events")

    def __init__(self, database):
        self.database = database
        self.orders = database.orders
        self.items = database.order_items
        self.specs = database.order_item_specs
        self.snapshots = database.order_item_pricing_snapshots
        self.events = database.order_events

    async def ensure_indexes(self):
        for collection in self.collections:
            await ensure_collection_indexes(self.database[collection], collection)

    async def list_orders(self, tenant_id: str, filters: dict | None = None, limit: int = 200) -> list[dict]:
        query = {"tenant_id": tenant_id, **self._clean(filters or {})}
        rows = await self.orders.find(query, {"_id": 0}).sort("updated_at", DESCENDING).limit(limit).to_list(length=limit)
        return [await self._with_projection(tenant_id, row) for row in rows]

    async def get_order(self, tenant_id: str, order_id: str, include_items: bool = True) -> dict | None:
        order = await self.orders.find_one({"tenant_id": tenant_id, "id": order_id}, {"_id": 0})
        if not order:
            return None
        order = await self._with_projection(tenant_id, order)
        if include_items:
            order["items"] = await self.list_items(tenant_id, order_id=order_id)
        return order

    async def create_order(self, tenant_id: str, payload: dict) -> dict:
        now = utc_now()
        order_id = payload.get("id") or new_id()
        order_number = payload.get("order_number") or await self._next_order_number(tenant_id)
        document = {
            **payload,
            "id": order_id,
            "tenant_id": tenant_id,
            "order_number": order_number,
            "name": payload.get("name") or self._default_order_name(payload, now),
            "created_at": now,
            "updated_at": now,
            "version": 1,
            "is_archived": False,
        }
        document.pop("items", None)
        await self.orders.insert_one(document.copy())
        await self.record_event(tenant_id, order_id, "", "order_created", payload.get("created_by", ""), {"status": document.get("status")})
        return await self.get_order(tenant_id, order_id, include_items=True)

    async def update_order(self, tenant_id: str, order_id: str, patch: dict) -> dict | None:
        existing = await self.orders.find_one({"tenant_id": tenant_id, "id": order_id})
        if not existing:
            return None
        patch = {key: value for key, value in patch.items() if value is not None and key not in {"id", "tenant_id", "created_at", "order_number", "items"}}
        updated = {
            **existing,
            **patch,
            "id": order_id,
            "tenant_id": tenant_id,
            "created_at": existing.get("created_at"),
            "updated_at": utc_now(),
            "version": int(existing.get("version", 1)) + 1,
        }
        await self.orders.replace_one({"tenant_id": tenant_id, "id": order_id}, updated)
        if patch.get("status") and patch.get("status") != existing.get("status"):
            await self.record_event(tenant_id, order_id, "", "order_status_changed", patch.get("actor_id", ""), {"from": existing.get("status"), "to": patch["status"]})
        return await self.get_order(tenant_id, order_id, include_items=True)

    async def delete_order(self, tenant_id: str, order_id: str) -> bool:
        updated = await self.update_order(tenant_id, order_id, {"is_archived": True, "status": "cancelled"})
        if updated:
            await self.record_event(tenant_id, order_id, "", "order_archived", "", {})
        return bool(updated)

    async def list_items(self, tenant_id: str, order_id: str = "", category: str = "") -> list[dict]:
        query = {"tenant_id": tenant_id, **self._clean({"order_id": order_id, "item_category": category})}
        rows = await self.items.find(query, {"_id": 0}).sort("created_at", ASCENDING).to_list(length=500)
        return [await self._hydrate_item(tenant_id, row) for row in rows]

    async def get_item(self, tenant_id: str, item_id: str) -> dict | None:
        item = await self.items.find_one({"tenant_id": tenant_id, "id": item_id}, {"_id": 0})
        return await self._hydrate_item(tenant_id, item) if item else None

    async def create_item(self, tenant_id: str, payload: dict) -> dict:
        order = await self.get_order(tenant_id, payload["order_id"], include_items=False)
        if not order:
            raise LookupError("Order not found")
        now = utc_now()
        item_id = payload.get("id") or new_id()
        ticket_number = payload.get("ticket_number") or await self._next_ticket_number(tenant_id, order["id"], order["order_number"])
        specs = payload.pop("specs", {})
        document = {
            **payload,
            "id": item_id,
            "tenant_id": tenant_id,
            "customer_id": order.get("customer_id", ""),
            "ticket_number": ticket_number,
            "created_at": now,
            "updated_at": now,
            "version": 1,
        }
        await self.items.insert_one(document.copy())
        await self.save_item_specs(tenant_id, item_id, order["id"], specs)
        await self.record_event(tenant_id, order["id"], item_id, "order_item_created", payload.get("created_by", ""), {"item_category": document.get("item_category")})
        return await self.get_item(tenant_id, item_id)

    async def update_item(self, tenant_id: str, item_id: str, patch: dict) -> dict | None:
        existing = await self.items.find_one({"tenant_id": tenant_id, "id": item_id})
        if not existing:
            return None
        specs = patch.pop("specs", None)
        patch = {key: value for key, value in patch.items() if value is not None and key not in {"id", "tenant_id", "created_at", "order_id", "ticket_number"}}
        updated = {
            **existing,
            **patch,
            "updated_at": utc_now(),
            "version": int(existing.get("version", 1)) + 1,
        }
        await self.items.replace_one({"tenant_id": tenant_id, "id": item_id}, updated)
        if specs is not None:
            await self.save_item_specs(tenant_id, item_id, existing["order_id"], specs)
        if patch.get("status") and patch.get("status") != existing.get("status"):
            await self.record_event(tenant_id, existing["order_id"], item_id, "order_item_status_changed", patch.get("actor_id", ""), {"from": existing.get("status"), "to": patch["status"]})
        return await self.get_item(tenant_id, item_id)

    async def delete_item(self, tenant_id: str, item_id: str) -> bool:
        item = await self.items.find_one({"tenant_id": tenant_id, "id": item_id})
        if not item:
            return False
        result = await self.items.delete_one({"tenant_id": tenant_id, "id": item_id})
        await self.specs.delete_many({"tenant_id": tenant_id, "order_item_id": item_id})
        await self.record_event(tenant_id, item["order_id"], item_id, "order_item_deleted", "", {})
        return result.deleted_count == 1

    async def save_item_specs(self, tenant_id: str, item_id: str, order_id: str, specs: dict) -> dict:
        now = utc_now()
        document = {
            "id": new_id(),
            "tenant_id": tenant_id,
            "order_id": order_id,
            "order_item_id": item_id,
            "specs": specs or {},
            "created_at": now,
            "updated_at": now,
            "version": 1,
        }
        await self.specs.update_one(
            {"tenant_id": tenant_id, "order_item_id": item_id},
            {"$set": document},
            upsert=True,
        )
        return document

    async def save_pricing_snapshot(self, tenant_id: str, item: dict, calculation: dict) -> dict:
        now = utc_now()
        document = {
            "id": new_id(),
            "tenant_id": tenant_id,
            "order_id": item["order_id"],
            "order_item_id": item["id"],
            "item_category": item["item_category"],
            "calculation": calculation,
            "selling_price_minor": calculation["selling_price_minor"],
            "material_cost_minor": calculation["material_cost_minor"],
            "labor_cost_minor": calculation["labor_cost_minor"],
            "created_at": now,
            "updated_at": now,
            "version": 1,
        }
        await self.snapshots.insert_one(document.copy())
        await self.items.update_one(
            {"tenant_id": tenant_id, "id": item["id"]},
            {"$set": {
                "estimated_price_minor": calculation["selling_price_minor"],
                "material_estimate_minor": calculation["material_cost_minor"],
                "labor_estimate_minor": calculation["labor_cost_minor"],
                "updated_at": now,
            }, "$inc": {"version": 1}},
        )
        await self.record_event(tenant_id, item["order_id"], item["id"], "pricing_snapshot_saved", "", {"selling_price_minor": calculation["selling_price_minor"]})
        return {key: value for key, value in document.items() if key != "_id"}

    async def list_pricing_snapshots(self, tenant_id: str, item_id: str) -> list[dict]:
        return await self.snapshots.find({"tenant_id": tenant_id, "order_item_id": item_id}, {"_id": 0}).sort("created_at", DESCENDING).to_list(length=50)

    async def record_event(self, tenant_id: str, order_id: str, item_id: str, event_type: str, actor_id: str = "", metadata: dict | None = None) -> dict:
        now = utc_now()
        document = {
            "id": new_id(),
            "tenant_id": tenant_id,
            "order_id": order_id,
            "order_item_id": item_id,
            "event_type": event_type,
            "actor_id": actor_id,
            "actor_type": "user",
            "metadata": metadata or {},
            "created_at": now,
            "updated_at": now,
            "version": 1,
        }
        await self.events.insert_one(document.copy())
        return {key: value for key, value in document.items() if key != "_id"}

    async def list_events(self, tenant_id: str, order_id: str, item_id: str = "") -> list[dict]:
        query = {"tenant_id": tenant_id, "order_id": order_id, **self._clean({"order_item_id": item_id})}
        return await self.events.find(query, {"_id": 0}).sort("created_at", DESCENDING).to_list(length=500)

    async def _hydrate_item(self, tenant_id: str, item: dict) -> dict:
        spec = await self.specs.find_one({"tenant_id": tenant_id, "order_item_id": item["id"]}, {"_id": 0})
        snapshots = await self.list_pricing_snapshots(tenant_id, item["id"])
        return {**item, "specs": spec.get("specs", {}) if spec else {}, "latest_pricing_snapshot": snapshots[0] if snapshots else None}

    async def _with_projection(self, tenant_id: str, order: dict) -> dict:
        items = await self.items.find({"tenant_id": tenant_id, "order_id": order["id"]}, {"_id": 0}).to_list(length=1000)
        total = sum(int(item.get("estimated_price_minor", 0)) for item in items)
        completed = sum(1 for item in items if item.get("status") == "completed")
        return {**order, "job_ticket_count": len(items), "overall_progress": round((completed / len(items)) * 100, 2) if items else 0, "estimated_total_minor": total}

    async def _next_order_number(self, tenant_id: str) -> str:
        count = await self.orders.count_documents({"tenant_id": tenant_id})
        return f"ORD-{count + 1:04d}"

    async def _next_ticket_number(self, tenant_id: str, order_id: str, order_number: str) -> str:
        count = await self.items.count_documents({"tenant_id": tenant_id, "order_id": order_id})
        return f"{order_number}-{count + 1:02d}"

    def _default_order_name(self, payload: dict, now) -> str:
        customer = payload.get("customer_name") or payload.get("company_name") or "ORDER"
        return f"{customer.upper().replace(' ', '-')}-{now.strftime('%m%d%y')}"

    def _clean(self, filters: dict) -> dict:
        return {key: value for key, value in filters.items() if value not in {"", None}}
