# app/api/v1/teams.py
"""
Teams API Endpoints.
GET /api/v1/teams - Liste aller Teams
GET /api/v1/teams/{id} - Einzelnes Team
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.team_repository import TeamRepository
from app.schemas.team import Team, TeamCreate


router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("/", response_model=list[Team])
def get_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Holt alle Teams mit Pagination.

    - **skip**: Anzahl zu überspringender Einträge (default: 0)
    - **limit**: Max. Anzahl Ergebnisse (default: 100)
    """
    repo = TeamRepository(db)
    teams = repo.get_all(skip=skip, limit=limit)
    return teams


@router.get("/{team_id}", response_model=Team)
def get_team(team_id: int, db: Session = Depends(get_db)):
    """
    Holt einzelnes Team nach ID.

    - **team_id**: Team-ID
    """
    repo = TeamRepository(db)
    team = repo.get_by_id(team_id)

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    return team


@router.post("/", response_model=Team, status_code=201)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """
    Erstellt neues Team.

    - **team**: Team-Daten (name, logo_url, external_id)
    """
    repo = TeamRepository(db)
    return repo.create(team)
