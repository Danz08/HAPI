
const STORAGE_KEY = 'hapi-pomo';

export function getPomoState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
}

export function savePomoState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.pomoState = state;
}

export function clearPomoState() {
  localStorage.removeItem(STORAGE_KEY);
  window.pomoState = null;
}

export function checkPomoOverlay() {
  const state = getPomoState();
  if (!state || !state.running) return;

  const now = Date.now();
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  const remaining = state.totalSeconds - elapsed;

  if (remaining <= 0) {
    clearPomoState();
    toggleOverlay(false);
    return;
  }

  // Show overlay if not on pomodoro page
  if (!window.location.pathname.includes('/pomodoro')) {
    toggleOverlay(true);
    updateOverlayDisplay(remaining, state.label);
  }
}

export function toggleOverlay(show) {
  const overlay = document.getElementById('pomo-overlay');
  if (overlay) overlay.classList.toggle('hidden', !show);
}

export function updateOverlayDisplay(seconds, label) {
  const el = document.getElementById('pomo-overlay-time');
  const labelEl = document.getElementById('pomo-overlay-label');
  if (el) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
  if (labelEl && label) labelEl.textContent = label;
}

export function startOverlayTicker() {
  setInterval(() => {
    const state = getPomoState();
    if (state && state.running && !window.location.pathname.includes('/pomodoro')) {
      const now = Date.now();
      const elapsed = Math.floor((now - state.startedAt) / 1000);
      const remaining = state.totalSeconds - elapsed;
      if (remaining <= 0) {
        clearPomoState();
        toggleOverlay(false);
      } else {
        updateOverlayDisplay(remaining, state.label);
      }
    }
  }, 1000);
}
