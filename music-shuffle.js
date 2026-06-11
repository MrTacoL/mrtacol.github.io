(() => {
  const audio = document.getElementById('music');
  const songLabel = document.querySelector('.song-label');
  const soundStack = document.querySelector('.sound-stack');
  if (!audio) return;

  const REPO = 'MrTacoL/mrtacol.github.io';
  const AUDIO_EXT = /\.(mp3|ogg|wav|m4a)$/i;
  const fallback = Array.isArray(window.MRTACOSI_PLAYLIST) ? window.MRTACOSI_PLAYLIST : [];
  let playlist = [];
  let queue = [];
  let index = 0;
  let shuffleOn = true;
  let ready = false;

  const css = document.createElement('style');
  css.textContent = `
    .shuffle-row{display:flex;align-items:center;gap:.35rem;margin-top:.35rem;flex-wrap:wrap}
    .shuffle-btn{border:0;border-radius:999px;padding:.34rem .55rem;font-size:.68rem;font-weight:900;color:#fff;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.13);cursor:pointer}
    .shuffle-btn.active{color:#111217;background:linear-gradient(135deg,#65efff,#ff0b72)}
    .shuffle-now{font-size:.66rem;color:rgba(255,255,255,.62);max-width:14rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @media(max-width:650px){.shuffle-row{justify-content:center}.shuffle-now{max-width:11rem}}
  `;
  document.head.appendChild(css);

  const row = document.createElement('div');
  row.className = 'shuffle-row';
  row.innerHTML = `
    <button class="shuffle-btn active" id="shuffleToggle" type="button">Shuffle</button>
    <button class="shuffle-btn" id="nextTrack" type="button">Next</button>
    <span class="shuffle-now" id="shuffleNow">Loading playlist</span>
  `;
  soundStack?.appendChild(row);

  const shuffleButton = row.querySelector('#shuffleToggle');
  const nextButton = row.querySelector('#nextTrack');
  const now = row.querySelector('#shuffleNow');

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

  async function scanPath(path) {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=main`, { cache: 'no-store' });
      if (!res.ok) return [];
      const files = await res.json();
      if (!Array.isArray(files)) return [];
      return files
        .filter((file) => file.type === 'file' && AUDIO_EXT.test(file.name))
        .map((file) => ({ title: cleanTitle(file.name), src: `./${path}/${encodeURIComponent(file.name)}` }));
    } catch {
      return [];
    }
  }

  async function loadPlaylist() {
    const detected = [
      ...(await scanPath('assets/music')),
      ...(await scanPath('assets'))
    ];
    playlist = uniqueTracks([...detected, ...fallback]).filter((track) => AUDIO_EXT.test(track.src));
    if (!playlist.length) playlist = fallback;
    queue = shuffleOn ? shuffle(playlist) : [...playlist];
    index = 0;
    ready = true;
    setTrack(0, false);
  }

  function setTrack(nextIndex, shouldPlay = true) {
    if (!playlist.length) return;
    if (!queue.length) queue = shuffleOn ? shuffle(playlist) : [...playlist];
    index = ((nextIndex % queue.length) + queue.length) % queue.length;
    const track = queue[index];
    audio.loop = false;
    audio.src = track.src;
    audio.load();
    const label = `♪ ${track.title}`;
    if (songLabel) songLabel.textContent = label;
    if (now) now.textContent = track.title;
    const liveSong = document.getElementById('liveSong');
    if (liveSong) liveSong.textContent = track.title;
    if (shouldPlay) {
      audio.muted = false;
      audio.play().catch(() => {});
    }
  }

  function nextTrack() {
    if (!ready) return;
    if (index >= queue.length - 1) {
      queue = shuffleOn ? shuffle(playlist) : [...playlist];
      index = -1;
    }
    setTrack(index + 1, true);
  }

  audio.addEventListener('ended', nextTrack);
  nextButton?.addEventListener('click', nextTrack);
  shuffleButton?.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    shuffleButton.classList.toggle('active', shuffleOn);
    queue = shuffleOn ? shuffle(playlist) : [...playlist];
    index = 0;
  });

  loadPlaylist();
})();
