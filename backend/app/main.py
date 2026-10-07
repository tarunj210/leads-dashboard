import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ingestion import (
    router as ingestion_router,
)
from app.api.dashboard import (
    router as dashboard_router,
)
from app.api.mobile_ingestion import (
    router as mobile_ingestion_router,
)
from app.api.mobile_dashboard import (
    router as mobile_dashboard_router,
)
from app.api.overview import (
    router as overview_router,
)

from app.api.marketing import (
    router as marketing_router,
)
from app.api.message import (
    router as message_router,
)


app = FastAPI()


FRONTEND_URL = os.getenv(
    "FRONTEND_URL"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    ingestion_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    mobile_ingestion_router
)

app.include_router(
    mobile_dashboard_router
)

app.include_router(
    overview_router
)

app.include_router(
    marketing_router
)
app.include_router(
    message_router
)