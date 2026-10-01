import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
]

TOKEN_FILE = "token.json"
CREDENTIALS_FILE = "credentials/credentials.json"


def get_google_credentials() -> Credentials:
    credentials = None

    if os.path.exists(TOKEN_FILE):
        credentials = (
            Credentials.from_authorized_user_file(
                TOKEN_FILE,
                SCOPES,
            )
        )

    # Existing token is still valid
    if credentials and credentials.valid:
        return credentials

    # Existing token expired but can be refreshed
    if (
        credentials
        and credentials.expired
        and credentials.refresh_token
    ):
        credentials.refresh(
            Request()
        )

    # No usable token -> authenticate in browser
    else:
        flow = (
            InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE,
                SCOPES,
            )
        )

        credentials = flow.run_local_server(
            port=0
        )

    # Save refreshed/new token
    with open(
        TOKEN_FILE,
        "w",
    ) as token:
        token.write(
            credentials.to_json()
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