from __future__ import annotations

from typing import Any, Optional

from pydantic import Field

from .base import BaseDoc


class AuditEvent(BaseDoc):
    tenant_id: str
    actor_user_id: str  # REQUIRED
    actor_email: str    # denormalized for display
    action: str  # e.g. "customer.create", "quote.status_change", "invoice.payment_added"
    entity_type: str
    entity_id: str
    summary: str  # human-readable one line
    diff: Optional[dict[str, Any]] = None  # optional field diff
