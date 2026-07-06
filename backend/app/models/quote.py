from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import Field

from .base import BaseDoc

QuoteStatus = Literal["draft", "sent", "approved", "declined", "converted"]


class Quote(BaseDoc):
    tenant_id: str
    number: int  # sequential per tenant
    customer_id: str
    job_name: str
    notes: Optional[str] = None
    total_cents: int = 0  # manually typed money in cents
    status: QuoteStatus = "draft"
    converted_order_id: Optional[str] = None
    converted_at: Optional[datetime] = None
    created_by: str  # user id
