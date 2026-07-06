"""Atomic per-tenant sequential number generator.

Proven in Phase 0 POC to be race-safe under concurrent writers.
"""
from __future__ import annotations

from pymongo import ReturnDocument

from ..core.db import db


async def next_number(*, tenant_id: str, name: str) -> int:
    """Atomically increment and return the next sequence value for (tenant_id, name)."""
    doc = await db.counters.find_one_and_update(
        {"tenant_id": tenant_id, "name": name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(doc["value"])
