(() => {
  const section = document.querySelector('#rolunk');
  const frame = section?.querySelector('.about-video iframe');
  if (!frame) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const startSeconds = 30;
  const trimEndSeconds = 15;
  let started = false;
  let player;
  let ready = false;
  let initializing = false;
  let loopTimer;
  let lastSeek = -Infinity;
  const clipStart = duration => Math.min(startSeconds, Math.max(0, duration - trimEndSeconds - 1));
  const restartClip = () => {
    const duration = player.getDuration();
    if (!duration) return;
    lastSeek = performance.now();
    player.seekTo(clipStart(duration), true);
    if (started) player.playVideo();
  };
  const checkEnd = () => {
    if (!ready || !started) return;
    const duration = player.getDuration();
    if (duration > trimEndSeconds && player.getCurrentTime() >= duration - trimEndSeconds && performance.now() - lastSeek > 1000) restartClip();
  };
  const applyPlayback = () => {
    clearInterval(loopTimer);
    if (!ready) return;
    if (started) {
      player.mute();
      checkEnd();
      player.playVideo();
      loopTimer = setInterval(checkEnd, 200);
    } else player.pauseVideo();
  };
  const loadApi = () => new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve();
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') previousCallback();
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = reject;
    document.head.append(script);
  });
  const initialize = async () => {
    initializing = true;
    try {
      await loadApi();
      if (!started) { initializing = false; return; }
      const src = new URL(frame.dataset.src);
      src.searchParams.set('origin', location.origin);
      frame.src = src.href;
      player = new YT.Player(frame, { events: {
        onReady: () => { ready = true; restartClip(); applyPlayback(); },
        onStateChange: event => {
          if (started && event.data === YT.PlayerState.ENDED) restartClip();
          if (started && event.data === YT.PlayerState.PLAYING) checkEnd();
        }
      } });
    } catch {
      initializing = false;
      started = false;
      frame.removeAttribute('src');

    }
  };
  const setVideo = playing => {
    started = playing;

    if (started && !initializing) initialize();
    applyPlayback();
  };
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    if (!reducedMotion.matches) setVideo(true);
    observer.disconnect();
  }, { threshold: 0.1 });
  observer.observe(section);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) setVideo(false);
  });
})();
