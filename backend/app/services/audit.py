"""Shared audit event helper.

HARD RULE: `actor_user_id` and `actor_email` are REQUIRED (non-optional).
The legacy app had actor fields declared but never populated — do not repeat that.

Every write route MUST call `record_audit(...)` in the same operation as the write.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from ..core.db import db
from ..core.time_utils import prepare_for_mongo
from ..models.audit import AuditEvent

logger = logging.getLogger(__name__)


async def record_audit(
    *,
    tenant_id: str,
    actor_user_id: str,
    actor_email: str,
    action: str,
    entity_type: str,
    entity_id: str,
    summary: str,
    diff: Optional[dict[str, Any]] = None,
) -> AuditEvent:
    if not actor_user_id or not actor_email:
        raise ValueError("AuditEvent requires actor_user_id and actor_email")
    evt = AuditEvent(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        actor_email=actor_email,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        summary=summary,
        diff=diff,
    )
    await db.audit_events.insert_one(prepare_for_mongo(evt.model_dump()))
    return evt


async def list_audit(
    *,
    tenant_id: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    limit: int = 100,
) -> list[dict]:
    q: dict[str, Any] = {"tenant_id": tenant_id}
    if entity_type:
        q["entity_type"] = entity_type
    if entity_id:
        q["entity_id"] = entity_id
    cursor = db.audit_events.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    return [doc async for doc in cursor]
