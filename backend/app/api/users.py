"""Gestion des comptes du back-office (réservée au super administrateur)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.deps import CurrentUser, SuperAdminUser
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import UserOut

router = APIRouter()


class UserCreate(BaseModel):
    """Création d'un compte back-office."""

    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=120)
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.MANAGER
    is_active: bool = True


class UserUpdate(BaseModel):
    """Mise à jour d'un compte (mot de passe optionnel)."""

    full_name: str | None = Field(None, min_length=1, max_length=120)
    password: str | None = Field(None, min_length=8)
    role: UserRole | None = None
    is_active: bool | None = None


@router.get("/me", response_model=UserOut)
def get_my_account(current_user: CurrentUser):
    """Profil du compte connecté — accessible à tous les rôles."""
    return current_user


@router.get("", response_model=list[UserOut])
def list_users(
    db: Annotated[Session, Depends(get_db)],
    _super: SuperAdminUser,
):
    """Liste les comptes du back-office."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Annotated[Session, Depends(get_db)],
    _super: SuperAdminUser,
):
    """Crée un compte back-office."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte existe déjà avec cet email",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: SuperAdminUser,
):
    """Met à jour un compte : nom, rôle, activation, mot de passe."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable"
        )

    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)

    # Garde-fou : ne pas se retirer soi-même l'accès et laisser la plateforme sans pilote.
    if user.id == current_user.id:
        if data.get("is_active") is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous ne pouvez pas désactiver votre propre compte",
            )
        if "role" in data and data["role"] != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous ne pouvez pas changer votre propre rôle",
            )

    for field, value in data.items():
        setattr(user, field, value)

    if password:
        user.hashed_password = hash_password(password)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: SuperAdminUser,
):
    """
    Supprime un compte back-office.

    Garde-fous : on ne peut ni se supprimer soi-même, ni supprimer un autre
    super_admin. Pour « retirer » un super_admin, il faut d'abord lui changer
    de rôle, puis le désactiver — jamais le bannir.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte",
        )

    if user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de supprimer un super administrateur. "
                   "Changez d'abord son rôle puis désactivez le compte.",
        )

    db.delete(user)
    db.commit()
