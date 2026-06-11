(() => {
  const css = document.createElement('style');
  css.textContent = `
    .sound-panel.player-loaded,
    .sound-panel.player-on{
      top:1rem!important;left:1rem!important;width:min(17rem,90vw)!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;display:block!important
    }
    .sound-panel.player-open{width:min(32rem,94vw)!important}
    .sound-panel .sound-toggle,.sound-panel .music-title,.sound-panel .sound-stack>.volume-slider{display:none!important}
    .sound-panel .sound-stack{display:block!important;width:100%!important;min-width:0!important}
    .sound-panel .music-console{width:100%!important;padding:.72rem!important;border-radius:1.45rem!important;background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.045))!important;box-shadow:.75rem .75rem 2rem rgba(0,0,0,.52),-.35rem -.35rem 1.2rem rgba(255,255,255,.06),inset 0 0 0 1px rgba(255,255,255,.13)!important;backdrop-filter:blur(20px) saturate(1.25)!important}
    .sound-panel .music-topline{display:grid!important;grid-template-columns:4.25rem minmax(0,1fr)!important;align-items:center!important;text-align:left!important;gap:.62rem!important}
    .sound-panel .music-disc{width:4.25rem!important;height:4.25rem!important;border-radius:50%!important;background:radial-gradient(circle,#fff 0 10%,#111217 11% 21%,#65efff 22% 26%,#1a1c27 27% 58%,#ff0b72 59% 67%,#080910 68%)!important;box-shadow:inset .15rem .15rem .45rem rgba(255,255,255,.4),inset -.15rem -.15rem .45rem rgba(0,0,0,.5),0 0 1rem rgba(101,239,255,.22)!important}
    .sound-panel .music-kicker{font-size:.5rem!important;letter-spacing:.1em!important}.sound-panel .music-now-title{font-size:.78rem!important;max-width:100%!important;text-align:left!important}
    .music-mode-toggle{width:100%;height:2rem;margin:.55rem 0 .35rem;border:0;border-radius:999px;font-weight:950;font-size:.72rem;color:#111217;background:linear-gradient(135deg,#65efff,#ff0b72);box-shadow:0 0 .8rem rgba(101,239,255,.2);cursor:pointer}
    .sound-panel .music-volume{width:100%!important;margin:.35rem 0 .2rem!important;padding:.38rem .55rem!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.11)!important}
    .sound-panel .music-volume input{width:100%!important;max-width:none!important;margin:0!important;height:.36rem!important}
    .sound-panel .music-controls{display:grid!important;grid-template-columns:2.1rem 2.7rem 2.1rem 1fr 1fr!important;justify-content:center!important;gap:.35rem!important;margin-top:.45rem!important}
    .sound-panel:not(.player-open) .music-controls .music-control:not(.main),.sound-panel:not(.player-open) .music-controls .music-mode,.sound-panel:not(.player-open) .music-picker,.sound-panel:not(.player-open) .music-bottom{display:none!important}
    .sound-panel:not(.player-open) .music-controls{grid-template-columns:2.9rem!important}.sound-panel:not(.player-open) .music-control.main{margin:auto!important}
    .sound-panel .music-control{border-radius:50%!important;height:2.1rem!important;min-width:2.1rem!important;padding:0!important}.sound-panel .music-control.main{height:2.9rem!important;min-width:2.9rem!important;font-size:1.05rem!important;background:linear-gradient(135deg,#65efff,#ff0b72)!important;color:#101116!important}
    .sound-panel .music-mode{border-radius:999px!important;height:2.1rem!important;font-size:.7rem!important}.sound-panel #shuffleToggle{grid-column:auto!important}.sound-panel #repeatToggle{grid-column:auto!important}
    .sound-panel .music-picker{height:2.35rem!important;margin-top:.55rem!important;border-radius:999px!important;width:100%!important}.sound-panel.player-open .music-picker{display:block!important}.sound-panel.player-open .music-console{padding:.85rem!important}.sound-panel.player-open .music-topline{grid-template-columns:4.25rem minmax(0,1fr) minmax(8rem,11rem)!important}.sound-panel.player-open .music-volume{margin:0!important}
    @media(max-width:650px){.sound-panel.player-loaded,.sound-panel.player-on{left:50%!important;top:auto!important;bottom:5.4rem!important;transform:translateX(-50%)!important;width:min(16.8rem,90vw)!important}.sound-panel.player-open{width:min(20rem,92vw)!important}.sound-panel .music-console{padding:.62rem!important;border-radius:1.25rem!important}.sound-panel .music-topline{grid-template-columns:3.5rem minmax(0,1fr)!important}.sound-panel .music-disc{width:3.5rem!important;height:3.5rem!important}.sound-panel .music-now-title{font-size:.72rem!important}.sound-panel.player-open .music-topline{grid-template-columns:3.5rem minmax(0,1fr)!important}.sound-panel.player-open .music-volume{grid-column:1/-1;margin:.45rem 0 0!important}.sound-panel.player-open .music-controls{grid-template-columns:repeat(3,1fr)!important}.sound-panel.player-open .music-mode{font-size:.68rem!important}.sound-panel.player-open .music-picker{height:2.2rem!important;font-size:.74rem!important}.live-widgets.mobile-open{padding-bottom:13rem!important}}
  `;
  document.head.appendChild(css);

  function applyPlayerTheme(){
    const soundPanel=document.querySelector('.sound-panel');
    const player=document.querySelector('.music-console');
    if(!soundPanel||!player)return;
    soundPanel.classList.add('player-loaded');
    if(!document.querySelector('.music-mode-toggle')){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='music-mode-toggle';
      btn.textContent='Music Mode';
      btn.addEventListener('click',()=>{
        soundPanel.classList.toggle('player-open');
        btn.textContent=soundPanel.classList.contains('player-open')?'Close Music Mode':'Music Mode';
      });
      const top=player.querySelector('.music-topline');
      top?.after(btn);
    }
  }

  applyPlayerTheme();
  setTimeout(applyPlayerTheme,300);
  setTimeout(applyPlayerTheme,1200);
})();
