(() => {
  const css = document.createElement('style');
  css.textContent = `
    @media (min-width:651px){
      .sound-panel.force-drag-ready .music-console{cursor:auto!important}
      .music-drag-grip{display:grid!important;grid-template-columns:1fr auto;align-items:center;gap:.45rem;height:1.75rem;margin:-.25rem 0 .55rem;border-radius:999px;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);color:rgba(255,255,255,.82);font-size:.66rem;font-weight:950;letter-spacing:.08em;text-transform:uppercase;cursor:grab!important;touch-action:none;user-select:none;position:relative;z-index:20;padding:0 .38rem 0 .8rem}
      .music-drag-reset{border:0;border-radius:999px;height:1.2rem;padding:0 .55rem;font-size:.55rem;font-weight:950;letter-spacing:.06em;text-transform:uppercase;color:#101116;background:linear-gradient(135deg,#65efff,#ff0b72);cursor:pointer}
      .sound-panel.force-dragging .music-drag-grip{cursor:grabbing!important;background:rgba(101,239,255,.18)}
      body.force-music-dragging,body.force-music-dragging *{cursor:grabbing!important;user-select:none!important}
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

  function resetPlace(panel){
    panel.style.removeProperty('left');
    panel.style.removeProperty('top');
    panel.style.removeProperty('right');
    panel.style.removeProperty('bottom');
    panel.style.removeProperty('transform');
    localStorage.removeItem('musicPlayerPosition');
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
      player.prepend(grip);
    }
    grip.classList.add('music-drag-grip');
    grip.innerHTML = '<span>↕ Drag player</span><button class="music-drag-reset" type="button">Reset</button>';
    const reset = grip.querySelector('.music-drag-reset');

    try {
      const saved = JSON.parse(localStorage.getItem('musicPlayerPosition') || 'null');
      if (saved && window.matchMedia('(min-width:651px)').matches) place(panel, saved.left, saved.top);
    } catch {}

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let activeId = null;

    const getPoint = (event) => event.touches ? event.touches[0] : event;

    const end = () => {
      if (!dragging) return;
      dragging = false;
      activeId = null;
      panel.classList.remove('force-dragging');
      document.body.classList.remove('force-music-dragging');
      localStorage.setItem('musicPlayerPosition', JSON.stringify({
        left: px(panel.style.left, 16),
        top: px(panel.style.top, 16)
      }));
    };

    const start = (event) => {
      if (!window.matchMedia('(min-width:651px)').matches) return;
      if (event.target.closest('.music-drag-reset')) return;
      const point = getPoint(event);
      const rect = panel.getBoundingClientRect();
      dragging = true;
      activeId = event.pointerId ?? null;
      startX = point.clientX;
      startY = point.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      panel.classList.add('force-dragging');
      document.body.classList.add('force-music-dragging');
      place(panel, rect.left, rect.top);
      try { if (event.pointerId !== undefined) grip.setPointerCapture(event.pointerId); } catch {}
      event.preventDefault();
      event.stopPropagation();
    };

    const move = (event) => {
      if (!dragging) return;
      if (activeId !== null && event.pointerId !== undefined && event.pointerId !== activeId) return;
      const point = getPoint(event);
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const nextLeft = clamp(startLeft + point.clientX - startX, 8, window.innerWidth - width - 8);
      const nextTop = clamp(startTop + point.clientY - startY, 8, window.innerHeight - height - 8);
      place(panel, nextLeft, nextTop);
      event.preventDefault();
      event.stopPropagation();
    };

    reset?.addEventListener('click', (event) => {
      end();
      resetPlace(panel);
      event.preventDefault();
      event.stopPropagation();
    });

    grip.addEventListener('pointerdown', start);
    window.addEventListener('pointermove', move, { passive:false });
    window.addEventListener('pointerup', end, { passive:false });
    window.addEventListener('pointercancel', end, { passive:false });
    window.addEventListener('mouseup', end, { passive:false });
    window.addEventListener('touchend', end, { passive:false });
    window.addEventListener('blur', end);
    document.addEventListener('mouseleave', end);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') end(); });
  }

  setup();
  setTimeout(setup, 300);
  setTimeout(setup, 1000);
  setTimeout(setup, 2000);
})();
