"""Fiche client — consolidée par numéro de téléphone (fidélisation)."""

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Le téléphone est la clé d'identification : au Cameroun tout passe par WhatsApp.
    phone: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Compteurs de fidélité, recalculés à chaque commande/réservation honorée.
    total_orders: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_spent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    reservations = relationship("Reservation", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    events = relationship("EventBooking", back_populates="customer")
