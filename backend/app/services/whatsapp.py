"""Service WhatsApp : envoi des demandes au staff (Cloud API Meta ou fallback wa.me)."""

from urllib.parse import quote

import httpx

from app.core.config import settings
from app.models.event import EventBooking
from app.models.order import Order
from app.models.reservation import Reservation


def build_order_message(order: Order) -> str:
    """Construit le message WhatsApp pour une commande."""
    lines = [
        f"🛎️ **Nouvelle commande {order.reference}**",
        f"",
        f"👤 {order.customer_name}",
        f"📞 {order.customer_phone}",
        f"📦 Type : {_order_type_label(order.order_type.value)}",
        f"",
    ]

    if order.order_type.value == "delivery":
        lines.extend(
            [
                f"🚚 **Livraison**",
                f"Adresse : {order.delivery_address}",
                f"Quartier : {order.delivery_district}",
                f"Frais : {order.delivery_fee} {settings.CURRENCY}",
                f"",
            ]
        )

    if order.table_number:
        lines.append(f"🪑 Table : {order.table_number}")
        lines.append("")

    lines.append("📋 **Articles** :")
    for item in order.items:
        lines.append(f"• {item.quantity}x {item.name} — {item.line_total} {settings.CURRENCY}")
        if item.notes:
            lines.append(f"  _{item.notes}_")

    lines.extend(
        [
            f"",
            f"💰 **Total : {order.total} {settings.CURRENCY}**",
            f"💳 Paiement : {_payment_method_label(order.payment_method.value)}",
        ]
    )

    if order.customer_notes:
        lines.append(f"")
        lines.append(f"📝 Note client : {order.customer_notes}")

    return "\n".join(lines)


def build_reservation_message(reservation: Reservation) -> str:
    """Construit le message WhatsApp pour une réservation de table."""
    lines = [
        f"📅 **Nouvelle réservation {reservation.reference}**",
        "",
        f"👤 {reservation.customer_name}",
        f"📞 {reservation.customer_phone}",
    ]

    if reservation.customer_email:
        lines.append(f"✉️ {reservation.customer_email}")

    lines.extend(
        [
            "",
            f"🗓️ Date : {reservation.reservation_date.strftime('%d/%m/%Y')}",
            f"🕐 Heure : {reservation.reservation_time.strftime('%H:%M')}",
            f"👥 Couverts : {reservation.party_size}",
        ]
    )

    if reservation.special_requests:
        lines.extend(["", f"📝 Demande spéciale : {reservation.special_requests}"])

    return "\n".join(lines)


def build_event_message(event: EventBooking) -> str:
    """Construit le message WhatsApp pour une demande d'événement."""
    lines = [
        f"🎉 **Nouvelle demande d'événement {event.reference}**",
        "",
        f"👤 {event.customer_name}",
        f"📞 {event.customer_phone}",
    ]

    if event.customer_email:
        lines.append(f"✉️ {event.customer_email}")

    lines.extend(
        [
            "",
            f"🎊 Type : {event.event_type}",
            f"🗓️ Date : {event.event_date.strftime('%d/%m/%Y')}",
            f"🕐 Début : {event.start_time.strftime('%H:%M')}",
        ]
    )

    if event.end_time:
        lines.append(f"🕐 Fin : {event.end_time.strftime('%H:%M')}")

    lines.append(f"👥 Invités : {event.guest_count}")

    if event.space:
        lines.append(f"🏛️ Espace : {_space_label(event.space)}")
    if event.location:
        lines.append(f"📍 Lieu : {event.location}")
    if event.catering_formula:
        lines.append(f"🍽️ Formule : {_catering_label(event.catering_formula)}")

    if event.decoration_theme or event.decoration_colors:
        lines.append("")
        lines.append("🎨 **Décoration**")
        if event.decoration_theme:
            lines.append(f"Thème : {event.decoration_theme}")
        if event.decoration_colors:
            lines.append(f"Couleurs : {event.decoration_colors}")

    if event.options:
        lines.extend(["", "✨ **Prestations**"])
        for option in event.options.split(","):
            if option.strip():
                lines.append(f"• {option.strip()}")

    if event.dietary_notes:
        lines.extend(["", f"🥗 Régimes / allergies : {event.dietary_notes}"])

    if event.budget_estimate:
        lines.append(f"💰 Budget indicatif : {event.budget_estimate} {settings.CURRENCY}")

    if event.details:
        lines.extend(["", f"📝 Détails : {event.details}"])

    return "\n".join(lines)


