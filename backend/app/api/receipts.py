"""Endpoint d'envoi de reçus au client (activation manuelle depuis le dashboard).

POST /receipts/{kind}/{id}/{stage}
    kind : order | reservation | event
    id   : ID de l'entité
    stage : created | confirmed | completed

Envoie le message WhatsApp correspondant (Cloud API si configuré, sinon génère un lien wa.me).
Met à jour whatsapp_sent / whatsapp_error sur l'entité.
Retourne le lien wa.me, l'URL de la page receipt, et les bytes du QR code (base64).
"""

import base64
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.deps import AdminUser
from app.models.event import EventBooking
from app.models.order import Order
from app.models.reservation import Reservation
from app.services.receipts import build_receipt_message, generate_qr_png, get_receipt_url
from app.services.whatsapp import send_reply_to_customer

router = APIRouter()

SubjectKind = Literal["order", "reservation", "event"]
Stage = Literal["created", "confirmed", "completed"]

_MODELS = {
    "order": Order,
    "reservation": Reservation,
    "event": EventBooking,
}

# Quel état est requis pour chaque envoi (vérifions avant d'envoyer).
_STAGE_STATUS_MAP: dict[SubjectKind, dict[Stage, list[str]]] = {
    "order": {
        "created": ["new"],
        "confirmed": ["confirmed"],
        "completed": ["ready", "completed"],
    },
    "reservation": {
        "created": ["pending"],
        "confirmed": ["confirmed"],
        "completed": ["seated", "completed"],
    },
    "event": {
        "created": ["quote"],
        "confirmed": ["pending_deposit", "confirmed"],
        "completed": ["completed"],
    },
}


class ReceiptResponse(BaseModel):
    kind: str
    stage: str
    reference: str
    message_preview: str
    whatsapp_url: str | None = None
    receipt_url: str
    qr_base64: str


class ReceiptDetailResponse(BaseModel):
    """Détails du reçu pour la page publique /receipt/{reference}."""
    kind: str
    reference: str
    customer_name: str
    status: str
    items_summary: str = ""
    total: str = ""
    date_info: str = ""
    qr_base64: str


@router.post("/{kind}/{item_id}/{stage}", response_model=ReceiptResponse)
def send_receipt(
    kind: SubjectKind,
    item_id: int,
    stage: Stage,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Envoie un reçu au client pour l'étape donnée."""
    model = _MODELS.get(kind)
    if not model:
        raise HTTPException(status_code=400, detail=f"Type inconnu : {kind}")

    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"{kind} introuvable")

    # Vérification que l'état actuel est cohérent avec l'étape demandée.
    current_status = item.status.value if hasattr(item.status, "value") else item.status
    allowed = _STAGE_STATUS_MAP[kind].get(stage, [])
    if allowed and current_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible d'envoyer « {stage} » avec le statut actuel ({current_status})",
        )

    # Construction du message.
    message = build_receipt_message(item, stage)
    receipt_url = get_receipt_url(item.reference)

    # Envoi WhatsApp.
    success, error_msg, whatsapp_url = send_reply_to_customer(item.customer_phone, message)

    # Mise à jour du suivi sur l'entité.
    item.whatsapp_sent = success
    item.whatsapp_error = error_msg
    db.commit()

    # QR code (PNG → base64 pour le frontend).
    qr_bytes = generate_qr_png(receipt_url)
    qr_b64 = base64.b64encode(qr_bytes).decode("utf-8")

    return ReceiptResponse(
        kind=kind,
        stage=stage,
        reference=item.reference,
        message_preview=message[:120] + "…" if len(message) > 120 else message,
        whatsapp_url=whatsapp_url,
        receipt_url=receipt_url,
        qr_base64=qr_b64,
    )


def _item_detail(kind: str, item) -> dict:
    """Extrait les infos du reçu selon le type d'entité."""
    if kind == "order":
        lines = "\n".join(
            f"  {i.quantity}× {i.name} — {i.line_total}" for i in item.items
        )
        return {
            "kind": "order",
            "status": item.status.value,
            "items_summary": lines,
            "total": f"{item.total} {settings.CURRENCY}",
            "date_info": item.created_at.strftime("%d/%m/%Y %H:%M") if item.created_at else "",
        }
    if kind == "reservation":
        return {
            "kind": "reservation",
            "status": item.status.value,
            "items_summary": f"{item.party_size} couverts",
            "total": "",
            "date_info": f"{item.reservation_date.strftime('%d/%m/%Y')} à {item.reservation_time.strftime('%H:%M')}",
        }
    # event
    return {
        "kind": "event",
        "status": item.status.value,
        "items_summary": f"{item.event_type} — {item.guest_count} invités",
        "total": f"{item.quote_amount} {settings.CURRENCY}" if item.quote_amount else "",
        "date_info": f"{item.event_date.strftime('%d/%m/%Y')} à {item.start_time.strftime('%H:%M')}",
    }


@router.get("/{reference}", response_model=ReceiptDetailResponse)
def get_receipt_detail(reference: str, db: Annotated[Session, Depends(get_db)]):
    """Détails du reçu pour la page publique (aucune authentification requise)."""
    ref = reference.strip().upper()
    receipt_url = get_receipt_url(ref)
    qr_b64 = base64.b64encode(generate_qr_png(receipt_url)).decode("utf-8")

    for kind, model in _MODELS.items():
        item = db.query(model).filter(model.reference == ref).first()
        if item:
            detail = _item_detail(kind, item)
            return ReceiptDetailResponse(
                kind=detail["kind"],
                reference=item.reference,
                customer_name=item.customer_name,
                status=detail["status"],
                items_summary=detail["items_summary"],
                total=detail["total"],
                date_info=detail["date_info"],
                qr_base64=qr_b64,
            )

    raise HTTPException(status_code=404, detail="Référence introuvable")
