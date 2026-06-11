(() => {
  const style = document.createElement('style');
  style.textContent = `
    html, body, body *, a, button, input, select, textarea, label {
      cursor: auto !important;
    }
    a, button, input[type="range"], input[type="color"], select, label, .project-button, .socials a {
      cursor: pointer !important;
    }
    .draw-canvas.active {
      cursor: crosshair !important;
    }
    .custom-cursor-dot,
    .custom-cursor-img {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);
  document.querySelectorAll('.custom-cursor-dot,.custom-cursor-img').forEach((el) => el.remove());
})();
