"""FastAPI dependencies: current user, current tenant, permission check.

Single source of truth for permission enforcement.
"""
from __future__ import annotations

from typing import Callable

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .core.db import db
from .core.permissions import Perm, permissions_for_role
from .core.security import decode_access_token
from .core.time_utils import serialize_doc

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    try:
        payload = decode_access_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    tenant_id = payload.get("tenant_id")
    if not user_id or not tenant_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = await db.users.find_one({"id": user_id, "tenant_id": tenant_id, "is_active": True})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")
    return serialize_doc(user)  # type: ignore[return-value]


async def get_current_tenant(user: dict = Depends(get_current_user)) -> dict:
    tenant = await db.tenants.find_one({"id": user["tenant_id"]})
    if not tenant:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tenant not found")
    return serialize_doc(tenant)  # type: ignore[return-value]


def require_permission(*required: str | Perm) -> Callable:
    required_values = [p.value if isinstance(p, Perm) else str(p) for p in required]

    async def _dep(user: dict = Depends(get_current_user)) -> dict:
        role = user.get("role", "staff")
        perms = set(permissions_for_role(role))
        missing = [p for p in required_values if p not in perms]
        if missing:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Missing permission: {missing[0]}")
        return user

    return _dep
