from sqlalchemy import case, func

from app.models import Lead


EXCLUDED_PAGE_NAMES = {
    "Contact Us",
    "Contact us",
    "Home",
    "About Us",
    "Privacy Policy",
    "Terms and Conditions",
}

def get_available_dates(db):
    rows = (
        db.query(Lead.lead_received_date)
        .filter(Lead.lead_received_date.isnot(None))
        .distinct()
        .order_by(Lead.lead_received_date)
        .all()
    )

    return [
        row[0]
        for row in rows
    ]

def get_date_bounds(db):
    result = (
        db.query(
            func.min(Lead.lead_received_date),
            func.max(Lead.lead_received_date),
        )
        .one()
    )

    return {
        "min_date": result[0],
        "max_date": result[1],
    }


def apply_lead_filters(
    query,
    *,
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
    exclude=None,
):
    # Date filter
    if exclude != "date":
        if start_date is not None:
            query = query.filter(
                Lead.lead_received_date >= start_date
            )

        if end_date is not None:
            query = query.filter(
                Lead.lead_received_date <= end_date
            )

    # Service filter
    if exclude != "service" and service != "all":
        query = query.filter(
            Lead.customer_service == service
        )

    # Domain filter
    if exclude != "domain" and domain != "all":
        query = query.filter(
            Lead.page_url == domain
        )

    # Page name filter
    if exclude != "page_name" and page_name != "all":
        query = query.filter(
            Lead.page_name == page_name
        )

    # Status filter
    if exclude != "status" and status != "all":
        query = query.filter(
            Lead.status == status
        )

    return query


