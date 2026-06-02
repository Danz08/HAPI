export function toggleLang() {
  let currentLang = window.HAPI_LANG === 'id' ? 'en' : 'id';
  localStorage.setItem('hapi-lang', currentLang);
  // Set cookie for i18next-http-middleware to detect on reload
  document.cookie = `i18next=${currentLang}; path=/; max-age=31536000`;
  
  const langBtn = document.getElementById('lang-label');
  if (langBtn) langBtn.textContent = currentLang.toUpperCase();
  
  // Force reload to get the new EJS server-side translations
  window.location.reload();
}

export function initLang() {
  const langBtn = document.getElementById('lang-label');
  if (langBtn) langBtn.textContent = (window.HAPI_LANG || 'id').toUpperCase();
}

export function t(key) {
  const keys = key.split('.');
  let obj = window.HAPI_TRANSLATIONS || {};
  for (const k of keys) {
    if (obj) obj = obj[k];
    else break;
  }
  return obj || key;
}

export function getLang() {
  return window.HAPI_LANG || 'id';
}