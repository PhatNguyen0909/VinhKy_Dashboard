from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from db import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, default=0.0)
    date = Column(Date, unique=True, index=True)

    items = relationship(
        "ExpenseItem", back_populates="expense", cascade="all, delete-orphan")


class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=True)

    # numeric fields for different items (default 0.0)
    ha = Column(Float, default=0.0)
    ga = Column(Float, default=0.0)
    gao = Column(Float, default=0.0)
    cho = Column(Float, default=0.0)
    kho = Column(Float, default=0.0)
    gas = Column(Float, default=0.0)
    dau = Column(Float, default=0.0)
    trung = Column(Float, default=0.0)
    hop = Column(Float, default=0.0)
    luong = Column(Float, default=0.0)
    khac = Column(Float, default=0.0)

    expense = relationship("Expense", back_populates="items")
