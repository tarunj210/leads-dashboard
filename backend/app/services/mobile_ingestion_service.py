import pandas as pd

from app.database import SessionLocal
from app.ingestion.mobile_lead_loader import (
    load_valid_mobile_leads,
)

from app.repositories.mobile_lead_repository import (
    sync_mobile_lead,
)


def database_value(value):
    if pd.isna(value):
        return None

    return value


def row_to_mobile_lead_data(row):
    return {
        "lead_key": row["lead_key"],
        "row_hash": row["row_hash"],

        "access_list": database_value(
            row["access_list"]
        ),

        "remote_ip": database_value(
            row["remote_ip"]
        ),

        "connect_time": database_value(
            row["connect_time"]
        ),

        "cli": database_value(
            row["cli"]
        ),

        "cld": database_value(
            row["cld"]
        ),

        "prefix": database_value(
            row["prefix"]
        ),

        "billed_duration": database_value(
            row["billed_duration"]
        ),

        "result": database_value(
            row["result"]
        ),

        "cost": database_value(
            row["cost"]
        ),
    }


def sync_mobile_leads():
    print("MOBILE 1: service started", flush=True)

    valid_df = load_valid_mobile_leads()

    print(
        f"MOBILE 2: loader returned {len(valid_df)} rows",
        flush=True,
    )

    stats = {
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
    }

    if valid_df.empty:
        return stats

    print("MOBILE 3: opening DB session", flush=True)

    with SessionLocal() as db:

        try:
            print("MOBILE 4: starting row sync", flush=True)

            for index, (_, row) in enumerate(
                valid_df.iterrows(),
                start=1,
            ):
                mobile_lead_data = (
                    row_to_mobile_lead_data(row)
                )

                result = sync_mobile_lead(
                    db,
                    mobile_lead_data,
                )

                stats[result] += 1

                if index % 100 == 0:
                    print(
                        f"MOBILE processed {index}",
                        flush=True,
                    )

            print("MOBILE 5: committing", flush=True)

            db.commit()

            print("MOBILE 6: commit complete", flush=True)

        except Exception as exc:
            print(
                f"MOBILE ERROR: {repr(exc)}",
                flush=True,
            )

            db.rollback()
            raise

    return stats