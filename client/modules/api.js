import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Activities
export const logActivity = (data) => api.post('/activities', data);
export const getActivities = (days = 7) => api.get('/activities', { params: { days } });

// Mood
export const logMood = (data) => api.post('/mood', data);
export const getMoodHistory = (limit = 14) => api.get('/mood', { params: { limit } });

// Stats
export const getStatsOverview = () => api.get('/stats/overview');

// Pomodoro
export const savePomodoroSession = (data) => api.post('/pomodoro/sessions', data);
export const getPomodoroStats = () => api.get('/pomodoro/stats');

// Quiz
export const submitQuiz = (answers) => api.post('/quiz', { answers });
export const getQuizHistory = () => api.get('/quiz/history');

// Analytics
export const getDayDetail = (dateStr) => api.get(`/analytics/day/${dateStr}`);

// Google Calendar
export const syncGoogleCalendar = (days = 30) => axios.post('/auth/google/sync', { days });
export const completeOnboarding = () => api.post('/onboard');

export default api;
