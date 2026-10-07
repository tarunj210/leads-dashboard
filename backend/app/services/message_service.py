from datetime import datetime

from app.database import (
    SessionLocal,
)

from app.repositories.message_repository import (
    get_message_leads,
)


def format_time(
    value: datetime,
) -> str:

    return (
        value.strftime(
            "%I:%M %p"
        )
        .lstrip("0")
        .lower()
    )


def get_lead_message(
    *,
    start_date: datetime,
    end_date: datetime,
):

    with SessionLocal() as db:

        data = (
            get_message_leads(
                db,
                start_date=start_date,
                end_date=end_date,
            )
        )


    call_leads = data[
        "call_leads"
    ]

    email_leads = data[
        "email_leads"
    ]


    start_date_text = (
        start_date.strftime(
            "%d/%m/%Y"
        )
    )


    end_date_text = (
        end_date.strftime(
            "%d/%m/%Y"
        )
    )


    start_time_text = (
        format_time(
            start_date
        )
    )


    end_time_text = (
        format_time(
            end_date
        )
    )


    if (
        start_date.date()
        == end_date.date()
    ):

        heading = (
            f"Leads {start_date_text} - "
            f"{start_time_text} to "
            f"{end_time_text}"
        )

    else:

        heading = (
            f"Leads {start_date_text} "
            f"{start_time_text} - "
            f"{end_date_text} "
            f"{end_time_text}"
        )


    call_section = "\n".join(
        call_leads
    )


    email_section = "\n".join(
        email_leads
    )


    message = (
        f"{heading}\n\n"
        f"Call Leads:-\n"
        f"{call_section}\n\n"
        f"Email Leads:-\n"
        f"{email_section}"
    )


    return {
        "start_date": start_date,
        "end_date": end_date,
        "call_leads": call_leads,
        "email_leads": email_leads,
        "call_lead_count": len(
            call_leads
        ),
        "email_lead_count": len(
            email_leads
        ),
        "message": message,
    }