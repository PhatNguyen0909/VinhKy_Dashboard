from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional

from models.expense import Expense, ExpenseItem


def get_expense_by_date(db: Session, dt: date) -> Optional[Expense]:
    return db.query(Expense).filter(Expense.date == dt).first()


def get_expense(db: Session, expense_id: int) -> Optional[Expense]:
    return db.query(Expense).filter(Expense.id == expense_id).first()


def list_expenses(db: Session) -> List[Expense]:
    return db.query(Expense).order_by(Expense.date).all()


def create_expense(db: Session, dt: date, amount: float = 0.0) -> Expense:
    exp = Expense(date=dt, amount=amount)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


def update_expense_amount(db: Session, expense: Expense, amount: float) -> Expense:
    expense.amount = amount
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def create_expense_item(db: Session, item: ExpenseItem) -> ExpenseItem:
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_expense_item(db: Session, item_id: int) -> Optional[ExpenseItem]:
    return db.query(ExpenseItem).filter(ExpenseItem.id == item_id).first()


def list_expense_items(db: Session) -> List[ExpenseItem]:
    return db.query(ExpenseItem).order_by(ExpenseItem.date).all()
