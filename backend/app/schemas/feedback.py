"""Schémas pour les retours clients."""

from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    """Formulaire de retour soumis par le client public."""

    rating: int | None = Field(None, ge=1, le=5, description="Note de 1 à 5 étoiles")
    comment: str = ""


class FeedbackOut(BaseModel):
    """Retour client renvoyé au dashboard."""

    id: int
    reference: str
    kind: str
    customer_name: str
    customer_phone: str
    rating: int | None
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReceiptResponse:
    """Réponse lors de l'envoi d'un reçu — pas de schéma Pydantic car mix (dict + bytes QR)."""
    pass
