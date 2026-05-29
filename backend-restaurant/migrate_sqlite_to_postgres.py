import os

from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from db import Base, DB_PATH, create_db_engine
from models.expense import Expense, ExpenseItem
from models.revenue import Revenue


def _resolve_source_url() -> str:
    source_url = os.getenv("SOURCE_DATABASE_URL")
    if source_url:
        return source_url
    return f"sqlite:///{DB_PATH}"


def _resolve_target_url() -> str:
    target_url = os.getenv("TARGET_DATABASE_URL") or os.getenv("DATABASE_URL")
    if not target_url:
        raise RuntimeError(
            "Missing TARGET_DATABASE_URL or DATABASE_URL for the PostgreSQL target"
        )
    return target_url


def _normalize_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg2://", 1)
    if database_url.startswith("postgresql://") and "+psycopg2" not in database_url:
        return database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return database_url


def _copy_sequences(target_session) -> None:
    for table_name in ("expenses", "expense_items", "revenues"):
        max_id = target_session.execute(
            text(f'SELECT COALESCE(MAX(id), 0) FROM "{table_name}"')
        ).scalar_one()
        if max_id and max_id > 0:
            target_session.execute(
                text(
                    "SELECT setval(pg_get_serial_sequence(:table_name, 'id'), :max_id, true)"
                ),
                {"table_name": table_name, "max_id": max_id},
            )


def main() -> None:
    source_url = _normalize_url(_resolve_source_url())
    target_url = _normalize_url(_resolve_target_url())

    source_engine = create_db_engine(source_url)
    target_engine = create_db_engine(target_url)

    Base.metadata.create_all(bind=target_engine)

    SourceSession = sessionmaker(
        autocommit=False, autoflush=False, bind=source_engine)
    TargetSession = sessionmaker(
        autocommit=False, autoflush=False, bind=target_engine)

    source_session = SourceSession()
    target_session = TargetSession()

    try:
        expenses = source_session.query(Expense).order_by(Expense.id).all()
        revenues = source_session.query(Revenue).order_by(Revenue.id).all()
        expense_items = source_session.query(
            ExpenseItem).order_by(ExpenseItem.id).all()

        for row in expenses:
            target_session.merge(
                Expense(id=row.id, amount=row.amount, date=row.date))

        for row in revenues:
            target_session.merge(
                Revenue(
                    id=row.id,
                    date=row.date,
                    chuyen_khoan=row.chuyen_khoan,
                    tien_mat=row.tien_mat,
                    total=row.total,
                )
            )

        for row in expense_items:
            target_session.merge(
                ExpenseItem(
                    id=row.id,
                    date=row.date,
                    expense_id=row.expense_id,
                    ha=row.ha,
                    ga=row.ga,
                    gao=row.gao,
                    cho=row.cho,
                    kho=row.kho,
                    gas=row.gas,
                    dau=row.dau,
                    trung=row.trung,
                    hop=row.hop,
                    luong=row.luong,
                    khac=row.khac,
                )
            )

        target_session.commit()
        _copy_sequences(target_session)
        target_session.commit()

        print(
            f"Migrated {len(expenses)} expenses, {len(expense_items)} expense items, and {len(revenues)} revenues."
        )
    except Exception:
        target_session.rollback()
        raise
    finally:
        source_session.close()
        target_session.close()


if __name__ == "__main__":
    main()
