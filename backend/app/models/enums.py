"""Énumérations communes aux modèles et schémas."""

from enum import Enum


class UserRole(str, Enum):
    """
    Rôles utilisateurs, du plus au moins privilégié.

    SUPER_ADMIN : accès total, seul à pouvoir gérer les comptes.
    OWNER       : propriétaire, gère le contenu et consulte tout sauf les comptes.
    MANAGER     : gestionnaire de plateforme, opérationnel (commandes, réservations).
    ADMIN/STAFF : rôles historiques conservés pour les comptes déjà en base.
    """

    SUPER_ADMIN = "super_admin"
    OWNER = "owner"
    MANAGER = "manager"
    ADMIN = "admin"
    STAFF = "staff"


class ReservationStatus(str, Enum):
    """Statut d'une réservation de table."""

    PENDING = "pending"  # En attente de confirmation
    CONFIRMED = "confirmed"  # Confirmée
    SEATED = "seated"  # Client installé
    COMPLETED = "completed"  # Terminée
    CANCELLED = "cancelled"  # Annulée
    NO_SHOW = "no_show"  # Client absent


class EventStatus(str, Enum):
    """Statut d'une réservation d'événement."""

    QUOTE = "quote"  # Devis envoyé
    PENDING_DEPOSIT = "pending_deposit"  # Acompte attendu
    CONFIRMED = "confirmed"  # Confirmé (acompte reçu)
    IN_PROGRESS = "in_progress"  # Événement en cours
    COMPLETED = "completed"  # Terminé
    CANCELLED = "cancelled"  # Annulé


class OrderStatus(str, Enum):
    """Statut d'une commande."""

    NEW = "new"  # Nouvelle (vient d'arriver)
    CONFIRMED = "confirmed"  # Confirmée par le staff
    PREPARING = "preparing"  # En préparation
    READY = "ready"  # Prête
    DELIVERING = "delivering"  # En livraison
    DELIVERED = "delivered"  # Livrée
    COMPLETED = "completed"  # Terminée (payée + consommée ou reçue)
    CANCELLED = "cancelled"  # Annulée


class OrderChannel(str, Enum):
    """Canal d'origine de la commande."""

    PHONE = "phone"  # Téléphone
    WHATSAPP = "whatsapp"  # WhatsApp
    WALK_IN = "walk_in"  # Sur place
    WEB = "web"  # Formulaire web


class OrderType(str, Enum):
    """Type de commande."""

    DINE_IN = "dine_in"  # Sur place
    TAKEAWAY = "takeaway"  # À emporter
    DELIVERY = "delivery"  # Livraison


class PaymentMethod(str, Enum):
    """Méthode de paiement."""

    CASH = "cash"  # Espèces
    MOBILE_MONEY = "mobile_money"  # Mobile Money (MTN, Orange)
    CARD = "card"  # Carte bancaire
    TRANSFER = "transfer"  # Virement


class PaymentStatus(str, Enum):
    """Statut du paiement."""

    PENDING = "pending"  # En attente
    PARTIAL = "partial"  # Acompte reçu
    PAID = "paid"  # Payé intégralement
    REFUNDED = "refunded"  # Remboursé


class MenuCategory(str, Enum):
    """Catégories du menu."""

    ENTREE = "entree"
    SALADE = "salade"
    BURGER = "burger"
    PLAT = "plat"
    SNACK = "snack"
    DESSERT = "dessert"
    COCKTAIL = "cocktail"
    BOISSON = "boisson"


class GalleryCategory(str, Enum):
    """Catégories de la galerie."""

    INTERIEUR = "interieur"
    TERRASSE = "terrasse"
    PLATS = "plats"
    COCKTAILS = "cocktails"
    EVENEMENTS = "evenements"
