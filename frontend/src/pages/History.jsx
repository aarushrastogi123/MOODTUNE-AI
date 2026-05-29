/**
 * MoodTune AI — History Page
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiPlay } from 'react-icons/fi';
import { historyAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

const playedByColors = {
  manual:  'bg-gray-500/20 text-gray-400',
  emotion: 'bg-brand-500/20 text-brand-400',
  trigger: 'bg-purple-500/20 text-purple-400',
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    historyAPI.getAll(100)
      .then(({ data }) => setHistory(data))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white font-display flex items-center gap-3">
          <FiClock className="text-brand-400" /> Play History
        </h1>
        <p className="text-dark-200 text-sm mt-1">{history.length} plays recorded</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiClock className="mx-auto mb-4 text-dark-400" size={48} />
          <p className="text-white font-semibold mb-2">No history yet</p>
          <p className="text-dark-200 text-sm">Start playing songs to build your history.</p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-dark-400/20">
          {history.map((entry, i) => {
            const song = entry.song;
            if (!song) return null;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => playSong(song)}
                className="flex items-center gap-4 px-4 py-3 hover:bg-dark-600/50 cursor-pointer group transition-all"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0 relative">
                  {song.cover_image
                    ? <img src={song.cover_image} alt={song.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
                  }
                  <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiPlay size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{song.title}</p>
                  <p className="text-dark-200 text-xs">{song.artist}</p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {entry.detected_mood && (
                    <span className={`mood-badge emotion-${entry.detected_mood}`}>
                      {entry.detected_mood}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${playedByColors[entry.played_by] || playedByColors.manual}`}>
                    {entry.played_by}
                  </span>
                </div>
                <span className="text-dark-300 text-xs whitespace-nowrap hidden sm:block">
                  {formatDate(entry.played_at)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
