(() => {
  const REPO = 'MrTacoL/mrtacol.github.io';

  const css = document.createElement('style');
  css.textContent = `
    .mt-utterances-card p{margin:.25rem 0 .85rem;color:rgba(255,255,255,.66);font-size:.82rem;line-height:1.35}
    #mtUtterancesMount{min-height:12rem;border-radius:1rem;overflow:hidden;background:rgba(255,255,255,.03)}
    #mtUtterancesMount iframe{border-radius:1rem!important}
  `;
  document.head.appendChild(css);

  function ensureGuestbookModal() {
    let modal = document.getElementById('mt-guestbook');
    if (!modal) {
      modal = document.createElement('section');
      modal.id = 'mt-guestbook';
      modal.className = 'mt-modal mt-hidden';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="mt-card mt-utterances-card">
        <button class="mt-close" data-close-modal type="button">×</button>
        <h3>Guestbook</h3>
        <p>Leave a permanent message. This uses GitHub Issues through Utterances.</p>
        <div id="mtUtterancesMount"></div>
      </div>
    `;
    return modal;
  }

  function loadUtterances() {
    const mount = document.getElementById('mtUtterancesMount');
    if (!mount || mount.dataset.loaded === 'true') return;
    mount.dataset.loaded = 'true';
    mount.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('repo', REPO);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'guestbook');
    script.setAttribute('theme', 'github-dark');
    mount.appendChild(script);
  }

  function openGuestbook() {
    const modal = ensureGuestbookModal();
    modal.classList.remove('mt-hidden');
    loadUtterances();
  }

  function closeModal(target) {
    const modal = target.closest('.mt-modal');
    if (modal) modal.classList.add('mt-hidden');
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-open="guestbook"]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openGuestbook();
  }, true);

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-modal]')) closeModal(event.target);
    if (event.target.classList?.contains('mt-modal')) event.target.classList.add('mt-hidden');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.getElementById('mt-guestbook')?.classList.add('mt-hidden');
  });

  setTimeout(ensureGuestbookModal, 400);
})();
