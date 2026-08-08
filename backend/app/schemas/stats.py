"""Schémas pour les statistiques (dashboard overview)."""

from pydantic import BaseModel


class StatsOverview(BaseModel):
    """KPIs du dashboard."""

    revenue_today: int
    orders_new: int
    orders_preparing: int
    orders_ready: int
    reservations_upcoming: int
    events_pending_deposit: int
