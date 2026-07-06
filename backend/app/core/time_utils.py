from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def to_iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def serialize_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Prepare a Mongo document for JSON output: drop _id, convert datetimes."""
    if doc is None:
        return None
    out: dict[str, Any] = {}
    for k, v in doc.items():
        if k == "_id":
            continue
        if isinstance(v, datetime):
            out[k] = to_iso(v)
        elif isinstance(v, dict):
            out[k] = serialize_doc(v)
        elif isinstance(v, list):
            out[k] = [serialize_doc(i) if isinstance(i, dict) else (to_iso(i) if isinstance(i, datetime) else i) for i in v]
        else:
            out[k] = v
    return out


def prepare_for_mongo(doc: dict[str, Any]) -> dict[str, Any]:
    """Convert Pydantic-serialized dict to Mongo-friendly (datetimes -> iso strings)."""
    out: dict[str, Any] = {}
    for k, v in doc.items():
        if isinstance(v, datetime):
            out[k] = to_iso(v)
        elif isinstance(v, dict):
            out[k] = prepare_for_mongo(v)
        elif isinstance(v, list):
            out[k] = [prepare_for_mongo(i) if isinstance(i, dict) else (to_iso(i) if isinstance(i, datetime) else i) for i in v]
        else:
            out[k] = v
    return out
