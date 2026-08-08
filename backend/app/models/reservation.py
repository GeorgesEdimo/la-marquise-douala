"""Réservations de table."""

from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import ReservationStatus
from app.models.mixins import TimestampMixin


class Reservation(Base, TimestampMixin):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Référence lisible affichée au client et au staff (ex. « RS-000042 »).
    reference: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)

    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    customer = relationship("Customer", back_populates="reservations")

    # Coordonnées dupliquées : une réservation reste lisible même si la fiche client est purgée.
    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(30), index=True, nullable=False)
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    reservation_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    reservation_time: Mapped[time] = mapped_column(Time, nullable=False)
    party_size: Mapped[int] = mapped_column(Integer, nullable=False)

    table_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    special_requests: Mapped[str] = mapped_column(Text, default="", nullable=False)
    internal_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus, native_enum=False, length=20),
        default=ReservationStatus.PENDING,
        index=True,
        nullable=False,
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_reason: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Suivi des reçus WhatsApp envoyés au client (demande reçue / confirmation / complétion).
    whatsapp_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    whatsapp_error: Mapped[str] = mapped_column(Text, default="", nullable=False)
