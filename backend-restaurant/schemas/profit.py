from datetime import date
from pydantic import BaseModel


class ProfitDay(BaseModel):
    date: date
    revenue: float
    expense: float
    profit: float

    class Config:
        orm_mode = True
