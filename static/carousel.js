(() => {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.gallery');
  const slides = [...track.querySelectorAll('figure')];
  const controls = carousel.querySelector('.carousel-controls');
  const previous = controls.querySelector('.carousel-prev');
  const next = controls.querySelector('.carousel-next');
  const status = controls.querySelector('.carousel-status');
  const dots = controls.querySelector('.carousel-dots');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  const slideOffset = index => slides[index].offsetLeft - slides[0].offsetLeft;
  const go = index => track.scrollTo({
    left: slideOffset(Math.max(0, Math.min(slides.length - 1, index))),
    behavior: reducedMotion.matches ? 'instant' : 'smooth'
  });
  const buttons = slides.map((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'dia');
    slide.setAttribute('aria-label', `${index + 1} / ${slides.length}`);
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${index + 1}. kép megjelenítése`);
    button.setAttribute('aria-controls', track.id);
    button.addEventListener('click', () => go(index));
    dots.append(button);
    return button;
  });
  const update = () => {
    current = slides.reduce((closest, _, index) =>
      Math.abs(slideOffset(index) - track.scrollLeft) < Math.abs(slideOffset(closest) - track.scrollLeft) ? index : closest, 0);
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    status.textContent = `${current + 1} / ${slides.length}`;
    buttons.forEach((button, index) => {
      if (index === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  };
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let scheduled = false;
  track.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { update(); scheduled = false; });
  }, { passive: true });
  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { track.scrollTo({ left: slideOffset(current), behavior: 'instant' }); update(); }, 100);
  }).observe(track);
  controls.hidden = false;
  update();
})();
