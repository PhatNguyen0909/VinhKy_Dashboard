from datetime import datetime
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from services.cloudinary_upload import CloudinaryError, upload_image
from services.customer_auth import (
    create_token,
    current_customer,
    hash_password,
    optional_customer,
    verify_password,
)
from services import shipping
from services.restaurant_settings import get_settings, save_settings

from db import get_db
from models.website import Category, Customer, Order, OrderItem, Product
from schemas.website import (
    AuthResponse,
    CategoryIn,
    CategoryRead,
    CategoryUpdate,
    CustomerLogin,
    CustomerRead,
    CustomerRegister,
    CustomerUpdate,
    OrderIn,
    OrderRead,
    OrderUpdate,
    ProductIn,
    ProductRead,
    ProductUpdate,
)

router = APIRouter(prefix="/api", tags=["website"])


class ImageUpload(BaseModel):
    image: str


@router.post("/uploads/image")
def upload_image_endpoint(payload: ImageUpload):
    try:
        return {"url": upload_image(payload.image)}
    except CloudinaryError as error:
        raise HTTPException(status_code=502, detail=str(error))


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
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    updates = payload.dict(exclude_unset=True)
    if "name" in updates:
        category.name = updates["name"].strip()
    if "is_active" in updates and updates["is_active"] is not None:
        category.is_active = updates["is_active"]
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


class ShippingQuoteIn(BaseModel):
    address: str


@router.post("/shipping/quote")
def shipping_quote(payload: ShippingQuoteIn, db: Session = Depends(get_db)):
    try:
        return shipping.quote(payload.address, get_settings(db)["address"])
    except shipping.ShippingNotConfigured:
        return {"distance_km": None, "fee": 0, "configured": False}
    except shipping.ShippingError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/orders", response_model=OrderRead)
def create_order(
    payload: OrderIn,
    db: Session = Depends(get_db),
    customer: Optional[Customer] = Depends(optional_customer),
):
    now = datetime.utcnow()
    items = [OrderItem(**item.dict()) for item in payload.items]
    try:
        result = shipping.quote(payload.address, get_settings(db)["address"])
        if result.get("out_of_range"):
            raise HTTPException(status_code=400, detail="Địa chỉ trên 6 km, vui lòng đặt qua Grab.")
        fee = result["fee"]
    except shipping.ShippingNotConfigured:
        fee = 0
    except shipping.ShippingError as error:
        raise HTTPException(status_code=400, detail=str(error))
    if fee:
        items.append(OrderItem(name="Phí giao hàng", price=fee, quantity=1))
    order = Order(
        code="TMP",
        customer_id=customer.id if customer else None,
        customer_name=payload.customer_name.strip(),
        phone=payload.phone.strip(),
        address=payload.address.strip(),
        note=payload.note.strip(),
        payment_method=payload.payment_method,
        payment_status="unpaid",
        total=sum(item.price * item.quantity for item in items),
        created_at=now,
        items=items,
    )
    db.add(order)
    db.flush()
    order.code = f"VK{now:%y%m%d}-{order.id:04d}"
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/mine", response_model=List[OrderRead])
def my_orders(customer: Customer = Depends(current_customer), db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .filter(Order.customer_id == customer.id)
        .order_by(Order.id.desc())
        .limit(50)
        .all()
    )


@router.post("/auth/register", response_model=AuthResponse)
def register(payload: CustomerRegister, db: Session = Depends(get_db)):
    phone = payload.phone.strip()
    if db.query(Customer).filter(Customer.phone == phone).first():
        raise HTTPException(status_code=409, detail="Số điện thoại đã được đăng ký")
    customer = Customer(
        name=payload.name.strip(),
        phone=phone,
        email=payload.email.strip(),
        password_hash=hash_password(payload.password),
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return {"token": create_token(customer.id), "customer": customer}


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: CustomerLogin, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.phone == payload.phone.strip()).first()
    if not customer or not verify_password(payload.password, customer.password_hash):
        raise HTTPException(status_code=401, detail="Sai số điện thoại hoặc mật khẩu")
    return {"token": create_token(customer.id), "customer": customer}


@router.get("/auth/me", response_model=CustomerRead)
def me(customer: Customer = Depends(current_customer)):
    return customer


@router.patch("/auth/me", response_model=CustomerRead)
def update_me(
    payload: CustomerUpdate,
    customer: Customer = Depends(current_customer),
    db: Session = Depends(get_db),
):
    for key, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(customer, key, value.strip())
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/restaurant")
def get_restaurant(db: Session = Depends(get_db)):
    return get_settings(db)


@router.put("/restaurant")
def update_restaurant(payload: Dict[str, str], db: Session = Depends(get_db)):
    return save_settings(db, payload)


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
