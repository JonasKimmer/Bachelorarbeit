# app/schemas/team.py
"""
Pydantic Schemas für Team-Daten.
Validierung und Serialisierung für API Requests/Responses.
"""

from pydantic import BaseModel, Field
from datetime import datetime


class TeamBase(BaseModel):
    """Basis-Schema mit gemeinsamen Feldern."""

    name: str = Field(..., min_length=1, max_length=100)
    logo_url: str | None = None
    external_id: int | None = None


class TeamCreate(TeamBase):
    """Schema für Team-Erstellung (POST)."""

    pass


class TeamUpdate(BaseModel):
    """Schema für Team-Updates (PUT/PATCH)."""

    name: str | None = None
    logo_url: str | None = None
    external_id: int | None = None


class Team(TeamBase):
    """Schema für Team-Response (GET)."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Ermöglicht SQLAlchemy Model → Pydantic
