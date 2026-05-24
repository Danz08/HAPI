/**
 * Dashboard JavaScript
 * Handles charts, mood modal, activity form, and real-time interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  initActivityForm();
  initMoodModal();
});

// ===== Charts =====
function initCharts() {
  const activityEl = document.getElementById('activityChart');
  const moodEl = document.getElementById('moodChart');

  if (!activityEl || typeof Chart === 'undefined') return;

  // Chart.js global defaults
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'Inter';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
}

// ===== Activity Form =====
function initActivityForm() {
  const form = document.getElementById('activity-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      activity_type: form.activity_type.value,
      description: form.description.value,
      duration_minutes: parseInt(form.duration_minutes.value) || 0,
      break_minutes: parseInt(form.break_minutes.value) || 0,
    };

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        form.reset();
        showToast('Aktivitas berhasil disimpan! ✅', 'success');
        setTimeout(() => location.reload(), 1200);
      }
    } catch (err) {
      showToast('Gagal menyimpan aktivitas.', 'error');
    }
  });
}

// ===== Mood Modal =====
let selectedMood = null;

function openMoodModal() {
  const modal = document.getElementById('mood-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeMoodModal() {
  const modal = document.getElementById('mood-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function initMoodModal() {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => {
        b.classList.remove('bg-brand-600/20', 'border-brand-500');
      });
      btn.classList.add('bg-brand-600/20', 'border-brand-500');
      selectedMood = {
        score: parseInt(btn.dataset.score),
        label: btn.dataset.label,
      };
    });
  });

  const moodForm = document.getElementById('mood-form');
  if (!moodForm) return;

  moodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      showToast('Pilih mood terlebih dahulu.', 'warning');
      return;
    }

    const data = {
      mood_score: selectedMood.score,
      mood_label: selectedMood.label,
      energy_level: parseInt(document.getElementById('energy-slider')?.value || 3),
      stress_level: parseInt(document.getElementById('stress-slider')?.value || 3),
      notes: document.getElementById('mood-notes')?.value || '',
    };

    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        closeMoodModal();
        showToast('Mood berhasil disimpan! 😊', 'success');
        setTimeout(() => location.reload(), 1200);
      }
    } catch (err) {
      showToast('Gagal menyimpan mood.', 'error');
    }
  });
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
  let container = document.getElementById('flash-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'flash-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-md';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `flash-${type} animate-slide-down flex items-center gap-3`;
  toast.innerHTML = `<span class="text-sm">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Make functions globally accessible
window.openMoodModal = openMoodModal;
window.closeMoodModal = closeMoodModal;
window.showToast = showToast;
