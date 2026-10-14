from sqlalchemy import create_engine, text
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


def ensure_mysql_utf8mb4() -> None:
    if engine.dialect.name != "mysql":
        return

    with engine.begin() as connection:
        for table in Base.metadata.sorted_tables:
            needs_conversion = connection.execute(
                text(
                    "SELECT 1 FROM information_schema.TABLES AS t "
                    "LEFT JOIN information_schema.COLUMNS AS c "
                    "ON c.TABLE_SCHEMA = t.TABLE_SCHEMA "
                    "AND c.TABLE_NAME = t.TABLE_NAME "
                    "WHERE t.TABLE_SCHEMA = DATABASE() "
                    "AND t.TABLE_NAME = :table_name "
                    "AND c.CHARACTER_SET_NAME IS NOT NULL "
                    "AND (COALESCE(LEFT(t.TABLE_COLLATION, 7), '') "
                    "<> 'utf8mb4' OR c.CHARACTER_SET_NAME <> 'utf8mb4') "
                    "LIMIT 1"
                ),
                {"table_name": table.name},
            ).first()
            if needs_conversion:
                table_name = connection.dialect.identifier_preparer.quote(
                    table.name
                )
                connection.exec_driver_sql(
                    f"ALTER TABLE {table_name} "
                    "CONVERT TO CHARACTER SET utf8mb4 "
                    "COLLATE utf8mb4_unicode_ci"
                )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
