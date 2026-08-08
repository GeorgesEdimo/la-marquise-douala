"""Réinitialise le mot de passe de l'administrateur.

Usage (depuis le dossier backend/) :
    python reset_admin.py
    python reset_admin.py --email admin@lamarquise-douala.com --password MonNouveauMotDePasse
"""

import argparse
import sys

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User


def main():
    parser = argparse.ArgumentParser(description="Réinitialise le mot de passe admin.")
    parser.add_argument("--email", default=settings.FIRST_ADMIN_EMAIL, help="Email du compte")
    parser.add_argument("--password", default=settings.FIRST_ADMIN_PASSWORD, help="Nouveau mot de passe")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == args.email).first()
        if not user:
            print(f"✗ Aucun compte trouvé pour {args.email}")
            sys.exit(1)

        user.hashed_password = hash_password(args.password)
        db.commit()
        print(f"✓ Mot de passe mis à jour pour {args.email}")
        print(f"  Email    : {args.email}")
        print(f"  Mot de passe : {args.password}")
    except Exception as e:
        db.rollback()
        print(f"✗ Erreur : {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
