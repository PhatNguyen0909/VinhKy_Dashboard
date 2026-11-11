import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models.website import Customer

TOKEN_TTL = 60 * 60 * 24 * 30
_ITERATIONS = 120_000


def _secret() -> bytes:
    return os.getenv("AUTH_SECRET", "dev-only-change-me").encode()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), _ITERATIONS)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), _ITERATIONS)
    return hmac.compare_digest(check.hex(), digest)


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def create_token(customer_id: int) -> str:
    body = _b64(json.dumps({"id": customer_id, "exp": int(time.time()) + TOKEN_TTL}).encode())
    sig = _b64(hmac.new(_secret(), body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"


def parse_token(token: str) -> Optional[int]:
    try:
        body, sig = token.split(".", 1)
        expected = _b64(hmac.new(_secret(), body.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if payload["exp"] < time.time():
            return None
        return int(payload["id"])
    except Exception:
        return None


def optional_customer(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> Optional[Customer]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    customer_id = parse_token(authorization[7:].strip())
    return db.get(Customer, customer_id) if customer_id else None


def current_customer(customer: Optional[Customer] = Depends(optional_customer)) -> Customer:
    if not customer:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")
    return customer
