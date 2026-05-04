from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from db import engine, Base
from api import expenses
from api import revenues
from api import profits


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

    return app


app = create_app()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# 👉 Thêm block này để chạy local OPTIONAL
# Railway / Render sẽ ignore vì họ tự chạy uvicorn
# --------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
