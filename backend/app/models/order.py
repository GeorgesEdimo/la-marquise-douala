"""Commandes (sur place, à emporter, livraison) et leurs lignes."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import (
    OrderChannel,
    OrderStatus,
    OrderType,
    PaymentMethod,
    PaymentStatus,
)
from app.models.mixins import TimestampMixin


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Référence courte communiquée au client sur WhatsApp (ex. « YD-000128 »).
    reference: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)

    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    customer = relationship("Customer", back_populates="orders")

    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(30), index=True, nullable=False)

    order_type: Mapped[OrderType] = mapped_column(
        Enum(OrderType, native_enum=False, length=20), index=True, nullable=False
    )
    channel: Mapped[OrderChannel] = mapped_column(
        Enum(OrderChannel, native_enum=False, length=20),
        default=OrderChannel.WEB,
        nullable=False,
    )
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, native_enum=False, length=20),
        default=OrderStatus.NEW,
        index=True,
        nullable=False,
    )

    # ── Livraison (renseigné uniquement si order_type == DELIVERY) ──
    delivery_address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    delivery_district: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    delivery_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    delivery_fee: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # Nom du livreur assigné depuis le dashboard.
    courier_name: Mapped[str] = mapped_column(String(120), default="", nullable=False)

    # ── Sur place ──
    table_number: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # ── Montants en FCFA (figés à la création, indépendants des évolutions de la carte) ──
    subtotal: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    discount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, native_enum=False, length=20),
        default=PaymentMethod.CASH,
        nullable=False,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=20),
        default=PaymentStatus.PENDING,
        nullable=False,
    )

    customer_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    internal_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # ── Suivi WhatsApp ──
    whatsapp_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    whatsapp_error: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # ── Jalons temporels (alimentent les statistiques de délai) ──
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ready_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_reason: Mapped[str] = mapped_column(Text, default="", nullable=False)

    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False
    )
    order = relationship("Order", back_populates="items")

    # Référence au plat ; SET NULL pour ne pas perdre l'historique si le plat est supprimé.
    menu_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True
    )
    # Nom et prix recopiés : une commande passée garde son libellé et son tarif d'origine.
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    notes: Mapped[str] = mapped_column(String(300), default="", nullable=False)

    @property
    def line_total(self) -> int:
        return self.unit_price * self.quantity
