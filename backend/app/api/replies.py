"""Réponses du staff aux clients (commandes, réservations, événements)."""

from datetime import datetime, timezone
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import AdminUser
from app.models.event import EventBooking
from app.models.order import Order
from app.models.reservation import Reservation
from app.services.whatsapp import send_reply_to_customer

router = APIRouter()

SubjectKind = Literal["order", "reservation", "event"]

# Chaque type de demande pointe vers son modèle : évite trois routes quasi identiques.
MODELS = {
    "order": Order,
    "reservation": Reservation,
    "event": EventBooking,
}


class ReplyRequest(BaseModel):
    """Message libre rédigé par le staff depuis le dashboard."""

    message: str = Field(..., min_length=1)
    # Consigner la réponse dans les notes internes garde une trace de l'échange.
    append_to_notes: bool = True


class ReplyResponse(BaseModel):
    reference: str
    customer_phone: str
    whatsapp_url: str | None = None
    sent: bool
    error: str = ""


@router.post("/{kind}/{item_id}", response_model=ReplyResponse)
def reply_to_customer(
    kind: SubjectKind,
    item_id: int,
    payload: ReplyRequest,
    db: Annotated[Session, Depends(get_db)],
    admin: AdminUser,
):
    """
    Transmet une réponse au client et l'archive dans les notes internes.

    En mode fallback, renvoie un lien wa.me pointant vers le client : le staff
    l'ouvre depuis le dashboard pour envoyer le message.
    """
    model = MODELS[kind]
    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"{kind} not found"
        )

    success, error, whatsapp_url = send_reply_to_customer(
        item.customer_phone, payload.message
    )

    if payload.append_to_notes:
        stamp = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")
        entry = f"[{stamp}] {admin.full_name} → client : {payload.message}"
        item.internal_notes = f"{item.internal_notes}\n{entry}".strip()
        db.commit()
        db.refresh(item)

    return ReplyResponse(
        reference=item.reference,
        customer_phone=item.customer_phone,
        whatsapp_url=whatsapp_url,
        sent=success and whatsapp_url is None,
        error=error,
    )
