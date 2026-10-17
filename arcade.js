// Arcade shell + the small API every game gets (canvas, input, loop, score, game over).
// A game is { id, name, icon, cat, how, low?, fmt?, play(g) }. Everything a game registers
// through g.on / g.loop / g.every / g.after is torn down when it restarts or closes.
(() => {
  const games = [];
  const $ = (s) => document.querySelector(s);
  const CATS = ['All', 'Action', 'Puzzle', 'Board', 'Quick'];
  const C = { bg: '#0b0c12', cyan: '#65efff', pink: '#ff0b72', purple: '#b793ff', green: '#43ff8f', yellow: '#ffd166', white: '#ffffff', dim: 'rgba(255,255,255,.55)', line: 'rgba(255,255,255,.12)' };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('arcade:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('arcade:' + k, JSON.stringify(v)); } catch {} }
  };
  let current = null;
  let cat = 'All';
  let query = '';

  const fmtOf = (g) => (v) => (g.fmt ? g.fmt(v) : String(v));
  const time = (s) => (s < 60 ? s.toFixed(1) + 's' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`);

  function makeApi(game, stage, cleanups) {
    let score = 0;
    let ended = false;
    const fmt = fmtOf(game);
    const best = () => store.get('best:' + game.id, null);
    const hud = () => { $('#score').textContent = fmt(score); const b = best(); $('#best').textContent = b == null ? '—' : fmt(b); };
    const fns = { tap: [], up: [], key: [], dir: [], swipe: [] };
    const g = {
      C, stage, W: 0, H: 0, ctx: null, cv: null,
      held: new Set(),
      ptr: { x: 0, y: 0, down: false, t: 0 },
      get ended() { return ended; },
      rand: (a, b) => a + Math.random() * (b - a),
      randi: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
      pick: (a) => a[Math.floor(Math.random() * a.length)],
      shuffle: (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
      time,
      save: { get: (k, d) => store.get(game.id + ':' + k, d), set: (k, v) => store.set(game.id + ':' + k, v) },
      on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)); },
      every(ms, fn) { const id = setInterval(fn, ms); cleanups.push(() => clearInterval(id)); return id; },
      after(ms, fn) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; },
      loop(fn) {
        let last = performance.now();
        let id = 0;
        const tick = (t) => { const dt = Math.min(0.05, (t - last) / 1000); last = t; if (!ended) fn(dt, t); id = requestAnimationFrame(tick); };
        id = requestAnimationFrame(tick);
        cleanups.push(() => cancelAnimationFrame(id));
      },
      canvas(w = 480, h = 480) {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h; cv.className = 'ar-canvas';
        cv.style.width = `min(100%, calc((100svh - 12.5rem) * ${w / h}))`;
        stage.appendChild(cv);
        Object.assign(g, { cv, ctx: cv.getContext('2d'), W: w, H: h });
        const map = (e) => { const r = cv.getBoundingClientRect(); g.ptr.x = ((e.clientX - r.left) * w) / r.width; g.ptr.y = ((e.clientY - r.top) * h) / r.height; };
        g.on(cv, 'pointermove', (e) => { map(e); g.ptr.t = performance.now(); });
        g.on(cv, 'pointerdown', (e) => { map(e); g.ptr.down = true; g.ptr.t = performance.now(); try { cv.setPointerCapture(e.pointerId); } catch {} fns.tap.forEach((f) => f(g.ptr.x, g.ptr.y, e)); });
        g.on(cv, 'pointerup', () => { g.ptr.down = false; fns.up.forEach((f) => f(g.ptr.x, g.ptr.y)); });
        g.on(cv, 'pointercancel', () => { g.ptr.down = false; });
        g.on(cv, 'contextmenu', (e) => e.preventDefault());
        return g.ctx;
      },
      tap(fn) { fns.tap.push(fn); },
      up(fn) { fns.up.push(fn); },
      key(fn) { fns.key.push(fn); },
      dir(fn) { fns.dir.push(fn); },
      swipe(fn) { fns.swipe.push(fn); },
      score(v) { if (v !== undefined && v !== score) { score = v; hud(); } return score; },
      add(n = 1) { score += n; hud(); return score; },
      msg(t) { $('#gameMsg').textContent = t || ''; },
      over(title = 'Game over', save = true) {
        if (ended) return;
        ended = true;
        let text = `Score ${fmt(score)}`;
        if (save) {
          const b = best();
          if (b == null || (game.low ? score < b : score > b)) { store.set('best:' + game.id, score); text += ' · New best!'; }
        }
        hud();
        $('#ovTitle').textContent = title;
        $('#ovText').textContent = text;
        g.after(save ? 450 : 300, () => { $('#overlay').hidden = false; $('#ovAgain').focus(); });
      },
      // drawing helpers
      clear(c = C.bg) { g.ctx.fillStyle = c; g.ctx.fillRect(0, 0, g.W, g.H); },
      rect(x, y, w, h, c) { g.ctx.fillStyle = c; g.ctx.fillRect(x, y, w, h); },
      rrect(x, y, w, h, r, c) { const x2 = g.ctx; x2.fillStyle = c; x2.beginPath(); x2.roundRect ? x2.roundRect(x, y, w, h, r) : x2.rect(x, y, w, h); x2.fill(); },
      circle(x, y, r, c) { const x2 = g.ctx; x2.fillStyle = c; x2.beginPath(); x2.arc(x, y, Math.max(0, r), 0, Math.PI * 2); x2.fill(); },
      ring(x, y, r, c, lw = 2) { const x2 = g.ctx; x2.strokeStyle = c; x2.lineWidth = lw; x2.beginPath(); x2.arc(x, y, Math.max(0, r), 0, Math.PI * 2); x2.stroke(); },
      line(x1, y1, x2, y2, c, lw = 2) { const k = g.ctx; k.strokeStyle = c; k.lineWidth = lw; k.beginPath(); k.moveTo(x1, y1); k.lineTo(x2, y2); k.stroke(); },
      text(t, x, y, size = 20, c = C.white, align = 'center') { const k = g.ctx; k.fillStyle = c; k.font = `800 ${size}px Inter, system-ui, sans-serif`; k.textAlign = align; k.textBaseline = 'middle'; k.fillText(t, x, y); },
      // DOM helper for the non-canvas games
      el(tag, cls, text, parent) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (tag === 'button') e.type = 'button'; (parent || null)?.appendChild(e); return e; },
      _fns: fns
    };
    hud();
    return g;
  }

  function stop() {
    if (!current) return;
    current.cleanups.forEach((f) => { try { f(); } catch {} });
    current = null;
    $('#stage').innerHTML = '';
    $('#overlay').hidden = true;
    $('#gameMsg').textContent = '';
  }

  function start(game) {
    stop();
    const cleanups = [];
    const g = makeApi(game, $('#stage'), cleanups);
    current = { game, g, cleanups };
    try { game.play(g); } catch (err) { console.error(err); $('#stage').textContent = 'This game hit an error. Try Restart.'; }
  }

  function open(game) {
    $('#home').hidden = true;
    $('#play').hidden = false;
    $('#gameName').textContent = `${game.icon} ${game.name}`;
    $('#gameHow').textContent = game.how;
    history.replaceState(null, '', '#' + game.id);
    start(game);
  }

  function close() {
    stop();
    $('#play').hidden = true;
    $('#home').hidden = false;
    history.replaceState(null, '', location.pathname + location.search);
    renderGrid();
  }

  function renderGrid() {
    const grid = $('#grid');
    grid.innerHTML = '';
    const list = games.filter((g) => (cat === 'All' || g.cat === cat) && (g.name + ' ' + g.cat).toLowerCase().includes(query));
    for (const game of list) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile';
      const best = store.get('best:' + game.id, null);
      b.innerHTML = '<span class="tile-icon"></span><span class="tile-name"></span><span class="tile-best"></span>';
      b.children[0].textContent = game.icon;
      b.children[1].textContent = game.name;
      b.children[2].textContent = best == null ? game.cat : `Best: ${fmtOf(game)(best)}`;
      b.addEventListener('click', () => open(game));
      grid.appendChild(b);
    }
    $('#count').textContent = `${list.length} game${list.length === 1 ? '' : 's'}`;
    $('#empty').hidden = list.length > 0;
  }

  // keyboard + swipe input, routed to whichever game is open
  const DIRS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
  document.addEventListener('keydown', (e) => {
    if (!current) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if (e.key === 'Escape') { close(); return; }
    if (typing) return;
    const k = e.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    current.g.held.add(k);
    current.g._fns.key.forEach((f) => f(k, e));
    if (DIRS[k] && !e.repeat) current.g._fns.dir.forEach((f) => f(DIRS[k]));
  });
  document.addEventListener('keyup', (e) => current?.g.held.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => current?.g.held.clear());
  let swipeStart = null;
  document.addEventListener('pointerdown', (e) => { if (current && e.target.closest('#stage')) swipeStart = { x: e.clientX, y: e.clientY }; });
  document.addEventListener('pointerup', (e) => {
    if (!current || !swipeStart) return;
    const dx = e.clientX - swipeStart.x, dy = e.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    current.g._fns.dir.forEach((f) => f(d));
    current.g._fns.swipe.forEach((f) => f(d));
  });

  window.Arcade = {
    add(game) { games.push(game); },
    boot() {
      if (window.top !== window) document.body.classList.add('in-frame');
      $('#sub').textContent = `${games.length} games · scores save on this device · works offline after your first visit`;
      const chips = $('#chips');
      for (const c of CATS) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = c;
        b.setAttribute('aria-pressed', String(c === cat));
        b.addEventListener('click', () => { cat = c; chips.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); renderGrid(); });
        chips.appendChild(b);
      }
      $('#search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderGrid(); });
      $('#backBtn').addEventListener('click', close);
      $('#ovBack').addEventListener('click', close);
      $('#restartBtn').addEventListener('click', () => current && start(current.game));
      $('#ovAgain').addEventListener('click', () => current && start(current.game));
      renderGrid();
      const fromHash = games.find((g) => g.id === location.hash.slice(1));
      if (fromHash) open(fromHash);
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
    },
    _games: games,
    _open: (id) => open(games.find((g) => g.id === id)),
    _current: () => current
  };
})();
