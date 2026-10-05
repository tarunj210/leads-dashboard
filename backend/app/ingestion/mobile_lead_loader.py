import hashlib
import os

import pandas as pd

from app.integrations.google_sheets import (
    get_sheets_service,
)

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------



# Replace with mobile spreadsheet ID
SPREADSHEET_ID = "197kt7D6tNS8QIKYMX8Pv0iZgiiwbKdJSmh-mmaXzXuc"


# Change "Data" if your tab name is different
RANGE_NAME = "Data!A:I"


# ---------------------------------------------------------
# Required source columns
# ---------------------------------------------------------

REQUIRED_COLUMNS = {
    "AccessList",
    "Remote Ip",
    "Connect Time",
    "CLI",
    "CLD",
    "Prefix",
    "Billed Duration",
    "Result",
    "Cost",
}


# ---------------------------------------------------------
# Column mapping
# ---------------------------------------------------------

COLUMN_MAPPING = {
    "AccessList": "access_list",
    "Remote Ip": "remote_ip",
    "Connect Time": "connect_time",
    "CLI": "cli",
    "CLD": "cld",
    "Prefix": "prefix",
    "Billed Duration": "billed_duration",
    "Result": "result",
    "Cost": "cost",
}


# ---------------------------------------------------------
# Internal columns
# ---------------------------------------------------------

INTERNAL_COLUMNS = [
    "access_list",
    "remote_ip",
    "connect_time",
    "cli",
    "cld",
    "prefix",
    "billed_duration",
    "result",
    "cost",
]


# ---------------------------------------------------------
# Text columns
# ---------------------------------------------------------

TEXT_COLUMNS = [
    "access_list",
    "remote_ip",
    "cli",
    "cld",
    "prefix",
]


# ---------------------------------------------------------
# Fields used to detect row changes
# ---------------------------------------------------------

ROW_HASH_FIELDS = [
    "access_list",
    "remote_ip",
    "connect_time",
    "cli",
    "cld",
    "prefix",
    "billed_duration",
    "result",
    "cost",
]



def fetch_sheet_values() -> list[list]:

    service = get_sheets_service()

    result = (
        service.spreadsheets()
        .values()
        .get(
            spreadsheetId=SPREADSHEET_ID,
            range=RANGE_NAME,
        )
        .execute()
    )

    return result.get(
        "values",
        [],
    )


# ---------------------------------------------------------
# Create dataframe
# ---------------------------------------------------------

def create_dataframe(
    values: list[list],
) -> pd.DataFrame:

    if not values:
        return pd.DataFrame()


    # Mobile spreadsheet currently assumes
    # the first row contains the headers.
    #
    # If your headers are on row 2 instead,
    # change this to:
    #
    # headers = values[1]
    # rows = values[2:]

    headers = values[0]

    rows = values[1:]


    column_count = len(
        headers
    )

    normalized_rows = []


    for row in rows:

        normalized_row = (
            row
            + [""] * (
                column_count
                - len(row)
            )
        )

        normalized_rows.append(
            normalized_row[
                :column_count
            ]
        )


    return pd.DataFrame(
        normalized_rows,
        columns=headers,
    )


# ---------------------------------------------------------
# Validate source schema
# ---------------------------------------------------------

def validate_schema(
    df: pd.DataFrame,
) -> None:

    df.columns = [
        str(column).strip()
        for column in df.columns
    ]


    duplicate_columns = (
        df.columns[
            df.columns.duplicated()
        ]
        .tolist()
    )


    if duplicate_columns:

        raise ValueError(
            "Duplicate columns detected: "
            f"{duplicate_columns}"
        )


    actual_columns = set(
        df.columns
    )


    missing_columns = (
        REQUIRED_COLUMNS
        - actual_columns
    )


    if missing_columns:

        raise ValueError(
            "Missing required columns: "
            f"{sorted(missing_columns)}"
        )


# ---------------------------------------------------------
# Normalize column names
# ---------------------------------------------------------

