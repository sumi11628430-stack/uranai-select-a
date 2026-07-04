/* =========================================================
   背景アニメーション：星空 + 漂う光の粒子 + 流れ星
   canvas 1枚で軽量に動作。両ページ共通で読み込む。
   ========================================================= */
(function () {
  const canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;

  // 「動きを減らす」設定の人には静止画にする
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  let stars = [];
  let motes = [];      // ふわふわ漂う金の粒子
  let shooting = null; // 流れ星（ときどき出現）

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width  = Math.floor(innerWidth  * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width  = innerWidth  + "px";
    canvas.style.height = innerHeight + "px";
    build();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    // 画面の広さに応じて星の数を調整
    const area = (w * h) / (dpr * dpr);
    const starCount = Math.min(220, Math.floor(area / 6000));
    const moteCount = Math.min(40, Math.floor(area / 30000));

    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(.4, 1.6) * dpr,
        base: rand(.25, .9),          // 基本の明るさ
        tw: rand(.6, 2.2),            // 瞬きの速さ
        phase: rand(0, Math.PI * 2),
        gold: Math.random() < .25     // 一部を金色に
      });
    }

    motes = [];
    for (let i = 0; i < moteCount; i++) {
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1, 2.6) * dpr,
        vx: rand(-.15, .15) * dpr,
        vy: rand(-.35, -.08) * dpr,   // ゆっくり上へ昇る
        a: rand(.15, .5)
      });
    }
  }

  function spawnShooting() {
    const startX = rand(w * .1, w * .9);
    const startY = rand(h * .05, h * .4);
    shooting = {
      x: startX, y: startY,
      vx: rand(4, 7) * dpr * (Math.random() < .5 ? -1 : 1),
      vy: rand(2.5, 4) * dpr,
      life: 1
    };
  }

  let last = 0;
  function frame(t) {
    const dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    ctx.clearRect(0, 0, w, h);

    // 星（瞬き）
    for (const s of stars) {
      s.phase += 0.02 * s.tw * dt;
      const bright = s.base * (0.6 + 0.4 * Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? `rgba(247,230,172,${bright})`
        : `rgba(235,235,255,${bright})`;
      ctx.shadowBlur = s.gold ? 8 : 3;
      ctx.shadowColor = s.gold ? "rgba(232,200,110,.8)" : "rgba(200,200,255,.6)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 漂う金の粒子
    for (const m of motes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
      if (m.x < -10) m.x = w + 10;
      if (m.x > w + 10) m.x = -10;
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, `rgba(247,230,172,${m.a})`);
      g.addColorStop(1, "rgba(247,230,172,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 流れ星
    if (!shooting && Math.random() < 0.004) spawnShooting();
    if (shooting) {
      const s = shooting;
      const tailX = s.x - s.vx * 6;
      const tailY = s.y - s.vy * 6;
      const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(247,230,172,${s.life})`);
      grad.addColorStop(1, "rgba(247,230,172,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= 0.012 * dt;
      if (s.life <= 0 || s.y > h || s.x < 0 || s.x > w) shooting = null;
    }

    requestAnimationFrame(frame);
  }

  function drawStatic() {
    // reduce-motion 時：瞬きなしで一度だけ描画
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold ? "rgba(247,230,172,.7)" : "rgba(235,235,255,.7)";
      ctx.fill();
    }
  }

  addEventListener("resize", resize, { passive: true });
  resize();

  if (reduceMotion) drawStatic();
  else requestAnimationFrame(frame);
})();
