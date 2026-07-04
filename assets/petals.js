/* =========================================================
   誕生花ページ用 背景アニメーション
   花びらがやわらかく舞い散り、ほのかな光の玉（ボケ）が漂う。
   canvas 1枚で軽量に動作。robust設計（例外・リサイズ・reduce-motion対応）。
   ========================================================= */
(function () {
  var canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var w, h, dpr;
  var petals = [];
  var bokeh = [];

  // 花びらの色（やわらかな桜・薔薇・白のトーン）
  var PETAL = ["#ffd1e0", "#ffc0d4", "#ffe3ec", "#ffffff", "#ffb7cf", "#f7c9e0"];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width  = Math.floor(innerWidth  * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width  = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    build();
    if (reduceMotion) drawStatic();
  }

  function build() {
    var area = (w * h) / (dpr * dpr);
    var pCount = Math.min(60, Math.max(18, Math.floor(area / 20000)));
    var bCount = Math.min(30, Math.floor(area / 40000));

    petals = [];
    for (var i = 0; i < pCount; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(6, 13) * dpr,           // 花びらの大きさ
        color: PETAL[(Math.random() * PETAL.length) | 0],
        vy: rand(.3, .9) * dpr,          // 落下速度
        sway: rand(.6, 1.6),             // 横揺れの強さ
        swaySpeed: rand(.008, .02),
        phase: rand(0, Math.PI * 2),
        rot: rand(0, Math.PI * 2),
        vrot: rand(-.02, .02),
        alpha: rand(.55, .95)
      });
    }

    bokeh = [];
    for (var j = 0; j < bCount; j++) {
      bokeh.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(6, 22) * dpr,
        vy: rand(-.25, -.05) * dpr,
        vx: rand(-.1, .1) * dpr,
        a: rand(.05, .16)
      });
    }
  }

  // 1枚の花びらを描く（先のとがった楕円）
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    var r = p.r;
    var grad = ctx.createLinearGradient(0, -r, 0, r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, p.color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    // 花びら形：上下がとがった楕円
    ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r * 0.8, -r * 0.5, r * 0.8, r * 0.5, 0, r);
    ctx.bezierCurveTo(-r * 0.8, r * 0.5, -r * 0.8, -r * 0.5, 0, -r);
    ctx.closePath();
    ctx.fill();
    // 中央のすじ
    ctx.globalAlpha = p.alpha * 0.4;
    ctx.strokeStyle = "rgba(200,120,150,.5)";
    ctx.lineWidth = Math.max(.6, r * 0.06);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(0, r * 0.8);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBokeh() {
    for (var i = 0; i < bokeh.length; i++) {
      var b = bokeh[i];
      var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, "rgba(255,235,245," + b.a + ")");
      g.addColorStop(1, "rgba(255,235,245,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step(dt) {
    var i, b, p;
    for (i = 0; i < bokeh.length; i++) {
      b = bokeh[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < -30) { b.y = h + 30; b.x = Math.random() * w; }
    }
    for (i = 0; i < petals.length; i++) {
      p = petals[i];
      p.phase += p.swaySpeed * dt;
      p.x += Math.sin(p.phase) * p.sway * dpr;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
      if (p.x < -30) p.x = w + 30;
      if (p.x > w + 30) p.x = -30;
    }
  }

  var last = 0;
  function frame(t) {
    var dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    ctx.clearRect(0, 0, w, h);
    drawBokeh();
    step(dt);
    for (var i = 0; i < petals.length; i++) drawPetal(petals[i]);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    drawBokeh();
    for (var i = 0; i < petals.length; i++) drawPetal(petals[i]);
  }

  function loop(t) {
    try { frame(t); } catch (e) { /* 継続 */ }
    requestAnimationFrame(loop);
  }

  addEventListener("resize", resize, { passive: true });
  resize();
  if (reduceMotion) drawStatic();
  else requestAnimationFrame(loop);
})();
