"""Router d'authentification (login, info utilisateur)."""

import threading
import time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.deps import CurrentUser
from app.models.user import User
from app.schemas.auth import TokenResponse, UserOut

router = APIRouter()

# ── Protection brute-force (mémoire, simple et sans dépendance) ──
# Clé = email (tentatives par compte) ; la rotation régulière évite tout dépassement mémoire.
_login_attempts: dict[str, list[float]] = {}
_lock = threading.Lock()
_MAX_ATTEMPTS = settings.LOGIN_MAX_ATTEMPTS
_LOCKOUT_SECONDS = settings.LOGIN_LOCKOUT_SECONDS


def _check_lockout(email: str) -> None:
    """Lève 429 si le compte est temporairement bloqué après trop d'échecs."""
    now = time.time()
    with _lock:
        timestamps = [t for t in _login_attempts.get(email, []) if now - t < _LOCKOUT_SECONDS]
        _login_attempts[email] = timestamps
        if len(timestamps) >= _MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Trop de tentatives. Réessayez dans quelques minutes.",
            )


def _register_failure(email: str) -> None:
    with _lock:
        _login_attempts.setdefault(email, []).append(time.time())


def _clear_failures(email: str) -> None:
    with _lock:
        _login_attempts.pop(email, None)


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
):
    """Connexion admin/staff → retourne un JWT. Protégée contre le brute-force."""
    email = (form_data.username or "").strip().lower()
    _check_lockout(email)

    user = db.query(User).filter(User.email == email).first()

    if not user or not user.is_active:
        _register_failure(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(form_data.password, user.hashed_password):
        _register_failure(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    _clear_failures(email)
    access_token = create_access_token(subject=user.email, role=user.role.value)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: CurrentUser):
    """Retourne les infos de l'utilisateur connecté."""
    return current_user
