from datetime import datetime

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.mobile_dashboard_service import (
    get_mobile_filter_options,
    get_mobile_summary,
    get_mobile_calls,
)


router = APIRouter(
    prefix="/api/mobile-dashboard",
    tags=["mobile-dashboard"],
)


@router.get("/filter-options")
def mobile_dashboard_filter_options():
    try:
        return get_mobile_filter_options()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/summary")
def mobile_dashboard_summary(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),

    min_duration: int = Query(
        60,
        ge=0,
    ),
):
    try:
        return get_mobile_summary(
            start_date=start_date,
            end_date=end_date,
            min_duration=min_duration,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/calls")
def mobile_dashboard_calls(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),

    min_duration: int = Query(
        60,
        ge=0,
    ),

    page: int = Query(
        1,
        ge=1,
    ),

    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
):
    try:
        return get_mobile_calls(
            start_date=start_date,
            end_date=end_date,
            min_duration=min_duration,
            page=page,
            page_size=page_size,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )