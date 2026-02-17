# app/repositories/team_repository.py
"""
Team Repository - Data Access Layer.
Kapselt alle DB-Operationen für Teams.
"""

from sqlalchemy.orm import Session
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate


class TeamRepository:
    """Repository für Team-Datenbank-Operationen."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Team]:
        """Holt alle Teams mit Pagination."""
        return self.db.query(Team).offset(skip).limit(limit).all()

    def get_by_id(self, team_id: int) -> Team | None:
        """Holt Team nach ID."""
        return self.db.query(Team).filter(Team.id == team_id).first()

    def get_by_external_id(self, external_id: int) -> Team | None:
        """Holt Team nach API-Football ID."""
        return self.db.query(Team).filter(Team.external_id == external_id).first()

    def create(self, team: TeamCreate) -> Team:
        """Erstellt neues Team."""
        db_team = Team(**team.model_dump())
        self.db.add(db_team)
        self.db.commit()
        self.db.refresh(db_team)
        return db_team

    def update(self, team_id: int, team_update: TeamUpdate) -> Team | None:
        """Aktualisiert Team."""
        db_team = self.get_by_id(team_id)
        if not db_team:
            return None

        update_data = team_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_team, key, value)

        self.db.commit()
        self.db.refresh(db_team)
        return db_team

    def delete(self, team_id: int) -> bool:
        """Löscht Team."""
        db_team = self.get_by_id(team_id)
        if not db_team:
            return False

        self.db.delete(db_team)
        self.db.commit()
        return True
