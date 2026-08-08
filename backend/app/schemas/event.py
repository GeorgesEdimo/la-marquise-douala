"""Schémas pour les réservations d'événement (anniversaire, corporate, privatisation)."""

from datetime import date, datetime, time

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import EventStatus, PaymentMethod, PaymentStatus


class EventBookingCreate(BaseModel):
    """Demande d'événement (client public)."""

    customer_name: str = Field(..., max_length=150)
    customer_phone: str = Field(..., max_length=30)
    customer_email: EmailStr | None = None
    event_type: str = Field(..., max_length=80)  # Anniversaire, Corporate, etc.
    event_date: date
    start_time: time
    end_time: time | None = None
    guest_count: int = Field(..., ge=1)
    location: str = Field("", max_length=200)
    details: str = ""

    # Préférences de mise en place (rubriques conditionnelles côté front)
    space: str = Field("", max_length=60)
    decoration_theme: str = Field("", max_length=120)
    decoration_colors: str = Field("", max_length=120)
    catering_formula: str = Field("", max_length=60)
    options: list[str] = Field(default_factory=list)
    dietary_notes: str = ""
    budget_estimate: int = Field(0, ge=0)


class EventBookingUpdate(BaseModel):
    """Mise à jour depuis le dashboard (devis, acompte, statut)."""

    quote_amount: int | None = Field(None, ge=0)
    deposit_amount: int | None = Field(None, ge=0)
    deposit_paid: int | None = Field(None, ge=0)
    payment_method: PaymentMethod | None = None
    payment_status: PaymentStatus | None = None
    status: EventStatus | None = None
    internal_notes: str | None = None


class EventBookingOut(BaseModel):
    """Événement renvoyé au client."""

    id: int
    reference: str
    customer_name: str
    customer_phone: str
    customer_email: str | None
    event_type: str
    event_date: date
    start_time: time
    end_time: time | None
    guest_count: int
    location: str
    details: str
    internal_notes: str

    # Préférences de mise en place
    space: str
    decoration_theme: str
    decoration_colors: str
    catering_formula: str
    options: list[str]
    dietary_notes: str
    budget_estimate: int

    quote_amount: int
    deposit_amount: int
    deposit_paid: int
    balance_due: int  # calculé
    payment_method: PaymentMethod | None
    payment_status: PaymentStatus
    status: EventStatus
    quote_sent_at: datetime | None
    confirmed_at: datetime | None
    cancelled_reason: str
    created_at: datetime
    updated_at: datetime

    @field_validator("options", mode="before")
    @classmethod
    def split_options(cls, value: object) -> list[str]:
        """La base stocke les options en chaîne séparée par virgules."""
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value or []

    class Config:
        from_attributes = True


class EventBookingCreateResponse(BaseModel):
    """Réponse après création : inclut le lien WhatsApp en mode fallback."""

    event: EventBookingOut
    whatsapp_url: str | None = None
