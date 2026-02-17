from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.lineup import Lineup
from app.schemas.lineup import LineupCreate, LineupUpdate


class LineupRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Lineup]:
        return self.db.query(Lineup).all()

    def get_by_id(self, lineup_id: int) -> Optional[Lineup]:
        return self.db.query(Lineup).filter(Lineup.id == lineup_id).first()

    def get_by_match(self, match_id: int) -> List[Lineup]:
        return self.db.query(Lineup).filter(Lineup.match_id == match_id).all()

    def get_by_team(self, team_id: int) -> List[Lineup]:
        return self.db.query(Lineup).filter(Lineup.team_id == team_id).all()


def get_starters_by_match(self, match_id: int) -> List[Lineup]:
    return (
        self.db.query(Lineup)
        .filter(
            Lineup.match_id == match_id, not Lineup.is_substitute
        )  # OHNE not = Substitutes!
        .all()
    )


def get_substitutes_by_match(self, match_id: int) -> List[Lineup]:
    return (
        self.db.query(Lineup)
        .filter(
            Lineup.match_id == match_id, Lineup.is_substitute
        )  # MIT is_substitute = Bank
        .all()
    )

    def create(self, lineup_data: LineupCreate) -> Lineup:
        lineup = Lineup(**lineup_data.model_dump())
        self.db.add(lineup)
        self.db.commit()
        self.db.refresh(lineup)
        return lineup

    def update(self, lineup_id: int, lineup_data: LineupUpdate) -> Optional[Lineup]:
        lineup = self.get_by_id(lineup_id)
        if not lineup:
            return None

        update_data = lineup_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(lineup, key, value)

        self.db.commit()
        self.db.refresh(lineup)
        return lineup

    def delete(self, lineup_id: int) -> bool:
        lineup = self.get_by_id(lineup_id)
        if not lineup:
            return False

        self.db.delete(lineup)
        self.db.commit()
        return True
