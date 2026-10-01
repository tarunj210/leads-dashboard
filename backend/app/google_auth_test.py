import os
import pandas as pd
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from urllib.parse import urlparse
import hashlib

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
    "IP Address"
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
    "IP Address": "ip_address"


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
    "ip_address"
]
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
]

TOKEN_FILE = "token.json"
CREDENTIALS_FILE = "credentials/credentials.json"

SPREADSHEET_ID = "19L7ZMFqButG0j7UW5HpYeVuwFCLX0B1_5FhtLyihhWI"
RANGE_NAME = "Data!A1:M22"


credentials = None


if os.path.exists(TOKEN_FILE):
    credentials = Credentials.from_authorized_user_file(
        TOKEN_FILE,
        SCOPES,
    )


if not credentials or not credentials.valid:

    if (
        credentials
        and credentials.expired
        and credentials.refresh_token
    ):
        credentials.refresh(Request())

    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE,
            SCOPES,
        )

        credentials = flow.run_local_server(port=0)

    with open(TOKEN_FILE, "w") as token:
        token.write(credentials.to_json())


service = build(
    "sheets",
    "v4",
    credentials=credentials,
)


sheet = service.spreadsheets()


result = (
    sheet
    .values()
    .get(
        spreadsheetId=SPREADSHEET_ID,
        range=RANGE_NAME,
    )
    .execute()
)


values = result.get("values", [])


if not values:
    print("No data found.")

