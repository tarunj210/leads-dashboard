from datetime import datetime

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services.message_service import (
    get_lead_message,
)


router = APIRouter(
    prefix="/api/message",
    tags=["message"],
)


@router.get("/leads")
def lead_message(
    start_date: datetime = Query(
        ...
    ),
    end_date: datetime = Query(
        ...
    ),
):

    try:

        if end_date < start_date:

            raise ValueError(
                "end_date must be after start_date"
            )


        return get_lead_message(
            start_date=start_date,
            end_date=end_date,
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