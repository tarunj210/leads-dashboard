from datetime import datetime

from sqlalchemy import func

from app.models import MobileLead


def apply_mobile_filters(
    query,
    *,
    min_duration: int = 60,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    query = query.filter(
        MobileLead.billed_duration > min_duration
    )

    if start_date is not None:
        query = query.filter(
            MobileLead.connect_time >= start_date
        )

    if end_date is not None:
        query = query.filter(
            MobileLead.connect_time <= end_date
        )

    return query


def get_most_common_cld(
    db,
    *,
    min_duration: int = 60,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    query = db.query(
        MobileLead.cld,
        func.count(
            MobileLead.id
        ).label("count"),
    )

    query = apply_mobile_filters(
        query,
        min_duration=min_duration,
        start_date=start_date,
        end_date=end_date,
    )

    row = (
        query
        .filter(
            MobileLead.cld.isnot(None)
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
        "cld": row.cld,
        "count": row.count,
    }


def get_filtered_mobile_calls(
    db,
    *,
    min_duration: int = 60,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    most_common = get_most_common_cld(
        db,
        min_duration=min_duration,
        start_date=start_date,
        end_date=end_date,
    )

    if most_common is None:
        return []

    most_common_cld = most_common[
        "cld"
    ]

    query = db.query(
        MobileLead
    )

    query = apply_mobile_filters(
        query,
        min_duration=min_duration,
        start_date=start_date,
        end_date=end_date,
    )

    deduplicated = (
        query
        .filter(
            MobileLead.cld
            == most_common_cld
        )
        .filter(
            MobileLead.cli.isnot(None)
        )
        .filter(
            MobileLead.connect_time.isnot(None)
        )
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



def get_mobile_date_range(db):
    row = (
        db.query(
            func.min(MobileLead.connect_time).label("min_date"),
            func.max(MobileLead.connect_time).label("max_date"),
        )
        .first()
    )

    if row is None:
        return {
            "min_date": None,
            "max_date": None,
        }

    return {
        "min_date": row.min_date,
        "max_date": row.max_date,
    }