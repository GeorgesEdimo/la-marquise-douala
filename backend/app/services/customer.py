"""Service de gestion de la fiche client (consolidation par téléphone)."""

from sqlalchemy.orm import Session

from app.models.customer import Customer


def upsert_customer_by_phone(
    db: Session,
    phone: str,
    name: str,
    email: str | None = None,
) -> Customer:
    """
    Crée ou met à jour la fiche client par téléphone.

    Le téléphone est la clé d'identification : une même personne qui commande
    sous des noms/emails différents sera reconnue par son numéro.
    """
    customer = db.query(Customer).filter(Customer.phone == phone).first()

    if customer:
        # Mise à jour si le nom ou l'email ont changé
        if customer.full_name != name:
            customer.full_name = name
        if email and customer.email != email:
            customer.email = email
    else:
        # Création nouvelle fiche
        customer = Customer(phone=phone, full_name=name, email=email)
        db.add(customer)
        db.flush()  # Génère l'ID sans commit

    return customer


def increment_customer_stats(db: Session, customer: Customer, order_total: int) -> None:
    """Incrémente les compteurs de fidélité après commande honorée."""
    customer.total_orders += 1
    customer.total_spent += order_total
