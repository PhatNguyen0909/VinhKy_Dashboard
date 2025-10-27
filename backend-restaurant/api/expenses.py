from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from db import get_db
from schemas.expense import (
    ExpenseCreate,
    ExpenseRead,
    ExpenseItemCreate,
    ExpenseItemRead,
)
from repositories import expense_repo
from services import expense_service
from models.expense import ExpenseItem

router = APIRouter(prefix="/api", tags=["expenses"])


@router.post("/expenses", response_model=ExpenseRead)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    existing = expense_repo.get_expense_by_date(db, payload.date)
    if existing:
        raise HTTPException(
            status_code=400, detail="Expense for this date already exists")
    exp = expense_repo.create_expense(db, payload.date, payload.amount or 0.0)
    return exp


@router.get("/expenses", response_model=List[ExpenseRead])
def list_expenses(db: Session = Depends(get_db)):
    return expense_repo.list_expenses(db)


@router.get("/expenses/{expense_id}", response_model=ExpenseRead)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = expense_repo.get_expense(db, expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    return exp


@router.post("/expense_items", response_model=ExpenseItemRead)
def create_expense_item(payload: ExpenseItemCreate, db: Session = Depends(get_db)):
    # convert payload to dict and call service which will ensure expense exists and update totals
    item_data = payload.dict()
    saved = expense_service.add_expense_item(db, item_data)
    return saved


@router.get("/expense_items", response_model=List[ExpenseItemRead])
def list_items(db: Session = Depends(get_db)):
    return expense_repo.list_expense_items(db)


@router.get("/expense_items/{item_id}", response_model=ExpenseItemRead)
def get_item(item_id: int, db: Session = Depends(get_db)):
    it = expense_repo.get_expense_item(db, item_id)
    if not it:
        raise HTTPException(status_code=404, detail="Expense item not found")
    return it
