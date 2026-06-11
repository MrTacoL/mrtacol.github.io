const config = window.MRTACOSI_CONFIG || {};
const canvas = document.getElementById('weatherCanvas');
const ctx = canvas.getContext('2d');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
const volumeSlider = document.getElementById('volumeSlider');
const music = document.getElementById('music');
const profileName = document.getElementById('profileName');
const discordName = document.getElementById('discordName');
const activityLine = document.getElementById('activityLine');
const activitySubline = document.getElementById('activitySubline');
const avatar = document.getElementById('avatar');
const statusDot = document.getElementById('statusDot');
const activityIcon = document.getElementById('activityIcon');
const discordProfileLink = document.getElementById('discordProfileLink');
const connectDiscord = document.getElementById('connectDiscord');

const ICONS = {
  volumeHigh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4.04v8.08A4.5 4.5 0 0 0 16.5 12Zm-2.5-8.5v2.08A7.5 7.5 0 0 1 18.5 12 7.5 7.5 0 0 1 14 18.42v2.08A9.5 9.5 0 0 0 20.5 12 9.5 9.5 0 0 0 14 3.5Z"/></svg>',
  volumeLow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm13 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12Z"/></svg>',
  volumeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm14.7 3 2.15-2.15-1.4-1.42-2.16 2.16-2.15-2.16-1.41 1.42L15.88 12l-2.15 2.15 1.41 1.42 2.15-2.16 2.16 2.16 1.4-1.42L17.71 12Z"/></svg>',
  keyboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17h-11A2.5 2.5 0 0 1 4 14.5v-8ZM6.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-11ZM7 8h2v2H7V8Zm3 0h2v2h-2V8Zm3 0h2v2h-2V8Zm3 0h1v2h-1V8ZM7 11h1v2H7v-2Zm2 0h2v2H9v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2Zm-7 3h8v1H8v-1Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"/></svg>',
  music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 3v12.2A3.2 3.2 0 1 1 16 12.25V7H9v10.2A3.2 3.2 0 1 1 7 14.25V5h11Z"/></svg>',
  watch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm6 3v6l5-3-5-3Z"/></svg>',
  stream: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm5 3v7l6-3.5L9 8Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.8 6.2L21.5 9l-5 4.55L17.9 20 12 16.65 6.1 20l1.4-6.45L2.5 9l6.7-.8L12 2Z"/></svg>',
  flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h12l-.8 4L17 11H7v10H5V3Z"/></svg>'
};

let width = 0;
let height = 0;
let particles = [];
let musicReady = false;
let autoplayBlocked = false;
let musicUnlocked = false;
let lanyardSocket = null;
let lanyardHeartbeat = null;
let lanyardReconnect = null;

profileName.textContent = config.profileName || 'mrtacosi';
discordName.textContent = config.profileName || 'mrtacosi';
activityLine.textContent = config.fallbackActivity || 'Loading Discord';
activitySubline.textContent = config.fallbackSubline || 'Checking live status';

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  makeParticles();
}

function makeParticles() {
  const count = Math.floor(Math.min(90, Math.max(40, width / 23)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    len: 12 + Math.random() * 40,
    speed: 2.4 + Math.random() * 5.8,
    alpha: 0.08 + Math.random() * 0.18,
    drift: -0.75 + Math.random() * 1.5
  }));
}

