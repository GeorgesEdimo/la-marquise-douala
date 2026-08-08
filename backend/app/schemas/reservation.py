"""Schémas pour les réservations de table."""

from datetime import date, datetime, time

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import ReservationStatus


class ReservationCreate(BaseModel):
    """Demande de réservation (client public)."""

    customer_name: str = Field(..., max_length=150)
    customer_phone: str = Field(..., max_length=30)
    customer_email: EmailStr | None = None
    reservation_date: date
    reservation_time: time
    party_size: int = Field(..., ge=1, le=50)
    special_requests: str = ""


class ReservationUpdate(BaseModel):
    """Mise à jour depuis le dashboard (admin)."""

    status: ReservationStatus | None = None
    table_number: str | None = None
    internal_notes: str | None = None


class ReservationOut(BaseModel):
    """Réservation renvoyée au client."""

    id: int
    reference: str
    customer_name: str
    customer_phone: str
    customer_email: str | None
    reservation_date: date
    reservation_time: time
    party_size: int
    table_number: str | None
    special_requests: str
    internal_notes: str
    status: ReservationStatus
    confirmed_at: datetime | None
    cancelled_reason: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReservationCreateResponse(BaseModel):
    """Réponse après création : inclut le lien WhatsApp en mode fallback."""

    reservation: ReservationOut
    whatsapp_url: str | None = None
