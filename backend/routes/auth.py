import os
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import Field

try:
    from ..core_runtime import auth_mode, encode_bearer_token, get_identity_context
    from ..models.access import RuntimeIdentityContext, role_permissions
    from ..models.base import StrictBaseModel
except ImportError:
    from core_runtime import auth_mode, encode_bearer_token, get_identity_context
    from models.access import RuntimeIdentityContext, role_permissions
    from models.base import StrictBaseModel


auth_router = APIRouter(prefix="/auth", tags=["Auth"])
users_router = APIRouter(prefix="/users", tags=["Users"])


class IdentityResponse(StrictBaseModel):
    tenant_id: str
    user_id: str
    role: str
    permissions: list[str] = Field(default_factory=list)
    email: str = ""
    auth_source: Literal["bearer", "preview"]
    impersonating: bool = False
    platform_admin_id: str = ""


class PermissionsResponse(StrictBaseModel):
    role: str
    permissions: list[str] = Field(default_factory=list)


class DevTokenRequest(StrictBaseModel):
    tenant_id: str = "preview-shop"
    user_id: str = "preview-user"
    role: str = "owner"
    email: str = ""
    expires_in_seconds: int = Field(default=86400, ge=60, le=60 * 60 * 24 * 30)


class DevTokenResponse(StrictBaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    identity: IdentityResponse


def _identity_response(context: RuntimeIdentityContext) -> IdentityResponse:
    return IdentityResponse(
        tenant_id=context.tenant_id,
        user_id=context.user_id,
        role=context.role,
        permissions=list(context.permissions),
        email=context.email,
        auth_source=context.auth_source,
        impersonating=context.impersonating,
        platform_admin_id=context.platform_admin_id,
    )


@auth_router.get("/me", response_model=IdentityResponse)
@users_router.get("/me", response_model=IdentityResponse)
async def current_identity(context: RuntimeIdentityContext = Depends(get_identity_context)) -> IdentityResponse:
    return _identity_response(context)


@auth_router.get("/permissions", response_model=PermissionsResponse)
@users_router.get("/me/permissions", response_model=PermissionsResponse)
async def current_permissions(context: RuntimeIdentityContext = Depends(get_identity_context)) -> PermissionsResponse:
    return PermissionsResponse(role=context.role, permissions=list(context.permissions))


@auth_router.post("/dev-token", response_model=DevTokenResponse, status_code=status.HTTP_201_CREATED)
async def create_dev_token(payload: DevTokenRequest) -> DevTokenResponse:
    dev_auth_enabled = os.getenv("SIGNGUYAI_ENABLE_DEV_AUTH", "").strip().lower() in {"1", "true", "yes", "on"}
    if auth_mode() == "enforced" and not dev_auth_enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Dev auth is disabled")

    permissions = role_permissions(payload.role)
    claims = {
        "sub": payload.user_id,
        "tenant_id": payload.tenant_id,
        "role": payload.role,
        "permissions": permissions,
    }
    if payload.email:
        claims["email"] = payload.email
    access_token = encode_bearer_token(claims, expires_in_seconds=payload.expires_in_seconds)
    identity = IdentityResponse(
        tenant_id=payload.tenant_id,
        user_id=payload.user_id,
        role=payload.role,
        permissions=permissions,
        email=payload.email,
        auth_source="bearer",
    )
    return DevTokenResponse(
        access_token=access_token,
        expires_in_seconds=payload.expires_in_seconds,
        identity=identity,
    )
