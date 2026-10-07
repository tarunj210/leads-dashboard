from app.models import (
    MobileLead,
)


BATCH_SIZE = 1000


def get_existing_mobile_leads(
    db,
    lead_keys,
):

    if not lead_keys:
        return {}


    existing_map = {}


    for start in range(
        0,
        len(lead_keys),
        BATCH_SIZE,
    ):

        batch = lead_keys[
            start:
            start + BATCH_SIZE
        ]


        rows = (
            db.query(
                MobileLead
            )
            .filter(
                MobileLead.lead_key.in_(
                    batch
                )
            )
            .all()
        )


        for row in rows:

            existing_map[
                row.lead_key
            ] = row


    return existing_map


def sync_mobile_lead(
    db,
    mobile_lead_data,
    existing_map,
):

    lead_key = (
        mobile_lead_data[
            "lead_key"
        ]
    )


    existing_lead = (
        existing_map.get(
            lead_key
        )
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


        existing_map[
            lead_key
        ] = mobile_lead


        return "inserted"


    # ---------------------------------
    # Case 2: Record exists unchanged
    # ---------------------------------

    if (
        existing_lead.row_hash
        == mobile_lead_data[
            "row_hash"
        ]
    ):

        return "skipped"


    # ---------------------------------
    # Case 3: Record exists but changed
    # ---------------------------------

    existing_lead.row_hash = (
        mobile_lead_data[
            "row_hash"
        ]
    )


    existing_lead.access_list = (
        mobile_lead_data[
            "access_list"
        ]
    )


    existing_lead.remote_ip = (
        mobile_lead_data[
            "remote_ip"
        ]
    )


    existing_lead.connect_time = (
        mobile_lead_data[
            "connect_time"
        ]
    )


    existing_lead.cli = (
        mobile_lead_data[
            "cli"
        ]
    )


    existing_lead.cld = (
        mobile_lead_data[
            "cld"
        ]
    )


    existing_lead.prefix = (
        mobile_lead_data[
            "prefix"
        ]
    )


    existing_lead.billed_duration = (
        mobile_lead_data[
            "billed_duration"
        ]
    )


    existing_lead.result = (
        mobile_lead_data[
            "result"
        ]
    )


    existing_lead.cost = (
        mobile_lead_data[
            "cost"
        ]
    )


    return "updated"