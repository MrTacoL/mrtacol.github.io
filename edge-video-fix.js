(() => {
  const LOCAL_VIDEO = './assets/white-toyota-drifting.3840x2160.mp4?v=local-restore-1';
  const CDN_VIDEO = 'https://cdn.larixdev.com/white-toyota-drifting.3840x2160.mp4?v=local-restore-1';

  function forceCarMode() {
    document.body.classList.remove('edge-video-static-fallback');
    document.body.dataset.bg = 'car';
    try { localStorage.setItem('mtBg', 'car'); } catch {}
  }

  function setupVideo() {
    const video = document.querySelector('video.car');
    if (!video) return;

    forceCarMode();

    video.dataset.edgeVideoReady = 'true';
    video.muted = true;
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
    video.style.pointerEvents = 'auto';

    const current = video.currentSrc || video.src || '';
    if (!current.includes('white-toyota-drifting.3840x2160.mp4') || current.includes('cdn.larixdev.com')) {
      video.innerHTML = '';
      const source = document.createElement('source');
      source.src = LOCAL_VIDEO;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.src = LOCAL_VIDEO;
      video.load();
    }

    const play = () => {
      forceCarMode();
      video.muted = true;
      video.style.display = 'block';
      video.play().catch(() => {});
    };

    play();
    setTimeout(play, 150);
    setTimeout(play, 500);
    setTimeout(play, 1200);

    video.onerror = () => {
      video.innerHTML = '';
      const source = document.createElement('source');
      source.src = CDN_VIDEO;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.src = CDN_VIDEO;
      video.load();
      setTimeout(play, 150);
    };

    ['pointerdown', 'click', 'touchstart'].forEach((eventName) => {
      document.addEventListener(eventName, play, { passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) play();
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    .car{display:block!important;visibility:visible!important;opacity:1!important;}
    body.edge-video-static-fallback .car{display:block!important;visibility:visible!important;opacity:1!important;}
    body[data-bg="car"] .car,body:not([data-bg]) .car{display:block!important;visibility:visible!important;opacity:1!important;}
  `;
  document.head.appendChild(style);

  setupVideo();
  setTimeout(setupVideo, 300);
  setTimeout(setupVideo, 1000);
  setTimeout(setupVideo, 2200);
})();
