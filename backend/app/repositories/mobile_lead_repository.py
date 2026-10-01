from app.models import MobileLead


def sync_mobile_lead(
    db,
    mobile_lead_data,
):
    existing_lead = (
        db.query(MobileLead)
        .filter(
            MobileLead.lead_key
            == mobile_lead_data["lead_key"]
        )
        .first()
    )

    # ---------------------------------
    # Case 1: Record does not exist
    # ---------------------------------

    if existing_lead is None:

        mobile_lead = MobileLead(
            **mobile_lead_data
        )

        db.add(
            mobile_lead
        )

        return "inserted"

    # ---------------------------------
    # Case 2: Record exists unchanged
    # ---------------------------------

    if (
        existing_lead.row_hash
        == mobile_lead_data["row_hash"]
    ):
        return "skipped"

    # ---------------------------------
    # Case 3: Record exists but changed
    # ---------------------------------

    existing_lead.row_hash = (
        mobile_lead_data["row_hash"]
    )

    existing_lead.access_list = (
        mobile_lead_data["access_list"]
    )

    existing_lead.remote_ip = (
        mobile_lead_data["remote_ip"]
    )

    existing_lead.connect_time = (
        mobile_lead_data["connect_time"]
    )

    existing_lead.cli = (
        mobile_lead_data["cli"]
    )

    existing_lead.cld = (
        mobile_lead_data["cld"]
    )

    existing_lead.prefix = (
        mobile_lead_data["prefix"]
    )

    existing_lead.billed_duration = (
        mobile_lead_data[
            "billed_duration"
        ]
    )

    existing_lead.result = (
        mobile_lead_data["result"]
    )

    existing_lead.cost = (
        mobile_lead_data["cost"]
    )

    return "updated"