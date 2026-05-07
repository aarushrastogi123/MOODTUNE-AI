"""
MoodTune AI — Pydantic Schemas
Request/response validation schemas for all API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Song Schemas ─────────────────────────────────────────────────────────────

class SongResponse(BaseModel):
    id: int
    title: str
    artist: str
    album: Optional[str] = None
    filepath: str
    mood: str
    cover_image: Optional[str] = None
    duration: Optional[float] = None
    genre: Optional[str] = None
    year: Optional[int] = None
    play_count: int = 0

    class Config:
        from_attributes = True


class SongCreate(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    filepath: str
    mood: str
    cover_image: Optional[str] = None
    duration: Optional[float] = None
    genre: Optional[str] = None
    year: Optional[int] = None


# ─── Trigger Schemas ──────────────────────────────────────────────────────────

class TriggerCreate(BaseModel):
    song_id: int
    trigger_word: str = Field(..., min_length=1, max_length=100)
    priority: int = Field(default=1, ge=1, le=10)


class TriggerUpdate(BaseModel):
    trigger_word: Optional[str] = None
    priority: Optional[int] = None


class TriggerResponse(BaseModel):
    id: int
    song_id: int
    trigger_word: str
    priority: int
    created_at: datetime
    song: Optional[SongResponse] = None

    class Config:
        from_attributes = True


class TriggerPlayRequest(BaseModel):
    query: str = Field(..., min_length=1)
    fuzzy_threshold: int = Field(default=70, ge=0, le=100)


class TriggerPlayResponse(BaseModel):
    exact_match: Optional[SongResponse] = None
    fuzzy_matches: List[SongResponse] = []
    query: str
    message: str


# ─── Emotion Schemas ──────────────────────────────────────────────────────────

class EmotionDetectRequest(BaseModel):
    image_base64: str  # Base64-encoded JPEG frame from webcam


class EmotionDetectResponse(BaseModel):
    emotion: str
    confidence: float
    all_emotions: dict
    recommended_songs: List[SongResponse] = []


# ─── History Schemas ──────────────────────────────────────────────────────────

class HistoryResponse(BaseModel):
    id: int
    song: Optional[SongResponse] = None
    played_by: str
    detected_mood: Optional[str] = None
    played_at: datetime

    class Config:
        from_attributes = True


# ─── Favorites Schemas ────────────────────────────────────────────────────────

class FavoriteCreate(BaseModel):
    song_id: int


class FavoriteResponse(BaseModel):
    id: int
    song: SongResponse
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Generic Schemas ──────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True
