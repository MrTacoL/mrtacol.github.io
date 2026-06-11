(() => {
  const cursor = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="15" fill="#66686d" stroke="#101116" stroke-width="4"/>
      <circle cx="21" cy="21" r="8.5" fill="#ffffff"/>
      <circle cx="21" cy="21" r="17.5" fill="none" stroke="#65efff" stroke-opacity="0.65" stroke-width="1.5"/>
    </svg>
  `)}`;

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
