from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query

from ..core.permissions import Perm
from ..deps import require_permission
from ..services.audit import list_audit

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("")
async def list_events(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    user: dict = Depends(require_permission(Perm.AUDIT_READ)),
) -> dict:
    items = await list_audit(
        tenant_id=user["tenant_id"],
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
    )
    return {"items": items, "total": len(items)}
