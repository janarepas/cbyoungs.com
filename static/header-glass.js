(() => {
  const header = document.querySelector('.header');
  if (!header) return;
  let scheduled = false;
  const update = () => {
    const progress = Math.min(1, Math.max(0, window.scrollY / 140));
    header.style.setProperty('--glass-progress', progress.toFixed(3));
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('pageshow', update);
  update();
})();
