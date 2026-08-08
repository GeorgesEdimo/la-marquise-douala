"""Router pour les réservations de table."""

from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db, write_lock
from app.deps import AdminUser
from app.models.reservation import Reservation
from app.schemas.reservation import (
    ReservationCreate,
    ReservationCreateResponse,
    ReservationOut,
    ReservationUpdate,
)
from app.services.customer import upsert_customer_by_phone
from app.services.reference import finalize_reservation_reference, make_reservation_reference
from app.services.whatsapp import send_reservation_to_staff

router = APIRouter()


@router.post(
    "", response_model=ReservationCreateResponse, status_code=status.HTTP_201_CREATED
)
def create_reservation(
    payload: ReservationCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Demande de réservation (client public).

    Enregistre la réservation ET la transmet au staff WhatsApp.
    L'échec WhatsApp n'annule jamais l'enregistrement.
    """
    with write_lock():
        # Upsert fiche client
        customer = upsert_customer_by_phone(
            db, payload.customer_phone, payload.customer_name, payload.customer_email
        )

        # Référence provisoire unique
        reference = make_reservation_reference()

        reservation = Reservation(
            reference=reference,
            customer_id=customer.id,
            customer_name=payload.customer_name,
            customer_phone=payload.customer_phone,
            customer_email=payload.customer_email,
            reservation_date=payload.reservation_date,
            reservation_time=payload.reservation_time,
            party_size=payload.party_size,
            special_requests=payload.special_requests,
        )

        db.add(reservation)
        db.flush()  # Génère l'ID autoincrement
        reservation.reference = finalize_reservation_reference(reservation.id)
        db.commit()
    db.refresh(reservation)

    # Notification WhatsApp (non bloquante pour l'enregistrement)
    _, _, whatsapp_url = send_reservation_to_staff(reservation)

    return ReservationCreateResponse(reservation=reservation, whatsapp_url=whatsapp_url)


@router.get("", response_model=list[ReservationOut])
def list_reservations(
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    status: str | None = Query(None),
):
    """Liste les réservations (admin, avec filtres optionnels)."""
    query = db.query(Reservation).order_by(
        Reservation.reservation_date.desc(), Reservation.reservation_time.desc()
    )

    if date_from:
        query = query.filter(Reservation.reservation_date >= date_from)
    if date_to:
        query = query.filter(Reservation.reservation_date <= date_to)
    if status:
        query = query.filter(Reservation.status == status)

    return query.all()


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(
    reservation_id: int,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Détail d'une réservation (admin)."""
    reservation = (
        db.query(Reservation).filter(Reservation.id == reservation_id).first()
    )
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )
    return reservation


@router.patch("/{reservation_id}", response_model=ReservationOut)
def update_reservation(
    reservation_id: int,
    payload: ReservationUpdate,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Met à jour une réservation (admin) : statut, table, notes."""
    reservation = (
        db.query(Reservation).filter(Reservation.id == reservation_id).first()
    )
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(reservation, field, value)

    # Horodatage de confirmation
    if payload.status == "confirmed" and not reservation.confirmed_at:
        reservation.confirmed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(reservation)
    return reservation