def get_dashboard_summary(
    db,
    *,
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    query = db.query(
        func.count(Lead.id).label(
            "total_leads"
        ),

        func.sum(
            case(
                (
                    Lead.status == "BOOKED",
                    1,
                ),
                else_=0,
            )
        ).label(
            "booked"
        ),

        func.sum(
            case(
                (
                    Lead.status == "NOT_BOOKED",
                    1,
                ),
                else_=0,
            )
        ).label(
            "not_booked"
        ),

        func.sum(
            case(
                (
                    Lead.status == "IN_PROCESS",
                    1,
                ),
                else_=0,
            )
        ).label(
            "in_process"
        ),
    )


    query = apply_lead_filters(
        query,
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
    )


    result = query.one()


    total_leads = (
        result.total_leads
        or 0
    )

    booked = (
        result.booked
        or 0
    )

    not_booked = (
        result.not_booked
        or 0
    )

    in_process = (
        result.in_process
        or 0
    )


    resolved_leads = (
        booked +
        not_booked
    )


    conversion_rate = (
    round(
        booked
        / total_leads
        * 100,
        2,
    )
    if total_leads > 0
    else 0
)


    return {
        "total_leads":
            total_leads,

        "booked":
            booked,

        "not_booked":
            not_booked,

        "in_process":
            in_process,

        "conversion_rate":
            round(
                conversion_rate,
                2,
            ),
    }


def get_filter_options(db):
    services = (
        db.query(Lead.customer_service)
        .filter(
            Lead.customer_service.isnot(None)
        )
        .distinct()
        .order_by(
            Lead.customer_service
        )
        .all()
    )

    domains = (
        db.query(Lead.page_url)
        .filter(
            Lead.page_url.isnot(None)
        )
        .distinct()
        .order_by(
            Lead.page_url
        )
        .all()
    )

    page_names = (
        db.query(Lead.page_name)
        .filter(
            Lead.page_name.isnot(None)
        )
        .filter(
            ~Lead.page_name.in_(
                EXCLUDED_PAGE_NAMES
            )
        )
        .distinct()
        .order_by(
            Lead.page_name
        )
        .all()
    )

    return {
        "services": [
            row[0]
            for row in services
        ],
        "domains": [
            row[0]
            for row in domains
        ],
        "page_names": [
            row[0]
            for row in page_names
        ],
        "statuses": [
            "BOOKED",
            "NOT_BOOKED",
            "IN_PROCESS",
        ],
    }


def get_faceted_filter_options(
    db,
    *,
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    service_query = apply_lead_filters(
        db.query(
            Lead.customer_service
        ),
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
        exclude="service",
    )

    domain_query = apply_lead_filters(
        db.query(
            Lead.page_url
        ),
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
        exclude="domain",
    )

    page_name_query = apply_lead_filters(
        db.query(
            Lead.page_name
        ),
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
        exclude="page_name",
    )

    status_query = apply_lead_filters(
        db.query(
            Lead.status
        ),
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
        exclude="status",
    )

    services = (
        service_query
        .filter(
            Lead.customer_service.isnot(None)
        )
        .distinct()
        .order_by(
            Lead.customer_service
        )
        .all()
    )

    domains = (
        domain_query
        .filter(
            Lead.page_url.isnot(None)
        )
        .distinct()
        .order_by(
            Lead.page_url
        )
        .all()
    )

    page_names = (
        page_name_query
        .filter(
            Lead.page_name.isnot(None)
        )
        .filter(
            ~Lead.page_name.in_(
                EXCLUDED_PAGE_NAMES
            )
        )
        .distinct()
        .order_by(
            Lead.page_name
        )
        .all()
    )

    statuses = (
        status_query
        .filter(
            Lead.status.isnot(None)
        )
        .distinct()
        .order_by(
            Lead.status
        )
        .all()
    )

    return {
        "services": [
            row[0]
            for row in services
        ],
        "domains": [
            row[0]
            for row in domains
        ],
        "page_names": [
            row[0]
            for row in page_names
        ],
        "statuses": [
            row[0]
            for row in statuses
        ],
    }


def get_dashboard_data(
    db,
    *,
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    summary = get_dashboard_summary(
        db,
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
    )

    filter_options = (
        get_faceted_filter_options(
            db,
            start_date=start_date,
            end_date=end_date,
            service=service,
            domain=domain,
            page_name=page_name,
            status=status,
        )
    )

    leads_over_time = get_leads_over_time(
    db,
    start_date=start_date,
    end_date=end_date,
    service=service,
    domain=domain,
    page_name=page_name,
    status=status,
)

    leads_by_service = get_leads_by_service(
    db,
    start_date=start_date,
    end_date=end_date,
    service=service,
    domain=domain,
    page_name=page_name,
    status=status,
)

    date_bounds = get_date_bounds(db)

    available_dates = get_available_dates(db)

    return {
    "summary": summary,
    "filter_options": filter_options,
    "date_bounds": date_bounds,
    "available_dates": available_dates,
    "leads_over_time": leads_over_time,
    "leads_by_service": leads_by_service,
}

def get_filtered_leads(
    db,
    *,
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
    page: int = 1,
    page_size: int = 25,
):
    query = apply_lead_filters(
        db.query(Lead),
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
    )

    total = query.count()

    offset = (page - 1) * page_size

    leads = (
        query
        .order_by(
            Lead.lead_received_date.desc(),
            Lead.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    total_pages = (
        (total + page_size - 1)
        // page_size
        if total > 0
        else 0
    )

    items = [
        {
            "id": lead.id,
            "lead_received_date":
                lead.lead_received_date,

            "customer_name":
                lead.customer_name,

            "customer_email":
                lead.customer_email,

            "customer_phone":
                lead.customer_phone,

            "customer_service":
                lead.customer_service,

            "status":
                lead.status,

            "page_url":
                lead.page_url,

            "page_name":
                lead.page_name,
        }
        for lead in leads
    ]

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }

def get_leads_over_time(
    db,
    *,
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    day = func.date(
        Lead.lead_received_date
    )

    query = db.query(
        day.label("date"),
        func.count(Lead.id).label("count"),
    )

    query = apply_lead_filters(
        query,
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
    )

    rows = (
        query
        .group_by(day)
        .order_by(day)
        .all()
    )

    return [
        {
            "date": row.date,
            "count": row.count,
        }
        for row in rows
    ]

def get_leads_by_service(
    db,
    *,
    start_date=None,
    end_date=None,
    service="all",
    domain="all",
    page_name="all",
    status="all",
):
    query = db.query(
        Lead.customer_service.label("service"),
        func.count(Lead.id).label("count"),
    )

    query = apply_lead_filters(
        query,
        start_date=start_date,
        end_date=end_date,
        service=service,
        domain=domain,
        page_name=page_name,
        status=status,
    )

    rows = (
        query
        .filter(
            Lead.customer_service.isnot(None)
        )
        .group_by(
            Lead.customer_service
        )
        .order_by(
            func.count(Lead.id).desc()
        )
        .all()
    )

    return [
        {
            "service": row.service,
            "count": row.count,
        }
        for row in rows
    ]