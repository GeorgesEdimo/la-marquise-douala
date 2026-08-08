"""Router pour le menu (plats, cocktails, boissons)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import AdminUser
from app.models.menu import MenuItem
from app.schemas.menu import MenuItemCreate, MenuItemOut, MenuItemUpdate

router = APIRouter()


@router.get("", response_model=list[MenuItemOut])
def list_menu_items(
    db: Annotated[Session, Depends(get_db)],
    available_only: bool = False,
):
    """Liste le menu (public si available_only=True, admin sinon)."""
    query = db.query(MenuItem).order_by(MenuItem.category, MenuItem.sort_order)
    if available_only:
        query = query.filter(MenuItem.is_available == True)  # noqa: E712
    return query.all()


@router.post("", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    payload: MenuItemCreate,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Crée un plat (admin)."""
    # Vérifie unicité du slug
    existing = db.query(MenuItem).filter(MenuItem.slug == payload.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Slug '{payload.slug}' already exists",
        )

    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=MenuItemOut)
def get_menu_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    """Détail d'un plat."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    item_id: int,
    payload: MenuItemUpdate,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Met à jour un plat (admin)."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Supprime un plat (admin)."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    db.delete(item)
    db.commit()
