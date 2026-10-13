from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models.website import Category, Order, OrderItem, Product
from schemas.website import (
    CategoryIn,
    CategoryRead,
    OrderIn,
    OrderRead,
    OrderUpdate,
    ProductIn,
    ProductRead,
    ProductUpdate,
)

router = APIRouter(prefix="/api", tags=["website"])


@router.get("/categories", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.sort_order, Category.id).all()


@router.post("/categories", response_model=CategoryRead)
def create_category(payload: CategoryIn, db: Session = Depends(get_db)):
    last = db.query(Category).order_by(Category.sort_order.desc()).first()
    category = Category(
        name=payload.name.strip(), sort_order=(last.sort_order + 1) if last else 0
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/categories/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, payload: CategoryIn, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name = payload.name.strip()
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"ok": True}


def _require_category(db: Session, category_id: int):
    if not db.get(Category, category_id):
        raise HTTPException(status_code=400, detail="Category not found")


@router.get("/products", response_model=List[ProductRead])
def list_products(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    return query.order_by(Product.id).all()


@router.post("/products", response_model=ProductRead)
def create_product(payload: ProductIn, db: Session = Depends(get_db)):
    _require_category(db, payload.category_id)
    product = Product(**payload.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = payload.dict(exclude_unset=True)
    if updates.get("category_id") is not None:
        _require_category(db, updates["category_id"])
    for key, value in updates.items():
        if value is not None:
            setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"ok": True}


@router.post("/orders", response_model=OrderRead)
def create_order(payload: OrderIn, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    order = Order(
        code="TMP",
        customer_name=payload.customer_name.strip(),
        phone=payload.phone.strip(),
        address=payload.address.strip(),
        note=payload.note.strip(),
        payment_method=payload.payment_method,
        payment_status=payload.payment_status,
        total=sum(item.price * item.quantity for item in payload.items),
        created_at=now,
        items=[OrderItem(**item.dict()) for item in payload.items],
    )
    db.add(order)
    db.flush()
    order.code = f"VK{now:%y%m%d}-{order.id:04d}"
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=List[OrderRead])
def list_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    since_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    if since_id is not None:
        query = query.filter(Order.id > since_id)
    return query.order_by(Order.id.desc()).limit(300).all()


@router.patch("/orders/{order_id}", response_model=OrderRead)
def update_order(order_id: int, payload: OrderUpdate, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return order
