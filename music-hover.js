(() => {
  const hover = document.getElementById('musicTitle');
  const frame = document.getElementById('musicPreviewFrame');
  if (!hover || !frame) return;

  const videoSrc = frame.dataset.src;
  let closeTimer;

  function showPreview() {
    clearTimeout(closeTimer);
    hover.classList.add('is-hovering');
    if (videoSrc && frame.src !== videoSrc) frame.src = videoSrc;
  }

  function hidePreview() {
    closeTimer = setTimeout(() => {
      hover.classList.remove('is-hovering');
      frame.removeAttribute('src');
    }, 120);
  }

  hover.addEventListener('mouseenter', showPreview);
  hover.addEventListener('mouseleave', hidePreview);
  hover.addEventListener('focus', showPreview);
  hover.addEventListener('blur', hidePreview);
})();
