"""Construction des messages de reçus clients + génération QR code.

9 templates (3 par type × 3 étapes) :
    created   → « Demande reçue »
    confirmed → « Confirmation »
    completed → « Merci / Satisfait ? »

Le QR encode l'URL de la page publique /receipt/{reference} (reçu + formulaire de feedback).
"""

import io
import logging
import segno

from app.core.config import settings

logger = logging.getLogger(__name__)


# ── Types supportés ──────────────────────────────────────────────────────────

_KIND_LABELS = {"order": "commande", "reservation": "réservation", "event": "événement"}


# ── Messages ─────────────────────────────────────────────────────────────────


def _order_type_label(value: str) -> str:
    """Convertit une valeur de type commande en libellé lisible."""
    labels = {"dine_in": "Sur place", "takeaway": "À emporter", "delivery": "Livraison"}
    return labels.get(value, value.replace("_", " "))


def _order_message(order, stage: str) -> str:
    items = "\n".join(
        f"  • {i.quantity}× {i.name} — {i.line_total} {settings.CURRENCY}"
        for i in order.items
    )
    order_type_value = order.order_type.value if hasattr(order.order_type, "value") else order.order_type
    payment_value = (
        order.payment_method.value if hasattr(order.payment_method, "value") else order.payment_method
    )
    common = f"📋 *Référence :* {order.reference}\n👤 {order.customer_name}\n📞 {order.customer_phone}"
    if stage == "created":
        return (
            f"🙏 *Merci pour votre commande !*\n\n{common}\n\n"
            f"📦 {_order_type_label(order_type_value)}\n"
            f"{items}\n\n"
            f"💰 *Total : {order.total} {settings.CURRENCY}*\n\n"
            f"✅ Notre équipe va la traiter. Vous serez prévenu de l'avancement."
        )
    if stage == "confirmed":
        return (
            f"✅ *Votre commande est confirmée !*\n\n{common}\n\n"
            f"💰 *Total : {order.total} {settings.CURRENCY}*\n"
            f"💳 Paiement : {payment_value}\n\n"
            f"👨‍🍳 Préparation en cours…"
        )
    # completed
    return (
        f"🎉 *Commande terminée !*\n\n{common}\n\n"
        f"Merci pour votre confiance.\n"
        f"Scannez le QR ou visitez le lien pour nous donner votre avis :"
    )


def _reservation_message(reservation, stage: str) -> str:
    date_str = reservation.reservation_date.strftime("%d/%m/%Y")
    time_str = reservation.reservation_time.strftime("%H:%M")
    common = f"📋 *Référence :* {reservation.reference}\n👤 {reservation.customer_name}\n📞 {reservation.customer_phone}"
    if stage == "created":
        return (
            f"🙏 *Demande de réservation reçue !*\n\n{common}\n\n"
            f"🗓️ {date_str} à {time_str}\n👥 {reservation.party_size} couverts\n"
        )
    if stage == "confirmed":
        return (
            f"✅ *Réservation confirmée !*\n\n{common}\n\n"
            f"🗓️ {date_str} à {time_str}\n👥 {reservation.party_size} couverts\n"
            f"🪑 Table : {reservation.table_number or 'à confirmer'}\n\n"
            f"À bientôt chez La Marquise !"
        )
    return (
        f"🎉 *Merci pour votre venue !*\n\n{common}\n\n"
        f"Nous espérons avoir été à la hauteur.\n"
        f"Scannez le QR ou visitez le lien pour nous donner votre avis :"
    )


def _event_message(event, stage: str) -> str:
    date_str = event.event_date.strftime("%d/%m/%Y")
    time_str = event.start_time.strftime("%H:%M")
    common = f"📋 *Référence :* {event.reference}\n👤 {event.customer_name}\n📞 {event.customer_phone}"
    if stage == "created":
        return (
            f"🙏 *Demande d'événement reçue !*\n\n{common}\n\n"
            f"🎊 Type : {event.event_type}\n🗓️ {date_str} à {time_str}\n👥 {event.guest_count} invités\n\n"
            f"Notre équipe revient vers vous avec un devis."
        )
    if stage == "confirmed":
        return (
            f"✅ *Événement confirmé !*\n\n{common}\n\n"
            f"🎊 {event.event_type}\n🗓️ {date_str} à {time_str}\n👥 {event.guest_count} invités\n"
        )
    return (
        f"🎉 *Événement terminé !*\n\n{common}\n\n"
        f"Merci de votre confiance pour {event.event_type}.\n"
        f"Scannez le QR ou visitez le lien pour nous donner votre avis :"
    )


_BUILDERS = {
    "order": _order_message,
    "reservation": _reservation_message,
    "event": _event_message,
}


# ── API publique ─────────────────────────────────────────────────────────────


def build_receipt_message(entity, stage: str) -> str:
    """Construit le message WhatsApp de reçu pour l'étape donnée."""
    kind = entity.__class__.__name__
    if kind == "Order":
        k = "order"
    elif kind == "Reservation":
        k = "reservation"
    elif kind == "EventBooking":
        k = "event"
    else:
        raise ValueError(f"Type d'entité non supporté : {kind}")

    builder = _BUILDERS[k]
    base_message = builder(entity, stage)

    # Ajoute le lien du reçu/feedback à chaque message (étape created et confirmed
    # le client peut déjà consulter son reçu ; à la complétion c'est le CTA principal).
    receipt_url = f"{settings.SITE_URL}/receipt/{entity.reference}"
    if stage != "completed":
        base_message += f"\n\n🔗 Reçu : {receipt_url}"
    else:
        base_message += f"\n\n🔗 {receipt_url}"

    return base_message


def generate_qr_png(receipt_url: str) -> bytes:
    """Génère un QR code PNG pour l'URL de reçu."""
    qr = segno.make(receipt_url, error="M")
    buf = io.BytesIO()
    qr.save(buf, kind="png", scale=6, dark="#1a1a1a", light="#ffffff")
    return buf.getvalue()


def get_receipt_url(reference: str) -> str:
    return f"{settings.SITE_URL}/receipt/{reference}"
