/**
 * MoodTune AI — Login / Sign Up Page
 * Premium split-screen auth page with animated brand side and form side.
 */

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function FloatingParticle({ style }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-brand-500/30"
      style={style}
      animate={{ y: [-20, 20, -20], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: Math.random() * 3 + 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function AuthPage() {
  const [isLogin,     setIsLogin]    = useState(true);
  const [showPass,    setShowPass]   = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState('');
  const [form,        setForm]       = useState({ username: '', email: '', password: '' });

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-900">
      {/* ── Left Brand Panel ──────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0d14 0%, #1a1a2e 100%)' }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />

        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <FloatingParticle
            key={i}
            style={{
              top:  `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Brand content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center z-10 px-12"
        >
          {/* Logo */}
          <motion.div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, #3d5aff, #a855f7)' }}
            animate={{ boxShadow: ['0 0 30px rgba(61,90,255,0.4)', '0 0 60px rgba(61,90,255,0.7)', '0 0 30px rgba(61,90,255,0.4)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            🎵
          </motion.div>

          <h1 className="text-5xl font-bold font-display text-white mb-3">
            MoodTune <span style={{ background: 'linear-gradient(135deg, #3d5aff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </h1>
          <p className="text-dark-100 text-lg mb-8">
            Music that understands how you feel.
          </p>

          {/* Feature chips */}
          <div className="flex flex-col gap-3 text-left">
            {[
              { icon: '🎭', text: 'Real-time emotion detection' },
              { icon: '🎯', text: 'Personalized trigger words' },
              { icon: '🎶', text: 'Mood-matched song recommendations' },
              { icon: '⚡', text: 'Instant AI-powered playback' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10"
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-white/80 text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Auth Form ───────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: 'linear-gradient(135deg, #3d5aff, #a855f7)' }}>
              🎵
            </div>
            <h1 className="text-2xl font-bold font-display text-white">MoodTune AI</h1>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-dark-700 rounded-xl p-1 mb-8">
            {['Sign In', 'Sign Up'].map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsLogin(i === 0); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isLogin === (i === 0)
                    ? 'text-white shadow-card'
                    : 'text-dark-200 hover:text-white'
                }`}
                style={isLogin === (i === 0) ? {
                  background: 'linear-gradient(135deg, #3d5aff, #a855f7)',
                } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-white font-display mb-1">
                  {isLogin ? 'Welcome back!' : 'Create account'}
                </h2>
                <p className="text-dark-200 text-sm">
                  {isLogin ? 'Sign in to your MoodTune account.' : 'Join MoodTune AI — it\'s free.'}
                </p>
              </div>

              {/* Username (register only) */}
              {!isLogin && (
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-200" size={16} />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required={!isLogin}
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="input-field pl-11"
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-200" size={16} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-200" size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-200 hover:text-white transition-colors"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full btn-brand flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <FiArrowRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Demo credentials */}
              {isLogin && (
                <p className="text-center text-dark-300 text-xs">
                  Demo: <button type="button" onClick={() => setForm({ ...form, email: 'demo@moodtune.ai', password: 'demo1234' })}
                    className="text-brand-400 hover:underline">demo@moodtune.ai / demo1234</button>
                </p>
              )}
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