else:
    headers = values[1]
    rows = values[2:]

    print("Headers:", headers)
    print("Number of columns:", len(headers))
    print("Number of data rows:", len(rows))

    column_count = len(headers)

    normalized_rows = []

    for row in rows:
        normalized_row = row + [""] * (
            column_count - len(row)
        )

        normalized_rows.append(
            normalized_row[:column_count]
        )


    df = pd.DataFrame(
        normalized_rows,
        columns=headers,
    )


    # Remove accidental whitespace from spreadsheet headers.
    df.columns = [
        column.strip()
        for column in df.columns
    ]


    # Check duplicate source columns.
    duplicate_columns = df.columns[
        df.columns.duplicated()
    ].tolist()

    if duplicate_columns:
        raise ValueError(
            f"Duplicate columns detected: {duplicate_columns}"
        )


    # Validate required source columns.
    actual_columns = set(df.columns)

    missing_columns = REQUIRED_COLUMNS - actual_columns

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
        )


    extra_columns = actual_columns - REQUIRED_COLUMNS

    if extra_columns:
        print(
            "Additional columns detected:",
            sorted(extra_columns),
        )


    print("Schema validation passed")


    # Convert spreadsheet names to our internal names.
    df = df.rename(
        columns=COLUMN_MAPPING
    )


    # Verify our mapping didn't create duplicate names.
    duplicate_internal_columns = df.columns[
        df.columns.duplicated()
    ].tolist()

    if duplicate_internal_columns:
        raise ValueError(
            f"Duplicate internal columns detected: "
            f"{duplicate_internal_columns}"
        )


    # Put fields into a predictable application order.
    df = df[INTERNAL_COLUMNS]


    print("\nInternal columns:")
    print(df.columns.tolist())

    print("\nSample:")
    print(df.head())


    for column in INTERNAL_COLUMNS:
        df[column] = (
            df[column]
            .str.strip()
            .replace("", pd.NA)
        )


    print("\nMissing values:")
    print(df.isna().sum())

    print("\nSample after basic normalization:")
    print(df.head())

    raw_dates = df["lead_received_date"].copy()

    df["lead_received_date"] = pd.to_datetime(
        df["lead_received_date"],
        format="%d/%m/%Y",
        errors="coerce",
    )

    invalid_date_mask = (
        raw_dates.notna()
        & df["lead_received_date"].isna()
    )

    invalid_date_count = invalid_date_mask.sum()

    print(
        "Invalid lead_received_date values:",
        invalid_date_count,
    )

    print(
        "\nParsed dates:"
    )

    print(
        df["lead_received_date"].head()
    )

    df["status"] = (
    df["status"]
    .str.upper()
    .str.replace(r"\s+", "_", regex=True)
)

    
    df["customer_email"] = (
    df["customer_email"]
    .str.strip()
    .str.lower()
)
    EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    invalid_email_mask = (
    df["customer_email"].notna()
    & ~df["customer_email"].str.match(EMAIL_PATTERN)
)

    invalid_email_count = invalid_email_mask.sum()

    print(
        "Invalid email values:",
        invalid_email_count,
    )

    if invalid_email_count > 0:
        print(
            df.loc[
                invalid_email_mask,
                ["customer_name", "customer_email"]
            ]
        )

    df["customer_phone_normalized"] = (
    df["customer_phone"]
    .str.replace(r"[\s\-\(\)]", "", regex=True)
)
    print(
    df["customer_phone_normalized"]
    .dropna()
    .str.len()
    .value_counts()
)

    print(df["customer_phone_normalized"].head())

    def extract_domain_url(url):
        if pd.isna(url):
            return pd.NA

        parsed = urlparse(url)

        if not parsed.scheme:
            parsed = urlparse("https://" + url)

        domain = parsed.netloc.lower()

        if domain.startswith("www."):
            domain = domain[4:]

        if not domain:
            return pd.NA

        return f"https://{domain}"

    df["page_url"] = df["page_url"].apply(
    extract_domain_url)

    print(df["page_url"].head())


    REQUIRED_LEAD_FIELDS = [
    "lead_received_date",
    "status",
]

    ALLOWED_STATUSES = {
        "BOOKED",
        "NOT_BOOKED",
        "IN_PROCESS",
    }


    # -----------------------------
    # 1. Start with no errors
    # -----------------------------
    df["validation_errors"] = [
        [] for _ in range(len(df))
    ]


    # -----------------------------
    # 2. Check required fields
    # -----------------------------
    for field in REQUIRED_LEAD_FIELDS:

        missing_mask = df[field].isna()

        df.loc[
            missing_mask,
            "validation_errors",
        ] = (
            df.loc[
                missing_mask,
                "validation_errors",
            ]
            .apply(
                lambda errors:
                errors + [
                    f"MISSING_{field.upper()}"
                ]
            )
        )


    # -----------------------------
    # 3. Check status values
    # -----------------------------
    invalid_status_mask = (
        df["status"].notna()
        & ~df["status"].isin(ALLOWED_STATUSES)
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


    # -----------------------------
    # 4. Require at least one
    #    contact method
    # -----------------------------
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
            errors + ["MISSING_CONTACT_METHOD"]
        )
    )


    # -----------------------------
    # 5. Identify invalid rows
    # -----------------------------
    invalid_row_mask = (
        df["validation_errors"]
        .str.len()
        .gt(0)
    )


    # -----------------------------
    # 6. Split valid and invalid rows
    # -----------------------------
    valid_df = (
        df.loc[~invalid_row_mask]
        .copy()
    )

    invalid_df = (
        df.loc[invalid_row_mask]
        .copy()
    )


    # -----------------------------
    # 7. Print summary
    # -----------------------------
    print("\nValidation summary")
    print("------------------")

    print("Total rows:", len(df))
    print("Valid rows:", len(valid_df))
    print("Invalid rows:", len(invalid_df))


    # -----------------------------
    # 8. Inspect invalid rows
    # -----------------------------
    if not invalid_df.empty:

        print("\nInvalid rows:")

        print(
            invalid_df[
                [
                    "customer_name",
                    "customer_email",
                    "customer_phone",
                    "lead_received_date",
                    "status",
                    "validation_errors",
                ]
            ]
        )

    def safe_value(value):
        if pd.isna(value):
            return ""

        return str(value)

    def build_lead_key_source(row):
        return "|".join(
            [
                safe_value(row["lead_received_date"]),
                safe_value(row["customer_email"]),
                safe_value(row["customer_phone_normalized"]),
                safe_value(row["page_url"]),
            ]
    )


    def generate_lead_key(row):
        key_source = build_lead_key_source(row)

        return hashlib.sha256(
            key_source.encode("utf-8")
        ).hexdigest()


    valid_df["lead_key"] = valid_df.apply(
    generate_lead_key,
    axis=1,
)

    duplicate_key_mask = valid_df[
    "lead_key"
].duplicated(
    keep=False
)


    print(
        valid_df["lead_key"].head(),
    )


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

    def build_row_hash_source(row):
        return "|".join(
            safe_value(row[field])
            for field in ROW_HASH_FIELDS
        )


    def generate_row_hash(row):
        row_source = build_row_hash_source(row)

        return hashlib.sha256(
            row_source.encode("utf-8")
        ).hexdigest()

    valid_df["row_hash"] = valid_df.apply(
    generate_row_hash,
    axis=1,
)

    print(valid_df["row_hash"].head())