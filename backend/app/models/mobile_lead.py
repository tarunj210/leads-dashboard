from datetime import datetime
from decimal import Decimal
from app.database import Base

from sqlalchemy import (
    DateTime,
    Integer,
    Numeric,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)




class MobileLead(Base):
    __tablename__ = "mobile_leads"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    lead_key: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    row_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    access_list: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    remote_ip: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    connect_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    cli: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
        index=True,
    )

    cld: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
        index=True,
    )

    prefix: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    billed_duration: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    result: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    cost: Mapped[Decimal | None] = mapped_column(
        Numeric(
            12,
            4,
        ),
        nullable=True,
    )