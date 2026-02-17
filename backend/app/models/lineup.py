"""
SQLAlchemy Model für Lineups.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Lineup(Base):
    """Lineup Model - Aufstellungen pro Match."""

    __tablename__ = "lineups"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(
        Integer, ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)

    player_id = Column(Integer)
    player_name = Column(String(100))
    number = Column(Integer)
    position = Column(String(20))  # Goalkeeper, Defender, Midfielder, Attacker
    grid = Column(String(10))  # z.B. "4:3:1"
    starter = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    match = relationship("Match", backref="lineups")
    team = relationship("Team")

    def __repr__(self):
        return f"<Lineup(match_id={self.match_id}, player={self.player_name})>"
