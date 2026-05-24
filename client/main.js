/**
 * HAPI Client Entry Point
 * Bundled by Vite — imports all client modules
 */

// Import styles (Tailwind CSS processed by Vite + PostCSS)
import '../public/css/input.css';

// Import axios for global access (inline EJS scripts)
import axios from 'axios';

// Import modules
import { showToast } from './modules/toast.js';
import { initTheme, toggleTheme } from './modules/theme.js';
import { initLang, toggleLang, t, getLang } from './modules/i18n.js';
import { initCharts, initActivityForm, initMoodModal, openMoodModal, closeMoodModal } from './modules/dashboard.js';
import { checkPomoOverlay, startOverlayTicker, toggleOverlay, getPomoState, savePomoState, clearPomoState } from './modules/pomodoro-state.js';

// Import API client (axios-based)
import api, {
  logActivity, logMood, getActivities, getMoodHistory,
  savePomodoroSession, getPomodoroStats,
  submitQuiz, getQuizHistory,
  sendChatMessage, clearChat,
  getDayDetail, syncGoogleCalendar,
  getStatsOverview,
} from './modules/api.js';

// Expose axios globally for inline EJS scripts
window.axios = axios;

// Expose API helper functions globally
window.hapiApi = {
  logActivity, logMood, getActivities, getMoodHistory,
  savePomodoroSession, getPomodoroStats,
  submitQuiz, getQuizHistory,
  sendChatMessage, clearChat,
  getDayDetail, syncGoogleCalendar,
  getStatsOverview,
};

// Expose globals for EJS inline scripts
window.showToast = showToast;
window.toggleTheme = toggleTheme;
window.toggleLang = toggleLang;
window.t = t;
window.getLang = getLang;
window.openMoodModal = openMoodModal;
window.closeMoodModal = closeMoodModal;
window.togglePomoOverlay = toggleOverlay;
window.getPomoState = getPomoState;
window.savePomoState = savePomoState;
window.clearPomoState = clearPomoState;
window.pomoState = getPomoState();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Theme & Language
  initTheme();
  initLang();

  // Dashboard components
  initCharts();
  initActivityForm();
  initMoodModal();

  // Persistent Pomodoro overlay
  checkPomoOverlay();
  startOverlayTicker();

  console.log('[HAPI] Client bundle loaded ✅');
});
