"""Retours clients (note + commentaire) attachés à une référence de commande, réservation ou événement."""

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Feedback(Base, TimestampMixin):
    __tablename__ = "feedbacks"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Référence de l'entité concernée : « YD-000123 », « RS-000042 », « EV-000007 ».
    reference: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    # Type d'entité : order | reservation | event.
    kind: Mapped[str] = mapped_column(String(20), nullable=False)

    # Infos client (dupliquées : lisibles même si la fiche client est purgée).
    customer_name: Mapped[str] = mapped_column(String(150), default="", nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(30), default="", nullable=False)

    # Note sur 5 (nullable : le client peut commenter sans noter).
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    comment: Mapped[str] = mapped_column(Text, default="", nullable=False)
