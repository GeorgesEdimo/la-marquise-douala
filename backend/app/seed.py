"""Script de seed : crée l'admin initial + menu de démo depuis le front.

Usage:
    cd backend
    python -m app.seed
"""

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.migrations import run_migrations
from app.core.security import hash_password
from app.models.enums import MenuCategory, UserRole
# Importer TOUS les modèles pour que create_all les connaisse
from app.models.customer import Customer  # noqa: F401
from app.models.event import EventBooking  # noqa: F401
from app.models.feedback import Feedback  # noqa: F401
from app.models.gallery import GalleryImage  # noqa: F401
from app.models.menu import MenuItem  # noqa: F401
from app.models.order import Order  # noqa: F401
from app.models.reservation import Reservation  # noqa: F401
from app.models.user import User  # noqa: F401

# Menu La Marquise — extraite des données officielles
DEMO_MENU_ITEMS = [
    {
        "slug": "foie-gras-marquise",
        "name": "Foie Gras",
        "description": "Foie gras poêlé, coulis de fruits rouges et pain brioché toasté.",
        "price": 12000,
        "category": MenuCategory.ENTREE,
        "badge": "Chef",
    },
    {
        "slug": "mozzarella-fraiche",
        "name": "Mozzarella Fraîche",
        "description": "Mozzarella fraîche avec tomates anciennes, basilic frais et huile d'olive.",
        "price": 7500,
        "category": MenuCategory.ENTREE,
    },
    {
        "slug": "bol-de-poke",
        "name": "Bol de Poké St-Jacques, Thon & Saumon Fumé",
        "description": "Bowl composé de saint-jacques, thon frais et saumon fumé, sur lit de riz vinaigré.",
        "price": 14000,
        "category": MenuCategory.ENTREE,
        "badge": "Signature",
    },
    {
        "slug": "aarayes-kafta",
        "name": "Aarayes Kafta",
        "description": "Pain pita croustillant garni de kafta grillé, légumes frais et sauce maison.",
        "price": 8000,
        "category": MenuCategory.ENTREE,
        "badge": "Populaire",
    },
    {
        "slug": "salade-marquise",
        "name": "Salade La Marquise",
        "description": "Mesclun, noix, mangue, crevettes grillées et vinaigrette à la mangue-gingembre.",
        "price": 7500,
        "category": MenuCategory.SALADE,
    },
    {
        "slug": "caesar-marquise",
        "name": "Caesar Royale",
        "description": "Romaine croquante, parmesan, croûtons dorés et sauce Caesar maison.",
        "price": 7000,
        "category": MenuCategory.SALADE,
    },
    {
        "slug": "filet-mignon",
        "name": "Filet Mignon",
        "description": "Filet mignon de bœuf grillé à la perfection, sauce au poivre et légumes de saison.",
        "price": 16000,
        "category": MenuCategory.PLAT,
        "badge": "Chef",
    },
    {
        "slug": "filet-de-bar",
        "name": "Filet de Bar",
        "description": "Filet de bar rôti, beurre blanc aux herbes, purée de patates douces et asperges.",
        "price": 14000,
        "category": MenuCategory.PLAT,
    },
    {
        "slug": "saumon-poireaux",
        "name": "Saumon Poireaux & Légumes",
        "description": "Pavé de saumon grillé, poireaux fondants et légumes rôtis au four.",
        "price": 13000,
        "category": MenuCategory.PLAT,
        "badge": "Signature",
    },
    {
        "slug": "riz-indien-capitaine",
        "name": "Riz Indien au Curry avec Filet de Capitaine",
        "description": "Riz indien parfumé au curry, filet de capitaine à la poêle, sauce crémeuse.",
        "price": 12000,
        "category": MenuCategory.PLAT,
    },
    {
        "slug": "pizza-marquise",
        "name": "Pizza La Marquise",
        "description": "Pizza signature : crust fine, mozzarella, jambon, champignons, olive et sauce tomate maison.",
        "price": 9000,
        "category": MenuCategory.PLAT,
        "badge": "Signature",
    },
    {
        "slug": "chicken-wings",
        "name": "Chicken Wings & Fries",
        "description": "Ailes de poulet marinées au four, servies avec frites maison et sauce au choix.",
        "price": 7500,
        "category": MenuCategory.BURGER,
        "badge": "Populaire",
    },
    {
        "slug": "chicken-strips",
        "name": "Chicken Strips",
        "description": "Bandes de poulet pané croustillant, servies avec frites et sauce dipping au choix.",
        "price": 6500,
        "category": MenuCategory.BURGER,
    },
    {
        "slug": "saumon-maki",
        "name": "Saumon Maki",
        "description": "Makis au saumon frais, avocat et concombre, avec sauce soja et wasabi.",
        "price": 8500,
        "category": MenuCategory.BURGER,
    },
    {
        "slug": "burger-marquise",
        "name": "Burger La Marquise",
        "description": "Double steak haché, cheddar fondant, bacon, laitue, tomate et sauce secrète.",
        "price": 8500,
        "category": MenuCategory.BURGER,
    },
    {
        "slug": "frites-maison",
        "name": "Frites Maison",
        "description": "Frites de pommes de terre à l'huile d'olive, sel de mer.",
        "price": 3500,
        "category": MenuCategory.SNACK,
    },
    {
        "slug": "savarin",
        "name": "Savarin",
        "description": "Brioche imbibée au sirop parfumé, crème fouettée vanillée et fruits de saison.",
        "price": 5500,
        "category": MenuCategory.DESSERT,
        "badge": "Gourmand",
    },
    {
        "slug": "chocolate-cake",
        "name": "Moelleux Chocolat Fondant",
        "description": "Moelleux au chocolat noir, cœur coulant et glace vanille.",
        "price": 5000,
        "category": MenuCategory.DESSERT,
    },
    {
        "slug": "mojito",
        "name": "Mojito Classique",
        "description": "Rhum blanc, menthe fraîche, citron vert, sucre de canne, soda.",
        "price": 7500,
        "category": MenuCategory.COCKTAIL,
        "badge": "Signature",
    },
    {
        "slug": "cocktail-strawberry",
        "name": "Cocktail Strawberry Sans Alcool",
        "description": "Fraise fraîche, citron, sirop de sucre, eau gazeuse.",
        "price": 5000,
        "category": MenuCategory.COCKTAIL,
    },
    {
        "slug": "special-smoothies",
        "name": "Special Smoothies",
        "description": "Fruits de saison, lait d'amande, miel, glace.",
        "price": 5500,
        "category": MenuCategory.COCKTAIL,
    },
    {
        "slug": "jus-ananas",
        "name": "Jus d'Ananas Frais",
        "description": "Jus d'ananas pressé minute.",
        "price": 3000,
        "category": MenuCategory.BOISSON,
    },
    {
        "slug": "castel",
        "name": "Castel / Beaufort / 33 Export",
        "description": "Bière locale — 33cl.",
        "price": 5000,
        "category": MenuCategory.BOISSON,
    },
]


