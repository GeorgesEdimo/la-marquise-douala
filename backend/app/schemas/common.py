"""Schémas Pydantic communs (pagination, messages)."""

from pydantic import BaseModel


class Message(BaseModel):
    """Réponse API simple avec message."""

    message: str


class PaginationParams(BaseModel):
    """Paramètres de pagination standard."""

    skip: int = 0
    limit: int = 100
