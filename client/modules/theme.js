// Dark/light theme toggle, disimpan di localStorage

export function initTheme() {
  const saved = localStorage.getItem('hapi-theme') || 'dark';
  applyTheme(saved);
  updateThemeIcon(saved);
}

export function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('hapi-theme', next);
  updateThemeIcon(next);
}

function applyTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  html.classList.toggle('dark', theme === 'dark');
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    if (window.lucide) window.lucide.createIcons();
  }
}
