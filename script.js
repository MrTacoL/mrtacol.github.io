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
const connectDiscord = document.getElementById('connectDiscord');

let width = 0;
let height = 0;
let particles = [];
let musicReady = false;
let autoplayBlocked = false;

profileName.textContent = config.profileName || 'mrtacosi';
discordName.textContent = config.profileName || 'mrtacosi';
activityLine.textContent = config.fallbackActivity || 'Playing Code';
activitySubline.textContent = config.fallbackSubline || 'Idling';

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

async function tryPlayMusic() {
  if (!music.src || (!musicReady && music.error)) return false;

  try {
    music.muted = false;
    music.volume = sliderValue();
    await music.play();
    autoplayBlocked = false;
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

  music.src = config.musicSrc;
  music.loop = true;
  music.autoplay = true;
  music.preload = 'auto';
  music.volume = sliderValue();
  musicReady = true;
  updateSliderFill();

  music.addEventListener('canplay', () => {
    musicReady = true;
    soundToggle.classList.remove('disabled');
    soundToggle.title = 'Play music';
    tryPlayMusic();
  }, { once: true });

  music.addEventListener('error', () => {
    musicReady = false;
    soundToggle.classList.add('disabled');
    soundIcon.textContent = '🔇';
    soundToggle.title = 'Music file not found yet';
  });

  setTimeout(tryPlayMusic, 300);
}

if (volumeSlider) {
  volumeSlider.addEventListener('input', () => {
    music.volume = sliderValue();
    updateSliderFill();
    updateSoundIcon();
  });

  volumeSlider.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
}

soundToggle.addEventListener('click', async () => {
  if (!music.src || (!musicReady && music.error)) {
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

function unlockMusicOnFirstInteraction() {
  if (autoplayBlocked || music.paused) {
    tryPlayMusic();
  }
}

document.addEventListener('pointerdown', unlockMusicOnFirstInteraction, { once: true });
document.addEventListener('keydown', unlockMusicOnFirstInteraction, { once: true });

const statusColors = {
  online: '#23d160',
  idle: '#f0b429',
  dnd: '#ff4d67',
  offline: '#747f8d'
};

function setPresenceFallback() {
  statusDot.style.background = statusColors.offline;
  activityLine.textContent = config.fallbackActivity || 'Playing Code';
  activitySubline.textContent = config.fallbackSubline || 'Idling';
}

function bestActivity(activities = []) {
  return activities.find(a => a.type === 0) || activities.find(a => a.type === 4) || activities[0];
}

function applyPresence(data) {
  if (!data || !data.discord_user) return setPresenceFallback();

  const user = data.discord_user;
  const tag = user.global_name || user.username || config.profileName || 'mrtacosi';
  discordName.textContent = tag;
  statusDot.style.background = statusColors[data.discord_status] || statusColors.offline;

  if (user.avatar) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url(https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128)`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }

  const activity = bestActivity(data.activities || []);
  if (!activity) {
    activityLine.textContent = data.discord_status === 'offline' ? 'Offline' : (config.fallbackActivity || 'Playing Code');
    activitySubline.textContent = data.discord_status === 'offline' ? 'Not currently active' : (config.fallbackSubline || 'Idling');
    return;
  }

  if (activity.type === 4) {
    activityLine.textContent = 'Custom Status';
    activitySubline.textContent = activity.state || config.fallbackSubline || 'Idling';
    return;
  }

  activityLine.textContent = `Playing ${activity.name || 'Code'}`;
  activitySubline.textContent = activity.details || activity.state || config.fallbackSubline || 'Idling';
}

async function loadDiscordPresence() {
  const id = (config.discordUserId || localStorage.getItem('mrtacosiDiscordId') || '').trim();
  if (!id) {
    if (connectDiscord) connectDiscord.hidden = false;
    setPresenceFallback();
    return;
  }

  if (connectDiscord) connectDiscord.hidden = true;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(id)}`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.success) throw new Error('presence unavailable');
    applyPresence(json.data);
  } catch {
    if (connectDiscord) connectDiscord.hidden = false;
    setPresenceFallback();
  }
}

if (connectDiscord) {
  connectDiscord.addEventListener('click', () => {
    const current = localStorage.getItem('mrtacosiDiscordId') || config.discordUserId || '';
    const id = prompt('Paste your numeric Discord user ID:', current);
    if (!id) return;
    localStorage.setItem('mrtacosiDiscordId', id.trim());
    loadDiscordPresence();
  });
}

window.addEventListener('resize', resize);
resize();
drawRain();
setupMusic();
loadDiscordPresence();
setInterval(loadDiscordPresence, 15000);
