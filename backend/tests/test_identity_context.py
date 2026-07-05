import asyncio
import base64
import hashlib
import hmac
import json
import os
import time
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from core_runtime import get_identity_context, get_tenant_id, has_permission
from models.access import Permission, role_has_permission


def encode_token(claims: dict, secret: str = "test-secret") -> str:
    header = {"alg": "HS256", "typ": "JWT"}

    def part(payload: dict) -> str:
        raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    header_value = part(header)
    payload_value = part(claims)
    signature = hmac.new(secret.encode(), f"{header_value}.{payload_value}".encode(), hashlib.sha256).digest()
    signature_value = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()
    return f"{header_value}.{payload_value}.{signature_value}"


class IdentityContextTests(unittest.TestCase):
    def test_preview_mode_uses_explicit_preview_tenant_header(self):
        with patch.dict(os.environ, {"SIGNGUYAI_AUTH_MODE": "preview"}, clear=False):
            context = asyncio.run(get_identity_context(authorization=None, x_tenant_id="shop-a", x_actor_id="user-a"))

        self.assertEqual(context.tenant_id, "shop-a")
        self.assertEqual(context.user_id, "user-a")
        self.assertEqual(context.auth_source, "preview")
        self.assertTrue(has_permission(context.model_dump(), Permission.SETTINGS_MANAGE.value))

    def test_enforced_mode_rejects_missing_authentication(self):
        with patch.dict(os.environ, {"SIGNGUYAI_AUTH_MODE": "enforced"}, clear=False):
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(get_identity_context(authorization=None, x_tenant_id="shop-a"))

        self.assertEqual(raised.exception.status_code, 401)

    def test_bearer_token_resolves_tenant_and_role_claims(self):
        token = encode_token({
            "sub": "user-1",
            "tenant_id": "shop-a",
            "role": "admin",
            "permissions": [Permission.CUSTOMERS_VIEW.value],
            "email": "admin@example.com",
            "exp": int(time.time()) + 60,
        })
        with patch.dict(os.environ, {"JWT_SECRET_KEY": "test-secret", "SIGNGUYAI_AUTH_MODE": "enforced"}, clear=False):
            context = asyncio.run(get_identity_context(authorization=f"Bearer {token}", x_tenant_id="ignored"))
            tenant_id = asyncio.run(get_tenant_id(authorization=f"Bearer {token}", x_tenant_id="ignored"))

        self.assertEqual(context.tenant_id, "shop-a")
        self.assertEqual(context.user_id, "user-1")
        self.assertEqual(context.role, "admin")
        self.assertEqual(context.email, "admin@example.com")
        self.assertEqual(context.auth_source, "bearer")
        self.assertEqual(tenant_id, "shop-a")

    def test_invalid_token_signature_is_rejected(self):
        token = encode_token({"sub": "user-1", "tenant_id": "shop-a", "role": "owner"}, secret="wrong")
        with patch.dict(os.environ, {"JWT_SECRET_KEY": "test-secret", "SIGNGUYAI_AUTH_MODE": "enforced"}, clear=False):
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(get_identity_context(authorization=f"Bearer {token}"))

        self.assertEqual(raised.exception.status_code, 401)

    def test_permission_bypass_roles_are_consistent(self):
        for role in ["platform_creator", "platform_admin", "owner"]:
            self.assertTrue(role_has_permission(role, "not:a:real:permission"))
            self.assertTrue(has_permission({"role": role, "permissions": []}, "not:a:real:permission"))

        self.assertFalse(role_has_permission("staff", Permission.SETTINGS_MANAGE.value))
        self.assertFalse(has_permission({"role": "staff", "permissions": []}, Permission.SETTINGS_MANAGE.value))


if __name__ == "__main__":
    unittest.main()
