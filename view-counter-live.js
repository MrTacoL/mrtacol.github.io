(() => {
  const ENDPOINT = 'https://mrtacosi-view-counter.lonyo423.workers.dev/';
  const START_VALUE = 10472918;
  const SESSION_KEY = 'mrtacosi:global-view-counted-v2';
  const viewCount = document.getElementById('viewCount');
  if (!viewCount) return;

  let currentValue = START_VALUE;
  let lastGoodValue = START_VALUE;
  let initialized = false;
  let internalWrite = false;

  function format(value) {
    return new Intl.NumberFormat('en-US').format(Math.max(START_VALUE, Math.floor(Number(value) || START_VALUE)));
  }

  function readShownValue() {
    return Number(String(viewCount.textContent || '').replace(/[^0-9]/g, '')) || 0;
  }

  function normalizeWorkerValue(value) {
    const raw = Number(value) || 0;
    if (raw <= 0) return START_VALUE;
    return raw < START_VALUE ? START_VALUE + raw : raw;
  }

  function setCount(value) {
    const fixed = Math.max(START_VALUE, Number(value) || START_VALUE, lastGoodValue || START_VALUE);
    currentValue = fixed;
    lastGoodValue = fixed;
    internalWrite = true;
    viewCount.textContent = format(fixed);
    internalWrite = false;
  }

  new MutationObserver(() => {
    if (internalWrite) return;
    const shown = readShownValue();
    if (shown > 0 && shown < START_VALUE) setCount(lastGoodValue || START_VALUE);
  }).observe(viewCount, { childList: true, characterData: true, subtree: true });

  function animateTo(nextValue, duration = 900) {
    const target = Math.max(START_VALUE, Number(nextValue) || START_VALUE, lastGoodValue || START_VALUE);
    const from = Math.max(START_VALUE, currentValue || START_VALUE, readShownValue() || START_VALUE);
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const next = from + (target - from) * eased;
      internalWrite = true;
      viewCount.textContent = format(next);
      internalWrite = false;
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    }

    requestAnimationFrame(tick);
  }

  async function getViews(mode) {
    const response = await fetch(`${ENDPOINT}?mode=${mode}&t=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    return normalizeWorkerValue(data.views);
  }

  async function initViews() {
    try {
      const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === '1';
      const next = await getViews(alreadyCounted ? 'peek' : 'hit');
      if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, '1');
      initialized = true;
      animateTo(next, 900);
    } catch {
      if (!initialized) setCount(START_VALUE);
    }
  }

  async function refreshViews() {
    try {
      const next = await getViews('peek');
      if (next > lastGoodValue) animateTo(next, 700);
      else setCount(lastGoodValue);
    } catch {}
  }

  window.initLiveViews = initViews;
  setCount(START_VALUE);
  initViews();
  setTimeout(initViews, 1200);
  setInterval(refreshViews, 15000);
})();
