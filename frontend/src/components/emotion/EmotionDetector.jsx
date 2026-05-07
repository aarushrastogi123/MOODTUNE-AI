/**
 * MoodTune AI — Webcam Emotion Detector Widget
 * Uses react-webcam to capture frames, sends to backend for emotion detection,
 * and displays real-time results with confidence bars.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiCameraOff, FiZap, FiRefreshCw } from 'react-icons/fi';
import { emotionAPI, songsAPI } from '../../services/api';
import { usePlayer } from '../../context/PlayerContext';

const EMOTION_COLORS = {
  happy:    { bar: '#f59e0b', text: 'text-yellow-400', bg: 'bg-yellow-500/10', emoji: '😄' },
  sad:      { bar: '#3b82f6', text: 'text-blue-400',   bg: 'bg-blue-500/10',   emoji: '😢' },
  angry:    { bar: '#ef4444', text: 'text-red-400',    bg: 'bg-red-500/10',    emoji: '😠' },
  neutral:  { bar: '#6b7280', text: 'text-gray-400',   bg: 'bg-gray-500/10',   emoji: '😐' },
  surprise: { bar: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/10', emoji: '😲' },
  fear:     { bar: '#8b5cf6', text: 'text-violet-400', bg: 'bg-violet-500/10', emoji: '😨' },
  disgust:  { bar: '#22c55e', text: 'text-green-400',  bg: 'bg-green-500/10',  emoji: '🤢' },
  calm:     { bar: '#14b8a6', text: 'text-teal-400',   bg: 'bg-teal-500/10',   emoji: '😌' },
};

const WEBCAM_CONSTRAINTS = {
  width: 640, height: 480,
  facingMode: 'user',
};

export default function EmotionDetector({ onEmotionDetected, autoPlay = false }) {
  const webcamRef   = useRef(null);
  const intervalRef = useRef(null);

  const [isActive,      setIsActive]      = useState(false);
  const [emotion,       setEmotion]       = useState(null);
  const [confidence,    setConfidence]    = useState(0);
  const [allEmotions,   setAllEmotions]   = useState({});
  const [songs,         setSongs]         = useState([]);
  const [error,         setError]         = useState(null);
  const [isDetecting,   setIsDetecting]   = useState(false);
  const [cameraReady,   setCameraReady]   = useState(false);

  const { playSong, setDetectedMood } = usePlayer();

  // ── Detection Loop ────────────────────────────────────────────────────────

  const detect = useCallback(async () => {
    if (!webcamRef.current || isDetecting) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Strip "data:image/jpeg;base64," prefix
    const base64 = imageSrc.replace(/^data:image\/[a-z]+;base64,/, '');

    setIsDetecting(true);
    setError(null);

    try {
      const { data } = await emotionAPI.detect(base64);
      setEmotion(data.emotion);
      setConfidence(data.confidence);
      setAllEmotions(data.all_emotions || {});
      setSongs(data.recommended_songs || []);
      setDetectedMood(data.emotion);

      if (onEmotionDetected) onEmotionDetected(data);

      // Auto-play first recommended song
      if (autoPlay && data.recommended_songs?.length > 0) {
        playSong(data.recommended_songs[0], data.recommended_songs, data.emotion);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Detection failed. Check camera and try again.');
    } finally {
      setIsDetecting(false);
    }
  }, [isDetecting, onEmotionDetected, autoPlay, playSong, setDetectedMood]);

  // ── Start / Stop Camera ───────────────────────────────────────────────────

  const startDetection = useCallback(() => {
    setIsActive(true);
    setError(null);
    // Auto-detect every 4 seconds
    intervalRef.current = setInterval(detect, 4000);
  }, [detect]);

  const stopDetection = useCallback(() => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    setEmotion(null);
    setAllEmotions({});
  }, []);

  // Run one-shot detect when manually triggered
  const detectOnce = useCallback(() => {
    detect();
  }, [detect]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const emotionData = EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <FiCamera className="text-brand-400" />
          Emotion Detector
        </h2>
        <div className="flex gap-2">
          <button
            onClick={detectOnce}
            disabled={!cameraReady || isDetecting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500
                       text-dark-100 text-xs transition-all disabled:opacity-50"
          >
            <FiRefreshCw size={12} className={isDetecting ? 'animate-spin' : ''} />
            Scan
          </button>
          <button
            onClick={isActive ? stopDetection : startDetection}
            disabled={!cameraReady}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium 
                        transition-all disabled:opacity-50 ${
              isActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30'
            }`}
          >
            {isActive ? <FiCameraOff size={12} /> : <FiZap size={12} />}
            {isActive ? 'Stop' : 'Auto Detect'}
          </button>
        </div>
      </div>

      {/* Webcam Feed */}
      <div className="relative rounded-xl overflow-hidden bg-dark-800" style={{ aspectRatio: '4/3' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.8}
          videoConstraints={WEBCAM_CONSTRAINTS}
          className="w-full h-full object-cover"
          onUserMedia={() => setCameraReady(true)}
          onUserMediaError={() => {
            setError('Camera access denied. Please allow camera permissions.');
            setCameraReady(false);
          }}
        />

        {/* Active scan overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-brand-500/40 rounded-xl webcam-pulse" />
            {/* Scan line */}
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent"
              animate={{ top: ['15%', '85%', '15%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Current emotion overlay */}
        {emotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute bottom-3 left-3 right-3 ${emotionData.bg} backdrop-blur-sm
                        border border-white/10 rounded-xl p-3 flex items-center gap-3`}
          >
            <span className="text-3xl">{emotionData.emoji}</span>
            <div>
              <p className={`font-bold capitalize text-sm ${emotionData.text}`}>{emotion}</p>
              <p className="text-white/60 text-xs">{Math.round(confidence * 100)}% confidence</p>
            </div>
          </motion.div>
        )}

        {/* Camera not ready */}
        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-dark-200 text-sm">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Emotion probability bars */}
      {Object.keys(allEmotions).length > 0 && (
        <div className="space-y-2">
          <p className="text-dark-200 text-xs font-medium uppercase tracking-wider">Emotion Analysis</p>
          {Object.entries(allEmotions)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([emo, prob]) => {
              const c = EMOTION_COLORS[emo] || EMOTION_COLORS.neutral;
              return (
                <div key={emo} className="flex items-center gap-3">
                  <span className="text-sm w-5">{c.emoji}</span>
                  <span className="text-dark-100 text-xs capitalize w-16">{emo}</span>
                  <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prob * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.bar }}
                    />
                  </div>
                  <span className="text-dark-200 text-xs w-10 text-right">
                    {Math.round(prob * 100)}%
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
