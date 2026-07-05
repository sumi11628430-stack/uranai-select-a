/* =========================================================
   おみくじページ用 背景アニメーション（神社の夜イメージ）
   ・赤提灯の連なりがゆらゆら灯る
   ・暖かい灯（火の粉）がゆっくり立ちのぼる
   ・白い紙吹雪（おみくじ紙のイメージ）が舞う
   robust設計（例外・リサイズ・reduce-motion対応）
   ========================================================= */
(function () {
  var canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var w, h, dpr;
  var embers = [];
  var papers = [];

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
    embers = [];
    var eCount = Math.min(40, Math.floor(area / 22000));
    for (var i = 0; i < eCount; i++) {
      embers.push({
        x: Math.random() * w, y: h + rand(0, h * .3),
        r: rand(1, 3) * dpr, vy: rand(.25, .6) * dpr, vx: rand(-.15, .15) * dpr,
        a: rand(.3, .8), phase: rand(0, Math.PI * 2)
      });
    }
    papers = [];
    var pCount = Math.min(16, Math.floor(area / 60000));
    for (var j = 0; j < pCount; j++) papers.push(makePaper());
  }

  function makePaper() {
    return {
      x: Math.random() * w, y: -20,
      w: rand(8, 14) * dpr, h: rand(14, 20) * dpr,
      vy: rand(.3, .7) * dpr, sway: rand(.5, 1.4), swaySpeed: rand(.01, .02), phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2), vrot: rand(-.02, .02)
    };
  }

  function drawLanterns(t) {
    var n = Math.max(5, Math.floor(innerWidth / 170));
    ctx.strokeStyle = "rgba(40,20,20,.6)";
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var x = (w / n) * i;
      var y = h * .07 + Math.sin(i * 1.2) * 8 * dpr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (var j = 0; j < n; j++) {
      var lx = (w / n) * (j + .5) + Math.sin(t / 1000 + j) * 4 * dpr;
      var ly = h * .07 + Math.sin((j + .5) * 1.2) * 8 * dpr + 14 * dpr;
      var glow = ctx.createRadialGradient(lx, ly + 16 * dpr, 0, lx, ly + 16 * dpr, 46 * dpr);
      glow.addColorStop(0, "rgba(255,150,70,.5)");
      glow.addColorStop(1, "rgba(255,150,70,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(lx, ly + 16 * dpr, 46 * dpr, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#c8402f";
      ctx.beginPath(); ctx.ellipse(lx, ly + 16 * dpr, 11 * dpr, 15 * dpr, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,220,140,.9)";
      ctx.beginPath(); ctx.ellipse(lx, ly + 16 * dpr, 4 * dpr, 8 * dpr, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(40,20,20,.85)";
      ctx.fillRect(lx - 6 * dpr, ly - 1 * dpr, 12 * dpr, 3 * dpr);
      ctx.fillRect(lx - 6 * dpr, ly + 28 * dpr, 12 * dpr, 3 * dpr);
    }
  }

  function drawEmbers(dt) {
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      e.phase += 0.03;
      e.y -= e.vy * dt;
      e.x += e.vx * dt + Math.sin(e.phase) * .3;
      if (e.y < -10) { e.y = h + 10; e.x = Math.random() * w; }
      var a = e.a * (0.6 + 0.4 * Math.sin(e.phase * 2));
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,180,90," + a + ")";
      ctx.shadowBlur = 6; ctx.shadowColor = "rgba(255,150,70,.8)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawPaper(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = "rgba(250,244,230,.85)";
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.strokeStyle = "rgba(180,60,50,.5)";
    ctx.lineWidth = .6 * dpr;
    ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  function stepPapers(dt) {
    for (var i = 0; i < papers.length; i++) {
      var p = papers[i];
      p.phase += p.swaySpeed * dt;
      p.x += Math.sin(p.phase) * p.sway * dpr;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
    }
  }

  var last = 0;
  function frame(t) {
    var dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    ctx.clearRect(0, 0, w, h);
    drawLanterns(t);
    drawEmbers(dt);
    stepPapers(dt);
    for (var i = 0; i < papers.length; i++) drawPaper(papers[i]);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    drawLanterns(0);
    for (var i = 0; i < papers.length; i++) drawPaper(papers[i]);
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
