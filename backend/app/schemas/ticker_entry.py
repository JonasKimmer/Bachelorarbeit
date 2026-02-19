# app/schemas/ticker_entry.py
"""
Pydantic Schemas für TickerEntry-Daten.
Validierung für generierte Liveticker-Texte.
"""

from pydantic import BaseModel, Field
from datetime import datetime


class TickerEntryBase(BaseModel):
    """Basis-Schema mit gemeinsamen Feldern."""

    match_id: int
    event_id: int | None = None
    minute: int = Field(ge=0, le=120)
    text: str = Field(min_length=1)
    icon: str | None = None  # ← neu
    mode: str = Field(pattern="^(auto|hybrid|manual)$")
    style: str | None = Field(None, pattern="^(neutral|euphorisch|kritisch)$")
    language: str = Field(default="de", pattern="^(de|en|es|ja)$")
    llm_model: str | None = Field(None, max_length=50)
    prompt_used: str | None = None
    approved_by: int | None = None


class TickerEntryCreate(TickerEntryBase):
    """Schema für TickerEntry-Erstellung (POST)."""

    pass


class TickerEntryUpdate(BaseModel):
    """Schema für TickerEntry-Updates (PATCH)."""

    text: str | None = Field(None, min_length=1)
    published_at: datetime | None = None


class TickerEntry(TickerEntryBase):
    """Schema für TickerEntry-Response (GET)."""

    id: int
    created_at: datetime
    published_at: datetime | None = None

    class Config:
        from_attributes = True
