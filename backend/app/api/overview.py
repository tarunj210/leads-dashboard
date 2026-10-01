from fastapi import APIRouter, HTTPException

from app.services.overview_service import (
    get_overview_summary,
)


router = APIRouter(
    prefix="/api/overview",
    tags=["overview"],
)


@router.get("/summary")
def overview_summary():

    try:

        return get_overview_summary()

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )