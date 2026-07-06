from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from ..core.db import db
from ..core.permissions import Perm
from ..core.time_utils import prepare_for_mongo, serialize_doc, utc_now
from ..deps import require_permission
from ..models.invoice import Invoice, Payment
from ..services.audit import record_audit
from ..services.sequence import next_number

router = APIRouter(prefix="/invoices", tags=["invoices"])


class InvoiceCreateIn(BaseModel):
    order_id: str
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    total_cents: int = Field(0, ge=0)
    due_date: Optional[str] = None
    notes: Optional[str] = None


class InvoiceUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    total_cents: Optional[int] = Field(None, ge=0)
    due_date: Optional[str] = None
    notes: Optional[str] = None


class InvoiceStatusIn(BaseModel):
    status: Literal["draft", "sent", "viewed", "partially_paid", "paid", "overdue", "void"]


class PaymentIn(BaseModel):
    amount_cents: int = Field(gt=0)
    method: Literal["cash", "check", "card", "bank_transfer", "other"] = "other"
    paid_on: str  # ISO date
    reference: Optional[str] = None
    notes: Optional[str] = None


async def _payments_sum(tenant_id: str, invoice_id: str) -> int:
    cursor = db.payments.aggregate([
        {"$match": {"tenant_id": tenant_id, "invoice_id": invoice_id}},
        {"$group": {"_id": None, "s": {"$sum": "$amount_cents"}}}
    ])
    async for row in cursor:
        return int(row["s"] or 0)
    return 0


def _derive_status_after_payment(current: str, total: int, paid: int) -> str:
    if current == "void":
        return "void"
    if paid <= 0:
        return current if current in ("draft", "sent", "viewed", "overdue") else "sent"
    if paid >= total and total > 0:
        return "paid"
    return "partially_paid"


@router.get("")
async def list_invoices(
    status: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200), skip: int = Query(0, ge=0),
    user: dict = Depends(require_permission(Perm.INVOICE_READ)),
) -> dict:
    q: dict = {"tenant_id": user["tenant_id"]}
    if status:
        q["status"] = status
    if customer_id:
        q["customer_id"] = customer_id
    total = await db.invoices.count_documents(q)
    cursor = db.invoices.find(q, {"_id": 0}).sort("number", -1).skip(skip).limit(limit)
    items = []
    async for d in cursor:
        paid = await _payments_sum(user["tenant_id"], d["id"])
        row = serialize_doc(d)
        row["paid_cents"] = paid
        row["balance_due_cents"] = max(int(d.get("total_cents", 0)) - paid, 0)
        items.append(row)
    return {"items": items, "total": total, "limit": limit, "skip": skip}


