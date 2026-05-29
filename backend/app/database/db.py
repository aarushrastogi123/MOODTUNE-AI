"""
MoodTune AI — Database Configuration
Handles SQLAlchemy engine creation, session management, and Base class.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.utils.config import settings

# Create the database engine (SQLite-compatible kwargs)
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine_kwargs = {
    "pool_pre_ping": True,
    "echo": settings.DEBUG,
}

if is_sqlite:
    # SQLite needs check_same_thread=False for FastAPI's threaded requests
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL supports connection pooling
    engine_kwargs["pool_size"]    = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

# Session factory — use this to create DB sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a DB session per request.
    Ensures the session is always closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
