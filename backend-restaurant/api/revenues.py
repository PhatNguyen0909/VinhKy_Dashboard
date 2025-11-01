from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db import get_db
from schemas.revenue import RevenueCreate, RevenueRead, RevenueUpdate
from repositories import revenue_repo
from services import revenue_service

router = APIRouter(prefix="/api", tags=["revenues"])


@router.post("/revenues", response_model=RevenueRead)
def create_revenue(payload: RevenueCreate, db: Session = Depends(get_db)):
    existing = revenue_repo.get_revenue_by_date(db, payload.date)
    if existing:
        raise HTTPException(
            status_code=400, detail="Revenue for this date already exists")
    return revenue_service.create_revenue(db, dt=payload.date, chuyen_khoan=payload.chuyen_khoan or 0.0, tien_mat=payload.tien_mat or 0.0)


@router.get("/revenues", response_model=List[RevenueRead])
def list_revenues(db: Session = Depends(get_db)):
    return revenue_repo.list_revenues(db)


@router.get("/revenues/{revenue_id}", response_model=RevenueRead)
def get_revenue(revenue_id: int, db: Session = Depends(get_db)):
    rev = revenue_repo.get_revenue(db, revenue_id)
    if not rev:
        raise HTTPException(status_code=404, detail="Revenue not found")
    return rev


@router.patch("/revenues/{revenue_id}", response_model=RevenueRead)
def patch_revenue(revenue_id: int, payload: RevenueUpdate, db: Session = Depends(get_db)):
    updates = payload.dict(exclude_unset=True)
    updated = revenue_service.patch_revenue(db, revenue_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Revenue not found")
    return updated
