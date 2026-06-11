const config = window.MRTACOSI_CONFIG || {};

const canvas = document.getElementById('weatherCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
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
const viewCount = document.getElementById('viewCount');

const ICONS = {
  volumeHigh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4.04v8.08A4.5 4.5 0 0 0 16.5 12Zm-2.5-8.5v2.08A7.5 7.5 0 0 1 18.5 12 7.5 7.5 0 0 1 14 18.42v2.08A9.5 9.5 0 0 0 20.5 12 9.5 9.5 0 0 0 14 3.5Z"/></svg>',
  volumeLow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm13 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12Z"/></svg>',
  volumeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm14.7 3 2.15-2.15-1.4-1.42-2.16 2.16-2.15-2.16-1.41 1.42L15.88 12l-2.15 2.15 1.41 1.42 2.15-2.16 2.16 2.16 1.4-1.42L17.71 12Z"/></svg>',
  keyboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17h-11A2.5 2.5 0 0 1 4 14.5v-8ZM6.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-11ZM7 8h2v2H7V8Zm3 0h2v2h-2V8Zm3 0h2v2h-2V8Zm3 0h1v2h-1V8ZM7 11h1v2H7v-2Zm2 0h2v2H9v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2Zm-7 3h8v1H8v-1Z"/></svg>',
  gamepad: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 8h9.6A5.2 5.2 0 0 1 22 13.2v2.05A3.75 3.75 0 0 1 15.85 18l-1.45-1.3H9.6L8.15 18A3.75 3.75 0 0 1 2 15.25V13.2A5.2 5.2 0 0 1 7.2 8ZM7 11v1.5H5.5V14H7v1.5h1.5V14H10v-1.5H8.5V11H7Zm9.5.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.2 2.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>',
  minecraft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5 12 3l8 3.5v10L12 21l-8-4.5v-10Zm8 5.25 5.9-2.6L12 6.6 6.1 9.15 12 11.75Zm-6 5.1 5 2.8v-6.15l-5-2.25v5.6Zm7 2.8 5-2.8v-5.6l-5 2.25v6.15Z"/></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4ZM13.2 4l-3 16h1.9l3-16h-1.9Z"/></svg>',
  music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 3v12.2A3.2 3.2 0 1 1 16 12.25V7H9v10.2A3.2 3.2 0 1 1 7 14.25V5h11Z"/></svg>'
};

let width = 0;
let height = 0;
let particles = [];
let musicUnlocked = false;
let currentIconKey = '';

if (profileName) profileName.textContent = config.profileName || 'mrtacosi';
if (discordName) discordName.textContent = config.profileName || 'mrtacosi';
if (activityLine) activityLine.textContent = 'Loading Discord';
if (activitySubline) activitySubline.textContent = 'Checking live status';

function injectFixStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .avatar-fallback { border-radius: 1.08rem !important; border: 1px solid rgba(255,255,255,.14) !important; box-shadow: 0 .9rem 1.9rem rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.18) !important; }
    .status-dot { left: 4.28rem !important; bottom: .68rem !important; width: .82rem !important; height: .82rem !important; border: 3px solid rgba(18,19,27,.98) !important; z-index: 6 !important; }
    .device-icon svg { display:block; width:2rem; height:2rem; fill:currentColor; }
    .device-icon.has-art svg { display:none; }
    .views { display:inline-flex !important; align-items:center !important; gap:.32rem !important; }
    .views svg { width:1.05rem; height:1.05rem; fill:rgba(255,255,255,.9); }
  `;
  document.head.appendChild(style);
}

function resize() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(75, Math.max(35, Math.floor(width / 28))) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    len: 14 + Math.random() * 34,
    speed: 2 + Math.random() * 4,
    drift: -0.6 + Math.random() * 1.2,
    alpha: 0.08 + Math.random() * 0.16
  }));
}

function drawRain() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  for (const p of particles) {
    ctx.strokeStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.drift * 2, p.y + p.len);
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
  if (!soundIcon || !music) return;
  if (music.muted || music.volume <= 0.01) soundIcon.innerHTML = ICONS.volumeOff;
  else if (music.paused || music.volume < 0.45) soundIcon.innerHTML = ICONS.volumeLow;
  else soundIcon.innerHTML = ICONS.volumeHigh;
}

async function playMusic() {
  if (!music?.src) return;
  try {
    music.muted = false;
    music.volume = sliderValue();
    await music.play();
    musicUnlocked = true;
    updateSoundIcon();
  } catch {
    updateSoundIcon();
  }
}

function setupMusic() {
  if (!music) return;
  music.preload = 'auto';
  music.loop = true;
  music.load();
  updateSliderFill();
  updateSoundIcon();
  soundToggle?.addEventListener('click', () => (music.paused || music.muted ? playMusic() : (music.pause(), updateSoundIcon())));
  volumeSlider?.addEventListener('input', () => {
    if (!music.muted) music.volume = sliderValue();
    updateSliderFill();
    updateSoundIcon();
  });
  document.addEventListener('pointerdown', () => { if (!musicUnlocked) playMusic(); }, { once: true });
  document.addEventListener('keydown', () => { if (!musicUnlocked) playMusic(); }, { once: true });
}

function setActivityIcon(key, svg) {
  if (!activityIcon || currentIconKey === key) return;
  currentIconKey = key;
  activityIcon.classList.remove('has-art');
  activityIcon.style.backgroundImage = 'none';
  activityIcon.innerHTML = svg;
}

function pickIcon(activity) {
  const text = `${activity?.name || ''} ${activity?.details || ''} ${activity?.state || ''}`.toLowerCase();
  if (text.includes('minecraft')) return ['minecraft', ICONS.minecraft];
  if (text.includes('code') || text.includes('visual studio')) return ['code', ICONS.code];
  if (activity?.type === 2 || text.includes('spotify')) return ['music', ICONS.music];
  if (activity?.type === 0) return ['gamepad', ICONS.gamepad];
  return ['keyboard', ICONS.keyboard];
}

function activityAssetUrl(activity) {
  const asset = activity?.assets?.large_image || activity?.assets?.small_image;
  if (!asset || !activity.application_id) return '';
  if (asset.startsWith('mp:') || asset.startsWith('spotify:')) return '';
  return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`;
}

