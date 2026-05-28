// Notifikasi SweetAlert (menggantikan toast)

export function showToast(message, type = 'success') {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  
  if (typeof Swal !== 'undefined') {
    return Swal.fire({
      title: type === 'success' ? 'Berhasil!' : (type === 'error' ? 'Oops!' : 'Perhatian'),
      text: message,
      icon: type,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#A86240',
      background: isDark ? '#1e1611' : '#ffffff',
      color: isDark ? '#f8f4f0' : '#3a1e13',
      backdrop: 'rgba(0,0,0,0.6)',
      position: 'center',
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        container: 'z-[99999]'
      }
    });
  } else {
    // Fallback if Swal is not loaded
    alert(message);
    return Promise.resolve();
  }
}
