from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship

from db import Base

LongText = Text().with_variant(LONGTEXT, "mysql")


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = {
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    sort_order = Column(Integer, default=0)

    products = relationship(
        "Product", back_populates="category", cascade="all, delete-orphan"
    )


class Product(Base):
    __tablename__ = "products"
    __table_args__ = {
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, default=0.0)
    rating = Column(Float, default=5.0)
    is_best_seller = Column(Boolean, default=False)
    image = Column(LongText, default="")

    category = relationship("Category", back_populates="products")


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(32), unique=True, index=True)
    customer_name = Column(String(200), default="")
    phone = Column(String(40), default="")
    address = Column(Text, default="")
    note = Column(Text, default="")
    payment_method = Column(String(20), default="transfer")
    payment_status = Column(String(20), default="unpaid", index=True)
    status = Column(String(20), default="new", index=True)
    total = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = {
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    price = Column(Float, default=0.0)
    quantity = Column(Integer, default=1)

    order = relationship("Order", back_populates="items")
