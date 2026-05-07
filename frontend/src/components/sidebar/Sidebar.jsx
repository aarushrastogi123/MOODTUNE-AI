/**
 * MoodTune AI — Left Sidebar Navigation
 * Fixed sidebar with app logo, navigation links, and current mood display.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiMusic, FiHeart, FiClock, FiSettings,
  FiZap, FiLogOut, FiUser,
} from 'react-icons/fi';
import { MdOutlineWifi } from 'react-icons/md';
import { useAuth }   from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';

const navItems = [
  { to: '/dashboard',  icon: FiHome,          label: 'Home' },
  { to: '/library',    icon: FiMusic,          label: 'Library' },
  { to: '/emotion',    icon: MdOutlineWifi,    label: 'Emotion' },
  { to: '/triggers',   icon: FiZap,            label: 'Triggers' },
  { to: '/favorites',  icon: FiHeart,          label: 'Favorites' },
  { to: '/history',    icon: FiClock,          label: 'History' },
  { to: '/settings',   icon: FiSettings,       label: 'Settings' },
];

const moodColors = {
  happy:    'text-yellow-400',
  sad:      'text-blue-400',
  angry:    'text-red-400',
  neutral:  'text-gray-400',
  surprise: 'text-orange-400',
  calm:     'text-teal-400',
};

const moodEmojis = {
  happy: '😄', sad: '😢', angry: '😠',
  neutral: '😐', surprise: '😲', calm: '😌',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { detectedMood } = usePlayer();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      className="flex flex-col h-screen sticky top-0 py-6 px-3 overflow-y-auto"
      style={{
        width: 'var(--sidebar-width)',
        background: 'rgba(13,13,20,0.98)',
        borderRight: '1px solid rgba(46,46,74,0.6)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #3d5aff, #a855f7)' }}
        >
          🎵
        </div>
        <div>
          <h1 className="text-white font-bold text-sm font-display leading-tight">MoodTune</h1>
          <p className="text-brand-400 text-xs">AI Music Player</p>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Detected Mood Widget ──────────────────────────────────────── */}
      {detectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 my-4 p-3 rounded-xl border border-dark-400 bg-dark-700/50"
        >
          <p className="text-xs text-dark-200 mb-1">Current Mood</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{moodEmojis[detectedMood] || '🎵'}</span>
            <span className={`font-semibold capitalize ${moodColors[detectedMood] || 'text-white'}`}>
              {detectedMood}
            </span>
          </div>
        </motion.div>
      )}

      {/* ── User Profile ─────────────────────────────────────────────── */}
      <div className="mt-4 mx-1 p-3 rounded-xl bg-dark-700/50 border border-dark-400">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <FiUser size={16} className="text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.username || 'Guest'}</p>
            <p className="text-dark-200 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-dark-200 hover:text-red-400 text-sm transition-colors w-full"
        >
          <FiLogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