def normalize_columns(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.rename(
        columns=COLUMN_MAPPING
    )


    duplicate_columns = (
        df.columns[
            df.columns.duplicated()
        ]
        .tolist()
    )


    if duplicate_columns:

        raise ValueError(
            "Duplicate internal columns detected: "
            f"{duplicate_columns}"
        )


    return df[
        INTERNAL_COLUMNS
    ].copy()


# ---------------------------------------------------------
# Normalize text
# ---------------------------------------------------------

def normalize_text_values(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()


    for column in TEXT_COLUMNS:

        df.loc[
            :,
            column,
        ] = (
            df.loc[
                :,
                column,
            ]
            .astype("string")
            .str.strip()
            .replace(
                "",
                pd.NA,
            )
        )


    return df


# ---------------------------------------------------------
# Normalize Connect Time
# ---------------------------------------------------------

def normalize_dates(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()

    df["connect_time"] = pd.to_datetime(
        df["connect_time"],
        format="mixed",
        dayfirst=True,
        errors="coerce",
    )

    return df


# ---------------------------------------------------------
# Normalize numeric fields
# ---------------------------------------------------------

def normalize_numeric_values(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()


    df[
        "billed_duration"
    ] = (
        pd.to_numeric(
            df[
                "billed_duration"
            ],
            errors="coerce",
        )
        .astype("Int64")
    )


    df[
        "result"
    ] = (
        pd.to_numeric(
            df[
                "result"
            ],
            errors="coerce",
        )
        .astype("Int64")
    )


    df[
        "cost"
    ] = pd.to_numeric(
        df[
            "cost"
        ],
        errors="coerce",
    )


    return df


# ---------------------------------------------------------
# Validate mobile call records
# ---------------------------------------------------------

def validate_mobile_leads(
    df: pd.DataFrame,
) -> tuple[
    pd.DataFrame,
    pd.DataFrame,
]:

    df = df.copy()


    df[
        "validation_errors"
    ] = [
        []
        for _ in range(
            len(df)
        )
    ]


    # Fields required to identify
    # and analyse a call record.
    required_fields = [
        "connect_time",
        "cli",
        "cld",
    ]


    # -----------------------------------------------------
    # Required fields
    # -----------------------------------------------------

    for field in required_fields:

        mask = (
            df[field]
            .isna()
        )


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


    # -----------------------------------------------------
    # Billed duration
    # -----------------------------------------------------

    invalid_duration_mask = (
        df[
            "billed_duration"
        ].notna()
        & (
            df[
                "billed_duration"
            ] < 0
        )
    )


    df.loc[
        invalid_duration_mask,
        "validation_errors",
    ] = (
        df.loc[
            invalid_duration_mask,
            "validation_errors",
        ]
        .apply(
            lambda errors:
            errors
            + [
                "INVALID_BILLED_DURATION"
            ]
        )
    )


    # -----------------------------------------------------
    # Cost
    # -----------------------------------------------------

    invalid_cost_mask = (
        df[
            "cost"
        ].notna()
        & (
            df[
                "cost"
            ] < 0
        )
    )


    df.loc[
        invalid_cost_mask,
        "validation_errors",
    ] = (
        df.loc[
            invalid_cost_mask,
            "validation_errors",
        ]
        .apply(
            lambda errors:
            errors
            + [
                "INVALID_COST"
            ]
        )
    )


    # -----------------------------------------------------
    # Split valid / invalid
    # -----------------------------------------------------

    invalid_mask = (
        df[
            "validation_errors"
        ]
        .str.len()
        .gt(0)
    )


    valid_df = (
        df.loc[
            ~invalid_mask
        ]
        .copy()
    )


    invalid_df = (
        df.loc[
            invalid_mask
        ]
        .copy()
    )


    return (
        valid_df,
        invalid_df,
    )


# ---------------------------------------------------------
# Safe hash value
# ---------------------------------------------------------

def safe_value(
    value,
) -> str:

    if pd.isna(
        value
    ):
        return ""

    return str(
        value
    )


# ---------------------------------------------------------
# Generate stable call key
# ---------------------------------------------------------

def generate_mobile_lead_key(
    row,
) -> str:

    

    source = "|".join(
        [
            safe_value(
                row[
                    "connect_time"
                ]
            ),

            safe_value(
                row[
                    "cli"
                ]
            ),

            safe_value(
                row[
                    "cld"
                ]
            ),

            safe_value(
                row[
                    "prefix"
                ]
            ),

            safe_value(
                row[
                    "billed_duration"
                ]
            ),

            safe_value(
                row[
                    "result"
                ]
            ),
        ]
    )


    return hashlib.sha256(
        source.encode(
            "utf-8"
        )
    ).hexdigest()


# ---------------------------------------------------------
# Generate row hash
# ---------------------------------------------------------

def generate_row_hash(
    row,
) -> str:

    source = "|".join(
        safe_value(
            row[field]
        )
        for field
        in ROW_HASH_FIELDS
    )


    return hashlib.sha256(
        source.encode(
            "utf-8"
        )
    ).hexdigest()


# ---------------------------------------------------------
# Add hashes
# ---------------------------------------------------------

def add_hashes(
    df: pd.DataFrame,
) -> pd.DataFrame:

    df = df.copy()


    df[
        "lead_key"
    ] = df.apply(
        generate_mobile_lead_key,
        axis=1,
    )


    df[
        "row_hash"
    ] = df.apply(
        generate_row_hash,
        axis=1,
    )


    return df


# ---------------------------------------------------------
# Main ingestion loader
# ---------------------------------------------------------

def load_valid_mobile_leads() -> pd.DataFrame:

    values = (
        fetch_sheet_values()
    )


    if not values:
        return pd.DataFrame()


    df = create_dataframe(
        values
    )


    validate_schema(
        df
    )


    df = normalize_columns(
        df
    )


    df = normalize_text_values(
        df
    )


    df = normalize_dates(
        df
    )


    df = normalize_numeric_values(
        df
    )


    valid_df, invalid_df = (
        validate_mobile_leads(
            df
        )
    )


    valid_df = add_hashes(
        valid_df
    )


    print(
        f"Loaded {len(valid_df)} valid mobile records "
        f"and {len(invalid_df)} invalid mobile records."
    )


    return valid_df


# ---------------------------------------------------------
# Local test
# ---------------------------------------------------------

if __name__ == "__main__":

    df = (
        load_valid_mobile_leads()
    )


    print(
        "\nMobile leads preview:"
    )

    print(
        df.head()
    )


    print(
        "\nData types:"
    )

    print(
        df.dtypes
    )