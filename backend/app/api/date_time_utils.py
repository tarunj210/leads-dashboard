from datetime import datetime


def normalize_date(
    value: str | None,
) -> str | None:
    """
    Accept either:

    2026-09-09

    or:

    2026-09-09T00:00:00

    and always return:

    2026-09-09
    """

    if not value:
        return None


    return (
        value
        .split("T")[0]
        .split(" ")[0]
    )


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

    start_datetime = None
    end_datetime = None


    normalized_start_date =normalize_date(start_date)


    normalized_end_date =normalize_date(end_date)


    if normalized_start_date:

        effective_start_time = (
            start_time
            or "00:00"
        )


        try:

            start_datetime =datetime.strptime(
                    (
                        f"{normalized_start_date} "
                        f"{effective_start_time}"
                    ),
                    "%Y-%m-%d %H:%M",
                )


        except ValueError as exc:

            raise ValueError(
                "Invalid start date/time."
            ) from exc


    if normalized_end_date:

        effective_end_time = (
            end_time
            or "23:59"
        )


        try:

            end_datetime = (
                datetime.strptime(
                    (
                        f"{normalized_end_date} "
                        f"{effective_end_time}"
                    ),
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