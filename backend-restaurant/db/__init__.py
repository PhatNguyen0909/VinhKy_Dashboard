from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "expenses.db")


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return f"sqlite:///{DB_PATH}"

    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://", "postgresql+psycopg2://", 1)
    elif database_url.startswith("postgresql://") and "+psycopg2" not in database_url:
        database_url = database_url.replace(
            "postgresql://", "postgresql+psycopg2://", 1)

    if database_url.startswith("postgresql") and "sslmode=" not in database_url:
        database_url += "?sslmode=require"

    return database_url


DATABASE_URL = get_database_url()


def create_db_engine(database_url: str):
    engine_kwargs = {"pool_pre_ping": True}
    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    return create_engine(database_url, **engine_kwargs)


engine = create_db_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
