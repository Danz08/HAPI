
import { showToast } from './toast.js';
import { logActivity, logMood } from './api.js';

export function initCharts() {
  const activityEl = document.getElementById('activityChart');
  if (!activityEl || typeof Chart === 'undefined') return;

  const data = window.__chartData;
  if (!data) return;

  Chart.defaults.color = '#B8A89E';
  Chart.defaults.font.family = 'Manrope';

  // Build labels based on selected days
  const days = data.selectedDays || 7;
  const labels = [];
  const workData = [];
  const moodData = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    labels.push(days <= 7 ? dayNames[d.getDay()] : `${d.getDate()}/${d.getMonth()+1}`);

    const activity = data.recentActivities.find(a => a.date === dateStr);
    workData.push(activity ? Math.round(activity.total_work / 60 * 10) / 10 : 0);

    const mood = data.moodTrend.find(m => m.log_date === dateStr);
    moodData.push(mood ? mood.mood_score : null);
  }

  new Chart(activityEl, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Jam Kerja',
          data: workData,
          borderColor: '#A86240',
          backgroundColor: 'rgba(168,98,64,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#A86240',
        },
        {
          label: 'Mood',
          data: moodData,
          borderColor: '#489A98',
          backgroundColor: 'rgba(72,154,152,0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#489A98',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { usePointStyle: true, pointStyle: 'circle', padding: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Jam', color: '#8a7168' },
          grid: { color: 'rgba(62,45,34,0.1)' },
        },
        y1: {
          position: 'right',
          min: 0, max: 5,
          title: { display: true, text: 'Mood', color: '#8a7168' },
          grid: { drawOnChartArea: false },
        },
        x: {
          grid: { color: 'rgba(62,45,34,0.08)' },
        }
      }
    }
  });
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
        showToast('Aktivitas berhasil disimpan! ✅', 'success').then(() => {
          location.reload();
        });
      }
    } catch (err) {
      showToast('Gagal menyimpan aktivitas.', 'error');
    }
  });
}

let selectedMood = null;

export function openMoodModal() {
  const modal = document.getElementById('global-mood-overlay') || document.getElementById('mood-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

export function closeMoodModal() {
  const modal = document.getElementById('global-mood-overlay') || document.getElementById('mood-modal');
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
        if (res.data.streakUpdated) {
          const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
          Swal.fire({
            title: 'Streak Aktif! 🔥',
            text: `Hebat! Kamu memiliki streak ${res.data.streak} hari berturut-turut.`,
            icon: 'success',
            confirmButtonColor: '#A86240',
            background: isDark ? 'rgba(30,22,17,0.95)' : 'rgba(255,255,255,0.95)',
            color: isDark ? '#f8f4f0' : '#3a1e13',
            backdrop: 'rgba(0,0,0,0.4)',
          }).then(() => {
            location.reload();
          });
        } else {
          showToast('Mood berhasil disimpan! 😊', 'success').then(() => {
            location.reload();
          });
        }
      }
    } catch (err) {
      showToast('Gagal menyimpan mood.', 'error');
    }
  });
}

export function initDashboardEvents() {
  const rangeSelect = document.getElementById('dashboard-range');
  if (rangeSelect) {
    rangeSelect.addEventListener('change', (e) => {
      window.location.href = `/dashboard?days=${e.target.value}`;
    });
  }
}
