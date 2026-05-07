"""
MoodTune AI — Favorites & History Routes
Favorites: POST /favorites/add | DELETE /favorites/remove/{id} | GET /favorites
History:   GET  /history        | POST   /history/add
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.models.models import Favorite, History, Song, User
from app.schemas.schemas import (
    FavoriteCreate, FavoriteResponse,
    HistoryResponse, MessageResponse, SongResponse
)
from app.services.auth_service import get_current_user

# ─── Favorites Router ─────────────────────────────────────────────────────────

fav_router = APIRouter(prefix="/favorites", tags=["Favorites"])


@fav_router.post("/add", response_model=FavoriteResponse, status_code=201)
def add_favorite(
    payload: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a song to the current user's favorites."""
    song = db.query(Song).filter(Song.id == payload.song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # Prevent duplicate favorites
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.song_id == payload.song_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Song already in favorites")

    favorite = Favorite(user_id=current_user.id, song_id=payload.song_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


@fav_router.delete("/remove/{song_id}", response_model=MessageResponse)
def remove_favorite(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a song from the current user's favorites."""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.song_id == song_id,
    ).first()

    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(favorite)
    db.commit()
    return MessageResponse(message="Removed from favorites")


@fav_router.get("", response_model=List[FavoriteResponse])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all favorite songs for the current user."""
    return (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )


# ─── History Router ───────────────────────────────────────────────────────────

history_router = APIRouter(prefix="/history", tags=["History"])


@history_router.get("", response_model=List[HistoryResponse])
def get_history(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return playback history for the current user (most recent first)."""
    return (
        db.query(History)
        .filter(History.user_id == current_user.id)
        .order_by(History.played_at.desc())
        .limit(limit)
        .all()
    )


@history_router.post("/add", status_code=201)
def add_history(
    song_id: int,
    played_by: str = "manual",
    detected_mood: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Record a song play event in history.
    Called automatically by the frontend when a song starts playing.
    """
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    entry = History(
        user_id=current_user.id,
        song_id=song_id,
        played_by=played_by,
        detected_mood=detected_mood,
    )
    db.add(entry)
    db.commit()
    return {"message": "History recorded"}
