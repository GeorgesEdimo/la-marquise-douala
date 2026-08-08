"""Router pour les clients (fidélisation)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import AdminUser
from app.models.customer import Customer
from app.schemas.customer import CustomerOut

router = APIRouter()


@router.get("", response_model=list[CustomerOut])
def list_customers(
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Liste les clients (admin)."""
    return db.query(Customer).order_by(Customer.total_spent.desc()).all()


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
    _admin: AdminUser,
):
    """Détail d'un client (admin) avec historique."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )
    return customer
