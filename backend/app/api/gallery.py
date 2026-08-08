"""Router pour la galerie photos/vidéos."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import AdminUser
from app.models.gallery import GalleryImage
from app.schemas.gallery import GalleryImageCreate, GalleryImageOut, GalleryImageUpdate

router = APIRouter()


@router.get("", response_model=list[GalleryImageOut])
def list_gallery_images(
    db: Annotated[Session, Depends(get_db)],
    published_only: bool = False,
):
    """Liste la galerie (public si published_only=True, admin sinon)."""
    query = db.query(GalleryImage).order_by(
        GalleryImage.category, GalleryImage.sort_order
    )
    if published_only:
        query = query.filter(GalleryImage.is_published == True)  # noqa: E712
    return query.all()


@router.post("", response_model=GalleryImageOut, status_code=status.HTTP_201_CREATED)
def create_gallery_image(
    payload: GalleryImageCreate,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Ajoute une image à la galerie (admin)."""
    image = GalleryImage(**payload.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.get("/{image_id}", response_model=GalleryImageOut)
def get_gallery_image(
    image_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    """Détail d'une image."""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return image


@router.patch("/{image_id}", response_model=GalleryImageOut)
def update_gallery_image(
    image_id: int,
    payload: GalleryImageUpdate,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Met à jour une image (admin)."""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(image, field, value)

    db.commit()
    db.refresh(image)
    return image


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(
    image_id: int,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Supprime une image (admin)."""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    db.delete(image)
    db.commit()
