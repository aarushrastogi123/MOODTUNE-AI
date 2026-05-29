"""
MoodTune AI — ORM Models
Defines all SQLAlchemy database models mapped to PostgreSQL tables.
"""

from sqlalchemy import (
    Column, Integer, String, Float,
    DateTime, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.db import Base


class MoodEnum(str, enum.Enum):
    """Valid mood/emotion values supported by the system."""
    happy = "happy"
    sad = "sad"
    angry = "angry"
    neutral = "neutral"
    surprise = "surprise"
    calm = "calm"
    workout = "workout"
    romantic = "romantic"


class PlayedByEnum(str, enum.Enum):
    """How the song was played — manual or AI-triggered."""
    manual = "manual"
    emotion = "emotion"
    trigger = "trigger"


# ─── Users ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    history = relationship("History", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    triggers = relationship("Trigger", back_populates="creator", cascade="all, delete-orphan")


# ─── Songs ────────────────────────────────────────────────────────────────────

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    artist = Column(String(150), nullable=False, index=True)
    album = Column(String(200), nullable=True)
    filepath = Column(String(500), nullable=False)          # Relative path to MP3
    mood = Column(String(50), nullable=False, index=True)   # Primary mood tag
    cover_image = Column(String(500), nullable=True)        # Album art path/URL
    duration = Column(Float, nullable=True)                 # Duration in seconds
    genre = Column(String(100), nullable=True)
    year = Column(Integer, nullable=True)
    play_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    history = relationship("History", back_populates="song")
    favorites = relationship("Favorite", back_populates="song")
    triggers = relationship("Trigger", back_populates="song", cascade="all, delete-orphan")


# ─── Triggers ─────────────────────────────────────────────────────────────────

class Trigger(Base):
    __tablename__ = "triggers"

    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False)
    trigger_word = Column(String(100), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    priority = Column(Integer, default=1)                   # Higher = preferred match
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    song = relationship("Song", back_populates="triggers")
    creator = relationship("User", back_populates="triggers")


# ─── History ──────────────────────────────────────────────────────────────────

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="SET NULL"), nullable=True)
    played_by = Column(String(20), default="manual")        # manual | emotion | trigger
    detected_mood = Column(String(50), nullable=True)       # Mood detected at play time
    played_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="history")
    song = relationship("Song", back_populates="history")


# ─── Favorites ────────────────────────────────────────────────────────────────

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorites")
    song = relationship("Song", back_populates="favorites")
