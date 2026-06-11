(() => {
  const viewCount = document.getElementById('viewCount');
  const activityLine = document.getElementById('activityLine');
  const activitySubline = document.getElementById('activitySubline');
  const activityIcon = document.getElementById('activityIcon');

  const ICONS = {
    gamepad: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 8h9.6A5.2 5.2 0 0 1 22 13.2v2.05A3.75 3.75 0 0 1 15.85 18l-1.45-1.3H9.6L8.15 18A3.75 3.75 0 0 1 2 15.25V13.2A5.2 5.2 0 0 1 7.2 8ZM7 11v1.5H5.5V14H7v1.5h1.5V14H10v-1.5H8.5V11H7Zm9.5.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.2 2.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>',
    minecraft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5 12 3l8 3.5v10L12 21l-8-4.5v-10Zm8 5.25 5.9-2.6L12 6.6 6.1 9.15 12 11.75Zm-6 5.1 5 2.8v-6.15l-5-2.25v5.6Zm7 2.8 5-2.8v-5.6l-5 2.25v6.15Z"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4ZM13.2 4l-3 16h1.9l3-16h-1.9Z"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 3v12.2A3.2 3.2 0 1 1 16 12.25V7H9v10.2A3.2 3.2 0 1 1 7 14.25V5h11Z"/></svg>',
    watch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm6 3v6l5-3-5-3Z"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17h-11A2.5 2.5 0 0 1 4 14.5v-8ZM6.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-11ZM7 8h2v2H7V8Zm3 0h2v2h-2V8Zm3 0h2v2h-2V8Zm3 0h1v2h-1V8ZM7 11h1v2H7v-2Zm2 0h2v2H9v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2Zm-7 3h8v1H8v-1Z"/></svg>'
  };

  const style = document.createElement('style');
  style.textContent = `
    .avatar-fallback {
      border-radius: 1.08rem !important;
      border: 1px solid rgba(255,255,255,.14) !important;
      background-color: rgba(255,255,255,.08) !important;
      box-shadow: 0 .9rem 1.9rem rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.18) !important;
      position: relative !important;
      isolation: isolate !important;
    }
    .avatar-fallback::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(255,255,255,.10), transparent 45%, rgba(0,0,0,.18));
      pointer-events: none;
      z-index: 2;
    }
    .status-dot {
      left: 4.35rem !important;
      bottom: .68rem !important;
      width: .82rem !important;
      height: .82rem !important;
      border: 3px solid rgba(18,19,27,.98) !important;
      z-index: 6 !important;
      box-shadow: 0 0 0 .14rem rgba(35,209,96,.18), 0 0 .9rem rgba(35,209,96,.45) !important;
    }
    .views {
      display: inline-flex !important;
      align-items: center !important;
      gap: .32rem !important;
      min-height: 1.25rem;
    }
    .views svg {
      width: 1.05rem;
      height: 1.05rem;
      fill: rgba(255,255,255,.9);
      filter: drop-shadow(0 0 .45rem rgba(255,255,255,.28));
    }
    .device-icon.game-icon {
      background-image: none !important;
      color: var(--blue) !important;
    }
    .device-icon.game-icon svg {
      display: block !important;
      width: 2rem !important;
      height: 2rem !important;
      fill: currentColor !important;
    }
  `;
  document.head.appendChild(style);

  function compact(value) {
    const number = Number(value || 0);
    if (!Number.isFinite(number)) return '1';
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(number);
  }

  async function setupLiveViews() {
    if (!viewCount) return;

    const pageKey = 'mrtacosi-profile-main';
    const seenKey = 'mrtacosi:profile:viewed';
    const alreadySeen = sessionStorage.getItem(seenKey) === '1';
    const endpoint = alreadySeen
      ? `https://api.countapi.xyz/get/${pageKey}/views`
      : `https://api.countapi.xyz/hit/${pageKey}/views`;

    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      if (!data || typeof data.value !== 'number') throw new Error('bad count');
      sessionStorage.setItem(seenKey, '1');
      viewCount.textContent = compact(data.value);
      localStorage.setItem('mrtacosi:profile:lastViews', String(data.value));
    } catch {
      const fallback = Number(localStorage.getItem('mrtacosi:profile:lastViews') || '1');
      viewCount.textContent = compact(fallback);
    }
  }

  function pickIcon() {
    const text = `${activityLine?.textContent || ''} ${activitySubline?.textContent || ''}`.toLowerCase();
    if (text.includes('minecraft')) return ['minecraft', ICONS.minecraft];
    if (text.includes('visual studio') || text.includes('code') || text.includes('coding')) return ['code', ICONS.code];
    if (text.includes('spotify') || text.includes('listening')) return ['music', ICONS.music];
    if (text.includes('watching')) return ['watch', ICONS.watch];
    if (text.includes('playing')) return ['gamepad', ICONS.gamepad];
    return ['keyboard', ICONS.keyboard];
  }

  function updateGameIcon() {
    if (!activityIcon) return;

    const [key, svg] = pickIcon();
    if (activityIcon.dataset.iconKey === key && activityIcon.classList.contains('game-icon')) return;

    activityIcon.dataset.iconKey = key;
    activityIcon.classList.remove('has-art');
    activityIcon.classList.add('game-icon');
    activityIcon.style.backgroundImage = 'none';
    activityIcon.innerHTML = svg;
  }

  let iconTimer = 0;
  function queueIconUpdate() {
    clearTimeout(iconTimer);
    iconTimer = setTimeout(updateGameIcon, 30);
  }

  const observer = new MutationObserver(queueIconUpdate);
  if (activityLine) observer.observe(activityLine, { childList: true, characterData: true, subtree: true });
  if (activitySubline) observer.observe(activitySubline, { childList: true, characterData: true, subtree: true });

  setupLiveViews();
  setInterval(setupLiveViews, 30000);
  updateGameIcon();
  setTimeout(updateGameIcon, 500);
  setInterval(updateGameIcon, 1500);
})();
