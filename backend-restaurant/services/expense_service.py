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


def update_expense_item(db: Session, item_id: int, updates: dict) -> Optional[ExpenseItem]:
    """
    Update an expense item by id with partial fields. If the date changes,
    move the item to the corresponding Expense record (create if missing)
    and recompute totals for affected dates.
    """
    item = expense_repo.get_expense_item(db, item_id)
    if not item:
        return None

    old_date = item.date

    # Allowed fields to update on ExpenseItem
    fields = [
        'date', 'ha', 'ga', 'gao', 'cho', 'kho', 'gas',
        'dau', 'trung', 'hop', 'luong', 'khac'
    ]

    # Apply scalar updates
    for key in fields:
        if key in updates and updates[key] is not None:
            setattr(item, key, updates[key])

    # If date changed, ensure expense relation is updated
    if 'date' in updates and updates['date'] is not None and updates['date'] != old_date:
        new_dt = updates['date']
        new_exp = expense_repo.get_expense_by_date(db, new_dt)
        if not new_exp:
            new_exp = expense_repo.create_expense(db, new_dt, amount=0.0)
        item.expense_id = new_exp.id

    # Persist item changes
    db.add(item)
    db.commit()
    db.refresh(item)

    # Recompute totals for affected dates (old and new)
    affected_dates = set()
    if old_date:
        affected_dates.add(old_date)
    if item.date:
        affected_dates.add(item.date)

    for dt in affected_dates:
        exp = expense_repo.get_expense_by_date(db, dt)
        if exp:
            items = db.query(ExpenseItem).filter(ExpenseItem.date == dt).all()
            total_sum = sum([_item_total(it) for it in items])
            expense_repo.update_expense_amount(db, exp, total_sum)

    return item
