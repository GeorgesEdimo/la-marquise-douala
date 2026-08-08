"""Réservations d'événement (anniversaire, corporate, privatisation) avec devis et acompte."""

from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import EventStatus, PaymentMethod, PaymentStatus
from app.models.mixins import TimestampMixin


class EventBooking(Base, TimestampMixin):
    __tablename__ = "event_bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)

    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    customer = relationship("Customer", back_populates="events")

    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(30), index=True, nullable=False)
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Type libre : « Anniversaire », « Corporate », « Privatisation », « Mariage »…
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    guest_count: Mapped[int] = mapped_column(Integer, nullable=False)

    # Lieu : salle du restaurant, jardin, ou traiteur à l'adresse du client.
    location: Mapped[str] = mapped_column(String(200), default="", nullable=False)
    details: Mapped[str] = mapped_column(Text, default="", nullable=False)
    internal_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # ── Préférences de mise en place (renseignées par le client) ──
    # Espace privatisé : « salle-principale », « terrasse », « jardin », « lounge », « chez-le-client ».
    space: Mapped[str] = mapped_column(String(60), default="", nullable=False)
    # Thème / ambiance de décoration souhaité.
    decoration_theme: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    decoration_colors: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    # Formule repas : « cocktail-dinatoire », « buffet », « service-table », « aucune ».
    catering_formula: Mapped[str] = mapped_column(String(60), default="", nullable=False)
    # Options retenues (DJ, gâteau, photographe…), stockées en liste séparée par virgules.
    options: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # Contraintes alimentaires et allergies.
    dietary_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # Budget indicatif annoncé par le client (FCFA, 0 = non précisé).
    budget_estimate: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # ── Devis & acompte (en FCFA) ──
    quote_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    deposit_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    deposit_paid: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    payment_method: Mapped[PaymentMethod | None] = mapped_column(
        Enum(PaymentMethod, native_enum=False, length=20), nullable=True
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=20),
        default=PaymentStatus.PENDING,
        nullable=False,
    )

    status: Mapped[EventStatus] = mapped_column(
        Enum(EventStatus, native_enum=False, length=20),
        default=EventStatus.QUOTE,
        index=True,
        nullable=False,
    )
    quote_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_reason: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Suivi des reçus WhatsApp envoyés au client.
    whatsapp_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    whatsapp_error: Mapped[str] = mapped_column(Text, default="", nullable=False)

    @property
    def balance_due(self) -> int:
        """Reste à payer sur le devis."""
        return max(self.quote_amount - self.deposit_paid, 0)
