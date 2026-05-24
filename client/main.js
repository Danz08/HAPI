import '../public/css/input.css';
import axios from 'axios';

import { showToast } from './modules/toast.js';
import { initTheme, toggleTheme } from './modules/theme.js';
import { initLang, toggleLang, t, getLang } from './modules/i18n.js';
import { initCharts, initActivityForm, initMoodModal, openMoodModal, closeMoodModal, initDashboardEvents } from './modules/dashboard.js';
import { checkPomoOverlay, startOverlayTicker, toggleOverlay, getPomoState, savePomoState, clearPomoState } from './modules/pomodoro-state.js';

import api, {
  logActivity, logMood, getActivities, getMoodHistory,
  savePomodoroSession, getPomodoroStats,
  submitQuiz, getQuizHistory,
  getDayDetail, syncGoogleCalendar,
  getStatsOverview, completeOnboarding,
} from './modules/api.js';

window.axios = axios;

window.hapiApi = {
  logActivity, logMood, getActivities, getMoodHistory,
  savePomodoroSession, getPomodoroStats,
  submitQuiz, getQuizHistory,
  getDayDetail, syncGoogleCalendar,
  getStatsOverview, completeOnboarding,
};

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

function startClock() {
  const dtEl = document.getElementById('live-datetime');
  if (!dtEl) return;
  const update = () => {
    const now = new Date();
    const lang = window.getLang() === 'en' ? 'en-US' : 'id-ID';
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    dtEl.textContent = now.toLocaleString(lang, opts);
  };
  update();
  setInterval(update, 1000);
  window.addEventListener('langChanged', update);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLang();
  initCharts();
  initActivityForm();
  initMoodModal();
  checkPomoOverlay();
  startOverlayTicker();
  startClock();
  initDashboardEvents();
});
