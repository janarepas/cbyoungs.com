(() => {
  const layer = document.querySelector('.pyro-effect');
  const canvas = layer?.querySelector('canvas');
  const context = canvas?.getContext('2d');
  if (!context) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, particles = [], clouds = [], animation = 0, lastFrame = 0;
  let visible = true;
  let smokeAge = 0;
  const createParticle = (scattered = false) => ({
    x: Math.random() * width,
    y: scattered ? Math.random() * height * 0.8 : -8,
    speed: 24 + Math.random() * 40,
    drift: (Math.random() - 0.5) * 15,
    radius: 0.6 + Math.random() * 1.35,
    phase: Math.random() * Math.PI * 2,
    brightness: 0.4 + Math.random() * 0.55
  });
  // Cache irregular translucent smoke textures instead of drawing flat circles.
  const smokeTextures = Array.from({ length: 4 }, () => {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 192;
    const ctx = sprite.getContext('2d');
    const image = ctx.createImageData(192, 192);
    const grids = [6, 12, 24, 48].map(size => ({ size, values: Float32Array.from({ length: (size + 1) ** 2 }, () => Math.random()) }));
    const smooth = value => value * value * (3 - 2 * value);
    for (let y = 0; y < 192; y++) for (let x = 0; x < 192; x++) {
      let noise = 0;
      grids.forEach(({ size, values }, octave) => {
        const gx = x / 192 * size, gy = y / 192 * size;
        const ix = Math.floor(gx), iy = Math.floor(gy);
        const fx = smooth(gx - ix), fy = smooth(gy - iy), stride = size + 1;
        const a = values[iy * stride + ix], b = values[iy * stride + ix + 1];
        const c = values[(iy + 1) * stride + ix], d = values[(iy + 1) * stride + ix + 1];
        noise += ((a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy) * [0.53, 0.27, 0.13, 0.07][octave];
      });
      const radius = Math.hypot((x - 96) / 96, (y - 96) / 96);
      const density = Math.pow(Math.max(0, 1 - radius), 1.1) * Math.max(0, noise - 0.24) * 1.8;
      const offset = (y * 192 + x) * 4;
      image.data[offset] = 226;
      image.data[offset + 1] = 37;
      image.data[offset + 2] = 53;
      image.data[offset + 3] = Math.min(255, density * 255);
    }
    ctx.putImageData(image, 0, 0);
    const shadow = document.createElement('canvas');
    shadow.width = shadow.height = 192;
    const shadowContext = shadow.getContext('2d');
    shadowContext.drawImage(sprite, 0, 0);
    shadowContext.globalCompositeOperation = 'source-in';
    shadowContext.fillStyle = '#000';
    shadowContext.fillRect(0, 0, 192, 192);
    return { red: sprite, shadow };
  });
  const createCloud = (scattered = false) => ({
    x: Math.random() * width,
    y: scattered ? Math.random() * height * 0.45 - 100 : -160,
    radius: 140 + Math.random() * 150,
    speed: 9 + Math.random() * 12,
    phase: Math.random() * Math.PI * 2,
    texture: Math.floor(Math.random() * smokeTextures.length),
    lobes: Array.from({ length: 5 }, () => ({ x: Math.random() - 0.5, y: Math.random() - 0.5, size: 0.45 + Math.random() * 0.55, phase: Math.random() * Math.PI * 2 }))
  });
  const resize = () => {
    const rect = layer.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    clouds = Array.from({ length: width < 760 ? 9 : 16 }, () => createCloud(true));
    particles = Array.from({ length: width < 760 ? 48 : 110 }, () => createParticle(true));
  };
  const draw = time => {
    if (!lastFrame) lastFrame = time;
    if (time - lastFrame < 32) { animation = requestAnimationFrame(draw); return; }
    const delta = Math.min((time - lastFrame) / 1000, 0.06);
    lastFrame = time;
    smokeAge += delta;
    const intro = Math.min(smokeAge / 10, 1);
    const smokeStrength = 0.75 + 0.25 * intro * intro * (3 - 2 * intro);
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
        const roll = Math.sin(time / 9000 + cloud.phase + lobe.phase);
        const x = cloud.x + lobe.x * cloud.radius + roll * 14;
        const y = cloud.y + lobe.y * cloud.radius + Math.cos(time / 11000 + lobe.phase) * 10;
        const radius = cloud.radius * lobe.size;
        const texture = smokeTextures[cloud.texture];
        context.save();
        context.translate(x, y);
        context.rotate(roll * 0.16);
        context.scale(1.15, 0.9);
        // Soft dark folds lend depth; the red remains the exact brand color.
        context.globalAlpha = 0.20 * opacity * smokeStrength;
        context.drawImage(texture.shadow, -radius + 20, -radius + 20, radius * 2, radius * 2);
        context.globalAlpha = 0.48 * opacity * smokeStrength * (0.9 + roll * 0.1);
        context.drawImage(texture.red, -radius, -radius, radius * 2, radius * 2);
        context.restore();
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
