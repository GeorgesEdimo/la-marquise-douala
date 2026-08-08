"""Schémas pour le menu (plats, cocktails, boissons)."""

from pydantic import BaseModel, Field

from app.models.enums import MenuCategory


class MenuItemCreate(BaseModel):
    """Création d'un plat (admin)."""

    slug: str = Field(..., max_length=120)
    name: str = Field(..., max_length=200)
    description: str = ""
    price: int = Field(..., ge=0)
    category: MenuCategory
    image: str | None = None
    badge: str | None = Field(None, max_length=60)
    is_available: bool = True
    is_dish_of_day: bool = False
    sort_order: int = 0


class MenuItemUpdate(BaseModel):
    """Mise à jour partielle d'un plat."""

    name: str | None = None
    description: str | None = None
    price: int | None = Field(None, ge=0)
    category: MenuCategory | None = None
    image: str | None = None
    badge: str | None = None
    is_available: bool | None = None
    is_dish_of_day: bool | None = None
    sort_order: int | None = None


class MenuItemOut(BaseModel):
    """Plat renvoyé au client."""

    id: int
    slug: str
    name: str
    description: str
    price: int
    category: MenuCategory
    image: str | None
    badge: str | None
    is_available: bool
    is_dish_of_day: bool
    sort_order: int

    class Config:
        from_attributes = True
