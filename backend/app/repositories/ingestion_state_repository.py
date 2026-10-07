from app.models import (
    IngestionState,
)


WEB_SOURCE = (
    "web_google_sheet"
)

MOBILE_SOURCE = (
    "mobile_google_sheet"
)


def get_or_create_ingestion_state(
    db,
    *,
    source: str,
    initial_last_processed_row: int,
):

    state = (
        db.query(
            IngestionState
        )
        .filter(
            IngestionState.source
            == source
        )
        .first()
    )


    if state is None:

        state = IngestionState(
            source=source,
            last_processed_row=(
                initial_last_processed_row
            ),
        )


        db.add(
            state
        )


        db.flush()


    return state