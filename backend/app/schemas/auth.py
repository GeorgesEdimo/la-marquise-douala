"""Schémas d'authentification (login, token, user info)."""

from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole


class LoginRequest(BaseModel):
    """Formulaire de connexion (OAuth2 PasswordRequestForm compatible)."""

    username: EmailStr  # OAuth2 attend « username », on l'utilise pour l'email
    password: str


class TokenResponse(BaseModel):
    """Jeton JWT renvoyé après login."""

    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    """Utilisateur renvoyé au front (sans mot de passe)."""

    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
