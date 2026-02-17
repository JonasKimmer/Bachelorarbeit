"""
Match Repository - Data Access Layer.
"""

from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchUpdate


class MatchRepository:
    """Repository für Match-Datenbank-Operationen."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Match]:
        """Holt alle Matches mit Relationships."""
        return (
            self.db.query(Match)
            .options(
                joinedload(Match.home_team),
                joinedload(Match.away_team),
                joinedload(Match.league_season),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, match_id: int) -> Match | None:
        """Holt Match nach ID mit Relationships."""
        return (
            self.db.query(Match)
            .options(
                joinedload(Match.home_team),
                joinedload(Match.away_team),
                joinedload(Match.league_season),
            )
            .filter(Match.id == match_id)
            .first()
        )

    def get_by_league_season(
        self, league_season_id: int, skip: int = 0, limit: int = 100
    ) -> list[Match]:
        """Holt alle Matches einer LeagueSeason."""
        return (
            self.db.query(Match)
            .options(joinedload(Match.home_team), joinedload(Match.away_team))
            .filter(Match.league_season_id == league_season_id)
            .order_by(Match.match_date)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_round(self, league_season_id: int, round: str) -> list[Match]:
        """Holt alle Matches eines Spieltags."""
        return (
            self.db.query(Match)
            .options(joinedload(Match.home_team), joinedload(Match.away_team))
            .filter(Match.league_season_id == league_season_id, Match.round == round)
            .order_by(Match.match_date)
            .all()
        )

    def get_by_team(self, team_id: int, skip: int = 0, limit: int = 100) -> list[Match]:
        """Holt alle Matches eines Teams."""
        return (
            self.db.query(Match)
            .options(joinedload(Match.home_team), joinedload(Match.away_team))
            .filter((Match.home_team_id == team_id) | (Match.away_team_id == team_id))
            .order_by(Match.match_date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_live(self) -> list[Match]:
        """Holt alle Live-Matches."""
        return (
            self.db.query(Match)
            .options(joinedload(Match.home_team), joinedload(Match.away_team))
            .filter(Match.status == "live")
            .all()
        )

    def get_by_date(self, date: datetime) -> list[Match]:
        """Holt alle Matches eines Tages."""
        start = date.replace(hour=0, minute=0, second=0)
        end = date.replace(hour=23, minute=59, second=59)

        return (
            self.db.query(Match)
            .options(joinedload(Match.home_team), joinedload(Match.away_team))
            .filter(Match.match_date >= start, Match.match_date <= end)
            .order_by(Match.match_date)
            .all()
        )

    def create(self, match: MatchCreate) -> Match:
        """Erstellt neues Match."""
        db_match = Match(**match.model_dump())
        self.db.add(db_match)
        self.db.commit()
        self.db.refresh(db_match)
        return db_match

    def update(self, match_id: int, match_update: MatchUpdate) -> Match | None:
        """Aktualisiert Match."""
        db_match = self.get_by_id(match_id)
        if not db_match:
            return None

        update_data = match_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_match, key, value)

        self.db.commit()
        self.db.refresh(db_match)
        return db_match

    def delete(self, match_id: int) -> bool:
        """Löscht Match."""
        db_match = self.get_by_id(match_id)
        if not db_match:
            return False

        self.db.delete(db_match)
        self.db.commit()
        return True
