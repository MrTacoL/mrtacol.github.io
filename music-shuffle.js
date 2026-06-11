(() => {
  const audio = document.getElementById('music');
  const songLabel = document.querySelector('.song-label');
  const soundStack = document.querySelector('.sound-stack');
  if (!audio || !soundStack) return;

  const REPO = 'MrTacoL/mrtacol.github.io';
  const AUDIO_EXT = /\.(mp3|ogg|wav|m4a|aac|flac)$/i;
  const fallback = Array.isArray(window.MRTACOSI_PLAYLIST) ? window.MRTACOSI_PLAYLIST : [];

  let playlist = [];
  let queue = [];
  let queueIndex = 0;
  let currentTrack = null;
  let shuffleOn = true;
  let repeatOn = false;
  let ready = false;

  const css = document.createElement('style');
  css.textContent = `
    .music-console{
      position:relative;
      overflow:hidden;
      width:min(22rem,86vw);
      margin-top:.45rem;
      padding:.62rem;
      border:1px solid rgba(255,255,255,.16);
      border-radius:1.15rem;
      background:rgba(8,9,14,.72);
      box-shadow:0 .85rem 2rem rgba(0,0,0,.34), inset 0 0 0 1px rgba(255,255,255,.05),0 0 1.4rem rgba(101,239,255,.12);
      backdrop-filter:blur(16px) saturate(1.25);
    }
    .music-console::before{
      content:"";
      position:absolute;
      inset:-45%;
      background:conic-gradient(from 90deg,transparent,rgba(101,239,255,.16),transparent,rgba(255,11,114,.14),transparent);
      animation:musicSpin 8s linear infinite;
      pointer-events:none;
    }
    .music-console > *{position:relative;z-index:1}
    .music-topline{display:flex;align-items:center;gap:.55rem;min-width:0}
    .music-disc{
      width:2.1rem;height:2.1rem;border-radius:50%;flex:0 0 auto;
      background:radial-gradient(circle,#fff 0 13%,#0d0e14 14% 25%,#65efff 26% 31%,#22232b 32% 62%,#ff0b72 63% 70%,#111217 71%);
      box-shadow:0 0 .9rem rgba(101,239,255,.36),0 0 1.1rem rgba(255,11,114,.2);
      animation:discSpin 5s linear infinite paused;
    }
    .music-console.playing .music-disc{animation-play-state:running}
    .music-meta{min-width:0;flex:1}
    .music-kicker{display:block;font-size:.56rem;font-weight:950;letter-spacing:.11em;text-transform:uppercase;color:rgba(255,255,255,.5)}
    .music-now-title{display:block;margin-top:.1rem;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.78rem;font-weight:950;color:#fff;text-shadow:0 0 .7rem rgba(255,255,255,.18)}
    .music-controls{display:flex;align-items:center;gap:.35rem;margin-top:.55rem;flex-wrap:wrap}
    .music-control,.music-mode{
      border:0;border-radius:999px;min-width:2.1rem;height:2.1rem;padding:0 .65rem;
      font-weight:950;color:#fff;background:rgba(255,255,255,.1);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 0 .7rem rgba(101,239,255,.08);
      cursor:pointer;
    }
    .music-control.main{min-width:2.45rem;background:linear-gradient(135deg,#65efff,#ff0b72);color:#101116}
    .music-mode.active{background:linear-gradient(135deg,#65efff,#ff0b72);color:#101116}
    .music-picker{
      flex:1;min-width:9rem;height:2.1rem;border:0;border-radius:999px;padding:0 .75rem;
      color:#fff;background:rgba(255,255,255,.09);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);
      font-weight:800;outline:none;
    }
    .music-picker option{background:#101116;color:#fff}
    .music-progress-wrap{margin-top:.55rem;height:.38rem;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12)}
    .music-progress{width:0%;height:100%;border-radius:999px;background:linear-gradient(90deg,#65efff,#fff,#ff0b72);box-shadow:0 0 .9rem rgba(101,239,255,.45)}
    .music-bottom{display:flex;align-items:center;justify-content:space-between;gap:.7rem;margin-top:.38rem;font-size:.6rem;color:rgba(255,255,255,.56);font-weight:800}
    .music-count{white-space:nowrap}.music-source{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @keyframes musicSpin{to{transform:rotate(360deg)}}
    @keyframes discSpin{to{transform:rotate(360deg)}}
    @media(max-width:650px){
      .music-console{width:min(20rem,84vw);margin-left:auto;margin-right:auto;padding:.55rem}
      .music-controls{gap:.3rem}.music-control,.music-mode{height:2rem;min-width:2rem;padding:0 .55rem;font-size:.72rem}.music-picker{min-width:100%;order:8}.music-bottom{font-size:.56rem}
    }
  `;
  document.head.appendChild(css);

  const panel = document.createElement('div');
  panel.className = 'music-console';
  panel.innerHTML = `
    <div class="music-topline">
      <span class="music-disc" aria-hidden="true"></span>
      <span class="music-meta">
        <span class="music-kicker">Now Playing</span>
        <span class="music-now-title" id="musicNowTitle">Loading playlist</span>
      </span>
    </div>
    <div class="music-controls">
      <button class="music-control" id="prevTrack" type="button" title="Previous">⟵</button>
      <button class="music-control main" id="playPauseTrack" type="button" title="Play/Pause">▶</button>
      <button class="music-control" id="nextTrack" type="button" title="Next">⟶</button>
      <button class="music-mode active" id="shuffleToggle" type="button" title="Shuffle">Shuffle</button>
      <button class="music-mode" id="repeatToggle" type="button" title="Repeat one">Repeat</button>
      <select class="music-picker" id="songPicker" title="Pick a song"><option>Loading songs...</option></select>
    </div>
    <div class="music-progress-wrap"><div class="music-progress" id="musicProgress"></div></div>
    <div class="music-bottom"><span class="music-count" id="musicCount">0 songs</span><span class="music-source" id="musicSource">Drop songs in assets/music</span></div>
  `;
  soundStack.appendChild(panel);

  const nowTitle = panel.querySelector('#musicNowTitle');
  const picker = panel.querySelector('#songPicker');
  const prevButton = panel.querySelector('#prevTrack');
  const playPause = panel.querySelector('#playPauseTrack');
  const nextButton = panel.querySelector('#nextTrack');
  const shuffleButton = panel.querySelector('#shuffleToggle');
  const repeatButton = panel.querySelector('#repeatToggle');
  const progress = panel.querySelector('#musicProgress');
  const count = panel.querySelector('#musicCount');
  const source = panel.querySelector('#musicSource');

  function cleanTitle(name = '') {
    return decodeURIComponent(String(name))
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Unknown Track';
  }

  function uniqueTracks(tracks) {
    const seen = new Set();
    return tracks.filter((track) => {
      const src = track?.src;
      if (!src || seen.has(src)) return false;
      seen.add(src);
      return true;
    });
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function encodedPath(path, fileName) {
    return `./${path}/${encodeURIComponent(fileName).replace(/%2F/g, '/')}`;
  }

  async function scanPath(path) {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=main&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return [];
      const files = await res.json();
      if (!Array.isArray(files)) return [];
      return files
        .filter((file) => file.type === 'file' && AUDIO_EXT.test(file.name))
        .map((file) => ({ title: cleanTitle(file.name), src: encodedPath(path, file.name), folder: path }));
    } catch {
      return [];
    }
  }

  function rebuildQueue(keepCurrent = true) {
    const oldSrc = currentTrack?.src;
    queue = shuffleOn ? shuffle(playlist) : [...playlist];
    if (keepCurrent && oldSrc) {
      const found = queue.findIndex((track) => track.src === oldSrc);
      if (found > -1) queueIndex = found;
    } else {
      queueIndex = 0;
    }
  }

  function updatePicker() {
    picker.innerHTML = '';
    playlist.forEach((track, i) => {
      const option = document.createElement('option');
      option.value = track.src;
      option.textContent = track.title;
      picker.appendChild(option);
    });
    count.textContent = `${playlist.length} song${playlist.length === 1 ? '' : 's'}`;
    source.textContent = playlist.some((track) => track.folder === 'assets/music') ? 'Auto-loaded from assets/music' : 'Auto-loaded playlist';
  }

  function setLabels(track) {
    const label = `♪ ${track.title}`;
    if (songLabel) songLabel.textContent = label;
    nowTitle.textContent = track.title;
    picker.value = track.src;
    const liveSong = document.getElementById('liveSong');
    if (liveSong) liveSong.textContent = track.title;
    document.title = `mrtacosi • ${track.title}`;
  }

  function setTrackByQueue(nextIndex, shouldPlay = true) {
    if (!playlist.length) return;
    if (!queue.length) rebuildQueue(false);
    queueIndex = ((nextIndex % queue.length) + queue.length) % queue.length;
    currentTrack = queue[queueIndex];
    audio.loop = false;
    audio.src = currentTrack.src;
    audio.load();
    setLabels(currentTrack);
    if (shouldPlay) {
      audio.muted = false;
      audio.play().catch(() => {});
    }
    updateButtons();
  }

  function setTrackBySrc(src, shouldPlay = true) {
    const track = playlist.find((item) => item.src === src);
    if (!track) return;
    currentTrack = track;
    rebuildQueue(true);
    const q = queue.findIndex((item) => item.src === src);
    queueIndex = q > -1 ? q : 0;
    audio.loop = false;
    audio.src = track.src;
    audio.load();
    setLabels(track);
    if (shouldPlay) {
      audio.muted = false;
      audio.play().catch(() => {});
    }
    updateButtons();
  }

  function nextTrack() {
    if (!ready) return;
    if (repeatOn && currentTrack) return setTrackBySrc(currentTrack.src, true);
    if (queueIndex >= queue.length - 1) rebuildQueue(false);
    setTrackByQueue(queueIndex + 1, true);
  }

  function prevTrack() {
    if (!ready) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setTrackByQueue(queueIndex - 1, true);
  }

  function updateButtons() {
    panel.classList.toggle('playing', !audio.paused && !audio.ended);
    playPause.textContent = audio.paused ? '▶' : 'Ⅱ';
    shuffleButton.classList.toggle('active', shuffleOn);
    repeatButton.classList.toggle('active', repeatOn);
  }

  function updateProgress() {
    const pct = audio.duration ? Math.min(100, (audio.currentTime / audio.duration) * 100) : 0;
    progress.style.width = `${pct}%`;
    requestAnimationFrame(updateProgress);
  }

  async function loadPlaylist() {
    const detected = [
      ...(await scanPath('assets/music')),
      ...(await scanPath('assets'))
    ];
    playlist = uniqueTracks([...detected, ...fallback]).filter((track) => AUDIO_EXT.test(track.src));
    if (!playlist.length) playlist = fallback;
    if (!playlist.length) {
      nowTitle.textContent = 'No songs found';
      count.textContent = '0 songs';
      source.textContent = 'Add songs to assets/music';
      return;
    }
    ready = true;
    updatePicker();
    rebuildQueue(false);
    setTrackByQueue(0, false);
  }

  audio.addEventListener('ended', nextTrack);
  audio.addEventListener('play', updateButtons);
  audio.addEventListener('pause', updateButtons);
  audio.addEventListener('loadedmetadata', updateButtons);
  nextButton.addEventListener('click', nextTrack);
  prevButton.addEventListener('click', prevTrack);
  playPause.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    updateButtons();
  });
  picker.addEventListener('change', () => setTrackBySrc(picker.value, true));
  shuffleButton.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    rebuildQueue(true);
    updateButtons();
  });
  repeatButton.addEventListener('click', () => {
    repeatOn = !repeatOn;
    updateButtons();
  });

  loadPlaylist();
  updateProgress();
})();
