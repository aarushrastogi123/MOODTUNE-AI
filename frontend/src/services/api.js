/**
 * MoodTune AI — Axios API Client
 * Centralized HTTP client with JWT auth interceptor and error handling.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('moodtune_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor: Handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on token expiry
      localStorage.removeItem('moodtune_token');
      localStorage.removeItem('moodtune_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login', data),
  getMe:    ()       => api.get('/auth/me'),
};

// ── Songs API ────────────────────────────────────────────────────────────────
export const songsAPI = {
  getAll:    (params) => api.get('/songs', { params }),
  getById:   (id)     => api.get(`/songs/${id}`),
  getByMood: (mood)   => api.get(`/songs/mood/${mood}`),
  streamUrl: (id)     => `${API_BASE}/songs/stream/${id}`,
};

// ── Emotion API ──────────────────────────────────────────────────────────────
export const emotionAPI = {
  detect: (imageBase64) => api.post('/detect-emotion', { image_base64: imageBase64 }),
};

// ── Triggers API ─────────────────────────────────────────────────────────────
export const triggersAPI = {
  add:     (data)  => api.post('/trigger/add', data),
  play:    (query, threshold = 70) =>
                       api.post('/trigger/play', { query, fuzzy_threshold: threshold }),
  update:  (id, data) => api.put(`/trigger/update/${id}`, data),
  delete:  (id)    => api.delete(`/trigger/delete/${id}`),
  list:    ()      => api.get('/trigger/list'),
  suggest: (q)     => api.get('/trigger/suggest', { params: { q } }),
};

// ── Favorites API ────────────────────────────────────────────────────────────
export const favoritesAPI = {
  getAll:  ()       => api.get('/favorites'),
  add:     (songId) => api.post('/favorites/add', { song_id: songId }),
  remove:  (songId) => api.delete(`/favorites/remove/${songId}`),
};

// ── History API ──────────────────────────────────────────────────────────────
export const historyAPI = {
  getAll: (limit = 50) => api.get('/history', { params: { limit } }),
  add:    (songId, playedBy, mood) =>
    api.post('/history/add', null, {
      params: { song_id: songId, played_by: playedBy, detected_mood: mood },
    }),
};

export default api;
