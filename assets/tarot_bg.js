/* =========================================================
   背景アニメーション：タロットページ専用
   紫のベルベット地に、ゆっくり回る魔法陣（同心円）と
   漂う光の粒子。canvas 1枚で軽量に動作。
   ========================================================= */
(function () {
  const canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  let motes = [];
  let rings = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width  = Math.floor(innerWidth  * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width  = innerWidth  + "px";
    canvas.style.height = innerHeight + "px";
    build();
    if (reduceMotion) drawStatic();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    const area = (w * h) / (dpr * dpr);
    const moteCount = Math.min(70, Math.floor(area / 15000));

    motes = [];
    for (let i = 0; i < moteCount; i++) {
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1, 2.8) * dpr,
        vx: rand(-.12, .12) * dpr,
        vy: rand(-.3, -.06) * dpr,
        a: rand(.12, .45),
        gold: Math.random() < .5
      });
    }

    rings = [
      { cx: w * .5, cy: h * .42, r: Math.min(w, h) * .30, speed: .0016, phase: 0,   ticks: 12 },
      { cx: w * .5, cy: h * .42, r: Math.min(w, h) * .22, speed: -.0022, phase: 1,  ticks: 8 },
      { cx: w * .5, cy: h * .42, r: Math.min(w, h) * .38, speed: .0009, phase: 2.4, ticks: 16 }
    ];
  }

  function drawRing(ring, t) {
    const ang = ring.phase + t * ring.speed;
    ctx.save();
    ctx.translate(ring.cx, ring.cy);
    ctx.rotate(ang);
    ctx.strokeStyle = "rgba(200,170,240,.14)";
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < ring.ticks; i++) {
      const a = (Math.PI * 2 * i) / ring.ticks;
      const x1 = Math.cos(a) * ring.r, y1 = Math.sin(a) * ring.r;
      const x2 = Math.cos(a) * (ring.r - 8 * dpr), y2 = Math.sin(a) * (ring.r - 8 * dpr);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "rgba(232,200,110,.16)";
      ctx.stroke();
    }
    ctx.restore();
  }

  let last = 0;
  function frame(t) {
    const dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    ctx.clearRect(0, 0, w, h);

    for (const ring of rings) drawRing(ring, t);

    for (const m of motes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
      if (m.x < -10) m.x = w + 10;
      if (m.x > w + 10) m.x = -10;
      const color = m.gold ? "247,230,172" : "196,168,232";
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, `rgba(${color},${m.a})`);
      g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    for (const ring of rings) drawRing(ring, 0);
    for (const m of motes) {
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = m.gold ? "rgba(247,230,172,.5)" : "rgba(196,168,232,.5)";
      ctx.fill();
    }
  }

  addEventListener("resize", resize, { passive: true });
  resize();

  function loop(t) {
    try { frame(t); } catch (e) { /* 無視して継続 */ }
    requestAnimationFrame(loop);
  }
  if (reduceMotion) drawStatic();
  else requestAnimationFrame(loop);
})();
