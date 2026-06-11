(() => {
  const css = document.createElement('style');
  css.textContent = `
    .sound-panel.player-loaded,
    .sound-panel.player-on {
      top: 1rem !important;
      left: 1rem !important;
      width: min(22rem, 92vw) !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
    }

    .sound-panel .music-console {
      width: 100% !important;
      padding: 1rem !important;
      border-radius: 2rem !important;
      background: linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.045)) !important;
      box-shadow: 1rem 1rem 2.8rem rgba(0,0,0,.56), -.55rem -.55rem 2rem rgba(255,255,255,.07), inset 0 0 0 1px rgba(255,255,255,.13) !important;
      backdrop-filter: blur(22px) saturate(1.25) !important;
    }

    .sound-panel .music-topline {
      display: grid !important;
      grid-template-columns: 1fr !important;
      justify-items: center !important;
      text-align: center !important;
      gap: .65rem !important;
    }

    .sound-panel .music-disc {
      width: 9rem !important;
      height: 9rem !important;
      border-radius: 50% !important;
      background: radial-gradient(circle, #fff 0 10%, #111217 11% 21%, #65efff 22% 26%, #1a1c27 27% 58%, #ff0b72 59% 67%, #080910 68%) !important;
      box-shadow: inset .15rem .15rem .45rem rgba(255,255,255,.45), inset -.15rem -.15rem .45rem rgba(0,0,0,.55), 0 0 1.4rem rgba(101,239,255,.28) !important;
    }

    .sound-panel .music-now-title {
      font-size: 1.08rem !important;
      max-width: 18rem !important;
      text-align: center !important;
    }

    .sound-panel .music-volume {
      width: 100% !important;
      margin: .1rem 0 .2rem !important;
      padding: .5rem .7rem !important;
      border-radius: 999px !important;
      background: rgba(255,255,255,.075) !important;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.11) !important;
    }

    .sound-panel .music-controls {
      display: grid !important;
      grid-template-columns: 3rem 4rem 3rem !important;
      justify-content: center !important;
      gap: .8rem !important;
      margin-top: .75rem !important;
    }

    .sound-panel .music-mode {
      grid-column: span 1 !important;
      border-radius: 999px !important;
    }

    .sound-panel #shuffleToggle { grid-column: 1 / 2 !important; }
    .sound-panel #repeatToggle { grid-column: 2 / 4 !important; }

    .sound-panel .music-control {
      border-radius: 50% !important;
      height: 3rem !important;
      min-width: 3rem !important;
      padding: 0 !important;
    }

    .sound-panel .music-control.main {
      height: 4rem !important;
      min-width: 4rem !important;
      font-size: 1.3rem !important;
      background: linear-gradient(135deg, #65efff, #ff0b72) !important;
      color: #101116 !important;
    }

    .sound-panel .music-picker {
      height: 2.45rem !important;
      margin-top: .75rem !important;
      border-radius: 999px !important;
    }

    @media (max-width: 650px) {
      .sound-panel.player-loaded,
      .sound-panel.player-on {
        left: 50% !important;
        top: auto !important;
        bottom: 5.4rem !important;
        transform: translateX(-50%) !important;
        width: min(20rem, 92vw) !important;
      }
      .sound-panel .music-console { padding: .8rem !important; border-radius: 1.55rem !important; }
      .sound-panel .music-disc { width: 5.8rem !important; height: 5.8rem !important; }
      .sound-panel .music-now-title { font-size: .86rem !important; }
      .sound-panel .music-controls { grid-template-columns: 2.45rem 3.2rem 2.45rem !important; gap: .55rem !important; }
      .sound-panel .music-control { height: 2.45rem !important; min-width: 2.45rem !important; }
      .sound-panel .music-control.main { height: 3.2rem !important; min-width: 3.2rem !important; }
    }
  `;
  document.head.appendChild(css);

  function applyPlayerTheme() {
    const soundPanel = document.querySelector('.sound-panel');
    const player = document.querySelector('.music-console');
    if (!soundPanel || !player) return;
    soundPanel.classList.add('player-loaded');
  }

  applyPlayerTheme();
  setTimeout(applyPlayerTheme, 300);
  setTimeout(applyPlayerTheme, 1200);
})();
