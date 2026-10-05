from fastapi import (
    APIRouter,
    HTTPException,
)

from app.services.marketing_service import (
    get_marketing_call_list,
)


router = APIRouter(
    prefix="/api/marketing",
    tags=["marketing"],
)


@router.get("/calls")
def marketing_calls():

    try:

        return (
            get_marketing_call_list()
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )