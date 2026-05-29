/**
 * MoodTune AI — Dashboard Page
 * Main hub: emotion widget, recommendations, trending, recent, quick actions.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiClock, FiHeart, FiZap } from 'react-icons/fi';
import { songsAPI, historyAPI } from '../services/api';
import { useAuth }   from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/ui/SongCard';
import EmotionDetector from '../components/emotion/EmotionDetector';

// Greeting based on time of day
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Horizontal scroll song row
function SongRow({ title, icon: Icon, songs, isLoading }) {
  const { playSong } = usePlayer();
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-brand-400" size={18} />
        <h2 className="text-white font-semibold">{title}</h2>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl skeleton aspect-square" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {songs.map((song, i) => (
            <SongCard key={song.id} song={song} queue={songs} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user }    = useAuth();
  const { detectedMood, playSong } = usePlayer();

  const [moodSongs,     setMoodSongs]     = useState([]);
  const [allSongs,      setAllSongs]      = useState([]);
  const [recentSongs,   setRecentSongs]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [detectedData,  setDetectedData]  = useState(null);

  // Load songs on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [songsRes, historyRes] = await Promise.allSettled([
          songsAPI.getAll({ limit: 20 }),
          historyAPI.getAll(10),
        ]);

        if (songsRes.status === 'fulfilled') {
          setAllSongs(songsRes.value.data);
        }

        if (historyRes.status === 'fulfilled') {
          const songs = historyRes.value.data
            .map((h) => h.song)
            .filter(Boolean);
          setRecentSongs(songs.slice(0, 10));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When emotion detected, load mood songs
  const handleEmotionDetected = async (data) => {
    setDetectedData(data);
    if (data.recommended_songs?.length > 0) {
      setMoodSongs(data.recommended_songs);
    } else {
      try {
        const { data: songs } = await songsAPI.getByMood(data.emotion);
        setMoodSongs(songs);
      } catch { /* ignore */ }
    }
  };

  const moodEmojis = {
    happy: '😄', sad: '😢', angry: '😠',
    neutral: '😐', surprise: '😲', calm: '😌',
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-dark-200 text-sm mb-1"
        >
          {getGreeting()},
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold font-display text-white"
        >
          {user?.username} 👋
        </motion.h1>
      </div>

      {/* ── Main Grid: Emotion + Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Emotion Detector (takes 1 column on xl) */}
        <div className="xl:col-span-1">
          <EmotionDetector onEmotionDetected={handleEmotionDetected} autoPlay={false} />
        </div>

        {/* Stats / Quick Actions (takes 2 columns on xl) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Detected emotion hero card */}
          {detectedData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="gradient-card p-6"
            >
              <div className="flex items-center gap-4">
                <span className="text-6xl">
                  {moodEmojis[detectedData.emotion] || '🎵'}
                </span>
                <div>
                  <p className="text-dark-200 text-sm">Your current mood</p>
                  <h2 className="text-3xl font-bold text-white capitalize font-display">
                    {detectedData.emotion}
                  </h2>
                  <p className="text-brand-400 text-sm mt-1">
                    {Math.round(detectedData.confidence * 100)}% confidence • {detectedData.recommended_songs?.length || 0} songs queued
                  </p>
                </div>
                {detectedData.recommended_songs?.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playSong(detectedData.recommended_songs[0], detectedData.recommended_songs, detectedData.emotion)}
                    className="ml-auto btn-brand flex items-center gap-2"
                  >
                    <FiZap size={16} />
                    Play Now
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Songs Available', value: allSongs.length, color: 'brand' },
              { label: 'Recently Played', value: recentSongs.length, color: 'purple' },
              { label: 'Mood Matches',    value: moodSongs.length,  color: 'pink' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className={`text-2xl font-bold font-display text-${stat.color === 'brand' ? 'brand-400' : stat.color === 'purple' ? 'accent-purple' : 'accent-pink'}`}>
                  {stat.value}
                </p>
                <p className="text-dark-200 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mood-Based Recommendations ─────────────────────────────────── */}
      {moodSongs.length > 0 && (
        <SongRow
          title={`Songs for Your ${detectedData?.emotion || 'Current'} Mood`}
          icon={FiZap}
          songs={moodSongs}
          isLoading={false}
        />
      )}

      {/* ── Recently Played ────────────────────────────────────────────── */}
      {recentSongs.length > 0 && (
        <SongRow
          title="Recently Played"
          icon={FiClock}
          songs={recentSongs}
          isLoading={false}
        />
      )}

      {/* ── All Songs / Trending ───────────────────────────────────────── */}
      <SongRow
        title="Trending in MoodTune"
        icon={FiTrendingUp}
        songs={allSongs}
        isLoading={loading}
      />
    </div>
  );
}
