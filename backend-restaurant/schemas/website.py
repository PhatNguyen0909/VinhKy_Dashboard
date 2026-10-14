from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CategoryIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)


class CategoryRead(BaseModel):
    id: int
    name: str
    sort_order: int = 0

    class Config:
        from_attributes = True
        orm_mode = True


class ProductIn(BaseModel):
    category_id: int
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    price: float = Field(0.0, ge=0)
    rating: float = Field(5.0, ge=0, le=5)
    is_best_seller: bool = False
    is_available: bool = True
    image: str = ""


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0, le=5)
    is_best_seller: Optional[bool] = None
    is_available: Optional[bool] = None
    image: Optional[str] = None


class ProductRead(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = ""
    price: float = 0.0
    rating: float = 5.0
    is_best_seller: bool = False
    is_available: bool = True
    image: Optional[str] = ""

    class Config:
        from_attributes = True
        orm_mode = True


class OrderItemIn(BaseModel):
    name: str
    price: float = Field(0.0, ge=0)
    quantity: int = Field(1, ge=1)


class OrderItemRead(OrderItemIn):
    id: int

    class Config:
        from_attributes = True
        orm_mode = True


class OrderIn(BaseModel):
    customer_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=6)
    address: str = Field(..., min_length=3)
    note: str = ""
    payment_method: str = Field("transfer", pattern="^(transfer|cod)$")
    payment_status: str = Field("unpaid", pattern="^(paid|unpaid)$")
    items: List[OrderItemIn] = Field(..., min_length=1)


class CustomerRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=8, max_length=20)
    email: str = ""
    password: str = Field(..., min_length=6, max_length=100)


class CustomerLogin(BaseModel):
    phone: str
    password: str


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[str] = None
    address: Optional[str] = None


class CustomerRead(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = ""
    address: Optional[str] = ""

    class Config:
        from_attributes = True
        orm_mode = True


class AuthResponse(BaseModel):
    token: str
    customer: CustomerRead


class OrderUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(new|preparing|done|cancelled)$")
    payment_status: Optional[str] = Field(None, pattern="^(paid|unpaid)$")


class OrderRead(BaseModel):
    id: int
    code: str
    customer_name: str
    phone: str
    address: Optional[str] = ""
    note: Optional[str] = ""
    payment_method: str
    payment_status: str
    status: str
    total: float
    created_at: datetime
    items: List[OrderItemRead] = []

    class Config:
        from_attributes = True
        orm_mode = True
