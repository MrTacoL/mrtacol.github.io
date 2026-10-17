// Record player: playlist, shuffle/repeat, seek, volume, drag (desktop) and the Music Mode toggle.
(() => {
  const audio = document.getElementById('music');
  const soundPanel = document.querySelector('.sound-panel');
  const soundStack = document.querySelector('.sound-stack');
  const volumeSlider = document.getElementById('volumeSlider');
  const songLabel = document.querySelector('.song-label');
  if (!audio || !soundPanel || !soundStack) return;

  const REPO = 'MrTacoL/mrtacol.github.io';
  const AUDIO_EXT = /\.(mp3|ogg|wav|m4a|aac|flac)$/i;
  const POS_KEY = 'musicPlayerPosition';
  const desktop = window.matchMedia('(min-width: 651px)');
  let playlist = [], queue = [], queueIndex = 0, current = null;
  let shuffleOn = true, repeatOn = false, failedInARow = 0, scrubbing = false;

  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const ICON = {
    play: svg('M8 5.14v13.72a1 1 0 0 0 1.52.85l10.86-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z'),
    pause: svg('M7 5h3.5v14H7zM13.5 5H17v14h-3.5z'),
    prev: svg('M6 6h2v12H6zm3.5 6 8.5 6V6z'),
    next: svg('M16 6h2v12h-2zM6 18l8.5-6L6 6z'),
    shuffle: svg('M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z'),
    repeat: svg('M7 7h10v3l4-4-4-4v3H5v6h2V7Zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4Z'),
    volume: svg('M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12Z'),
    close: svg('M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12Z')
  };

  const css = document.createElement('style');
  css.textContent = `
    body .sound-panel{position:fixed;top:3.6rem;left:1rem;right:auto;bottom:auto;z-index:90;width:22rem;min-height:0;padding:0;border:0;border-radius:0;display:block;background:none;box-shadow:none;backdrop-filter:none;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-.5rem);transition:opacity .2s ease,transform .2s ease,visibility .2s}
    body.music-mode-open .sound-panel{opacity:1;visibility:visible;pointer-events:auto;transform:none}
    .sound-panel .sound-toggle,.sound-panel .music-title{display:none!important}.sound-panel .sound-stack{display:block;min-width:0}
    .rp{padding:.9rem;border:1px solid rgba(255,255,255,.12);border-radius:1.25rem;background:linear-gradient(160deg,rgba(26,27,38,.92),rgba(10,11,17,.92));box-shadow:0 1.4rem 3rem rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(18px);color:#fff}
    .rp-head{display:flex;align-items:center;justify-content:space-between;margin:-.15rem 0 .7rem}
    .rp-grip{font-size:.62rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);user-select:none;touch-action:none}
    .rp-head .rp-btn{width:1.8rem;height:1.8rem}
    .rp-deck{display:flex;align-items:center;gap:1rem}
    .rp-turntable{position:relative;flex:none;width:5.75rem;height:5.75rem;padding:.35rem;border-radius:.9rem;background:linear-gradient(145deg,#24252f,#15161d);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 .5rem 1rem rgba(0,0,0,.4)}
    .rp-disc{position:relative;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,transparent 0 33%,rgba(255,255,255,.05) 33.5% 34.5%,transparent 35%),repeating-radial-gradient(circle,#0c0d12 0 1.5px,#17181f 1.5px 3px);box-shadow:0 .25rem .6rem rgba(0,0,0,.6);animation:rpSpin 2.2s linear infinite paused}
    .rp-disc::before{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 30deg,transparent 0 12%,rgba(255,255,255,.07) 15%,transparent 20% 62%,rgba(255,255,255,.05) 65%,transparent 70%)}
    .rp-disc::after{content:"";position:absolute;inset:33%;border-radius:50%;background:radial-gradient(circle,#f4f6fb 0 9%,transparent 10%),linear-gradient(135deg,#65efff,#b793ff 55%,#ff0b72)}
    .rp-arm{position:absolute;top:.3rem;right:.3rem;width:.75rem;height:.75rem;border-radius:50%;background:radial-gradient(circle,#cfd4dd 0 35%,#7c828f 36%);transform-origin:50% 50%;transform:rotate(-30deg);transition:transform .6s cubic-bezier(.3,1.4,.5,1)}
    .rp-arm::before{content:"";position:absolute;top:.35rem;left:.27rem;width:.2rem;height:3.1rem;border-radius:.1rem;background:linear-gradient(#e7eaf0,#9aa1ad);transform-origin:top center;transform:rotate(18deg)}
    .rp.playing .rp-disc{animation-play-state:running}.rp.playing .rp-arm{transform:rotate(0deg)}
    .rp-info{min-width:0;display:grid;gap:.3rem}
    .rp-kicker{font-size:.6rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#65efff}
    .rp-title{font-size:1rem;font-weight:900;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .rp-count{font-size:.72rem;font-weight:700;color:rgba(255,255,255,.5)}
    .rp-seek{display:grid;grid-template-columns:2.4rem 1fr 2.4rem;align-items:center;gap:.5rem;margin-top:.85rem;font-size:.66rem;font-weight:800;color:rgba(255,255,255,.55);font-variant-numeric:tabular-nums}.rp-seek span:last-child{text-align:right}
    .rp input[type=range]{--p:0%;width:100%;height:.3rem;margin:0;appearance:none;-webkit-appearance:none;border-radius:999px;background:linear-gradient(90deg,#65efff,#ff0b72) 0/var(--p) 100% no-repeat,rgba(255,255,255,.14);cursor:pointer}
    .rp input[type=range]::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:.8rem;height:.8rem;border-radius:50%;background:#fff;box-shadow:0 0 .5rem rgba(0,0,0,.5)}
    .rp input[type=range]::-moz-range-thumb{width:.8rem;height:.8rem;border:0;border-radius:50%;background:#fff}
    .rp-controls{display:flex;align-items:center;justify-content:center;gap:.7rem;margin-top:.7rem}
    .rp-btn{display:grid;place-items:center;width:2.3rem;height:2.3rem;padding:0;border:0;border-radius:50%;color:rgba(255,255,255,.85);background:transparent;cursor:pointer;transition:background .15s,color .15s}
    .rp-btn:hover{background:rgba(255,255,255,.09);color:#fff}.rp-btn svg{width:1.2rem;height:1.2rem;fill:currentColor}
    .rp-btn[aria-pressed=true]{color:#65efff}.rp-btn[aria-pressed=false]{color:rgba(255,255,255,.4)}
    .rp-play{width:3.1rem;height:3.1rem;color:#0f1016;background:linear-gradient(135deg,#65efff,#ff0b72);box-shadow:0 .5rem 1.2rem rgba(255,11,114,.3)}.rp-play:hover{color:#0f1016;background:linear-gradient(135deg,#8af3ff,#ff3a8c)}.rp-play svg{width:1.4rem;height:1.4rem}
    .rp-foot{display:grid;grid-template-columns:7.5rem 1fr;align-items:center;gap:.7rem;margin-top:.8rem}
    .rp-vol{display:flex;align-items:center;gap:.4rem;color:rgba(255,255,255,.6)}.rp-vol svg{width:1rem;height:1rem;flex:none;fill:currentColor}.rp-vol #volumeMount{flex:1;display:flex}
    .rp .volume-slider{width:100%!important}
    .rp-picker{width:100%;min-width:0;height:2.1rem;padding:0 .6rem;border:1px solid rgba(255,255,255,.12);border-radius:.7rem;color:#fff;background:rgba(255,255,255,.06);font:inherit;font-size:.76rem;font-weight:700;outline:none;cursor:pointer}.rp-picker option{background:#14151d}
    .rp-btn:focus-visible,.rp-picker:focus-visible,.rp input:focus-visible{outline:2px solid #65efff;outline-offset:2px}
    @media(min-width:651px){.rp-grip{cursor:grab}.rp-dragging .rp-grip{cursor:grabbing}}
    @media(max-width:650px){body .sound-panel{top:auto;bottom:4.4rem;left:50%;width:min(22rem,calc(100vw - 1.5rem));transform:translate(-50%,.5rem)}body.music-mode-open .sound-panel{transform:translate(-50%,0)}}
    @media(prefers-reduced-motion:reduce){.rp-disc{animation:none}.rp-arm{transition:none}}
    .music-page-toggle{position:fixed;left:1rem;bottom:1rem;z-index:95;border:0;border-radius:999px;padding:.72rem 1rem;font-size:.78rem;font-weight:950;color:#101116;background:linear-gradient(135deg,#65efff,#ff0b72);box-shadow:0 .75rem 1.8rem rgba(0,0,0,.4),0 0 1rem rgba(101,239,255,.24);cursor:pointer}
    @media(max-width:650px){.music-page-toggle{left:.75rem;padding:.62rem .8rem;font-size:.7rem}}
    @keyframes rpSpin{to{transform:rotate(360deg)}}
  `;
  document.head.appendChild(css);

  const player = document.createElement('div');
  player.className = 'rp';
  player.innerHTML = `
    <div class="rp-head"><span class="rp-grip" title="Drag to move · double-click to reset">⠿ Record player</span><button class="rp-btn rp-close" type="button" aria-label="Close player">${ICON.close}</button></div>
    <div class="rp-deck">
      <div class="rp-turntable" aria-hidden="true"><div class="rp-disc"></div><span class="rp-arm"></span></div>
      <div class="rp-info"><span class="rp-kicker">Now playing</span><strong class="rp-title" id="musicNowTitle">Loading playlist</strong><span class="rp-count" id="musicCount"></span></div>
    </div>
    <div class="rp-seek"><span id="rpTime">0:00</span><input id="rpSeek" type="range" min="0" max="1000" value="0" aria-label="Seek"><span id="rpDuration">0:00</span></div>
    <div class="rp-controls">
      <button class="rp-btn" id="shuffleToggle" type="button" aria-label="Shuffle" aria-pressed="true">${ICON.shuffle}</button>
      <button class="rp-btn" id="prevTrack" type="button" aria-label="Previous song">${ICON.prev}</button>
      <button class="rp-btn rp-play" id="playPauseTrack" type="button" aria-label="Play">${ICON.play}</button>
      <button class="rp-btn" id="nextTrack" type="button" aria-label="Next song">${ICON.next}</button>
      <button class="rp-btn" id="repeatToggle" type="button" aria-label="Repeat song" aria-pressed="false">${ICON.repeat}</button>
    </div>
    <div class="rp-foot"><span class="rp-vol">${ICON.volume}<span id="volumeMount"></span></span><select class="rp-picker" id="songPicker" aria-label="Choose a song"></select></div>`;
  soundStack.appendChild(player);
  if (volumeSlider) player.querySelector('#volumeMount').appendChild(volumeSlider);

  const $ = (id) => player.querySelector('#' + id);
  const nowTitle = $('musicNowTitle'), count = $('musicCount'), picker = $('songPicker');
  const playPause = $('playPauseTrack'), shuffleButton = $('shuffleToggle'), repeatButton = $('repeatToggle');
  const seek = $('rpSeek'), timeLabel = $('rpTime'), durationLabel = $('rpDuration');

  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const cleanTitle = (name = '') => decodeURIComponent(String(name)).replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Unknown Track';
  const shuffle = (list) => { const copy = [...list]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
  const unique = (tracks) => { const seen = new Set(); return tracks.filter((t) => t?.src && AUDIO_EXT.test(t.src) && !seen.has(t.src) && seen.add(t.src)); };

  function rebuildQueue() {
    queue = shuffleOn ? shuffle(playlist) : [...playlist];
    const at = current ? queue.findIndex((t) => t.src === current.src) : -1;
    queueIndex = at > -1 ? at : 0;
  }

  function updatePicker() {
    picker.innerHTML = '';
    playlist.forEach((t) => { const o = document.createElement('option'); o.value = t.src; o.textContent = t.title; picker.appendChild(o); });
    if (current) picker.value = current.src;
  }

  function updateCount() {
    const n = playlist.findIndex((t) => t.src === current?.src) + 1;
    count.textContent = playlist.length ? `Song ${n} of ${playlist.length}` : 'No songs found';
  }

  function updateButtons() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('playing', playing);
    playPause.innerHTML = playing ? ICON.pause : ICON.play;
    playPause.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    shuffleButton.setAttribute('aria-pressed', String(shuffleOn));
    repeatButton.setAttribute('aria-pressed', String(repeatOn));
  }

  function load(track, play) {
    current = track;
    audio.loop = false;
    audio.src = track.src;
    if (songLabel) songLabel.textContent = `♪ ${track.title}`;
    nowTitle.textContent = track.title;
    picker.value = track.src;
    const live = document.getElementById('liveSong');
    if (live) live.textContent = track.title;
    document.title = `mrtacosi • ${track.title}`;
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: 'mrtacosi radio' });
    updateCount();
    if (play) { audio.muted = false; audio.play().catch(() => {}); }
    updateButtons();
  }

  function step(dir) {
    if (!queue.length) return;
    if (dir > 0 && queueIndex >= queue.length - 1 && shuffleOn) { current = null; rebuildQueue(); queueIndex = -1; }
    queueIndex = (queueIndex + dir + queue.length) % queue.length;
    load(queue[queueIndex], true);
  }
  const next = () => (repeatOn && current ? load(current, true) : step(1));
  const prev = () => (audio.currentTime > 3 ? (audio.currentTime = 0) : step(-1));

  function setPlaylist(tracks) {
    playlist = unique(tracks);
    updatePicker();
    if (!current && playlist.length) { rebuildQueue(); load(queue[0], false); }
    else { rebuildQueue(); updateCount(); }
    if (!playlist.length) nowTitle.textContent = 'No songs found';
  }

  // Start right away from the bundled list so the first click always has a song, then add anything new from the repo.
  setPlaylist(Array.isArray(window.MRTACOSI_PLAYLIST) ? window.MRTACOSI_PLAYLIST : []);
  fetch(`https://api.github.com/repos/${REPO}/contents/assets?ref=main`)
    .then((r) => (r.ok ? r.json() : []))
    .then((files) => {
      if (!Array.isArray(files)) return;
      const found = files.filter((f) => f.type === 'file' && AUDIO_EXT.test(f.name)).map((f) => ({ title: cleanTitle(f.name), src: `./assets/${encodeURIComponent(f.name)}` }));
      if (found.length) setPlaylist([...found, ...playlist]);
    })
    .catch(() => {});

  audio.addEventListener('ended', next);
  audio.addEventListener('error', () => { if (audio.src && ++failedInARow < 5) step(1); });
  audio.addEventListener('playing', () => { failedInARow = 0; });
  ['play', 'pause', 'loadedmetadata'].forEach((e) => audio.addEventListener(e, updateButtons));
  audio.addEventListener('timeupdate', () => {
    durationLabel.textContent = fmt(audio.duration);
    if (scrubbing) return;
    const p = audio.duration ? (audio.currentTime / audio.duration) * 1000 : 0;
    seek.value = p;
    seek.style.setProperty('--p', p / 10 + '%');
    timeLabel.textContent = fmt(audio.currentTime);
  });
  seek.addEventListener('input', () => { scrubbing = true; seek.style.setProperty('--p', seek.value / 10 + '%'); timeLabel.textContent = fmt((seek.value / 1000) * (audio.duration || 0)); });
  seek.addEventListener('change', () => { if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration; scrubbing = false; });

  const syncVolumeFill = () => volumeSlider?.style.setProperty('--p', volumeSlider.value + '%');
  volumeSlider?.addEventListener('input', () => { volumeSlider.style.background = ''; syncVolumeFill(); });
  if (volumeSlider) { volumeSlider.style.background = ''; syncVolumeFill(); }

  playPause.addEventListener('click', () => { if (audio.paused) { audio.muted = false; audio.play().catch(() => {}); } else audio.pause(); });
  $('nextTrack').addEventListener('click', next);
  $('prevTrack').addEventListener('click', prev);
  picker.addEventListener('change', () => { const t = playlist.find((x) => x.src === picker.value); if (t) { load(t, true); rebuildQueue(); } });
  shuffleButton.addEventListener('click', () => { shuffleOn = !shuffleOn; rebuildQueue(); updateButtons(); });
  repeatButton.addEventListener('click', () => { repeatOn = !repeatOn; updateButtons(); });
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', prev);
  }

  // Music Mode toggle
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'music-page-toggle';
  const setOpen = (open) => { document.body.classList.toggle('music-mode-open', open); toggle.textContent = open ? 'Close Music' : 'Music Mode'; toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('music-mode-open')));
  player.querySelector('.rp-close').addEventListener('click', () => setOpen(false));
  document.body.appendChild(toggle);
  setOpen(false);

  // Drag by the header on desktop; double-click the header to put it back.
  const grip = player.querySelector('.rp-grip');
  const place = (left, top) => {
    const maxLeft = window.innerWidth - soundPanel.offsetWidth - 8, maxTop = window.innerHeight - soundPanel.offsetHeight - 8;
    soundPanel.style.left = Math.max(8, Math.min(maxLeft, left)) + 'px';
    soundPanel.style.top = Math.max(8, Math.min(maxTop, top)) + 'px';
  };
  try { const saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); if (saved && desktop.matches) place(saved.left, saved.top); } catch {}
  let drag = null;
  grip.addEventListener('pointerdown', (e) => {
    if (!desktop.matches) return;
    const r = soundPanel.getBoundingClientRect();
    drag = { x: e.clientX - r.left, y: e.clientY - r.top };
    soundPanel.classList.add('rp-dragging');
    grip.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  grip.addEventListener('pointermove', (e) => { if (drag) place(e.clientX - drag.x, e.clientY - drag.y); });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    soundPanel.classList.remove('rp-dragging');
    try { localStorage.setItem(POS_KEY, JSON.stringify({ left: parseFloat(soundPanel.style.left), top: parseFloat(soundPanel.style.top) })); } catch {}
  };
  grip.addEventListener('pointerup', endDrag);
  grip.addEventListener('pointercancel', endDrag);
  grip.addEventListener('dblclick', () => { soundPanel.style.left = soundPanel.style.top = ''; try { localStorage.removeItem(POS_KEY); } catch {} });
  desktop.addEventListener('change', () => { if (!desktop.matches) soundPanel.style.left = soundPanel.style.top = ''; });
})();
