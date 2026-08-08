"""Carte du restaurant : plats, cocktails, boissons."""

from sqlalchemy import Boolean, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import MenuCategory
from app.models.mixins import TimestampMixin


class MenuItem(Base, TimestampMixin):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Identifiant lisible repris du front (ex. « crispy-coconut-shrimps »).
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # Prix en FCFA — entier, la devise n'a pas de sous-unité en pratique.
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[MenuCategory] = mapped_column(
        Enum(MenuCategory, native_enum=False, length=20), index=True, nullable=False
    )
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    badge: Mapped[str | None] = mapped_column(String(60), nullable=True)

    # Disponibilité et mise en avant, pilotées depuis le dashboard.
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_dish_of_day: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
