from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import Field

from .base import BaseDoc

InvoiceStatus = Literal["draft", "sent", "viewed", "partially_paid", "paid", "overdue", "void"]
PaymentMethod = Literal["cash", "check", "card", "bank_transfer", "other"]


class InvoiceLineItem(BaseDoc):
    tenant_id: str
    invoice_id: str
    description: str
    quantity: int = 1
    unit_price_cents: int = 0
    position: int = 0


class Invoice(BaseDoc):
    tenant_id: str
    number: int
    order_id: str
    customer_id: str
    title: str
    description: Optional[str] = None
    total_cents: int = 0  # manual total; when line_items exist, may be sum of line items
    due_date: Optional[str] = None  # ISO date string
    notes: Optional[str] = None
    status: InvoiceStatus = "draft"
    sent_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    created_by: str


class Payment(BaseDoc):
    tenant_id: str
    invoice_id: str
    amount_cents: int
    method: PaymentMethod = "other"
    paid_on: str  # ISO date
    reference: Optional[str] = None
    notes: Optional[str] = None
    idempotency_key: Optional[str] = None
    created_by: str
