// Action games, part 1
(() => {
  const A = window.Arcade;
  const keyL = (g) => g.held.has('arrowleft') || g.held.has('a');
  const keyR = (g) => g.held.has('arrowright') || g.held.has('d');
  const keyU = (g) => g.held.has('arrowup') || g.held.has('w');
  const keyD = (g) => g.held.has('arrowdown') || g.held.has('s');

  A.add({
    id: 'snake', name: 'Snake', icon: '🐍', cat: 'Action',
    how: 'Arrow keys / WASD or swipe. Eat the pink squares and don\'t hit yourself.',
    play(g) {
      const N = 20, S = 24;
      g.canvas(N * S, N * S);
      let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      let dir = { x: 1, y: 0 }, next = dir, t = 0, speed = 0.13;
      const spawn = () => { let p; do p = { x: g.randi(0, N - 1), y: g.randi(0, N - 1) }; while (snake.some((s) => s.x === p.x && s.y === p.y)); return p; };
      let food = spawn();
      const D = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
      g.dir((d) => { const n = D[d]; if (n.x !== -dir.x || n.y !== -dir.y) next = n; });
      g.loop((dt) => {
        t += dt;
        if (t >= speed) {
          t = 0; dir = next;
          const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
          if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.slice(0, -1).some((s) => s.x === h.x && s.y === h.y)) return g.over();
          snake.unshift(h);
          if (h.x === food.x && h.y === food.y) { g.add(1); food = spawn(); speed = Math.max(0.06, speed - 0.003); } else snake.pop();
        }
        g.clear();
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) g.rect(i * S, j * S, S, S, '#0e1018');
        g.rrect(food.x * S + 4, food.y * S + 4, S - 8, S - 8, 5, g.C.pink);
        snake.forEach((s, i) => g.rrect(s.x * S + 1, s.y * S + 1, S - 2, S - 2, 6, i ? '#2bb8c8' : g.C.cyan));
      });
    }
  });

  A.add({
    id: 'tron', name: 'Light Bikes', icon: '🏍️', cat: 'Action',
    how: 'Arrow keys / WASD or swipe to turn. Make the pink bike crash first. Each round won = 1 point.',
    play(g) {
      const N = 60, S = 8, D = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      g.canvas(N * S, N * S);
      let grid, p, a, t;
      const free = (x, y) => x >= 0 && y >= 0 && x < N && y < N && !grid[y * N + x];
      const reset = () => {
        grid = new Uint8Array(N * N); p = { x: 15, y: 30, d: 0 }; a = { x: 44, y: 30, d: 2 }; t = -0.6;
        g.clear(); grid[30 * N + 15] = grid[30 * N + 44] = 1;
        g.rect(15 * S, 30 * S, S, S, g.C.cyan); g.rect(44 * S, 30 * S, S, S, g.C.pink);
      };
      reset();
      g.msg('Beat the pink bike');
      const map = { right: 0, down: 1, left: 2, up: 3 };
      g.dir((d) => { const n = map[d]; if ((n + 2) % 4 !== p.d) p.nd = n; });
      const run = (x, y, d) => { let n = 0; while (n < 25 && free(x + D[d][0] * (n + 1), y + D[d][1] * (n + 1))) n++; return n; };
      const step = (o, c) => { o.x += D[o.d][0]; o.y += D[o.d][1]; const ok = free(o.x, o.y); if (ok) { grid[o.y * N + o.x] = 1; g.rect(o.x * S, o.y * S, S, S, c); } return ok; };
      g.loop((dt) => {
        t += dt;
        if (t < 0.045) return;
        t = 0;
        if (p.nd !== undefined) { p.d = p.nd; p.nd = undefined; }
        let best = a.d, bs = -1;
        for (const d of [a.d, (a.d + 1) % 4, (a.d + 3) % 4]) { const s = run(a.x, a.y, d) + (d === a.d ? 0.6 : 0) + Math.random() * 0.9; if (s > bs) { bs = s; best = d; } }
        a.d = best;
        const pOk = step(p, g.C.cyan), aOk = step(a, g.C.pink);
        if (!pOk) return g.over(aOk ? 'You crashed' : 'Both crashed');
        if (!aOk) { g.add(1); g.msg(`Round won! Rounds: ${g.score()}`); reset(); }
      });
    }
  });

  A.add({
    id: 'breakout', name: 'Breakout', icon: '🧱', cat: 'Action',
    how: 'Move with mouse/finger or arrow keys. Tap or Space to launch. 3 lives.',
    play(g) {
      const W = 480, H = 560;
      g.canvas(W, H);
      let px = W / 2, ball, bricks, lives = 3, level = 1, stuck = true;
      const pw = 84;
      const COLORS = [g.C.pink, '#ff5fa2', g.C.purple, g.C.cyan, g.C.green, g.C.yellow];
      const makeBricks = () => { bricks = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) bricks.push({ x: 8 + c * 58.5, y: 60 + r * 24, w: 52, h: 18, c: COLORS[r] }); };
      const resetBall = () => { ball = { x: px, y: H - 52, vx: 0, vy: 0, r: 7 }; stuck = true; };
      makeBricks(); resetBall();
      const launch = () => { if (!stuck) return; stuck = false; const sp = 330 + level * 30; ball.vx = sp * (Math.random() < 0.5 ? -0.55 : 0.55); ball.vy = -sp * 0.83; };
      g.tap(launch);
      g.key((k) => { if (k === ' ') launch(); });
      g.loop((dt) => {
        if (keyL(g)) { px -= 560 * dt; g.ptr.t = 0; }
        if (keyR(g)) { px += 560 * dt; g.ptr.t = 0; }
        if (g.ptr.t) px = g.ptr.x;
        px = g.clamp(px, pw / 2, W - pw / 2);
        if (stuck) { ball.x = px; ball.y = H - 40 - ball.r; }
        else {
          ball.x += ball.vx * dt; ball.y += ball.vy * dt;
          if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
          if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
          if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
          if (ball.vy > 0 && ball.y + ball.r >= H - 40 && ball.y + ball.r <= H - 22 && Math.abs(ball.x - px) < pw / 2 + ball.r) {
            const sp = Math.min(700, Math.hypot(ball.vx, ball.vy) * 1.015), ang = g.clamp((ball.x - px) / (pw / 2), -1, 1) * 1.05;
            ball.vx = sp * Math.sin(ang); ball.vy = -sp * Math.cos(ang);
          }
          for (const b of bricks) {
            if (b.dead || ball.x + ball.r < b.x || ball.x - ball.r > b.x + b.w || ball.y + ball.r < b.y || ball.y - ball.r > b.y + b.h) continue;
            b.dead = true; g.add(10);
            const ox = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r)), oy = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
            if (ox < oy) ball.vx *= -1; else ball.vy *= -1;
            break;
          }
          if (ball.y > H + 20) { lives--; if (!lives) return g.over(); resetBall(); }
          if (bricks.every((b) => b.dead)) { level++; makeBricks(); resetBall(); g.msg('Level ' + level); }
        }
        g.clear();
        bricks.forEach((b) => !b.dead && g.rrect(b.x, b.y, b.w, b.h, 4, b.c));
        g.rrect(px - pw / 2, H - 40, pw, 12, 6, g.C.white);
        g.circle(ball.x, ball.y, ball.r, g.C.cyan);
        g.text('♥'.repeat(lives), 12, 24, 18, g.C.pink, 'left');
        g.text('Level ' + level, W - 12, 24, 16, g.C.dim, 'right');
        if (stuck) g.text('Tap or Space to launch', W / 2, H / 2 + 60, 18, g.C.dim);
      });
    }
  });

  A.add({
    id: 'pong', name: 'Pong', icon: '🏓', cat: 'Action',
    how: 'Move your paddle (left) with mouse/finger or W/S / arrows. First to 7 wins.',
    play(g) {
      const W = 600, H = 400, ph = 74;
      g.canvas(W, H);
      let py = H / 2, ay = H / 2, b, me = 0, ai = 0, wait = 1;
      const serve = (d) => { b = { x: W / 2, y: H / 2, vx: 320 * d, vy: g.rand(-160, 160) }; wait = 0.8; };
      serve(Math.random() < 0.5 ? 1 : -1);
      g.loop((dt) => {
        if (keyU(g)) { py -= 420 * dt; g.ptr.t = 0; }
        if (keyD(g)) { py += 420 * dt; g.ptr.t = 0; }
        if (g.ptr.t) py = g.ptr.y;
        py = g.clamp(py, ph / 2, H - ph / 2);
        const target = b.vx > 0 ? b.y : H / 2;
        ay = g.clamp(ay + g.clamp(target - ay, -270 * dt, 270 * dt), ph / 2, H - ph / 2);
        if (wait > 0) wait -= dt;
        else {
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.y < 8 || b.y > H - 8) { b.vy *= -1; b.y = g.clamp(b.y, 8, H - 8); }
          if (b.vx < 0 && b.x < 40 && b.x > 16 && Math.abs(b.y - py) < ph / 2 + 8) { b.vx = Math.min(900, Math.abs(b.vx) * 1.06); b.vy += (b.y - py) * 6; }
          if (b.vx > 0 && b.x > W - 40 && b.x < W - 16 && Math.abs(b.y - ay) < ph / 2 + 8) { b.vx = -Math.min(900, Math.abs(b.vx) * 1.06); b.vy += (b.y - ay) * 6; }
          if (b.x < -10) { ai++; serve(-1); }
          if (b.x > W + 10) { me++; g.add(1); serve(1); }
          if (me >= 7) return g.over('You win!');
          if (ai >= 7) return g.over('AI wins');
        }
        g.clear();
        for (let y = 10; y < H; y += 24) g.rect(W / 2 - 1, y, 2, 12, g.C.line);
        g.text(String(me), W / 2 - 50, 40, 36, g.C.cyan);
        g.text(String(ai), W / 2 + 50, 40, 36, g.C.pink);
        g.rrect(20, py - ph / 2, 10, ph, 5, g.C.cyan);
        g.rrect(W - 30, ay - ph / 2, 10, ph, 5, g.C.pink);
        g.circle(b.x, b.y, 8, g.C.white);
      });
    }
  });

  A.add({
    id: 'flappy', name: 'Flappy Taco', icon: '🌮', cat: 'Action',
    how: 'Tap, click or Space to flap through the gaps.',
    play(g) {
      const W = 400, H = 600, GAP = 155;
      g.canvas(W, H);
      let y = H / 2, vy = 0, pipes = [], t = 1.2, started = false;
      const flap = () => { started = true; vy = -330; };
      g.tap(flap);
      g.key((k) => { if (k === ' ' || k === 'arrowup' || k === 'w') flap(); });
      g.loop((dt) => {
        if (started) {
          vy += 950 * dt; y += vy * dt; t += dt;
          if (t > 1.45) { t = 0; pipes.push({ x: W + 30, gap: g.rand(90, H - GAP - 90), pass: false }); }
          for (const p of pipes) {
            p.x -= 165 * dt;
            if (!p.pass && p.x + 30 < 90) { p.pass = true; g.add(1); }
            if (104 > p.x - 30 && 76 < p.x + 30 && (y - 13 < p.gap || y + 13 > p.gap + GAP)) return g.over();
          }
          pipes = pipes.filter((p) => p.x > -60);
          if (y > H - 30 || y < -20) return g.over();
        }
        g.clear('#0d1020');
        pipes.forEach((p) => { g.rrect(p.x - 30, -10, 60, p.gap + 10, 8, '#2bb8c8'); g.rrect(p.x - 30, p.gap + GAP, 60, H, 8, '#2bb8c8'); });
        g.rect(0, H - 30, W, 30, '#1c1e2b');
        g.ctx.save(); g.ctx.translate(90, y); g.ctx.rotate(g.clamp(vy / 700, -0.5, 0.9));
        g.text('🌮', 0, 0, 34); g.ctx.restore();
        g.text(String(g.score()), W / 2, 60, 40);
        if (!started) g.text('Tap to flap', W / 2, H / 2 + 70, 20, g.C.dim);
      });
    }
  });

  A.add({
    id: 'dino', name: 'Dino Dash', icon: '🦖', cat: 'Action',
    how: 'Tap, Space or ↑ to jump over the cactuses. It keeps getting faster.',
    play(g) {
      const W = 640, H = 260, GY = 210;
      g.canvas(W, H);
      let y = GY, vy = 0, obs = [], spd = 330, t = 1, dist = 0, started = false;
      const jump = () => { started = true; if (y >= GY) vy = -600; };
      g.tap(jump);
      g.key((k) => { if (k === ' ' || k === 'arrowup' || k === 'w') jump(); });
      g.loop((dt) => {
        if (started) {
          vy += 1700 * dt; y += vy * dt; if (y > GY) { y = GY; vy = 0; }
          spd += 9 * dt; dist += spd * dt; g.score(Math.floor(dist / 12));
          t -= dt;
          if (t <= 0) { t = g.rand(0.75, 1.6); obs.push({ x: W + 20, w: g.randi(14, 30), h: g.randi(28, 54) }); }
          for (const o of obs) { o.x -= spd * dt; if (o.x < 92 && o.x + o.w > 62 && y > GY - o.h + 4) return g.over(); }
          obs = obs.filter((o) => o.x > -40);
        }
        g.clear();
        g.rect(0, GY, W, 2, g.C.line);
        g.text('🦖', 76, y - 20, 38);
        obs.forEach((o) => g.rrect(o.x, GY - o.h, o.w, o.h, 4, g.C.green));
        if (!started) g.text('Tap or Space to start', W / 2, 90, 20, g.C.dim);
      });
    }
  });

  A.add({
    id: 'drift', name: 'Drift Dodge', icon: '🏎️', cat: 'Action',
    how: 'Steer with mouse/finger or ←/→. Dodge the traffic.',
    play(g) {
      const W = 400, H = 600;
      g.canvas(W, H);
      let x = W / 2, cars = [], t = 0.5, spd = 280, dist = 0, dash = 0;
      const car = (cx, cy, c) => { g.rrect(cx - 18, cy - 30, 36, 60, 9, c); g.rrect(cx - 13, cy - 18, 26, 14, 4, 'rgba(10,12,20,.75)'); g.rrect(cx - 13, cy + 12, 26, 9, 3, 'rgba(10,12,20,.6)'); };
      g.loop((dt) => {
        if (keyL(g)) { x -= 400 * dt; g.ptr.t = 0; }
        if (keyR(g)) { x += 400 * dt; g.ptr.t = 0; }
        if (g.ptr.t) x += (g.ptr.x - x) * Math.min(1, dt * 12);
        x = g.clamp(x, 36, W - 36);
        spd += 7 * dt; dist += spd * dt; dash = (dash + spd * dt) % 48;
        g.score(Math.floor(dist / 60));
        t -= dt;
        if (t <= 0) { t = g.rand(0.35, 0.85) * (300 / spd) * 1.4; cars.push({ x: g.pick([60, 150, 250, 340]), y: -60, c: g.pick([g.C.pink, g.C.yellow, g.C.purple, g.C.green]) }); }
        for (const c of cars) { c.y += spd * 0.75 * dt; if (Math.abs(c.x - x) < 34 && Math.abs(c.y - (H - 90)) < 58) return g.over('Crashed!'); }
        cars = cars.filter((c) => c.y < H + 80);
        g.clear('#15161d');
        for (const lx of [105, 200, 295]) for (let yy = -48 + dash; yy < H; yy += 48) g.rect(lx - 2, yy, 4, 24, 'rgba(255,255,255,.18)');
        cars.forEach((c) => car(c.x, c.y, c.c));
        car(x, H - 90, '#f2f4f8');
      });
    }
  });

  A.add({
    id: 'asteroids', name: 'Asteroids', icon: '☄️', cat: 'Action',
    how: '←/→ turn, ↑ thrust, Space shoot. Touch: hold where you want to aim — it flies and fires.',
    play(g) {
      const W = 520, H = 520;
      g.canvas(W, H);
      const s = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 };
      let bullets = [], rocks = [], cd = 0, wave = 0, inv = 1.5;
      const mk = (x, y, r) => ({ x, y, r, vx: g.rand(-70, 70) * (50 / r), vy: g.rand(-70, 70) * (50 / r), pts: Array.from({ length: 10 }, () => g.rand(0.75, 1.15)) });
      const spawnWave = () => { wave++; for (let i = 0; i < 2 + wave; i++) { let x, y; do { x = g.rand(0, W); y = g.rand(0, H); } while (Math.hypot(x - s.x, y - s.y) < 150); rocks.push(mk(x, y, 42)); } };
      spawnWave();
      const wrap = (o) => { o.x = (o.x + W) % W; o.y = (o.y + H) % H; };
      g.loop((dt) => {
        if (keyL(g)) s.a -= 4.2 * dt;
        if (keyR(g)) s.a += 4.2 * dt;
        let thrust = keyU(g);
        const fire = g.held.has(' ') || g.ptr.down;
        if (g.ptr.down) { s.a = Math.atan2(g.ptr.y - s.y, g.ptr.x - s.x); thrust = Math.hypot(g.ptr.y - s.y, g.ptr.x - s.x) > 70; }
        if (thrust) { s.vx += Math.cos(s.a) * 280 * dt; s.vy += Math.sin(s.a) * 280 * dt; }
        const damp = Math.pow(0.5, dt); s.vx *= damp; s.vy *= damp;
        s.x += s.vx * dt; s.y += s.vy * dt; wrap(s);
        cd -= dt;
        if (fire && cd <= 0) { cd = 0.2; bullets.push({ x: s.x + Math.cos(s.a) * 14, y: s.y + Math.sin(s.a) * 14, vx: Math.cos(s.a) * 500 + s.vx, vy: Math.sin(s.a) * 500 + s.vy, life: 0.9 }); }
        bullets.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; wrap(b); });
        rocks.forEach((r) => { r.x += r.vx * dt; r.y += r.vy * dt; wrap(r); });
        for (const b of bullets) for (const r of rocks) {
          if (r.dead || Math.hypot(b.x - r.x, b.y - r.y) > r.r) continue;
          r.dead = true; b.life = 0; g.add(r.r > 30 ? 20 : r.r > 15 ? 50 : 100);
          if (r.r > 15) rocks.push(mk(r.x, r.y, r.r / 2), mk(r.x, r.y, r.r / 2));
          break;
        }
        rocks = rocks.filter((r) => !r.dead); bullets = bullets.filter((b) => b.life > 0);
        inv -= dt;
        if (inv <= 0 && rocks.some((r) => Math.hypot(r.x - s.x, r.y - s.y) < r.r + 9)) return g.over();
        if (!rocks.length) spawnWave();
        g.clear();
        const k = g.ctx;
        rocks.forEach((r) => { k.strokeStyle = g.C.purple; k.lineWidth = 2; k.beginPath(); r.pts.forEach((m, i) => { const a = (i / r.pts.length) * Math.PI * 2; k[i ? 'lineTo' : 'moveTo'](r.x + Math.cos(a) * r.r * m, r.y + Math.sin(a) * r.r * m); }); k.closePath(); k.stroke(); });
        bullets.forEach((b) => g.circle(b.x, b.y, 2.5, g.C.yellow));
        if (inv <= 0 || Math.floor(inv * 10) % 2) {
          k.save(); k.translate(s.x, s.y); k.rotate(s.a); k.strokeStyle = g.C.cyan; k.lineWidth = 2;
          k.beginPath(); k.moveTo(15, 0); k.lineTo(-10, -9); k.lineTo(-6, 0); k.lineTo(-10, 9); k.closePath(); k.stroke();
          if (thrust) { k.strokeStyle = g.C.pink; k.beginPath(); k.moveTo(-7, -4); k.lineTo(-16 - Math.random() * 6, 0); k.lineTo(-7, 4); k.stroke(); }
          k.restore();
        }
        g.text('Wave ' + wave, W - 12, 20, 15, g.C.dim, 'right');
      });
    }
  });

  A.add({
    id: 'invaders', name: 'Space Invaders', icon: '👾', cat: 'Action',
    how: 'Move with mouse/finger or ←/→. Space or hold to shoot. 3 lives.',
    play(g) {
      const W = 480, H = 560;
      g.canvas(W, H);
      let x = W / 2, shots = [], bombs = [], aliens = [], dir = 1, spd = 40, cd = 0, lives = 3, wave = 0, hurt = 0;
      const make = () => { wave++; aliens = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) aliens.push({ x: 64 + c * 46, y: 70 + r * 38, r }); spd = 34 + wave * 12; };
      make();
      g.loop((dt) => {
        if (keyL(g)) { x -= 330 * dt; g.ptr.t = 0; }
        if (keyR(g)) { x += 330 * dt; g.ptr.t = 0; }
        if (g.ptr.t) x += (g.ptr.x - x) * Math.min(1, dt * 14);
        x = g.clamp(x, 20, W - 20);
        cd -= dt; hurt -= dt;
        if ((g.held.has(' ') || g.ptr.down) && cd <= 0) { cd = 0.38; shots.push({ x, y: H - 54 }); }
        let edge = false;
        aliens.forEach((a) => { a.x += dir * spd * dt; if (a.x < 18 || a.x > W - 18) edge = true; });
        if (edge) { dir *= -1; aliens.forEach((a) => { a.y += 16; a.x += dir * 4; }); }
        if (aliens.length && Math.random() < dt * (0.9 + wave * 0.35)) { const a = g.pick(aliens); bombs.push({ x: a.x, y: a.y + 10 }); }
        shots.forEach((s) => (s.y -= 540 * dt));
        bombs.forEach((b) => (b.y += (200 + wave * 15) * dt));
        for (const s of shots) for (const a of aliens) if (!a.dead && Math.abs(s.x - a.x) < 17 && Math.abs(s.y - a.y) < 13) { a.dead = true; s.y = -99; g.add(10 * (4 - a.r)); break; }
        for (const b of bombs) if (hurt <= 0 && Math.abs(b.x - x) < 18 && b.y > H - 52 && b.y < H - 22) { b.y = H + 99; lives--; hurt = 1; if (!lives) return g.over(); }
        aliens = aliens.filter((a) => !a.dead); shots = shots.filter((s) => s.y > -10); bombs = bombs.filter((b) => b.y < H + 10);
        if (aliens.some((a) => a.y > H - 80)) return g.over('They landed!');
        if (!aliens.length) make();
        g.clear();
        aliens.forEach((a) => g.text(a.r === 0 ? '👾' : a.r === 1 ? '👽' : '🛸', a.x, a.y, 26));
        shots.forEach((s) => g.rrect(s.x - 2, s.y - 8, 4, 14, 2, g.C.cyan));
        bombs.forEach((b) => g.rrect(b.x - 2, b.y - 6, 4, 12, 2, g.C.pink));
        if (hurt <= 0 || Math.floor(hurt * 10) % 2) { const k = g.ctx; k.fillStyle = g.C.cyan; k.beginPath(); k.moveTo(x, H - 54); k.lineTo(x - 18, H - 26); k.lineTo(x + 18, H - 26); k.closePath(); k.fill(); }
        g.text('♥'.repeat(lives), 12, 22, 18, g.C.pink, 'left');
        g.text('Wave ' + wave, W - 12, 22, 15, g.C.dim, 'right');
      });
    }
  });

  A.add({
    id: 'stack', name: 'Stack', icon: '🏗️', cat: 'Action',
    how: 'Tap or Space to drop the block. Only the overlapping part stays.',
    play(g) {
      const W = 400, H = 600, BH = 26;
      g.canvas(W, H);
      let stack = [{ x: 100, w: 200 }], cur = { x: 0, w: 200, dir: 1 }, spd = 190, cam = 0, falling = null;
      const yOf = (i) => H - 60 - i * BH + cam;
      const color = (i) => `hsl(${(190 + i * 9) % 360} 85% 62%)`;
      const drop = () => {
        if (g.ended) return;
        const top = stack[stack.length - 1];
        const l = Math.max(cur.x, top.x), r = Math.min(cur.x + cur.w, top.x + top.w);
        if (r <= l) { falling = { ...cur, i: stack.length, vy: 0 }; return g.over(); }
        const perfect = Math.abs(cur.x - top.x) < 5;
        const nb = perfect ? { x: top.x, w: top.w } : { x: l, w: r - l };
        stack.push(nb); g.add(1); spd = Math.min(420, spd + 9);
        if (perfect) g.msg('Perfect!'); else g.msg('');
        const fromLeft = stack.length % 2 === 0;
        cur = { x: fromLeft ? 0 : W - nb.w, w: nb.w, dir: fromLeft ? 1 : -1 };
      };
      g.tap(drop);
      g.key((k) => { if (k === ' ') drop(); });
      g.loop((dt) => {
        cur.x += cur.dir * spd * dt;
        if (cur.x < 0) { cur.x = 0; cur.dir = 1; }
        if (cur.x + cur.w > W) { cur.x = W - cur.w; cur.dir = -1; }
        cam += (Math.max(0, (stack.length - 14) * BH) - cam) * Math.min(1, dt * 5);
        g.clear('#0d0f1a');
        stack.forEach((b, i) => g.rect(b.x, yOf(i), b.w, BH - 2, color(i)));
        g.rect(cur.x, yOf(stack.length), cur.w, BH - 2, color(stack.length));
        g.text(String(g.score()), W / 2, 60, 44);
      });
    }
  });

  A.add({
    id: 'heli', name: 'Helicopter', icon: '🚁', cat: 'Action',
    how: 'Hold mouse/finger or Space to fly up, let go to drop. Stay in the cave.',
    play(g) {
      const W = 640, H = 360, CW = 20;
      g.canvas(W, H);
      let y = H / 2, vy = 0, top = 50, gap = 250, spd = 210, dist = 0, off = 0, started = false;
      const next = () => { gap = Math.max(140, gap - 0.6); top = g.clamp(top + g.rand(-16, 16), 10, H - gap - 10); return { t: top, g: gap, block: Math.random() < 0.06 ? g.rand(top + 30, top + gap - 70) : null }; };
      const cols = Array.from({ length: W / CW + 2 }, () => ({ t: top, g: gap, block: null }));
      g.loop((dt) => {
        const hold = g.ptr.down || g.held.has(' ') || keyU(g);
        if (hold) started = true;
        if (started) {
          vy = g.clamp(vy + (hold ? -750 : 750) * dt, -320, 320); y += vy * dt;
          spd += 5 * dt; dist += spd * dt; off += spd * dt;
          while (off >= CW) { off -= CW; cols.shift(); cols.push(next()); }
          g.score(Math.floor(dist / 10));
          const c = cols[Math.floor((130 + off) / CW)];
          if (y - 9 < c.t || y + 9 > c.t + c.g || (c.block != null && y + 9 > c.block && y - 9 < c.block + 40)) return g.over('Crashed!');
        }
        g.clear('#0d0f1a');
        cols.forEach((c, i) => { const cx = i * CW - off; g.rect(cx, 0, CW + 1, c.t, '#2a1630'); g.rect(cx, c.t + c.g, CW + 1, H, '#2a1630'); if (c.block != null) g.rect(cx, c.block, CW + 1, 40, g.C.pink); });
        g.rrect(112, y - 8, 34, 16, 8, g.C.cyan); g.rect(104, y - 13, 50, 3, g.C.white); g.rect(96, y - 2, 18, 4, g.C.cyan);
        if (!started) g.text('Hold to fly', W / 2, H / 2, 22, g.C.dim);
      });
    }
  });

  A.add({
    id: 'skyhop', name: 'Sky Hop', icon: '🐸', cat: 'Action',
    how: 'You bounce automatically. Steer with mouse/finger or ←/→. Go as high as you can.',
    play(g) {
      const W = 400, H = 600;
      g.canvas(W, H);
      const p = { x: W / 2, y: H - 120, vy: -640 };
      let plats = [], cam = 0, maxH = 0;
      for (let i = 0; i < 10; i++) plats.push({ x: g.rand(10, W - 80), y: H - 40 - i * 62, w: 66, move: 0 });
      plats[0].x = W / 2 - 33;
      g.loop((dt) => {
        if (keyL(g)) { p.x -= 320 * dt; g.ptr.t = 0; }
        if (keyR(g)) { p.x += 320 * dt; g.ptr.t = 0; }
        if (g.ptr.t) p.x += (g.ptr.x - p.x) * Math.min(1, dt * 7);
        p.x = (p.x + W) % W;
        const py = p.y;
        p.vy += 1150 * dt; p.y += p.vy * dt;
        plats.forEach((pl) => { if (pl.move) { pl.x += pl.move * dt; if (pl.x < 0 || pl.x > W - pl.w) pl.move *= -1; } });
        if (p.vy > 0) for (const pl of plats) if (py <= pl.y && p.y >= pl.y && p.x > pl.x - 12 && p.x < pl.x + pl.w + 12) { p.vy = -640; p.y = pl.y; break; }
        if (p.y < cam + H * 0.4) cam = p.y - H * 0.4;
        maxH = Math.max(maxH, H - 120 - p.y);
        g.score(Math.floor(maxH / 10));
        let highest = Math.min(...plats.map((pl) => pl.y));
        while (highest > cam - 80) { highest -= g.rand(55, 70 + Math.min(40, maxH / 300)); plats.push({ x: g.rand(0, W - 66), y: highest, w: 66, move: Math.random() < Math.min(0.4, maxH / 8000) ? g.pick([-80, 80]) : 0 }); }
        plats = plats.filter((pl) => pl.y < cam + H + 30);
        if (p.y > cam + H + 40) return g.over('You fell!');
        g.clear('#0d1020');
        plats.forEach((pl) => g.rrect(pl.x, pl.y - cam, pl.w, 12, 6, pl.move ? g.C.yellow : g.C.green));
        g.circle(p.x, p.y - cam - 14, 14, g.C.pink);
        g.circle(p.x - 5, p.y - cam - 17, 3, g.C.white); g.circle(p.x + 5, p.y - cam - 17, 3, g.C.white);
      });
    }
  });
})();