function drawRain() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (const p of particles) {
    const glow = p.x > width * 0.43 && p.x < width * 0.92 ? '101, 239, 255' : '255, 255, 255';
    ctx.strokeStyle = `rgba(${glow}, ${p.alpha})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.drift * 2.2, p.y + p.len);
    ctx.stroke();

    p.y += p.speed;
    p.x += p.drift;

    if (p.y > height + 50) {
      p.y = -50;
      p.x = Math.random() * width;
    }
  }

  requestAnimationFrame(drawRain);
}

function sliderValue() {
  return Math.max(0, Math.min(1, Number(volumeSlider?.value || 72) / 100));
}

function updateSliderFill() {
  if (!volumeSlider) return;
  const value = Number(volumeSlider.value || 0);
  volumeSlider.style.background = `linear-gradient(90deg, #fff ${value}%, rgba(255,255,255,.3) ${value}%)`;
}

function updateSoundIcon() {
  if (music.muted || music.volume <= 0.01) {
    soundIcon.innerHTML = ICONS.volumeOff;
    return;
  }

  if (music.paused) {
    soundIcon.innerHTML = ICONS.volumeLow;
    return;
  }

  soundIcon.innerHTML = music.volume < 0.45 ? ICONS.volumeLow : ICONS.volumeHigh;
}

function removeUnlockListeners() {
  document.removeEventListener('pointerdown', unlockMusicOnFirstInteraction);
  document.removeEventListener('keydown', unlockMusicOnFirstInteraction);
}

async function tryPlayMusic() {
  if (!music.src) return false;

  try {
    music.muted = false;
    music.volume = sliderValue();
    await music.play();
    musicReady = true;
    musicUnlocked = true;
    autoplayBlocked = false;
    removeUnlockListeners();
    updateSoundIcon();
    soundToggle.title = 'Pause music';
    return true;
  } catch {
    autoplayBlocked = true;
    updateSoundIcon();
    soundToggle.title = 'Click once to start music';
    return false;
  }
}

async function primeMusicInstantly() {
  if (!music.src) return;

  try {
    music.muted = true;
    music.volume = 0;
    await music.play();
    musicReady = true;
    autoplayBlocked = false;
    soundToggle.title = 'Click anywhere to turn music on';
    updateSoundIcon();
  } catch {
    autoplayBlocked = true;
    updateSoundIcon();
  }
}

function setupMusic() {
  if (!config.musicSrc && !music.getAttribute('src')) {
    soundToggle.classList.add('disabled');
    soundToggle.title = 'Upload your music file to enable music';
    return;
  }

  const musicUrl = new URL(music.getAttribute('src') || config.musicSrc, window.location.href);
  music.src = musicUrl.href;
  music.loop = true;
  music.autoplay = false;
  music.preload = 'auto';
  musicReady = true;
  updateSliderFill();
  updateSoundIcon();

  fetch(musicUrl.href, { cache: 'force-cache' }).catch(() => {});
  music.load();

  music.addEventListener('loadedmetadata', () => {
    musicReady = true;
    soundToggle.classList.remove('disabled');
    soundToggle.title = 'Play music';
  });

  music.addEventListener('canplay', () => {
    musicReady = true;
    soundToggle.classList.remove('disabled');
  });

  music.addEventListener('playing', updateSoundIcon);
  music.addEventListener('pause', updateSoundIcon);

  music.addEventListener('error', () => {
    musicReady = false;
    soundToggle.classList.add('disabled');
    soundIcon.innerHTML = ICONS.volumeOff;
    soundToggle.title = 'Music file not found or not playable';
  });

  setTimeout(primeMusicInstantly, 80);
}

if (volumeSlider) {
  volumeSlider.addEventListener('input', () => {
    if (!music.muted) music.volume = sliderValue();
    updateSliderFill();
    updateSoundIcon();
  });
}

soundToggle.addEventListener('pointerdown', (event) => {
  event.stopPropagation();
});

soundToggle.addEventListener('click', async () => {
  if (!music.src || music.error) {
    soundIcon.innerHTML = ICONS.volumeOff;
    setTimeout(updateSoundIcon, 650);
    return;
  }

  try {
    if (music.paused || music.muted || music.volume <= 0.01) {
      await tryPlayMusic();
    } else {
      music.pause();
      updateSoundIcon();
      soundToggle.title = 'Play music';
    }
  } catch {
    soundIcon.innerHTML = ICONS.volumeOff;
  }
});

function unlockMusicOnFirstInteraction(event) {
  if (musicUnlocked) return;
  if (event?.target?.closest?.('#soundToggle')) return;
  tryPlayMusic();
}

document.addEventListener('pointerdown', unlockMusicOnFirstInteraction);
document.addEventListener('keydown', unlockMusicOnFirstInteraction);

const statusColors = {
  online: '#23d160',
  idle: '#f0b429',
  dnd: '#ff4d67',
  offline: '#747f8d'
};

const typeLabels = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening to',
  3: 'Watching',
  4: 'Custom Status',
  5: 'Competing in'
};

const typeIcons = {
  0: ICONS.keyboard,
  1: ICONS.stream,
  2: ICONS.music,
  3: ICONS.watch,
  4: ICONS.star,
  5: ICONS.flag
};

function setActivityIcon(icon = ICONS.keyboard, imageUrl = '') {
  if (!activityIcon) return;
  activityIcon.classList.toggle('has-art', Boolean(imageUrl));
  activityIcon.style.backgroundImage = imageUrl ? `url("${imageUrl}")` : '';
  activityIcon.innerHTML = imageUrl ? '' : icon;
}

function setPresenceFallback(message = '') {
  statusDot.style.background = statusColors.offline;
  activityLine.textContent = config.fallbackActivity || 'Loading Discord';
  activitySubline.textContent = message || config.fallbackSubline || 'Checking live status';
  setActivityIcon(ICONS.keyboard);
}

function bestActivity(data) {
  const activities = data.activities || [];
  if (data.spotify) return { kind: 'spotify', ...data.spotify };
  return activities.find(a => a.type === 0)
    || activities.find(a => a.type === 2)
    || activities.find(a => a.type === 1)
    || activities.find(a => a.type === 3)
    || activities.find(a => a.type === 5)
    || activities.find(a => a.type === 4)
    || activities[0];
}

