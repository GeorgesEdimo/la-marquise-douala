"""Configuration centrale — chargée depuis les variables d'environnement / .env."""

import logging
import secrets
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

# Clé de dev connue : utilisée uniquement si SECRET_KEY n'est pas défini dans .env.
_DEV_SECRET_KEY = "dev-secret-a-remplacer-absolument-en-production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # ── Application ──
    APP_NAME: str = "La Marquise API"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # ── Base de données ──
    # SQLite par défaut : le backend démarre sans installer PostgreSQL.
    # En production, définir DATABASE_URL vers PostgreSQL 16.
    DATABASE_URL: str = "sqlite:///./lamarquise.db"

    # ── Sécurité ──
    # En production, définir une SECRET_KEY forte dans .env :
    #   SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(64))")
    # Si la clé de dev est détectée en mode non-debug, l'app refuse de démarrer.
    SECRET_KEY: str = _DEV_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720  # 12 h

    # ── Protection brute-force ──
    # Nombre de tentatives de connexion ratées avant blocage temporaire.
    LOGIN_MAX_ATTEMPTS: int = 5
    # Durée du blocage en secondes après dépassement.
    LOGIN_LOCKOUT_SECONDS: int = 300

    # ── Administrateur initial (script de seed) ──
    FIRST_ADMIN_EMAIL: str = "admin@lamarquise-douala.com"
    FIRST_ADMIN_PASSWORD: str = "LaMarquise2026!"
    FIRST_ADMIN_NAME: str = "Administrateur"

    # ── CORS ──
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # ── WhatsApp ──
    WHATSAPP_STAFF_NUMBER: str = "237698434343"
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_API_VERSION: str = "v21.0"

    # ── Restaurant ──
    RESTAURANT_NAME: str = "La Marquise"
    CURRENCY: str = "FCFA"

    # ── Site public (liens des QR codes / reçus) ──
    SITE_URL: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        """Origines CORS. En mode DEBUG, autorise tout localhost:*."""
        if self.DEBUG:
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def whatsapp_cloud_api_enabled(self) -> bool:
        """La Cloud API Meta n'est utilisée que si le jeton ET l'ID numéro sont fournis."""
        return bool(self.WHATSAPP_TOKEN and self.WHATSAPP_PHONE_NUMBER_ID)

    @property
    def uses_dev_secret_key(self) -> bool:
        return self.SECRET_KEY == _DEV_SECRET_KEY


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    if settings.uses_dev_secret_key:
        if not settings.DEBUG:
            raise RuntimeError(
                "SECRET_KEY de développement détectée en mode production (DEBUG=False). "
                "Générez une clé forte : python -c \"import secrets; print(secrets.token_urlsafe(64))\" "
                "et placez-la dans .env (SECRET_KEY=...)."
            )
        logger.warning(
            "SECRET_KEY de développement détectée. "
            "Définissez une clé forte dans .env avant la mise en production."
        )

    return settings


settings = get_settings()
