"""Router pour les événements (anniversaire, corporate, privatisation)."""

from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db, write_lock
from app.deps import AdminUser
from app.models.event import EventBooking
from app.schemas.event import (
    EventBookingCreate,
    EventBookingCreateResponse,
    EventBookingOut,
    EventBookingUpdate,
)
from app.services.customer import upsert_customer_by_phone
from app.services.reference import finalize_event_reference, make_event_reference
from app.services.whatsapp import send_event_to_staff

router = APIRouter()


@router.post(
    "", response_model=EventBookingCreateResponse, status_code=status.HTTP_201_CREATED
)
def create_event_booking(
    payload: EventBookingCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Demande d'événement (client public).

    Enregistre la demande ET la transmet au staff WhatsApp.
    L'échec WhatsApp n'annule jamais l'enregistrement.
    """
    with write_lock():
        # Upsert fiche client
        customer = upsert_customer_by_phone(
            db, payload.customer_phone, payload.customer_name, payload.customer_email
        )

        # Référence provisoire unique
        reference = make_event_reference()

        event = EventBooking(
            reference=reference,
            customer_id=customer.id,
            customer_name=payload.customer_name,
            customer_phone=payload.customer_phone,
            customer_email=payload.customer_email,
            event_type=payload.event_type,
            event_date=payload.event_date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            guest_count=payload.guest_count,
            location=payload.location,
            details=payload.details,
            space=payload.space,
            decoration_theme=payload.decoration_theme,
            decoration_colors=payload.decoration_colors,
            catering_formula=payload.catering_formula,
            options=",".join(payload.options),
            dietary_notes=payload.dietary_notes,
            budget_estimate=payload.budget_estimate,
        )

        db.add(event)
        db.flush()  # Génère l'ID autoincrement
        event.reference = finalize_event_reference(event.id)
        db.commit()
    db.refresh(event)

    # Notification WhatsApp (non bloquante pour l'enregistrement)
    _, _, whatsapp_url = send_event_to_staff(event)

    return EventBookingCreateResponse(event=event, whatsapp_url=whatsapp_url)


@router.get("", response_model=list[EventBookingOut])
def list_events(
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    status: str | None = Query(None),
):
    """Liste les événements (admin, avec filtres optionnels)."""
    query = db.query(EventBooking).order_by(EventBooking.event_date.desc())

    if date_from:
        query = query.filter(EventBooking.event_date >= date_from)
    if date_to:
        query = query.filter(EventBooking.event_date <= date_to)
    if status:
        query = query.filter(EventBooking.status == status)

    return query.all()


@router.get("/{event_id}", response_model=EventBookingOut)
def get_event(
    event_id: int,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Détail d'un événement (admin)."""
    event = db.query(EventBooking).filter(EventBooking.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    return event


@router.patch("/{event_id}", response_model=EventBookingOut)
def update_event(
    event_id: int,
    payload: EventBookingUpdate,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Met à jour un événement (admin) : devis, acompte, statut."""
    event = db.query(EventBooking).filter(EventBooking.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    # Horodatage devis/confirmation
    if payload.status == "quote" and not event.quote_sent_at:
        event.quote_sent_at = datetime.now(timezone.utc)
    if payload.status == "confirmed" and not event.confirmed_at:
        event.confirmed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(event)
    return event
