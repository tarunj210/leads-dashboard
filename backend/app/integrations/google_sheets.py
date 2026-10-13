import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
]


def get_required_env(
    name: str,
) -> str:

    value = os.getenv(
        name
    )

    if not value:
        raise RuntimeError(
            f"{name} environment variable is not set"
        )

    return value


def get_google_credentials() -> Credentials:

    client_id = get_required_env(
        "GOOGLE_CLIENT_ID"
    )

    client_secret = get_required_env(
        "GOOGLE_CLIENT_SECRET"
    )

    refresh_token = get_required_env(
        "GOOGLE_REFRESH_TOKEN"
    )


    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )


    credentials.refresh(
        Request()
    )


    if not credentials.valid:

        raise RuntimeError(
            "Google credentials are not valid"
        )


    return credentials


def get_sheets_service():

    credentials = (
        get_google_credentials()
    )


    return build(
        "sheets",
        "v4",
        credentials=credentials,
        cache_discovery=False,
    )