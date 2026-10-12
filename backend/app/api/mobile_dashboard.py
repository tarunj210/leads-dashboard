from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.mobile_dashboard_service import (
    get_mobile_filter_options,
    get_mobile_summary,
    get_mobile_calls,
    get_mobile_unique_numbers,
)

from app.constants.mobile_tracking_numbers import (
    is_valid_tracking_number,
)

from app.api.date_time_utils import (
    build_datetime_range,
)


router = APIRouter(
    prefix="/api/mobile-dashboard",
    tags=["mobile-dashboard"],
)


# =========================================
# Filter options
# =========================================

@router.get("/filter-options")
def mobile_dashboard_filter_options():

    try:

        return get_mobile_filter_options()

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# =========================================
# Shared validation
# =========================================

def validate_mobile_request(
    *,
    view_mode: str,
    selected_cld: str | None,
    min_duration: int,
    max_duration: int | None,
):

    if view_mode not in {
        "forwarded",
        "website",
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                "view_mode must be "
                "'forwarded' or 'website'"
            ),
        )


    if (
        max_duration is not None
        and
        max_duration < min_duration
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "max_duration must be "
                "greater than or equal to "
                "min_duration"
            ),
        )


    if (
        view_mode == "website"
        and
        selected_cld
        and
        not is_valid_tracking_number(
            selected_cld
        )
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid website tracking "
                "number."
            ),
        )


# =========================================
# Summary
# =========================================

@router.get("/summary")
def mobile_dashboard_summary(

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

    min_duration: int = Query(
        60,
        ge=0,
    ),

    max_duration: int | None = Query(
        None,
        ge=0,
    ),

    view_mode: str = Query(
        "forwarded"
    ),

    selected_cld: str | None = Query(
        None
    ),
):

    try:

        validate_mobile_request(
            view_mode=view_mode,
            selected_cld=selected_cld,
            min_duration=min_duration,
            max_duration=max_duration,
        )


        (
            start_datetime,
            end_datetime,
        ) = build_datetime_range(
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
        )


        return get_mobile_summary(
            start_date=start_datetime,
            end_date=end_datetime,
            min_duration=min_duration,
            max_duration=max_duration,
            view_mode=view_mode,
            selected_cld=selected_cld,
        )


    except HTTPException:
        raise


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
# Calls
# =========================================

@router.get("/calls")
def mobile_dashboard_calls(

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

    min_duration: int = Query(
        60,
        ge=0,
    ),

    max_duration: int | None = Query(
        None,
        ge=0,
    ),

    view_mode: str = Query(
        "forwarded"
    ),

    selected_cld: str | None = Query(
        None
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

        validate_mobile_request(
            view_mode=view_mode,
            selected_cld=selected_cld,
            min_duration=min_duration,
            max_duration=max_duration,
        )


        (
            start_datetime,
            end_datetime,
        ) = build_datetime_range(
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
        )


        return get_mobile_calls(
            start_date=start_datetime,
            end_date=end_datetime,
            min_duration=min_duration,
            max_duration=max_duration,
            view_mode=view_mode,
            selected_cld=selected_cld,
            page=page,
            page_size=page_size,
        )


    except HTTPException:
        raise


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
# Unique numbers
# =========================================

@router.get("/unique-numbers")
def mobile_dashboard_unique_numbers(

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

    min_duration: int = Query(
        60,
        ge=0,
    ),

    max_duration: int | None = Query(
        None,
        ge=0,
    ),

    view_mode: str = Query(
        "forwarded"
    ),

    selected_cld: str | None = Query(
        None
    ),
):

    try:

        validate_mobile_request(
            view_mode=view_mode,
            selected_cld=selected_cld,
            min_duration=min_duration,
            max_duration=max_duration,
        )


        (
            start_datetime,
            end_datetime,
        ) = build_datetime_range(
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
        )


        return get_mobile_unique_numbers(
            start_date=start_datetime,
            end_date=end_datetime,
            min_duration=min_duration,
            max_duration=max_duration,
            view_mode=view_mode,
            selected_cld=selected_cld,
        )


    except HTTPException:
        raise


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