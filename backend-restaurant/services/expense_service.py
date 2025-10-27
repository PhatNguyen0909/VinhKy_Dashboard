from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

from models.expense import Expense, ExpenseItem
from repositories import expense_repo


def _item_total(item: ExpenseItem) -> float:
    return (
        (item.ha or 0)
        + (item.ga or 0)
        + (item.gao or 0)
        + (item.cho or 0)
        + (item.kho or 0)
        + (item.gas or 0)
        + (item.dau or 0)
        + (item.trung or 0)
        + (item.hop or 0)
        + (item.luong or 0)
        + (item.khac or 0)
    )


def add_expense_item(db: Session, item_data: dict) -> ExpenseItem:
    # item_data expected to contain date and numeric fields
    dt = item_data.get("date")
    # find or create expense for the date
    expense = expense_repo.get_expense_by_date(db, dt)
    if not expense:
        expense = expense_repo.create_expense(db, dt, amount=0.0)

    item = ExpenseItem(**item_data)
    item.expense_id = expense.id
    # create item
    item = expense_repo.create_expense_item(db, item)

    # recompute total for that date to avoid drift
    items = db.query(ExpenseItem).filter(ExpenseItem.date == dt).all()
    total_sum = sum([_item_total(it) for it in items])
    expense_repo.update_expense_amount(db, expense, total_sum)
    return item
