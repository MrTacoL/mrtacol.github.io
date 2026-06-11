(() => {
  const style = document.createElement('style');
  style.textContent = `
    @media (hover:hover) and (pointer:fine) {
      html, body, body *, a, button, input, select, textarea, label {
        cursor: none !important;
      }
      .custom-cursor-dot {
        display: block;
      }
    }

    .custom-cursor-dot {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 99999;
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: #fff;
      pointer-events: none;
      display: none;
      transform: translate(-50%, -50%) scale(1);
      box-shadow:
        0 0 8px rgba(255,255,255,.95),
        0 0 16px rgba(101,239,255,.55),
        0 0 24px rgba(255,11,114,.3);
      transition: transform .08s ease, opacity .15s ease;
    }

    .custom-cursor-dot.down {
      transform: translate(-50%, -50%) scale(.62);
    }

    .draw-canvas.active {
      cursor: crosshair !important;
    }

    .cursor-glow {
      opacity: .08 !important;
    }
  `;
  document.head.appendChild(style);

  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  window.addEventListener('pointermove', (event) => {
    dot.style.left = `${event.clientX}px`;
    dot.style.top = `${event.clientY}px`;
  }, { passive: true });

  window.addEventListener('pointerdown', () => dot.classList.add('down'));
  window.addEventListener('pointerup', () => dot.classList.remove('down'));
})();
