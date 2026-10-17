// Action games, part 2
(() => {
  const A = window.Arcade;
  const keyL = (g) => g.held.has('arrowleft') || g.held.has('a');
  const keyR = (g) => g.held.has('arrowright') || g.held.has('d');
  const keyU = (g) => g.held.has('arrowup') || g.held.has('w');
  const keyD = (g) => g.held.has('arrowdown') || g.held.has('s');

  A.add({
    id: 'catch', name: 'Taco Catch', icon: '🧺', cat: 'Action',
    how: 'Move the basket with mouse/finger or ←/→. Catch tacos, dodge bombs. Miss 3 tacos and it\'s over.',
    play(g) {
      const W = 400, H = 600;
      g.canvas(W, H);
      let x = W / 2, items = [], t = 0, lives = 3, spd = 170;
      g.loop((dt) => {
        if (keyL(g)) { x -= 420 * dt; g.ptr.t = 0; }
        if (keyR(g)) { x += 420 * dt; g.ptr.t = 0; }
        if (g.ptr.t) x += (g.ptr.x - x) * Math.min(1, dt * 14);
        x = g.clamp(x, 34, W - 34);
        spd += 4 * dt; t -= dt;
        if (t <= 0) { t = g.rand(0.45, 0.9) * (190 / spd); items.push({ x: g.rand(20, W - 20), y: -20, bomb: Math.random() < 0.22, v: spd * g.rand(0.85, 1.25) }); }
        for (const it of items) {
          it.y += it.v * dt;
          if (!it.done && it.y > H - 70 && it.y < H - 30 && Math.abs(it.x - x) < 40) { it.done = true; if (it.bomb) return g.over('Boom!'); g.add(1); }
          if (!it.done && it.y > H + 10) { it.done = true; if (!it.bomb && --lives <= 0) return g.over('Too many dropped'); }
        }
        items = items.filter((it) => !it.done);
        g.clear('#0d1020');
        items.forEach((it) => g.text(it.bomb ? '💣' : '🌮', it.x, it.y, 30));
        g.text('🧺', x, H - 50, 52);
        g.text('♥'.repeat(lives), 12, 22, 18, g.C.pink, 'left');
      });
    }
  });

  A.add({
    id: 'whack', name: 'Whack-a-Mole', icon: '🔨', cat: 'Action',
    how: 'Tap the moles before they hide. Don\'t hit the bombs. 30 seconds.',
    play(g) {
      const W = 420, H = 470, S = 140;
      g.canvas(W, H);
      const holes = Array.from({ length: 9 }, (_, i) => ({ x: (i % 3) * S + S / 2, y: Math.floor(i / 3) * S + S / 2 + 50, up: 0, bomb: false, hit: 0 }));
      let left = 30, spawn = 0;
      g.tap((px, py) => {
        for (const h of holes) if (h.up > 0 && Math.hypot(px - h.x, py - h.y) < 52) {
          if (h.bomb) { g.add(-3); g.msg('Ouch! −3'); } else { g.add(1); g.msg(''); }
          h.up = 0; h.hit = 0.25;
        }
      });
      g.loop((dt) => {
        left -= dt; if (left <= 0) return g.over("Time's up!");
        spawn -= dt;
        if (spawn <= 0) { spawn = g.rand(0.35, 0.7) * (0.5 + left / 60); const h = g.pick(holes.filter((o) => o.up <= 0)); if (h) { h.up = g.rand(0.7, 1.2) * (0.6 + left / 75); h.bomb = Math.random() < 0.15; } }
        holes.forEach((h) => { h.up -= dt; h.hit -= dt; });
        g.clear('#102018');
        g.text(`${Math.ceil(left)}s`, W / 2, 26, 22, g.C.yellow);
        holes.forEach((h) => {
          g.ctx.fillStyle = '#05080a'; g.ctx.beginPath(); g.ctx.ellipse(h.x, h.y + 30, 50, 16, 0, 0, Math.PI * 2); g.ctx.fill();
          if (h.up > 0) g.text(h.bomb ? '💣' : '🐹', h.x, h.y + 6, 60);
          if (h.hit > 0) g.text('💥', h.x, h.y, 50);
        });
      });
    }
  });

  A.add({
    id: 'aim', name: 'Aim Trainer', icon: '🎯', cat: 'Action',
    how: 'Click the targets as fast as you can. Misses cost a point. 30 seconds.',
    play(g) {
      const W = 600, H = 420;
      g.canvas(W, H);
      let left = 30, targets = [], spawn = 0, started = false;
      const add = () => targets.push({ x: g.rand(40, W - 40), y: g.rand(60, H - 40), r: 28, age: 0 });
      add();
      g.tap((px, py) => {
        started = true;
        const i = targets.findIndex((t) => Math.hypot(px - t.x, py - t.y) < t.r);
        if (i > -1) { targets.splice(i, 1); g.add(1); if (!targets.length) add(); } else g.add(-1);
      });
      g.loop((dt) => {
        if (started) { left -= dt; spawn -= dt; }
        if (left <= 0) return g.over("Time's up!");
        if (started && spawn <= 0 && targets.length < 3) { spawn = 0.8; add(); }
        targets.forEach((t) => { t.age += dt; t.r = Math.max(10, 28 - t.age * 6); });
        g.clear();
        g.text(started ? `${Math.ceil(left)}s` : 'Click a target to start', W / 2, 26, 20, g.C.yellow);
        targets.forEach((t) => { g.circle(t.x, t.y, t.r, g.C.pink); g.circle(t.x, t.y, t.r * 0.66, g.C.white); g.circle(t.x, t.y, t.r * 0.33, g.C.pink); });
      });
    }
  });

  A.add({
    id: 'bubbles', name: 'Bubble Pop', icon: '🫧', cat: 'Action',
    how: 'Pop the bubbles before they float away. Let 10 escape and it\'s over.',
    play(g) {
      const W = 420, H = 600;
      g.canvas(W, H);
      let bubbles = [], t = 0, escaped = 0, spd = 70;
      g.tap((px, py) => {
        for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; if (Math.hypot(px - b.x, py - b.y) < b.r + 6) { bubbles.splice(i, 1); g.add(b.r < 22 ? 3 : 1); return; } }
      });
      g.loop((dt) => {
        spd += 3 * dt; t -= dt;
        if (t <= 0) { t = g.rand(0.3, 0.8) * (80 / spd); bubbles.push({ x: g.rand(30, W - 30), y: H + 30, r: g.rand(16, 36), wob: g.rand(0, 6), c: g.pick([g.C.cyan, g.C.pink, g.C.purple, g.C.green]) }); }
        for (const b of bubbles) { b.y -= spd * (50 / b.r) * dt; b.wob += dt * 2; b.x += Math.sin(b.wob) * 20 * dt; if (b.y < -40) { b.gone = true; escaped++; } }
        bubbles = bubbles.filter((b) => !b.gone);
        if (escaped >= 10) return g.over('Too many got away');
        g.clear('#0b1220');
        bubbles.forEach((b) => { g.ring(b.x, b.y, b.r, b.c, 3); g.circle(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.18, 'rgba(255,255,255,.7)'); });
        g.text(`Escaped ${escaped}/10`, 12, 22, 15, g.C.dim, 'left');
      });
    }
  });

  A.add({
    id: 'missile', name: 'Missile Defense', icon: '🚀', cat: 'Action',
    how: 'Tap the sky to set off a blast. Stop the missiles before they hit your cities.',
    play(g) {
      const W = 600, H = 460;
      g.canvas(W, H);
      const cities = [80, 180, 280, 380, 480].map((x) => ({ x, alive: true }));
      let missiles = [], blasts = [], t = 1, spd = 45;
      g.tap((px, py) => { if (py < H - 40) blasts.push({ x: px, y: py, r: 2, grow: true }); });
      g.loop((dt) => {
        spd += 1.2 * dt; t -= dt;
        if (t <= 0) {
          t = g.rand(0.6, 1.4) * (55 / spd);
          const target = g.pick(cities.filter((c) => c.alive));
          if (target) { const sx = g.rand(0, W); const d = Math.hypot(target.x - sx, H - 30); missiles.push({ sx, sy: 0, x: sx, y: 0, vx: ((target.x - sx) / d) * spd, vy: ((H - 30) / d) * spd, target }); }
        }
        blasts.forEach((b) => { if (b.grow) { b.r += 90 * dt; if (b.r >= 46) b.grow = false; } else b.r -= 40 * dt; });
        blasts = blasts.filter((b) => b.r > 0);
        for (const m of missiles) {
          m.x += m.vx * dt; m.y += m.vy * dt;
          if (blasts.some((b) => Math.hypot(b.x - m.x, b.y - m.y) < b.r)) { m.dead = true; g.add(10); blasts.push({ x: m.x, y: m.y, r: 2, grow: true }); }
          else if (m.y >= H - 30) { m.dead = true; m.target.alive = false; blasts.push({ x: m.x, y: m.y, r: 2, grow: true }); }
        }
        missiles = missiles.filter((m) => !m.dead);
        if (!cities.some((c) => c.alive)) return g.over('All cities lost');
        g.clear('#0a0b16');
        g.rect(0, H - 22, W, 22, '#1c1e2b');
        cities.forEach((c) => c.alive && g.text('🏙️', c.x, H - 36, 32));
        missiles.forEach((m) => { g.line(m.sx, m.sy, m.x, m.y, 'rgba(255,11,114,.5)', 1.5); g.circle(m.x, m.y, 3, g.C.pink); });
        blasts.forEach((b) => g.circle(b.x, b.y, b.r, `rgba(255,209,102,${0.35 + b.r / 120})`));
      });
    }
  });

  A.add({
    id: 'crossy', name: 'Road Cross', icon: '🐔', cat: 'Action',
    how: 'Arrow keys / WASD or swipe to hop. Reach the top to score.',
    play(g) {
      const COLS = 11, ROWS = 13, S = 40;
      g.canvas(COLS * S, ROWS * S);
      let p, lanes, level = 0;
      const reset = () => {
        level++; p = { x: 5, y: ROWS - 1 };
        lanes = Array.from({ length: ROWS }, (_, r) => {
          if (r === 0 || r === ROWS - 1 || r === 6) return null;
          const dir = r % 2 ? 1 : -1, spd = g.rand(60, 120) + level * 12, n = g.randi(2, 3), len = g.randi(1, 2);
          return { dir, spd, len, cars: Array.from({ length: n }, (_, i) => (i * COLS * S) / n + g.rand(0, 60)), c: g.pick([g.C.pink, g.C.yellow, g.C.purple, '#ff8a3d']) };
        });
      };
      reset();
      const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      g.dir((d) => {
        p.x = g.clamp(p.x + D[d][0], 0, COLS - 1); p.y = g.clamp(p.y + D[d][1], 0, ROWS - 1);
        if (p.y === 0) { g.add(1); g.msg(`Crossed! Level ${level + 1}`); reset(); }
      });
      g.tap((px) => { if (!g.ended) { p.y = Math.max(0, p.y - 1); if (p.y === 0) { g.add(1); reset(); } } });
      g.loop((dt) => {
        g.clear('#141821');
        g.rect(0, 0, COLS * S, S, '#163a24'); g.rect(0, 6 * S, COLS * S, S, '#163a24'); g.rect(0, (ROWS - 1) * S, COLS * S, S, '#163a24');
        lanes.forEach((l, r) => {
          if (!l) return;
          const span = COLS * S + 120;
          l.cars = l.cars.map((x) => ((x + l.dir * l.spd * dt + 60) % span + span) % span - 60);
          l.cars.forEach((x) => {
            const w = l.len * S - 6;
            g.rrect(x, r * S + 6, w, S - 12, 6, l.c);
            if (r === p.y && p.x * S + 30 > x && p.x * S + 10 < x + w) g.over('Splat!');
          });
        });
        g.text('🐔', p.x * S + S / 2, p.y * S + S / 2 + 2, 30);
      });
    }
  });

  A.add({
    id: 'slash', name: 'Fruit Slash', icon: '🍉', cat: 'Action',
    how: 'Drag across the fruit to slice it. Avoid bombs. Drop 3 fruit and it\'s over.',
    play(g) {
      const W = 560, H = 480;
      g.canvas(W, H);
      let items = [], t = 0.5, lives = 3, trail = [];
      const FRUIT = ['🍉', '🍎', '🍊', '🍌', '🍍', '🍓', '🥝'];
      g.loop((dt) => {
        t -= dt;
        if (t <= 0) { t = g.rand(0.5, 1.1); const n = g.randi(1, 3); for (let i = 0; i < n; i++) items.push({ x: g.rand(80, W - 80), y: H + 30, vx: g.rand(-90, 90), vy: -g.rand(520, 640), bomb: Math.random() < 0.15, e: g.pick(FRUIT), cut: 0 }); }
        if (g.ptr.down) trail.push({ x: g.ptr.x, y: g.ptr.y, life: 0.18 });
        trail.forEach((p) => (p.life -= dt)); trail = trail.filter((p) => p.life > 0);
        const segA = trail[trail.length - 2], segB = trail[trail.length - 1];
        for (const it of items) {
          it.vy += 600 * dt; it.x += it.vx * dt; it.y += it.vy * dt;
          if (it.cut) { it.cut += dt; continue; }
          if (g.ptr.down && segA && segB) {
            const dx = segB.x - segA.x, dy = segB.y - segA.y, len = dx * dx + dy * dy || 1;
            const k = g.clamp(((it.x - segA.x) * dx + (it.y - segA.y) * dy) / len, 0, 1);
            if (Math.hypot(segA.x + dx * k - it.x, segA.y + dy * k - it.y) < 28) { if (it.bomb) return g.over('Boom!'); it.cut = 0.01; g.add(1); }
          }
          if (it.y > H + 40 && it.vy > 0) { it.gone = true; if (!it.bomb && --lives <= 0) return g.over('Dropped too many'); }
        }
        items = items.filter((it) => !it.gone && it.cut < 0.5);
        g.clear('#140f1c');
        items.forEach((it) => { if (it.cut) { g.ctx.globalAlpha = 1 - it.cut * 2; g.text(it.e, it.x - it.cut * 60, it.y, 44); g.text(it.e, it.x + it.cut * 60, it.y, 44); g.ctx.globalAlpha = 1; } else g.text(it.bomb ? '💣' : it.e, it.x, it.y, 46); });
        for (let i = 1; i < trail.length; i++) g.line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y, `rgba(101,239,255,${trail[i].life * 5})`, 5);
        g.text('♥'.repeat(lives), 12, 22, 18, g.C.pink, 'left');
      });
    }
  });

  A.add({
    id: 'dodge', name: 'Dodge Dots', icon: '⚫', cat: 'Action', fmt: (v) => v.toFixed(1) + 's',
    how: 'Move with mouse/finger or arrow keys. Survive as long as you can.',
    play(g) {
      const W = 520, H = 520;
      g.canvas(W, H);
      const p = { x: W / 2, y: H / 2 };
      let dots = [], t = 0, add = 0;
      const spawn = () => { const side = g.randi(0, 3); const x = side === 0 ? 0 : side === 1 ? W : g.rand(0, W), y = side === 2 ? 0 : side === 3 ? H : g.rand(0, H); const a = Math.atan2(p.y - y, p.x - x) + g.rand(-0.6, 0.6), s = g.rand(110, 190); dots.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: g.rand(7, 13) }); };
      for (let i = 0; i < 4; i++) spawn();
      g.loop((dt) => {
        t += dt; add -= dt; g.score(Math.round(t * 10) / 10);
        if (add <= 0) { add = Math.max(0.4, 1.6 - t / 40); spawn(); }
        const sp = 300 * dt;
        if (keyL(g)) { p.x -= sp; g.ptr.t = 0; } if (keyR(g)) { p.x += sp; g.ptr.t = 0; } if (keyU(g)) { p.y -= sp; g.ptr.t = 0; } if (keyD(g)) { p.y += sp; g.ptr.t = 0; }
        if (g.ptr.t) { p.x += (g.ptr.x - p.x) * Math.min(1, dt * 12); p.y += (g.ptr.y - p.y) * Math.min(1, dt * 12); }
        p.x = g.clamp(p.x, 10, W - 10); p.y = g.clamp(p.y, 10, H - 10);
        for (const d of dots) {
          d.x += d.vx * dt; d.y += d.vy * dt;
          if (d.x < -30 || d.x > W + 30 || d.y < -30 || d.y > H + 30) d.gone = true;
          if (Math.hypot(d.x - p.x, d.y - p.y) < d.r + 9) return g.over('Hit!');
        }
        dots = dots.filter((d) => !d.gone);
        g.clear();
        dots.forEach((d) => g.circle(d.x, d.y, d.r, g.C.pink));
        g.circle(p.x, p.y, 10, g.C.cyan);
        g.text(t.toFixed(1) + 's', W / 2, 24, 18, g.C.dim);
      });
    }
  });

  A.add({
    id: 'gravity', name: 'Gravity Flip', icon: '🔄', cat: 'Action',
    how: 'Tap or Space to flip gravity between the floor and the ceiling. Avoid the spikes.',
    play(g) {
      const W = 640, H = 320, TOP = 40, BOT = H - 40;
      g.canvas(W, H);
      let y = BOT - 14, vy = 0, grav = 1, spikes = [], t = 1, spd = 280, dist = 0, started = false;
      const flip = () => { started = true; grav *= -1; };
      g.tap(flip);
      g.key((k) => { if (k === ' ' || k === 'arrowup' || k === 'arrowdown') flip(); });
      g.loop((dt) => {
        if (started) {
          vy += grav * 2400 * dt; y += vy * dt;
          if (y > BOT - 14) { y = BOT - 14; vy = 0; } if (y < TOP + 14) { y = TOP + 14; vy = 0; }
          spd += 6 * dt; dist += spd * dt; g.score(Math.floor(dist / 12));
          t -= dt;
          if (t <= 0) { t = g.rand(0.55, 1.2); spikes.push({ x: W + 20, top: Math.random() < 0.5, w: g.randi(26, 54) }); }
          for (const s of spikes) { s.x -= spd * dt; if (s.x < 114 && s.x + s.w > 86 && (s.top ? y - 14 < TOP + 26 : y + 14 > BOT - 26)) return g.over('Spiked!'); }
          spikes = spikes.filter((s) => s.x > -60);
        }
        g.clear('#0d0f1a');
        g.rect(0, 0, W, TOP, '#1c1e2b'); g.rect(0, BOT, W, H - BOT, '#1c1e2b');
        const k = g.ctx; k.fillStyle = g.C.pink;
        spikes.forEach((s) => { for (let x = s.x; x < s.x + s.w; x += 13) { k.beginPath(); if (s.top) { k.moveTo(x, TOP); k.lineTo(x + 6.5, TOP + 26); k.lineTo(x + 13, TOP); } else { k.moveTo(x, BOT); k.lineTo(x + 6.5, BOT - 26); k.lineTo(x + 13, BOT); } k.fill(); } });
        g.rrect(86, y - 14, 28, 28, 7, g.C.cyan);
        if (!started) g.text('Tap to flip', W / 2, H / 2, 22, g.C.dim);
      });
    }
  });

  A.add({
    id: 'punch', name: 'Punch a Dummy', icon: '🥊', cat: 'Action',
    how: 'Punch the dummy as many times as you can in 10 seconds. Fast punches build a combo.',
    play(g) {
      const W = 420, H = 520;
      g.canvas(W, H);
      let left = 10, started = false, wob = 0, combo = 0, lastHit = 0, pops = [];
      g.tap((px, py) => {
        if (g.ended || Math.abs(px - W / 2) > 95 || py < 90 || py > 470) return;
        started = true;
        const now = performance.now();
        combo = now - lastHit < 350 ? combo + 1 : 0; lastHit = now;
        const pts = 1 + Math.floor(combo / 5);
        g.add(pts); wob = (px < W / 2 ? 1 : -1) * 0.35;
        pops.push({ x: px, y: py, t: 0.5, txt: pts > 1 ? `+${pts}` : 'POW' });
      });
      g.key((k) => { if (k === ' ') g._fns.tap.forEach((f) => f(W / 2 + g.rand(-40, 40), 240)); });
      g.loop((dt) => {
        if (started) left -= dt;
        if (left <= 0) return g.over("Time's up!");
        wob *= Math.pow(0.02, dt);
        pops.forEach((p) => { p.t -= dt; p.y -= 60 * dt; }); pops = pops.filter((p) => p.t > 0);
        g.clear('#16121c');
        g.text(started ? left.toFixed(1) + 's' : 'Tap the dummy!', W / 2, 36, 22, g.C.yellow);
        if (combo >= 5) g.text(`Combo ×${1 + Math.floor(combo / 5)}`, W / 2, 66, 18, g.C.pink);
        const k = g.ctx; k.save(); k.translate(W / 2, 470); k.rotate(wob + Math.sin(performance.now() / 90) * wob * 0.3);
        g.rrect(-12, -110, 24, 110, 6, '#6b4b2e');
        g.rrect(-70, -300, 140, 200, 40, '#d9a55b'); g.rrect(-70, -300, 140, 200, 40, 'rgba(0,0,0,0)');
        g.circle(0, -340, 50, '#e8b96c'); g.text('😵', 0, -340, 56);
        g.rect(-60, -200, 120, 10, '#a8783c');
        k.restore();
        pops.forEach((p) => { k.globalAlpha = p.t * 2; g.text(p.txt, p.x, p.y, 26, g.C.yellow); k.globalAlpha = 1; });
      });
    }
  });

  A.add({
    id: 'blocks', name: 'Blocks', icon: '🟪', cat: 'Action',
    how: '←/→ move, ↑ rotate, ↓ soft drop, Space hard drop. Touch: tap left/right side to move, middle to rotate, swipe down to drop.',
    play(g) {
      const C = 10, R = 20, S = 26, PW = 120;
      g.canvas(C * S + PW, R * S);
      const SHAPES = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]]];
      const COLORS = [g.C.cyan, g.C.yellow, g.C.purple, '#4d7cff', '#ff8a3d', g.C.green, g.C.pink];
      const board = Array.from({ length: R }, () => Array(C).fill(0));
      let piece, nextId = g.randi(0, 6), t = 0, lines = 0;
      const rot = (m) => m[0].map((_, i) => m.map((r) => r[i]).reverse());
      const fits = (m, x, y) => m.every((row, j) => row.every((v, i) => !v || (x + i >= 0 && x + i < C && y + j < R && (y + j < 0 || !board[y + j][x + i]))));
      const spawn = () => { const id = nextId; nextId = g.randi(0, 6); piece = { m: SHAPES[id], id: id + 1, x: Math.floor((C - SHAPES[id][0].length) / 2), y: -1 }; if (!fits(piece.m, piece.x, piece.y + 1)) { g.over(); return false; } return true; };
      const lock = () => {
        piece.m.forEach((row, j) => row.forEach((v, i) => { if (v && piece.y + j >= 0) board[piece.y + j][piece.x + i] = piece.id; }));
        if (piece.m.some((row, j) => row.some((v) => v && piece.y + j < 0))) return g.over();
        let cleared = 0;
        for (let y = R - 1; y >= 0; y--) if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(C).fill(0)); cleared++; y++; }
        if (cleared) { lines += cleared; g.add([0, 100, 300, 500, 800][cleared]); }
        spawn();
      };
      const move = (dx) => { if (fits(piece.m, piece.x + dx, piece.y)) piece.x += dx; };
      const turn = () => { const m = rot(piece.m); for (const k of [0, -1, 1, -2, 2]) if (fits(m, piece.x + k, piece.y)) { piece.m = m; piece.x += k; return; } };
      const soft = () => { if (fits(piece.m, piece.x, piece.y + 1)) piece.y++; else lock(); };
      const hard = () => { while (fits(piece.m, piece.x, piece.y + 1)) { piece.y++; g.add(1); } lock(); };
      spawn();
      g.key((k) => { if (g.ended) return; if (k === 'arrowleft' || k === 'a') move(-1); else if (k === 'arrowright' || k === 'd') move(1); else if (k === 'arrowup' || k === 'w') turn(); else if (k === 'arrowdown' || k === 's') soft(); else if (k === ' ') hard(); });
      g.swipe((d) => { if (!g.ended && d === 'down') hard(); });
      g.tap((px) => { if (g.ended) return; const third = (C * S) / 3; if (px < third) move(-1); else if (px > C * S) turn(); else if (px > third * 2) move(1); else turn(); });
      g.loop((dt) => {
        t += dt;
        if (t > Math.max(0.08, 0.7 - lines * 0.03)) { t = 0; soft(); if (g.ended) return; }
        g.clear();
        for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { g.rect(x * S, y * S, S - 1, S - 1, board[y][x] ? COLORS[board[y][x] - 1] : '#11131c'); }
        let gy = piece.y; while (fits(piece.m, piece.x, gy + 1)) gy++;
        piece.m.forEach((row, j) => row.forEach((v, i) => { if (v && gy + j >= 0) g.rect((piece.x + i) * S, (gy + j) * S, S - 1, S - 1, 'rgba(255,255,255,.12)'); if (v && piece.y + j >= 0) g.rect((piece.x + i) * S, (piece.y + j) * S, S - 1, S - 1, COLORS[piece.id - 1]); }));
        g.rect(C * S, 0, PW, R * S, '#0e0f17');
        g.text('NEXT', C * S + PW / 2, 30, 14, g.C.dim);
        SHAPES[nextId].forEach((row, j) => row.forEach((v, i) => v && g.rect(C * S + 24 + i * 20, 54 + j * 20, 19, 19, COLORS[nextId])));
        g.text('LINES', C * S + PW / 2, 150, 14, g.C.dim); g.text(String(lines), C * S + PW / 2, 176, 24);
      });
    }
  });

  A.add({
    id: 'maze', name: 'Maze Run', icon: '🌀', cat: 'Action', low: true, fmt: (v) => v.toFixed(1) + 's',
    how: 'Arrow keys / WASD or swipe. Get from the top-left to the green exit as fast as you can.',
    play(g) {
      const N = 17, S = 28;
      g.canvas(N * S, N * S);
      // walls[y][x] = [top, right, bottom, left]
      const walls = Array.from({ length: N }, () => Array.from({ length: N }, () => [1, 1, 1, 1]));
      const seen = Array.from({ length: N }, () => Array(N).fill(false));
      const stack = [[0, 0]]; seen[0][0] = true;
      const D = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]];
      while (stack.length) {
        const [x, y] = stack[stack.length - 1];
        const opts = D.filter(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < N && y + dy < N && !seen[y + dy][x + dx]);
        if (!opts.length) { stack.pop(); continue; }
        const [dx, dy, w, ow] = g.pick(opts);
        walls[y][x][w] = 0; walls[y + dy][x + dx][ow] = 0; seen[y + dy][x + dx] = true; stack.push([x + dx, y + dy]);
      }
      const p = { x: 0, y: 0 };
      let t = 0, started = false;
      const map = { up: 0, right: 1, down: 2, left: 3 };
      g.dir((d) => {
        if (g.ended) return;
        const w = map[d];
        if (walls[p.y][p.x][w]) return;
        started = true; p.x += D[w][0]; p.y += D[w][1];
        if (p.x === N - 1 && p.y === N - 1) { g.score(Math.round(t * 10) / 10); g.over('Escaped!'); }
      });
      g.loop((dt) => {
        if (started) { t += dt; g.score(Math.round(t * 10) / 10); }
        g.clear();
        g.rect((N - 1) * S + 3, (N - 1) * S + 3, S - 6, S - 6, g.C.green);
        const k = g.ctx; k.strokeStyle = g.C.purple; k.lineWidth = 2; k.beginPath();
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const [tp, r, b, l] = walls[y][x], X = x * S, Y = y * S;
          if (tp) { k.moveTo(X, Y); k.lineTo(X + S, Y); } if (r) { k.moveTo(X + S, Y); k.lineTo(X + S, Y + S); }
          if (b) { k.moveTo(X, Y + S); k.lineTo(X + S, Y + S); } if (l) { k.moveTo(X, Y); k.lineTo(X, Y + S); }
        }
        k.stroke();
        g.circle(p.x * S + S / 2, p.y * S + S / 2, S / 3, g.C.cyan);
      });
    }
  });
})();
