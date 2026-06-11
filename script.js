const config = window.MRTACOSI_CONFIG || {};

const canvas = document.getElementById('weatherCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
const volumeSlider = document.getElementById('volumeSlider');
const music = document.getElementById('music');
const enterScreen = document.getElementById('enterScreen');
const enterButton = document.getElementById('enterButton');
const profileName = document.getElementById('profileName');
const discordName = document.getElementById('discordName');
const activityLine = document.getElementById('activityLine');
const activitySubline = document.getElementById('activitySubline');
const avatar = document.getElementById('avatar');
const statusDot = document.getElementById('statusDot');
const activityIcon = document.getElementById('activityIcon');
const activityCard = document.getElementById('activityCard');
const discordProfileLink = document.getElementById('discordProfileLink');
const copyDiscord = document.getElementById('copyDiscord');
const projectsButton = document.getElementById('projectsButton');
const projectsModal = document.getElementById('projectsModal');
const viewCount = document.getElementById('viewCount');

const BASE_VIEWS = 10472918;
const DISCORD_ID = String(config.discordUserId || '828806896089038879').trim();
const REPO = 'MrTacoL/mrtacol.github.io';
const ACTIVITY_IMAGE_FOLDERS = ['assets/icons', 'assets'];
const ACTIVITY_IMAGE_EXT = /\.(png|webp|jpg|jpeg)$/i;

const ICONS = {
  volumeHigh: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4.04v8.08A4.5 4.5 0 0 0 16.5 12Zm-2.5-8.5v2.08A7.5 7.5 0 0 1 18.5 12 7.5 7.5 0 0 1 14 18.42v2.08A9.5 9.5 0 0 0 20.5 12 9.5 9.5 0 0 0 14 3.5Z"/></svg>',
  volumeLow: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3Zm13 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12Z"/></svg>',
  volumeOff: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3Zm14.7 3 2.15-2.15-1.4-1.42-2.16 2.16-2.15-2.16-1.41 1.42L15.88 12l-2.15 2.15 1.41 1.42 2.15-2.16 2.16 2.16 1.4-1.42L17.71 12Z"/></svg>',
  keyboard: '<svg viewBox="0 0 24 24"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17h-11A2.5 2.5 0 0 1 4 14.5v-8ZM6.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-11ZM7 8h2v2H7V8Zm3 0h2v2h-2V8Zm3 0h2v2h-2V8Zm3 0h1v2h-1V8ZM7 11h1v2H7v-2Zm2 0h2v2H9v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2Zm-7 3h8v1H8v-1Z"/></svg>',
  gamepad: '<svg viewBox="0 0 24 24"><path d="M7.2 8h9.6A5.2 5.2 0 0 1 22 13.2v2.05A3.75 3.75 0 0 1 15.85 18l-1.45-1.3H9.6L8.15 18A3.75 3.75 0 0 1 2 15.25V13.2A5.2 5.2 0 0 1 7.2 8ZM7 11v1.5H5.5V14H7v1.5h1.5V14H10v-1.5H8.5V11H7Zm9.5.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.2 2.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>',
  minecraft: '<svg viewBox="0 0 24 24"><path d="M4 6.5 12 3l8 3.5v10L12 21l-8-4.5v-10Zm8 5.25 5.9-2.6L12 6.6 6.1 9.15 12 11.75Zm-6 5.1 5 2.8v-6.15l-5-2.25v5.6Zm7 2.8 5-2.8v-5.6l-5 2.25v6.15Z"/></svg>',
  code: '<svg viewBox="0 0 24 24"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4ZM13.2 4l-3 16h1.9l3-16h-1.9Z"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M18 3v12.2A3.2 3.2 0 1 1 16 12.25V7H9v10.2A3.2 3.2 0 1 1 7 14.25V5h11Z"/></svg>',
  stream: '<svg viewBox="0 0 24 24"><path d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm5 3v7l6-3.5L9 8Z"/></svg>',
  watch: '<svg viewBox="0 0 24 24"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm6 3v6l5-3-5-3Z"/></svg>'
};

let width = 0;
let height = 0;
let particles = [];
let musicUnlocked = false;
let currentIconKey = '';
let viewsAnimated = false;
let activityImages = [];
let activityImagesLoaded = false;

if (profileName) profileName.textContent = config.profileName || 'mrtacosi';
if (discordName) discordName.textContent = config.profileName || 'mrtacosi';
if (viewCount) viewCount.textContent = '0';

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
  } catch {}
  updateSoundIcon();
}

