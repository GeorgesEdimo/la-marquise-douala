"""Router pour les statistiques (dashboard overview KPIs)."""

from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import AdminUser
from app.models.enums import EventStatus, OrderStatus, ReservationStatus
from app.models.event import EventBooking
from app.models.order import Order
from app.models.reservation import Reservation
from app.schemas.stats import StatsOverview

router = APIRouter()


@router.get("/overview", response_model=StatsOverview)
def get_stats_overview(
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """KPIs du dashboard : CA du jour, commandes en cours, réservations à venir."""
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    # CA du jour (commandes payées ou terminées)
    revenue_today = (
        db.query(func.sum(Order.total))
        .filter(
            Order.created_at >= today_start,
            Order.created_at <= today_end,
            Order.status.in_([OrderStatus.COMPLETED]),
        )
        .scalar()
        or 0
    )

    # Commandes par statut
    orders_new = (
        db.query(func.count(Order.id))
        .filter(Order.status == OrderStatus.NEW)
        .scalar()
        or 0
    )
    orders_preparing = (
        db.query(func.count(Order.id))
        .filter(Order.status == OrderStatus.PREPARING)
        .scalar()
        or 0
    )
    orders_ready = (
        db.query(func.count(Order.id))
        .filter(Order.status == OrderStatus.READY)
        .scalar()
        or 0
    )

    # Réservations à venir (confirmées ou en attente)
    reservations_upcoming = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.reservation_date >= today,
            Reservation.status.in_(
                [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]
            ),
        )
        .scalar()
        or 0
    )

    # Événements en attente d'acompte
    events_pending_deposit = (
        db.query(func.count(EventBooking.id))
        .filter(EventBooking.status == EventStatus.PENDING_DEPOSIT)
        .scalar()
        or 0
    )

    return StatsOverview(
        revenue_today=revenue_today,
        orders_new=orders_new,
        orders_preparing=orders_preparing,
        orders_ready=orders_ready,
        reservations_upcoming=reservations_upcoming,
        events_pending_deposit=events_pending_deposit,
    )
