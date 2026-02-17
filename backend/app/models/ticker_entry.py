# app/models/ticker_entry.py
"""
SQLAlchemy Model für Ticker-Entries-Tabelle.
Speichert generierte Liveticker-Texte (KI oder manuell).
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class TickerEntry(Base):
    """TickerEntry Model - Generierte Liveticker-Texte."""

    __tablename__ = "ticker_entries"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(
        Integer,
        ForeignKey("matches.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_id = Column(
        Integer, ForeignKey("events.id", ondelete="SET NULL"), nullable=True
    )
    minute = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    mode = Column(String(20), nullable=False)  # 'auto', 'hybrid', 'manual'
    style = Column(String(20), nullable=True)  # 'neutral', 'euphorisch', 'kritisch'
    language = Column(String(5), default="de")  # 'de', 'en', 'es', 'ja'
    llm_model = Column(String(50), nullable=True)  # 'gpt-4', 'claude-sonnet-4'
    prompt_used = Column(Text, nullable=True)  # Für Evaluation
    approved_by = Column(Integer, nullable=True)  # User-ID (später)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    match = relationship("Match", backref="ticker_entries")
    event = relationship("Event", backref="ticker_entries")

    def __repr__(self):
        return f"<TickerEntry(id={self.id}, mode='{self.mode}', minute={self.minute})>"
