"""Env-backed application settings."""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")


class Settings:
    def __init__(self) -> None:
        self.mongo_url: str = os.environ["MONGO_URL"]
        self.db_name: str = os.environ["DB_NAME"]
        self.cors_origins: list[str] = os.environ.get("CORS_ORIGINS", "*").split(",")

        self.jwt_secret: str = os.environ.get("JWT_SECRET", "dev-secret-do-not-use-in-prod")
        self.jwt_algorithm: str = "HS256"
        self.jwt_access_ttl_minutes: int = int(os.environ.get("JWT_ACCESS_TTL_MINUTES", 60 * 24))  # 24h dev
        self.password_reset_ttl_minutes: int = 60

        self.app_name: str = os.environ.get("APP_NAME", "signguy-ai")
        self.emergent_llm_key: str | None = os.environ.get("EMERGENT_LLM_KEY") or None
        self.storage_url: str = "https://integrations.emergentagent.com/objstore/api/v1/storage"

        self.sendgrid_api_key: str | None = os.environ.get("SENDGRID_API_KEY") or None
        self.sendgrid_from_email: str | None = os.environ.get("SENDGRID_FROM_EMAIL") or None
        self.sendgrid_from_name: str = os.environ.get("SENDGRID_FROM_NAME", "SignGuy AI")

        # Dev-only auth bypass: when true, /api/auth/dev-login is enabled.
        # Frontend uses it to auto-provision a Dev Shop so the user doesn't have to log in.
        # MUST be set to false before production/deploy.
        self.auth_dev_bypass: bool = os.environ.get("AUTH_DEV_BYPASS", "false").lower() == "true"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
