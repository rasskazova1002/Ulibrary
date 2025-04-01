from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

from .routers import book_router, user_router, login_router
from fastapi.staticfiles import StaticFiles


app = FastAPI()

app.mount("/static", StaticFiles(directory="front-app"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

models.Base.metadata.create_all(engine)

app.include_router(book_router.router)
app.include_router(user_router.router)
app.include_router(login_router.router)
