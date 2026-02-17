# app/models/team.py
"""
SQLAlchemy Model für Teams-Tabelle.
Mapped direkt auf die PostgreSQL-Tabelle aus init.sql.
"""

from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base


class Team(Base):
    """Team Model - Mannschafts-Stammdaten."""

    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    logo_url = Column(String(255), nullable=True)
    external_id = Column(Integer, nullable=True, index=True)  # API-Football ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}')>"