def _space_label(space: str) -> str:
    labels = {
        "salle-principale": "Salle principale",
        "terrasse": "Terrasse",
        "jardin": "Jardin",
        "lounge": "Espace lounge",
        "privatisation-totale": "Privatisation totale",
        "chez-le-client": "Chez le client (traiteur)",
    }
    return labels.get(space, space)


def _catering_label(formula: str) -> str:
    labels = {
        "cocktail-dinatoire": "Cocktail dînatoire",
        "buffet": "Buffet",
        "service-table": "Service à table",
        "boissons-seules": "Boissons uniquement",
        "a-definir": "À définir",
    }
    return labels.get(formula, formula)


def send_order_to_staff(order: Order) -> tuple[bool, str, str | None]:
    """
    Envoie la commande au staff WhatsApp.

    Returns:
        (success, error_message, whatsapp_url_fallback)
        - success: True si envoyé avec succès (Cloud API) ou si fallback généré.
        - error_message: message d'erreur si échec Cloud API, vide sinon.
        - whatsapp_url_fallback: lien wa.me si fallback, None si Cloud API réussie.
    """
    return _dispatch(build_order_message(order))


def send_reservation_to_staff(reservation: Reservation) -> tuple[bool, str, str | None]:
    """Envoie la réservation au staff WhatsApp (même contrat que send_order_to_staff)."""
    return _dispatch(build_reservation_message(reservation))


def send_event_to_staff(event: EventBooking) -> tuple[bool, str, str | None]:
    """Envoie la demande d'événement au staff WhatsApp (même contrat)."""
    return _dispatch(build_event_message(event))


def send_reply_to_customer(phone: str, message: str) -> tuple[bool, str, str | None]:
    """
    Envoie une réponse du staff vers le client.

    Même contrat que les autres envois : en mode fallback le lien wa.me pointe
    vers le numéro du client, prêt à être ouvert depuis le dashboard.
    """
    return _dispatch(message, recipient=_normalize_phone(phone))


def _normalize_phone(phone: str) -> str:
    """wa.me n'accepte que les chiffres : on retire +, espaces et séparateurs."""
    return "".join(char for char in phone if char.isdigit())


def _dispatch(message: str, recipient: str | None = None) -> tuple[bool, str, str | None]:
    """Route le message vers la Cloud API si configurée, sinon génère un lien wa.me."""
    target = recipient or settings.WHATSAPP_STAFF_NUMBER
    if settings.whatsapp_cloud_api_enabled:
        return _send_via_cloud_api(message, target)
    return _generate_wa_me_link(message, target)


def _send_via_cloud_api(message: str, recipient: str) -> tuple[bool, str, str | None]:
    """Envoie via Cloud API Meta."""
    url = (
        f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/"
        f"{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    )
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "text",
        "text": {"body": message},
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=10.0)
        response.raise_for_status()
        return (True, "", None)
    except httpx.HTTPError as e:
        error_msg = f"Cloud API error: {e}"
        return (False, error_msg, None)


def _generate_wa_me_link(message: str, recipient: str) -> tuple[bool, str, str | None]:
    """Génère un lien wa.me pré-rempli."""
    encoded_message = quote(message)
    url = f"https://wa.me/{recipient}?text={encoded_message}"
    return (True, "", url)


def _order_type_label(order_type: str) -> str:
    labels = {
        "dine_in": "Sur place",
        "takeaway": "À emporter",
        "delivery": "Livraison",
    }
    return labels.get(order_type, order_type)


def _payment_method_label(method: str) -> str:
    labels = {
        "cash": "Espèces",
        "mobile_money": "Mobile Money",
        "card": "Carte bancaire",
        "transfer": "Virement",
    }
    return labels.get(method, method)
