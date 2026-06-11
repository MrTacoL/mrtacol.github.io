(() => {
  const audio = document.getElementById('music');
  const songLabel = document.querySelector('.song-label');
  const soundStack = document.querySelector('.sound-stack');
  const volumeSlider = document.getElementById('volumeSlider');
  if (!audio || !soundStack) return;

  const REPO = 'MrTacoL/mrtacol.github.io';
  const AUDIO_EXT = /\.(mp3|ogg|wav|m4a|aac|flac)$/i;
  const fallback = Array.isArray(window.MRTACOSI_PLAYLIST) ? window.MRTACOSI_PLAYLIST : [];
  let playlist = [], queue = [], queueIndex = 0, currentTrack = null;
  let shuffleOn = true, repeatOn = false, ready = false;

  const css = document.createElement('style');
  css.textContent = `
    .music-console{position:relative;overflow:hidden;width:min(22rem,86vw);margin-top:.5rem;padding:.7rem;border:1px solid rgba(255,255,255,.16);border-radius:1.25rem;background:rgba(8,9,14,.72);box-shadow:0 .9rem 2rem rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.06),0 0 1.4rem rgba(101,239,255,.14);backdrop-filter:blur(16px) saturate(1.25)}
    .music-console::before{content:"";position:absolute;inset:-45%;background:conic-gradient(from 90deg,transparent,rgba(101,239,255,.17),transparent,rgba(255,11,114,.15),transparent);animation:musicSpin 8s linear infinite;pointer-events:none}.music-console>*{position:relative;z-index:1}
    .music-topline{display:flex;align-items:center;gap:.6rem;min-width:0}.music-disc{width:2.25rem;height:2.25rem;border-radius:50%;flex:0 0 auto;background:radial-gradient(circle,#fff 0 13%,#0d0e14 14% 25%,#65efff 26% 31%,#22232b 32% 62%,#ff0b72 63% 70%,#111217 71%);box-shadow:0 0 .9rem rgba(101,239,255,.36),0 0 1.1rem rgba(255,11,114,.22);animation:discSpin 5s linear infinite paused}.music-console.playing .music-disc{animation-play-state:running}.music-meta{min-width:0;flex:1}.music-kicker{display:block;font-size:.56rem;font-weight:950;letter-spacing:.11em;text-transform:uppercase;color:rgba(255,255,255,.52)}.music-now-title{display:block;margin-top:.12rem;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.82rem;font-weight:950;color:#fff;text-shadow:0 0 .7rem rgba(255,255,255,.18)}
    .music-volume{display:flex;align-items:center;gap:.5rem;margin:.62rem 0 .55rem;padding:.42rem .55rem;border-radius:999px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}.music-volume span{font-size:.75rem}.music-volume input{width:100%!important;max-width:none!important;margin:0!important}
    .music-controls{display:grid;grid-template-columns:2.15rem 2.45rem 2.15rem 1fr 1fr;align-items:center;gap:.35rem;margin-top:.2rem}.music-control,.music-mode{border:0;border-radius:999px;height:2.15rem;padding:0 .62rem;font-weight:950;color:#fff;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 0 .7rem rgba(101,239,255,.08);cursor:pointer}.music-control.main{background:linear-gradient(135deg,#65efff,#ff0b72);color:#101116}.music-mode.active{background:linear-gradient(135deg,#65efff,#ff0b72);color:#101116}.music-picker{width:100%;height:2.2rem;margin-top:.55rem;border:0;border-radius:999px;padding:0 .75rem;color:#fff;background:rgba(255,255,255,.09);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-weight:850;outline:none}.music-picker option{background:#101116;color:#fff}.music-progress-wrap{margin-top:.6rem;height:.4rem;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12)}.music-progress{width:0%;height:100%;border-radius:999px;background:linear-gradient(90deg,#65efff,#fff,#ff0b72);box-shadow:0 0 .9rem rgba(101,239,255,.45)}.music-bottom{display:flex;align-items:center;justify-content:space-between;gap:.7rem;margin-top:.4rem;font-size:.6rem;color:rgba(255,255,255,.58);font-weight:850}.music-count{white-space:nowrap}.music-source{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @keyframes musicSpin{to{transform:rotate(360deg)}}@keyframes discSpin{to{transform:rotate(360deg)}}
    @media(max-width:650px){.sound-panel{left:50%!important;right:auto!important;top:auto!important;bottom:5.6rem!important;transform:translateX(-50%)!important;width:min(22rem,92vw)!important;max-width:92vw!important;padding:.65rem!important;border-radius:1.4rem!important;display:flex!important;align-items:stretch!important;gap:.55rem!important}.sound-toggle{flex:0 0 2.5rem!important;width:2.5rem!important;height:2.5rem!important}.sound-stack{width:100%!important;min-width:0!important}.sound-stack>.volume-slider{display:none!important}.music-title{display:none!important}.music-console{width:100%!important;margin:.15rem 0 0!important;padding:.7rem!important;border-radius:1.2rem!important}.music-topline{gap:.52rem}.music-disc{width:2rem;height:2rem}.music-kicker{font-size:.52rem}.music-now-title{font-size:.76rem}.music-volume{margin:.55rem 0 .5rem;padding:.38rem .5rem}.music-controls{grid-template-columns:repeat(3,1fr);gap:.38rem}.music-mode{grid-column:span 1;font-size:.72rem}.music-picker{margin-top:.5rem;height:2.25rem;font-size:.76rem}.music-bottom{font-size:.54rem}.music-source{max-width:9.5rem}.live-widgets.mobile-open{padding-bottom:12rem}.draw-dock{bottom:.85rem!important;right:.75rem!important}}
  `;
  document.head.appendChild(css);

  const panel = document.createElement('div');
  panel.className = 'music-console';
  panel.innerHTML = `
    <div class="music-topline"><span class="music-disc" aria-hidden="true"></span><span class="music-meta"><span class="music-kicker">Now Playing</span><span class="music-now-title" id="musicNowTitle">Loading playlist</span></span></div>
    <div class="music-volume"><span>🔊</span><div id="volumeMount"></div></div>
    <div class="music-controls"><button class="music-control" id="prevTrack" type="button">←</button><button class="music-control main" id="playPauseTrack" type="button">▶</button><button class="music-control" id="nextTrack" type="button">→</button><button class="music-mode active" id="shuffleToggle" type="button">Shuffle</button><button class="music-mode" id="repeatToggle" type="button">Repeat</button></div>
    <select class="music-picker" id="songPicker"><option>Loading songs...</option></select>
    <div class="music-progress-wrap"><div class="music-progress" id="musicProgress"></div></div>
    <div class="music-bottom"><span class="music-count" id="musicCount">0 songs</span><span class="music-source" id="musicSource">Drop songs in assets/music</span></div>`;
  soundStack.appendChild(panel);

  const volumeMount = panel.querySelector('#volumeMount');
  if (volumeSlider && volumeMount) volumeMount.appendChild(volumeSlider);

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

  const cleanTitle = (name='') => decodeURIComponent(String(name)).replace(/\.[a-z0-9]+$/i,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim() || 'Unknown Track';
  const uniqueTracks = (tracks) => { const seen = new Set(); return tracks.filter(t => t?.src && !seen.has(t.src) && seen.add(t.src)); };
  const shuffle = (list) => { const copy=[...list]; for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];} return copy; };
  const encodedPath = (path, fileName) => `./${path}/${encodeURIComponent(fileName).replace(/%2F/g,'/')}`;

  async function scanPath(path){
    try{const res=await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=main&t=${Date.now()}`,{cache:'no-store'}); if(!res.ok)return[]; const files=await res.json(); if(!Array.isArray(files))return[]; return files.filter(f=>f.type==='file'&&AUDIO_EXT.test(f.name)).map(f=>({title:cleanTitle(f.name),src:encodedPath(path,f.name),folder:path}));}catch{return[];}
  }
  function rebuildQueue(keep=true){const old=currentTrack?.src; queue=shuffleOn?shuffle(playlist):[...playlist]; if(keep&&old){const found=queue.findIndex(t=>t.src===old); if(found>-1)queueIndex=found;}else queueIndex=0;}
  function updatePicker(){picker.innerHTML=''; playlist.forEach(t=>{const o=document.createElement('option'); o.value=t.src; o.textContent=t.title; picker.appendChild(o);}); count.textContent=`${playlist.length} song${playlist.length===1?'':'s'}`; source.textContent=playlist.some(t=>t.folder==='assets/music')?'Auto-loaded from assets/music':'Auto-loaded playlist';}
  function setLabels(track){if(songLabel)songLabel.textContent=`♪ ${track.title}`; nowTitle.textContent=track.title; picker.value=track.src; const live=document.getElementById('liveSong'); if(live)live.textContent=track.title; document.title=`mrtacosi • ${track.title}`;}
  function setTrackByQueue(next, play=true){if(!playlist.length)return; if(!queue.length)rebuildQueue(false); queueIndex=((next%queue.length)+queue.length)%queue.length; currentTrack=queue[queueIndex]; audio.loop=false; audio.src=currentTrack.src; audio.load(); setLabels(currentTrack); if(play){audio.muted=false;audio.play().catch(()=>{});} updateButtons();}
  function setTrackBySrc(src, play=true){const track=playlist.find(t=>t.src===src); if(!track)return; currentTrack=track; rebuildQueue(true); const q=queue.findIndex(t=>t.src===src); queueIndex=q>-1?q:0; audio.loop=false; audio.src=track.src; audio.load(); setLabels(track); if(play){audio.muted=false;audio.play().catch(()=>{});} updateButtons();}
  function nextTrack(){if(!ready)return; if(repeatOn&&currentTrack)return setTrackBySrc(currentTrack.src,true); if(queueIndex>=queue.length-1)rebuildQueue(false); setTrackByQueue(queueIndex+1,true);}
  function prevTrack(){if(!ready)return; if(audio.currentTime>3){audio.currentTime=0;return;} setTrackByQueue(queueIndex-1,true);}
  function updateButtons(){panel.classList.toggle('playing',!audio.paused&&!audio.ended); playPause.textContent=audio.paused?'▶':'Ⅱ'; shuffleButton.classList.toggle('active',shuffleOn); repeatButton.classList.toggle('active',repeatOn);}
  function updateProgress(){progress.style.width=`${audio.duration?Math.min(100,(audio.currentTime/audio.duration)*100):0}%`; requestAnimationFrame(updateProgress);}
  async function loadPlaylist(){const detected=[...(await scanPath('assets/music')),...(await scanPath('assets'))]; playlist=uniqueTracks([...detected,...fallback]).filter(t=>AUDIO_EXT.test(t.src)); if(!playlist.length)playlist=fallback; if(!playlist.length){nowTitle.textContent='No songs found';count.textContent='0 songs';source.textContent='Add songs to assets/music';return;} ready=true; updatePicker(); rebuildQueue(false); setTrackByQueue(0,false);}

  audio.addEventListener('ended',nextTrack); audio.addEventListener('play',updateButtons); audio.addEventListener('pause',updateButtons); audio.addEventListener('loadedmetadata',updateButtons);
  nextButton.addEventListener('click',nextTrack); prevButton.addEventListener('click',prevTrack); playPause.addEventListener('click',()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause();updateButtons();}); picker.addEventListener('change',()=>setTrackBySrc(picker.value,true)); shuffleButton.addEventListener('click',()=>{shuffleOn=!shuffleOn;rebuildQueue(true);updateButtons();}); repeatButton.addEventListener('click',()=>{repeatOn=!repeatOn;updateButtons();});
  loadPlaylist(); updateProgress();
})();
