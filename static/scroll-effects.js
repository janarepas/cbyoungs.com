(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const elements = [...document.querySelectorAll(
    '.section-label,.about-grid,.values>div,.moments-heading,.gallery figure,.join-grid>h2,.join-grid>div,footer>a,footer>span'
  )];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    elements.forEach(element => {
      // Keep content already on screen visible on load or history restoration.
      if (element.getBoundingClientRect().top < innerHeight - 20) return;
      element.classList.add('scroll-reveal');
      observer.observe(element);
    });
    document.addEventListener('focusin', event => {
      const element = event.target.closest('.scroll-reveal');
      if (element) { element.classList.add('is-visible'); observer.unobserve(element); }
    });
    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      elements.forEach(element => element.classList.add('is-visible'));
      observer.disconnect();
    });
  }

  // Ease mouse-wheel motion; touch, trackpads, keyboard and links stay native.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let target = window.scrollY;
  let animation = 0;
  let lastTime = 0;
  const clamp = value => Math.max(0, Math.min(value, document.documentElement.scrollHeight - innerHeight));
  const stop = () => {
    cancelAnimationFrame(animation);
    animation = 0;
    lastTime = 0;
    target = window.scrollY;
  };
  const tick = time => {
    const elapsed = Math.min(64, lastTime ? time - lastTime : 16.67);
    lastTime = time;
    target = clamp(target);
    const next = window.scrollY + (target - window.scrollY) * (1 - Math.exp(-elapsed / 95));
    if (Math.abs(target - next) < 0.6 || Math.abs(next - window.scrollY) < 0.5) {
      window.scrollTo({ top: target, behavior: 'instant' });
      stop();
      return;
    }
    window.scrollTo({ top: next, behavior: 'instant' });
    animation = requestAnimationFrame(tick);
  };
  const nestedScroller = (element, delta) => {
    for (let node = element; node && node !== document.body; node = node.parentElement) {
      if (node.matches('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return true;
      const style = getComputedStyle(node);
      if (/auto|scroll/.test(style.overflowY) && node.scrollHeight > node.clientHeight &&
          (delta > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight : node.scrollTop > 0)) return true;
    }
    return false;
  };
  window.addEventListener('wheel', event => {
    if (reducedMotion.matches || !finePointer.matches || event.ctrlKey || event.metaKey || event.shiftKey ||
        !event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    // High-resolution pixel deltas generally come from a trackpad with its own inertia.
    if (event.deltaMode === 0 && Math.abs(event.deltaY) < 40) { stop(); return; }
    if (nestedScroller(event.target, event.deltaY)) { stop(); return; }
    const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    const nextTarget = clamp((animation ? target : window.scrollY) + event.deltaY * multiplier);
    if (!animation && nextTarget === window.scrollY) return;
    event.preventDefault();
    target = nextTarget;
    if (!animation) animation = requestAnimationFrame(tick);
  }, { passive: false });
  window.addEventListener('pointerdown', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Tab'].includes(event.key)) stop();
  });
  document.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) stop();
  });
  window.addEventListener('pageshow', stop);
  window.addEventListener('blur', stop);
  reducedMotion.addEventListener('change', stop);
})();
