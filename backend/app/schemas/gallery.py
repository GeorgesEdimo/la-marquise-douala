"""Schémas pour la galerie photos/vidéos."""

from pydantic import BaseModel, Field

from app.models.enums import GalleryCategory


class GalleryImageCreate(BaseModel):
    """Upload d'une image (admin)."""

    src: str = Field(..., max_length=500)
    alt: str = Field("", max_length=255)
    caption: str = Field("", max_length=255)
    category: GalleryCategory
    size: str = Field("default", max_length=10)  # wide / tall / default
    is_published: bool = True
    sort_order: int = 0


class GalleryImageUpdate(BaseModel):
    """Mise à jour partielle d'une image."""

    alt: str | None = None
    caption: str | None = None
    category: GalleryCategory | None = None
    size: str | None = None
    is_published: bool | None = None
    sort_order: int | None = None


class GalleryImageOut(BaseModel):
    """Image renvoyée au client."""

    id: int
    src: str
    alt: str
    caption: str
    category: GalleryCategory
    size: str
    is_published: bool
    sort_order: int

    class Config:
        from_attributes = True
