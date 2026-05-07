"""
MoodTune AI — Emotion Detection Routes
POST /detect-emotion — Accepts a base64 webcam frame and returns detected emotion + song recommendations.
"""

import base64
import numpy as np
from io import BytesIO
from PIL import Image
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import Song
from app.schemas.schemas import EmotionDetectRequest, EmotionDetectResponse, SongResponse
from app.ai.emotion_predictor import EmotionPredictor

router = APIRouter(prefix="", tags=["Emotion Detection"])

# Singleton predictor — loads model once at startup
predictor = EmotionPredictor()


@router.post("/detect-emotion", response_model=EmotionDetectResponse)
def detect_emotion(
    payload: EmotionDetectRequest,
    db: Session = Depends(get_db),
):
    """
    Accept a base64-encoded JPEG webcam frame from the frontend.
    Detect the user's emotion and return recommended songs.
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(payload.image_base64)
        image = Image.open(BytesIO(image_data)).convert("RGB")
        img_array = np.array(image)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data. Send a valid base64 JPEG.")

    # Run emotion prediction
    result = predictor.predict(img_array)
    if result is None:
        raise HTTPException(status_code=422, detail="No face detected in the image. Please look at the camera.")

    emotion = result["emotion"]
    confidence = result["confidence"]
    all_emotions = result["all_emotions"]

    # Map emotion to mood for song lookup
    emotion_to_mood = {
        "happy": "happy",
        "sad": "sad",
        "angry": "angry",
        "neutral": "neutral",
        "surprise": "surprise",
        "fear": "calm",
        "disgust": "angry",
        "calm": "calm",
    }
    mood = emotion_to_mood.get(emotion.lower(), "neutral")

    # Fetch up to 5 recommended songs for this mood
    songs = db.query(Song).filter(Song.mood == mood).limit(5).all()

    return EmotionDetectResponse(
        emotion=emotion,
        confidence=confidence,
        all_emotions=all_emotions,
        recommended_songs=[SongResponse.from_orm(s) for s in songs],
    )
