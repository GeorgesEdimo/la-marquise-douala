"""Micro-migrations SQLite idempotentes.

`Base.metadata.create_all()` crée les tables manquantes mais n'ajoute PAS les
colonnes nouvelles à des tables existantes. Ce module comble l'écart en
exécutant des ALTER TABLE ADD COLUMN idempotents au démarrage.

Usage : appelé dans main.py avant/après create_all().
"""

import logging

from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)


def _table_columns(engine: Engine, table: str) -> set[str]:
    with engine.connect() as conn:
        rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return {row[1] for row in rows}


def _add_column_if_missing(engine: Engine, table: str, column: str, definition: str) -> bool:
    """Ajoute une colonne si elle n'existe pas. Retourne True si modifié."""
    if table not in _table_names(engine):
        logger.info("Table %s absente (créée par create_all).", table)
        return False

    columns = _table_columns(engine, table)
    if column in columns:
        return False

    with engine.begin() as conn:
        conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {definition}'))
    logger.info("Migré : %s.%s ajoutée.", table, column)
    return True


def _table_names(engine: Engine) -> set[str]:
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table'")
        ).fetchall()
    return {row[0] for row in rows}


# (table, colonne, définition SQL)
_COLUMNS: list[tuple[str, str, str]] = [
    # Suivi des reçus WhatsApp (ajouté après création initiale des tables).
    ("reservations", "whatsapp_sent", "BOOLEAN DEFAULT 0 NOT NULL"),
    ("reservations", "whatsapp_error", "TEXT DEFAULT '' NOT NULL"),
    ("event_bookings", "whatsapp_sent", "BOOLEAN DEFAULT 0 NOT NULL"),
    ("event_bookings", "whatsapp_error", "TEXT DEFAULT '' NOT NULL"),
    ("users", "role", "VARCHAR(20) DEFAULT 'staff' NOT NULL"),
    ("users", "is_active", "BOOLEAN DEFAULT 1 NOT NULL"),
]


def run_migrations(engine: Engine) -> None:
    """Applique les migrations idempotentes (sans erreur si déjà faites)."""
    applied = 0
    for table, column, definition in _COLUMNS:
        try:
            if _add_column_if_missing(engine, table, column, definition):
                applied += 1
        except Exception as exc:  # pragma: no cover — défensif
            logger.warning("Migration %s.%s ignorée : %s", table, column, exc)

    if applied:
        logger.info("Migrations appliquées : %s colonne(s) ajoutée(s).", applied)
    else:
        logger.info("Base à jour : aucune migration nécessaire.")
