(() => {
  const CDN_VIDEO = 'https://cdn.larixdev.com/white-toyota-drifting.3840x2160.mp4?v=edge-3';
  const LOCAL_VIDEO = './assets/white-toyota-drifting.3840x2160.mp4?v=edge-3';
  const STATIC_FALLBACK = './assets/favicon.png?v=5';

  function isEdge() {
    return /Edg\//.test(navigator.userAgent);
  }

  function ensureVideo() {
    const video = document.querySelector('video.car');
    if (!video || video.dataset.edgeVideoReady === 'true') return;
    video.dataset.edgeVideoReady = 'true';

    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.style.display = '';
    video.style.visibility = 'visible';
    video.style.opacity = video.style.opacity || '1';

    const sources = isEdge() ? [CDN_VIDEO, LOCAL_VIDEO] : [LOCAL_VIDEO, CDN_VIDEO];
    let index = 0;

    function setSource(src) {
      const current = video.currentSrc || video.src || video.querySelector('source')?.src || '';
      if (current.includes(src.replace(/^\.\//, ''))) return;
      video.innerHTML = '';
      const source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.src = src;
      video.load();
    }

    function tryPlay() {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }

    function tryNextSource() {
      if (index >= sources.length - 1) {
        document.body.classList.add('edge-video-static-fallback');
        document.documentElement.style.setProperty('--edge-video-fallback', `url("${STATIC_FALLBACK}")`);
        return;
      }
      index += 1;
      setSource(sources[index]);
      setTimeout(tryPlay, 80);
    }

    setSource(sources[index]);
    tryPlay();
    setTimeout(tryPlay, 250);
    setTimeout(tryPlay, 900);
    setTimeout(() => {
      if (video.readyState < 2 || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) tryNextSource();
      else tryPlay();
    }, 1800);

    video.addEventListener('error', tryNextSource);
    video.addEventListener('stalled', () => {
      setTimeout(() => {
        if (video.readyState < 2) tryNextSource();
      }, 900);
    });
    video.addEventListener('canplay', tryPlay);

    ['pointerdown', 'click', 'touchstart'].forEach((eventName) => {
      document.addEventListener(eventName, tryPlay, { passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlay();
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    body.edge-video-static-fallback::before{content:"";position:fixed;inset:0;z-index:0;background:linear-gradient(90deg,rgba(0,0,0,.66),rgba(0,0,0,.15),rgba(0,0,0,.66)),var(--edge-video-fallback) center/cover no-repeat!important;filter:blur(1px) saturate(1.1);}
    body.edge-video-static-fallback .car{display:none!important;}
  `;
  document.head.appendChild(style);

  ensureVideo();
  setTimeout(ensureVideo, 400);
  setTimeout(ensureVideo, 1400);
})();
