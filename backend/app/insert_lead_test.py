import pandas as pd

from app.database import SessionLocal
from app.ingestion.lead_loader import load_valid_leads
from app.repositories.lead_repository import insert_lead


def database_value(value):
    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()

    return value


valid_df = load_valid_leads()


if valid_df.empty:
    raise RuntimeError(
        "No valid leads were returned from the ingestion pipeline."
    )


row = valid_df.iloc[2]


lead_data = {
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


with SessionLocal() as db:
    lead = insert_lead(
        db,
        lead_data,
    )

    print(
        f"Inserted lead with database ID: {lead.id}"
    )