import pandas as pd

from app.database import (
    SessionLocal,
)

from app.ingestion.lead_loader import (
    load_valid_leads,
)

from app.repositories.lead_repository import (
    get_existing_leads,
    sync_lead,
)

from app.repositories.ingestion_state_repository import (
    WEB_SOURCE,
    get_or_create_ingestion_state,
)


def database_value(
    value,
):
    if pd.isna(
        value
    ):
        return None

    return value


def row_to_lead_data(
    row,
):
    return {
        "lead_key": row[
            "lead_key"
        ],

        "row_hash": row[
            "row_hash"
        ],

        "lead_received_date": database_value(
            row[
                "lead_received_date"
            ]
        ),

        "customer_name": database_value(
            row[
                "customer_name"
            ]
        ),

        "customer_email": database_value(
            row[
                "customer_email"
            ]
        ),

        "customer_phone": database_value(
            row[
                "customer_phone"
            ]
        ),

        "customer_phone_normalized": database_value(
            row[
                "customer_phone_normalized"
            ]
        ),

        "customer_service": database_value(
            row[
                "customer_service"
            ]
        ),

        "customer_message": database_value(
            row[
                "customer_message"
            ]
        ),

        "customer_address": database_value(
            row[
                "customer_address"
            ]
        ),

        "status": database_value(
            row[
                "status"
            ]
        ),

        "page_url": database_value(
            row[
                "page_url"
            ]
        ),

        "page_name": database_value(
            row[
                "page_name"
            ]
        ),
    }


def sync_leads():

    print(
        "WEB 1: service started",
        flush=True,
    )


    stats = {
        "fetched": 0,
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
    }


    with SessionLocal() as db:

        try:

            # Web sheet:
            # row 1 = metadata / other
            # row 2 = headers
            # row 3 onward = data
            state = (
                get_or_create_ingestion_state(
                    db,
                    source=WEB_SOURCE,
                    initial_last_processed_row=2,
                )
            )


            start_row = (
                state.last_processed_row
                + 1
            )


            print(
                "WEB checkpoint:",
                state.last_processed_row,
                flush=True,
            )


            print(
                "WEB starting row:",
                start_row,
                flush=True,
            )


            (
                valid_df,
                fetched_count,
            ) = (
                load_valid_leads(
                    start_row
                )
            )


            stats[
                "fetched"
            ] = fetched_count


            # ---------------------------------
            # No new rows
            # ---------------------------------

            if fetched_count == 0:

                db.commit()

                print(
                    "WEB no new rows found",
                    flush=True,
                )

                return stats


            print(
                f"WEB fetched "
                f"{fetched_count} sheet rows",
                flush=True,
            )


            print(
                f"WEB valid rows: "
                f"{len(valid_df)}",
                flush=True,
            )


            # ---------------------------------
            # Convert DataFrame rows
            # into database-ready dictionaries
            # ---------------------------------

            leads_data = [
                row_to_lead_data(
                    row
                )
                for _, row
                in valid_df.iterrows()
            ]


            # ---------------------------------
            # Extract incoming lead keys
            # ---------------------------------

            lead_keys = [
                item[
                    "lead_key"
                ]
                for item
                in leads_data
            ]


            print(
                f"WEB checking "
                f"{len(lead_keys)} lead keys",
                flush=True,
            )


            # ---------------------------------
            # Fetch matching existing rows
            # in batches
            # ---------------------------------

            existing_map = (
                get_existing_leads(
                    db,
                    lead_keys,
                )
            )


            print(
                f"WEB found "
                f"{len(existing_map)} existing records",
                flush=True,
            )


            # ---------------------------------
            # Compare / sync in memory
            # ---------------------------------

            for lead_data in (
                leads_data
            ):

                result = (
                    sync_lead(
                        db,
                        lead_data,
                        existing_map,
                    )
                )


                stats[
                    result
                ] += 1


            # ---------------------------------
            # Advance checkpoint by number of
            # actual Google Sheet rows fetched
            # ---------------------------------

            state.last_processed_row = (
                state.last_processed_row
                + fetched_count
            )


            print(
                "WEB committing changes",
                flush=True,
            )


            db.commit()


            print(
                "WEB committed. "
                f"Checkpoint is now "
                f"{state.last_processed_row}",
                flush=True,
            )


            return stats


        except Exception as exc:

            db.rollback()


            print(
                f"WEB ERROR: "
                f"{repr(exc)}",
                flush=True,
            )


            raise