(() => {
  const hover = document.getElementById('musicTitle');
  const frame = document.getElementById('musicPreviewFrame');
  if (!hover || !frame) return;

  const videoId = 'EUshgvt7I8U';
  const videoSrc = `https://www.youtube-nocookie.com/embed/${videoId}?start=182&controls=0&mute=1&modestbranding=1&playsinline=1`;
  frame.dataset.src = videoSrc;
  let closeTimer;

  function showPreview() {
    clearTimeout(closeTimer);
    hover.classList.add('is-hovering');
    if (frame.src !== videoSrc) frame.src = videoSrc;
  }

  function hidePreview() {
    closeTimer = setTimeout(() => {
      hover.classList.remove('is-hovering');
      frame.removeAttribute('src');
    }, 160);
  }

  hover.addEventListener('mouseenter', showPreview);
  hover.addEventListener('mouseleave', hidePreview);
  hover.addEventListener('focus', showPreview);
  hover.addEventListener('blur', hidePreview);
})();
