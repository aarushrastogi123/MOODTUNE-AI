"""
MoodTune AI — Database Seeder
Seeds the database with sample songs across all moods for demo purposes.
Run once after creating the database tables.

Usage: python -m app.utils.seed_db
"""

from sqlalchemy.orm import Session
from app.database.db import engine, SessionLocal
from app.models.models import Base, Song, User
from app.services.auth_service import hash_password


# ─── Sample Songs Seed Data ───────────────────────────────────────────────────
SAMPLE_SONGS = [
    # Happy songs
    {
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "album": "After Hours",
        "filepath": "happy/blinding_lights.mp3",
        "mood": "happy",
        "cover_image": "/covers/blinding_lights.jpg",
        "duration": 200.0,
        "genre": "Synth-pop",
        "year": 2019,
    },
    {
        "title": "Happy",
        "artist": "Pharrell Williams",
        "album": "G I R L",
        "filepath": "happy/happy.mp3",
        "mood": "happy",
        "cover_image": "/covers/happy.jpg",
        "duration": 233.0,
        "genre": "Pop",
        "year": 2013,
    },
    {
        "title": "Can't Stop the Feeling",
        "artist": "Justin Timberlake",
        "album": "Trolls OST",
        "filepath": "happy/cant_stop_the_feeling.mp3",
        "mood": "happy",
        "cover_image": "/covers/cant_stop.jpg",
        "duration": 236.0,
        "genre": "Funk-pop",
        "year": 2016,
    },
    {
        "title": "Uptown Funk",
        "artist": "Mark Ronson ft. Bruno Mars",
        "album": "Uptown Special",
        "filepath": "happy/uptown_funk.mp3",
        "mood": "happy",
        "cover_image": "/covers/uptown_funk.jpg",
        "duration": 269.0,
        "genre": "Funk",
        "year": 2014,
    },

    # Sad songs
    {
        "title": "Someone Like You",
        "artist": "Adele",
        "album": "21",
        "filepath": "sad/someone_like_you.mp3",
        "mood": "sad",
        "cover_image": "/covers/adele_21.jpg",
        "duration": 285.0,
        "genre": "Soul",
        "year": 2011,
    },
    {
        "title": "The Night We Met",
        "artist": "Lord Huron",
        "album": "Strange Trails",
        "filepath": "sad/the_night_we_met.mp3",
        "mood": "sad",
        "cover_image": "/covers/night_we_met.jpg",
        "duration": 195.0,
        "genre": "Indie Folk",
        "year": 2015,
    },
    {
        "title": "Fix You",
        "artist": "Coldplay",
        "album": "X&Y",
        "filepath": "sad/fix_you.mp3",
        "mood": "sad",
        "cover_image": "/covers/fix_you.jpg",
        "duration": 295.0,
        "genre": "Alternative Rock",
        "year": 2005,
    },
    {
        "title": "Let Her Go",
        "artist": "Passenger",
        "album": "All the Little Lights",
        "filepath": "sad/let_her_go.mp3",
        "mood": "sad",
        "cover_image": "/covers/let_her_go.jpg",
        "duration": 252.0,
        "genre": "Folk",
        "year": 2012,
    },

    # Calm songs
    {
        "title": "Weightless",
        "artist": "Marconi Union",
        "album": "Weightless",
        "filepath": "calm/weightless.mp3",
        "mood": "calm",
        "cover_image": "/covers/weightless.jpg",
        "duration": 480.0,
        "genre": "Ambient",
        "year": 2011,
    },
    {
        "title": "Clair de Lune",
        "artist": "Claude Debussy",
        "album": "Suite bergamasque",
        "filepath": "calm/clair_de_lune.mp3",
        "mood": "calm",
        "cover_image": "/covers/clair_de_lune.jpg",
        "duration": 318.0,
        "genre": "Classical",
        "year": 1905,
    },
    {
        "title": "Breathe",
        "artist": "Télépopmusik",
        "album": "Genetic World",
        "filepath": "calm/breathe.mp3",
        "mood": "calm",
        "cover_image": "/covers/breathe.jpg",
        "duration": 243.0,
        "genre": "Downtempo",
        "year": 2001,
    },

    # Angry / Workout songs
    {
        "title": "Starboy",
        "artist": "The Weeknd",
        "album": "Starboy",
        "filepath": "angry/starboy.mp3",
        "mood": "angry",
        "cover_image": "/covers/starboy.jpg",
        "duration": 230.0,
        "genre": "R&B",
        "year": 2016,
    },
    {
        "title": "Lose Yourself",
        "artist": "Eminem",
        "album": "8 Mile OST",
        "filepath": "angry/lose_yourself.mp3",
        "mood": "angry",
        "cover_image": "/covers/lose_yourself.jpg",
        "duration": 326.0,
        "genre": "Hip-Hop",
        "year": 2002,
    },
    {
        "title": "Till I Collapse",
        "artist": "Eminem",
        "album": "The Eminem Show",
        "filepath": "angry/till_i_collapse.mp3",
        "mood": "angry",
        "cover_image": "/covers/till_i_collapse.jpg",
        "duration": 297.0,
        "genre": "Hip-Hop",
        "year": 2002,
    },

    # Neutral songs
    {
        "title": "Shape of You",
        "artist": "Ed Sheeran",
        "album": "÷ (Divide)",
        "filepath": "neutral/shape_of_you.mp3",
        "mood": "neutral",
        "cover_image": "/covers/shape_of_you.jpg",
        "duration": 234.0,
        "genre": "Pop",
        "year": 2017,
    },
    {
        "title": "Counting Stars",
        "artist": "OneRepublic",
        "album": "Native",
        "filepath": "neutral/counting_stars.mp3",
        "mood": "neutral",
        "cover_image": "/covers/counting_stars.jpg",
        "duration": 257.0,
        "genre": "Pop Rock",
        "year": 2013,
    },

    # Surprise songs
    {
        "title": "Electric Feel",
        "artist": "MGMT",
        "album": "Oracular Spectacular",
        "filepath": "surprise/electric_feel.mp3",
        "mood": "surprise",
        "cover_image": "/covers/electric_feel.jpg",
        "duration": 230.0,
        "genre": "Synth-pop",
        "year": 2007,
    },
    {
        "title": "Take On Me",
        "artist": "a-ha",
        "album": "Hunting High and Low",
        "filepath": "surprise/take_on_me.mp3",
        "mood": "surprise",
        "cover_image": "/covers/take_on_me.jpg",
        "duration": 225.0,
        "genre": "Synth-pop",
        "year": 1985,
    },
]


def seed_database():
    """Create tables and insert sample data into the database."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Seed songs
        if db.query(Song).count() == 0:
            print(f"Seeding {len(SAMPLE_SONGS)} songs...")
            for song_data in SAMPLE_SONGS:
                db.add(Song(**song_data))
            db.commit()
            print("Songs seeded successfully!")
        else:
            print("Songs already exist — skipping song seed.")

        # Create a demo user
        if db.query(User).count() == 0:
            demo_user = User(
                username="demo",
                email="demo@moodtune.ai",
                password_hash=hash_password("demo1234"),
            )
            db.add(demo_user)
            db.commit()
            print("Demo user created: demo@moodtune.ai / demo1234")
        else:
            print("Users already exist — skipping user seed.")

        print("\n✅ Database seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
