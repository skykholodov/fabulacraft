// Minimal client-side script for FABULA CRAFT site
(() => {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
