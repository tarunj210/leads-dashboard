from fastapi import APIRouter, HTTPException

from app.services.mobile_ingestion_service import (
    sync_mobile_leads,
)


router = APIRouter(
    prefix="/api/mobile-ingestion",
    tags=["mobile-ingestion"],
)


@router.post("/refresh")
def refresh_mobile_leads():
    print("MOBILE REFRESH ENDPOINT CALLED", flush=True)

    try:
        result = sync_mobile_leads()

        return {
            "status": "success",
            **result,
        }

    except Exception as exc:
        print(
            f"MOBILE REFRESH ERROR: {repr(exc)}",
            flush=True,
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )