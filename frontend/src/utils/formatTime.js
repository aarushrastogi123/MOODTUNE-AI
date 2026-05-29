/**
 * MoodTune AI — Time formatter utility
 * Converts seconds to MM:SS format for audio duration display.
 */

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
