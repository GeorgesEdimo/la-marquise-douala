"""
Passe le compte admin dans super_admin pour activer la rubrique Utilisateurs.

Usage (Windows, depuis le dossier backend/) :
    .venv\Scripts\python promote_admin.py

Ou avec le raccourci : double-clic sur promote_admin.bat.
"""

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.enums import UserRole
from app.models.user import User


def main():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if not user:
            print(f"✗ Aucun compte trouvé pour {settings.FIRST_ADMIN_EMAIL}")
            print(f"  Lance d'abord le seed : python -m app.seed")
            return

        if user.role == UserRole.SUPER_ADMIN:
            print(f"✓ {user.email} est déjà super_admin.")
            return

        old_role = user.role.value
        user.role = UserRole.SUPER_ADMIN
        db.commit()
        db.refresh(user)

        print(f"✓ {user.email} passé de '{old_role}' → 'super_admin'")
        print(f"  La rubrique 👥 Utilisateurs est maintenant accessible dans le dashboard.")
    except Exception as e:
        db.rollback()
        print(f"✗ Erreur : {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
