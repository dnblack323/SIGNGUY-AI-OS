from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..core.db import db
from ..core.permissions import Perm
from ..core.time_utils import prepare_for_mongo, serialize_doc, utc_now
from ..deps import require_permission
from ..models.quote import Quote
from ..models.order import Order
from ..services.audit import record_audit
from ..services.sequence import next_number

router = APIRouter(prefix="/quotes", tags=["quotes"])


class QuoteIn(BaseModel):
    customer_id: str
    job_name: str = Field(min_length=1, max_length=200)
    notes: Optional[str] = None
    total_cents: int = Field(0, ge=0)


class QuoteUpdateIn(BaseModel):
    job_name: Optional[str] = None
    notes: Optional[str] = None
    total_cents: Optional[int] = Field(None, ge=0)


class QuoteStatusIn(BaseModel):
    status: Literal["draft", "sent", "approved", "declined"]


@router.get("")
async def list_quotes(
    status: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    skip: int = Query(0, ge=0),
    user: dict = Depends(require_permission(Perm.QUOTE_READ)),
) -> dict:
    q: dict = {"tenant_id": user["tenant_id"]}
    if status:
        q["status"] = status
    if customer_id:
        q["customer_id"] = customer_id
    total = await db.quotes.count_documents(q)
    cursor = db.quotes.find(q, {"_id": 0}).sort("number", -1).skip(skip).limit(limit)
    return {"items": [serialize_doc(d) async for d in cursor], "total": total, "limit": limit, "skip": skip}


@router.post("", status_code=201)
async def create_quote(payload: QuoteIn, user: dict = Depends(require_permission(Perm.QUOTE_WRITE))) -> dict:
    cust = await db.customers.find_one({"id": payload.customer_id, "tenant_id": user["tenant_id"]})
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    number = await next_number(tenant_id=user["tenant_id"], name="quote")
    q = Quote(
        tenant_id=user["tenant_id"], number=number, created_by=user["id"],
        **payload.model_dump(),
    )
    await db.quotes.insert_one(prepare_for_mongo(q.model_dump()))
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="quote.create", entity_type="quote", entity_id=q.id,
        summary=f"Quote Q-{number} created for {cust['name']}",
    )
    return serialize_doc(q.model_dump())


@router.get("/{quote_id}")
async def get_quote(quote_id: str, user: dict = Depends(require_permission(Perm.QUOTE_READ))) -> dict:
    doc = await db.quotes.find_one({"id": quote_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Quote not found")
    return serialize_doc(doc)


@router.patch("/{quote_id}")
async def update_quote(quote_id: str, payload: QuoteUpdateIn, user: dict = Depends(require_permission(Perm.QUOTE_WRITE))) -> dict:
    doc = await db.quotes.find_one({"id": quote_id, "tenant_id": user["tenant_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Quote not found")
    if doc["status"] == "converted":
        raise HTTPException(status_code=400, detail="Cannot edit a converted quote")
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    updates["updated_at"] = utc_now().isoformat()
    await db.quotes.update_one({"id": quote_id}, {"$set": updates})
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="quote.update", entity_type="quote", entity_id=quote_id,
        summary=f"Quote Q-{doc['number']} updated", diff={"changes": updates},
    )
    doc = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    return serialize_doc(doc)


@router.post("/{quote_id}/status")
async def set_status(quote_id: str, payload: QuoteStatusIn, user: dict = Depends(require_permission(Perm.QUOTE_WRITE))) -> dict:
    doc = await db.quotes.find_one({"id": quote_id, "tenant_id": user["tenant_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Quote not found")
    if doc["status"] == "converted":
        raise HTTPException(status_code=400, detail="Quote already converted")
    if payload.status == doc["status"]:
        return serialize_doc(doc)
    await db.quotes.update_one(
        {"id": quote_id}, {"$set": {"status": payload.status, "updated_at": utc_now().isoformat()}}
    )
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="quote.status_change", entity_type="quote", entity_id=quote_id,
        summary=f"Quote Q-{doc['number']} → {payload.status}",
        diff={"from": doc["status"], "to": payload.status},
    )
    doc = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    return serialize_doc(doc)


@router.post("/{quote_id}/convert-to-order")
async def convert_to_order(quote_id: str, user: dict = Depends(require_permission(Perm.QUOTE_CONVERT))) -> dict:
    """Idempotent: a quote can only become one Order. Repeated calls return the same Order."""
    doc = await db.quotes.find_one({"id": quote_id, "tenant_id": user["tenant_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Quote not found")
    if doc.get("converted_order_id"):
        existing = await db.orders.find_one({"id": doc["converted_order_id"]}, {"_id": 0})
        return {"order": serialize_doc(existing), "already_converted": True}

    # Atomically claim the quote so a concurrent second click can't create a duplicate order.
    now_iso = utc_now().isoformat()
    claim = await db.quotes.find_one_and_update(
        {"id": quote_id, "tenant_id": user["tenant_id"], "converted_order_id": None},
        {"$set": {"status": "converted", "converted_at": now_iso, "updated_at": now_iso}},
    )
    if not claim:
        # Another writer beat us. Return the winning order.
        doc2 = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
        if doc2 and doc2.get("converted_order_id"):
            existing = await db.orders.find_one({"id": doc2["converted_order_id"]}, {"_id": 0})
            return {"order": serialize_doc(existing), "already_converted": True}
        raise HTTPException(status_code=409, detail="Quote could not be converted")

    number = await next_number(tenant_id=user["tenant_id"], name="order")
    order = Order(
        tenant_id=user["tenant_id"], number=number,
        customer_id=doc["customer_id"], quote_id=quote_id,
        job_name=doc["job_name"], notes=doc.get("notes"),
        created_by=user["id"], status="draft",
    )
    await db.orders.insert_one(prepare_for_mongo(order.model_dump()))
    await db.quotes.update_one({"id": quote_id}, {"$set": {"converted_order_id": order.id}})

    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="quote.convert", entity_type="quote", entity_id=quote_id,
        summary=f"Quote Q-{doc['number']} converted to Order O-{number}",
        diff={"order_id": order.id, "order_number": number},
    )
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="order.create_from_quote", entity_type="order", entity_id=order.id,
        summary=f"Order O-{number} created from Quote Q-{doc['number']}",
    )
    return {"order": serialize_doc(order.model_dump()), "already_converted": False}
