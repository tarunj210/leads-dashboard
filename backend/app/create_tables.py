from app.database import Base, engine

from app.models import Lead, MobileLead


def create_tables():
    print("Registered tables:")
    print(Base.metadata.tables.keys())

    Base.metadata.create_all(
        bind=engine
    )

    print("Tables created successfully.")


if __name__ == "__main__":
    create_tables()