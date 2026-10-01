import pandas as pd

from app.database import SessionLocal
from app.ingestion.lead_loader import load_valid_leads
from app.repositories.lead_repository import sync_lead


def database_value(value):
    if pd.isna(value):
        return None

    return value


def row_to_lead_data(row):
    return {
        "lead_key": row["lead_key"],
        "row_hash": row["row_hash"],

        "lead_received_date": database_value(
            row["lead_received_date"]
        ),

        "customer_name": database_value(
            row["customer_name"]
        ),

        "customer_email": database_value(
            row["customer_email"]
        ),

        "customer_phone": database_value(
            row["customer_phone"]
        ),

        "customer_phone_normalized": database_value(
            row["customer_phone_normalized"]
        ),

        "customer_service": database_value(
            row["customer_service"]
        ),

        "customer_message": database_value(
            row["customer_message"]
        ),

        "customer_address": database_value(
            row["customer_address"]
        ),

        "status": database_value(
            row["status"]
        ),

        "page_url": database_value(
            row["page_url"]
        ),

        "page_name": database_value(
            row["page_name"]
        ),
    }

def sync_leads():
    print("WEB 1: service started", flush=True)

    valid_df = load_valid_leads()

    print(
        f"WEB 2: loader returned {len(valid_df)} rows",
        flush=True,
    )

    stats = {
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
    }

    if valid_df.empty:
        return stats

    print("WEB 3: opening DB session", flush=True)

    with SessionLocal() as db:

        try:
            print("WEB 4: starting row sync", flush=True)

            for index, (_, row) in enumerate(
                valid_df.iterrows(),
                start=1,
            ):
                lead_data = row_to_lead_data(row)

                result = sync_lead(
                    db,
                    lead_data,
                )

                stats[result] += 1

                if index % 100 == 0:
                    print(
                        f"WEB processed {index}",
                        flush=True,
                    )

            print("WEB 5: committing", flush=True)

            db.commit()

            print("WEB 6: commit complete", flush=True)

        except Exception as exc:
            print(
                f"WEB ERROR: {repr(exc)}",
                flush=True,
            )

            db.rollback()
            raise

    return stats