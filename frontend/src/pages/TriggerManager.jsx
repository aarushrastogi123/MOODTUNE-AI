/**
 * MoodTune AI — Trigger Manager Page
 * Create, edit, delete, and search with personalized trigger words.
 * Features: fuzzy search, "Did you mean?" popup, conflict handling.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiZap, FiPlus, FiSearch, FiTrash2, FiEdit3, FiCheck, FiX, FiPlay
} from 'react-icons/fi';
import { triggersAPI, songsAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';

// "Did you mean?" disambiguation popup
function FuzzyMatchPopup({ matches, onSelect, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Did you mean...?</h3>
            <button onClick={onClose} className="text-dark-200 hover:text-white">
              <FiX size={20} />
            </button>
          </div>
          <p className="text-dark-200 text-sm mb-4">Multiple songs matched your trigger. Choose one:</p>
          <div className="space-y-2">
            {matches.map((song) => (
              <button
                key={song.id}
                onClick={() => onSelect(song)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-700 hover:bg-dark-600 
                           border border-dark-400 hover:border-brand-500/40 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center text-lg flex-shrink-0">
                  {song.cover_image ? (
                    <img src={song.cover_image} alt={song.title} className="w-full h-full rounded-lg object-cover" />
                  ) : '🎵'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{song.title}</p>
                  <p className="text-dark-200 text-xs">{song.artist}</p>
                </div>
                <FiPlay className="ml-auto text-brand-400" size={16} />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Single trigger row with inline edit
function TriggerRow({ trigger, onDelete, onUpdate }) {
  const [editing,   setEditing]   = useState(false);
  const [editWord,  setEditWord]  = useState(trigger.trigger_word);
  const [loading,   setLoading]   = useState(false);

  const handleSave = async () => {
    if (!editWord.trim() || editWord === trigger.trigger_word) {
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onUpdate(trigger.id, editWord.trim());
    } finally {
      setEditing(false);
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-dark-700 border border-dark-400/50
                 hover:border-dark-300 transition-all group"
    >
      {/* Trigger word */}
      <FiZap className="text-brand-400 flex-shrink-0" size={16} />
      {editing ? (
        <input
          value={editWord}
          onChange={(e) => setEditWord(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
          className="input-field py-1.5 text-sm flex-1"
          autoFocus
        />
      ) : (
        <code className="text-brand-300 font-mono text-sm flex-1">{trigger.trigger_word}</code>
      )}

      {/* Arrow */}
      <span className="text-dark-300 text-xs hidden sm:block">→</span>

      {/* Song info */}
      <div className="hidden sm:block flex-1 min-w-0">
        <p className="text-white text-sm truncate">{trigger.song?.title}</p>
        <p className="text-dark-300 text-xs">{trigger.song?.artist}</p>
      </div>

      {/* Priority badge */}
      <span className="text-xs bg-dark-600 text-dark-200 px-2 py-0.5 rounded-full hidden md:block">
        P{trigger.priority}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {editing ? (
          <>
            <button onClick={handleSave} disabled={loading}
              className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30">
              <FiCheck size={14} />
            </button>
            <button onClick={() => setEditing(false)}
              className="p-1.5 rounded-lg bg-dark-600 text-dark-200 hover:text-white">
              <FiX size={14} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg bg-dark-600 text-dark-200 hover:text-white transition-colors">
              <FiEdit3 size={14} />
            </button>
            <button onClick={() => onDelete(trigger.id)}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
              <FiTrash2 size={14} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function TriggerManager() {
  const { playSong } = usePlayer();

  const [triggers,     setTriggers]     = useState([]);
  const [songs,        setSongs]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [newWord,      setNewWord]      = useState('');
  const [newSongId,    setNewSongId]    = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [suggestions,  setSuggestions]  = useState([]);
  const [fuzzyMatches, setFuzzyMatches] = useState([]);
  const [playMsg,      setPlayMsg]      = useState('');
  const [addError,     setAddError]     = useState('');
  const [adding,       setAdding]       = useState(false);

  const searchDebounce = useRef(null);

  // Load data
  useEffect(() => {
    Promise.all([triggersAPI.list(), songsAPI.getAll({ limit: 200 })])
      .then(([tRes, sRes]) => {
        setTriggers(tRes.data);
        setSongs(sRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-suggest as user types search query
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    clearTimeout(searchDebounce.current);
    if (val.length < 1) { setSuggestions([]); return; }
    searchDebounce.current = setTimeout(async () => {
      try {
        const { data } = await triggersAPI.suggest(val);
        setSuggestions(data);
      } catch { setSuggestions([]); }
    }, 200);
  };

  // Play by trigger with fuzzy matching
  const handlePlay = async () => {
    if (!searchQuery.trim()) return;
    setPlayMsg('');
    try {
      const { data } = await triggersAPI.play(searchQuery);
      if (data.exact_match) {
        playSong(data.exact_match);
        setPlayMsg(`▶ Playing: ${data.exact_match.title}`);
        setSearchQuery('');
        setSuggestions([]);
      } else if (data.fuzzy_matches.length > 1) {
        setFuzzyMatches(data.fuzzy_matches);
      } else if (data.fuzzy_matches.length === 1) {
        playSong(data.fuzzy_matches[0]);
        setPlayMsg(`▶ Playing: ${data.fuzzy_matches[0].title}`);
        setSearchQuery('');
        setSuggestions([]);
      } else {
        setPlayMsg(data.message);
      }
    } catch {
      setPlayMsg('No match found for that trigger.');
    }
  };

  // Add new trigger
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWord.trim() || !newSongId) return;
    setAdding(true);
    setAddError('');
    try {
      const { data } = await triggersAPI.add({
        trigger_word: newWord.trim(),
        song_id: parseInt(newSongId),
        priority: 1,
      });
      setTriggers((prev) => [data, ...prev]);
      setNewWord('');
      setNewSongId('');
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to add trigger.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    await triggersAPI.delete(id);
    setTriggers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdate = async (id, newWord) => {
    const { data } = await triggersAPI.update(id, { trigger_word: newWord });
    setTriggers((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white font-display flex items-center gap-3">
          <FiZap className="text-brand-400" /> Trigger Engine
        </h1>
        <p className="text-dark-200 text-sm mt-1">
          Type a word → instantly play your linked song. Your personal command system.
        </p>
      </div>

      {/* ── Trigger Search Bar ─────────────────────────────────────────── */}
      <div className="glass-card p-5 space-y-4">
        <p className="text-white font-semibold text-sm">🎯 Play by Trigger</p>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-200" size={16} />
              <input
                id="trigger-search"
                type="text"
                placeholder="Type a trigger word... (e.g. 'gym', 'nightdrive', 'bl')"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
                className="input-field pl-11"
              />
              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-400 
                                rounded-xl shadow-card z-20 overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSearchQuery(s); setSuggestions([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-dark-600 
                                 transition-colors flex items-center gap-2"
                    >
                      <FiZap className="text-brand-400" size={12} /> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className="btn-brand flex items-center gap-2 whitespace-nowrap"
            >
              <FiPlay size={16} /> Play
            </motion.button>
          </div>
          {playMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-brand-400 text-sm mt-2"
            >
              {playMsg}
            </motion.p>
          )}
        </div>
      </div>

      {/* ── Add New Trigger ────────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <p className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <FiPlus className="text-brand-400" /> Add New Trigger
        </p>
        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Trigger word (e.g. 'gym')"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="input-field flex-1 min-w-40"
          />
          <select
            value={newSongId}
            onChange={(e) => setNewSongId(e.target.value)}
            className="input-field flex-1 min-w-48"
          >
            <option value="">Select song...</option>
            {songs.map((s) => (
              <option key={s.id} value={s.id}>{s.title} — {s.artist}</option>
            ))}
          </select>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={adding || !newWord.trim() || !newSongId}
            className="btn-brand disabled:opacity-50 flex items-center gap-2"
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <FiPlus size={16} />}
            Add
          </motion.button>
        </form>
        {addError && (
          <p className="text-red-400 text-xs mt-2">{addError}</p>
        )}
      </div>

      {/* ── Trigger List ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">{triggers.length} Triggers</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl skeleton" />
            ))}
          </div>
        ) : triggers.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <FiZap className="mx-auto mb-3 text-dark-400" size={40} />
            <p className="text-dark-200">No triggers yet. Add your first trigger above!</p>
          </div>
        ) : (
          <AnimatePresence>
            {triggers.map((trigger) => (
              <TriggerRow
                key={trigger.id}
                trigger={trigger}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Fuzzy match disambiguation popup */}
      {fuzzyMatches.length > 0 && (
        <FuzzyMatchPopup
          matches={fuzzyMatches}
          onSelect={(song) => {
            playSong(song);
            setPlayMsg(`▶ Playing: ${song.title}`);
            setFuzzyMatches([]);
            setSearchQuery('');
          }}
          onClose={() => setFuzzyMatches([])}
        />
      )}
    </div>
  );
}
