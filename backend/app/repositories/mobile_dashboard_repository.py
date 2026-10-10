from datetime import datetime

from sqlalchemy import func

from app.models import MobileLead


INVALID_CLI_VALUES = {
    "anonymous",
    "private",
    "unknown",
    "unavailable",
    "restricted",
}


# =========================================
# Valid CLI filter
# =========================================

def apply_valid_cli_filter(
    query,
):
    """
    Keep only CLI values that look like
    valid phone numbers.

    Examples rejected:
    - NULL
    - Anonymous
    - Private
    - Unknown
    - Unavailable
    - Restricted
    - arbitrary text
    """

    # CLI must exist
    query = query.filter(
        MobileLead.cli.isnot(
            None
        )
    )


    # Remove blank values
    query = query.filter(
        func.trim(
            MobileLead.cli
        ) != ""
    )


    # Reject known non-phone values
    query = query.filter(
        func.lower(
            func.trim(
                MobileLead.cli
            )
        ).notin_(
            INVALID_CLI_VALUES
        )
    )


    # Strip everything except digits.
    #
    # Examples:
    #
    # +61 412 345 678
    # -> 61412345678
    #
    # (03) 9123 4567
    # -> 0391234567
    #
    digits_only = func.regexp_replace(
        MobileLead.cli,
        r"\D",
        "",
        "g",
    )


    # Accept reasonable phone-number lengths
    query = query.filter(
        func.length(
            digits_only
        ).between(
            8,
            15,
        )
    )


    return query


# =========================================
# Common mobile filters
# =========================================

def apply_mobile_filters(
    query,
    *,
    min_duration: int = 60,
    max_duration: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):

    # Minimum duration
    query = query.filter(
        MobileLead.billed_duration
        >= min_duration
    )


    # Maximum duration
    if max_duration is not None:

        query = query.filter(
            MobileLead.billed_duration
            <= max_duration
        )


    # Start date/time
    if start_date is not None:

        query = query.filter(
            MobileLead.connect_time
            >= start_date
        )


    # End date/time
    if end_date is not None:

        query = query.filter(
            MobileLead.connect_time
            <= end_date
        )


    return query


# =========================================
# Most common forwarded CLD
# =========================================

def get_most_common_cld(
    db,
    *,
    min_duration: int = 60,
    max_duration: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):

    query = db.query(

        MobileLead.cld,

        func.count(
            MobileLead.id
        ).label(
            "count"
        ),

    )


    # Apply date + duration filters
    query = apply_mobile_filters(
        query,
        min_duration=min_duration,
        max_duration=max_duration,
        start_date=start_date,
        end_date=end_date,
    )


    # Invalid callers should not contribute
    # towards determining the most common CLD.
    query = apply_valid_cli_filter(
        query
    )


    row = (
        query

        .filter(
            MobileLead.cld.isnot(
                None
            )
        )

        .filter(
            func.trim(
                MobileLead.cld
            ) != ""
        )

        .group_by(
            MobileLead.cld
        )

        .order_by(
            func.count(
                MobileLead.id
            ).desc()
        )

        .first()
    )


    if row is None:

        return None


    return {

        "cld":
            row.cld,

        "count":
            row.count,

    }


# =========================================
# Filtered mobile calls
# =========================================

def get_filtered_mobile_calls(
    db,
    *,
    min_duration: int = 60,
    max_duration: int | None = None,

    start_date: datetime | None = None,
    end_date: datetime | None = None,

    view_mode: str = "forwarded",

    selected_cld: str | None = None,
):

    # =====================================
    # Determine which CLD to use
    # =====================================

    if view_mode == "website":

        if not selected_cld:

            return []


        target_cld = (
            selected_cld
        )


    else:

        most_common = (
            get_most_common_cld(
                db,
                min_duration=min_duration,
                max_duration=max_duration,
                start_date=start_date,
                end_date=end_date,
            )
        )


        if most_common is None:

            return []


        target_cld = (
            most_common[
                "cld"
            ]
        )


    # =====================================
    # Base query
    # =====================================

    query = db.query(
        MobileLead
    )


    # Date + duration
    query = apply_mobile_filters(
        query,
        min_duration=min_duration,
        max_duration=max_duration,
        start_date=start_date,
        end_date=end_date,
    )


    # Valid phone-number CLI only
    query = apply_valid_cli_filter(
        query
    )


    # Must have connect time
    query = query.filter(
        MobileLead.connect_time.isnot(
            None
        )
    )


    # Selected/forwarded CLD
    query = query.filter(
        MobileLead.cld
        == target_cld
    )


    # =====================================
    # Deduplicate
    #
    # One row per:
    #
    # CLI + connect_time
    # =====================================

    deduplicated = (

        query

        .distinct(
            MobileLead.cli,
            MobileLead.connect_time,
        )

        .order_by(
            MobileLead.cli,
            MobileLead.connect_time,
            MobileLead.id,
        )

        .subquery()

    )


    # =====================================
    # Retrieve final MobileLead objects
    # =====================================

    rows = (

        db.query(
            MobileLead
        )

        .join(
            deduplicated,

            MobileLead.id
            == deduplicated.c.id,
        )

        .order_by(
            MobileLead.connect_time.asc(),
            MobileLead.id.asc(),
        )

        .all()

    )


    return rows


# =========================================
# Mobile date range
# =========================================

def get_mobile_date_range(
    db,
):

    row = (

        db.query(

            func.min(
                MobileLead.connect_time
            ).label(
                "min_date"
            ),

            func.max(
                MobileLead.connect_time
            ).label(
                "max_date"
            ),

        )

        .first()

    )


    if row is None:

        return {

            "min_date":
                None,

            "max_date":
                None,

        }


    return {

        "min_date":
            row.min_date,

        "max_date":
            row.max_date,

    }