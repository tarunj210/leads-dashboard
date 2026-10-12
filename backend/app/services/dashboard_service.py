from datetime import datetime

from app.database import SessionLocal

from app.repositories.dashboard_repository import (
    get_dashboard_summary,
    get_filter_options,
    get_dashboard_data,
    get_filtered_leads,
    get_unique_emails,
)


def get_summary(
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    service: str = "all",
    domain: str = "all",
    page_name: str = "all",
    status: str = "all",
):

    with SessionLocal() as db:

        return get_dashboard_summary(
            db,
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )


def get_filters():

    with SessionLocal() as db:

        return get_filter_options(
            db
        )


def get_data(
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    service: str = "all",
    domain: str = "all",
    page_name: str = "all",
    status: str = "all",
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
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    service: str = "all",
    domain: str = "all",
    page_name: str = "all",
    status: str = "all",
    page: int = 1,
    page_size: int = 25,
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


def get_unique_email_leads(
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    service: str = "all",
    domain: str = "all",
    page_name: str = "all",
    status: str = "all",
):

    with SessionLocal() as db:

        return get_unique_emails(
            db,
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )