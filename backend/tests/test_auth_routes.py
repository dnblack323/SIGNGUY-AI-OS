import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from models.access import Permission
from server import app


class AuthRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_users_me_uses_preview_identity_without_raw_claims(self):
        with patch.dict(os.environ, {"SIGNGUYAI_AUTH_MODE": "preview"}, clear=False):
            response = self.client.get(
                "/api/users/me",
                headers={"X-Tenant-Id": "shop-a", "X-Actor-Id": "user-a"},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["tenant_id"], "shop-a")
        self.assertEqual(body["user_id"], "user-a")
        self.assertEqual(body["role"], "owner")
        self.assertEqual(body["auth_source"], "preview")
        self.assertIn(Permission.SETTINGS_MANAGE.value, body["permissions"])
        self.assertNotIn("claims", body)

    def test_dev_token_can_bootstrap_bearer_current_user(self):
        with patch.dict(
            os.environ,
            {"JWT_SECRET_KEY": "test-secret", "SIGNGUYAI_AUTH_MODE": "preview"},
            clear=False,
        ):
            token_response = self.client.post(
                "/api/auth/dev-token",
                json={
                    "tenant_id": "shop-b",
                    "user_id": "user-b",
                    "role": "admin",
                    "email": "admin@example.com",
                    "expires_in_seconds": 3600,
                },
            )
            self.assertEqual(token_response.status_code, 201)
            token = token_response.json()["access_token"]

            current_response = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

        self.assertEqual(current_response.status_code, 200)
        body = current_response.json()
        self.assertEqual(body["tenant_id"], "shop-b")
        self.assertEqual(body["user_id"], "user-b")
        self.assertEqual(body["role"], "admin")
        self.assertEqual(body["email"], "admin@example.com")
        self.assertEqual(body["auth_source"], "bearer")
        self.assertIn(Permission.USERS_VIEW.value, body["permissions"])
        self.assertNotIn(Permission.USERS_MANAGE.value, body["permissions"])

    def test_permissions_endpoint_returns_backend_owned_permissions(self):
        with patch.dict(os.environ, {"SIGNGUYAI_AUTH_MODE": "preview"}, clear=False):
            response = self.client.get("/api/users/me/permissions")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["role"], "owner")
        self.assertIn(Permission.PLATFORM_ADMIN_ACCESS.value, body["permissions"])

    def test_enforced_mode_requires_authentication_for_current_user(self):
        with patch.dict(os.environ, {"SIGNGUYAI_AUTH_MODE": "enforced"}, clear=False):
            response = self.client.get("/api/users/me")

        self.assertEqual(response.status_code, 401)

    def test_dev_token_is_disabled_in_enforced_mode_by_default(self):
        with patch.dict(os.environ, {"SIGNGUYAI_AUTH_MODE": "enforced"}, clear=False):
            response = self.client.post("/api/auth/dev-token", json={})

        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
