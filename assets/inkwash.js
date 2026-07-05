/* =========================================================
   姓名判断ページ用 背景アニメーション（墨と筆・和紙のイメージ）
   ・和紙のような深い色の下地に、墨のにじみがゆっくり広がる
   ・筆で書いたような曲線のストロークが浮かんでは消える
   ・朱色の印（はんこ）のような光の粒が漂う
   robust設計（例外・リサイズ・reduce-motion対応）
   ========================================================= */
(function () {
  var canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var w, h, dpr;
  var blots = [];   // 墨のにじみ
  var strokes = []; // 筆致（曲線）
  var seals = [];   // 朱色の粒（印）

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    build();
    if (reduceMotion) drawStatic();
  }

  function build() {
    var area = (w * h) / (dpr * dpr);
    blots = [];
    var bCount = Math.min(10, Math.max(4, Math.floor(area / 90000)));
    for (var i = 0; i < bCount; i++) {
      blots.push({
        x: Math.random() * w, y: Math.random() * h,
        r: rand(60, 150) * dpr, phase: rand(0, Math.PI * 2), speed: rand(.15, .35), a: rand(.04, .09)
      });
    }
    strokes = [];
    var sCount = Math.min(7, Math.max(3, Math.floor(area / 140000)));
    for (var j = 0; j < sCount; j++) strokes.push(makeStroke());

    seals = [];
    var seCount = Math.min(14, Math.floor(area / 70000));
    for (var k = 0; k < seCount; k++) {
      seals.push({
        x: Math.random() * w, y: Math.random() * h,
        r: rand(2, 4.5) * dpr, vy: rand(-.15, -.03) * dpr, vx: rand(-.05, .05) * dpr,
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  function makeStroke() {
    var x0 = rand(w * .05, w * .95), y0 = rand(h * .1, h * .9);
    var len = rand(90, 220) * dpr;
    var ang = rand(0, Math.PI * 2);
    return {
      x0: x0, y0: y0,
      x1: x0 + Math.cos(ang) * len * .5 + rand(-40, 40),
      y1: y0 + Math.sin(ang) * len * .5 + rand(-40, 40),
      x2: x0 + Math.cos(ang) * len, y2: y0 + Math.sin(ang) * len,
      width: rand(3, 9) * dpr,
      life: 0, dur: rand(6000, 11000), delay: rand(0, 8000)
    };
  }

  function drawBlot(b, t) {
    var pulse = 1 + 0.06 * Math.sin(t / 2600 + b.phase);
    var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
    g.addColorStop(0, "rgba(20,14,30," + b.a + ")");
    g.addColorStop(1, "rgba(20,14,30,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  function easeInOut(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function drawStroke(s, t) {
    var local = (t - s.delay) % s.dur;
    if (local < 0) return;
    var p = local / s.dur; // 0..1 : 0-.4 描画 .4-.7 保持 .7-1 フェード
    var alpha, drawT;
    if (p < 0.35) { drawT = easeInOut(p / 0.35); alpha = 0.5; }
    else if (p < 0.65) { drawT = 1; alpha = 0.5; }
    else { drawT = 1; alpha = 0.5 * (1 - (p - 0.65) / 0.35); }

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = "rgba(210,195,230,0.9)";
    ctx.lineWidth = s.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.x0, s.y0);
    var midx = s.x0 + (s.x1 - s.x0) * Math.min(1, drawT * 2);
    var midy = s.y0 + (s.y1 - s.y0) * Math.min(1, drawT * 2);
    if (drawT <= 0.5) {
      ctx.lineTo(midx, midy);
    } else {
      ctx.quadraticCurveTo(s.x1, s.y1,
        s.x1 + (s.x2 - s.x1) * ((drawT - 0.5) * 2),
        s.y1 + (s.y2 - s.y1) * ((drawT - 0.5) * 2));
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawSeal(s, t) {
    var tw = 0.4 + 0.6 * Math.abs(Math.sin(t / 1400 + s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(196,64,58," + (0.35 * tw) + ")";
    ctx.shadowColor = "rgba(196,64,58,.6)";
    ctx.shadowBlur = 6 * dpr;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function stepSeals(dt) {
    for (var i = 0; i < seals.length; i++) {
      var s = seals[i];
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; }
      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
    }
  }

  var last = 0;
  function frame(t) {
    var dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < blots.length; i++) drawBlot(blots[i], t);
    for (var j = 0; j < strokes.length; j++) drawStroke(strokes[j], t);
    stepSeals(dt);
    for (var k = 0; k < seals.length; k++) drawSeal(seals[k], t);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < blots.length; i++) drawBlot(blots[i], 0);
    for (var k = 0; k < seals.length; k++) drawSeal(seals[k], 0);
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
