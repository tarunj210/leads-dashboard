from app.database import SessionLocal

from app.models import Lead

from app.repositories.mobile_dashboard_repository import (
    get_filtered_mobile_calls,
)


def get_overview_summary():

    with SessionLocal() as db:

        # -----------------------------
        # Web
        # -----------------------------

        web_leads = (
            db.query(Lead)
            .count()
        )


        booked = (
            db.query(Lead)
            .filter(
                Lead.status == "BOOKED"
            )
            .count()
        )


        web_conversion_rate = (
            round(
                (
                    booked /
                    web_leads *
                    100
                ),
                2,
            )
            if web_leads > 0
            else 0
        )


        # -----------------------------
        # Mobile
        # -----------------------------

        mobile_rows =get_filtered_mobile_calls(
                db,
                min_duration=60,
            )


        mobile_leads =len(
                mobile_rows
            )


        mobile_unique_cli =len(
                {
                    row.cli
                    for row in mobile_rows
                    if row.cli
                }
            )


        mobile_duration =sum(
                row.billed_duration or 0
                for row in mobile_rows
            )


        # -----------------------------
        # Combined
        # -----------------------------

        total_leads =web_leads + mobile_leads


        web_percentage = (round(
                web_leads /
                total_leads *
                100,
                2,
            )
            if total_leads > 0
            else 0
        )


        mobile_percentage = (round(
                mobile_leads /
                total_leads *
                100,
                2,
            )
            if total_leads > 0
            else 0
        )


        return {
            "total_leads":
                total_leads,

            "web_leads":
                web_leads,

            "mobile_leads":
                mobile_leads,

            "web_percentage":
                web_percentage,

            "mobile_percentage":
                mobile_percentage,

            "web_booked":
                booked,

            "web_conversion_rate":
                web_conversion_rate,

            "mobile_unique_cli":
                mobile_unique_cli,

            "mobile_duration_minutes":
                round(
                    mobile_duration /
                    60,
                    2,
                ),
        }