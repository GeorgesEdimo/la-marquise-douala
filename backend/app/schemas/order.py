"""Schémas pour les commandes (sur place, à emporter, livraison)."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import (
    OrderChannel,
    OrderStatus,
    OrderType,
    PaymentMethod,
    PaymentStatus,
)


class OrderItemCreate(BaseModel):
    """Ligne de commande (référence plat + quantité)."""

    menu_item_id: int
    quantity: int = Field(..., ge=1, le=50)
    notes: str = ""


class OrderCreate(BaseModel):
    """Création d'une commande (client public)."""

    customer_name: str = Field(..., max_length=150)
    customer_phone: str = Field(..., max_length=30)
    order_type: OrderType
    channel: OrderChannel = OrderChannel.WEB

    # Livraison (obligatoire si order_type == DELIVERY)
    delivery_address: str = ""
    delivery_district: str = ""
    delivery_notes: str = ""

    # Sur place
    table_number: str | None = None

    customer_notes: str = ""
    payment_method: PaymentMethod = PaymentMethod.CASH

    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderUpdate(BaseModel):
    """Mise à jour depuis le dashboard (admin)."""

    status: OrderStatus | None = None
    courier_name: str | None = None
    table_number: str | None = None
    payment_status: PaymentStatus | None = None
    internal_notes: str | None = None


class OrderItemOut(BaseModel):
    """Ligne de commande renvoyée."""

    id: int
    menu_item_id: int | None
    name: str
    unit_price: int
    quantity: int
    notes: str
    line_total: int

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    """Commande renvoyée au client."""

    id: int
    reference: str
    customer_name: str
    customer_phone: str
    order_type: OrderType
    channel: OrderChannel
    status: OrderStatus

    delivery_address: str
    delivery_district: str
    delivery_notes: str
    delivery_fee: int
    courier_name: str

    table_number: str | None

    subtotal: int
    discount: int
    total: int

    payment_method: PaymentMethod
    payment_status: PaymentStatus

    customer_notes: str
    internal_notes: str

    whatsapp_sent: bool
    whatsapp_error: str

    confirmed_at: datetime | None
    ready_at: datetime | None
    completed_at: datetime | None
    cancelled_reason: str

    items: list[OrderItemOut]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderCreateResponse(BaseModel):
    """Réponse après création d'une commande (inclut lien WhatsApp en mode fallback)."""

    order: OrderOut
    whatsapp_url: str | None = None  # Lien wa.me en fallback, None si Cloud API
