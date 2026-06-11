(() => {
  function setupCarVideo() {
    const video = document.querySelector('video.car');
    if (!video || video.dataset.mobileFixReady === 'true') return;
    video.dataset.mobileFixReady = 'true';

    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const play = () => {
      if (!video.paused && !video.ended) return;
      video.play().catch(() => {});
    };

    play();
    setTimeout(play, 300);
    setTimeout(play, 1200);

    document.getElementById('enterButton')?.addEventListener('click', play);
    document.getElementById('enterScreen')?.addEventListener('click', play);
    document.addEventListener('pointerdown', play, { once: false });
    document.addEventListener('touchstart', play, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) play();
    });
  }

  setupCarVideo();
  setTimeout(setupCarVideo, 500);
  setTimeout(setupCarVideo, 1500);
})();
