from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


DATABASE_URL = (
    "postgresql://"
    "leads_user:"
    "leads_password@"
    "localhost:5433/"
    "leads_db"
)


engine = create_engine(
    DATABASE_URL,
)


SessionLocal = sessionmaker(
    bind=engine,
)


class Base(DeclarativeBase):
    pass