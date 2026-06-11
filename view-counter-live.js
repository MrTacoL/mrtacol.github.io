(() => {
  const ENDPOINT = 'https://mrtacosi-view-counter.lonyo423.workers.dev/';
  const START_VALUE = 10472918;
  const SESSION_KEY = 'mrtacosi:global-view-counted-v4';
  const viewCount = document.getElementById('viewCount');
  const enterScreen = document.getElementById('enterScreen');
  const music = document.getElementById('music');
  if (!viewCount) return;

  let currentValue = 0;
  let lastGoodValue = START_VALUE;
  let initialized = false;
  let running = false;
  let internalWrite = false;
  let countUpActive = false;

  function comma(value) {
    return new Intl.NumberFormat('en-US').format(Math.max(0, Math.floor(Number(value) || 0)));
  }

  function readShownValue() {
    return Number(String(viewCount.textContent || '').replace(/[^0-9]/g, '')) || 0;
  }

  function normalizeWorkerValue(value) {
    const raw = Number(value) || 0;
    if (raw <= 0) return START_VALUE;
    return raw < START_VALUE ? START_VALUE + raw : raw;
  }

  function write(value, allowSmall = false) {
    const fixed = allowSmall ? Math.max(0, Number(value) || 0) : Math.max(START_VALUE, Number(value) || START_VALUE, lastGoodValue || START_VALUE);
    internalWrite = true;
    viewCount.textContent = comma(fixed);
    internalWrite = false;
    currentValue = fixed;
    if (fixed >= START_VALUE) lastGoodValue = fixed;
  }

  new MutationObserver(() => {
    if (internalWrite || countUpActive) return;
    const shown = readShownValue();
    if (shown > 0 && shown < START_VALUE && initialized) write(lastGoodValue || START_VALUE);
  }).observe(viewCount, { childList: true, characterData: true, subtree: true });

  function animateTo(nextValue, duration = 2600, fromZero = false) {
    const target = Math.max(START_VALUE, Number(nextValue) || START_VALUE, lastGoodValue || START_VALUE);
    const from = fromZero ? 0 : Math.max(START_VALUE, currentValue || START_VALUE, readShownValue() || START_VALUE);
    const start = performance.now();
    countUpActive = Boolean(fromZero);

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      write(from + (target - from) * eased, fromZero);
      if (progress < 1) requestAnimationFrame(tick);
      else {
        countUpActive = false;
        write(target);
      }
    }

    requestAnimationFrame(tick);
  }

  async function getViews(mode) {
    const response = await fetch(`${ENDPOINT}?mode=${mode}&t=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    return normalizeWorkerValue(data.views);
  }

  async function initViews(options = {}) {
    if (running) return;
    running = true;
    try {
      const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === '1';
      const next = await getViews(alreadyCounted ? 'peek' : 'hit');
      if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, '1');
      initialized = true;
      animateTo(next, options.fromZero ? 3200 : 900, Boolean(options.fromZero));
    } catch {
      countUpActive = false;
      if (!initialized) write(START_VALUE);
    } finally {
      setTimeout(() => { running = false; }, 900);
    }
  }

  async function refreshViews() {
    if (countUpActive) return;
    try {
      const next = await getViews('peek');
      if (next > lastGoodValue) animateTo(next, 700, false);
      else if (initialized) write(lastGoodValue);
    } catch {}
  }

  function playMusic() {
    if (!music) return;
    music.muted = false;
    music.volume = Math.max(0, Math.min(1, Number(document.getElementById('volumeSlider')?.value || 72) / 100));
    music.play().catch(() => {});
  }

  function enterSite(event) {
    if (!enterScreen || enterScreen.classList.contains('hidden')) return;
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
    event?.stopPropagation?.();
    enterScreen.classList.add('hidden');
    playMusic();
    currentValue = 0;
    write(0, true);
    setTimeout(() => initViews({ fromZero: true }), 80);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('#enterScreen')) enterSite(event);
  }, true);

  document.addEventListener('keydown', event => {
    if (!enterScreen || enterScreen.classList.contains('hidden')) return;
    if (event.key === 'Enter' || event.key === ' ') enterSite(event);
  }, true);

  window.initLiveViews = (options = {}) => initViews(options);
  write(0, true);
  setInterval(refreshViews, 15000);
})();
