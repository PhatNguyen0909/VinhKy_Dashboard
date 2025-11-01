from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from models.revenue import Revenue


def get_revenue(db: Session, revenue_id: int) -> Optional[Revenue]:
    return db.query(Revenue).filter(Revenue.id == revenue_id).first()


def get_revenue_by_date(db: Session, dt: date) -> Optional[Revenue]:
    return db.query(Revenue).filter(Revenue.date == dt).first()


def list_revenues(db: Session) -> List[Revenue]:
    return db.query(Revenue).order_by(Revenue.date).all()


def create_revenue(db: Session, *, dt: date, chuyen_khoan: float = 0.0, tien_mat: float = 0.0) -> Revenue:
    total = (chuyen_khoan or 0.0) + (tien_mat or 0.0)
    rev = Revenue(date=dt, chuyen_khoan=chuyen_khoan or 0.0,
                  tien_mat=tien_mat or 0.0, total=total)
    db.add(rev)
    db.commit()
    db.refresh(rev)
    return rev


def update_revenue(db: Session, rev: Revenue, *, chuyen_khoan: Optional[float] = None, tien_mat: Optional[float] = None, dt: Optional[date] = None) -> Revenue:
    if dt is not None:
        rev.date = dt
    if chuyen_khoan is not None:
        rev.chuyen_khoan = chuyen_khoan
    if tien_mat is not None:
        rev.tien_mat = tien_mat
    rev.total = (rev.chuyen_khoan or 0.0) + (rev.tien_mat or 0.0)
    db.add(rev)
    db.commit()
    db.refresh(rev)
    return rev
