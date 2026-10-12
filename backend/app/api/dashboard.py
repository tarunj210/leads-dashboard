from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.dashboard_service import (
    get_summary,
    get_filters,
    get_data,
    get_leads,
    get_unique_email_leads,
)

from app.api.date_time_utils import (
    build_datetime_range,
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
)


# =========================================
# Existing summary
# =========================================

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


# =========================================
# Existing filter options
# =========================================

@router.get("/filter-options")
def dashboard_filter_options():

    try:

        return get_filters()

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# =========================================
# Dashboard data
# =========================================

@router.get("/data")
def dashboard_data(

    start_date: str | None = Query(
        None
    ),

    start_time: str | None = Query(
        None
    ),

    end_date: str | None = Query(
        None
    ),

    end_time: str | None = Query(
        None
    ),

    service: str = Query(
        "all"
    ),

    domain: str = Query(
        "all"
    ),

    page_name: str = Query(
        "all"
    ),

    status: str = Query(
        "all"
    ),
):

    try:

        (
            start_datetime,
            end_datetime,
        ) = build_datetime_range(
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
        )


        return get_data(
            start_date=start_datetime,
            end_date=end_datetime,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )


    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# =========================================
# Lead table
# =========================================

@router.get("/leads")
def dashboard_leads(

    start_date: str | None = Query(
        None
    ),

    start_time: str | None = Query(
        None
    ),

    end_date: str | None = Query(
        None
    ),

    end_time: str | None = Query(
        None
    ),

    service: str = Query(
        "all"
    ),

    domain: str = Query(
        "all"
    ),

    page_name: str = Query(
        "all"
    ),

    status: str = Query(
        "all"
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

        (
            start_datetime,
            end_datetime,
        ) = build_datetime_range(
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
        )


        return get_leads(
            start_date=start_datetime,
            end_date=end_datetime,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
            page=page,
            page_size=page_size,
        )


    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# =========================================
# Unique emails
# =========================================

@router.get("/unique-emails")
def dashboard_unique_emails(

    start_date: str | None = Query(
        None
    ),

    start_time: str | None = Query(
        None
    ),

    end_date: str | None = Query(
        None
    ),

    end_time: str | None = Query(
        None
    ),

    service: str = Query(
        "all"
    ),

    domain: str = Query(
        "all"
    ),

    page_name: str = Query(
        "all"
    ),

    status: str = Query(
        "all"
    ),
):

    try:

        (
            start_datetime,
            end_datetime,
        ) = build_datetime_range(
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
        )


        return get_unique_email_leads(
            start_date=start_datetime,
            end_date=end_datetime,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )


    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )