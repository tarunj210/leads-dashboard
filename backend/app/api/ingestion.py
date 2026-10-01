from fastapi import APIRouter, HTTPException

from app.services.ingestion_service import sync_leads


router = APIRouter(
    prefix="/api/ingestion",
    tags=["ingestion"],
)


@router.post("/refresh")
def refresh_leads():
    try:
        result = sync_leads()

        return {
            "status": "success",
            **result,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )