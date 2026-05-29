-- ============================================================
-- MoodTune AI — PostgreSQL Database Schema
-- Run this script to create the database and all tables.
-- ============================================================

-- Create database (run as superuser outside of this script)
-- CREATE DATABASE moodtune_db;

-- Connect to the database:
-- \c moodtune_db

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enum Types ────────────────────────────────────────────────────────────────
CREATE TYPE mood_enum AS ENUM (
    'happy', 'sad', 'angry', 'neutral', 'surprise', 'calm', 'workout', 'romantic'
);

CREATE TYPE played_by_enum AS ENUM (
    'manual', 'emotion', 'trigger'
);

-- ── Users Table ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ── Songs Table ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS songs (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    artist      VARCHAR(150) NOT NULL,
    album       VARCHAR(200),
    filepath    VARCHAR(500) NOT NULL,    -- Relative path to audio file
    mood        VARCHAR(50)  NOT NULL,    -- Primary mood tag
    cover_image VARCHAR(500),            -- Album art URL or path
    duration    FLOAT,                   -- Duration in seconds
    genre       VARCHAR(100),
    year        INTEGER,
    play_count  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_songs_mood   ON songs(mood);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_title  ON songs USING gin(to_tsvector('english', title));

-- ── Triggers Table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS triggers (
    id           SERIAL PRIMARY KEY,
    song_id      INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    trigger_word VARCHAR(100) NOT NULL,
    created_by   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    priority     INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
    created_at   TIMESTAMPTZ DEFAULT NOW(),

    -- Each user can only have one trigger word per song-word combination
    CONSTRAINT unique_trigger_per_user UNIQUE (created_by, trigger_word)
);

CREATE INDEX idx_triggers_word       ON triggers(trigger_word);
CREATE INDEX idx_triggers_created_by ON triggers(created_by);

-- ── History Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS history (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id       INTEGER REFERENCES songs(id) ON DELETE SET NULL,
    played_by     VARCHAR(20) DEFAULT 'manual',
    detected_mood VARCHAR(50),             -- Mood detected at play time (if emotion)
    played_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_user_id  ON history(user_id);
CREATE INDEX idx_history_played_at ON history(played_at DESC);

-- ── Favorites Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id    INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_favorite UNIQUE (user_id, song_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- ── Seed Data ─────────────────────────────────────────────────────────────────
-- Demo songs (update filepath to match your local files)
INSERT INTO songs (title, artist, album, filepath, mood, cover_image, duration, genre, year) VALUES
    ('Blinding Lights',      'The Weeknd',           'After Hours',          'happy/blinding_lights.mp3',      'happy',   '/covers/blinding_lights.jpg', 200, 'Synth-pop', 2019),
    ('Happy',                'Pharrell Williams',    'G I R L',              'happy/happy.mp3',                'happy',   '/covers/happy.jpg',           233, 'Pop',       2013),
    ('Uptown Funk',          'Mark Ronson',          'Uptown Special',       'happy/uptown_funk.mp3',          'happy',   '/covers/uptown_funk.jpg',     269, 'Funk',      2014),
    ('Someone Like You',     'Adele',                '21',                   'sad/someone_like_you.mp3',       'sad',     '/covers/adele_21.jpg',        285, 'Soul',      2011),
    ('Fix You',              'Coldplay',             'X&Y',                  'sad/fix_you.mp3',                'sad',     '/covers/fix_you.jpg',         295, 'Rock',      2005),
    ('Let Her Go',           'Passenger',            'All the Little Lights','sad/let_her_go.mp3',             'sad',     '/covers/let_her_go.jpg',      252, 'Folk',      2012),
    ('Weightless',           'Marconi Union',        'Weightless',           'calm/weightless.mp3',            'calm',    '/covers/weightless.jpg',      480, 'Ambient',   2011),
    ('Breathe',              'Télépopmusik',         'Genetic World',        'calm/breathe.mp3',               'calm',    '/covers/breathe.jpg',         243, 'Downtempo', 2001),
    ('Starboy',              'The Weeknd',           'Starboy',              'angry/starboy.mp3',              'angry',   '/covers/starboy.jpg',         230, 'R&B',       2016),
    ('Lose Yourself',        'Eminem',               '8 Mile OST',           'angry/lose_yourself.mp3',        'angry',   '/covers/lose_yourself.jpg',   326, 'Hip-Hop',   2002),
    ('Shape of You',         'Ed Sheeran',           '÷ (Divide)',           'neutral/shape_of_you.mp3',       'neutral', '/covers/shape_of_you.jpg',    234, 'Pop',       2017),
    ('Electric Feel',        'MGMT',                 'Oracular Spectacular', 'surprise/electric_feel.mp3',     'surprise','/covers/electric_feel.jpg',   230, 'Synth-pop', 2007)
ON CONFLICT DO NOTHING;

-- Demo user (password: demo1234)
INSERT INTO users (username, email, password_hash) VALUES
    ('demo', 'demo@moodtune.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm9UJXQK6V0KZAG')
ON CONFLICT DO NOTHING;

-- Sample triggers for demo user
INSERT INTO triggers (song_id, trigger_word, created_by, priority)
SELECT s.id, t.word, u.id, 1
FROM users u,
     (VALUES
        (1, 'bl'),
        (1, 'weeknd'),
        (1, 'nightdrive'),
        (9, 'gym'),
        (9, 'beast'),
        (9, 'sb'),
        (4, 'heartbreak'),
        (4, 'adele'),
        (7, 'sleep'),
        (7, 'relax')
     ) AS t(song_id_ref, word)
JOIN songs s ON s.id = t.song_id_ref
WHERE u.email = 'demo@moodtune.ai'
ON CONFLICT DO NOTHING;
