(() => {
  const viewCount = document.getElementById('viewCount');
  if (!viewCount) return;

  const BASE_VIEWS = 100212;
  const namespace = 'mrtacosi-profile-v2-100212';
  const key = 'views';
  const seenKey = 'mrtacosi:views:v2:seen';
  const localKey = 'mrtacosi:views:v2:local';

  const formatter = new Intl.NumberFormat('en-US');

  function setViews(extra = 0) {
    const safeExtra = Math.max(0, Number(extra || 0));
    viewCount.textContent = formatter.format(BASE_VIEWS + safeExtra);
  }

  function localFallback() {
    let localViews = Number(localStorage.getItem(localKey) || '0');
    if (sessionStorage.getItem(seenKey) !== '1') {
      localViews += 1;
      localStorage.setItem(localKey, String(localViews));
      sessionStorage.setItem(seenKey, '1');
    }
    setViews(Math.max(0, localViews - 1));
  }

  async function updateViews() {
    const firstThisSession = sessionStorage.getItem(seenKey) !== '1';
    const action = firstThisSession ? 'hit' : 'get';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);

    try {
      const res = await fetch(`https://api.countapi.xyz/${action}/${namespace}/${key}`, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (typeof data.value !== 'number') throw new Error('bad count');
      sessionStorage.setItem(seenKey, '1');
      localStorage.setItem(localKey, String(data.value));
      setViews(Math.max(0, data.value - 1));
    } catch {
      clearTimeout(timeout);
      localFallback();
    }
  }

  setViews(0);
  updateViews();
  setInterval(updateViews, 15000);
})();
