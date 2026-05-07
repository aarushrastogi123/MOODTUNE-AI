/**
 * MoodTune AI — Player Context
 * Global music player state: current song, queue, playback controls.
 * Wraps the HTML5 Audio API and exposes a clean interface to all components.
 */

import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { songsAPI, historyAPI } from '../services/api';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  // Current song metadata
  const [currentSong,   setCurrentSong]   = useState(null);
  // Playback queue
  const [queue,         setQueue]          = useState([]);
  const [queueIndex,    setQueueIndex]     = useState(0);
  // Player state
  const [isPlaying,     setIsPlaying]      = useState(false);
  const [duration,      setDuration]       = useState(0);
  const [currentTime,   setCurrentTime]    = useState(0);
  const [volume,        setVolumeState]    = useState(0.8);
  const [isShuffle,     setIsShuffle]      = useState(false);
  const [repeatMode,    setRepeatMode]     = useState('none'); // none | one | all
  const [isMuted,       setIsMuted]        = useState(false);
  const [isLoading,     setIsLoading]      = useState(false);
  const [detectedMood,  setDetectedMood]   = useState(null);

  const audioRef = useRef(new Audio());

  // ── Audio Event Listeners ─────────────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate  = () => setCurrentTime(audio.currentTime);
    const onDuration    = () => setDuration(audio.duration);
    const onEnded       = () => handleSongEnd();
    const onCanPlay     = () => setIsLoading(false);
    const onWaiting     = () => setIsLoading(true);
    const onError       = () => { setIsLoading(false); setIsPlaying(false); };

    audio.addEventListener('timeupdate',      onTimeUpdate);
    audio.addEventListener('durationchange',  onDuration);
    audio.addEventListener('ended',           onEnded);
    audio.addEventListener('canplay',         onCanPlay);
    audio.addEventListener('waiting',         onWaiting);
    audio.addEventListener('error',           onError);

    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('canplay',        onCanPlay);
      audio.removeEventListener('waiting',        onWaiting);
      audio.removeEventListener('error',          onError);
    };
  }, []);

  // ── Core Playback ─────────────────────────────────────────────────────────

  const playSong = useCallback(async (song, songQueue = null, mood = null) => {
    const audio = audioRef.current;

    setCurrentSong(song);
    setIsLoading(true);
    setIsPlaying(false);

    // Update queue if provided
    if (songQueue) {
      setQueue(songQueue);
      setQueueIndex(songQueue.findIndex((s) => s.id === song.id));
    }

    // Set the audio source to the streaming endpoint
    audio.src = songsAPI.streamUrl(song.id);
    audio.load();

    try {
      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);

      // Record play in history (best-effort — don't block on failure)
      const token = localStorage.getItem('moodtune_token');
      if (token) {
        historyAPI.add(song.id, mood ? 'emotion' : 'manual', mood).catch(() => {});
      }
      if (mood) setDetectedMood(mood);
    } catch (err) {
      console.error('[Player] Playback error:', err);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol) => {
    audioRef.current.volume = vol;
    setVolumeState(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (isMuted) {
      audio.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // ── Queue Navigation ──────────────────────────────────────────────────────

  const playNext = useCallback(() => {
    if (!queue.length) return;
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (queueIndex + 1) % queue.length;
    }
    setQueueIndex(nextIdx);
    playSong(queue[nextIdx], null);
  }, [queue, queueIndex, isShuffle, playSong]);

  const playPrev = useCallback(() => {
    if (!queue.length) return;
    // If more than 3 seconds in, restart current song
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    playSong(queue[prevIdx], null);
  }, [queue, queueIndex, currentTime, seek, playSong]);

  const handleSongEnd = useCallback(() => {
    if (repeatMode === 'one') {
      seek(0);
      audioRef.current.play();
      return;
    }
    if (repeatMode === 'all' || queue.length > 0) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, queue, seek, playNext]);

  const toggleShuffle = useCallback(() => setIsShuffle((s) => !s), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => ({ none: 'one', one: 'all', all: 'none' }[m]));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, queue, isPlaying, duration, currentTime,
        volume, isShuffle, repeatMode, isMuted, isLoading,
        detectedMood, setDetectedMood,
        playSong, togglePlay, seek, setVolume, toggleMute,
        playNext, playPrev, toggleShuffle, cycleRepeat,
        setQueue, setQueueIndex,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
