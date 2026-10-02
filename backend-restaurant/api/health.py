from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from db import get_db

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/db")
def check_database_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) from error

    return {"status": "ok", "database": "connected"}