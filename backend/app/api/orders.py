"""Router pour les commandes (sur place, à emporter, livraison)."""

from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db, write_lock
from app.deps import AdminUser
from app.models.enums import OrderType
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem
from app.schemas.order import (
    OrderCreate,
    OrderCreateResponse,
    OrderOut,
    OrderUpdate,
)
from app.services.customer import increment_customer_stats, upsert_customer_by_phone
from app.services.reference import finalize_order_reference, make_order_reference
from app.services.whatsapp import send_order_to_staff

router = APIRouter()


@router.post("", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Crée une commande (client public).

    Enregistre la commande ET envoie au staff WhatsApp (Cloud API ou lien wa.me).
    L'échec WhatsApp n'annule jamais l'enregistrement.
    """
    # Valide les items contre le menu
    menu_item_ids = [item.menu_item_id for item in payload.items]
    menu_items_db = (
        db.query(MenuItem)
        .filter(MenuItem.id.in_(menu_item_ids), MenuItem.is_available == True)  # noqa: E712
        .all()
    )

    if len(menu_items_db) != len(menu_item_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more menu items not found or unavailable",
        )

    # Map ID → MenuItem
    menu_map = {item.id: item for item in menu_items_db}

    # Calcule subtotal (pur, sans écriture DB)
    subtotal = 0
    order_items = []
    for item_payload in payload.items:
        menu_item = menu_map[item_payload.menu_item_id]
        line_total = menu_item.price * item_payload.quantity
        subtotal += line_total

        order_items.append(
            OrderItem(
                menu_item_id=menu_item.id,
                name=menu_item.name,
                unit_price=menu_item.price,
                quantity=item_payload.quantity,
                notes=item_payload.notes,
            )
        )

    # Frais de livraison (calculés côté front ou fixe, pour l'instant 0)
    delivery_fee = 0
    if payload.order_type == OrderType.DELIVERY:
        # TODO : calculer selon quartier, distance, etc.
        delivery_fee = 0

    total = subtotal - 0 + delivery_fee  # discount à implémenter plus tard

    # Référence provisoire unique (remplacée par l'ID après flush)
    reference = make_order_reference()

    with write_lock():
        # Upsert fiche client
        customer = upsert_customer_by_phone(
            db, payload.customer_phone, payload.customer_name
        )

        # Crée la commande
        order = Order(
            reference=reference,
            customer_id=customer.id,
            customer_name=payload.customer_name,
            customer_phone=payload.customer_phone,
            order_type=payload.order_type,
            channel=payload.channel,
            delivery_address=payload.delivery_address,
            delivery_district=payload.delivery_district,
            delivery_notes=payload.delivery_notes,
            delivery_fee=delivery_fee,
            table_number=payload.table_number,
            subtotal=subtotal,
            total=total,
            payment_method=payload.payment_method,
            customer_notes=payload.customer_notes,
        )

        db.add(order)
        db.flush()  # Génère l'ID autoincrement
        order.reference = finalize_order_reference(order.id)  # Référence définitive unique

        for item in order_items:
            item.order_id = order.id
            db.add(item)

        db.commit()
        db.refresh(order)

        # Envoi WhatsApp (non bloquant pour l'enregistrement)
        success, error_msg, whatsapp_url = send_order_to_staff(order)
        order.whatsapp_sent = success and whatsapp_url is None  # True si Cloud API réussie
        order.whatsapp_error = error_msg
        db.commit()
        db.refresh(order)

    return OrderCreateResponse(order=order, whatsapp_url=whatsapp_url)


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    status: str | None = Query(None),
    order_type: OrderType | None = Query(None),
):
    """Liste les commandes (admin, avec filtres optionnels)."""
    query = db.query(Order).order_by(Order.created_at.desc())

    if date_from:
        query = query.filter(Order.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(Order.created_at <= datetime.combine(date_to, datetime.max.time()))
    if status:
        query = query.filter(Order.status == status)
    if order_type:
        query = query.filter(Order.order_type == order_type)

    return query.all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Détail d'une commande (admin)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return order


@router.patch("/{order_id}", response_model=OrderOut)
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Met à jour une commande (admin) : statut, livreur, paiement."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(order, field, value)

    # Horodatage des jalons
    if payload.status == "confirmed" and not order.confirmed_at:
        order.confirmed_at = datetime.now(timezone.utc)
    if payload.status == "ready" and not order.ready_at:
        order.ready_at = datetime.now(timezone.utc)
    if payload.status == "completed" and not order.completed_at:
        order.completed_at = datetime.now(timezone.utc)
        # Incrémente les compteurs client
        if order.customer_id:
            customer = db.query(order.customer).first()
            if customer:
                increment_customer_stats(db, customer, order.total)

    db.commit()
    db.refresh(order)
    return order
