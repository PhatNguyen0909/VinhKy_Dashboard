from typing import Optional
from datetime import date
from sqlalchemy.orm import Session

from models.revenue import Revenue
from repositories import revenue_repo


def create_revenue(db: Session, *, dt: date, chuyen_khoan: float = 0.0, tien_mat: float = 0.0) -> Revenue:
    return revenue_repo.create_revenue(db, dt=dt, chuyen_khoan=chuyen_khoan, tien_mat=tien_mat)


def patch_revenue(db: Session, revenue_id: int, updates: dict) -> Optional[Revenue]:
    rev = revenue_repo.get_revenue(db, revenue_id)
    if not rev:
        return None
    return revenue_repo.update_revenue(
        db,
        rev,
        chuyen_khoan=updates.get("chuyen_khoan"),
        tien_mat=updates.get("tien_mat"),
        dt=updates.get("date"),
    )
