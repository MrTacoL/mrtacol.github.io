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

  setupDrawMode();

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

  function setupDrawMode() {
    const style = document.createElement('style');
    style.textContent = `
      .draw-canvas{
        position:fixed;
        inset:0;
        z-index:1800;
        width:100vw;
        height:100vh;
        opacity:0;
        pointer-events:none;
        touch-action:none;
      }
      .draw-canvas.active{
        opacity:1;
        pointer-events:auto;
        cursor:crosshair;
      }
      .draw-dock{
        position:fixed;
        right:1rem;
        bottom:1rem;
        z-index:1900;
        display:flex;
        align-items:center;
        gap:.55rem;
        padding:.55rem;
        border:1px solid rgba(255,255,255,.18);
        border-radius:999px;
        background:rgba(13,14,20,.72);
        box-shadow:0 .9rem 2.3rem rgba(0,0,0,.42),0 0 1.5rem rgba(101,239,255,.2);
        backdrop-filter:blur(16px) saturate(1.25);
      }
      .draw-dock button,
      .draw-dock input{
        pointer-events:auto;
      }
      .draw-toggle,
      .draw-clear,
      .draw-close{
        height:2.55rem;
        border:0;
        border-radius:999px;
        padding:0 .95rem;
        font-weight:900;
        color:#fff;
        background:linear-gradient(135deg,rgba(101,239,255,.32),rgba(255,11,114,.36));
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 0 1rem rgba(101,239,255,.2);
        cursor:pointer;
      }
      .draw-toggle.active{
        background:linear-gradient(135deg,#65efff,#ff0b72);
        color:#101116;
      }
      .draw-tools{
        display:none;
        align-items:center;
        gap:.45rem;
      }
      .draw-tools.active{ display:flex; }
      .draw-color{
        width:2.25rem;
        height:2.25rem;
        border:0;
        padding:0;
        border-radius:50%;
        overflow:hidden;
        background:transparent;
        cursor:pointer;
      }
      .draw-size{
        width:5.8rem;
        accent-color:#65efff;
      }
      @media(max-width:650px){
        .draw-dock{ right:.65rem; bottom:.65rem; gap:.35rem; padding:.42rem; }
        .draw-toggle,.draw-clear,.draw-close{ height:2.35rem; padding:0 .7rem; font-size:.78rem; }
        .draw-size{ width:4.3rem; }
        .draw-color{ width:2rem; height:2rem; }
      }
    `;
    document.head.appendChild(style);

    const canvas = document.createElement('canvas');
    canvas.className = 'draw-canvas';
    document.body.appendChild(canvas);

    const dock = document.createElement('div');
    dock.className = 'draw-dock';
    dock.innerHTML = `
      <button class="draw-toggle" type="button">Draw Mode</button>
      <div class="draw-tools">
        <input class="draw-color" type="color" value="#65efff" title="Color">
        <input class="draw-size" type="range" min="2" max="28" value="7" title="Size">
        <button class="draw-clear" type="button">Clear</button>
        <button class="draw-close" type="button">Exit</button>
      </div>
    `;
    document.body.appendChild(dock);

    const ctx = canvas.getContext('2d');
    const toggle = dock.querySelector('.draw-toggle');
    const tools = dock.querySelector('.draw-tools');
    const color = dock.querySelector('.draw-color');
    const size = dock.querySelector('.draw-size');
    const clear = dock.querySelector('.draw-clear');
    const close = dock.querySelector('.draw-close');
    let active = false;
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    function fitCanvas() {
      const saved = document.createElement('canvas');
      saved.width = canvas.width;
      saved.height = canvas.height;
      saved.getContext('2d').drawImage(canvas, 0, 0);
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (saved.width && saved.height) ctx.drawImage(saved, 0, 0, canvas.width / dpr, canvas.height / dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    function setActive(value) {
      active = value;
      canvas.classList.toggle('active', active);
      toggle.classList.toggle('active', active);
      tools.classList.toggle('active', active);
      toggle.textContent = active ? 'Drawing On' : 'Draw Mode';
    }

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    canvas.addEventListener('pointerdown', (event) => {
      if (!active) return;
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      const p = point(event);
      drawing = true;
      lastX = p.x;
      lastY = p.y;
    });

    canvas.addEventListener('pointermove', (event) => {
      if (!active || !drawing) return;
      event.preventDefault();
      const p = point(event);
      ctx.strokeStyle = color.value;
      ctx.lineWidth = Number(size.value);
      ctx.shadowColor = color.value;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x;
      lastY = p.y;
    });

    function stopDrawing(event) {
      drawing = false;
      try { canvas.releasePointerCapture(event.pointerId); } catch {}
    }

    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing);
    toggle.addEventListener('click', () => setActive(!active));
    close.addEventListener('click', () => setActive(false));
    clear.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
    window.addEventListener('resize', fitCanvas);
    fitCanvas();
  }
})();
