"""
MoodTune AI — Database Configuration
Handles SQLAlchemy engine creation, session management, and Base class.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.utils.config import settings

# Create the database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,        # Reconnect on stale connections
    pool_size=10,              # Connection pool size
    max_overflow=20,           # Extra connections when pool is full
    echo=settings.DEBUG,       # Log SQL in debug mode
)

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