function activityAssetUrl(activity) {
  const asset = activity?.assets?.large_image || activity?.assets?.small_image;
  if (!asset) return '';
  if (asset.startsWith('mp:')) return `https://media.discordapp.net/${asset.slice(3)}`;
  if (asset.startsWith('spotify:')) return `https://i.scdn.co/image/${asset.replace('spotify:', '')}`;
  if (activity.application_id) return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`;
  return '';
}

function applyPresence(data) {
  if (!data || !data.discord_user) return setPresenceFallback('Discord presence unavailable');

  const user = data.discord_user;
  const tag = user.global_name || user.username || config.profileName || 'mrtacosi';
  discordName.textContent = tag;
  statusDot.style.background = statusColors[data.discord_status] || statusColors.offline;

  if (discordProfileLink) {
    discordProfileLink.href = `https://discord.com/users/${user.id}`;
  }

  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${avatarUrl}")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  } else if (user.discriminator && user.discriminator !== '0') {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }

  const activity = bestActivity(data);
  if (!activity) {
    activityLine.textContent = data.discord_status === 'offline' ? 'Offline' : (config.fallbackActivity || 'Online');
    activitySubline.textContent = data.discord_status === 'offline' ? 'Not currently active' : (config.fallbackSubline || 'Active now');
    setActivityIcon(ICONS.keyboard);
    return;
  }

  if (activity.kind === 'spotify') {
    activityLine.textContent = 'Listening to Spotify';
    activitySubline.textContent = `${activity.song || 'Unknown Song'}${activity.artist ? ` • ${activity.artist}` : ''}`;
    setActivityIcon(ICONS.music, activity.album_art_url || '');
    return;
  }

  const label = typeLabels[activity.type] || 'Using';
  const icon = typeIcons[activity.type] || ICONS.keyboard;

  if (activity.type === 4) {
    activityLine.textContent = 'Custom Status';
    activitySubline.textContent = activity.state || config.fallbackSubline || 'Active now';
    setActivityIcon(icon, activityAssetUrl(activity));
    return;
  }

  activityLine.textContent = `${label} ${activity.name || 'Discord'}`;
  activitySubline.textContent = [activity.details, activity.state].filter(Boolean).join(' • ') || config.fallbackSubline || 'Active now';
  setActivityIcon(icon, activityAssetUrl(activity));
}

function currentDiscordId() {
  return (config.discordUserId || localStorage.getItem('mrtacosiDiscordId') || '').trim();
}

async function loadDiscordPresence() {
  const id = currentDiscordId();
  if (!id) {
    if (connectDiscord) connectDiscord.hidden = false;
    setPresenceFallback('Missing Discord ID');
    return;
  }

  if (connectDiscord) connectDiscord.hidden = true;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(id)}?t=${Date.now()}`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.success) throw new Error('presence unavailable');
    applyPresence(json.data);
  } catch {
    if (connectDiscord) connectDiscord.hidden = false;
    setPresenceFallback('Discord presence unavailable');
  }
}

function sendLanyardSubscribe(id) {
  if (lanyardSocket?.readyState !== WebSocket.OPEN) return;
  lanyardSocket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: id } }));
  lanyardSocket.send(JSON.stringify({ op: 2, d: { subscribe_to_ids: [id] } }));
}

function startDiscordRealtime() {
  const id = currentDiscordId();
  if (!id || !('WebSocket' in window)) return;

  clearTimeout(lanyardReconnect);
  clearInterval(lanyardHeartbeat);

  try {
    lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');

    lanyardSocket.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data);

      if (payload.op === 1 && payload.d?.heartbeat_interval) {
        clearInterval(lanyardHeartbeat);
        lanyardHeartbeat = setInterval(() => {
          if (lanyardSocket?.readyState === WebSocket.OPEN) {
            lanyardSocket.send(JSON.stringify({ op: 3 }));
          }
        }, payload.d.heartbeat_interval);

        sendLanyardSubscribe(id);
        return;
      }

      if (payload.t === 'INIT_STATE') {
        applyPresence(payload.d?.[id] || payload.d);
      }

      if (payload.t === 'PRESENCE_UPDATE') {
        applyPresence(payload.d);
      }
    });

    lanyardSocket.addEventListener('close', () => {
      clearInterval(lanyardHeartbeat);
      lanyardReconnect = setTimeout(startDiscordRealtime, 5000);
    });

    lanyardSocket.addEventListener('error', () => {
      lanyardSocket.close();
    });
  } catch {
    lanyardReconnect = setTimeout(startDiscordRealtime, 5000);
  }
}

if (connectDiscord) {
  connectDiscord.addEventListener('click', () => {
    const current = localStorage.getItem('mrtacosiDiscordId') || config.discordUserId || '';
    const id = prompt('Paste your numeric Discord user ID:', current);
    if (!id) return;
    localStorage.setItem('mrtacosiDiscordId', id.trim());
    loadDiscordPresence();
    startDiscordRealtime();
  });
}

window.addEventListener('resize', resize);
resize();
drawRain();
setupMusic();
loadDiscordPresence();
startDiscordRealtime();
setInterval(loadDiscordPresence, 30000);
