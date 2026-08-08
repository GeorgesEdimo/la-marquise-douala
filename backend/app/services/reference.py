"""Génération de références uniques lisibles pour les commandes, réservations, événements.

Sous 100 requêtes simultanées, la génération par « count + 1 » crée des doublons.
On résout ça en deux étapes :
    1. Insérer avec une référence provisoire unique (UUID).
    2. Après flush (l'ID autoincrement est connu), remplacer par {PREFIX}{ID:06d}.

La clé autoincrement est garantie unique → la référence finale l'est aussi.
"""

import uuid

# --- Préfixes par type ---
_ORDER_PREFIX = "YD-"
_RESERVATION_PREFIX = "RS-"
_EVENT_PREFIX = "EV-"

# Longueur des placeholders — assez long pour être unique même sous concurrence extrême.
_UUID_LEN = 16


def _make_placeholder(prefix: str) -> str:
    """Retourne une référence provisoire unique pour un INSERT concurrent."""
    return f"{prefix}TMP-{uuid.uuid4().hex[:_UUID_LEN]}"


def make_order_reference() -> str:
    """Référence provisoire pour une commande (à remplacer par ID après flush)."""
    return _make_placeholder(_ORDER_PREFIX)


def make_reservation_reference() -> str:
    """Référence provisoire pour une réservation."""
    return _make_placeholder(_RESERVATION_PREFIX)


def make_event_reference() -> str:
    """Référence provisoire pour un événement."""
    return _make_placeholder(_EVENT_PREFIX)


def finalize_order_reference(order_id: int) -> str:
    """Référence définitive à partir de l'ID autoincrement."""
    return f"{_ORDER_PREFIX}{order_id:06d}"


def finalize_reservation_reference(reservation_id: int) -> str:
    return f"{_RESERVATION_PREFIX}{reservation_id:06d}"


def finalize_event_reference(event_id: int) -> str:
    return f"{_EVENT_PREFIX}{event_id:06d}"
