# 🎵 MoodTune AI
### Emotion-Based Smart Music Player with Personalized Song Triggers

> **Final Year Project** — AI-powered music platform that detects your emotion via webcam and plays songs that match your mood.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **Emotion Detection** | Real-time facial expression analysis via webcam (OpenCV + TensorFlow) |
| 🎵 **Mood Recommendations** | Auto-play songs matching detected emotion |
| 🎯 **Trigger Engine** | Type a keyword → instantly play your linked song (with fuzzy matching) |
| 🎚️ **Custom Music Player** | Full HTML5 player with seek, volume, shuffle, repeat |
| ❤️ **Favorites** | Save and manage your favorite songs |
| 📋 **History** | Track every play with mood tags |
| 🔐 **Auth** | JWT-based secure login / registration |
| 📱 **Responsive** | Works on desktop and mobile |

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + Vite
- **Tailwind CSS 3** (custom design system)
- **Framer Motion** (animations)
- **React Router DOM** (routing)
- **Axios** (API client)
- **React Webcam** (camera access)

### Backend
- **Python 3.10+**
- **FastAPI** (REST API)
- **SQLAlchemy 2.0** (ORM)
- **Alembic** (migrations)
- **PostgreSQL** (database)
- **JWT** (authentication)

### AI / ML
- **TensorFlow / Keras** (CNN emotion model)
- **OpenCV** (face detection)
- **FER library** (fallback detector)
- **FuzzyWuzzy** (trigger fuzzy matching)

---

## 📁 Project Structure

```
moodtune-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app entry
│   │   ├── routes/              ← API route handlers
│   │   │   ├── auth.py
│   │   │   ├── songs.py
│   │   │   ├── triggers.py
│   │   │   ├── emotion.py
│   │   │   └── favorites_history.py
│   │   ├── models/              ← SQLAlchemy ORM models
│   │   ├── schemas/             ← Pydantic request/response schemas
│   │   ├── services/            ← Business logic (auth)
│   │   ├── database/            ← DB engine & session
│   │   ├── ai/                  ← AI modules
│   │   │   ├── emotion_model.py     ← CNN architecture
│   │   │   ├── face_detector.py     ← OpenCV face detection
│   │   │   └── emotion_predictor.py ← Inference pipeline
│   │   └── utils/
│   │       ├── config.py        ← Settings from .env
│   │       ├── seed_db.py       ← Demo data seeder
│   │       └── future_modules.py ← Placeholder modules
│   ├── songs/                   ← Audio files (MP3)
│   │   ├── happy/
│   │   ├── sad/
│   │   ├── calm/
│   │   ├── angry/
│   │   ├── neutral/
│   │   └── surprise/
│   ├── schema.sql               ← Raw PostgreSQL schema
│   ├── requirements.txt
│   ├── .env
│   └── start.bat
│
└── frontend/
    ├── src/
    │   ├── App.jsx              ← Router
    │   ├── context/
    │   │   ├── AuthContext.jsx  ← Auth state
    │   │   └── PlayerContext.jsx ← Music player state
    │   ├── pages/
    │   │   ├── AuthPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Library.jsx
    │   │   ├── EmotionPage.jsx
    │   │   ├── TriggerManager.jsx
    │   │   ├── Favorites.jsx
    │   │   ├── History.jsx
    │   │   └── Settings.jsx
    │   ├── components/
    │   │   ├── player/MusicPlayer.jsx  ← Sticky bottom player
    │   │   ├── sidebar/Sidebar.jsx     ← Left nav
    │   │   ├── emotion/EmotionDetector.jsx ← Webcam widget
    │   │   └── ui/SongCard.jsx
    │   ├── services/api.js      ← Axios API client
    │   ├── layouts/MainLayout.jsx
    │   └── utils/formatTime.js
    ├── .env
    └── tailwind.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| PostgreSQL | 14+ |
| npm | 8+ |

---

### 1. Clone & Navigate

```bash
git clone https://github.com/yourname/moodtune-ai.git
cd moodtune-ai
```

---

### 2. PostgreSQL Setup

```sql
-- Open psql as postgres user
CREATE DATABASE moodtune_db;
CREATE USER moodtune_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE moodtune_db TO moodtune_user;
```

Or run the schema directly:
```bash
psql -U postgres -d moodtune_db -f backend/schema.sql
```

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit backend/.env with your DATABASE_URL and SECRET_KEY

# Seed demo data (optional but recommended)
python -m app.utils.seed_db

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be running at: **http://localhost:8000**
API docs: **http://localhost:8000/docs**

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at: **http://localhost:5173**

---

### 5. Add Audio Files

Place your MP3 files in the appropriate mood folders:

```
backend/songs/
├── happy/your_song.mp3
├── sad/your_song.mp3
├── calm/your_song.mp3
├── angry/your_song.mp3
├── neutral/your_song.mp3
└── surprise/your_song.mp3
```

Then update the `filepath` in the songs table to match:
```sql
UPDATE songs SET filepath = 'happy/your_song.mp3' WHERE title = 'Your Song';
```

---

### 6. Emotion Model (Optional)

The system has three modes:

1. **Custom Model** (best): Train and save to `backend/app/ai/models/emotion_model.h5`
2. **FER Library** (auto-fallback): Used automatically if no custom model found
3. **Mock Mode**: Returns random emotions for pure UI testing

To train the custom model:
```bash
# Download FER2013 dataset from Kaggle
# Place in backend/data/fer2013.csv
# Then run:
python -c "from app.ai.emotion_model import build_emotion_model, compile_model; m = build_emotion_model(); m = compile_model(m); m.summary()"
```

---

## 🔑 Demo Credentials

```
Email:    demo@moodtune.ai
Password: demo1234
```

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get JWT |
| GET  | `/auth/me` | Get current user |

### Songs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/songs` | List all (with search) |
| GET | `/songs/{id}` | Single song |
| GET | `/songs/mood/{mood}` | By mood |
| GET | `/songs/stream/{id}` | Stream audio |

### Emotion
| Method | Endpoint | Description |
|---|---|---|
| POST | `/detect-emotion` | Analyze webcam frame |

### Triggers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/trigger/add` | Create trigger |
| POST | `/trigger/play` | Play by trigger (fuzzy) |
| PUT  | `/trigger/update/{id}` | Edit trigger |
| DELETE | `/trigger/delete/{id}` | Remove trigger |
| GET  | `/trigger/list` | All user triggers |
| GET  | `/trigger/suggest?q=` | Auto-complete |

### Favorites & History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/favorites` | My favorites |
| POST | `/favorites/add` | Add favorite |
| DELETE | `/favorites/remove/{id}` | Remove |
| GET | `/history` | Play history |

---

## 🔮 Future Roadmap (v2.0+)

- [ ] **Spotify Integration** — Sync playlists, real-time control
- [ ] **Voice Commands** — "Hey MoodTune, play something calm"
- [ ] **Air Writing Gestures** — Write trigger words in the air
- [ ] **Collaborative Filtering** — AI learns from all users
- [ ] **React Native Mobile App**
- [ ] **Genre-based sub-moods**

---

## 📄 License

MIT License — Free for personal and academic use.

---

> Built with ❤️ using React, FastAPI, TensorFlow, and OpenCV