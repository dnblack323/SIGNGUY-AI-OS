from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field

from ..core.db import db
from ..core.permissions import Perm
from ..core.time_utils import prepare_for_mongo, serialize_doc, utc_now
from ..deps import require_permission
from ..models.order import Order, OrderItem
from ..services.audit import record_audit
from ..services.sequence import next_number

router = APIRouter(prefix="/orders", tags=["orders"])


class OrderCreateIn(BaseModel):
    customer_id: str
    job_name: str = Field(min_length=1, max_length=200)
    notes: Optional[str] = None


class OrderUpdateIn(BaseModel):
    job_name: Optional[str] = None
    notes: Optional[str] = None


class OrderStatusIn(BaseModel):
    status: Literal["draft", "confirmed", "in_production", "completed", "cancelled"]


class OrderItemIn(BaseModel):
    description: str = Field(min_length=1, max_length=500)
    quantity: int = Field(1, ge=1)
    unit_price_cents: int = Field(0, ge=0)


class OrderItemUpdateIn(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    quantity: Optional[int] = Field(None, ge=1)
    unit_price_cents: Optional[int] = Field(None, ge=0)
    position: Optional[int] = None


async def _order_items(tenant_id: str, order_id: str) -> list[dict]:
    cursor = db.order_items.find(
        {"tenant_id": tenant_id, "order_id": order_id}, {"_id": 0}
    ).sort("position", 1)
    return [serialize_doc(d) async for d in cursor]


def _totals(items: list[dict]) -> dict:
    subtotal = sum(int(i.get("quantity", 1)) * int(i.get("unit_price_cents", 0)) for i in items)
    return {"subtotal_cents": subtotal, "item_count": len(items)}


@router.get("")
async def list_orders(
    status: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    skip: int = Query(0, ge=0),
    user: dict = Depends(require_permission(Perm.ORDER_READ)),
) -> dict:
    q: dict = {"tenant_id": user["tenant_id"]}
    if status:
        q["status"] = status
    if customer_id:
        q["customer_id"] = customer_id
    total = await db.orders.count_documents(q)
    cursor = db.orders.find(q, {"_id": 0}).sort("number", -1).skip(skip).limit(limit)
    items = []
    async for d in cursor:
        items.append(serialize_doc(d))
    return {"items": items, "total": total, "limit": limit, "skip": skip}


@router.post("", status_code=201)
async def create_order(payload: OrderCreateIn, user: dict = Depends(require_permission(Perm.ORDER_WRITE))) -> dict:
    cust = await db.customers.find_one({"id": payload.customer_id, "tenant_id": user["tenant_id"]})
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    number = await next_number(tenant_id=user["tenant_id"], name="order")
    order = Order(
        tenant_id=user["tenant_id"], number=number, created_by=user["id"],
        **payload.model_dump(),
    )
    await db.orders.insert_one(prepare_for_mongo(order.model_dump()))
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="order.create", entity_type="order", entity_id=order.id,
        summary=f"Order O-{number} created for {cust['name']}",
    )
    return serialize_doc(order.model_dump())


@router.get("/{order_id}")
async def get_order(order_id: str, user: dict = Depends(require_permission(Perm.ORDER_READ))) -> dict:
    doc = await db.orders.find_one({"id": order_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    items = await _order_items(user["tenant_id"], order_id)
    return {"order": serialize_doc(doc), "items": items, "totals": _totals(items)}


@router.patch("/{order_id}")
async def update_order(order_id: str, payload: OrderUpdateIn, user: dict = Depends(require_permission(Perm.ORDER_WRITE))) -> dict:
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    updates["updated_at"] = utc_now().isoformat()
    res = await db.orders.update_one({"id": order_id, "tenant_id": user["tenant_id"]}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="order.update", entity_type="order", entity_id=order_id,
        summary=f"Order updated", diff={"changes": updates},
    )
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return serialize_doc(doc)


@router.post("/{order_id}/status")
async def set_order_status(order_id: str, payload: OrderStatusIn, user: dict = Depends(require_permission(Perm.ORDER_WRITE))) -> dict:
    doc = await db.orders.find_one({"id": order_id, "tenant_id": user["tenant_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    if payload.status == doc["status"]:
        return serialize_doc(doc)
    await db.orders.update_one({"id": order_id}, {"$set": {"status": payload.status, "updated_at": utc_now().isoformat()}})
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="order.status_change", entity_type="order", entity_id=order_id,
        summary=f"Order O-{doc['number']} → {payload.status}",
        diff={"from": doc["status"], "to": payload.status},
    )
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return serialize_doc(doc)


# ---- Order Items ----

@router.post("/{order_id}/items", status_code=201)
async def add_item(order_id: str, payload: OrderItemIn, user: dict = Depends(require_permission(Perm.ORDER_WRITE))) -> dict:
    order = await db.orders.find_one({"id": order_id, "tenant_id": user["tenant_id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    position = await db.order_items.count_documents({"tenant_id": user["tenant_id"], "order_id": order_id})
    item = OrderItem(
        tenant_id=user["tenant_id"], order_id=order_id, position=position,
        **payload.model_dump(),
    )
    await db.order_items.insert_one(prepare_for_mongo(item.model_dump()))
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="order_item.add", entity_type="order", entity_id=order_id,
        summary=f"Added item to O-{order['number']}: {payload.description}",
        diff={"item_id": item.id, "unit_price_cents": payload.unit_price_cents, "quantity": payload.quantity},
    )
    return serialize_doc(item.model_dump())


@router.patch("/{order_id}/items/{item_id}")
async def update_item(order_id: str, item_id: str, payload: OrderItemUpdateIn, user: dict = Depends(require_permission(Perm.ORDER_WRITE))) -> dict:
    item = await db.order_items.find_one({"id": item_id, "order_id": order_id, "tenant_id": user["tenant_id"]})
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    updates["updated_at"] = utc_now().isoformat()
    await db.order_items.update_one({"id": item_id}, {"$set": updates})
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="order_item.update", entity_type="order", entity_id=order_id,
        summary=f"Order item updated", diff={"item_id": item_id, "changes": updates},
    )
    doc = await db.order_items.find_one({"id": item_id}, {"_id": 0})
    return serialize_doc(doc)


@router.delete("/{order_id}/items/{item_id}", status_code=204, response_class=Response)
async def delete_item(order_id: str, item_id: str, user: dict = Depends(require_permission(Perm.ORDER_WRITE))) -> Response:
    item = await db.order_items.find_one({"id": item_id, "order_id": order_id, "tenant_id": user["tenant_id"]})
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    await db.order_items.delete_one({"id": item_id})
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="order_item.delete", entity_type="order", entity_id=order_id,
        summary=f"Removed order item", diff={"item_id": item_id, "description": item.get("description")},
    )
    return Response(status_code=204)
