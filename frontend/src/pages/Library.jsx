/**
 * MoodTune AI — Music Library Page
 * Full song browser with search, mood filter tabs, and grid/list toggle.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiGrid, FiList, FiMusic } from 'react-icons/fi';
import { songsAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/ui/SongCard';
import { formatTime } from '../utils/formatTime';

const MOODS = ['all', 'happy', 'sad', 'calm', 'angry', 'neutral', 'surprise'];

const moodColors = {
  all:      'border-brand-500 text-brand-400 bg-brand-500/10',
  happy:    'border-yellow-500 text-yellow-400 bg-yellow-500/10',
  sad:      'border-blue-500 text-blue-400 bg-blue-500/10',
  calm:     'border-teal-500 text-teal-400 bg-teal-500/10',
  angry:    'border-red-500 text-red-400 bg-red-500/10',
  neutral:  'border-gray-500 text-gray-400 bg-gray-500/10',
  surprise: 'border-orange-500 text-orange-400 bg-orange-500/10',
};

const moodEmojis = {
  all: '🎵', happy: '😄', sad: '😢', calm: '😌',
  angry: '😠', neutral: '😐', surprise: '😲',
};

// List view row
function SongRow({ song, queue, index }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => playSong(song, queue)}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all
                  hover:bg-dark-600/50 group ${isActive ? 'bg-brand-500/10 border border-brand-500/20' : ''}`}
    >
      <span className="text-dark-300 text-sm w-6 text-right">{index + 1}</span>

      {/* Album art */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">
        {song.cover_image ? (
          <img src={song.cover_image} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-brand-300' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-dark-200 text-xs truncate">{song.artist}</p>
      </div>

      <span className={`mood-badge emotion-${song.mood} hidden sm:block`}>{song.mood}</span>

      <span className="text-dark-300 text-xs w-12 text-right">
        {song.duration ? formatTime(song.duration) : '--:--'}
      </span>
    </motion.div>
  );
}

export default function Library() {
  const [songs,      setSongs]      = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [activeMood, setActiveMood] = useState('all');
  const [viewMode,   setViewMode]   = useState('grid'); // grid | list

  // Load all songs
  useEffect(() => {
    songsAPI.getAll({ limit: 200 })
      .then(({ data }) => { setSongs(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter whenever search or mood changes
  const applyFilters = useCallback(() => {
    let result = [...songs];
    if (activeMood !== 'all') {
      result = result.filter((s) => s.mood === activeMood);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [songs, activeMood, search]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">Music Library</h1>
          <p className="text-dark-200 text-sm mt-1">{filtered.length} songs</p>
        </div>
        {/* View toggle */}
        <div className="flex bg-dark-700 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-dark-200 hover:text-white'}`}
          >
            <FiGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-dark-200 hover:text-white'}`}
          >
            <FiList size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-200" size={18} />
        <input
          id="library-search"
          type="text"
          placeholder="Search songs, artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12 text-sm"
        />
      </div>

      {/* Mood filter tabs */}
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => setActiveMood(mood)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${
              activeMood === mood
                ? moodColors[mood]
                : 'border-dark-400 text-dark-200 hover:text-white hover:border-dark-300'
            }`}
          >
            {moodEmojis[mood]} {mood}
          </button>
        ))}
      </div>

      {/* Songs Grid / List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="rounded-2xl skeleton aspect-square" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FiMusic className="mx-auto mb-4 text-dark-400" size={48} />
            <p className="text-dark-200">No songs found matching your search.</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filtered.map((song, i) => (
              <SongCard key={song.id} song={song} queue={filtered} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card divide-y divide-dark-400/30"
          >
            {/* List header */}
            <div className="flex items-center gap-4 px-4 py-2 text-dark-300 text-xs uppercase tracking-wider">
              <span className="w-6">#</span>
              <span className="w-10" />
              <span className="flex-1">Title</span>
              <span className="hidden sm:block w-20">Mood</span>
              <span className="w-12 text-right">Time</span>
            </div>
            {filtered.map((song, i) => (
              <SongRow key={song.id} song={song} queue={filtered} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
