from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class RevenueBase(BaseModel):
    date: date
    chuyen_khoan: Optional[float] = Field(0.0)
    tien_mat: Optional[float] = Field(0.0)


class RevenueCreate(RevenueBase):
    pass


class RevenueRead(RevenueBase):
    id: int
    total: float

    class Config:
        orm_mode = True


class RevenueUpdate(BaseModel):
    # All fields optional for patch
    date: Optional[date] = None
    chuyen_khoan: Optional[float] = None
    tien_mat: Optional[float] = None
