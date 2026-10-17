// Puzzle games (mostly DOM-based)
(() => {
  const A = window.Arcade;
  const WORDS5 = 'about above actor acute admit adopt adult after again agent agree ahead alarm album alert alien align alive allow alone along alter amber angel anger angle angry apart apple apply arena argue arise armor array arrow aside asset audio avoid award aware badge baker basic beach beard beast begin being below bench berry birth black blade blame blank blast blaze blend bless blind block blood bloom board boost booth bound brain brand brave bread break brick bride brief bring broad brown brush build bunch burst buyer cabin cable candy cargo carry catch cause chain chair chalk charm chart chase cheap check cheek chess chest chief child chill choir civil claim class clean clear click cliff climb clock close cloud coach coast color couch could count court cover crack craft crane crash cream crime crisp cross crowd crown crush curve cycle daily dance dealt death debut delay depth diary dirty dizzy dodge doubt dough draft drain drama drawn dream dress drift drill drink drive eager eagle early earth eight elbow elder elite empty enemy enjoy enter entry equal error event every exact exist extra faith false fancy feast fence fever field fifth fight final flame flash fleet float flood floor flour fluid focus force forge forth found frame fresh front frost fruit funny ghost giant given glass globe glory glove grace grade grain grand grant grape grass great green greet grill gross group grown guard guess guest guide habit happy harsh heart heavy hello hobby honey honor horse hotel house human humor ideal image index inner input issue ivory jelly jewel joint judge juice knife knock label laser later laugh layer learn lemon level light limit lucky lunch magic major maker march match maybe mayor medal metal minor mixer model money month moral motor mount mouse mouth movie music nerve never night noble noise north novel nurse ocean offer often olive onion opera orbit order other outer owner paint panel panic paper party pasta patch peace peach pearl pedal phase phone photo piano piece pilot pitch pizza place plain plane plant plate point polar pound power press price pride prime print prize proof proud pulse punch pupil queen quick quiet quote radar radio raise rally range rapid ratio reach react ready realm rebel refer relax reply rider ridge right rival river roast robot rocky rough round route royal rugby ruler rural salad sauce scale scare scene scope score scout screw seize sense serve seven shade shake shape share shark sharp sheep shelf shell shift shine shirt shock shoot short shout sight skill skirt skull slate sleep slice slide smart smile smoke snake solar solid solve sound south space spare spark speak speed spend spice spike spine spoon sport squad stack staff stage stain stake stamp stand start state steam steel stick still stone storm story stove strip study stuff style sugar suite sunny super sweet swing sword table taste teach teeth thank theme thick thief thing think third thumb tiger title toast token topic torch total touch tough tower toxic trace track trade trail train treat trend trial tribe trick truck truly trust truth twist uncle under union unity upper upset urban usual valid value video vinyl virus visit vital vivid vocal voice waste watch water whale wheat wheel white whole woman world worry worth wound woven wrist write wrong yield young youth zebra'.split(' ');

  A.add({
    id: '2048', name: '2048', icon: '🔢', cat: 'Puzzle',
    how: 'Arrow keys / WASD or swipe. Merge matching tiles to reach 2048.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:repeat(4,1fr);width:min(26rem,100%);padding:.5rem;border-radius:1rem;background:#161823';
      let b = Array(16).fill(0), won = false;
      const COL = { 0: 'rgba(255,255,255,.04)', 2: '#2b2f45', 4: '#353a5c', 8: '#7b4dff', 16: '#9b5bff', 32: '#c65bff', 64: '#ff4fa3', 128: '#ff0b72', 256: '#ff6a3d', 512: '#ffb03d', 1024: '#ffd166', 2048: '#43ff8f' };
      const cells = b.map(() => { const c = g.el('div', 'g-cell', '', grid); c.style.cursor = 'default'; return c; });
      const addTile = () => { const empty = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); if (empty.length) b[g.pick(empty)] = Math.random() < 0.9 ? 2 : 4; };
      const draw = () => cells.forEach((c, i) => { c.textContent = b[i] || ''; c.style.background = COL[b[i]] || '#43ff8f'; c.style.color = b[i] >= 1024 ? '#111' : '#fff'; c.style.fontSize = b[i] >= 1024 ? '1.05rem' : '1.35rem'; });
      const slide = (row) => { const v = row.filter(Boolean); for (let i = 0; i < v.length - 1; i++) if (v[i] === v[i + 1]) { v[i] *= 2; g.add(v[i]); if (v[i] === 2048 && !won) { won = true; g.msg('You made 2048! Keep going.'); } v.splice(i + 1, 1); } while (v.length < 4) v.push(0); return v; };
      const lines = { left: [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => r * 4 + c)), right: [0, 1, 2, 3].map((r) => [3, 2, 1, 0].map((c) => r * 4 + c)), up: [0, 1, 2, 3].map((c) => [0, 1, 2, 3].map((r) => r * 4 + c)), down: [0, 1, 2, 3].map((c) => [3, 2, 1, 0].map((r) => r * 4 + c)) };
      const canMove = () => b.includes(0) || b.some((v, i) => (i % 4 < 3 && v === b[i + 1]) || (i < 12 && v === b[i + 4]));
      g.dir((d) => {
        if (g.ended) return;
        const before = b.join();
        for (const idx of lines[d]) { const out = slide(idx.map((i) => b[i])); idx.forEach((i, k) => (b[i] = out[k])); }
        if (b.join() !== before) addTile();
        draw();
        if (!canMove()) g.over('No moves left');
      });
      addTile(); addTile(); draw();
    }
  });

  A.add({
    id: 'mines', name: 'Minesweeper', icon: '💣', cat: 'Puzzle', low: true, fmt: (v) => v + 's',
    how: 'Click to dig, right-click (or long-press) to flag. Clear every safe square.',
    play(g) {
      const N = 10, MINES = 15;
      const wrap = g.el('div', 'g', null, g.stage);
      const info = g.el('div', 'g-text', `💣 ${MINES} mines`, wrap);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = `grid-template-columns:repeat(${N},1fr);width:min(30rem,100%);gap:.2rem`;
      let mines = null, open = 0, flags = 0, t0 = 0;
      const cells = Array.from({ length: N * N }, (_, i) => ({ i, x: i % N, y: Math.floor(i / N), mine: false, open: false, flag: false, n: 0, el: g.el('button', 'g-cell', '', grid) }));
      const nb = (c) => cells.filter((o) => o !== c && Math.abs(o.x - c.x) <= 1 && Math.abs(o.y - c.y) <= 1);
      const place = (safe) => { const pool = g.shuffle(cells.filter((c) => c !== safe && !nb(safe).includes(c))).slice(0, MINES); pool.forEach((c) => (c.mine = true)); cells.forEach((c) => (c.n = nb(c).filter((o) => o.mine).length)); mines = pool; t0 = performance.now(); };
      const COLORS = ['', '#65efff', '#43ff8f', '#ff0b72', '#b793ff', '#ffd166', '#ff8a3d', '#fff', '#aaa'];
      const reveal = (c) => {
        if (c.open || c.flag) return;
        c.open = true; open++;
        c.el.style.background = 'rgba(255,255,255,.14)'; c.el.disabled = true;
        if (c.mine) { c.el.textContent = '💥'; mines.forEach((m) => (m.el.textContent = m === c ? '💥' : '💣')); g.score(Math.round((performance.now() - t0) / 1000)); return g.over('Boom!', false); }
        if (c.n) { c.el.textContent = c.n; c.el.style.color = COLORS[c.n]; } else nb(c).forEach(reveal);
      };
      const flag = (c) => { if (c.open || !mines) return; c.flag = !c.flag; flags += c.flag ? 1 : -1; c.el.textContent = c.flag ? '🚩' : ''; info.textContent = `💣 ${MINES - flags} left`; };
      const check = () => { if (!g.ended && open === N * N - MINES) { g.score(Math.round((performance.now() - t0) / 1000)); g.over('Cleared!'); } };
      cells.forEach((c) => {
        let press;
        c.el.addEventListener('click', () => { if (g.ended) return; if (!mines) place(c); reveal(c); check(); });
        c.el.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!g.ended) flag(c); });
        c.el.addEventListener('touchstart', () => { press = setTimeout(() => { press = 'done'; flag(c); }, 450); }, { passive: true });
        c.el.addEventListener('touchend', (e) => { if (press === 'done') e.preventDefault(); else clearTimeout(press); });
      });
      g.every(1000, () => { if (mines && !g.ended) g.score(Math.round((performance.now() - t0) / 1000)); });
    }
  });

  A.add({
    id: 'sudoku', name: 'Sudoku', icon: '9️⃣', cat: 'Puzzle', low: true, fmt: (v) => g2time(v),
    how: 'Fill every row, column and 3×3 box with 1–9. Pick a square, then a number. Wrong numbers turn pink.',
    play(g) {
      const solved = Array(81).fill(0);
      const ok = (b, i, n) => { const r = Math.floor(i / 9), c = i % 9; for (let k = 0; k < 9; k++) if (b[r * 9 + k] === n || b[k * 9 + c] === n) return false; const br = r - (r % 3), bc = c - (c % 3); for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) if (b[(br + y) * 9 + bc + x] === n) return false; return true; };
      const fill = (b, i = 0) => { if (i === 81) return true; for (const n of g.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) if (ok(b, i, n)) { b[i] = n; if (fill(b, i + 1)) return true; } b[i] = 0; return false; };
      fill(solved);
      const puzzle = [...solved];
      g.shuffle([...Array(81).keys()]).slice(0, 45).forEach((i) => (puzzle[i] = 0));
      const board = [...puzzle];
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:repeat(9,1fr);width:min(30rem,100%);gap:2px';
      let sel = -1, t0 = performance.now(), mistakes = 0;
      const cells = board.map((v, i) => {
        const c = g.el('button', 'g-cell', v || '', grid);
        const r = Math.floor(i / 9), col = i % 9;
        c.style.borderRadius = '.25rem';
        if (col % 3 === 2 && col < 8) c.style.marginRight = '4px';
        if (r % 3 === 2 && r < 8) c.style.marginBottom = '4px';
        if (puzzle[i]) { c.style.color = '#fff'; c.style.background = 'rgba(255,255,255,.12)'; } else c.style.color = '#65efff';
        c.addEventListener('click', () => { if (puzzle[i] || g.ended) return; sel = i; paint(); });
        return c;
      });
      const pad = g.el('div', 'g-row', null, wrap);
      const set = (n) => {
        if (sel < 0 || g.ended) return;
        board[sel] = n; cells[sel].textContent = n || '';
        if (n && n !== solved[sel]) { mistakes++; g.msg(`Mistakes: ${mistakes}`); }
        paint();
        if (board.every((v, i) => v === solved[i])) { g.score(Math.round((performance.now() - t0) / 1000)); g.over('Solved!'); }
      };
      for (let n = 1; n <= 9; n++) g.el('button', 'g-btn', String(n), pad).addEventListener('click', () => set(n));
      g.el('button', 'g-btn', 'Erase', pad).addEventListener('click', () => set(0));
      const paint = () => cells.forEach((c, i) => { if (puzzle[i]) return; c.style.background = i === sel ? 'rgba(101,239,255,.28)' : 'rgba(255,255,255,.05)'; c.style.color = board[i] && board[i] !== solved[i] ? '#ff0b72' : '#65efff'; });
      g.key((k) => { if (/^[1-9]$/.test(k)) set(Number(k)); if (k === 'backspace' || k === 'delete' || k === '0') set(0); });
      g.dir((d) => { if (sel < 0) sel = 0; const m = { up: -9, down: 9, left: -1, right: 1 }[d]; let n = sel; do { n = (n + m + 81) % 81; } while (puzzle[n] && n !== sel); sel = n; paint(); });
      g.every(1000, () => !g.ended && g.score(Math.round((performance.now() - t0) / 1000)));
      paint();
    }
  });
  const g2time = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  A.add({
    id: 'fifteen', name: 'Sliding 15', icon: '🧩', cat: 'Puzzle', low: true, fmt: (v) => v + ' moves',
    how: 'Click a tile next to the gap (or use arrow keys) to slide it. Put 1–15 in order.',
    play(g) {
      let b = [...Array(15).keys()].map((n) => n + 1).concat(0);
      const swapGap = (dir) => { const z = b.indexOf(0), x = z % 4, y = Math.floor(z / 4); const t = { up: y < 3 ? z + 4 : -1, down: y > 0 ? z - 4 : -1, left: x < 3 ? z + 1 : -1, right: x > 0 ? z - 1 : -1 }[dir]; if (t < 0) return false; [b[z], b[t]] = [b[t], b[z]]; return true; };
      for (let i = 0; i < 400; i++) swapGap(g.pick(['up', 'down', 'left', 'right']));
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:repeat(4,1fr);width:min(24rem,100%)';
      const cells = b.map((_, i) => { const c = g.el('button', 'g-cell', '', grid); c.addEventListener('click', () => clickAt(i)); return c; });
      const draw = () => cells.forEach((c, i) => { c.textContent = b[i] || ''; c.style.visibility = b[i] ? 'visible' : 'hidden'; c.style.background = b[i] === i + 1 ? 'rgba(67,255,143,.22)' : 'rgba(255,255,255,.08)'; });
      const done = () => b.every((v, i) => v === (i + 1) % 16);
      const after = () => { g.add(1); draw(); if (done()) g.over('Solved!'); };
      const clickAt = (i) => { if (g.ended) return; const z = b.indexOf(0); if ((Math.abs(i - z) === 1 && Math.floor(i / 4) === Math.floor(z / 4)) || Math.abs(i - z) === 4) { [b[z], b[i]] = [b[i], b[z]]; after(); } };
      g.dir((d) => { if (!g.ended && swapGap(d)) after(); });
      draw();
    }
  });

  A.add({
    id: 'lights', name: 'Lights Out', icon: '💡', cat: 'Puzzle', low: true, fmt: (v) => v + ' moves',
    how: 'Clicking a light flips it and its neighbours. Turn every light off.',
    play(g) {
      const N = 5;
      let on = Array(N * N).fill(false);
      const flip = (i) => { const x = i % N, y = Math.floor(i / N); [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N) on[ny * N + nx] = !on[ny * N + nx]; }); };
      do { for (let k = 0; k < 12; k++) flip(g.randi(0, N * N - 1)); } while (!on.some(Boolean));
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = `grid-template-columns:repeat(${N},1fr);width:min(24rem,100%)`;
      const cells = on.map((_, i) => { const c = g.el('button', 'g-cell', '', grid); c.addEventListener('click', () => { if (g.ended) return; flip(i); g.add(1); draw(); if (!on.some(Boolean)) g.over('Lights out!'); }); return c; });
      const draw = () => cells.forEach((c, i) => { c.style.background = on[i] ? 'radial-gradient(circle,#fff6c2,#ffd166 60%,#ff8a3d)' : 'rgba(255,255,255,.05)'; c.style.boxShadow = on[i] ? '0 0 1rem rgba(255,209,102,.6)' : 'none'; });
      draw();
    }
  });

  A.add({
    id: 'memory', name: 'Memory Match', icon: '🃏', cat: 'Puzzle', low: true, fmt: (v) => v + ' moves',
    how: 'Flip two cards at a time and find all the matching pairs in as few moves as possible.',
    play(g) {
      const EMO = g.shuffle(['🌮', '🚗', '🎮', '🐸', '🍕', '🎧', '👾', '⚡', '🔥', '💎', '🌙', '🍩']).slice(0, 8);
      const deck = g.shuffle([...EMO, ...EMO]);
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:repeat(4,1fr);width:min(26rem,100%)';
      let first = null, lock = false, found = 0;
      deck.forEach((e) => {
        const c = g.el('button', 'g-cell', '', grid);
        c.style.fontSize = '2rem';
        const card = { e, el: c, open: false };
        c.addEventListener('click', () => {
          if (lock || card.open || g.ended) return;
          card.open = true; c.textContent = e; c.style.background = 'rgba(101,239,255,.2)';
          if (!first) { first = card; return; }
          g.add(1);
          if (first.e === e) { found++; first.el.style.background = c.style.background = 'rgba(67,255,143,.25)'; first = null; if (found === EMO.length) g.over('All matched!'); return; }
          lock = true; const a = first; first = null;
          g.after(700, () => { [a, card].forEach((k) => { k.open = false; k.el.textContent = ''; k.el.style.background = ''; }); lock = false; });
        });
        return card;
      });
    }
  });

  A.add({
    id: 'simon', name: 'Simon Says', icon: '🟢', cat: 'Puzzle',
    how: 'Watch the colours light up, then repeat the pattern. It gets one longer each round.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      const status = g.el('div', 'g-big', 'Watch…', wrap);
      status.style.fontSize = '1.4rem';
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:1fr 1fr;width:min(22rem,100%);gap:.6rem';
      const COLS = ['#43ff8f', '#ff0b72', '#ffd166', '#65efff'];
      const pads = COLS.map((c, i) => { const b = g.el('button', 'g-cell', '', grid); b.style.background = c; b.style.opacity = '.35'; b.style.borderRadius = '1.2rem'; b.addEventListener('click', () => press(i)); return b; });
      let seq = [], pos = 0, input = false;
      let ac;
      const beep = (i) => { try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), v = ac.createGain(); o.frequency.value = [330, 392, 494, 587][i]; v.gain.setValueAtTime(0.12, ac.currentTime); v.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3); o.connect(v).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.3); } catch {} };
      const flash = (i, ms = 380) => { pads[i].style.opacity = '1'; beep(i); g.after(ms, () => (pads[i].style.opacity = '.35')); };
      const round = () => { input = false; seq.push(g.randi(0, 3)); pos = 0; status.textContent = 'Watch…'; seq.forEach((i, k) => g.after(600 + k * 560, () => flash(i))); g.after(600 + seq.length * 560, () => { input = true; status.textContent = 'Your turn'; }); };
      const press = (i) => {
        if (!input || g.ended) return;
        flash(i, 200);
        if (i !== seq[pos]) { status.textContent = 'Wrong!'; return g.over(`You reached ${seq.length}`); }
        pos++;
        if (pos === seq.length) { g.add(1); input = false; status.textContent = 'Nice!'; g.after(700, round); }
      };
      g.after(400, round);
    }
  });

  A.add({
    id: 'mastermind', name: 'Code Breaker', icon: '🔐', cat: 'Puzzle', low: true, fmt: (v) => v + ' tries',
    how: 'Guess the secret 4-colour code in 10 tries. ● right colour & spot, ○ right colour wrong spot.',
    play(g) {
      const COLS = ['#ff0b72', '#65efff', '#43ff8f', '#ffd166', '#b793ff', '#ff8a3d'];
      const code = Array.from({ length: 4 }, () => g.randi(0, 5));
      const wrap = g.el('div', 'g', null, g.stage);
      const history = g.el('div', 'g', null, wrap);
      history.style.gap = '.35rem';
      const cur = g.el('div', 'g-row', null, wrap);
      const pal = g.el('div', 'g-row', null, wrap);
      const actions = g.el('div', 'g-row', null, wrap);
      let guess = [];
      const dot = (c, size = '2.2rem') => { const d = g.el('span'); d.style.cssText = `display:inline-block;width:${size};height:${size};border-radius:50%;background:${c};border:2px solid rgba(255,255,255,.2)`; return d; };
      const drawCur = () => { cur.innerHTML = ''; for (let i = 0; i < 4; i++) cur.appendChild(dot(guess[i] != null ? COLS[guess[i]] : 'rgba(255,255,255,.06)')); };
      COLS.forEach((c, i) => { const b = g.el('button', 'g-btn', '', pal); b.style.cssText = `width:2.6rem;height:2.6rem;padding:0;background:${c}`; b.setAttribute('aria-label', 'colour ' + (i + 1)); b.addEventListener('click', () => { if (guess.length < 4 && !g.ended) { guess.push(i); drawCur(); } }); });
      g.el('button', 'g-btn', 'Undo', actions).addEventListener('click', () => { guess.pop(); drawCur(); });
      g.el('button', 'g-btn primary', 'Guess', actions).addEventListener('click', () => {
        if (guess.length < 4 || g.ended) return;
        let black = 0, white = 0; const a = [], b = [];
        guess.forEach((v, i) => (v === code[i] ? black++ : (a.push(v), b.push(code[i]))));
        a.forEach((v) => { const k = b.indexOf(v); if (k > -1) { white++; b.splice(k, 1); } });
        const row = g.el('div', 'g-row', null, history); row.style.alignItems = 'center';
        guess.forEach((v) => row.appendChild(dot(COLS[v], '1.5rem')));
        g.el('span', 'g-text', ' ' + '●'.repeat(black) + '○'.repeat(white), row).style.minWidth = '4rem';
        g.add(1); guess = []; drawCur();
        if (black === 4) return g.over('Cracked it!');
        if (g.score() >= 10) { g.msg('The code was:'); history.appendChild(g.el('div', 'g-row')).append(...code.map((v) => dot(COLS[v], '1.5rem'))); g.over('Out of tries', false); }
      });
      drawCur();
    }
  });

  A.add({
    id: 'hanoi', name: 'Tower of Hanoi', icon: '🗼', cat: 'Puzzle', low: true, fmt: (v) => v + ' moves',
    how: 'Move the whole tower to the right peg. Click a peg to pick up its top disc, then another to drop it. Never put a big disc on a small one.',
    play(g) {
      const N = 5, W = 600, H = 320;
      g.canvas(W, H);
      const pegs = [[5, 4, 3, 2, 1], [], []];
      let held = null;
      g.tap((px) => {
        if (g.ended) return;
        const p = Math.min(2, Math.floor(px / (W / 3)));
        if (held == null) { if (pegs[p].length) held = p; return; }
        const d = pegs[held][pegs[held].length - 1], top = pegs[p][pegs[p].length - 1];
        if (p !== held && (top == null || top > d)) { pegs[p].push(pegs[held].pop()); g.add(1); if (pegs[2].length === N) g.over(g.score() === 31 ? 'Perfect solve!' : 'Solved!'); }
        held = null;
      });
      g.loop(() => {
        g.clear();
        pegs.forEach((peg, p) => {
          const cx = (p + 0.5) * (W / 3);
          g.rect(cx - 4, 70, 8, 220, held === p ? g.C.cyan : '#3a3d52');
          peg.forEach((d, i) => { const w = 30 + d * 26, lifted = held === p && i === peg.length - 1; g.rrect(cx - w / 2, 270 - i * 26 - (lifted ? 30 : 0), w, 22, 8, `hsl(${300 - d * 40} 85% 62%)`); });
        });
        g.rect(20, 292, W - 40, 8, '#3a3d52');
        g.text('Best possible: 31 moves', W / 2, 30, 15, g.C.dim);
      });
    }
  });

  A.add({
    id: 'peg', name: 'Peg Solitaire', icon: '📍', cat: 'Puzzle', low: true, fmt: (v) => v + ' pegs left',
    how: 'Jump a peg over a neighbour into an empty hole to remove it. Finish with as few pegs as possible (1 is perfect).',
    play(g) {
      const L = ['  ooo  ', '  ooo  ', 'ooooooo', 'ooo.ooo', 'ooooooo', '  ooo  ', '  ooo  '];
      const board = L.map((r) => r.split(''));
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:repeat(7,1fr);width:min(24rem,100%)';
      let sel = null;
      const count = () => board.flat().filter((c) => c === 'o').length;
      const moves = () => { const out = []; for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if (board[y][x] === 'o') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (board[y + dy * 2]?.[x + dx * 2] === '.' && board[y + dy][x + dx] === 'o') out.push(1); return out.length; };
      const cells = [];
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const c = g.el('button', 'g-cell', '', grid);
        c.style.borderRadius = '50%';
        if (board[y][x] === ' ') c.style.visibility = 'hidden';
        c.addEventListener('click', () => {
          if (g.ended) return;
          if (board[y][x] === 'o') { sel = [x, y]; return draw(); }
          if (board[y][x] === '.' && sel) {
            const [sx, sy] = sel, mx = (sx + x) / 2, my = (sy + y) / 2;
            if (((Math.abs(sx - x) === 2 && sy === y) || (Math.abs(sy - y) === 2 && sx === x)) && board[my][mx] === 'o') {
              board[sy][sx] = '.'; board[my][mx] = '.'; board[y][x] = 'o'; sel = [x, y];
              g.score(count());
              if (!moves()) { draw(); return g.over(count() === 1 ? 'Perfect!' : 'No moves left'); }
            }
          }
          draw();
        });
        cells.push({ c, x, y });
      }
      const draw = () => cells.forEach(({ c, x, y }) => { const v = board[y][x]; c.style.background = v === 'o' ? (sel && sel[0] === x && sel[1] === y ? '#65efff' : '#ff0b72') : 'rgba(255,255,255,.06)'; });
      g.score(count());
      draw();
    }
  });

  A.add({
    id: 'sokoban', name: 'Box Pusher', icon: '📦', cat: 'Puzzle',
    how: 'Arrow keys / WASD or swipe. Push every box onto a green target. Restart if you get stuck.',
    play(g) {
      // every level checked with a BFS solver
      const LEVELS = [
        ['#####', '#@  #', '# $ #', '#  .#', '#####'],
        ['  ####', '###  #', '#. $ #', '#  $@#', '#.  ##', '#####'],
        ['######', '#    #', '# #@ #', '# $* #', '# .* #', '#    #', '######'],
        ['#######', '#.  # #', '#   $ #', '#.$@  #', '##  $ #', ' #.   #', ' ######'],
        ['########', '#      #', '# .**$@#', '#      #', '#####  #', '    ####'],
        ['####', '# .#', '#  ###', '#*@  #', '#  $ #', '#  ###', '####'],
        ['  ####', '###  ####', '#     $ #', '# #  #$ #', '# . .#@ #', '#########']
      ];
      let lvl = g.save.get('level', 0) % LEVELS.length;
      const W = 480, H = 480;
      g.canvas(W, H);
      let map, p, boxes, goals, moves;
      const load = () => {
        map = LEVELS[lvl].map((r) => r.split('')); boxes = []; goals = []; moves = 0;
        map.forEach((row, y) => row.forEach((c, x) => { if (c === '@' || c === '+') p = { x, y }; if ('$*'.includes(c)) boxes.push({ x, y }); if ('.*+'.includes(c)) goals.push({ x, y }); map[y][x] = c === '#' ? '#' : ' '; }));
        g.msg(`Level ${lvl + 1} of ${LEVELS.length}`);
      };
      load();
      const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const boxAt = (x, y) => boxes.find((b) => b.x === x && b.y === y);
      g.dir((d) => {
        if (g.ended) return;
        const [dx, dy] = D[d], nx = p.x + dx, ny = p.y + dy;
        if (map[ny]?.[nx] !== ' ') return;
        const b = boxAt(nx, ny);
        if (b) { if (map[ny + dy]?.[nx + dx] !== ' ' || boxAt(nx + dx, ny + dy)) return; b.x += dx; b.y += dy; }
        p.x = nx; p.y = ny; moves++;
        if (boxes.every((bx) => goals.some((q) => q.x === bx.x && q.y === bx.y))) {
          g.add(1); lvl++;
          if (lvl >= LEVELS.length) { g.save.set('level', 0); return g.over('All levels done!'); }
          g.save.set('level', lvl); g.after(400, load);
        }
      });
      g.loop(() => {
        const rows = map.length, cols = Math.max(...map.map((r) => r.length)), S = Math.floor(Math.min(W / cols, H / rows)), ox = (W - cols * S) / 2, oy = (H - rows * S) / 2;
        g.clear();
        map.forEach((row, y) => row.forEach((c, x) => { if (c === '#') g.rrect(ox + x * S + 1, oy + y * S + 1, S - 2, S - 2, 6, '#3a3d52'); }));
        goals.forEach((q) => g.ring(ox + q.x * S + S / 2, oy + q.y * S + S / 2, S / 4, g.C.green, 3));
        boxes.forEach((b) => { const on = goals.some((q) => q.x === b.x && q.y === b.y); g.rrect(ox + b.x * S + 6, oy + b.y * S + 6, S - 12, S - 12, 6, on ? g.C.green : '#c98a3d'); });
        g.circle(ox + p.x * S + S / 2, oy + p.y * S + S / 2, S / 3, g.C.cyan);
        g.text(`Moves ${moves}`, W - 10, 16, 13, g.C.dim, 'right');
      });
    }
  });

  A.add({
    id: 'wordle', name: 'Word Guess', icon: '🟩', cat: 'Puzzle', low: true, fmt: (v) => v + ' guesses',
    how: 'Guess the 5-letter word in 6 tries. Green = right spot, yellow = in the word, grey = not in it.',
    play(g) {
      const answer = g.pick(WORDS5).toUpperCase();
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:repeat(5,1fr);width:min(19rem,100%);gap:.3rem';
      const cells = Array.from({ length: 30 }, () => { const c = g.el('div', 'g-cell', '', grid); c.style.cursor = 'default'; return c; });
      const kb = g.el('div', 'g', null, wrap);
      kb.style.gap = '.3rem';
      const keyEls = {};
      let row = 0, cur = '';
      const draw = () => { for (let i = 0; i < 5; i++) cells[row * 5 + i].textContent = cur[i] || ''; };
      const paintKey = (ch, col) => { const k = keyEls[ch]; if (!k) return; const rank = { '#3a3d4a': 1, '#c9a227': 2, '#2fae5c': 3 }; if ((rank[col] || 0) > (rank[k.dataset.c] || 0)) { k.dataset.c = col; k.style.background = col; } };
      const submit = () => {
        if (cur.length < 5 || g.ended) return;
        const res = Array(5).fill('#3a3d4a'), pool = answer.split('');
        for (let i = 0; i < 5; i++) if (cur[i] === answer[i]) { res[i] = '#2fae5c'; pool[i] = null; }
        for (let i = 0; i < 5; i++) if (res[i] !== '#2fae5c') { const k = pool.indexOf(cur[i]); if (k > -1) { res[i] = '#c9a227'; pool[k] = null; } }
        res.forEach((c, i) => { cells[row * 5 + i].style.background = c; paintKey(cur[i], c); });
        g.add(1);
        if (cur === answer) return g.over('You got it!');
        row++; cur = '';
        if (row === 6) { g.msg(`The word was ${answer}`); g.over('Out of guesses', false); }
      };
      const type = (k) => { if (g.ended) return; if (k === 'enter') submit(); else if (k === 'backspace') { cur = cur.slice(0, -1); draw(); } else if (/^[a-z]$/.test(k) && cur.length < 5) { cur += k.toUpperCase(); draw(); } };
      ['QWERTYUIOP', 'ASDFGHJKL', '↵ZXCVBNM⌫'].forEach((line) => {
        const r = g.el('div', 'g-row', null, kb); r.style.gap = '.25rem'; r.style.flexWrap = 'nowrap';
        [...line].forEach((ch) => { const b = g.el('button', 'g-btn', ch, r); b.style.cssText = `min-height:2.6rem;padding:0;width:${ch === '↵' || ch === '⌫' ? '3rem' : '2rem'};border-radius:.4rem`; keyEls[ch] = b; b.addEventListener('click', () => type(ch === '↵' ? 'enter' : ch === '⌫' ? 'backspace' : ch.toLowerCase())); });
      });
      g.key((k) => type(k));
    }
  });

  A.add({
    id: 'hangman', name: 'Hangman', icon: '🪢', cat: 'Puzzle',
    how: 'Guess the word one letter at a time. 6 wrong guesses and you lose. Win streaks count as your score.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      const pic = g.el('div', 'g-big', '', wrap);
      const word = g.el('div', 'g-big', '', wrap);
      word.style.letterSpacing = '.3em';
      const kb = g.el('div', 'g-row', null, wrap);
      kb.style.maxWidth = '30rem';
      let answer, guessed, wrong, streak = 0;
      const STAGES = ['😀', '😐', '😟', '😧', '😨', '😰', '💀'];
      const draw = () => { pic.textContent = STAGES[wrong] + `  ${6 - wrong} left`; word.textContent = [...answer].map((c) => (guessed.has(c) ? c : '_')).join(''); };
      const newWord = () => {
        answer = g.pick(WORDS5.filter((w) => w.length >= 5)).toUpperCase(); guessed = new Set(); wrong = 0; kb.innerHTML = '';
        for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') { const b = g.el('button', 'g-btn', ch, kb); b.style.cssText = 'width:2.3rem;padding:0'; b.addEventListener('click', () => guess(ch, b)); }
        draw();
      };
      const guess = (ch, btn) => {
        if (g.ended || guessed.has(ch)) return;
        guessed.add(ch);
        btn = btn || [...kb.children].find((b) => b.textContent === ch);
        if (btn) { btn.disabled = true; btn.style.opacity = '.35'; }
        if (!answer.includes(ch)) wrong++;
        draw();
        if ([...answer].every((c) => guessed.has(c))) { streak++; g.score(streak); g.msg(`Got it! Streak ${streak}`); g.after(900, newWord); }
        else if (wrong >= 6) { g.msg(`The word was ${answer}`); g.over('Hanged!'); }
      };
      g.key((k) => { if (/^[a-z]$/.test(k)) guess(k.toUpperCase()); });
      newWord();
    }
  });

  A.add({
    id: 'flood', name: 'Flood It', icon: '🌊', cat: 'Puzzle', low: true, fmt: (v) => v + ' moves',
    how: 'Pick colours to flood the board from the top-left corner. Fill it all in 25 moves or fewer.',
    play(g) {
      const N = 12, COLS = ['#ff0b72', '#65efff', '#43ff8f', '#ffd166', '#b793ff', '#ff8a3d'];
      const b = Array.from({ length: N * N }, () => g.randi(0, 5));
      const wrap = g.el('div', 'g', null, g.stage);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = `grid-template-columns:repeat(${N},1fr);width:min(26rem,100%);gap:0;border-radius:.6rem;overflow:hidden`;
      const cells = b.map(() => { const c = g.el('div', 'g-cell', '', grid); c.style.cssText += ';border:0;border-radius:0;cursor:default'; return c; });
      const pal = g.el('div', 'g-row', null, wrap);
      const draw = () => cells.forEach((c, i) => (c.style.background = COLS[b[i]]));
      const fill = (to) => {
        const from = b[0]; if (from === to) return;
        const stack = [0], seen = new Set([0]);
        while (stack.length) { const i = stack.pop(); b[i] = to; const x = i % N, y = Math.floor(i / N); for (const j of [x > 0 ? i - 1 : -1, x < N - 1 ? i + 1 : -1, y > 0 ? i - N : -1, y < N - 1 ? i + N : -1]) if (j >= 0 && !seen.has(j) && b[j] === from) { seen.add(j); stack.push(j); } }
        g.add(1); draw();
        if (b.every((v) => v === b[0])) g.over('Flooded!');
        else if (g.score() >= 25) g.over('Out of moves', false);
      };
      COLS.forEach((c, i) => { const btn = g.el('button', 'g-btn', '', pal); btn.style.cssText = `width:2.8rem;height:2.8rem;padding:0;background:${c}`; btn.setAttribute('aria-label', 'colour ' + (i + 1)); btn.addEventListener('click', () => !g.ended && fill(i)); });
      g.msg('Moves left: 25');
      const orig = g.add; g.add = (n) => { const s = orig(n); g.msg(`Moves left: ${25 - s}`); return s; };
      draw();
    }
  });
})();
