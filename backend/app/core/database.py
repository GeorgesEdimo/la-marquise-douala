"""Connexion base de données et session SQLAlchemy 2.x.

Concurrence SQLite :
- WAL : un seul écrivain à la fois, mais les lecteurs ne bloquent pas les écrivains.
- busy_timeout élevé : quand un écrivain trouve le verrou pris, il patiente (jusqu'à
  60 s) au lieu d'échouer immédiatement. SQLite libère le GIL pendant l'attente,
  donc le serveur continue de traiter d'autres requêtes.
- NullPool : chaque requête ouvre sa propre connexion → aucun épuisement de pool
  sous 100+ requêtes simultanées.
"""

from collections.abc import Generator
from contextlib import contextmanager

from sqlalchemy import NullPool, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")


@contextmanager
def write_lock():
    """Sérialise les transactions d'écriture.

    Pour SQLite, le contrôle est confié à SQLite lui-même (busy_timeout + WAL) :
    aucun verrou Python n'est nécessaire. Cette fonction reste une API stable
    pour les endpoints, mais ne bloque pas les threads du serveur ASGI.
    """
    yield


def _set_sqlite_pragma(dbapi_conn, _):
    """Active WAL + un busy timeout généreux pour 100+ écritures concurrentes."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA busy_timeout=60000")  # 60 s d'attente max avant échec
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA temp_store=MEMORY")
    cursor.execute("PRAGMA cache_size=-20000")  # 20 Mo de cache
    cursor.close()


engine = create_engine(
    settings.DATABASE_URL,
    # SQLite : NullPool = une connexion par requête, aucune contention de pool.
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    poolclass=NullPool if _is_sqlite else None,
    pool_pre_ping=not _is_sqlite,
    echo=False,
)

if _is_sqlite:
    event.listen(engine, "connect", _set_sqlite_pragma)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Classe de base de tous les modèles ORM."""


def get_db() -> Generator[Session, None, None]:
    """Dépendance FastAPI : fournit une session et la referme systématiquement."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
