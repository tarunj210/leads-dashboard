import os

from fastapi import (
    APIRouter,
    Header,
    HTTPException,
)
from sqlalchemy import text

from app.database import SessionLocal


router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
)


@router.post("/reset-mobile-ingestion")
def reset_mobile_ingestion(
    x_admin_key: str | None = Header(
        default=None
    ),
):

    expected_key =os.getenv("ADMIN_RESET_KEY")


    if not expected_key:

        raise HTTPException(
            status_code=500,
            detail=(
                "ADMIN_RESET_KEY "
                "is not configured"
            ),
        )


    if (
        x_admin_key
        != expected_key
    ):

        raise HTTPException(
            status_code=403,
            detail="Invalid admin key",
        )


    with SessionLocal() as db:

        try:

            db.execute(
                text(
                    """
                    DELETE FROM mobile_leads
                    """
                )
            )


            db.execute(
                text(
                    """
                    UPDATE ingestion_state
                    SET last_processed_row = 2
                    WHERE source = 'mobile_google_sheet'
                    """
                )
            )


            db.commit()


            return {
                "status": "success",
                "message": (
                    "Mobile leads cleared "
                    "and checkpoint reset"
                ),
                "last_processed_row": 2,
            }


        except Exception:

            db.rollback()

            raise