def seed_admin(db):
    """Crée le compte administrateur initial (super_admin pour gérer les comptes)."""
    existing_admin = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
    if existing_admin:
        print(f"✓ Admin {settings.FIRST_ADMIN_EMAIL} existe déjà.")
        return

    admin = User(
        email=settings.FIRST_ADMIN_EMAIL,
        hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
        full_name=settings.FIRST_ADMIN_NAME,
        role=UserRole.SUPER_ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print(f"✓ Admin créé : {settings.FIRST_ADMIN_EMAIL} (super_admin)")


def seed_menu(db):
    """Crée le menu de démo."""
    existing_count = db.query(MenuItem).count()
    if existing_count > 0:
        print(f"✓ Menu existe déjà ({existing_count} items).")
        return

    for item_data in DEMO_MENU_ITEMS:
        item = MenuItem(**item_data)
        db.add(item)

    db.commit()
    print(f"✓ Menu de démo créé ({len(DEMO_MENU_ITEMS)} items).")


def main():
    """Point d'entrée du script de seed."""
    print("─" * 60)
    print("La Marquise — Script de seed")
    print("─" * 60)

    # Crée les tables si la base est neuve (idempotent sinon).
    print("→ Vérification des tables…")
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    print("✓ Tables prêtes.")

    db = SessionLocal()
    try:
        seed_admin(db)
        seed_menu(db)
        print("─" * 60)
        print("✓ Seed terminé avec succès.")
    except Exception as e:
        print(f"✗ Erreur lors du seed : {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
