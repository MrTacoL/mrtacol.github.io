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

  const name = document.getElementById('profileName');
  if (name) {
    const text = name.textContent.trim() || 'mrtacosi';
    name.dataset.text = text;
    name.classList.add('super-name');
    name.setAttribute('aria-label', text);
    name.innerHTML = `<span class="name-orbit" aria-hidden="true"></span>${[...text].map((letter, index) => `<span class="name-letter" style="--i:${index}">${letter}</span>`).join('')}`;

    const style = document.createElement('style');
    style.textContent = `
      .name.super-name{
        position:relative!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:.015em!important;
        isolation:isolate!important;
        color:transparent!important;
        background:none!important;
        -webkit-text-fill-color:transparent!important;
        filter:drop-shadow(0 0 .75rem rgba(101,239,255,.5)) drop-shadow(0 0 1.3rem rgba(255,11,114,.33))!important;
        animation:nameHoverFloat 3.2s ease-in-out infinite!important;
        perspective:900px;
      }
      .name.super-name::before,
      .name.super-name::after{
        content:attr(data-text)!important;
        position:absolute!important;
        inset:0!important;
        z-index:-2!important;
        opacity:.55!important;
        color:transparent!important;
        -webkit-text-fill-color:transparent!important;
        pointer-events:none!important;
      }
      .name.super-name::before{
        text-shadow:.12rem 0 #65efff, -.08rem 0 rgba(255,11,114,.65)!important;
        animation:megaGlitch 2.4s steps(2,end) infinite!important;
      }
      .name.super-name::after{
        text-shadow:-.12rem 0 #ff0b72, .08rem 0 rgba(101,239,255,.65)!important;
        animation:megaGlitch 3s steps(2,end) infinite reverse!important;
      }
      .name-letter{
        display:inline-block;
        background:linear-gradient(120deg,#fff 0%,#65efff 24%,#b793ff 48%,#ff0b72 72%,#fff 100%);
        background-size:350% 100%;
        -webkit-background-clip:text;
        background-clip:text;
        color:transparent;
        -webkit-text-fill-color:transparent;
        animation:nameLetterWave 2.6s ease-in-out infinite, nameColorSlide 4s linear infinite;
        animation-delay:calc(var(--i) * .075s), 0s;
        text-shadow:0 0 .5rem rgba(255,255,255,.3);
        transform-origin:50% 70%;
      }
      .name-orbit{
        position:absolute;
        width:112%;
        height:1.18em;
        border-radius:999px;
        border:1px solid rgba(101,239,255,.38);
        box-shadow:0 0 1.2rem rgba(101,239,255,.35), inset 0 0 1rem rgba(255,11,114,.16);
        transform:rotate(-6deg);
        z-index:-3;
        animation:nameOrbitPulse 2s ease-in-out infinite;
      }
      .name-orbit::before,
      .name-orbit::after{
        content:"";
        position:absolute;
        width:.48rem;
        height:.48rem;
        border-radius:50%;
        background:#fff;
        box-shadow:0 0 .8rem #65efff, 0 0 1.4rem #ff0b72;
        top:50%;
        left:50%;
        transform-origin:-5.2rem 0;
      }
      .name-orbit::before{ animation:nameSpark 2.4s linear infinite; }
      .name-orbit::after{ animation:nameSpark 2.4s linear infinite reverse; opacity:.75; }
      .name.super-name:hover .name-letter{
        animation-duration:1.1s,1.5s;
      }
      @keyframes nameLetterWave{
        0%,100%{ transform:translateY(0) rotateX(0deg) rotateZ(0deg) scale(1); }
        40%{ transform:translateY(-.18em) rotateX(18deg) rotateZ(-2deg) scale(1.08); }
        70%{ transform:translateY(.04em) rotateX(-8deg) rotateZ(1deg) scale(.98); }
      }
      @keyframes nameColorSlide{ to{ background-position:350% 0; } }
      @keyframes nameHoverFloat{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-.16rem); } }
      @keyframes nameOrbitPulse{ 0%,100%{ opacity:.45; transform:rotate(-6deg) scale(1); } 50%{ opacity:.9; transform:rotate(2deg) scale(1.06); } }
      @keyframes nameSpark{ to{ transform:rotate(360deg) translateX(5.2rem) rotate(-360deg); } }
      @keyframes megaGlitch{
        0%,86%,100%{ clip-path:inset(0 0 0 0); transform:none; }
        88%{ clip-path:inset(12% 0 62% 0); transform:translate(.12rem,-.05rem); }
        92%{ clip-path:inset(58% 0 16% 0); transform:translate(-.12rem,.04rem); }
        96%{ clip-path:inset(34% 0 35% 0); transform:translate(.06rem,.03rem); }
      }
    `;
    document.head.appendChild(style);
  }

  const hover = document.getElementById('musicTitle');
  const frame = document.getElementById('musicPreviewFrame');
  if (!hover || !frame) return;

  const base = 'https://www.youtube-nocookie.com/embed/EUshgvt7I8U';
  const params = new URLSearchParams({ start: '182', mute: '1', controls: '1', modestbranding: '1', playsinline: '1' });
  params.set('auto' + 'play', '1');
  const videoSrc = `${base}?${params.toString()}`;

  let closeTimer;
  let pinnedOpen = false;
  let mouseInside = false;

  function openPreview() {
    clearTimeout(closeTimer);
    hover.classList.add('is-hovering');
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; web-share');
    if (frame.src !== videoSrc) frame.src = videoSrc;
  }

  function closePreview() {
    clearTimeout(closeTimer);
    pinnedOpen = false;
    hover.classList.remove('is-hovering');
    frame.removeAttribute('src');
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (!pinnedOpen && !mouseInside) closePreview();
    }, 180);
  }

  hover.addEventListener('mouseenter', () => {
    mouseInside = true;
    openPreview();
  });

  hover.addEventListener('mouseleave', () => {
    mouseInside = false;
    if (!pinnedOpen) scheduleClose();
  });

  hover.addEventListener('click', (event) => {
    event.stopPropagation();
    pinnedOpen = !pinnedOpen;
    if (pinnedOpen) openPreview();
    else closePreview();
  });

  document.addEventListener('click', (event) => {
    if (pinnedOpen && !hover.contains(event.target)) closePreview();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && pinnedOpen) closePreview();
  });
})();