function applyPresence(data) {
  if (!data?.discord_user) return;
  const user = data.discord_user;
  const name = user.global_name || user.username || config.profileName || 'mrtacosi';
  if (discordName) discordName.textContent = name;
  if (discordProfileLink) discordProfileLink.href = `https://discord.com/users/${user.id}`;
  const statusColors = { online: '#23d160', idle: '#f0b429', dnd: '#ff4d67', offline: '#747f8d' };
  if (statusDot) statusDot.style.background = statusColors[data.discord_status] || statusColors.offline;
  if (user.avatar && avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }

  const activities = data.activities || [];
  const activity = data.spotify ? { type: 2, name: 'Spotify', details: data.spotify.song, state: data.spotify.artist } : (activities.find(a => a.type === 0) || activities.find(a => a.type === 2) || activities.find(a => a.type === 1) || activities.find(a => a.type === 3));
  if (!activity) {
    if (activityLine) activityLine.textContent = data.discord_status === 'offline' ? 'Offline' : 'Online';
    if (activitySubline) activitySubline.textContent = data.discord_status === 'offline' ? 'Not active' : 'Active now';
    setActivityIcon('keyboard', ICONS.keyboard);
    return;
  }

  const labels = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching' };
  if (activityLine) activityLine.textContent = `${labels[activity.type] || 'Using'} ${activity.name || 'Discord'}`;
  if (activitySubline) activitySubline.textContent = [activity.details, activity.state].filter(Boolean).join(' • ') || 'Active now';

  const art = activityAssetUrl(activity);
  if (art && activityIcon) {
    activityIcon.classList.add('has-art');
    activityIcon.style.backgroundImage = `url("${art}")`;
    activityIcon.innerHTML = '';
    currentIconKey = 'art:' + art;
  } else {
    const [key, svg] = pickIcon(activity);
    setActivityIcon(key, svg);
  }
}

async function loadDiscordPresence() {
  const id = String(config.discordUserId || '').trim();
  if (!id) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(id)}?t=${Date.now()}`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json();
    if (json.success) applyPresence(json.data);
  } catch {
    if (activityLine) activityLine.textContent = 'Online';
    if (activitySubline) activitySubline.textContent = 'Active now';
  }
}

function setupViews() {
  if (!viewCount) return;
  const key = 'mrtacosi:views';
  const seenKey = 'mrtacosi:seen';
  let views = Number(localStorage.getItem(key) || '1');
  if (sessionStorage.getItem(seenKey) !== '1') {
    views += 1;
    sessionStorage.setItem(seenKey, '1');
    localStorage.setItem(key, String(views));
  }
  viewCount.textContent = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(views);
}

injectFixStyles();
window.addEventListener('resize', resize);
resize();
drawRain();
setupMusic();
setupViews();
loadDiscordPresence();
setInterval(loadDiscordPresence, 15000);
