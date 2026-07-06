from __future__ import annotations

from typing import Literal, Optional

from pydantic import Field

from .base import BaseDoc

ProductionStatus = Literal["not_started", "in_progress", "on_hold", "completed"]


class WorkOrderItemSnapshot(BaseDoc):
    tenant_id: str
    order_item_id: str
    description: str
    quantity: int
    unit_price_cents: int


class WorkOrder(BaseDoc):
    tenant_id: str
    number: int
    order_id: str
    customer_id: str
    production_status: ProductionStatus = "not_started"
    assigned_to: Optional[str] = None  # user_id
    production_instructions: Optional[str] = None
    internal_notes: Optional[str] = None
    items_snapshot: list[dict] = Field(default_factory=list)  # denormalized snapshot at creation
    created_by: str
