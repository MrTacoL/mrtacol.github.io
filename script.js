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
  if (music.paused) {
    soundIcon.textContent = '🔈';
    return;
  }

  if (music.volume <= 0.01) soundIcon.textContent = '🔇';
  else if (music.volume < 0.45) soundIcon.textContent = '🔉';
  else soundIcon.textContent = '🔊';
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

function setupMusic() {
  if (!config.musicSrc) {
    soundToggle.classList.add('disabled');
    soundToggle.title = 'Upload your music file to enable music';
    return;
  }

  const musicUrl = new URL(config.musicSrc, window.location.href);
  music.src = musicUrl.href;
  music.loop = true;
  music.autoplay = false;
  music.preload = 'auto';
  music.volume = sliderValue();
  music.muted = false;
  updateSliderFill();
  music.load();

  music.addEventListener('loadedmetadata', () => {
    musicReady = true;
    soundToggle.classList.remove('disabled');
    soundToggle.title = 'Play music';
  });

  music.addEventListener('canplay', () => {
    musicReady = true;
    soundToggle.classList.remove('disabled');
    soundToggle.title = 'Play music';
  });

  music.addEventListener('playing', updateSoundIcon);
  music.addEventListener('pause', updateSoundIcon);

  music.addEventListener('error', () => {
    musicReady = false;
    soundToggle.classList.add('disabled');
    soundIcon.textContent = '🔇';
    soundToggle.title = 'Music file not found or not playable';
  });

  setTimeout(tryPlayMusic, 300);
}

if (volumeSlider) {
  volumeSlider.addEventListener('input', () => {
    music.volume = sliderValue();
    updateSliderFill();
    updateSoundIcon();
  });
}

soundToggle.addEventListener('pointerdown', (event) => {
  event.stopPropagation();
});

soundToggle.addEventListener('click', async () => {
  if (!music.src || music.error) {
    soundIcon.textContent = '🔇';
    setTimeout(() => (soundIcon.textContent = '🔈'), 650);
    return;
  }

  try {
    if (music.paused) {
      await tryPlayMusic();
    } else {
      music.pause();
      updateSoundIcon();
      soundToggle.title = 'Play music';
    }
  } catch {
    soundIcon.textContent = '🔇';
  }
});

function unlockMusicOnFirstInteraction(event) {
  if (musicUnlocked) return;
  if (event?.target?.closest?.('#soundToggle')) return;
  if (autoplayBlocked || music.paused) {
    tryPlayMusic();
  }
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
  0: '⌨',
  1: '▶',
  2: '♫',
  3: '◉',
  4: '✦',
  5: '⚑'
};

function setActivityIcon(text = '⌨', imageUrl = '') {
  if (!activityIcon) return;
  activityIcon.classList.toggle('has-art', Boolean(imageUrl));
  activityIcon.style.backgroundImage = imageUrl ? `url("${imageUrl}")` : '';
  activityIcon.textContent = imageUrl ? '' : text;
}

function setPresenceFallback(message = '') {
  statusDot.style.background = statusColors.offline;
  activityLine.textContent = config.fallbackActivity || 'Loading Discord';
  activitySubline.textContent = message || config.fallbackSubline || 'Checking live status';
  setActivityIcon('⌨');
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
    activityLine.textContent = data.discord_status === 'offline' ? 'Offline' : (config.fallbackActivity || 'Loading Discord');
    activitySubline.textContent = data.discord_status === 'offline' ? 'Not currently active' : (config.fallbackSubline || 'Checking live status');
    setActivityIcon('⌨');
    return;
  }

  if (activity.kind === 'spotify') {
    activityLine.textContent = 'Listening to Spotify';
    activitySubline.textContent = `${activity.song || 'Unknown Song'}${activity.artist ? ` • ${activity.artist}` : ''}`;
    setActivityIcon('♫', activity.album_art_url || '');
    return;
  }

  const label = typeLabels[activity.type] || 'Using';
  const icon = typeIcons[activity.type] || '⌨';

  if (activity.type === 4) {
    activityLine.textContent = 'Custom Status';
    activitySubline.textContent = activity.state || config.fallbackSubline || 'Checking live status';
    setActivityIcon(icon, activityAssetUrl(activity));
    return;
  }

  activityLine.textContent = `${label} ${activity.name || 'Discord'}`;
  activitySubline.textContent = [activity.details, activity.state].filter(Boolean).join(' • ') || config.fallbackSubline || 'Checking live status';
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
