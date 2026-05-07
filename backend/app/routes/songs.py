"""
MoodTune AI — Songs Routes
GET /songs              — List all songs (with optional search/filter)
GET /songs/{id}         — Get single song by ID
GET /songs/mood/{mood}  — Get songs filtered by mood
POST /songs/stream/{id} — Stream audio file
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import os
from app.database.db import get_db
from app.models.models import Song, History
from app.schemas.schemas import SongResponse
from app.services.auth_service import get_current_user
from app.models.models import User
from app.utils.config import settings

router = APIRouter(prefix="/songs", tags=["Songs"])


@router.get("", response_model=List[SongResponse])
def get_songs(
    search: Optional[str] = Query(None, description="Search by title or artist"),
    mood: Optional[str] = Query(None, description="Filter by mood"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    List songs with optional full-text search and filters.
    Supports pagination via limit/offset.
    """
    query = db.query(Song)

    # Full-text search across title and artist
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(Song.title.ilike(pattern), Song.artist.ilike(pattern))
        )

    if mood:
        query = query.filter(Song.mood == mood.lower())

    if genre:
        query = query.filter(Song.genre.ilike(f"%{genre}%"))

    return query.offset(offset).limit(limit).all()


@router.get("/mood/{mood}", response_model=List[SongResponse])
def get_songs_by_mood(
    mood: str,
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
):
    """Fetch songs matching a specific emotion/mood for auto-play."""
    songs = db.query(Song).filter(Song.mood == mood.lower()).limit(limit).all()
    if not songs:
        raise HTTPException(status_code=404, detail=f"No songs found for mood: {mood}")
    return songs


@router.get("/{song_id}", response_model=SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    """Get a single song by its ID."""
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.get("/stream/{song_id}")
def stream_song(
    song_id: int,
    db: Session = Depends(get_db),
):
    """
    Stream the audio file for a song.
    Increments play count on each stream request.
    """
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # Build absolute path to the audio file
    file_path = os.path.join(settings.SONGS_DIR, song.filepath)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found on server")

    # Increment play count
    song.play_count = (song.play_count or 0) + 1
    db.commit()

    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=os.path.basename(file_path),
    )
