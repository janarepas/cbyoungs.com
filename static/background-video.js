(() => {
  const section = document.querySelector('#rolunk');
  const frame = section?.querySelector('.about-video iframe');
  const toggle = section?.querySelector('.video-toggle');
  if (!frame || !toggle) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let manuallyChosen = false;
  const setVideo = playing => {
    started = playing;
    if (playing) frame.src = frame.dataset.src;
    else frame.removeAttribute('src');
    toggle.textContent = playing ? 'HÁTTÉRVIDEÓ KIKAPCSOLÁSA' : 'HÁTTÉRVIDEÓ INDÍTÁSA';
    toggle.setAttribute('aria-pressed', String(playing));
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    manuallyChosen = true;
    setVideo(!started);
  });
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    if (!reducedMotion.matches && !manuallyChosen) setVideo(true);
    observer.disconnect();
  }, { threshold: 0.1 });
  observer.observe(section);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) setVideo(false);
  });
})();
