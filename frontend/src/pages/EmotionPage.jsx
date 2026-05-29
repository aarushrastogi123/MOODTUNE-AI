/**
 * MoodTune AI — Emotion Detection Full Page
 * Dedicated page for webcam emotion detection with large display and auto-play.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiInfo } from 'react-icons/fi';
import EmotionDetector from '../components/emotion/EmotionDetector';
import SongCard from '../components/ui/SongCard';

const MOOD_INFO = {
  happy:    { desc: 'Upbeat, energetic tunes to match your joy!',   color: 'text-yellow-400' },
  sad:      { desc: 'Soulful, emotional songs that understand you.', color: 'text-blue-400'   },
  angry:    { desc: 'High-energy tracks to channel your intensity.', color: 'text-red-400'    },
  neutral:  { desc: 'Balanced mix for any occasion.',               color: 'text-gray-400'   },
  surprise: { desc: 'Unexpected gems you\'ll love!',                color: 'text-orange-400' },
  calm:     { desc: 'Soothing ambient sounds to relax your mind.',  color: 'text-teal-400'   },
};

export default function EmotionPage() {
  const [detectedData, setDetectedData] = useState(null);

  const moodInfo = detectedData ? (MOOD_INFO[detectedData.emotion] || { desc: 'Enjoy the music!', color: 'text-brand-400' }) : null;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white font-display">Emotion Detection</h1>
        <p className="text-dark-200 text-sm mt-1">
          Your webcam analyzes your facial expression and plays music that matches your mood.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
        <FiInfo className="text-brand-400 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-brand-200 text-sm">
          <strong>How it works:</strong> Click "Auto Detect" to start continuous scanning every 4 seconds,
          or "Scan" for a one-time detection. The AI will recommend songs matching your emotion.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Detector widget */}
        <EmotionDetector onEmotionDetected={setDetectedData} autoPlay />

        {/* Results panel */}
        <div className="space-y-4">
          {detectedData ? (
            <>
              <motion.div
                key={detectedData.emotion}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="gradient-card p-6"
              >
                <h2 className={`text-2xl font-bold capitalize font-display ${moodInfo?.color}`}>
                  {detectedData.emotion} Detected
                </h2>
                <p className="text-dark-100 mt-1">{moodInfo?.desc}</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-brand"
                      initial={{ width: 0 }}
                      animate={{ width: `${detectedData.confidence * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm">
                    {Math.round(detectedData.confidence * 100)}%
                  </span>
                </div>
              </motion.div>

              {detectedData.recommended_songs?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">🎵 Recommended for You</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {detectedData.recommended_songs.map((song, i) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        queue={detectedData.recommended_songs}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-10 text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-white font-semibold text-lg mb-2">Ready to Detect</h3>
              <p className="text-dark-200 text-sm">
                Allow camera access and click "Scan" or "Auto Detect" to analyze your emotion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
