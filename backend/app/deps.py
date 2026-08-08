"""Dépendances FastAPI (auth, DB session)."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.enums import UserRole
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Rôles autorisés à ouvrir le back-office (le staff simple en est exclu).
BACKOFFICE_ROLES = frozenset(
    {UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN}
)

# Rôles autorisés à modifier le contenu public : menu, carte, galerie.
# Le gestionnaire reste sur l'opérationnel (commandes, réservations, réponses).
CONTENT_ROLES = frozenset({UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN})


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Décode le JWT et retourne l'utilisateur connecté."""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return user


def require_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """
    Accès au back-office : tous les rôles internes sauf le staff simple.

    ADMIN est conservé pour les comptes créés avant l'introduction des trois
    nouveaux rôles.
    """
    if current_user.role not in BACKOFFICE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Backoffice privileges required",
        )
    return current_user


def require_super_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Réservé à la gestion des comptes utilisateurs."""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required",
        )
    return current_user


def require_content_manager(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Modification du contenu public : menu, carte, galerie."""
    if current_user.role not in CONTENT_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Content management privileges required",
        )
    return current_user


# Annotations typées réutilisables
CurrentUser = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[User, Depends(require_admin)]
SuperAdminUser = Annotated[User, Depends(require_super_admin)]
ContentManagerUser = Annotated[User, Depends(require_content_manager)]
