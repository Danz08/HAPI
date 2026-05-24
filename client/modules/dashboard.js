/**
 * Dashboard Module
 * Chart initialization, activity form, and mood modal handlers
 */

import { showToast } from './toast.js';
import { logActivity, logMood } from './api.js';

export function initCharts() {
  const activityEl = document.getElementById('activityChart');
  if (!activityEl || typeof Chart === 'undefined') return;

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'Inter';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
}

export function initActivityForm() {
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
      const res = await logActivity(data);
      if (res.data.success) {
        form.reset();
        showToast('Aktivitas berhasil disimpan! ✅', 'success');
        setTimeout(() => location.reload(), 1200);
      }
    } catch (err) {
      showToast('Gagal menyimpan aktivitas.', 'error');
    }
  });
}

let selectedMood = null;

export function openMoodModal() {
  const modal = document.getElementById('mood-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

export function closeMoodModal() {
  const modal = document.getElementById('mood-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function initMoodModal() {
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
      const res = await logMood(data);
      if (res.data.success) {
        closeMoodModal();
        showToast('Mood berhasil disimpan! 😊', 'success');
        setTimeout(() => location.reload(), 1200);
      }
    } catch (err) {
      showToast('Gagal menyimpan mood.', 'error');
    }
  });
}
