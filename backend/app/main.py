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


app = FastAPI()


FRONTEND_URL = o