from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class LineupBase(BaseModel):
    match_id: int
    team_id: int
    player_id: int
    player_name: str
    number: Optional[int] = None  # NICHT player_number
    position: Optional[str] = None  # NICHT player_position
    grid: Optional[str] = None  # NICHT player_grid
    starter: bool = True  # NICHT is_substitute


class LineupCreate(LineupBase):
    pass


class LineupUpdate(BaseModel):
    number: Optional[int] = None
    position: Optional[str] = None
    grid: Optional[str] = None
    starter: Optional[bool] = None


class LineupResponse(LineupBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
