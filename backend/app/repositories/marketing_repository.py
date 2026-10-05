from collections import defaultdict
from datetime import date

from app.models import MobileLead


MIN_CALLS = 3
MAX_DURATION_SECONDS = 60
MIN_UNIQUE_DAYS = 3


def get_marketing_calls(
    db,
):
    """
    Marketing CLI rules:

    1. Ignore rows with missing CLI,
       billed_duration or connect_time.

    2. Deduplicate calls by:
       CLI + connect_time.

    3. Group calls by CLI.

    4. A CLI qualifies only when:
       - it has at least 3 unique calls
       - every call is under 60 seconds
       - calls occurred across at least 3 unique days

    5. Return all deduplicated calls
       belonging to qualifying CLIs.
    """

    rows = (
        db.query(
            MobileLead
        )
        .filter(
            MobileLead.cli.isnot(None)
        )
        .filter(
            MobileLead.billed_duration.isnot(None)
        )
        .filter(
            MobileLead.connect_time.isnot(None)
        )
        .order_by(
            MobileLead.connect_time.asc(),
            MobileLead.id.asc(),
        )
        .all()
    )


    # =========================================
    # Deduplicate:
    # CLI + connect_time
    # =========================================

    deduplicated_calls = []

    seen_calls = set()


    for row in rows:

        call_key = (
            row.cli,
            row.connect_time,
        )


        if call_key in seen_calls:
            continue


        seen_calls.add(
            call_key
        )

        deduplicated_calls.append(
            row
        )


    # =========================================
    # Group calls by CLI
    # =========================================

    calls_by_cli = defaultdict(
        list
    )


    for row in deduplicated_calls:

        calls_by_cli[
            row.cli
        ].append(
            row
        )


    # =========================================
    # Determine qualifying CLIs
    # =========================================

    marketing_clis = set()


    for cli, calls in calls_by_cli.items():

        total_calls = len(
            calls
        )


        # Rule 1:
        # At least 3 unique calls
        if (
            total_calls
            < MIN_CALLS
        ):
            continue


        # Rule 2:
        # Every call must be < 60 sec
        all_calls_short = all(
            call.billed_duration
            < MAX_DURATION_SECONDS
            for call in calls
        )


        if not all_calls_short:
            continue


        # Rule 3:
        # Activity across >= 3 days
        unique_days = {
            call.connect_time.date()
            for call in calls
        }


        if (
            len(unique_days)
            < MIN_UNIQUE_DAYS
        ):
            continue


        marketing_clis.add(
            cli
        )


    # =========================================
    # Return calls belonging to
    # qualifying CLIs
    # =========================================

    return [
        row
        for row in deduplicated_calls
        if row.cli in marketing_clis
    ]