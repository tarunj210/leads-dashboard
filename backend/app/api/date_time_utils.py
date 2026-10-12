from datetime import datetime


def build_datetime_range(
    *,
    start_date: str | None,
    start_time: str | None,
    end_date: str | None,
    end_time: str | None,
) -> tuple[
    datetime | None,
    datetime | None,
]:
    """
    Convert the frontend's separate date/time
    query parameters into datetime boundaries.

    Start:
        selected minute starts at :00

    End:
        selected minute ends at :59

    Examples:
        2026-10-12 + 09:30
        -> 2026-10-12 09:30:00

        2026-10-12 + 17:45
        -> 2026-10-12 17:45:59
    """

    start_datetime = None
    end_datetime = None


    if start_date:

        effective_start_time = (
            start_time
            or "00:00"
        )

        try:
            start_datetime = (
                datetime.strptime(
                    f"{start_date} "
                    f"{effective_start_time}",
                    "%Y-%m-%d %H:%M",
                )
            )

        except ValueError as exc:

            raise ValueError(
                "Invalid start date/time."
            ) from exc


    if end_date:

        effective_end_time = (
            end_time
            or "23:59"
        )

        try:
            end_datetime = (
                datetime.strptime(
                    f"{end_date} "
                    f"{effective_end_time}",
                    "%Y-%m-%d %H:%M",
                )
                .replace(
                    second=59,
                    microsecond=999999,
                )
            )

        except ValueError as exc:

            raise ValueError(
                "Invalid end date/time."
            ) from exc


    if (
        start_datetime is not None
        and
        end_datetime is not None
        and
        end_datetime < start_datetime
    ):

        raise ValueError(
            "End date and time must be "
            "after the start date and time."
        )


    return (
        start_datetime,
        end_datetime,
    )