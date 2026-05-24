/**
 * Theme Module
 * Dark/Light mode toggle with localStorage persistence
 */

export function initTheme() {
  const saved = localStorage.getItem('hapi-theme') || 'dark';
  applyTheme(saved);

  // Update icon on load
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
    // Re-render lucide icons
    if (window.lucide) window.lucide.createIcons();
  }
}
