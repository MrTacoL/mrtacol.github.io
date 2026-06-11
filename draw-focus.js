(() => {
  const style = document.createElement('style');
  style.textContent = `
    body.draw-focus .stage,
    body.draw-focus .sound-panel,
    body.draw-focus .mobile-live-toggle,
    body.draw-focus .live-widgets,
    body.draw-focus .commission-modal,
    body.draw-focus .projects-modal,
    body.draw-focus .cursor-glow {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      transition: opacity .18s ease, visibility .18s ease;
    }

    body.draw-focus .draw-dock,
    body.draw-focus .draw-canvas,
    body.draw-focus .background,
    body.draw-focus .car,
    body.draw-focus #weatherCanvas,
    body.draw-focus .vignette,
    body.draw-focus .grain {
      visibility: visible !important;
    }

    body.draw-focus .draw-dock {
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    body.draw-focus .draw-canvas.active {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);

  function syncDrawFocus() {
    const canvas = document.querySelector('.draw-canvas');
    document.body.classList.toggle('draw-focus', !!canvas?.classList.contains('active'));
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.draw-toggle, .draw-close')) {
      setTimeout(syncDrawFocus, 0);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const toggle = document.querySelector('.draw-toggle.active');
      if (toggle) toggle.click();
      setTimeout(syncDrawFocus, 0);
    }
  });

  const observer = new MutationObserver(syncDrawFocus);
  const waitForCanvas = setInterval(() => {
    const canvas = document.querySelector('.draw-canvas');
    if (!canvas) return;
    observer.observe(canvas, { attributes: true, attributeFilter: ['class'] });
    clearInterval(waitForCanvas);
    syncDrawFocus();
  }, 250);
})();
