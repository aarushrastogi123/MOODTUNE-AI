/**
 * MoodTune AI — Settings Page
 */

import { motion } from 'framer-motion';
import { FiSettings, FiUser, FiMusic, FiSliders, FiShield, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function SettingSection({ title, icon: Icon, children }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <Icon className="text-brand-400" size={18} /> {title}
      </h2>
      {children}
    </div>
  );
}

function ToggleSetting({ label, desc, defaultOn = false }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {desc && <p className="text-dark-200 text-xs mt-0.5">{desc}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultOn} />
        <div className="w-11 h-6 bg-dark-500 rounded-full peer-checked:bg-brand-500 
                        after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                        after:bg-white after:rounded-full after:h-5 after:w-5 
                        after:transition-all peer-checked:after:translate-x-5 transition-colors" />
      </label>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white font-display flex items-center gap-3">
          <FiSettings className="text-brand-400" /> Settings
        </h1>
      </div>

      {/* Profile */}
      <SettingSection title="Profile" icon={FiUser}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-2xl font-bold text-white">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.username}</p>
            <p className="text-dark-200 text-sm">{user?.email}</p>
          </div>
        </div>
        <button className="btn-ghost text-sm py-2">Edit Profile</button>
      </SettingSection>

      {/* Playback */}
      <SettingSection title="Playback" icon={FiMusic}>
        <ToggleSetting label="Auto-play on Emotion Detection" desc="Automatically play songs when mood is detected" defaultOn />
        <ToggleSetting label="Crossfade Between Songs" desc="Smooth 3-second fade between tracks" />
        <ToggleSetting label="High Quality Audio" desc="Stream at highest available quality" defaultOn />
        <ToggleSetting label="Shuffle New Sessions" desc="Start each session with shuffle enabled" />
      </SettingSection>

      {/* AI / Emotion */}
      <SettingSection title="AI & Emotion" icon={FiSliders}>
        <ToggleSetting label="Continuous Emotion Scanning" desc="Scan every 4 seconds while camera is active" defaultOn />
        <ToggleSetting label="Mood History Tracking" desc="Record detected moods with play history" defaultOn />
        <ToggleSetting label="Smart Recommendations" desc="AI learns from your listening patterns" defaultOn />
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-white text-sm font-medium">Fuzzy Match Threshold</p>
            <p className="text-dark-200 text-xs mt-0.5">How closely trigger words must match (0–100)</p>
          </div>
          <input
            type="number"
            defaultValue={70}
            min={0}
            max={100}
            className="input-field w-20 py-1.5 text-center text-sm"
          />
        </div>
      </SettingSection>

      {/* Privacy */}
      <SettingSection title="Privacy & Security" icon={FiShield}>
        <ToggleSetting label="Anonymous Usage Data" desc="Help improve MoodTune AI (no personal data)" />
        <ToggleSetting label="Camera Access" desc="Required for emotion detection" defaultOn />
        <div className="pt-2 border-t border-dark-400">
          <button className="text-red-400 hover:text-red-300 text-sm transition-colors">
            Delete Account & Data
          </button>
        </div>
      </SettingSection>

      {/* Future Integrations */}
      <SettingSection title="Integrations (Coming Soon)" icon={FiGlobe}>
        <div className="space-y-3 opacity-60 pointer-events-none">
          <div className="flex items-center justify-between p-3 rounded-xl border border-dark-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎵</span>
              <div>
                <p className="text-white text-sm font-medium">Spotify Integration</p>
                <p className="text-dark-200 text-xs">Sync your Spotify library — v2.0</p>
              </div>
            </div>
            <span className="text-xs bg-dark-600 text-dark-200 px-2 py-1 rounded-full">Soon</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-dark-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎤</span>
              <div>
                <p className="text-white text-sm font-medium">Voice Commands</p>
                <p className="text-dark-200 text-xs">"Hey MoodTune, play something calm" — v2.5</p>
              </div>
            </div>
            <span className="text-xs bg-dark-600 text-dark-200 px-2 py-1 rounded-full">Soon</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-dark-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✋</span>
              <div>
                <p className="text-white text-sm font-medium">Air Writing Gestures</p>
                <p className="text-dark-200 text-xs">Write trigger words in the air — v3.0</p>
              </div>
            </div>
            <span className="text-xs bg-dark-600 text-dark-200 px-2 py-1 rounded-full">Soon</span>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}
