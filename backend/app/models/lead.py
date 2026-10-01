from datetime import date, datetime

from sqlalchemy import Date, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(
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

    lead_received_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    customer_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    customer_email: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
        index=True,
    )

    customer_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    customer_phone_normalized: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    customer_service: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    customer_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    customer_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    page_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        index=True,
    )

    page_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[date] = mapped_column(
        Date,
        default=date.today,
        nullable=False,
    )

    updated_at: Mapped[date] = mapped_column(
        Date,
        default=date.today,
        onupdate=date.today,
        nullable=False,
    )