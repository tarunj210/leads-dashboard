import hashlib

from urllib.parse import urlparse

import pandas as pd

from app.integrations.google_sheets import (
    get_sheets_service,
)


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------


SPREADSHEET_ID = "19L7ZMFqButG0j7UW5HpYeVuwFCLX0B1_5FhtLyihhWI"
RANGE_NAME = "Data!A1:M22"


REQUIRED_COLUMNS = {
    "Seq. No.",
    "Lead Received Date",
    "Customer Name",
    "Customer Email",
    "Customer Service",
    "Customer Phone",
    "Customer Address",
    "Customer Message",
    "Status (In Process / Booked / Not Booked)",
    "Page Url",
    "Page Name",
    "Our Comments",
    "IP Address",
}


COLUMN_MAPPING = {
    "Seq. No.": "seq_no",
    "Lead Received Date": "lead_received_date",
    "Customer Name": "customer_name",
    "Customer Email": "customer_email",
    "Customer Service": "customer_service",
    "Customer Phone": "customer_phone",
    "Customer Address": "customer_address",
    "Customer Message": "customer_message",
    "Status (In Process / Booked / Not Booked)": "status",
    "Page Url": "page_url",
    "Page Name": "page_name",
    "Our Comments": "comments",
    "IP Address": "ip_address",
}


INTERNAL_COLUMNS = [
    "seq_no",
    "lead_received_date",
    "customer_name",
    "customer_email",
    "customer_phone",
    "customer_service",
    "customer_message",
    "customer_address",
    "status",
    "page_url",
    "page_name",
    "comments",
    "ip_address",
]


ALLOWED_STATUSES = {
    "BOOKED",
    "NOT_BOOKED",
    "IN_PROCESS",
}


ROW_HASH_FIELDS = [
    "customer_name",
    "customer_email",
    "customer_phone_normalized",
    "customer_service",
    "customer_message",
    "customer_address",
    "status",
    "page_url",
    "page_name",
]


def fetch_sheet_values() -> list[list]:

    print("FETCH 1: getting sheets service", flush=True)

    service = get_sheets_service()

    print("FETCH 2: service ready", flush=True)

    result = (
        service.spreadsheets()
        .values()
        .get(
            spreadsheetId=SPREADSHEET_ID,
            range=RANGE_NAME,
            valueRenderOption="UNFORMATTED_VALUE",
        )
        .execute()
    )

    print("FETCH 3: Google response received", flush=True)

    return result.get("values", [])

def create_dataframe(values: list[list[str]]) -> pd.DataFrame:
    if not values:
        return pd.DataFrame()

    headers = values[1]
    rows = values[2:]

    column_count = len(headers)

    normalized_rows = []

    for row in rows:
        normalized_row = (
            row
            + [""] * (column_count - len(row))
        )

        normalized_rows.append(
            normalized_row[:column_count]
        )

    return pd.DataFrame(
        normalized_rows,
        columns=headers,
    )

def validate_schema(df: pd.DataFrame) -> None:
    df.columns = [
        column.strip()
        for column in df.columns
    ]

    duplicate_columns = df.columns[
        df.columns.duplicated()
    ].tolist()

    if duplicate_columns:
        raise ValueError(
            f"Duplicate columns detected: {duplicate_columns}"
        )

    actual_columns = set(df.columns)

    missing_columns = (
        REQUIRED_COLUMNS - actual_columns
    )

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            f"{sorted(missing_columns)}"
        )


