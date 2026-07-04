/* =========================================================
   誕生石ページ用 背景アニメーション
   多数の宝石（💎モチーフ）が煌めきながらゆっくり漂う。
   canvas 1枚で軽量に動作。robust設計（例外・リサイズ・reduce-motion対応）。
   ========================================================= */
(function () {
  const canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w, h, dpr;
  let gems = [];
  let sparks = []; // 小さなキラメキ

  // 宝石の色（ライト＝中心, ダーク＝外周, グロー＝発光色）
  const COLORS = [
    { light: "#ffe1e6", dark: "#c0392b", glow: "rgba(224,80,80,.55)"   }, // ルビー系
    { light: "#dcecff", dark: "#2a6fd6", glow: "rgba(90,150,240,.55)"  }, // サファイア系
    { light: "#d8fff0", dark: "#1f9e6a", glow: "rgba(60,200,150,.55)"  }, // エメラルド系
    { light: "#f1e2ff", dark: "#8e44ad", glow: "rgba(180,120,230,.55)" }, // アメジスト系
    { light: "#fff7d6", dark: "#e0b100", glow: "rgba(240,210,100,.55)" }, // トパーズ系
    { light: "#e2fbff", dark: "#20b6c9", glow: "rgba(90,220,240,.5)"   }, // アクアマリン系
    { light: "#ffffff", dark: "#c9d2e6", glow: "rgba(255,255,255,.65)" }, // ダイヤ系
    { light: "#ffe6f4", dark: "#d63384", glow: "rgba(240,120,180,.5)"  }, // ピンク系
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width  = Math.floor(innerWidth  * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width  = innerWidth  + "px";
    canvas.style.height = innerHeight + "px";
    build();
    if (reduceMotion) drawStatic();
  }

  function build() {
    const area = (w * h) / (dpr * dpr);
    const gemCount   = Math.min(26, Math.max(8, Math.floor(area / 42000)));
    const sparkCount = Math.min(70, Math.floor(area / 14000));

    gems = [];
    for (let i = 0; i < gemCount; i++) {
      gems.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(14, 34) * dpr,
        col: COLORS[(Math.random() * COLORS.length) | 0],
        vx: rand(-.18, .18) * dpr,
        vy: rand(-.28, -.06) * dpr,   // ゆっくり上へ昇る
        rot: rand(0, Math.PI * 2),
        vrot: rand(-.006, .006),
        sp: rand(0, Math.PI * 2),     // 輝きの位相
        spSpeed: rand(.6, 1.6)
      });
    }

    sparks = [];
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(.5, 1.8) * dpr,
        base: rand(.2, .8),
        tw: rand(.7, 2.4),
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  const N = 8; // 八角形（ブリリアンカット上面のイメージ）

  function drawGem(g) {
    const r = g.r, col = g.col;
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rot);

    // 発光
    ctx.shadowColor = col.glow;
    ctx.shadowBlur = r * 1.1;

    // 外周（八角形）
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(0, 0, r * 0.12, 0, 0, r);
    grad.addColorStop(0, col.light);
    grad.addColorStop(1, col.dark);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.shadowBlur = 0;

    // ファセット（内側の面と放射線）
    const ir = r * 0.5;
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = Math.max(1, r * 0.03);
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const px = Math.cos(a) * ir, py = Math.sin(a) * ir;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      ctx.moveTo(Math.cos(a) * ir, Math.sin(a) * ir);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.stroke();

    // 中心のきらめき（4方向スター、脈動）
    const sp = 0.35 + 0.65 * Math.abs(Math.sin(g.sp));
    ctx.globalAlpha = sp;
    ctx.fillStyle = "rgba(255,255,255,.95)";
    const gl = r * 0.55 * sp;
    ctx.beginPath();
    ctx.moveTo(0, -gl);
    ctx.lineTo(gl * 0.16, -gl * 0.16);
    ctx.lineTo(gl, 0);
    ctx.lineTo(gl * 0.16, gl * 0.16);
    ctx.lineTo(0, gl);
    ctx.lineTo(-gl * 0.16, gl * 0.16);
    ctx.lineTo(-gl, 0);
    ctx.lineTo(-gl * 0.16, -gl * 0.16);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawSparks() {
    for (const s of sparks) {
      s.phase += 0.02 * s.tw;
      const b = s.base * (0.5 + 0.5 * Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,248,220," + b + ")";
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(255,235,180,.7)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function step(dt) {
    for (const g of gems) {
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += g.vrot * dt;
      g.sp += 0.03 * g.spSpeed * dt;
      const m = g.r + 20 * dpr;
      if (g.y < -m) { g.y = h + m; g.x = Math.random() * w; }
      if (g.x < -m) g.x = w + m;
      if (g.x > w + m) g.x = -m;
    }
  }

  let last = 0;
  function frame(t) {
    const dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    ctx.clearRect(0, 0, w, h);
    drawSparks();
    step(dt);
    for (const g of gems) drawGem(g);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    for (const s of sparks) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,248,220,.6)";
      ctx.fill();
    }
    for (const g of gems) drawGem(g);
  }

  // 例外が出てもアニメが止まらないよう、ループ側で再スケジュール
  function loop(t) {
    try { frame(t); } catch (e) { /* 無視して継続 */ }
    requestAnimationFrame(loop);
  }

  addEventListener("resize", resize, { passive: true });
  resize();

  if (reduceMotion) drawStatic();
  else requestAnimationFrame(loop);
})();
