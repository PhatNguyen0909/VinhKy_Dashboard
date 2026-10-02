from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "expenses.db")


def get_database_url():
    host = os.getenv("DB_HOST")
    if not host:
        return f"sqlite:///{DB_PATH}"

    required = ("DB_NAME", "DB_USER", "DB_PASSWORD")
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        raise RuntimeError(
            "Missing required database environment variables: "
            + ", ".join(missing)
        )

    try:
        port = int(os.getenv("DB_PORT", "3306"))
    except ValueError as error:
        raise RuntimeError("DB_PORT must be a valid port number") from error

    return URL.create(
        "mysql+pymysql",
        username=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=host,
        port=port,
        database=os.environ["DB_NAME"],
        query={"charset": "utf8mb4"},
    )


DATABASE_URL = get_database_url()


def create_db_engine(database_url: str):
    engine_kwargs = {"pool_pre_ping": True}
    is_sqlite = (
        database_url.startswith("sqlite")
        if isinstance(database_url, str)
        else database_url.get_backend_name() == "sqlite"
    )
    if is_sqlite:
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
