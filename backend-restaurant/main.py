from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from db import engine, Base, ensure_mysql_utf8mb4
from api import expenses
from api import revenues
from api import profits
from api import health
from api import assistant
from api import website
import models


def create_app() -> FastAPI:
    app = FastAPI(title="Expenses API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(expenses.router)
    app.include_router(revenues.router)
    app.include_router(profits.router)
    app.include_router(health.router)
    app.include_router(assistant.router)
    app.include_router(website.router)

    return app


app = create_app()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_mysql_utf8mb4()
    from db import SessionLocal
    from services.menu_seed import seed_menu

    with SessionLocal() as session:
        seed_menu(session)


# --------------------------------------------------
# 👉 Thêm block này để chạy local OPTIONAL
# Railway / Render sẽ ignore vì họ tự chạy uvicorn
# --------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
