from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List

from db import get_db
from models.expense import Expense
from models.revenue import Revenue
from schemas.profit import ProfitDay


router = APIRouter(prefix="/api", tags=["profits"])


@router.get("/profits", response_model=List[ProfitDay])
def get_profits_by_month(
    month: str = Query(..., description="YYYY-MM"),
    db: Session = Depends(get_db),
):
    """Return daily profit for the given month (YYYY-MM).

    Profit = Revenue.total - Expense.amount for each date that has either record.
    """
    try:
        dt = datetime.strptime(month, "%Y-%m")
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid month format, expected YYYY-MM")

    start = date(dt.year, dt.month, 1)
    if dt.month == 12:
        next_month = date(dt.year + 1, 1, 1)
    else:
        next_month = date(dt.year, dt.month + 1, 1)
    end = next_month - timedelta(days=1)

    revenues = db.query(Revenue).filter(
        Revenue.date >= start, Revenue.date <= end).all()
    expenses = db.query(Expense).filter(
        Expense.date >= start, Expense.date <= end).all()

    by_date = {}
    for r in revenues:
        by_date[r.date] = {
            "date": r.date,
            "revenue": float(r.total or 0.0),
            "expense": 0.0,
        }
    for e in expenses:
        entry = by_date.get(e.date)
        if not entry:
            entry = {"date": e.date, "revenue": 0.0, "expense": 0.0}
            by_date[e.date] = entry
        entry["expense"] = float(e.amount or 0.0)

    result: List[ProfitDay] = []
    for d in sorted(by_date.keys()):
        entry = by_date[d]
        profit = (entry["revenue"] or 0.0) - (entry["expense"] or 0.0)
        result.append(
            ProfitDay(date=d, revenue=entry["revenue"],
                      expense=entry["expense"], profit=profit)
        )
    return result
