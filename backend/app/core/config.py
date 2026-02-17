"""
Application Configuration
=========================
Zentrale Konfiguration mit Pydantic Settings.
Lädt Werte aus .env Datei.

Author: Jonas Kimmer
Date: 2025-02-14
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings.

    Alle Settings werden aus .env geladen.
    Fallback-Werte für Development.
    """

    # Application
    APP_NAME: str = "Liveticker AI System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # API Keys
    API_FOOTBALL_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    # CORS (für Frontend später)
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30  # Sekunden

    # LLM Settings
    LLM_MODEL: str = "gpt-4"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 100

    # API-Football Settings
    API_FOOTBALL_BASE_URL: str = "https://v3.football.api-sports.io"
    API_FOOTBALL_RATE_LIMIT: int = 100  # Requests pro Tag

    # Model Config (Pydantic v2)
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # Ignoriere unbekannte .env Variablen
    )


# Singleton Instance
settings = Settings()


# Validation Check (beim Import)
if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env file!")
