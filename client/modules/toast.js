// Notifikasi toast

export function showToast(message, type = 'success') {
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
