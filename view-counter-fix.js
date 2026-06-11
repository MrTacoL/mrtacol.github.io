(() => {
  const viewCount = document.getElementById('viewCount');
  const enterScreen = document.getElementById('enterScreen');
  const enterButton = document.getElementById('enterButton');

  if (!viewCount) return;

  const BASE_VIEWS = 10472918;
  const seenKey = 'mrtacosi:view-seen-animate-v1';
  const extraKey = 'mrtacosi:view-extra-animate-v1';
  const formatter = new Intl.NumberFormat('en-US');
  let started = false;

  function getTargetViews() {
    let extra = Number(localStorage.getItem(extraKey) || '0');
    if (sessionStorage.getItem(seenKey) !== '1') {
      extra += 1;
      sessionStorage.setItem(seenKey, '1');
      localStorage.setItem(extraKey, String(extra));
    }
    return BASE_VIEWS + Math.max(0, extra - 1);
  }

  function animateViews() {
    if (started) return;
    started = true;

    const target = getTargetViews();
    const duration = 2200;
    const startTime = performance.now();
    viewCount.textContent = '0';

    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      viewCount.textContent = formatter.format(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else viewCount.textContent = formatter.format(target);
    }

    requestAnimationFrame(tick);
  }

  viewCount.textContent = '0';

  enterButton?.addEventListener('click', () => setTimeout(animateViews, 180));
  enterScreen?.addEventListener('click', () => setTimeout(animateViews, 180));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') setTimeout(animateViews, 180);
  });

  if (enterScreen?.classList.contains('hidden')) {
    animateViews();
  }
})();
