from app.database import SessionLocal
from app.repositories.dashboard_repository import (
    get_dashboard_summary,
    get_filter_options,
    get_dashboard_data
)


def get_summary(
    date_range="all",
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    with SessionLocal() as db:
        return get_dashboard_summary(
            db,
            date_range=date_range,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )


def get_filters():
    with SessionLocal() as db:
        return get_filter_options(db)


def get_data(
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    with SessionLocal() as db:
        return get_dashboard_data(
            db,
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )

from app.database import SessionLocal

from app.repositories.dashboard_repository import (
    get_dashboard_data,
    get_filtered_leads,
)


def get_data(
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    with SessionLocal() as db:
        return get_dashboard_data(
            db,
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )


def get_leads(
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
    page=1,
    page_size=25,
):
    with SessionLocal() as db:
        return get_filtered_leads(
            db,
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
            page=page,
            page_size=page_size,
        )