function getViewTarget() {
  const seenKey = 'mrtacosi:view-seen-profile-v5';
  const extraKey = 'mrtacosi:view-extra-profile-v5';
  let extra = Number(localStorage.getItem(extraKey) || '0');
  if (sessionStorage.getItem(seenKey) !== '1') {
    extra += 1;
    sessionStorage.setItem(seenKey, '1');
    localStorage.setItem(extraKey, String(extra));
  }
  return BASE_VIEWS + Math.max(0, extra - 1);
}

function animateViewsFromZero() {
  if (!viewCount || viewsAnimated) return;
  viewsAnimated = true;
  const formatter = new Intl.NumberFormat('en-US');
  const target = getViewTarget();
  const duration = 2200;
  const started = performance.now();
  viewCount.textContent = '0';
  function tick(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    viewCount.textContent = formatter.format(Math.floor(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
    else viewCount.textContent = formatter.format(target);
  }
  requestAnimationFrame(tick);
}

function enterSite() {
  enterScreen?.classList.add('hidden');
  playMusic();
  setTimeout(animateViewsFromZero, 160);
}

function setupMusic() {
  if (!music) return;
  music.preload = 'auto';
  music.loop = true;
  music.load();
  updateSliderFill();
  updateSoundIcon();
  enterButton?.addEventListener('click', enterSite);
  enterScreen?.addEventListener('click', (event) => {
    if (event.target === enterScreen) enterSite();
  });
  document.addEventListener('keydown', (event) => {
    if (!enterScreen?.classList.contains('hidden') && (event.key === 'Enter' || event.key === ' ')) enterSite();
  });
  soundToggle?.addEventListener('click', () => (music.paused || music.muted ? playMusic() : (music.pause(), updateSoundIcon())));
  volumeSlider?.addEventListener('input', () => {
    if (!music.muted) music.volume = sliderValue();
    updateSliderFill();
    updateSoundIcon();
  });
}

function setStatus(status = 'offline') {
  const colors = { online: '#23d160', idle: '#f0b429', dnd: '#ff4d67', offline: '#747f8d' };
  if (statusDot) statusDot.style.background = colors[status] || colors.offline;
  if (activityCard) {
    activityCard.classList.remove('online', 'idle', 'dnd', 'offline');
    activityCard.classList.add(status || 'offline');
  }
}

function normalizeActivityText(value = '') {
  return decodeURIComponent(String(value)).toLowerCase().replace(/\.(png|webp|jpg|jpeg)$/i, '').replace(/[^a-z0-9]+/g, ' ').replace(/\b(icon|logo|transparent|free|png|webp|jpg|jpeg)\b/g, ' ').replace(/\s+/g, ' ').trim();
}

function activitySearchText(activity) {
  return normalizeActivityText(`${activity?.name || ''} ${activity?.details || ''} ${activity?.state || ''}`);
}

function encodedLocalImage(folder, name) {
  return `./${folder}/${encodeURIComponent(name).replace(/%2F/g, '/')}`;
}

async function scanActivityImageFolder(folder) {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${folder}?ref=main&t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const files = await response.json();
    if (!Array.isArray(files)) return [];
    return files.filter(file => file.type === 'file' && ACTIVITY_IMAGE_EXT.test(file.name)).map(file => ({
      key: normalizeActivityText(file.name),
      url: encodedLocalImage(folder, file.name)
    }));
  } catch {
    return [];
  }
}

async function loadActivityImages() {
  if (activityImagesLoaded) return;
  activityImagesLoaded = true;
  activityImages = (await Promise.all(ACTIVITY_IMAGE_FOLDERS.map(scanActivityImageFolder))).flat();
}

function findActivityImage(...queries) {
  const normalizedQueries = queries.map(normalizeActivityText).filter(Boolean);
  return activityImages.find(image => normalizedQueries.some(query => image.key.includes(query) || query.includes(image.key)));
}

function localActivityImage(activity) {
  const text = activitySearchText(activity);
  if (!activity) return '';
  if (text.includes('minecraft')) return (findActivityImage('minecraft')?.url || './assets/icons/minecraft.png');
  if (text.includes('visual studio code') || text.includes('vscode') || text.includes('vs code')) return (findActivityImage('visual studio code', 'vscode', 'vs code', 'code')?.url || '');
  const match = activityImages.find(image => {
    const words = image.key.split(' ').filter(word => word.length >= 3);
    return image.key.length >= 3 && (text.includes(image.key) || (words.length > 0 && words.every(word => text.includes(word))));
  });
  return match?.url || '';
}

function setActivityIcon(key, svg) {
  if (!activityIcon || currentIconKey === key) return;
  currentIconKey = key;
  activityIcon.classList.remove('has-art');
  activityIcon.style.backgroundImage = 'none';
  activityIcon.innerHTML = svg;
}

function isMinecraft(activity) {
  return activitySearchText(activity).includes('minecraft');
}

function isCodeActivity(activity) {
  const text = activitySearchText(activity);
  return text.includes('visual studio code') || text.includes('vscode') || text.includes('vs code') || text === 'code';
}

function pickIcon(activity) {
  const text = activitySearchText(activity);
  if (isCodeActivity(activity)) return ['code', ICONS.code];
  if (text.includes('minecraft')) return ['minecraft', ICONS.minecraft];
  if (activity?.type === 2 || text.includes('spotify')) return ['music', ICONS.music];
  if (activity?.type === 1) return ['stream', ICONS.stream];
  if (activity?.type === 3) return ['watch', ICONS.watch];
  if (activity?.type === 0) return ['gamepad', ICONS.gamepad];
  return ['keyboard', ICONS.keyboard];
}

function activityAssetUrl(activity) {
  const asset = activity?.assets?.large_image || activity?.assets?.small_image;
  if (!asset || !activity.application_id || isMinecraft(activity)) return '';
  if (asset.startsWith('mp:') || asset.startsWith('spotify:')) return '';
  return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png`;
}

function activityMeta(activity) {
  if (isMinecraft(activity)) {
    const parts = [activity.details, activity.state].filter(Boolean);
    return parts.length ? parts.join(' • ') : 'Server / World / Launcher';
  }
  return [activity.details, activity.state].filter(Boolean).join(' • ') || 'Active now';
}

function applyPresence(data) {
  if (!data?.discord_user) return;
  const user = data.discord_user;
  const name = user.global_name || user.username || config.profileName || 'mrtacosi';
  if (discordName) discordName.textContent = name;
  if (discordProfileLink) discordProfileLink.href = `https://discord.com/users/${user.id}`;
  setStatus(data.discord_status || 'offline');

  if (user.avatar && avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }

  const activities = data.activities || [];
  const spotifyActivity = data.spotify ? { type: 2, name: 'Spotify', details: data.spotify.song, state: data.spotify.artist, spotifyArt: data.spotify.album_art_url } : null;
  const activity = activities.find(isCodeActivity)
    || activities.find(isMinecraft)
    || activities.find(a => a.type === 0)
    || spotifyActivity
    || activities.find(a => a.type === 2)
    || activities.find(a => a.type === 1)
    || activities.find(a => a.type === 3)
    || activities.find(a => a.type === 4);

  if (!activity) {
    if (activityLine) activityLine.textContent = data.discord_status === 'offline' ? 'Offline' : 'Online';
    if (activitySubline) activitySubline.textContent = data.discord_status === 'offline' ? 'Not active' : 'Active now';
    setActivityIcon('keyboard', ICONS.keyboard);
    return;
  }

  const labels = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 4: 'Status' };
  if (activityLine) activityLine.textContent = isMinecraft(activity) ? 'Playing Minecraft' : `${labels[activity.type] || 'Using'} ${activity.name || 'Discord'}`;
  if (activitySubline) activitySubline.textContent = activityMeta(activity);

  const art = localActivityImage(activity) || activity.spotifyArt || activityAssetUrl(activity);
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
  if (!DISCORD_ID) return;
  await loadActivityImages();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(DISCORD_ID)}?t=${Date.now()}`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json();
    if (json.success) applyPresence(json.data);
  } catch {
    setStatus('online');
    if (activityLine) activityLine.textContent = 'Online';
    if (activitySubline) activitySubline.textContent = 'Active now';
  }
}

function setupCopyButton() {
  copyDiscord?.addEventListener('click', async () => {
    const text = discordName?.textContent?.trim() || 'FestiveTaco';
    try {
      await navigator.clipboard.writeText(text);
      copyDiscord.textContent = 'Copied';
      copyDiscord.classList.add('copied');
      setTimeout(() => {
        copyDiscord.textContent = 'Copy';
        copyDiscord.classList.remove('copied');
      }, 1200);
    } catch {
      copyDiscord.textContent = text;
      setTimeout(() => (copyDiscord.textContent = 'Copy'), 1600);
    }
  });
}

function setupProjects() {
  projectsButton?.addEventListener('click', () => {
    if (projectsModal) projectsModal.hidden = false;
  });
  document.querySelectorAll('[data-close-projects]').forEach((button) => {
    button.addEventListener('click', () => {
      if (projectsModal) projectsModal.hidden = true;
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectsModal) projectsModal.hidden = true;
  });
}

window.addEventListener('resize', resize);
resize();
drawRain();
setupMusic();
setupCopyButton();
setupProjects();
loadDiscordPresence();
setInterval(loadDiscordPresence, 10000);
