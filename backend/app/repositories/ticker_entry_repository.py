# app/repositories/ticker_entry_repository.py
"""
TickerEntry Repository - Data Access Layer.
Kapselt alle DB-Operationen für Ticker-Einträge.
"""

from sqlalchemy.orm import Session
from app.models.ticker_entry import TickerEntry
from app.schemas.ticker_entry import TickerEntryCreate, TickerEntryUpdate
from datetime import datetime


class TickerEntryRepository:
    """Repository für TickerEntry-Datenbank-Operationen."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> list[TickerEntry]:
        """Holt alle Ticker-Einträge mit Pagination."""
        return self.db.query(TickerEntry).offset(skip).limit(limit).all()

    def get_by_id(self, entry_id: int) -> TickerEntry | None:
        """Holt Ticker-Eintrag nach ID."""
        return self.db.query(TickerEntry).filter(TickerEntry.id == entry_id).first()

    def get_by_match(
        self, match_id: int, skip: int = 0, limit: int = 100
    ) -> list[TickerEntry]:
        """Holt alle Ticker-Einträge für ein Match, chronologisch sortiert."""
        return (
            self.db.query(TickerEntry)
            .filter(TickerEntry.match_id == match_id)
            .order_by(TickerEntry.minute.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_mode(
        self, mode: str, skip: int = 0, limit: int = 100
    ) -> list[TickerEntry]:
        """Holt Ticker-Einträge nach Modus (auto, hybrid, manual)."""
        return (
            self.db.query(TickerEntry)
            .filter(TickerEntry.mode == mode)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_published(self, match_id: int) -> list[TickerEntry]:
        """Holt nur veröffentlichte Ticker-Einträge für ein Match."""
        return (
            self.db.query(TickerEntry)
            .filter(
                TickerEntry.match_id == match_id, TickerEntry.published_at.isnot(None)
            )
            .order_by(TickerEntry.minute.desc())
            .all()
        )

    def create(self, entry: TickerEntryCreate) -> TickerEntry:
        """Erstellt neuen Ticker-Eintrag."""
        db_entry = TickerEntry(**entry.model_dump())
        self.db.add(db_entry)
        self.db.commit()
        self.db.refresh(db_entry)
        return db_entry

    def update(
        self, entry_id: int, entry_update: TickerEntryUpdate
    ) -> TickerEntry | None:
        """Aktualisiert Ticker-Eintrag."""
        db_entry = self.get_by_id(entry_id)
        if not db_entry:
            return None

        update_data = entry_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_entry, key, value)

        self.db.commit()
        self.db.refresh(db_entry)
        return db_entry

    def publish(self, entry_id: int) -> TickerEntry | None:
        """Veröffentlicht einen Ticker-Eintrag (setzt published_at)."""
        db_entry = self.get_by_id(entry_id)
        if not db_entry:
            return None

        db_entry.published_at = datetime.now()
        self.db.commit()
        self.db.refresh(db_entry)
        return db_entry

    def delete(self, entry_id: int) -> bool:
        """Löscht Ticker-Eintrag."""
        db_entry = self.get_by_id(entry_id)
        if not db_entry:
            return False

        self.db.delete(db_entry)
        self.db.commit()
        return True
