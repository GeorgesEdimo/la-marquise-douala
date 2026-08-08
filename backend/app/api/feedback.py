"""Endpoints feedback : soumission publique + consultation dashboard."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import AdminUser
from app.models.event import EventBooking
from app.models.feedback import Feedback
from app.models.order import Order
from app.models.reservation import Reservation
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter()

# Associe chaque référence à son type pour récupérer les infos client.
_REFERENCE_TYPES = [
    (Order, "order"),
    (Reservation, "reservation"),
    (EventBooking, "event"),
]


def _lookup_reference(db: Session, reference: str):
    """Retourne (kind, customer_name, customer_phone) si la référence existe.

    Approche volontairement simple, sans jointures : on interroge chaque table
    de références jusqu'à trouver une correspondance.
    """
    for model, kind in _REFERENCE_TYPES:
        item = db.query(model).filter(model.reference == reference).first()
        if item:
            return kind, item.customer_name, item.customer_phone
    return None


@router.post("/{reference}", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    reference: str,
    payload: FeedbackCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Soumission publique d'un retour client (sans authentification)."""
    ref = reference.strip().upper()
    if not ref:
        raise HTTPException(status_code=400, detail="Référence manquante")

    # Un seul retour par référence.
    existing = db.query(Feedback).filter(Feedback.reference == ref).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un retour existe déjà pour cette référence",
        )

    lookup = _lookup_reference(db, ref)
    if not lookup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Référence introuvable",
        )
    kind, customer_name, customer_phone = lookup

    feedback = Feedback(
        reference=ref,
        kind=kind,
        customer_name=customer_name,
        customer_phone=customer_phone,
        rating=payload.rating,
        comment=payload.comment.strip(),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("", response_model=list[FeedbackOut])
def list_feedbacks(
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Liste les retours clients (dashboard, réservé au back-office)."""
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


@router.get("/{reference}", response_model=FeedbackOut)
def get_feedback(
    reference: str,
    db: Annotated[Session, Depends(get_db)],
):
    """Retour d'un client pour une référence (public : affiche sur la page reçu)."""
    ref = reference.strip().upper()
    feedback = db.query(Feedback).filter(Feedback.reference == ref).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Aucun retour pour cette référence")
    return feedback
