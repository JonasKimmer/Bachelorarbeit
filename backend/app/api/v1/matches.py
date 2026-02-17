"""
Matches API Endpoints.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.match_repository import MatchRepository
from app.schemas.match import Match, MatchCreate, MatchUpdate, MatchSimple


router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/", response_model=list[Match])
def get_matches(
    skip: int = 0,
    limit: int = 100,
    league_season_id: int | None = Query(None),
    team_id: int | None = Query(None),
    round: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Holt Matches mit optionalen Filtern.

    - **league_season_id**: Filter nach Liga-Season
    - **team_id**: Filter nach Team
    - **round**: Filter nach Spieltag
    - **status**: Filter nach Status (scheduled, live, finished)
    """
    repo = MatchRepository(db)

    # Filter nach Team
    if team_id:
        return repo.get_by_team(team_id, skip=skip, limit=limit)

    # Filter nach Spieltag (benötigt league_season_id!)
    if round and league_season_id:
        return repo.get_by_round(league_season_id, round)

    # Filter nach LeagueSeason
    if league_season_id:
        return repo.get_by_league_season(league_season_id, skip=skip, limit=limit)

    # Alle Matches
    return repo.get_all(skip=skip, limit=limit)


@router.get("/live", response_model=list[Match])
def get_live_matches(db: Session = Depends(get_db)):
    """Holt alle Live-Matches."""
    repo = MatchRepository(db)
    return repo.get_live()


@router.get("/today", response_model=list[Match])
def get_todays_matches(db: Session = Depends(get_db)):
    """Holt alle Matches von heute."""
    repo = MatchRepository(db)
    return repo.get_by_date(datetime.now())


@router.get("/{match_id}", response_model=Match)
def get_match(match_id: int, db: Session = Depends(get_db)):
    """Holt Match nach ID."""
    repo = MatchRepository(db)
    match = repo.get_by_id(match_id)

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    return match


@router.post("/", response_model=Match, status_code=201)
def create_match(match: MatchCreate, db: Session = Depends(get_db)):
    """Erstellt neues Match."""
    repo = MatchRepository(db)
    return repo.create(match)


@router.patch("/{match_id}", response_model=Match)
def update_match(
    match_id: int, match_update: MatchUpdate, db: Session = Depends(get_db)
):
    """Aktualisiert Match."""
    repo = MatchRepository(db)
    updated_match = repo.update(match_id, match_update)

    if not updated_match:
        raise HTTPException(status_code=404, detail="Match not found")

    return updated_match


@router.delete("/{match_id}", status_code=204)
def delete_match(match_id: int, db: Session = Depends(get_db)):
    """Löscht Match."""
    repo = MatchRepository(db)
    success = repo.delete(match_id)

    if not success:
        raise HTTPException(status_code=404, detail="Match not found")
