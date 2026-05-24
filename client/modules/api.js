/**
 * API Client Module
 * Axios-based HTTP client for all API interactions
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ===== Activities =====
export const logActivity = (data) => api.post('/activities', data);
export const getActivities = (days = 7) => api.get('/activities', { params: { days } });

// ===== Mood =====
export const logMood = (data) => api.post('/mood', data);
export const getMoodHistory = (limit = 14) => api.get('/mood', { params: { limit } });

// ===== Stats =====
export const getStatsOverview = () => api.get('/stats/overview');

// ===== Pomodoro =====
export const savePomodoroSession = (data) => api.post('/pomodoro/sessions', data);
export const getPomodoroStats = () => api.get('/pomodoro/stats');

// ===== Quiz =====
export const submitQuiz = (answers) => api.post('/quiz', { answers });
export const getQuizHistory = () => api.get('/quiz/history');

// ===== Chat =====
export const sendChatMessage = (message) => api.post('/chat', { message });
export const clearChat = () => api.delete('/chat');

// ===== Analytics =====
export const getDayDetail = (dateStr) => api.get(`/analytics/day/${dateStr}`);

// ===== Google Calendar =====
// Google sync stays under /auth/ since it's tied to OAuth flow
export const syncGoogleCalendar = (days = 30) => axios.post('/auth/google/sync', { days });

// Export the axios instance for custom usage
export default api;
