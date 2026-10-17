// Board games vs the computer + quick games
(() => {
  const A = window.Arcade;

  A.add({
    id: 'ttt', name: 'Tic-Tac-Toe', icon: '❌', cat: 'Board',
    how: 'You are X. Get three in a row. The computer never makes mistakes on Hard. Score = wins.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      const lvl = g.el('div', 'g-row', null, wrap);
      let hard = g.save.get('hard', true);
      const mode = g.el('button', 'g-btn', '', lvl);
      const status = g.el('div', 'g-text', '', wrap);
      const grid = g.el('div', 'g-grid', null, wrap);
      grid.style.cssText = 'grid-template-columns:repeat(3,1fr);width:min(20rem,100%)';
      const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      const winner = (b) => { for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(Boolean) ? 'draw' : null; };
      const mm = (b, me) => { const w = winner(b); if (w === 'O') return 10; if (w === 'X') return -10; if (w) return 0; const vals = []; b.forEach((v, i) => { if (!v) { b[i] = me; vals.push(mm(b, me === 'O' ? 'X' : 'O')); b[i] = ''; } }); return me === 'O' ? Math.max(...vals) : Math.min(...vals); };
      let b, busy;
      const cells = Array.from({ length: 9 }, (_, i) => { const c = g.el('button', 'g-cell', '', grid); c.style.fontSize = '2.4rem'; c.addEventListener('click', () => move(i)); return c; });
      const draw = () => cells.forEach((c, i) => { c.textContent = b[i] === 'X' ? '❌' : b[i] === 'O' ? '⭕' : ''; });
      const finish = (w) => { if (w === 'X') { g.add(1); status.textContent = 'You win!'; } else if (w === 'O') status.textContent = 'Computer wins'; else status.textContent = 'Draw'; busy = true; g.after(1100, reset); };
      const ai = () => {
        const free = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
        let pick = g.pick(free);
        if (hard || Math.random() < 0.5) { let best = -99; for (const i of free) { b[i] = 'O'; const s = mm(b, 'X'); b[i] = ''; if (s > best) { best = s; pick = i; } } }
        b[pick] = 'O'; draw();
        const w = winner(b); if (w) return finish(w);
        busy = false; status.textContent = 'Your turn';
      };
      const move = (i) => { if (busy || b[i]) return; b[i] = 'X'; draw(); const w = winner(b); if (w) return finish(w); busy = true; status.textContent = 'Thinking…'; g.after(350, ai); };
      const reset = () => { b = Array(9).fill(''); busy = false; status.textContent = 'Your turn'; draw(); };
      const setMode = () => { mode.textContent = hard ? 'Mode: Hard' : 'Mode: Easy'; };
      mode.addEventListener('click', () => { hard = !hard; g.save.set('hard', hard); setMode(); });
      setMode(); reset();
    }
  });

  A.add({
    id: 'connect4', name: 'Connect Four', icon: '🔴', cat: 'Board',
    how: 'Drop your pink discs. Connect four in a row before the computer. Score = wins.',
    play(g) {
      const C = 7, R = 6, S = 64;
      g.canvas(C * S, R * S + 40);
      let b, busy, hover = 3, msg = 'Your turn';
      const reset = () => { b = Array.from({ length: R }, () => Array(C).fill(0)); busy = false; msg = 'Your turn'; };
      const drop = (bd, c, p) => { for (let r = R - 1; r >= 0; r--) if (!bd[r][c]) { bd[r][c] = p; return r; } return -1; };
      const win = (bd, p) => { for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { let k = 0; while (k < 4 && bd[r + dr * k]?.[c + dc * k] === p) k++; if (k === 4) return true; } return false; };
      const full = (bd) => bd[0].every(Boolean);
      const scoreLine = (bd) => { let s = 0; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { let ai = 0, me = 0; for (let k = 0; k < 4; k++) { const v = bd[r + dr * k]?.[c + dc * k]; if (v === undefined) { ai = me = -1; break; } if (v === 2) ai++; else if (v === 1) me++; } if (ai < 0) continue; if (!me) s += [0, 1, 4, 20, 1000][ai]; if (!ai) s -= [0, 1, 5, 30, 1000][me]; } for (let r = 0; r < R; r++) if (bd[r][3] === 2) s += 3; return s; };
      const mm = (bd, depth, aiTurn, a, bt) => {
        if (win(bd, 2)) return 100000 + depth; if (win(bd, 1)) return -100000 - depth; if (!depth || full(bd)) return scoreLine(bd);
        let best = aiTurn ? -Infinity : Infinity;
        for (const c of [3, 2, 4, 1, 5, 0, 6]) { const r = drop(bd, c, aiTurn ? 2 : 1); if (r < 0) continue; const v = mm(bd, depth - 1, !aiTurn, a, bt); bd[r][c] = 0; if (aiTurn) { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); bt = Math.min(bt, v); } if (a >= bt) break; }
        return best;
      };
      const aiMove = () => {
        let best = -Infinity, pick = 3;
        for (const c of [3, 2, 4, 1, 5, 0, 6]) { const r = drop(b, c, 2); if (r < 0) continue; const v = mm(b, 4, false, -Infinity, Infinity) + Math.random(); b[r][c] = 0; if (v > best) { best = v; pick = c; } }
        drop(b, pick, 2);
        if (win(b, 2)) { msg = 'Computer wins'; return g.after(1400, reset); }
        if (full(b)) { msg = 'Draw'; return g.after(1400, reset); }
        busy = false; msg = 'Your turn';
      };
      g.tap((px) => {
        if (busy) return;
        const c = g.clamp(Math.floor(px / S), 0, C - 1);
        if (drop(b, c, 1) < 0) return;
        if (win(b, 1)) { g.add(1); msg = 'You win!'; busy = true; return g.after(1400, reset); }
        if (full(b)) { msg = 'Draw'; busy = true; return g.after(1400, reset); }
        busy = true; msg = 'Thinking…'; g.after(250, aiMove);
      });
      reset();
      g.loop(() => {
        if (g.ptr.t) hover = g.clamp(Math.floor(g.ptr.x / S), 0, C - 1);
        g.clear('#0b0c12');
        g.text(msg, (C * S) / 2, 20, 16, g.C.dim);
        g.rrect(0, 40, C * S, R * S, 14, '#1d2a6b');
        if (!busy) g.circle(hover * S + S / 2, 40 + S / 2, 6, 'rgba(255,255,255,.5)');
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) g.circle(c * S + S / 2, 40 + r * S + S / 2, S / 2 - 6, b[r][c] === 1 ? g.C.pink : b[r][c] === 2 ? g.C.yellow : '#0b0c12');
      });
    }
  });

  A.add({
    id: 'reversi', name: 'Reversi', icon: '⚪', cat: 'Board',
    how: 'You are white. Place a disc so it traps the computer\'s discs between yours to flip them. Most discs wins.',
    play(g) {
      const N = 8, S = 56;
      g.canvas(N * S, N * S + 40);
      const b = Array.from({ length: N }, () => Array(N).fill(0));
      b[3][3] = b[4][4] = 1; b[3][4] = b[4][3] = 2;
      let turn = 1, msg = 'Your turn';
      const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      const flips = (x, y, p) => { if (b[y][x]) return []; const out = []; for (const [dx, dy] of DIRS) { const line = []; let cx = x + dx, cy = y + dy; while (b[cy]?.[cx] === 3 - p) { line.push([cx, cy]); cx += dx; cy += dy; } if (line.length && b[cy]?.[cx] === p) out.push(...line); } return out; };
      const moves = (p) => { const out = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const f = flips(x, y, p); if (f.length) out.push({ x, y, f }); } return out; };
      const place = (m, p) => { b[m.y][m.x] = p; m.f.forEach(([x, y]) => (b[y][x] = p)); };
      const count = (p) => b.flat().filter((v) => v === p).length;
      const end = () => { const me = count(1), ai = count(2); g.score(me); g.over(me > ai ? 'You win!' : me < ai ? 'Computer wins' : 'Draw'); };
      const W8 = [[100, -20, 10, 5, 5, 10, -20, 100], [-20, -50, -2, -2, -2, -2, -50, -20], [10, -2, 1, 1, 1, 1, -2, 10], [5, -2, 1, 0, 0, 1, -2, 5], [5, -2, 1, 0, 0, 1, -2, 5], [10, -2, 1, 1, 1, 1, -2, 10], [-20, -50, -2, -2, -2, -2, -50, -20], [100, -20, 10, 5, 5, 10, -20, 100]];
      const next = () => {
        if (turn === 1 && !moves(1).length) { if (!moves(2).length) return end(); turn = 2; msg = 'You have no moves — computer goes'; }
        if (turn === 2) {
          const ms = moves(2);
          if (!ms.length) { if (!moves(1).length) return end(); turn = 1; msg = 'Computer passes — your turn'; return; }
          g.after(450, () => { const m = ms.reduce((a, c) => (W8[c.y][c.x] + c.f.length > W8[a.y][a.x] + a.f.length ? c : a)); place(m, 2); turn = 1; msg = 'Your turn'; g.score(count(1)); next(); });
        }
      };
      g.tap((px, py) => {
        if (turn !== 1 || g.ended) return;
        const x = Math.floor(px / S), y = Math.floor((py - 40) / S);
        if (y < 0 || y >= N) return;
        const f = flips(x, y, 1);
        if (!f.length) return;
        place({ x, y, f }, 1); turn = 2; msg = 'Thinking…'; g.score(count(1)); next();
      });
      g.score(count(1));
      g.loop(() => {
        g.clear();
        g.text(`${msg}   ⚪ ${count(1)}  ⚫ ${count(2)}`, (N * S) / 2, 20, 15, g.C.dim);
        const hints = turn === 1 ? moves(1) : [];
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          g.rect(x * S + 1, 40 + y * S + 1, S - 2, S - 2, '#145a3a');
          if (b[y][x]) g.circle(x * S + S / 2, 40 + y * S + S / 2, S / 2 - 6, b[y][x] === 1 ? '#f4f5f8' : '#111');
        }
        hints.forEach((m) => g.circle(m.x * S + S / 2, 40 + m.y * S + S / 2, 5, 'rgba(255,255,255,.35)'));
      });
    }
  });

  A.add({
    id: 'nim', name: 'Nim', icon: '🪵', cat: 'Board',
    how: 'Take as many sticks as you like from ONE row. Whoever takes the last stick wins. The computer is sneaky. Score = wins.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      const status = g.el('div', 'g-text', '', wrap);
      const rowsEl = g.el('div', 'g', null, wrap);
      const actions = g.el('div', 'g-row', null, wrap);
      let rows, sel, busy;
      const take = g.el('button', 'g-btn primary', 'Take selected', actions);
      const reset = () => { rows = [1, 3, 5, 7]; sel = { r: -1, n: 0 }; busy = false; status.textContent = 'Your turn — tap sticks in one row'; draw(); };
      const draw = () => {
        rowsEl.innerHTML = '';
        rows.forEach((n, r) => {
          const row = g.el('div', 'g-row', null, rowsEl);
          for (let i = 0; i < n; i++) {
            const s = g.el('button', 'g-btn', '|', row);
            const on = sel.r === r && i >= n - sel.n;
            s.style.cssText = `width:1.6rem;min-height:3rem;padding:0;font-size:1.4rem;background:${on ? '#ff0b72' : 'rgba(255,255,255,.08)'}`;
            s.addEventListener('click', () => { if (busy) return; sel = { r, n: sel.r === r ? (on ? n - i - 1 : n - i) : n - i }; if (!sel.n) sel.r = -1; draw(); });
          }
        });
      };
      const done = (who) => { if (who === 'you') { g.add(1); status.textContent = 'You took the last stick — you win!'; } else status.textContent = 'Computer took the last stick'; busy = true; g.after(1600, reset); };
      const ai = () => {
        const x = rows.reduce((a, n) => a ^ n, 0);
        let r = -1, n = 1;
        if (x) { r = rows.findIndex((v) => (v ^ x) < v); n = rows[r] - (rows[r] ^ x); }
        else { r = rows.findIndex((v) => v > 0); n = 1; }
        rows[r] -= n;
        status.textContent = `Computer took ${n} from row ${r + 1}. Your turn`;
        draw();
        if (rows.every((v) => !v)) return done('ai');
        busy = false;
      };
      take.addEventListener('click', () => {
        if (busy || sel.r < 0) return;
        rows[sel.r] -= sel.n; sel = { r: -1, n: 0 }; draw();
        if (rows.every((v) => !v)) return done('you');
        busy = true; status.textContent = 'Thinking…'; g.after(600, ai);
      });
      reset();
    }
  });

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const newDeck = (g) => g.shuffle(SUITS.flatMap((s) => RANKS.map((r, i) => ({ r, s, v: i + 1 }))));
  const cardEl = (g, c, parent) => { const e = g.el('span', 'g-card' + (!c ? ' back' : c.s === '♥' || c.s === '♦' ? ' red' : ''), c ? c.r + c.s : '', parent); return e; };

  A.add({
    id: 'blackjack', name: 'Blackjack', icon: '🂡', cat: 'Quick',
    how: 'Get closer to 21 than the dealer without going over. You start with 100 chips; each hand bets 10.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      g.el('div', 'g-text', 'Dealer', wrap);
      const dealerEl = g.el('div', 'g-row', null, wrap);
      g.el('div', 'g-text', 'You', wrap);
      const youEl = g.el('div', 'g-row', null, wrap);
      const status = g.el('div', 'g-big', '', wrap);
      status.style.fontSize = '1.3rem';
      const actions = g.el('div', 'g-row', null, wrap);
      const hit = g.el('button', 'g-btn', 'Hit', actions), stand = g.el('button', 'g-btn primary', 'Stand', actions), deal = g.el('button', 'g-btn', 'Deal', actions);
      let deck, you, dealer, live = false;
      g.score(100);
      const total = (h) => { let t = h.reduce((a, c) => a + Math.min(10, c.v), 0); if (h.some((c) => c.v === 1) && t + 10 <= 21) t += 10; return t; };
      const draw = (reveal) => { dealerEl.innerHTML = ''; youEl.innerHTML = ''; dealer.forEach((c, i) => cardEl(g, i === 1 && !reveal ? null : c, dealerEl)); you.forEach((c) => cardEl(g, c, youEl)); hit.disabled = stand.disabled = !live; deal.disabled = live; };
      const settle = (text, delta) => { live = false; g.add(delta); status.textContent = `${text} (${delta >= 0 ? '+' : ''}${delta})`; draw(true); if (g.score() <= 0) g.over('Out of chips', false); };
      deal.addEventListener('click', () => {
        if (live || g.ended) return;
        if (!deck || deck.length < 15) deck = newDeck(g);
        you = [deck.pop(), deck.pop()]; dealer = [deck.pop(), deck.pop()]; live = true; status.textContent = `You: ${total(you)}`;
        draw(false);
        if (total(you) === 21) settle('Blackjack!', 15);
      });
      hit.addEventListener('click', () => { if (!live) return; you.push(deck.pop()); const t = total(you); status.textContent = `You: ${t}`; draw(false); if (t > 21) settle('Bust', -10); else if (t === 21) stand.click(); });
      stand.addEventListener('click', () => {
        if (!live) return;
        while (total(dealer) < 17) dealer.push(deck.pop());
        const y = total(you), d = total(dealer);
        if (d > 21 || y > d) settle(`You win ${y} vs ${d}`, 10); else if (y < d) settle(`Dealer wins ${d} vs ${y}`, -10); else settle(`Push ${y}`, 0);
      });
      you = []; dealer = []; draw(true);
      status.textContent = 'Press Deal';
      g.msg('Tip: your best chip count is saved. Leave with Back when you\'re ahead!');
      // leaving the table cashes out, so the chip count counts as a score
      g.on(document.getElementById('backBtn'), 'click', () => { if (!g.ended) g.over('Cashed out'); }, { capture: true });
    }
  });

  A.add({
    id: 'higher', name: 'Higher or Lower', icon: '🔼', cat: 'Quick',
    how: 'Will the next card be higher or lower? Aces are low. A tie counts as correct. Score = streak.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      const table = g.el('div', 'g-row', null, wrap);
      const status = g.el('div', 'g-text', 'Higher or lower?', wrap);
      const actions = g.el('div', 'g-row', null, wrap);
      let deck = newDeck(g), cur = deck.pop(), busy = false;
      const draw = (next) => { table.innerHTML = ''; const a = cardEl(g, cur, table); a.style.transform = 'scale(1.3)'; if (next !== undefined) { const b = cardEl(g, next, table); b.style.transform = 'scale(1.3)'; b.style.marginLeft = '1.2rem'; } };
      const guess = (up) => {
        if (busy || g.ended) return;
        if (deck.length < 2) deck = newDeck(g);
        const next = deck.pop();
        const ok = up ? next.v >= cur.v : next.v <= cur.v;
        draw(next); busy = true;
        if (ok) { g.add(1); status.textContent = 'Correct!'; g.after(700, () => { cur = next; busy = false; status.textContent = 'Higher or lower?'; draw(); }); }
        else { status.textContent = 'Wrong!'; g.over(`Streak of ${g.score()}`); }
      };
      g.el('button', 'g-btn primary', '▲ Higher', actions).addEventListener('click', () => guess(true));
      g.el('button', 'g-btn', '▼ Lower', actions).addEventListener('click', () => guess(false));
      g.dir((d) => { if (d === 'up') guess(true); if (d === 'down') guess(false); });
      draw();
    }
  });

  A.add({
    id: 'rps', name: 'Rock Paper Scissors', icon: '✊', cat: 'Quick',
    how: 'Beat the computer. It learns your habits, so mix it up! First to lose 3 rounds ends the run. Score = wins.',
    play(g) {
      const OPTS = [['rock', '✊'], ['paper', '✋'], ['scissors', '✌️']];
      const wrap = g.el('div', 'g', null, g.stage);
      const arena = g.el('div', 'g-big', '❔  vs  ❔', wrap);
      arena.style.fontSize = '3rem';
      const status = g.el('div', 'g-text', 'Pick one', wrap);
      const actions = g.el('div', 'g-row', null, wrap);
      let losses = 0;
      const counts = [1, 1, 1];
      const playRound = (me) => {
        if (g.ended) return;
        // guess the player's most common pick and counter it (with some randomness)
        const likely = counts.indexOf(Math.max(...counts));
        const ai = Math.random() < 0.6 ? (likely + 1) % 3 : g.randi(0, 2);
        counts[me]++;
        arena.textContent = `${OPTS[me][1]}  vs  ${OPTS[ai][1]}`;
        if (me === ai) status.textContent = 'Tie';
        else if ((me + 3 - ai) % 3 === 1) { g.add(1); status.textContent = `${OPTS[me][0]} beats ${OPTS[ai][0]} — you win!`; }
        else { losses++; status.textContent = `${OPTS[ai][0]} beats ${OPTS[me][0]} — ${3 - losses} lives left`; if (losses >= 3) g.over('Out of lives'); }
      };
      OPTS.forEach(([name, e], i) => { const b = g.el('button', 'g-btn', `${e} ${name}`, actions); b.style.fontSize = '1.1rem'; b.addEventListener('click', () => playRound(i)); });
      g.key((k) => { const i = { r: 0, p: 1, s: 2, 1: 0, 2: 1, 3: 2 }[k]; if (i !== undefined) playRound(i); });
    }
  });

  A.add({
    id: 'reaction', name: 'Reaction Test', icon: '⚡', cat: 'Quick', low: true, fmt: (v) => v + ' ms',
    how: 'Wait for green, then click / tap / press Space as fast as you can. Average of 5 tries.',
    play(g) {
      const box = g.el('button', 'g-cell', 'Click to start', g.stage);
      box.style.cssText = 'width:min(34rem,100%);aspect-ratio:16/10;font-size:1.4rem;border-radius:1.2rem;background:#2b2f45';
      let state = 'idle', t0 = 0, times = [];
      const go = () => {
        if (g.ended) return;
        if (state === 'idle' || state === 'result') { state = 'wait'; box.style.background = '#ff0b72'; box.textContent = 'Wait for green…'; g.after(g.rand(1200, 3500), () => { if (state !== 'wait') return; state = 'go'; t0 = performance.now(); box.style.background = '#2fae5c'; box.textContent = 'CLICK!'; }); }
        else if (state === 'wait') { state = 'result'; box.style.background = '#2b2f45'; box.textContent = 'Too soon! Click to try again'; }
        else if (state === 'go') {
          const ms = Math.round(performance.now() - t0); times.push(ms); state = 'result'; box.style.background = '#2b2f45';
          if (times.length >= 5) { const avg = Math.round(times.reduce((a, b) => a + b) / times.length); g.score(avg); box.textContent = `Average ${avg} ms`; g.over(avg < 250 ? 'Lightning fast!' : 'Done'); }
          else box.textContent = `${ms} ms — ${5 - times.length} to go. Click to continue`;
          g.msg(times.map((t) => t + 'ms').join(' · '));
        }
      };
      box.addEventListener('pointerdown', go);
      g.key((k) => { if (k === ' ' || k === 'enter') go(); });
    }
  });

  A.add({
    id: 'typing', name: 'Typing Speed', icon: '⌨️', cat: 'Quick', fmt: (v) => v + ' wpm',
    how: 'Type the words as fast as you can for 30 seconds. Score is words per minute (correct words only).',
    play(g) {
      const POOL = 'the quick brown fox jumps over lazy dog code build server plugin crate vault player game world block craft drift taco music night light fast slow point score level power magic stack frame pixel cloud storm river stone fire water earth sky dream ghost shadow neon pink blue green gold silver rocket planet orbit laser robot dragon castle knight sword shield arrow tower bridge forest ocean island desert jungle winter summer spring autumn'.split(' ');
      const words = Array.from({ length: 120 }, () => g.pick(POOL));
      const wrap = g.el('div', 'g', null, g.stage);
      const text = g.el('div', 'g-text', '', wrap);
      text.style.cssText = 'font-size:1.2rem;line-height:1.8;color:#fff;max-height:7.5rem;overflow:hidden;text-align:left;width:100%';
      const input = g.el('input', 'g-input', null, wrap);
      input.placeholder = 'Start typing to begin…'; input.autocomplete = 'off'; input.autocapitalize = 'off'; input.spellcheck = false;
      const timer = g.el('div', 'g-big', '30', wrap);
      let idx = 0, correct = 0, left = 30, started = false;
      const spans = words.map((w) => { const s = g.el('span', null, w + ' ', text); return s; });
      const paint = () => { spans.forEach((s, i) => { s.style.color = i < idx ? (s.dataset.ok === '1' ? '#43ff8f' : '#ff0b72') : i === idx ? '#65efff' : 'rgba(255,255,255,.7)'; s.style.textDecoration = i === idx ? 'underline' : 'none'; }); spans[idx]?.scrollIntoView({ block: 'nearest' }); };
      input.addEventListener('input', () => {
        if (g.ended) return;
        started = true;
        if (input.value.endsWith(' ')) { const typed = input.value.trim(); spans[idx].dataset.ok = typed === words[idx] ? '1' : '0'; if (typed === words[idx]) correct++; idx++; input.value = ''; g.score(Math.round(correct * (60 / Math.max(1, 30 - left)))); paint(); }
      });
      g.every(100, () => { if (!started || g.ended) return; left -= 0.1; timer.textContent = Math.max(0, Math.ceil(left)); if (left <= 0) { input.disabled = true; g.score(correct * 2); g.over(`${correct} words`); } });
      paint();
      g.after(50, () => input.focus());
    }
  });

  A.add({
    id: 'math', name: 'Math Sprint', icon: '➗', cat: 'Quick',
    how: 'Answer as many sums as you can in 45 seconds. Type the answer and press Enter.',
    play(g) {
      const wrap = g.el('div', 'g', null, g.stage);
      const q = g.el('div', 'g-big', '', wrap);
      const input = g.el('input', 'g-input', null, wrap);
      input.inputMode = 'numeric'; input.placeholder = 'Answer'; input.autocomplete = 'off';
      const timer = g.el('div', 'g-text', '45s', wrap);
      let ans = 0, left = 45;
      const next = () => {
        const lvl = Math.min(4, Math.floor(g.score() / 5));
        const op = g.pick(['+', '−', '×', lvl > 1 ? '÷' : '+']);
        let a = g.randi(2, 10 + lvl * 10), b = g.randi(2, 10 + lvl * 6);
        if (op === '×') { a = g.randi(2, 6 + lvl * 2); b = g.randi(2, 9 + lvl); }
        if (op === '÷') { b = g.randi(2, 9 + lvl); ans = g.randi(2, 9 + lvl); a = ans * b; } else ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
        q.textContent = `${a} ${op} ${b} = ?`; input.value = '';
      };
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' || g.ended) return;
        if (Number(input.value) === ans) { g.add(1); g.msg('✓'); } else g.msg(`✗ it was ${ans}`);
        next();
      });
      g.every(1000, () => { if (g.ended) return; left--; timer.textContent = left + 's'; if (left <= 0) { input.disabled = true; g.over("Time's up!"); } });
      next();
      g.after(50, () => input.focus());
    }
  });

  A.add({
    id: 'stroop', name: 'Color Trap', icon: '🎨', cat: 'Quick',
    how: 'Click the button matching the COLOUR of the word, not what it says. 30 seconds, wrong answers cost a point.',
    play(g) {
      const COLS = [['red', '#ff3b5c'], ['blue', '#4d8bff'], ['green', '#43ff8f'], ['yellow', '#ffd166'], ['purple', '#b793ff']];
      const wrap = g.el('div', 'g', null, g.stage);
      const word = g.el('div', 'g-big', '', wrap);
      word.style.fontSize = '3.4rem';
      const actions = g.el('div', 'g-row', null, wrap);
      const timer = g.el('div', 'g-text', '30s', wrap);
      let ink = 0, left = 30;
      const next = () => { const w = g.randi(0, 4); ink = g.randi(0, 4); word.textContent = COLS[w][0].toUpperCase(); word.style.color = COLS[ink][1]; };
      COLS.forEach(([name, c], i) => { const b = g.el('button', 'g-btn', name, actions); b.style.borderColor = c; b.addEventListener('click', () => { if (g.ended) return; if (i === ink) g.add(1); else g.add(-1); next(); }); });
      g.every(1000, () => { if (g.ended) return; left--; timer.textContent = left + 's'; if (left <= 0) g.over("Time's up!"); });
      next();
    }
  });

  A.add({
    id: 'clicker', name: 'Taco Clicker', icon: '🌮', cat: 'Quick', fmt: (v) => Math.floor(v).toLocaleString(),
    how: 'Click the taco to make tacos. Spend them on upgrades that make tacos for you. Progress saves automatically.',
    play(g) {
      const UP = [['🧑‍🍳 Cook', 15, 0.2], ['🚚 Food truck', 120, 1.5], ['🏪 Taco stand', 900, 9], ['🏭 Factory', 7000, 60], ['🚀 Space taquería', 60000, 420]];
      const s = g.save.get('state', { tacos: 0, total: 0, owned: [0, 0, 0, 0, 0], perClick: 1 });
      const wrap = g.el('div', 'g', null, g.stage);
      const count = g.el('div', 'g-big', '', wrap);
      const rate = g.el('div', 'g-text', '', wrap);
      const taco = g.el('button', 'g-cell', '🌮', wrap);
      taco.style.cssText = 'width:9rem;font-size:5rem;border-radius:50%;transition:transform .06s';
      const shop = g.el('div', 'g', null, wrap);
      shop.style.gap = '.4rem';
      const cost = (i) => Math.ceil(UP[i][1] * Math.pow(1.15, s.owned[i]));
      const clickCost = () => Math.ceil(50 * Math.pow(3, s.perClick - 1));
      const perSec = () => UP.reduce((a, u, i) => a + u[2] * s.owned[i], 0);
      const buttons = UP.map((u, i) => { const b = g.el('button', 'g-btn', '', shop); b.style.width = '100%'; b.addEventListener('click', () => { if (s.tacos >= cost(i)) { s.tacos -= cost(i); s.owned[i]++; draw(); } }); return b; });
      const clickBtn = g.el('button', 'g-btn', '', shop); clickBtn.style.width = '100%';
      clickBtn.addEventListener('click', () => { if (s.tacos >= clickCost()) { s.tacos -= clickCost(); s.perClick++; draw(); } });
      const draw = () => {
        count.textContent = `${Math.floor(s.tacos).toLocaleString()} tacos`;
        rate.textContent = `${perSec().toFixed(1)} per second · ${s.perClick} per click`;
        buttons.forEach((b, i) => { b.textContent = `${UP[i][0]} ×${s.owned[i]} — ${cost(i).toLocaleString()} (+${UP[i][2]}/s)`; b.disabled = s.tacos < cost(i); b.style.opacity = b.disabled ? '.5' : '1'; });
        clickBtn.textContent = `👆 Bigger clicks (${s.perClick + 1}/click) — ${clickCost().toLocaleString()}`; clickBtn.disabled = s.tacos < clickCost(); clickBtn.style.opacity = clickBtn.disabled ? '.5' : '1';
        g.score(Math.floor(s.total));
      };
      taco.addEventListener('click', () => { s.tacos += s.perClick; s.total += s.perClick; taco.style.transform = 'scale(.92)'; setTimeout(() => (taco.style.transform = ''), 70); draw(); });
      g.every(100, () => { const n = perSec() / 10; s.tacos += n; s.total += n; draw(); });
      const persist = () => { g.save.set('state', s); try { localStorage.setItem('arcade:best:clicker', JSON.stringify(Math.floor(s.total))); } catch {} };
      g.every(2000, persist);
      g.on(window, 'pagehide', persist);
      g.on(document.getElementById('backBtn'), 'click', persist, { capture: true });
      draw();
    }
  });
})();
