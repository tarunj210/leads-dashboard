from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.message_service import (
    get_lead_message,
)

from app.api.date_time_utils import (
    build_datetime_range,
)


router = APIRouter(
    prefix="/api/message",
    tags=["message"],
)


@router.get("/leads")
def lead_message(

    start_date: str = Query(
        ...
    ),

    start_time: str = Query(
        "00:00"
    ),

    end_date: str = Query(
        ...
    ),

    end_time: str = Query(
        "23:59"
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


        return get_lead_message(
            start_date=start_datetime,
            end_date=end_datetime,
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