(() => {
  const VERSION = 'car-clean-1';
  const VIDEO_PATH = './assets/white-toyota-drifting.3840x2160.mp4?v=' + VERSION;

  function forceCarMode() {
    document.body.classList.remove('edge-video-static-fallback', 'video-static-fallback', 'static-fallback');
    document.body.dataset.bg = 'car';
    try { localStorage.setItem('mtBg', 'car'); } catch {}
  }

  function setupVideo() {
    const video = document.querySelector('video.car');
    if (!video) return;

    forceCarMode();

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.removeAttribute('crossorigin');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    video.style.display = 'block';
    video.style.visibility = 'visible';
    video.style.opacity = '1';

    if (!video.src || !video.src.includes('white-toyota-drifting.3840x2160.mp4') || video.src.includes('cdn.larixdev.com')) {
      video.innerHTML = '';
      const source = document.createElement('source');
      source.src = VIDEO_PATH;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.src = VIDEO_PATH;
      video.load();
    }

    const play = () => {
      forceCarMode();
      video.muted = true;
      video.play().catch(() => {});
    };

    play();
    setTimeout(play, 250);
    setTimeout(play, 1000);
    document.addEventListener('pointerdown', play, { passive: true });
    document.addEventListener('touchstart', play, { passive: true });
    document.addEventListener('click', play, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
  }

  const style = document.createElement('style');
  style.textContent = `
    video.car,.car{display:block!important;visibility:visible!important;opacity:1!important;}
    body[data-bg="car"] video.car,body[data-bg="car"] .car{display:block!important;visibility:visible!important;opacity:1!important;}
  `;
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupVideo);
  } else {
    setupVideo();
  }
  setTimeout(setupVideo, 500);
  setTimeout(setupVideo, 1500);
})();
