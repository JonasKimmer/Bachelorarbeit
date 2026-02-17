"""
SQLAlchemy Model für LeagueSeasons (Liga-Saison-Kombinationen).
"""

from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class LeagueSeason(Base):
    """Liga-Saison-Kombination (Bundesliga 2025, La Liga 2024, etc.)."""

    __tablename__ = "league_seasons"

    id = Column(Integer, primary_key=True, index=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False)
    current_round = Column(String(100))  # "Regular Season - 22"
    total_rounds = Column(Integer)

    # Unique Constraint: Eine Liga kann nur einmal pro Season vorkommen
    __table_args__ = (
        UniqueConstraint("league_id", "season_id", name="unique_league_season"),
    )

    # Relationships
    league = relationship("League", back_populates="league_seasons")
    season = relationship("Season", back_populates="league_seasons")
    matches = relationship(
        "Match", back_populates="league_season", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<LeagueSeason(league_id={self.league_id}, season_id={self.season_id})>"
