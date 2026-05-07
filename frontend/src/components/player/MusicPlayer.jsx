/**
 * MoodTune AI — Sticky Bottom Music Player
 * Full-featured player bar with album art, song info, controls, seek, volume.
 */

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiShuffle, FiRepeat, FiVolume2, FiVolumex,
  FiHeart, FiList,
} from 'react-icons/fi';
import { TbRepeatOnce } from 'react-icons/tb';
import { usePlayer } from '../../context/PlayerContext';
import { favoritesAPI } from '../../services/api';
import { formatTime } from '../../utils/formatTime';

// Waveform animation bars (shown when playing)
function WaveformBars() {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            height: `${Math.random() * 12 + 4}px`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

// Album art thumbnail with spinning animation
function AlbumArt({ song, isPlaying }) {
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <div
        className={`w-full h-full rounded-xl overflow-hidden border-2 border-brand-500/30 ${
          isPlaying ? 'album-spin' : 'album-spin paused'
        }`}
      >
        {song?.cover_image ? (
          <img
            src={song.cover_image}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
        )}
      </div>
      {/* Center dot on vinyl */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3 h-3 rounded-full bg-dark-900 border border-dark-400" />
      </div>
    </div>
  );
}

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, duration, currentTime,
    volume, isShuffle, repeatMode, isMuted, isLoading,
    togglePlay, seek, setVolume, toggleMute,
    playNext, playPrev, toggleShuffle, cycleRepeat,
  } = usePlayer();

  const seekBarRef = useRef(null);

  if (!currentSong) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSeekClick = (e) => {
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  const handleFavorite = async () => {
    try { await favoritesAPI.add(currentSong.id); }
    catch { /* Already favorited */ }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const RepeatIcon = repeatMode === 'one' ? TbRepeatOnce : FiRepeat;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        exit={{    y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(6,6,8,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(61,90,255,0.2)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Seek Bar — full width at very top of player */}
        <div
          ref={seekBarRef}
          className="w-full h-1 bg-dark-400 cursor-pointer group"
          onClick={handleSeekClick}
        >
          <div
            className="h-full transition-all duration-100 group-hover:h-1.5 -mt-0.5"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3d5aff, #a855f7)',
              transition: 'height 0.15s',
            }}
          />
        </div>

        {/* Player Content */}
        <div className="flex items-center justify-between px-6 py-3 gap-4">

          {/* ── Left: Song Info ────────────────────────────────────────── */}
          <div className="flex items-center gap-4 w-72 min-w-0">
            <AlbumArt song={currentSong} isPlaying={isPlaying} />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{currentSong.title}</p>
              <p className="text-dark-100 text-xs truncate">{currentSong.artist}</p>
              {isPlaying && <WaveformBars />}
            </div>
            <button
              onClick={handleFavorite}
              className="text-dark-200 hover:text-pink-400 transition-colors flex-shrink-0"
              title="Add to favorites"
            >
              <FiHeart size={18} />
            </button>
          </div>

          {/* ── Center: Controls ───────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
            {/* Control buttons */}
            <div className="flex items-center gap-6">
              <button
                onClick={toggleShuffle}
                className={`transition-colors ${isShuffle ? 'text-brand-400' : 'text-dark-200 hover:text-white'}`}
                title="Shuffle"
              >
                <FiShuffle size={18} />
              </button>

              <button
                onClick={playPrev}
                className="text-dark-100 hover:text-white transition-colors"
                title="Previous"
              >
                <FiSkipBack size={22} />
              </button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                disabled={isLoading}
                className="w-12 h-12 rounded-full flex items-center justify-center
                           text-white font-bold transition-all duration-200
                           disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #3d5aff, #a855f7)',
                  boxShadow: '0 4px 20px rgba(61,90,255,0.5)',
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <FiPause size={20} />
                ) : (
                  <FiPlay size={20} className="ml-0.5" />
                )}
              </motion.button>

              <button
                onClick={playNext}
                className="text-dark-100 hover:text-white transition-colors"
                title="Next"
              >
                <FiSkipForward size={22} />
              </button>

              <button
                onClick={cycleRepeat}
                className={`transition-colors ${repeatMode !== 'none' ? 'text-brand-400' : 'text-dark-200 hover:text-white'}`}
                title={`Repeat: ${repeatMode}`}
              >
                <RepeatIcon size={18} />
              </button>
            </div>

            {/* Time display */}
            <div className="flex items-center gap-2 text-xs text-dark-200 w-full">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 text-center text-dark-300 text-xs">
                {currentSong.mood && (
                  <span className={`mood-badge emotion-${currentSong.mood}`}>
                    {currentSong.mood}
                  </span>
                )}
              </div>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* ── Right: Volume ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3 w-48 justify-end">
            <button
              onClick={toggleMute}
              className="text-dark-200 hover:text-white transition-colors flex-shrink-0"
            >
              {isMuted ? <FiVolumex size={20} /> : <FiVolume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-brand-500"
              style={{
                background: `linear-gradient(to right, #3d5aff ${(isMuted ? 0 : volume) * 100}%, #2e2e4a ${(isMuted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
