from app.models import Lead

def insert_lead(db, lead_data):
    lead = Lead(**lead_data)

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead



def sync_lead(db, lead_data):
    existing_lead = (
        db.query(Lead)
        .filter(
            Lead.lead_key == lead_data["lead_key"]
        )
        .first()
    )

    # ---------------------------------
    # Case 1: Lead does not exist
    # ---------------------------------
    if existing_lead is None:
        lead = Lead(**lead_data)

        db.add(lead)

        return "inserted"


    # ---------------------------------
    # Case 2: Lead exists and unchanged
    # ---------------------------------
    if existing_lead.row_hash == lead_data["row_hash"]:
        return "skipped"


    # ---------------------------------
    # Case 3: Lead exists but changed
    # ---------------------------------
    existing_lead.row_hash = lead_data["row_hash"]

    existing_lead.lead_received_date = (
        lead_data["lead_received_date"]
    )

    existing_lead.customer_name = (
        lead_data["customer_name"]
    )

    existing_lead.customer_email = (
        lead_data["customer_email"]
    )

    existing_lead.customer_phone = (
        lead_data["customer_phone"]
    )

    existing_lead.customer_phone_normalized = (
        lead_data["customer_phone_normalized"]
    )

    existing_lead.customer_service = (
        lead_data["customer_service"]
    )

    existing_lead.customer_message = (
        lead_data["customer_message"]
    )

    existing_lead.customer_address = (
        lead_data["customer_address"]
    )

    existing_lead.status = (
        lead_data["status"]
    )

    existing_lead.page_url = (
        lead_data["page_url"]
    )

    existing_lead.page_name = (
        lead_data["page_name"]
    )

    return "updated"