from __future__ import annotations

from typing import Literal, Optional

from pydantic import Field

from .base import BaseDoc

OrderStatus = Literal["draft", "confirmed", "in_production", "completed", "cancelled"]


class OrderItem(BaseDoc):
    tenant_id: str
    order_id: str
    description: str
    quantity: int = 1
    unit_price_cents: int = 0  # manual per-unit price
    position: int = 0

    @property
    def line_total_cents(self) -> int:
        return int(self.quantity) * int(self.unit_price_cents)


class Order(BaseDoc):
    tenant_id: str
    number: int  # sequential per tenant
    customer_id: str
    quote_id: Optional[str] = None
    job_name: str
    notes: Optional[str] = None
    status: OrderStatus = "draft"
    created_by: str
