from datetime import date
from pydantic import BaseModel, Field
from typing import Optional


class ExpenseBase(BaseModel):
    date: date


class ExpenseCreate(ExpenseBase):
    amount: Optional[float] = 0.0


class ExpenseRead(ExpenseBase):
    id: int
    amount: float

    class Config:
        orm_mode = True


class ExpenseItemBase(BaseModel):
    date: date
    ha: Optional[float] = Field(0.0)
    ga: Optional[float] = Field(0.0)
    gao: Optional[float] = Field(0.0)
    cho: Optional[float] = Field(0.0)
    kho: Optional[float] = Field(0.0)
    gas: Optional[float] = Field(0.0)
    dau: Optional[float] = Field(0.0)
    trung: Optional[float] = Field(0.0)
    hop: Optional[float] = Field(0.0)
    luong: Optional[float] = Field(0.0)
    khac: Optional[float] = Field(0.0)


class ExpenseItemCreate(ExpenseItemBase):
    pass


class ExpenseItemRead(ExpenseItemBase):
    id: int
    expense_id: Optional[int]

    class Config:
        orm_mode = True