def normalize_columns(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.rename(
        columns=COLUMN_MAPPING
    )

    duplicate_columns = df.columns[
        df.columns.duplicated()
    ].tolist()

    if duplicate_columns:
        raise ValueError(
            "Duplicate internal columns detected: "
            f"{duplicate_columns}"
        )

    return df[INTERNAL_COLUMNS].copy()

TEXT_COLUMNS = [
    "customer_name",
    "customer_email",
    "customer_phone",
    "customer_service",
    "customer_message",
    "customer_address",
    "status",
    "page_url",
    "page_name",
    "comments",
    "ip_address",
]


def normalize_text_values(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    for column in TEXT_COLUMNS:
        df.loc[:, column] = (
            df.loc[:, column]
            .astype("string")
            .str.strip()
            .replace("", pd.NA)
        )

    return df

def normalize_dates(
    df: pd.DataFrame,
) -> pd.DataFrame:

    print("RAW DATE VALUES:")
    print(df["lead_received_date"].head(10).tolist())

    df["lead_received_date"] = pd.to_datetime(
        df["lead_received_date"],
        unit="D",
        origin="1899-12-30",
        errors="coerce",
    )

    print("PARSED DATE VALUES:")
    print(df["lead_received_date"].head(10).tolist())

    return df

def normalize_status(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df["status"] = (
        df["status"]
        .str.upper()
        .str.replace(
            r"\s+",
            "_",
            regex=True,
        )
    )

    return df

def normalize_email(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df["customer_email"] = (
        df["customer_email"]
        .str.strip()
        .str.lower()
    )

    return df

def normalize_phone(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df["customer_phone_normalized"] = (
        df["customer_phone"]
        .str.replace(
            r"[\s\-\(\)]",
            "",
            regex=True,
        )
    )

    return df

def extract_domain_url(url):
    if pd.isna(url):
        return pd.NA

    parsed = urlparse(url)

    if not parsed.scheme:
        parsed = urlparse(
            "https://" + url
        )

    domain = parsed.netloc.lower()

    if domain.startswith("www."):
        domain = domain[4:]

    if not domain:
        return pd.NA

    return f"https://{domain}"

def normalize_page_url(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df["page_url"] = (
        df["page_url"]
        .apply(extract_domain_url)
    )

    return df

def validate_leads(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:

    df = df.copy()

    df["validation_errors"] = [
        [] for _ in range(len(df))
    ]

    required_fields = [
        "lead_received_date",
        "status",
    ]

    # Required fields
    for field in required_fields:
        mask = df[field].isna()

        df.loc[
            mask,
            "validation_errors",
        ] = (
            df.loc[
                mask,
                "validation_errors",
            ]
            .apply(
                lambda errors:
                errors
                + [
                    f"MISSING_{field.upper()}"
                ]
            )
        )

    # Status
    invalid_status_mask = (
        df["status"].notna()
        & ~df["status"].isin(
            ALLOWED_STATUSES
        )
    )

    df.loc[
        invalid_status_mask,
        "validation_errors",
    ] = (
        df.loc[
            invalid_status_mask,
            "validation_errors",
        ]
        .apply(
            lambda errors:
            errors + ["INVALID_STATUS"]
        )
    )

    # Contact details
    missing_contact_mask = (
        df["customer_email"].isna()
        & df["customer_phone"].isna()
    )

    df.loc[
        missing_contact_mask,
        "validation_errors",
    ] = (
        df.loc[
            missing_contact_mask,
            "validation_errors",
        ]
        .apply(
            lambda errors:
            errors
            + ["MISSING_CONTACT_METHOD"]
        )
    )

    invalid_mask = (
        df["validation_errors"]
        .str.len()
        .gt(0)
    )

    valid_df = (
        df.loc[~invalid_mask]
        .copy()
    )

    invalid_df = (
        df.loc[invalid_mask]
        .copy()
    )

    return valid_df, invalid_df

def safe_value(value) -> str:
    if pd.isna(value):
        return ""

    return str(value)

def generate_lead_key(row) -> str:
    source = "|".join(
        [
            safe_value(
                row["lead_received_date"]
            ),
            safe_value(
                row["customer_email"]
            ),
            safe_value(
                row["customer_phone_normalized"]
            ),
            safe_value(
                row["page_url"]
            ),
        ]
    )

    return hashlib.sha256(
        source.encode("utf-8")
    ).hexdigest()

def generate_row_hash(row) -> str:
    source = "|".join(
        safe_value(row[field])
        for field in ROW_HASH_FIELDS
    )

    return hashlib.sha256(
        source.encode("utf-8")
    ).hexdigest()

def add_hashes(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    df["lead_key"] = df.apply(
        generate_lead_key,
        axis=1,
    )

    df["row_hash"] = df.apply(
        generate_row_hash,
        axis=1,
    )

    return df

def load_valid_leads() -> pd.DataFrame:

    print("LOADER 1: fetch start", flush=True)

    values = fetch_sheet_values()

    print("LOADER 2: fetch complete", flush=True)

    if not values:
        return pd.DataFrame()

    print("LOADER 3: create dataframe", flush=True)

    df = create_dataframe(values)

    print("LOADER 4: validate schema", flush=True)

    validate_schema(df)

    print("LOADER 5: normalize columns", flush=True)

    df = normalize_columns(df)

    print("LOADER 6: normalize text", flush=True)

    df = normalize_text_values(df)

    print("LOADER 7: normalize dates", flush=True)

    df = normalize_dates(df)

    print("LOADER 8: normalize status", flush=True)

    df = normalize_status(df)

    print("LOADER 9: normalize email", flush=True)

    df = normalize_email(df)

    print("LOADER 10: normalize phone", flush=True)

    df = normalize_phone(df)

    print("LOADER 11: normalize URL", flush=True)

    df = normalize_page_url(df)

    print("LOADER 12: validate leads", flush=True)

    valid_df, invalid_df = validate_leads(df)

    print("LOADER 13: add hashes", flush=True)

    valid_df = add_hashes(valid_df)

    print("LOADER 14: done", flush=True)

    return valid_df