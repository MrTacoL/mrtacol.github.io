(() => {
  const iconFiles = {
    Steam: 'steam.png',
    Minecraft: 'minecraft.png',
    Discord: 'discord.png',
    TikTok: 'tiktok.png',
    YouTube: 'youtube.png',
    GitHub: 'github.png',
    Roblox: 'roblox.png'
  };

  document.querySelectorAll('.socials a[title]').forEach((link) => {
    const title = link.getAttribute('title');
    const file = iconFiles[title];
    if (!file) return;
    link.innerHTML = `<img src="./assets/icons/${file}" alt="${title}" loading="lazy">`;
  });

  const hover = document.getElementById('musicTitle');
  const frame = document.getElementById('musicPreviewFrame');
  if (!hover || !frame) return;

  const base = 'https://www.youtube-nocookie.com/embed/EUshgvt7I8U';
  const params = new URLSearchParams({ start: '182', mute: '1', controls: '1', modestbranding: '1', playsinline: '1' });
  params.set('auto' + 'play', '1');
  const videoSrc = `${base}?${params.toString()}`;

  let closeTimer;

  function showPreview() {
    clearTimeout(closeTimer);
    hover.classList.add('is-hovering');
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; web-share');
    if (frame.src !== videoSrc) frame.src = videoSrc;
  }

  function hidePreview() {
    closeTimer = setTimeout(() => {
      hover.classList.remove('is-hovering');
      frame.removeAttribute('src');
    }, 180);
  }

  hover.addEventListener('mouseenter', showPreview);
  hover.addEventListener('mouseleave', hidePreview);
  hover.addEventListener('focus', showPreview);
  hover.addEventListener('blur', hidePreview);
})();
