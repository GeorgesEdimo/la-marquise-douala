"""Schémas pour la fiche client (fidélisation)."""

from datetime import datetime

from pydantic import BaseModel, Field


class CustomerOut(BaseModel):
    """Fiche client renvoyée au dashboard."""

    id: int
    phone: str
    full_name: str
    email: str | None
    notes: str
    total_orders: int
    total_spent: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
