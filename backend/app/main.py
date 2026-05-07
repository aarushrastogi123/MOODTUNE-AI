"""
MoodTune AI — FastAPI Application Entry Point
Initializes the FastAPI app, registers all routers, configures CORS,
and creates database tables on startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database.db import engine
from app.models.models import Base
from app.utils.config import settings
from app.routes.auth import router as auth_router
from app.routes.songs import router as songs_router
from app.routes.triggers import router as triggers_router
from app.routes.favorites_history import fav_router, history_router
from app.routes.emotion import router as emotion_router

# ─── Create FastAPI App ───────────────────────────────────────────────────────

app = FastAPI(
    title="MoodTune AI API",
    description="Emotion-Based Smart Music Player — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static File Serving ──────────────────────────────────────────────────────

# Serve song audio files (for streaming)
songs_path = os.path.abspath(settings.SONGS_DIR)
if os.path.isdir(songs_path):
    app.mount("/audio", StaticFiles(directory=songs_path), name="audio")

# Serve cover images
covers_path = os.path.abspath("./covers")
if os.path.isdir(covers_path):
    app.mount("/covers", StaticFiles(directory=covers_path), name="covers")

# ─── Register Routers ─────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(songs_router)
app.include_router(triggers_router)
app.include_router(fav_router)
app.include_router(history_router)
app.include_router(emotion_router)

# ─── Startup Events ───────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Create all database tables on startup if they don't exist."""
    print("MoodTune AI — Starting up...")
    Base.metadata.create_all(bind=engine)
    print("Database tables ready.")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print("MoodTune AI — Shutting down.")


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "app": "MoodTune AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
