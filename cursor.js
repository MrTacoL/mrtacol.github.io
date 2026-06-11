(() => {
  const cursor = 'data:image/png;base64,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';

  const style = document.createElement('style');
  style.textContent = `
    @media (hover:hover) and (pointer:fine) {
      html, body, body *, a, button, input, select, textarea, label { cursor: none !important; }
      .custom-cursor-img { display:block; }
    }
    .custom-cursor-img {
      position:fixed;
      left:0;
      top:0;
      z-index:99999;
      width:42px;
      height:42px;
      pointer-events:none;
      transform:translate(-50%,-50%) scale(1);
      filter:drop-shadow(0 0 10px rgba(255,255,255,.75)) drop-shadow(0 0 16px rgba(101,239,255,.45));
      display:none;
      transition:transform .08s ease, opacity .15s ease;
    }
    .custom-cursor-img.down { transform:translate(-50%,-50%) scale(.82); }
    .draw-canvas.active { cursor: crosshair !important; }
    .cursor-glow { opacity:.18 !important; }
  `;
  document.head.appendChild(style);

  const img = document.createElement('img');
  img.className = 'custom-cursor-img';
  img.src = cursor;
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  document.body.appendChild(img);

  window.addEventListener('pointermove', (event) => {
    img.style.left = `${event.clientX}px`;
    img.style.top = `${event.clientY}px`;
  }, { passive: true });

  window.addEventListener('pointerdown', () => img.classList.add('down'));
  window.addEventListener('pointerup', () => img.classList.remove('down'));
})();
