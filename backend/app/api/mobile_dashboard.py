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

    start_date: datetime | None = Query(
        None
    ),

    end_date: datetime | None = Query(
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
            not selected_cld
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "selected_cld is required "
                    "when view_mode='website'"
                ),
            )


        return get_mobile_summary(

            start_date=start_date,

            end_date=end_date,

            min_duration=min_duration,

            max_duration=max_duration,

            view_mode=view_mode,

            selected_cld=selected_cld,

        )

    except HTTPException:

        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/calls")
def mobile_dashboard_calls(

    start_date: datetime | None = Query(
        None
    ),

    end_date: datetime | None = Query(
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
            not selected_cld
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "selected_cld is required "
                    "when view_mode='website'"
                ),
            )


        return get_mobile_calls(

            start_date=start_date,

            end_date=end_date,

            min_duration=min_duration,

            max_duration=max_duration,

            view_mode=view_mode,

            selected_cld=selected_cld,

            page=page,

            page_size=page_size,

        )

    except HTTPException:

        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )