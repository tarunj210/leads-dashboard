from app.models import (
    Lead,
)

from app.repositories.mobile_dashboard_repository import (
    get_filtered_mobile_calls,
)


def get_message_leads(
    db,
    *,
    start_date,
    end_date,
):

    # ---------------------------------
    # Call Leads
    # Uses existing mobile lead logic
    # ---------------------------------

    mobile_rows = (
        get_filtered_mobile_calls(
            db,
            start_date=start_date,
            end_date=end_date,
        )
    )


    call_leads = []

    seen_call_numbers = set()


    for row in mobile_rows:

        if row.cli is None:
            continue


        number = str(
            row.cli
        ).strip()


        if not number:
            continue


        if number in seen_call_numbers:
            continue


        seen_call_numbers.add(
            number
        )


        call_leads.append(
            number
        )


    # ---------------------------------
    # Email Leads
    # ---------------------------------

    email_rows = (
        db.query(
            Lead.customer_phone_normalized
        )
        .filter(
            Lead.lead_received_date
            >= start_date
        )
        .filter(
            Lead.lead_received_date
            <= end_date
        )
        .filter(
            Lead.customer_phone_normalized
            .isnot(None)
        )
        .order_by(
            Lead.lead_received_date.asc()
        )
        .all()
    )


    email_leads = []

    seen_email_numbers = set()


    for row in email_rows:

        number = row[0]


        if number is None:
            continue


        number = str(
            number
        ).strip()


        if not number:
            continue


        if number in seen_email_numbers:
            continue


        seen_email_numbers.add(
            number
        )


        email_leads.append(
            number
        )


    return {
        "call_leads": call_leads,
        "email_leads": email_leads,
    }