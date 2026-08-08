"""Point d'entrée FastAPI — configuration CORS, montage des routers, create_all."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    auth,
    customers,
    events,
    feedback,
    gallery,
    menu,
    orders,
    receipts,
    replies,
    reservations,
    stats,
    users,
)
from app.core.config import settings
from app.core.database import Base, engine
from app.core.migrations import run_migrations

# Création des tables au démarrage (dev SQLite sans Alembic)
Base.metadata.create_all(bind=engine)
# Ajout des colonnes manquantes aux tables existantes (idempotent)
run_migrations(engine)

# ── Pool de threads ASGI ──
# FastAPI exécute les endpoints synchrones dans un pool de threads (anyio).
# Le pool par défaut = 40 threads. Sous 100 requêtes simultanées, les60
# restantes s'accumulent → timeouts. On porte à100 pour couvrir la concurrence.
try:
    import anyio.to_thread
    limiter = anyio.to_thread.current_default_thread_limiter()
    limiter.total_tokens = 100
except Exception:
    pass  # Fallback silencieux si la configuration n'est pas supportée.

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage des routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Auth"])
app.include_router(menu.router, prefix=f"{settings.API_V1_PREFIX}/menu", tags=["Menu"])
app.include_router(
    gallery.router, prefix=f"{settings.API_V1_PREFIX}/gallery", tags=["Gallery"]
)
app.include_router(
    reservations.router,
    prefix=f"{settings.API_V1_PREFIX}/reservations",
    tags=["Reservations"],
)
app.include_router(
    events.router, prefix=f"{settings.API_V1_PREFIX}/events", tags=["Events"]
)
app.include_router(orders.router, prefix=f"{settings.API_V1_PREFIX}/orders", tags=["Orders"])
app.include_router(
    customers.router, prefix=f"{settings.API_V1_PREFIX}/customers", tags=["Customers"]
)
app.include_router(stats.router, prefix=f"{settings.API_V1_PREFIX}/stats", tags=["Stats"])
app.include_router(
    replies.router, prefix=f"{settings.API_V1_PREFIX}/replies", tags=["Replies"]
)
app.include_router(
    users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"]
)
app.include_router(
    receipts.router, prefix=f"{settings.API_V1_PREFIX}/receipts", tags=["Receipts"]
)
app.include_router(
    feedback.router, prefix=f"{settings.API_V1_PREFIX}/feedback", tags=["Feedback"]
)


@app.get(f"{settings.API_V1_PREFIX}/health")
def health_check():
    """Endpoint de santé."""
    return {"status": "ok", "app": settings.APP_NAME}
