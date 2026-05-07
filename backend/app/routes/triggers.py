"""
MoodTune AI — Trigger Routes
POST   /trigger/add          — Add a trigger word for a song
POST   /trigger/play         — Play song matching a trigger (with fuzzy search)
PUT    /trigger/update/{id}  — Update an existing trigger
DELETE /trigger/delete/{id}  — Delete a trigger
GET    /trigger/list         — List all triggers for current user
GET    /trigger/suggest      — Auto-complete suggestions as user types
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from fuzzywuzzy import fuzz, process
from app.database.db import get_db
from app.models.models import Trigger, Song, User
from app.schemas.schemas import (
    TriggerCreate, TriggerUpdate, TriggerResponse,
    TriggerPlayRequest, TriggerPlayResponse,
    SongResponse, MessageResponse
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/trigger", tags=["Triggers"])


@router.post("/add", response_model=TriggerResponse, status_code=201)
def add_trigger(
    payload: TriggerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add a new trigger word linked to a song.
    Prevents duplicate trigger words per user.
    """
    # Validate song exists
    song = db.query(Song).filter(Song.id == payload.song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # Prevent duplicate trigger words for this user
    existing = db.query(Trigger).filter(
        Trigger.trigger_word == payload.trigger_word.lower().strip(),
        Trigger.created_by == current_user.id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Trigger '{payload.trigger_word}' already exists. "
                   f"It is linked to another song. Please use a different word."
        )

    trigger = Trigger(
        song_id=payload.song_id,
        trigger_word=payload.trigger_word.lower().strip(),
        created_by=current_user.id,
        priority=payload.priority,
    )
    db.add(trigger)
    db.commit()
    db.refresh(trigger)
    return trigger


@router.post("/play", response_model=TriggerPlayResponse)
def play_by_trigger(
    payload: TriggerPlayRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Play song(s) that match the typed trigger word.
    Uses exact matching first, falls back to fuzzy matching.
    Returns a list of fuzzy matches if no exact match found.
    """
    query = payload.query.lower().strip()

    # 1. Try exact match first
    exact = (
        db.query(Trigger)
        .filter(
            Trigger.trigger_word == query,
            Trigger.created_by == current_user.id,
        )
        .order_by(Trigger.priority.desc())
        .first()
    )
    if exact:
        return TriggerPlayResponse(
            exact_match=SongResponse.from_orm(exact.song),
            fuzzy_matches=[],
            query=query,
            message=f"Playing '{exact.song.title}' — exact match for '{query}'",
        )

    # 2. Fuzzy matching across all user's triggers
    all_triggers = (
        db.query(Trigger)
        .filter(Trigger.created_by == current_user.id)
        .all()
    )

    if not all_triggers:
        return TriggerPlayResponse(
            exact_match=None,
            fuzzy_matches=[],
            query=query,
            message="No triggers found. Add some trigger words first!",
        )

    # Build word → trigger map
    trigger_map = {t.trigger_word: t for t in all_triggers}
    choices = list(trigger_map.keys())

    # Fuzzy match using token_sort_ratio for best partial matching
    matches = process.extractBests(
        query, choices,
        scorer=fuzz.token_sort_ratio,
        score_cutoff=payload.fuzzy_threshold,
        limit=5,
    )

    if not matches:
        return TriggerPlayResponse(
            exact_match=None,
            fuzzy_matches=[],
            query=query,
            message=f"No matches found for '{query}'. Try a different trigger word.",
        )

    # De-duplicate songs (multiple triggers might link to same song)
    seen_songs = set()
    fuzzy_songs = []
    for word, score in matches:
        trigger = trigger_map[word]
        if trigger.song_id not in seen_songs:
            seen_songs.add(trigger.song_id)
            fuzzy_songs.append(SongResponse.from_orm(trigger.song))

    return TriggerPlayResponse(
        exact_match=None,
        fuzzy_matches=fuzzy_songs,
        query=query,
        message=f"Found {len(fuzzy_songs)} possible match(es) for '{query}'. Did you mean one of these?",
    )


@router.put("/update/{trigger_id}", response_model=TriggerResponse)
def update_trigger(
    trigger_id: int,
    payload: TriggerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a trigger's word or priority. Only the creator can edit."""
    trigger = db.query(Trigger).filter(
        Trigger.id == trigger_id,
        Trigger.created_by == current_user.id,
    ).first()

    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")

    if payload.trigger_word is not None:
        trigger.trigger_word = payload.trigger_word.lower().strip()
    if payload.priority is not None:
        trigger.priority = payload.priority

    db.commit()
    db.refresh(trigger)
    return trigger


@router.delete("/delete/{trigger_id}", response_model=MessageResponse)
def delete_trigger(
    trigger_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a trigger. Only the creator can delete."""
    trigger = db.query(Trigger).filter(
        Trigger.id == trigger_id,
        Trigger.created_by == current_user.id,
    ).first()

    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")

    db.delete(trigger)
    db.commit()
    return MessageResponse(message=f"Trigger '{trigger.trigger_word}' deleted successfully")


@router.get("/list", response_model=List[TriggerResponse])
def list_triggers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all triggers created by the current user."""
    return (
        db.query(Trigger)
        .filter(Trigger.created_by == current_user.id)
        .order_by(Trigger.priority.desc())
        .all()
    )


@router.get("/suggest", response_model=List[str])
def suggest_triggers(
    q: str = Query(..., min_length=1, description="Partial trigger word for auto-complete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return trigger word suggestions matching the typed prefix."""
    pattern = f"{q.lower()}%"
    triggers = (
        db.query(Trigger.trigger_word)
        .filter(
            Trigger.trigger_word.ilike(pattern),
            Trigger.created_by == current_user.id,
        )
        .limit(10)
        .all()
    )
    return [t[0] for t in triggers]
