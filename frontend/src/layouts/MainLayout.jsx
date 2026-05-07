/**
 * MoodTune AI — Main App Layout
 * Sidebar + content area + sticky player. Protected layout for authenticated pages.
 */

import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import MusicPlayer from '../components/player/MusicPlayer';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-pulse"
               style={{ background: 'linear-gradient(135deg, #3d5aff, #a855f7)' }}>
            🎵
          </div>
          <p className="text-dark-200 text-sm">Loading MoodTune AI...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-dark-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(var(--player-height) + 20px)' }}
      >
        <Outlet />
      </main>

      {/* Sticky Bottom Player */}
      <MusicPlayer />
    </div>
  );
}
