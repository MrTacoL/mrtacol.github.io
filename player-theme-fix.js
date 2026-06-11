(() => {
  const css = document.createElement('style');
  css.textContent = `
    .music-page-toggle{position:fixed;left:1rem;bottom:1rem;z-index:95;border:0;border-radius:999px;padding:.72rem 1rem;font-size:.78rem;font-weight:950;letter-spacing:.02em;color:#101116;background:linear-gradient(135deg,#65efff,#ff0b72);box-shadow:0 .75rem 1.8rem rgba(0,0,0,.4),0 0 1rem rgba(101,239,255,.24);cursor:pointer}
    .sound-panel.player-loaded,.sound-panel.player-on{position:fixed!important;left:50%!important;bottom:4.8rem!important;top:auto!important;transform:translateX(-50%)!important;width:min(34rem,94vw)!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;display:block!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;z-index:90!important}
    body.music-mode-open .sound-panel.player-loaded,body.music-mode-open .sound-panel.player-on{opacity:1!important;visibility:visible!important;pointer-events:auto!important}
    @media(min-width:651px){body.music-mode-open .sound-panel.player-loaded,body.music-mode-open .sound-panel.player-on{top:1rem!important;bottom:auto!important}.sound-panel.drag-ready .music-console{cursor:grab}.sound-panel.dragging .music-console{cursor:grabbing!important;user-select:none!important}}
    .sound-panel .sound-toggle,.sound-panel .music-title,.sound-panel .sound-stack>.volume-slider{display:none!important}.sound-panel .sound-stack{display:block!important;width:100%!important;min-width:0!important}
    .sound-panel .music-console{width:100%!important;padding:.9rem!important;border-radius:1.55rem!important;background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.045))!important;box-shadow:.75rem .75rem 2rem rgba(0,0,0,.52),-.35rem -.35rem 1.2rem rgba(255,255,255,.06),inset 0 0 0 1px rgba(255,255,255,.13)!important;backdrop-filter:blur(20px) saturate(1.25)!important}
    .sound-panel .music-topline{display:grid!important;grid-template-columns:4.25rem minmax(0,1fr) minmax(9rem,12rem)!important;align-items:center!important;text-align:left!important;gap:.65rem!important}.sound-panel .music-disc{width:4.25rem!important;height:4.25rem!important;border-radius:50%!important;background:radial-gradient(circle,#fff 0 10%,#111217 11% 21%,#65efff 22% 26%,#1a1c27 27% 58%,#ff0b72 59% 67%,#080910 68%)!important;box-shadow:inset .15rem .15rem .45rem rgba(255,255,255,.4),inset -.15rem -.15rem .45rem rgba(0,0,0,.5),0 0 1rem rgba(101,239,255,.22)!important}
    .sound-panel .music-kicker{font-size:.5rem!important;letter-spacing:.1em!important}.sound-panel .music-now-title{font-size:.8rem!important;max-width:100%!important;text-align:left!important}.sound-panel .music-volume{width:100%!important;margin:0!important;padding:.38rem .55rem!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.11)!important}.sound-panel .music-volume input{width:100%!important;max-width:none!important;margin:0!important;height:.36rem!important}
    .music-mode-toggle{display:none!important}.sound-panel .music-controls{display:grid!important;grid-template-columns:2.15rem 2.9rem 2.15rem 1fr 1fr!important;justify-content:center!important;gap:.38rem!important;margin-top:.55rem!important}.sound-panel .music-control{border-radius:50%!important;height:2.15rem!important;min-width:2.15rem!important;padding:0!important}.sound-panel .music-control.main{height:2.9rem!important;min-width:2.9rem!important;font-size:1.05rem!important;background:linear-gradient(135deg,#65efff,#ff0b72)!important;color:#101116!important}.sound-panel .music-mode{border-radius:999px!important;height:2.15rem!important;font-size:.7rem!important}.sound-panel #shuffleToggle,.sound-panel #repeatToggle{grid-column:auto!important}
    .sound-panel .music-picker{display:block!important;width:100%!important;height:2.35rem!important;margin-top:.6rem!important;border-radius:999px!important}.sound-panel .music-bottom{display:flex!important}
    @media(max-width:650px){.music-page-toggle{left:50%;bottom:1rem;transform:translateX(-50%);padding:.72rem 1.15rem}.sound-panel.player-loaded,.sound-panel.player-on{left:0!important;right:0!important;top:0!important;bottom:0!important;transform:none!important;width:100vw!important;max-width:none!important;height:100svh!important;padding:1rem!important;display:grid!important;place-items:center!important;background:rgba(0,0,0,.12)!important}body.music-mode-open .stage,body.music-mode-open .live-widgets,body.music-mode-open .mobile-live-toggle,body.music-mode-open .projects-modal,body.music-mode-open .activity-card,body.music-mode-open .socials,body.music-mode-open .action-row{display:none!important}.sound-panel .sound-stack{width:min(21rem,92vw)!important}.sound-panel .music-console{padding:.9rem!important;border-radius:1.45rem!important}.sound-panel .music-topline{grid-template-columns:3.5rem minmax(0,1fr)!important}.sound-panel .music-disc{width:3.5rem!important;height:3.5rem!important}.sound-panel .music-now-title{font-size:.72rem!important}.sound-panel .music-volume{grid-column:1/-1;margin:.45rem 0 0!important}.sound-panel .music-controls{grid-template-columns:repeat(3,1fr)!important}.sound-panel .music-mode{font-size:.68rem!important}.sound-panel .music-picker{height:2.2rem!important;font-size:.74rem!important}.sound-panel .music-bottom{display:flex!important}}
  `;
  document.head.appendChild(css);

  function setupDrag(soundPanel, player){
    if(soundPanel.dataset.dragReady==='true')return;
    soundPanel.dataset.dragReady='true';
    soundPanel.classList.add('drag-ready');
    const saved=JSON.parse(localStorage.getItem('musicPlayerPosition')||'null');
    if(saved&&window.matchMedia('(min-width:651px)').matches){
      soundPanel.style.left=saved.left+'px';
      soundPanel.style.top=saved.top+'px';
      soundPanel.style.bottom='auto';
      soundPanel.style.transform='none';
    }
    let startX=0,startY=0,startLeft=0,startTop=0,drag=false;
    player.addEventListener('pointerdown',(event)=>{
      if(!window.matchMedia('(min-width:651px)').matches)return;
      if(event.target.closest('button,select,input,a,iframe'))return;
      const rect=soundPanel.getBoundingClientRect();
      drag=true;startX=event.clientX;startY=event.clientY;startLeft=rect.left;startTop=rect.top;
      soundPanel.classList.add('dragging');
      soundPanel.style.left=rect.left+'px';soundPanel.style.top=rect.top+'px';soundPanel.style.bottom='auto';soundPanel.style.transform='none';
      player.setPointerCapture(event.pointerId);
    });
    player.addEventListener('pointermove',(event)=>{
      if(!drag)return;
      const width=soundPanel.offsetWidth,height=soundPanel.offsetHeight;
      const left=Math.max(8,Math.min(window.innerWidth-width-8,startLeft+event.clientX-startX));
      const top=Math.max(8,Math.min(window.innerHeight-height-8,startTop+event.clientY-startY));
      soundPanel.style.left=left+'px';soundPanel.style.top=top+'px';
    });
    player.addEventListener('pointerup',()=>{
      if(!drag)return;drag=false;soundPanel.classList.remove('dragging');
      localStorage.setItem('musicPlayerPosition',JSON.stringify({left:parseFloat(soundPanel.style.left)||16,top:parseFloat(soundPanel.style.top)||16}));
    });
  }

  function setupMusicMode(){
    const soundPanel=document.querySelector('.sound-panel');
    const player=document.querySelector('.music-console');
    if(!soundPanel||!player)return;
    soundPanel.classList.add('player-loaded','player-open');
    setupDrag(soundPanel,player);
    if(!document.querySelector('.music-page-toggle')){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='music-page-toggle';
      btn.textContent='Music Mode';
      btn.addEventListener('click',()=>{
        const open=!document.body.classList.contains('music-mode-open');
        document.body.classList.toggle('music-mode-open',open);
        btn.textContent=open?'Close Music Mode':'Music Mode';
      });
      document.body.appendChild(btn);
    }
  }

  setupMusicMode();
  setTimeout(setupMusicMode,300);
  setTimeout(setupMusicMode,1200);
})();
