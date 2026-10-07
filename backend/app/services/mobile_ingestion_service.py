import pandas as pd

from app.database import (
    SessionLocal,
)

from app.ingestion.mobile_lead_loader import (
    load_valid_mobile_leads,
)

from app.repositories.mobile_lead_repository import (
    get_existing_mobile_leads,
    sync_mobile_lead,
)

from app.repositories.ingestion_state_repository import (
    MOBILE_SOURCE,
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


def row_to_mobile_lead_data(
    row,
):
    return {
        "lead_key": row[
            "lead_key"
        ],

        "row_hash": row[
            "row_hash"
        ],

        "access_list": database_value(
            row[
                "access_list"
            ]
        ),

        "remote_ip": database_value(
            row[
                "remote_ip"
            ]
        ),

        "connect_time": database_value(
            row[
                "connect_time"
            ]
        ),

        "cli": database_value(
            row[
                "cli"
            ]
        ),

        "cld": database_value(
            row[
                "cld"
            ]
        ),

        "prefix": database_value(
            row[
                "prefix"
            ]
        ),

        "billed_duration": database_value(
            row[
                "billed_duration"
            ]
        ),

        "result": database_value(
            row[
                "result"
            ]
        ),

        "cost": database_value(
            row[
                "cost"
            ]
        ),
    }


def sync_mobile_leads():

    print(
        "MOBILE 1: service started",
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

            # Mobile sheet:
            # row 1 = header
            state = (
                get_or_create_ingestion_state(
                    db,
                    source=MOBILE_SOURCE,
                    initial_last_processed_row=1,
                )
            )


            start_row = (
                state.last_processed_row
                + 1
            )


            print(
                "MOBILE checkpoint:",
                state.last_processed_row,
                flush=True,
            )


            print(
                "MOBILE starting row:",
                start_row,
                flush=True,
            )


            (
                valid_df,
                fetched_count,
            ) = (
                load_valid_mobile_leads(
                    start_row
                )
            )


            stats[
                "fetched"
            ] = fetched_count


            # ---------------------------------
            # Nothing new in Google Sheet
            # ---------------------------------

            if fetched_count == 0:

                db.commit()

                print(
                    "MOBILE no new rows found",
                    flush=True,
                )

                return stats


            print(
                f"MOBILE fetched "
                f"{fetched_count} sheet rows",
                flush=True,
            )


            print(
                f"MOBILE valid rows: "
                f"{len(valid_df)}",
                flush=True,
            )


            # ---------------------------------
            # Convert dataframe rows
            # into database-ready dictionaries
            # ---------------------------------

            mobile_leads_data = [
                row_to_mobile_lead_data(
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
                in mobile_leads_data
            ]


            print(
                f"MOBILE checking "
                f"{len(lead_keys)} lead keys",
                flush=True,
            )


            # ---------------------------------
            # One/few batched DB queries
            # instead of one query per row
            # ---------------------------------

            existing_map = (
                get_existing_mobile_leads(
                    db,
                    lead_keys,
                )
            )


            print(
                f"MOBILE found "
                f"{len(existing_map)} existing records",
                flush=True,
            )


            # ---------------------------------
            # Sync in memory
            # ---------------------------------

            for mobile_lead_data in (
                mobile_leads_data
            ):

                result = (
                    sync_mobile_lead(
                        db,
                        mobile_lead_data,
                        existing_map,
                    )
                )


                stats[
                    result
                ] += 1


            # ---------------------------------
            # Advance checkpoint by actual
            # Sheet rows fetched
            # ---------------------------------

            state.last_processed_row = (
                state.last_processed_row
                + fetched_count
            )


            print(
                "MOBILE committing changes",
                flush=True,
            )


            db.commit()


            print(
                "MOBILE committed. "
                f"Checkpoint is now "
                f"{state.last_processed_row}",
                flush=True,
            )


            return stats


        except Exception as exc:

            db.rollback()


            print(
                f"MOBILE ERROR: "
                f"{repr(exc)}",
                flush=True,
            )


            raise