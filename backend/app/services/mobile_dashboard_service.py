from datetime import datetime

from app.database import SessionLocal

from app.repositories.mobile_dashboard_repository import (
    get_mobile_date_range,
    get_most_common_cld,
    get_filtered_mobile_calls,
)

from app.constants.mobile_tracking_numbers import (
    get_tracking_number_options,
)


def get_mobile_summary(
    *,
    min_duration: int = 60,
    max_duration: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    view_mode: str = "forwarded",
    selected_cld: str | None = None,
):
    with SessionLocal() as db:

        most_common_cld = None

        if view_mode == "forwarded":
            most_common_cld = most_common_cld = get_most_common_cld(db)


        rows = get_filtered_mobile_calls(
            db,
            min_duration=min_duration,
            max_duration=max_duration,
            start_date=start_date,
            end_date=end_date,
            view_mode=view_mode,
            selected_cld=selected_cld,
        )


        total_calls = len(
            rows
        )


        total_duration = sum(
            row.billed_duration or 0
            for row in rows
        )


        total_cost = sum(
            float(
                row.cost or 0
            )
            for row in rows
        )


        unique_cli = len(
            {
                row.cli
                for row in rows
                if row.cli
            }
        )


        active_cld = None

        if view_mode == "forwarded":

            if most_common_cld:
                active_cld = (
                    most_common_cld[
                        "cld"
                    ]
                )

        elif view_mode == "website":

            active_cld = (
                selected_cld
            )


        return {

            "start_date":
                start_date,

            "end_date":
                end_date,

            "min_duration":
                min_duration,

            "max_duration":
                max_duration,

            "view_mode":
                view_mode,

            "active_cld":
                active_cld,

            "most_common_cld":
                (
                    most_common_cld["cld"]
                    if most_common_cld
                    else None
                ),

            "most_common_cld_count":
                (
                    most_common_cld["count"]
                    if most_common_cld
                    else 0
                ),

            "total_calls":
                total_calls,

            "unique_cli":
                unique_cli,

            "total_duration_seconds":
                total_duration,

            "total_duration_minutes":
                round(
                    total_duration / 60,
                    2,
                ),

            "total_cost":
                round(
                    total_cost,
                    4,
                ),
        }


def get_mobile_calls(
    *,
    min_duration: int = 60,
    max_duration: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    view_mode: str = "forwarded",
    selected_cld: str | None = None,
    page: int = 1,
    page_size: int = 25,
):
    with SessionLocal() as db:

        rows = get_filtered_mobile_calls(
            db,
            min_duration=min_duration,
            max_duration=max_duration,
            start_date=start_date,
            end_date=end_date,
            view_mode=view_mode,
            selected_cld=selected_cld,
        )


        total = len(
            rows
        )


        start = (
            page - 1
        ) * page_size


        end = (
            start +
            page_size
        )


        paginated_rows = rows[
            start:end
        ]


        return {

            "page":
                page,

            "page_size":
                page_size,

            "total":
                total,

            "total_pages":
                (
                    (
                        total +
                        page_size -
                        1
                    )
                    //
                    page_size
                ),

            "items": [

                {
                    "id":
                        row.id,

                    "connect_time":
                        row.connect_time,

                    "cli":
                        row.cli,

                    "cld":
                        row.cld,

                    "prefix":
                        row.prefix,

                    "billed_duration":
                        row.billed_duration,

                    "result":
                        row.result,

                    "cost":
                        (
                            float(
                                row.cost
                            )
                            if row.cost is not None
                            else None
                        ),

                    "remote_ip":
                        row.remote_ip,

                    "access_list":
                        row.access_list,
                }

                for row in paginated_rows

            ],
        }


def get_mobile_filter_options():

    with SessionLocal() as db:

        date_range = (
            get_mobile_date_range(
                db
            )
        )

        tracking_numbers = (
            get_tracking_number_options()
        )

        return {

            "date_range":
                date_range,

            "duration": {

                "default_min":
                    60,

                "default_max":
                    None,

            },

            "tracking_numbers":
                tracking_numbers,

        }