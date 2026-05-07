/**
 * MoodTune AI — Reusable Song Card Component
 * Displays a song in a glass-morphism card with play, favorite, and context controls.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiHeart, FiMoreHorizontal } from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext';
import { favoritesAPI } from '../../services/api';
import { formatTime } from '../../utils/formatTime';

const moodGradients = {
  happy:    'from-yellow-500/20 to-orange-500/10',
  sad:      'from-blue-500/20 to-indigo-500/10',
  angry:    'from-red-500/20 to-pink-500/10',
  neutral:  'from-gray-500/20 to-slate-500/10',
  surprise: 'from-orange-500/20 to-yellow-500/10',
  calm:     'from-teal-500/20 to-cyan-500/10',
};

const moodEmojis = {
  happy: '😄', sad: '😢', angry: '😠',
  neutral: '😐', surprise: '😲', calm: '😌',
};

export default function SongCard({ song, queue = [], index = 0 }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const [isFav,     setIsFav]     = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const isCurrentSong = currentSong?.id === song.id;
  const moodClass     = moodGradients[song.mood] || moodGradients.neutral;

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue.length > 0 ? queue : [song]);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    setFavLoading(true);
    try {
      if (isFav) {
        await favoritesAPI.remove(song.id);
        setIsFav(false);
      } else {
        await favoritesAPI.add(song.id);
        setIsFav(true);
      }
    } catch { /* Ignore errors silently */ }
    finally { setFavLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`song-card bg-gradient-to-br ${moodClass} border border-dark-400/50 
                  ${isCurrentSong ? 'border-brand-500/50 shadow-glow-sm' : ''}`}
      onClick={handlePlay}
    >
      {/* Album Art */}
      <div className="relative mb-3 aspect-square rounded-lg overflow-hidden bg-dark-600">
        {song.cover_image ? (
          <img
            src={song.cover_image}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl"
               style={{ background: 'linear-gradient(135deg, #3d5aff22, #a855f722)' }}>
            {moodEmojis[song.mood] || '🎵'}
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-dark-900/40 flex items-center justify-center 
                        opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-brand"
            style={{ background: 'linear-gradient(135deg, #3d5aff, #a855f7)' }}
          >
            {isCurrentSong && isPlaying ? (
              <FiPause size={20} className="text-white" />
            ) : (
              <FiPlay size={20} className="text-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Now playing indicator */}
        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-2 left-2 flex gap-0.5 items-end">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-brand-400 rounded-full waveform-bar"
                style={{ height: '12px', animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate ${isCurrentSong ? 'text-brand-300' : 'text-white'}`}>
            {song.title}
          </p>
          <p className="text-dark-200 text-xs truncate mt-0.5">{song.artist}</p>
          {song.duration && (
            <p className="text-dark-300 text-xs mt-1">{formatTime(song.duration)}</p>
          )}
        </div>

        <button
          onClick={handleFavorite}
          disabled={favLoading}
          className={`flex-shrink-0 transition-colors mt-0.5 ${
            isFav ? 'text-pink-400' : 'text-dark-300 hover:text-pink-400'
          }`}
        >
          <FiHeart size={16} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
}
