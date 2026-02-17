"""
Pydantic Schemas für Match.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.team import Team
from app.schemas.league_season import LeagueSeasonSimple


class MatchBase(BaseModel):
    """Basis-Schema für Match."""

    league_season_id: int
    home_team_id: int
    away_team_id: int
    match_date: datetime
    round: str | None = None
    status: str = "scheduled"


class MatchCreate(MatchBase):
    """Schema zum Erstellen eines Matches."""

    external_id: int | None = None
    score_home: int = 0
    score_away: int = 0


class MatchUpdate(BaseModel):
    """Schema zum Aktualisieren eines Matches."""

    league_season_id: int | None = None
    round: str | None = None
    match_date: datetime | None = None
    status: str | None = None
    score_home: int | None = None
    score_away: int | None = None


class Match(MatchBase):
    """Vollständiges Match-Schema (DB → API)."""

    id: int
    external_id: int | None
    score_home: int
    score_away: int
    created_at: datetime
    updated_at: datetime | None

    # Relationships
    home_team: Team
    away_team: Team
    league_season: LeagueSeasonSimple  # ← NEU!

    model_config = ConfigDict(from_attributes=True)


class MatchSimple(BaseModel):
    """Einfaches Match-Schema ohne Relationships (für Listen)."""

    id: int
    league_season_id: int
    home_team_id: int
    away_team_id: int
    match_date: datetime
    round: str | None
    status: str
    score_home: int
    score_away: int

    model_config = ConfigDict(from_attributes=True)
