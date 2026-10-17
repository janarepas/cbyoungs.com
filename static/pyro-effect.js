(() => {
  const layer = document.querySelector('.pyro-effect');
  const canvas = layer?.querySelector('canvas');
  const context = canvas?.getContext('2d');
  if (!context) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, particles = [], clouds = [], animation = 0, lastFrame = 0;
  let visible = true;
  const createParticle = (scattered = false) => ({
    x: Math.random() * width,
    y: scattered ? Math.random() * height * 0.8 : -8,
    speed: 16 + Math.random() * 30,
    drift: (Math.random() - 0.5) * 15,
    radius: 0.5 + Math.random() * 1.1,
    phase: Math.random() * Math.PI * 2,
    brightness: 0.25 + Math.random() * 0.5
  });
  // Soft overlapping lobes form drifting smoke, using the site's exact red.
  const createCloud = (scattered = false) => ({
    x: Math.random() * width,
    y: scattered ? Math.random() * height * 0.6 - 60 : -140,
    radius: 100 + Math.random() * 140,
    speed: 5 + Math.random() * 7,
    phase: Math.random() * Math.PI * 2,
    lobes: Array.from({ length: 5 }, () => ({ x: Math.random() - 0.5, y: Math.random() - 0.5, size: 0.4 + Math.random() * 0.5 }))
  });
  const resize = () => {
    const rect = layer.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    clouds = Array.from({ length: width < 760 ? 6 : 11 }, () => createCloud(true));
    particles = Array.from({ length: width < 760 ? 16 : 34 }, () => createParticle(true));
  };
  const draw = time => {
    if (!lastFrame) lastFrame = time;
    if (time - lastFrame < 32) { animation = requestAnimationFrame(draw); return; }
    const delta = Math.min((time - lastFrame) / 1000, 0.06);
    lastFrame = time;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 0;
    context.globalAlpha = 1;
    clouds.forEach((cloud, index) => {
      cloud.y += cloud.speed * delta;
      cloud.x += Math.sin(time / 7000 + cloud.phase) * 7 * delta;
      if (cloud.y - cloud.radius > height) { clouds[index] = createCloud(); return; }
      const opacity = Math.max(0, 1 - Math.max(0, cloud.y) / height);
      cloud.lobes.forEach(lobe => {
        const x = cloud.x + lobe.x * cloud.radius;
        const y = cloud.y + lobe.y * cloud.radius;
        const radius = cloud.radius * lobe.size;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(226,37,53,${0.15 * opacity})`);
        gradient.addColorStop(0.45, `rgba(226,37,53,${0.075 * opacity})`);
        gradient.addColorStop(1, 'rgba(226,37,53,0)');
        context.fillStyle = gradient;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      });
    });
    context.globalCompositeOperation = 'lighter';
    particles.forEach((particle, index) => {
      particle.y += particle.speed * delta;
      particle.x += (particle.drift + Math.sin(time / 1700 + particle.phase) * 10) * delta;
      if (particle.y > height || particle.x < -10 || particle.x > width + 10) {
        particles[index] = createParticle();
        return;
      }
      const fade = Math.pow(Math.max(0, 1 - particle.y / height), 1.4);
      context.globalAlpha = fade * particle.brightness;
      context.shadowBlur = 9;
      context.shadowColor = '#ff8a32';
      context.fillStyle = index % 6 === 0 ? '#ffc072' : '#ff8a32';
      context.beginPath();
      context.ellipse(particle.x, particle.y, particle.radius, particle.radius * 1.8, 0.35, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    animation = requestAnimationFrame(draw);
  };
  const update = () => {
    cancelAnimationFrame(animation);
    animation = 0;
    lastFrame = 0;
    const running = visible && !document.hidden && !reducedMotion.matches;
    layer.classList.toggle('is-paused', !running);
    if (running) animation = requestAnimationFrame(draw);
    else context.clearRect(0, 0, width, height);
  };
  new ResizeObserver(resize).observe(layer);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(layer);
  document.addEventListener('visibilitychange', update);
  reducedMotion.addEventListener('change', update);
  resize();
  update();
})();
