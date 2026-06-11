(() => {
  const css = `
    .live-widgets{
      width:min(52rem,92vw);
      margin:1rem auto 0;
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:.65rem;
    }
    .live-widget{
      position:relative;
      overflow:hidden;
      padding:.85rem .9rem;
      border:1px solid rgba(255,255,255,.16);
      border-radius:1.1rem;
      background:rgba(13,14,20,.58);
      box-shadow:0 .9rem 2rem rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.05);
      backdrop-filter:blur(14px) saturate(1.2);
      text-align:left;
    }
    .live-widget::before{
      content:"";
      position:absolute;
      inset:-40%;
      background:radial-gradient(circle at 30% 20%,rgba(101,239,255,.18),transparent 38%),radial-gradient(circle at 75% 70%,rgba(255,11,114,.16),transparent 35%);
      animation:widgetGlow 7s linear infinite;
      pointer-events:none;
    }
    .live-widget small,.live-widget strong,.live-widget span{position:relative;z-index:1;display:block;}
    .live-widget small{font-size:.67rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);}
    .live-widget strong{margin-top:.25rem;font-size:.95rem;color:#fff;}
    .live-widget span{margin-top:.18rem;font-size:.72rem;color:rgba(255,255,255,.68);line-height:1.25;}
    .live-dot{display:inline-block;width:.55rem;height:.55rem;border-radius:50%;margin-right:.35rem;background:#888;box-shadow:0 0 .65rem currentColor;vertical-align:.02rem;}
    .live-dot.online{background:#43ff8f;color:#43ff8f}.live-dot.idle{background:#ffd166;color:#ffd166}.live-dot.dnd{background:#ff4d6d;color:#ff4d6d}.live-dot.offline{background:#888;color:#888}
    .contact-button{position:relative;overflow:hidden;}
    .contact-button::after{content:"";position:absolute;inset:-80%;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.34),transparent 65%);transform:translateX(-70%);animation:shineMove 3.7s ease-in-out infinite;}
    .commission-modal{position:fixed;inset:0;z-index:2100;display:none;align-items:center;justify-content:center;padding:1.25rem;}
    .commission-modal.active{display:flex;}
    .commission-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(8px);}
    .commission-card{position:relative;width:min(35rem,94vw);border:1px solid rgba(255,255,255,.18);border-radius:1.5rem;background:rgba(14,15,22,.94);box-shadow:0 2rem 5rem rgba(0,0,0,.65),0 0 2.5rem rgba(101,239,255,.18);padding:1.25rem;color:#fff;}
    .commission-card h2{margin:0 0 .45rem;font-size:1.45rem;}
    .commission-card p{margin:.35rem 0;color:rgba(255,255,255,.72);line-height:1.35;}
    .commission-tags{display:flex;flex-wrap:wrap;gap:.45rem;margin:1rem 0;}
    .commission-tags span{padding:.38rem .55rem;border-radius:999px;background:rgba(255,255,255,.1);font-weight:800;font-size:.75rem;}
    .commission-actions{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem;}
    .commission-actions a,.commission-actions button{border:0;border-radius:999px;padding:.7rem .95rem;font-weight:900;text-decoration:none;color:#0f1016;background:linear-gradient(135deg,#65efff,#ff0b72);cursor:pointer;}
    .commission-actions button{background:rgba(255,255,255,.12);color:#fff;}
    .cursor-glow{position:fixed;width:18rem;height:18rem;border-radius:50%;pointer-events:none;z-index:1750;opacity:.36;mix-blend-mode:screen;background:radial-gradient(circle,rgba(101,239,255,.28),rgba(255,11,114,.13) 42%,transparent 70%);transform:translate(-50%,-50%);transition:opacity .2s ease;}
    .click-particle{position:fixed;z-index:2200;width:.45rem;height:.45rem;border-radius:50%;pointer-events:none;background:var(--p);box-shadow:0 0 .9rem var(--p);animation:particlePop .7s ease-out forwards;}
    .lightning-flash{position:fixed;inset:0;z-index:1700;pointer-events:none;opacity:0;background:linear-gradient(120deg,transparent 0 45%,rgba(255,255,255,.8) 49%,transparent 53%),radial-gradient(circle at 70% 18%,rgba(101,239,255,.28),transparent 32%);}
    .lightning-flash.flash{animation:lightFlash .38s ease-out;}
    .draw-presets{display:flex;gap:.3rem;align-items:center;}
    .draw-preset{width:1.55rem!important;height:1.55rem!important;min-width:1.55rem!important;border-radius:50%!important;padding:0!important;border:1px solid rgba(255,255,255,.35)!important;background:var(--c)!important;box-shadow:0 0 .75rem var(--c)!important;}
    @keyframes widgetGlow{to{transform:rotate(360deg)}}
    @keyframes shineMove{50%{transform:translateX(70%)}}
    @keyframes particlePop{to{transform:translate(var(--x),var(--y)) scale(.15);opacity:0}}
    @keyframes lightFlash{0%,100%{opacity:0}18%{opacity:.95}38%{opacity:.18}52%{opacity:.72}}
    @media(max-width:800px){.live-widgets{grid-template-columns:repeat(2,minmax(0,1fr));}.cursor-glow{display:none}}
    @media(max-width:520px){.live-widgets{grid-template-columns:1fr}.live-widget{padding:.75rem}.commission-card{padding:1rem}}
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const profile = document.querySelector('.profile');
  const activityCard = document.getElementById('activityCard');
  if (profile && !document.querySelector('.live-widgets')) {
    const panel = document.createElement('section');
    panel.className = 'live-widgets';
    panel.innerHTML = `
      <article class="live-widget"><small>Discord</small><strong id="liveDiscord"><span class="live-dot offline"></span>Checking</strong><span id="liveDiscordSub">Live presence</span></article>
      <article class="live-widget"><small>Song</small><strong id="liveSong">PLAZA - Personal</strong><span>Current site track</span></article>
      <article class="live-widget"><small>Working On</small><strong>Larix KitPvP</strong><span>Crates, PvP, vaults, gens, UI, economy</span></article>
      <article class="live-widget"><small>GitHub Update</small><strong id="liveGithub">Checking</strong><span id="liveGithubSub">Latest commit</span></article>
    `;
    (activityCard || profile.firstElementChild).insertAdjacentElement('afterend', panel);
  }

  const actionRow = document.querySelector('.action-row');
  if (actionRow && !document.getElementById('commissionButton')) {
    const btn = document.createElement('button');
    btn.id = 'commissionButton';
    btn.className = 'project-button contact-button';
    btn.type = 'button';
    btn.textContent = 'Hire Me / Commission Me';
    actionRow.insertBefore(btn, actionRow.firstChild.nextSibling);
  }

  if (!document.querySelector('.commission-modal')) {
    const modal = document.createElement('section');
    modal.className = 'commission-modal';
    modal.innerHTML = `
      <div class="commission-backdrop" data-close-commission></div>
      <div class="commission-card">
        <h2>Hire Me / Commission Me</h2>
        <p>I build Minecraft server systems, Bedrock addons, Java server setups, GUI work, crates, kits, shops, scoreboards, websites, branding, and custom server features.</p>
        <div class="commission-tags">
          <span>KitPvP</span><span>Bedrock Scripts</span><span>Java Servers</span><span>Crates</span><span>Vaults</span><span>Gens</span><span>GUI</span><span>Websites</span>
        </div>
        <p><strong>Best way to contact:</strong> Discord @mrtacosi</p>
        <div class="commission-actions">
          <a href="https://discord.com/users/828806896089038879" target="_blank" rel="noreferrer">Open Discord</a>
          <button type="button" id="copyCommissionDiscord">Copy Discord</button>
          <button type="button" data-close-commission>Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const commissionModal = document.querySelector('.commission-modal');
  const commissionButton = document.getElementById('commissionButton');
  const copyCommission = document.getElementById('copyCommissionDiscord');
  commissionButton?.addEventListener('click', () => commissionModal.classList.add('active'));
  document.querySelectorAll('[data-close-commission]').forEach((el) => el.addEventListener('click', () => commissionModal.classList.remove('active')));
  copyCommission?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('mrtacosi'); copyCommission.textContent = 'Copied'; setTimeout(() => copyCommission.textContent = 'Copy Discord', 900); } catch {}
  });

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive:true });

  document.addEventListener('click', (event) => {
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('span');
      p.className = 'click-particle';
      p.style.left = `${event.clientX}px`;
      p.style.top = `${event.clientY}px`;
      p.style.setProperty('--p', i % 2 ? '#ff0b72' : '#65efff');
      p.style.setProperty('--x', `${(Math.random() - .5) * 120}px`);
      p.style.setProperty('--y', `${(Math.random() - .5) * 120}px`);
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  });

  const flash = document.createElement('div');
  flash.className = 'lightning-flash';
  document.body.appendChild(flash);
  setInterval(() => {
    if (document.hidden || Math.random() > .32) return;
    flash.classList.remove('flash');
    void flash.offsetWidth;
    flash.classList.add('flash');
  }, 9000);

  async function updateDiscord() {
    const title = document.getElementById('liveDiscord');
    const sub = document.getElementById('liveDiscordSub');
    if (!title || !sub) return;
    try {
      const res = await fetch('https://api.lanyard.rest/v1/users/828806896089038879', { cache:'no-store' });
      const json = await res.json();
      const status = json?.data?.discord_status || 'offline';
      const nice = status === 'dnd' ? 'Do Not Disturb' : status.charAt(0).toUpperCase() + status.slice(1);
      title.innerHTML = `<span class="live-dot ${status}"></span>${nice}`;
      sub.textContent = json?.data?.activities?.[0]?.name ? json.data.activities[0].name : 'Live presence';
    } catch {
      title.innerHTML = '<span class="live-dot offline"></span>Unknown';
      sub.textContent = 'Status unavailable';
    }
  }

  async function updateGithub() {
    const title = document.getElementById('liveGithub');
    const sub = document.getElementById('liveGithubSub');
    if (!title || !sub) return;
    try {
      const res = await fetch('https://api.github.com/repos/MrTacoL/mrtacol.github.io/commits?per_page=1', { cache:'no-store' });
      const [commit] = await res.json();
      title.textContent = commit?.commit?.message?.split('\n')[0] || 'Updated site';
      const date = commit?.commit?.committer?.date ? new Date(commit.commit.committer.date).toLocaleDateString() : 'Latest commit';
      sub.textContent = date;
    } catch {
      title.textContent = 'Website updates';
      sub.textContent = 'Latest commit';
    }
  }

  function enhanceDrawTools() {
    const tools = document.querySelector('.draw-tools');
    const color = document.querySelector('.draw-color');
    const clear = document.querySelector('.draw-clear');
    if (!tools || !color || tools.querySelector('.draw-presets')) return;
    const presets = document.createElement('div');
    presets.className = 'draw-presets';
    ['#65efff','#ff0b72','#ffffff','#8fff65','#b793ff'].forEach((value) => {
      const b = document.createElement('button');
      b.className = 'draw-preset';
      b.type = 'button';
      b.style.setProperty('--c', value);
      b.title = value;
      b.addEventListener('click', () => color.value = value);
      presets.appendChild(b);
    });
    tools.insertBefore(presets, color.nextSibling);
    clear?.addEventListener('click', () => {
      document.body.animate([{ filter:'brightness(1.6)' }, { filter:'brightness(1)' }], { duration:260, easing:'ease-out' });
    });
  }

  updateDiscord();
  updateGithub();
  setInterval(updateDiscord, 30000);
  setInterval(updateGithub, 120000);
  enhanceDrawTools();
  setTimeout(enhanceDrawTools, 800);
})();
