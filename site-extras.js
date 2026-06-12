(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const audio = $('#music');
  const body = document.body;

  const state = {
    theme: localStorage.getItem('mtTheme') || 'neon-pink',
    bg: localStorage.getItem('mtBg') || 'car',
    nameClicks: 0,
    mood: JSON.parse(localStorage.getItem('mtMood') || 'null') || {
      mood: 'locked in',
      focus: 'building',
      availability: 'chilling'
    }
  };

  function toast(text) {
    const old = $('.mt-toast');
    old?.remove();
    const el = document.createElement('div');
    el.className = 'mt-toast';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function applyTheme(theme) {
    state.theme = theme;
    body.dataset.theme = theme;
    localStorage.setItem('mtTheme', theme);
  }

  function applyBg(bg) {
    state.bg = bg;
    body.dataset.bg = bg;
    localStorage.setItem('mtBg', bg);
    const car = $('.car');
    const canvas = $('#weatherCanvas');
    if (canvas) canvas.style.display = bg === 'lite' ? 'none' : '';
    if (car) {
      car.style.display = ['static', 'neon', 'lite'].includes(bg) ? 'none' : '';
      car.style.opacity = bg === 'rain' ? '.72' : '';
      car.style.pointerEvents = 'auto';
    }
    toast(`Background: ${bg}`);
  }

  applyTheme(state.theme);
  applyBg(state.bg);

  const dock = document.createElement('div');
  dock.className = 'mt-tool-dock';
  dock.innerHTML = `
    <button type="button" data-open="theme">Theme</button>
    <button type="button" data-open="console">Console</button>
    <button type="button" data-open="music">Music</button>
    <button type="button" data-open="guestbook">Guestbook</button>
    <button type="button" data-open="background">BG</button>
    <button type="button" data-open="badges">Badges</button>
  `;
  document.body.appendChild(dock);

  const clock = document.createElement('div');
  clock.className = 'mt-clock';
  clock.innerHTML = `<span>mrtacosi local time</span> • <strong id="mtClockTime">--:--</strong>`;
  document.body.appendChild(clock);
  function updateClock() {
    const time = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', hour: 'numeric', minute: '2-digit' }).format(new Date());
    $('#mtClockTime').textContent = time;
  }
  updateClock();
  setInterval(updateClock, 1000);

  function panel(id, title, html) {
    const el = document.createElement('section');
    el.id = `mt-${id}`;
    el.className = 'mt-panel mt-hidden';
    el.innerHTML = `<h3>${title}</h3>${html}`;
    document.body.appendChild(el);
    return el;
  }

  const themePanel = panel('theme', 'Theme Switcher', `<div class="mt-panel-grid">
    <button data-theme-pick="neon-pink">Neon Pink</button><button data-theme-pick="ice-blue">Ice Blue</button>
    <button data-theme-pick="red-black">Red/Black</button><button data-theme-pick="purple-cyber">Purple Cyber</button>
    <button data-theme-pick="clean-dark">Clean Dark</button>
  </div>`);

  const bgPanel = panel('background', 'Background Controls', `<div class="mt-panel-grid">
    <button data-bg-pick="car">Car Drift</button><button data-bg-pick="rain">Rain</button>
    <button data-bg-pick="static">Static Grid</button><button data-bg-pick="neon">Black Neon</button>
    <button data-bg-pick="lite">No Video</button>
  </div>`);

  const badgePanel = panel('badges', 'Achievement Badges', `<div class="mt-badges">
    <span>Night Coder</span><span>Server Builder</span><span>Bug Slayer</span><span>UI Tweaker</span><span>Music Mode Enjoyer</span><span>Systems Builder</span>
  </div>`);

  const consoleModal = document.createElement('section');
  consoleModal.id = 'mt-console';
  consoleModal.className = 'mt-modal mt-hidden';
  consoleModal.innerHTML = `<div class="mt-card"><button class="mt-close" data-close-modal type="button">×</button><h3>Dev Console</h3><div class="mt-console-lines" id="mtConsoleLines"></div></div>`;
  document.body.appendChild(consoleModal);

  const musicModal = document.createElement('section');
  musicModal.id = 'mt-music';
  musicModal.className = 'mt-modal mt-hidden';
  musicModal.innerHTML = `<div class="mt-card"><button class="mt-close" data-close-modal type="button">×</button><h3>Music Mode</h3><div class="mt-music-head"><div class="mt-music-cover" id="mtMusicCover"></div><div><div class="mt-music-title" id="mtMusicTitle">Loading current song</div><small>currently playing</small></div></div><div class="mt-visualizer" id="mtVisualizer">${'<span></span>'.repeat(20)}</div><div class="mt-progress"><span id="mtMusicProgress"></span></div><div class="mt-music-actions"><button id="mtPrev" type="button">Prev</button><button id="mtPlay" type="button">Play/Pause</button><button id="mtNext" type="button">Next</button><button id="mtSync" type="button">Refresh Playlist</button></div><div class="mt-track-list" id="mtTrackList"></div></div>`;
  document.body.appendChild(musicModal);

  const guestModal = document.createElement('section');
  guestModal.id = 'mt-guestbook';
  guestModal.className = 'mt-modal mt-hidden';
  guestModal.innerHTML = `<div class="mt-card"><button class="mt-close" data-close-modal type="button">×</button><h3>Guestbook</h3><div class="mt-guest-list" id="mtGuestList"></div><form class="mt-guest-form" id="mtGuestForm"><input maxlength="80" placeholder="leave a message" /><button type="submit">Post</button></form><small>Saved on this browser for now.</small></div>`;
  document.body.appendChild(guestModal);

  function closeAllPanels() {
    $$('.mt-panel').forEach(p => p.classList.add('mt-hidden'));
  }

  dock.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-open]');
    if (!btn) return;
    const target = btn.dataset.open;
    if (['theme', 'background', 'badges'].includes(target)) {
      const p = $(`#mt-${target}`);
      const hidden = p.classList.contains('mt-hidden');
      closeAllPanels();
      p.classList.toggle('mt-hidden', !hidden);
      return;
    }
    if (target === 'console') openConsole();
    if (target === 'music') openMusicMode();
    if (target === 'guestbook') openGuestbook();
  });

  themePanel.addEventListener('click', e => {
    const b = e.target.closest('[data-theme-pick]');
    if (!b) return;
    applyTheme(b.dataset.themePick);
    toast(`Theme: ${b.textContent}`);
  });

  bgPanel.addEventListener('click', e => {
    const b = e.target.closest('[data-bg-pick]');
    if (!b) return;
    applyBg(b.dataset.bgPick);
  });

  document.addEventListener('click', e => {
    if (e.target.closest('[data-close-modal]')) e.target.closest('.mt-modal').classList.add('mt-hidden');
    if (e.target.classList?.contains('mt-modal')) e.target.classList.add('mt-hidden');
  });

  function openConsole() {
    consoleModal.classList.remove('mt-hidden');
    const lines = [
      '> loading mrtacosi profile...',
      '> checking Discord...',
      '> scanning projects...',
      '> syncing music player...',
      '> applying theme engine...',
      '> status: online'
    ];
    const box = $('#mtConsoleLines');
    box.innerHTML = '';
    lines.forEach((line, i) => setTimeout(() => {
      const span = document.createElement('span');
      span.textContent = line;
      box.appendChild(span);
    }, i * 260));
  }

  function getCurrentSongTitle() {
    return $('.song-label')?.textContent?.replace(/^♪\s*/, '').trim() || document.title.replace('mrtacosi • ', '') || 'Current song';
  }

  function syncTrackList() {
    const list = $('#mtTrackList');
    list.innerHTML = '';
    const options = $$('#songPicker option').filter(o => o.value);
    if (!options.length) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = getCurrentSongTitle();
      list.appendChild(b);
      return;
    }
    options.slice(0, 80).forEach((option) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = option.textContent;
      b.addEventListener('click', () => {
        const picker = $('#songPicker');
        if (picker) {
          picker.value = option.value;
          picker.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      list.appendChild(b);
    });
  }

  function updateMusicMode() {
    const title = getCurrentSongTitle();
    $('#mtMusicTitle').textContent = title;
    const isPlaying = audio && !audio.paused;
    $('#mtMusicCover').classList.toggle('playing', isPlaying);
    $('#mtVisualizer').classList.toggle('playing', isPlaying);
    const progress = $('#mtMusicProgress');
    if (audio && audio.duration) progress.style.width = `${Math.min(100, (audio.currentTime / audio.duration) * 100)}%`;
    requestAnimationFrame(updateMusicMode);
  }
  updateMusicMode();

  function openMusicMode() {
    musicModal.classList.remove('mt-hidden');
    syncTrackList();
  }

  $('#mtPrev').addEventListener('click', () => $('#prevTrack')?.click());
  $('#mtPlay').addEventListener('click', () => $('#playPauseTrack')?.click() || (audio?.paused ? audio.play().catch(() => {}) : audio?.pause()));
  $('#mtNext').addEventListener('click', () => $('#nextTrack')?.click());
  $('#mtSync').addEventListener('click', () => { syncTrackList(); toast('Playlist refreshed'); });

  function getGuestMessages() {
    return JSON.parse(localStorage.getItem('mtGuestbook') || 'null') || ['yo nice site', 'fire dev', 'larix on top'];
  }
  function renderGuestbook() {
    const list = $('#mtGuestList');
    list.innerHTML = '';
    getGuestMessages().slice(-12).reverse().forEach(msg => {
      const row = document.createElement('div');
      row.textContent = msg;
      list.appendChild(row);
    });
  }
  function openGuestbook() {
    renderGuestbook();
    guestModal.classList.remove('mt-hidden');
  }
  $('#mtGuestForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    const messages = getGuestMessages();
    messages.push(text);
    localStorage.setItem('mtGuestbook', JSON.stringify(messages.slice(-30)));
    input.value = '';
    renderGuestbook();
  });

  function setupMoodCard() {
    const profile = $('.profile');
    if (!profile || $('#mtMoodCard')) return;
    const card = document.createElement('div');
    card.id = 'mtMoodCard';
    card.className = 'mt-mood-card';
    card.innerHTML = `<span><strong>Mood</strong><em id="mtMoodText"></em></span><span><strong>Current focus</strong><em id="mtFocusText"></em></span><span><strong>Availability</strong><em id="mtAvailText"></em></span>`;
    const widgets = $('.live-widgets');
    (widgets || profile).insertAdjacentElement('afterend', card);
    updateMoodCard();
  }
  function updateMoodCard() {
    $('#mtMoodText') && ($('#mtMoodText').textContent = state.mood.mood);
    $('#mtFocusText') && ($('#mtFocusText').textContent = state.mood.focus);
    $('#mtAvailText') && ($('#mtAvailText').textContent = state.mood.availability);
  }
  setupMoodCard();
  setTimeout(setupMoodCard, 800);

  const name = $('#profileName');
  name?.addEventListener('click', () => {
    state.nameClicks += 1;
    if (state.nameClicks >= 5) {
      state.nameClicks = 0;
      body.classList.add('mt-mega-glitch');
      toast('mega glitch unlocked');
      setTimeout(() => body.classList.remove('mt-mega-glitch'), 2600);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    const key = e.key.toLowerCase();
    if (key === 'l') {
      applyTheme('red-black');
      body.classList.toggle('larix-mode');
      toast('Larix mode');
    }
    if (key === 'm') openMusicMode();
  });

  const flash = document.createElement('div');
  flash.className = 'mt-flash';
  document.body.appendChild(flash);

  function driftBlip() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + .22);
      gain.gain.setValueAtTime(.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .03);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .25);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + .28);
    } catch {}
  }

  $('.car')?.addEventListener('click', () => {
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');
    driftBlip();
    toast('headlights flashed');
  });
})();
