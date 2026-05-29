/**
 * MoodTune AI — App Router
 * Defines all routes and wraps with context providers.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import MainLayout   from './layouts/MainLayout';
import AuthPage     from './pages/AuthPage';
import Dashboard    from './pages/Dashboard';
import Library      from './pages/Library';
import EmotionPage  from './pages/EmotionPage';
import TriggerManager from './pages/TriggerManager';
import Favorites    from './pages/Favorites';
import History      from './pages/History';
import Settings     from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"  element={<AuthPage />} />

            {/* Protected — all within MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/library"   element={<Library />} />
              <Route path="/emotion"   element={<EmotionPage />} />
              <Route path="/triggers"  element={<TriggerManager />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/history"   element={<History />} />
              <Route path="/settings"  element={<Settings />} />
            </Route>

            {/* Default redirects */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
