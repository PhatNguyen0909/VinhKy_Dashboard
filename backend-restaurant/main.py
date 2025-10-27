from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from db import engine, Base
from api import expenses


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

    return app


app = create_app()


@app.on_event("startup")
def on_startup():
    # create sqlite file dir if needed and create tables
    Base.metadata.create_all(bind=engine)
