/**
 * MoodTune AI — Favorites Page
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { favoritesAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    favoritesAPI.getAll()
      .then(({ data }) => setFavorites(data))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (songId) => {
    await favoritesAPI.remove(songId);
    setFavorites((prev) => prev.filter((f) => f.song.id !== songId));
  };

  const songs = favorites.map((f) => f.song).filter(Boolean);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white font-display flex items-center gap-3">
          <FiHeart className="text-pink-400" /> Favorites
        </h1>
        <p className="text-dark-200 text-sm mt-1">{favorites.length} saved songs</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiHeart className="mx-auto mb-4 text-dark-400" size={48} />
          <p className="text-white font-semibold mb-2">No favorites yet</p>
          <p className="text-dark-200 text-sm">Heart songs from the library to save them here.</p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-dark-400/30">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-2 text-dark-300 text-xs uppercase tracking-wider">
            <span className="w-6">#</span>
            <span className="w-10" />
            <span className="flex-1">Title</span>
            <span className="hidden sm:block w-20">Mood</span>
            <span className="w-12 text-right">Time</span>
            <span className="w-8" />
          </div>
          <AnimatePresence>
            {favorites.map((fav, i) => {
              const song = fav.song;
              if (!song) return null;
              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => playSong(song, songs)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-dark-600/50 cursor-pointer group transition-all"
                >
                  <span className="text-dark-300 text-sm w-6 text-right">{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">
                    {song.cover_image
                      ? <img src={song.cover_image} alt={song.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{song.title}</p>
                    <p className="text-dark-200 text-xs truncate">{song.artist}</p>
                  </div>
                  <span className={`mood-badge emotion-${song.mood} hidden sm:block`}>{song.mood}</span>
                  <span className="text-dark-300 text-xs w-12 text-right">
                    {song.duration ? formatTime(song.duration) : '--:--'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(song.id); }}
                    className="w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
