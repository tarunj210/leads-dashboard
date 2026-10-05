from app.database import SessionLocal

from app.repositories.marketing_repository import (
    get_marketing_calls,
)


def get_marketing_call_list():

    with SessionLocal() as db:

        rows = get_marketing_calls(
            db
        )


        unique_cli = len(
            {
                row.cli
                for row in rows
            }
        )


        return {
            "total_calls": len(rows),
            "unique_cli": unique_cli,

            "items": [
                {
                    "id": row.id,

                    "connect_time":
                        row.connect_time,

                    "cli":
                        row.cli,

                    "cld":
                        row.cld,

                    "prefix":
                        row.prefix,

                    "billed_duration":
                        row.billed_duration,

                    "result":
                        row.result,

                    "cost": (
                        float(
                            row.cost
                        )
                        if row.cost
                        is not None
                        else None
                    ),

                    "remote_ip":
                        row.remote_ip,

                    "access_list":
                        row.access_list,
                }

                for row in rows
            ],
        }