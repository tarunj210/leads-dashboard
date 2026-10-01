from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from app.services.dashboard_service import (
    get_summary,
    get_filters,
    get_data,
    get_leads
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
)


@router.get("/summary")
def dashboard_summary(
    date_range: str = Query("all"),
    service: str = Query("all"),
    domain: str = Query("all"),
    page_name: str = Query("all"),
    status: str = Query("all"),
):
    try:
        return get_summary(
            date_range=date_range,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

@router.get("/filter-options")
def dashboard_filter_options():
    try:
        return get_filters()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/data")
def dashboard_data(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    service: str = Query("all"),
    domain: str = Query("all"),
    page_name: str = Query("all"),
    status: str = Query("all"),
):
    try:
        return get_data(
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

@router.get("/leads")
def dashboard_leads(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),

    service: str = Query("all"),
    domain: str = Query("all"),
    page_name: str = Query("all"),
    status: str = Query("all"),

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
        return get_leads(
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
            page=page,
            page_size=page_size,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )