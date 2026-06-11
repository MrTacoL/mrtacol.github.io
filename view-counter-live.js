(() => {
  const ENDPOINT = 'https://mrtacosi-view-counter.lonyo423.workers.dev/';
  const START_VALUE = 10472918;
  const SESSION_KEY = 'mrtacosi:global-view-counted-v1';
  const viewCount = document.getElementById('viewCount');
  if (!viewCount) return;

  let currentValue = Number(String(viewCount.textContent || '').replace(/[^0-9]/g, '')) || START_VALUE;
  let initialized = false;

  function format(value) {
    return new Intl.NumberFormat('en-US').format(Math.max(0, Math.floor(Number(value) || 0)));
  }

  function animateTo(nextValue, duration = 900) {
    const from = currentValue || START_VALUE;
    const to = Number(nextValue) || START_VALUE;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      viewCount.textContent = format(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else {
        currentValue = to;
        viewCount.textContent = format(to);
      }
    }

    requestAnimationFrame(tick);
  }

  async function getViews(mode) {
    const response = await fetch(`${ENDPOINT}?mode=${mode}&t=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    return Number(data.views) || START_VALUE;
  }

  async function initViews() {
    try {
      const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === '1';
      const next = await getViews(alreadyCounted ? 'peek' : 'hit');
      if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, '1');
      initialized = true;
      animateTo(next, 900);
    } catch {
      if (!initialized) viewCount.textContent = format(START_VALUE);
    }
  }

  async function refreshViews() {
    try {
      const next = await getViews('peek');
      if (next !== currentValue) animateTo(next, 700);
    } catch {}
  }

  initViews();
  setTimeout(initViews, 1200);
  setInterval(refreshViews, 15000);
})();
