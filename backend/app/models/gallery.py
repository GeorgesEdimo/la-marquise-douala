"""Galerie photos/vidéos gérée depuis le dashboard."""

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import GalleryCategory
from app.models.mixins import TimestampMixin


class GalleryImage(Base, TimestampMixin):
    __tablename__ = "gallery_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    src: Mapped[str] = mapped_column(String(500), nullable=False)
    alt: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    caption: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    category: Mapped[GalleryCategory] = mapped_column(
        Enum(GalleryCategory, native_enum=False, length=20), index=True, nullable=False
    )
    # Emphase pour la mosaïque du front : « wide », « tall » ou « default ».
    size: Mapped[str] = mapped_column(String(10), default="default", nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
