import json
import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
]


def get_google_credentials() -> Credentials:
    token_json = os.getenv("GOOGLE_TOKEN_JSON")

    if not token_json:
        raise RuntimeError(
            "GOOGLE_TOKEN_JSON environment variable is not set"
        )

    token_data = json.loads(token_json)

    credentials = Credentials.from_authorized_user_info(
        token_data,
        SCOPES,
    )

    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())

    if not credentials.valid:
        raise RuntimeError(
            "Google credentials are not valid"
        )

    return credentials


def get_sheets_service():
    credentials = get_google_credentials()

    return build(
        "sheets",
        "v4",
        credentials=credentials,
        cache_discovery=False,
    )