@router.post("", status_code=201)
async def create_invoice(payload: InvoiceCreateIn, user: dict = Depends(require_permission(Perm.INVOICE_WRITE))) -> dict:
    order = await db.orders.find_one({"id": payload.order_id, "tenant_id": user["tenant_id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Idempotency: one invoice per order (unique index on tenant_id+order_id).
    existing = await db.invoices.find_one({"tenant_id": user["tenant_id"], "order_id": order["id"]}, {"_id": 0})
    if existing:
        return {"invoice": serialize_doc(existing), "already_exists": True}
    number = await next_number(tenant_id=user["tenant_id"], name="invoice")
    inv = Invoice(
        tenant_id=user["tenant_id"], number=number,
        order_id=order["id"], customer_id=order["customer_id"],
        title=payload.title, description=payload.description,
        total_cents=payload.total_cents, due_date=payload.due_date, notes=payload.notes,
        created_by=user["id"],
    )
    try:
        await db.invoices.insert_one(prepare_for_mongo(inv.model_dump()))
    except DuplicateKeyError:
        existing = await db.invoices.find_one({"tenant_id": user["tenant_id"], "order_id": order["id"]}, {"_id": 0})
        return {"invoice": serialize_doc(existing), "already_exists": True}

    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="invoice.create", entity_type="invoice", entity_id=inv.id,
        summary=f"Invoice I-{number} created from Order O-{order['number']}",
        diff={"total_cents": payload.total_cents},
    )
    return {"invoice": serialize_doc(inv.model_dump()), "already_exists": False}


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: str, user: dict = Depends(require_permission(Perm.INVOICE_READ))) -> dict:
    doc = await db.invoices.find_one({"id": invoice_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    paid = await _payments_sum(user["tenant_id"], invoice_id)
    payments = [serialize_doc(p) async for p in db.payments.find(
        {"tenant_id": user["tenant_id"], "invoice_id": invoice_id}, {"_id": 0}
    ).sort("paid_on", -1)]
    doc_out = serialize_doc(doc)
    doc_out["paid_cents"] = paid
    doc_out["balance_due_cents"] = max(int(doc.get("total_cents", 0)) - paid, 0)
    return {"invoice": doc_out, "payments": payments}


@router.patch("/{invoice_id}")
async def update_invoice(invoice_id: str, payload: InvoiceUpdateIn, user: dict = Depends(require_permission(Perm.INVOICE_WRITE))) -> dict:
    doc = await db.invoices.find_one({"id": invoice_id, "tenant_id": user["tenant_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if doc["status"] in ("paid", "void"):
        raise HTTPException(status_code=400, detail=f"Cannot edit a {doc['status']} invoice")
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    updates["updated_at"] = utc_now().isoformat()
    await db.invoices.update_one({"id": invoice_id}, {"$set": updates})
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="invoice.update", entity_type="invoice", entity_id=invoice_id,
        summary=f"Invoice I-{doc['number']} updated", diff={"changes": updates},
    )
    doc = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    return serialize_doc(doc)


@router.post("/{invoice_id}/status")
async def set_invoice_status(invoice_id: str, payload: InvoiceStatusIn, user: dict = Depends(require_permission(Perm.INVOICE_WRITE))) -> dict:
    doc = await db.invoices.find_one({"id": invoice_id, "tenant_id": user["tenant_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if payload.status == doc["status"]:
        return serialize_doc(doc)
    extras: dict = {"status": payload.status, "updated_at": utc_now().isoformat()}
    if payload.status == "sent" and not doc.get("sent_at"):
        extras["sent_at"] = utc_now().isoformat()
    if payload.status == "viewed" and not doc.get("viewed_at"):
        extras["viewed_at"] = utc_now().isoformat()
    await db.invoices.update_one({"id": invoice_id}, {"$set": extras})
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="invoice.status_change", entity_type="invoice", entity_id=invoice_id,
        summary=f"Invoice I-{doc['number']} → {payload.status}",
        diff={"from": doc["status"], "to": payload.status},
    )
    doc = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    return serialize_doc(doc)


@router.post("/{invoice_id}/payments", status_code=201)
async def add_payment(
    invoice_id: str,
    payload: PaymentIn,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    user: dict = Depends(require_permission(Perm.PAYMENT_WRITE)),
) -> dict:
    inv = await db.invoices.find_one({"id": invoice_id, "tenant_id": user["tenant_id"]})
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv["status"] == "void":
        raise HTTPException(status_code=400, detail="Invoice is void")
    if idempotency_key:
        prev = await db.payments.find_one(
            {"tenant_id": user["tenant_id"], "invoice_id": invoice_id, "idempotency_key": idempotency_key},
            {"_id": 0},
        )
        if prev:
            return {"payment": serialize_doc(prev), "already_exists": True}
    pay = Payment(
        tenant_id=user["tenant_id"], invoice_id=invoice_id,
        amount_cents=payload.amount_cents, method=payload.method, paid_on=payload.paid_on,
        reference=payload.reference, notes=payload.notes,
        idempotency_key=idempotency_key, created_by=user["id"],
    )
    await db.payments.insert_one(prepare_for_mongo(pay.model_dump()))
    paid = await _payments_sum(user["tenant_id"], invoice_id)
    new_status = _derive_status_after_payment(inv["status"], int(inv.get("total_cents", 0)), paid)
    updates = {"updated_at": utc_now().isoformat()}
    if new_status != inv["status"]:
        updates["status"] = new_status
    await db.invoices.update_one({"id": invoice_id}, {"$set": updates})
    await record_audit(
        tenant_id=user["tenant_id"], actor_user_id=user["id"], actor_email=user["email"],
        action="invoice.payment_added", entity_type="invoice", entity_id=invoice_id,
        summary=f"Payment of ${payload.amount_cents/100:,.2f} added to I-{inv['number']}",
        diff={"payment_id": pay.id, "amount_cents": payload.amount_cents, "method": payload.method, "new_status": new_status},
    )
    return {"payment": serialize_doc(pay.model_dump()), "already_exists": False, "invoice_status": new_status}
