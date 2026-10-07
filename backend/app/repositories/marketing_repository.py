from collections import defaultdict

from app.models import MobileLead


MIN_CALLS = 3
MAX_DURATION_SECONDS = 60
MIN_UNIQUE_DAYS = 3


MARKETING_CLDS = {
    "61485839092",
    "61408842274",
    "61485839070",
    "61485839060",
    "61488886022",
    "61485839147",
    "61485839148",
    "61447839299",
    "61485839058",
    "61485839135",
    "61485839131",
    "61488825156",
    "61485839047",
    "61485839133",
    "61488825166",
    "61485839076",
    "61485838983",
    "61488825203",
    "61480099123",
    "61488825192",
    "61488885799",
    "61488885772",
    "61480041176",
    "61480041162",
    "61488825321",
    "61485839146",
    "61485839063",
    "61480059684",
    "61480064693",
    "61485834219",
    "61488899230",
    "61480013560",
    "61480064694",
    "61485833776",
    "61480064692",
    "61480012485",
    "61480058425",
    "61488899200",
    "61480060298",
    "61480059097",
    "61480058435",
    "61480037771",
    "61480061330",
    "61480058429",
    "61488898845",
    "61480829928",
    "61480830255",
    "61480830213",
    "61480830090",
    "61480829895",
    "61480829936",
    "61480830261",
    "61480829914",
    "61480829939",
    "61485962127",
    "61485998467",
    "61480830254",
    "61468229206",
    "61468229324",
    "61468229412",
    "61468229496",
    "61468229526",
    "61370646500",
    "61370646501",
    "61370646502",
    "61370646503",
    "61370646504",
    "61370646505",
    "61468229587",
    "61468229585",
}


def get_marketing_calls(
    db,
):

    rows = (
        db.query(
            MobileLead
        )
        .filter(
            MobileLead.cli.isnot(None)
        )
        .filter(
            MobileLead.cld.isnot(None)
        )
        .filter(
            MobileLead.cld.in_(
                MARKETING_CLDS
            )
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


    # ---------------------------------
    # Deduplicate:
    # CLI + connect_time
    # ---------------------------------

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


    # ---------------------------------
    # Group calls by CLI
    # ---------------------------------

    calls_by_cli = defaultdict(
        list
    )


    for row in deduplicated_calls:

        calls_by_cli[
            row.cli
        ].append(
            row
        )


    marketing_clis = set()


    # ---------------------------------
    # Marketing rules
    # ---------------------------------

    for cli, calls in (
        calls_by_cli.items()
    ):

        total_calls = len(
            calls
        )


        # At least 3 calls
        if total_calls < MIN_CALLS:
            continue


        # Every call must be
        # shorter than 60 seconds
        all_calls_short = all(
            call.billed_duration
            < MAX_DURATION_SECONDS
            for call in calls
        )


        if not all_calls_short:
            continue


        # Calls must occur on
        # at least 3 distinct days
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


    # ---------------------------------
    # Return all calls belonging to
    # qualifying marketing CLIs
    # ---------------------------------

    return [
        row
        for row in deduplicated_calls
        if row.cli in marketing_clis
    ]