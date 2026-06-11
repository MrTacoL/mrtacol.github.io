(() => {
  const css = document.createElement('style');
  css.textContent = `
    @media (min-width:651px){
      .sound-panel.force-drag-ready .music-console{cursor:auto!important}
      .music-drag-grip{display:flex!important;align-items:center;justify-content:center;height:1.65rem;margin:-.25rem 0 .55rem;border-radius:999px;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);color:rgba(255,255,255,.82);font-size:.66rem;font-weight:950;letter-spacing:.08em;text-transform:uppercase;cursor:grab!important;touch-action:none;user-select:none;position:relative;z-index:5}
      .sound-panel.force-dragging .music-drag-grip{cursor:grabbing!important;background:rgba(101,239,255,.18)}
    }
    @media (max-width:650px){.music-drag-grip{display:none!important}}
  `;
  document.head.appendChild(css);

  function px(value, fallback){
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function place(panel, left, top){
    panel.style.setProperty('left', `${left}px`, 'important');
    panel.style.setProperty('top', `${top}px`, 'important');
    panel.style.setProperty('right', 'auto', 'important');
    panel.style.setProperty('bottom', 'auto', 'important');
    panel.style.setProperty('transform', 'none', 'important');
  }

  function setup(){
    const panel = document.querySelector('.sound-panel');
    const player = document.querySelector('.music-console');
    if (!panel || !player || panel.dataset.forceDragReady === 'true') return;

    panel.dataset.forceDragReady = 'true';
    panel.classList.add('force-drag-ready');

    let grip = player.querySelector('.music-drag-grip') || player.querySelector('.music-drag-handle');
    if (!grip) {
      grip = document.createElement('div');
      grip.className = 'music-drag-grip';
      grip.textContent = '↕ Drag player';
      player.prepend(grip);
    } else {
      grip.classList.add('music-drag-grip');
      grip.textContent = '↕ Drag player';
    }

    try {
      const saved = JSON.parse(localStorage.getItem('musicPlayerPosition') || 'null');
      if (saved && window.matchMedia('(min-width:651px)').matches) {
        place(panel, saved.left, saved.top);
      }
    } catch {}

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const start = (event) => {
      if (!window.matchMedia('(min-width:651px)').matches) return;
      const point = event.touches ? event.touches[0] : event;
      const rect = panel.getBoundingClientRect();
      dragging = true;
      startX = point.clientX;
      startY = point.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      panel.classList.add('force-dragging');
      place(panel, rect.left, rect.top);
      event.preventDefault();
    };

    const move = (event) => {
      if (!dragging) return;
      const point = event.touches ? event.touches[0] : event;
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const nextLeft = clamp(startLeft + point.clientX - startX, 8, window.innerWidth - width - 8);
      const nextTop = clamp(startTop + point.clientY - startY, 8, window.innerHeight - height - 8);
      place(panel, nextLeft, nextTop);
      event.preventDefault();
    };

    const end = () => {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove('force-dragging');
      localStorage.setItem('musicPlayerPosition', JSON.stringify({
        left: px(panel.style.left, 16),
        top: px(panel.style.top, 16)
      }));
    };

    grip.addEventListener('mousedown', start);
    grip.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
  }

  setup();
  setTimeout(setup, 300);
  setTimeout(setup, 1000);
  setTimeout(setup, 2000);
})();
