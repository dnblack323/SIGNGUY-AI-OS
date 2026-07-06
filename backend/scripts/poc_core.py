"""
Phase 0 POC — combined test for the two integrations most likely to fail:

1) ATOMIC per-tenant sequence generator (Mongo find_one_and_update $inc + upsert)
   - Concurrent writers must never produce duplicate numbers.
   - Numbers must be per (tenant_id, sequence_name).

2) EMERGENT OBJECT STORAGE upload + download
   - Init storage key once.
   - Upload bytes to a tenant-scoped path.
   - Download bytes and verify integrity.
   - Verify content-type round trip.

Run:
    cd /app/backend && python scripts/poc_core.py
"""
from __future__ import annotations

import asyncio
import hashlib
import os
import sys
import uuid
from pathlib import Path

import requests
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "signguy-ai")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


# ---------------------------------------------------------------------------
# 1) ATOMIC SEQUENCE GENERATOR POC
# ---------------------------------------------------------------------------

async def next_sequence(tenant_id: str, seq_name: str) -> int:
    """
    Atomically increment a per-tenant sequence counter and return the new value.
    Uses find_one_and_update with $inc and upsert.
    """
    doc = await db.counters.find_one_and_update(
        {"tenant_id": tenant_id, "name": seq_name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(doc["value"])


async def poc_sequence() -> bool:
    print("\n=== POC 1: Atomic sequence generator ===")
    tenant_a = f"poc-tenant-a-{uuid.uuid4().hex[:6]}"
    tenant_b = f"poc-tenant-b-{uuid.uuid4().hex[:6]}"

    # Clear any prior state
    await db.counters.delete_many({"tenant_id": {"$in": [tenant_a, tenant_b]}})

    N = 200

    async def draw(tid: str, name: str):
        return await next_sequence(tid, name)

    tasks_a = [draw(tenant_a, "quote") for _ in range(N)]
    tasks_b = [draw(tenant_b, "quote") for _ in range(N)]
    tasks_a_order = [draw(tenant_a, "order") for _ in range(N)]

    results_a, results_b, results_a_order = await asyncio.gather(
        asyncio.gather(*tasks_a),
        asyncio.gather(*tasks_b),
        asyncio.gather(*tasks_a_order),
    )

    ok = True

    def assert_unique_and_range(label, results, expected_max):
        nonlocal ok
        s = set(results)
        if len(s) != len(results):
            print(f"  FAIL {label}: duplicates! len={len(results)} unique={len(s)}")
            ok = False
        elif min(results) != 1 or max(results) != expected_max:
            print(f"  FAIL {label}: range mismatch min={min(results)} max={max(results)} expected 1..{expected_max}")
            ok = False
        else:
            print(f"  OK   {label}: {len(results)} unique, 1..{expected_max}")

    assert_unique_and_range(f"tenant_a/quote", results_a, N)
    assert_unique_and_range(f"tenant_b/quote", results_b, N)
    assert_unique_and_range(f"tenant_a/order", results_a_order, N)

    # Tenants must be isolated: tenant_a quote counter shouldn't have leaked to tenant_b
    doc_a = await db.counters.find_one({"tenant_id": tenant_a, "name": "quote"})
    doc_b = await db.counters.find_one({"tenant_id": tenant_b, "name": "quote"})
    if doc_a["value"] == N and doc_b["value"] == N:
        print("  OK   tenant isolation on counter documents")
    else:
        print(f"  FAIL tenant isolation: a={doc_a['value']} b={doc_b['value']}")
        ok = False

    # Cleanup
    await db.counters.delete_many({"tenant_id": {"$in": [tenant_a, tenant_b]}})
    return ok


# ---------------------------------------------------------------------------
# 2) OBJECT STORAGE POC
# ---------------------------------------------------------------------------

_storage_key = None


def init_storage() -> str:
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_LLM_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY missing from env")
    resp = requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": EMERGENT_LLM_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def poc_storage() -> bool:
    print("\n=== POC 2: Emergent Object Storage ===")
    tenant_id = f"poc-tenant-{uuid.uuid4().hex[:6]}"
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/tenants/{tenant_id}/files/{file_id}.txt"

    payload = f"SignGuy AI POC upload {uuid.uuid4()}".encode("utf-8")
    payload_hash = hashlib.sha256(payload).hexdigest()

    try:
        init_storage()
        print("  OK   storage init")
    except Exception as e:
        print(f"  FAIL storage init: {e}")
        return False

    try:
        result = put_object(path, payload, "text/plain")
        print(f"  OK   upload -> path={result.get('path')} size={result.get('size')}")
    except Exception as e:
        print(f"  FAIL upload: {e}")
        return False

    try:
        data, content_type = get_object(result["path"])
        redownload_hash = hashlib.sha256(data).hexdigest()
        if redownload_hash != payload_hash:
            print(f"  FAIL download integrity mismatch")
            return False
        if content_type not in ("text/plain", "text/plain; charset=utf-8"):
            print(f"  WARN unexpected content-type: {content_type}")
        print("  OK   download + integrity + content-type")
    except Exception as e:
        print(f"  FAIL download: {e}")
        return False

    # Verify a missing object 404s (tenant isolation via unknown path)
    bogus_path = f"{APP_NAME}/tenants/other-tenant/files/{uuid.uuid4()}.txt"
    try:
        get_object(bogus_path)
        print("  FAIL bogus path returned content (should 404)")
        return False
    except requests.HTTPError as e:
        if e.response.status_code == 404:
            print("  OK   missing path returns 404")
        else:
            print(f"  WARN missing path returned status {e.response.status_code}")

    return True


# ---------------------------------------------------------------------------

async def main():
    seq_ok = await poc_sequence()
    stor_ok = poc_storage()
    print("\n=== SUMMARY ===")
    print(f"  Sequence POC: {'PASS' if seq_ok else 'FAIL'}")
    print(f"  Storage  POC: {'PASS' if stor_ok else 'FAIL'}")
    return 0 if (seq_ok and stor_ok) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
