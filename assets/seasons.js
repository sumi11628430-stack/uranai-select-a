/* =========================================================
   「あなたは何の日？」ページ用 背景アニメーション（アニメ・漫画風）
   ・朝→昼→夕→夜 と空の色がゆっくり移り変わる
   ・季節（選択した月に連動）：春=桜吹雪 / 夏=緑葉 / 秋=紅葉 / 冬=雪
   ・祭事の演出：提灯の連なり（夜はほんのり灯る）、夜には打ち上げ花火
   ・フラットなセル塗り調。robust設計（例外・リサイズ・reduce-motion対応）
   window.setSeasonMonth(m) で季節を切り替えられる。
   ========================================================= */
(function () {
  var canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var w, h, dpr;
  var clouds = [];
  var leaves = [];      // 季節の舞い物（桜・葉・紅葉・雪）
  var stars = [];
  var fireworks = [];   // 夜の花火
  var season = "spring";
  var CYCLE = 90000;    // 朝昼夕夜 1周 90秒

  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpC(c1, c2, t) {
    return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))];
  }
  function css(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }

  /* 時間帯ごとの空の色（上端・下端）: 朝 → 昼 → 夕 → 夜 */
  var SKY = [
    { top: [255, 183, 152], bot: [255, 226, 178] },  // 朝焼け
    { top: [110, 185, 235], bot: [190, 230, 250] },  // 昼
    { top: [235, 120, 100], bot: [255, 200, 120] },  // 夕焼け
    { top: [24, 28, 68],    bot: [60, 55, 110] }     // 夜
  ];

  var SEASON_LEAF = {
    spring: { colors: ["#ffd7e4", "#ffc3d6", "#fff0f5"], type: "petal" },
    summer: { colors: ["#7fca6e", "#5cb85c", "#a4de8f"], type: "leaf" },
    autumn: { colors: ["#e8843c", "#d95f2b", "#f2b344"], type: "momiji" },
    winter: { colors: ["#ffffff", "#eef4ff", "#dfeaff"], type: "snow" }
  };

  window.setSeasonMonth = function (m) {
    var s = (m >= 3 && m <= 5) ? "spring" : (m >= 6 && m <= 8) ? "summer" : (m >= 9 && m <= 11) ? "autumn" : "winter";
    if (s !== season) { season = s; buildLeaves(); }
  };

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
    clouds = [];
    var n = Math.max(3, Math.floor(innerWidth / 300));
    for (var i = 0; i < n; i++) {
      clouds.push({ x: Math.random() * w, y: rand(h * .06, h * .4), s: rand(.6, 1.3) * dpr, v: rand(.08, .25) * dpr });
    }
    stars = [];
    for (var j = 0; j < 90; j++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h * .7, r: rand(.5, 1.6) * dpr, tw: rand(0, Math.PI * 2) });
    }
    buildLeaves();
  }

  function buildLeaves() {
    leaves = [];
    var count = Math.min(46, Math.max(16, Math.floor((w * h) / (dpr * dpr) / 26000)));
    for (var i = 0; i < count; i++) {
      leaves.push({
        x: Math.random() * w, y: Math.random() * h,
        r: rand(5, 11) * dpr,
        c: SEASON_LEAF[season].colors[(Math.random() * 3) | 0],
        vy: (season === "snow" ? rand(.25, .6) : rand(.35, .9)) * dpr,
        sway: rand(.5, 1.5), swaySpeed: rand(.008, .02),
        phase: rand(0, Math.PI * 2), rot: rand(0, Math.PI * 2), vrot: rand(-.03, .03)
      });
    }
  }

  /* ---- 各パーツの描画（セル塗り・アニメ調） ---- */

  function drawSky(t) {
    // t: 0..1 (朝0 → 昼.25 → 夕.5 → 夜.75)
    var seg = Math.floor(t * 4) % 4;
    var next = (seg + 1) % 4;
    var f = (t * 4) % 1;
    var top = lerpC(SKY[seg].top, SKY[next].top, f);
    var bot = lerpC(SKY[seg].bot, SKY[next].bot, f);
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(top));
    g.addColorStop(1, css(bot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return { seg: seg, f: f, night: nightFactor(t) };
  }

  function nightFactor(t) {
    // 夜(0.625〜0.875が最も暗い)に1へ近づく係数
    var d = Math.min(Math.abs(t - .75), Math.abs(t - .75 + 1), Math.abs(t - .75 - 1));
    return Math.max(0, 1 - d / .22);
  }

  function drawSunMoon(t) {
    // 太陽: t 0〜.5 で東→西へ弧を描く / 月: t .5〜1
    var isSun = t < .55;
    var p = isSun ? (t / .55) : ((t - .55) / .45);
    var x = lerp(w * .08, w * .92, p);
    var y = h * .42 - Math.sin(p * Math.PI) * h * .3;
    if (isSun) {
      ctx.fillStyle = "#FFE08A";
      ctx.beginPath(); ctx.arc(x, y, 34 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,224,138,.7)";
      ctx.lineWidth = 3 * dpr;
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4 + t * 6;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 44 * dpr, y + Math.sin(a) * 44 * dpr);
        ctx.lineTo(x + Math.cos(a) * 56 * dpr, y + Math.sin(a) * 56 * dpr);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#FFF4C9";
      ctx.beginPath(); ctx.arc(x, y, 30 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.arc(x + 12 * dpr, y - 8 * dpr, 26 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function drawCloud(c, night) {
    var x = c.x, y = c.y, s = c.s;
    ctx.fillStyle = night > .5 ? "rgba(190,195,225,.35)" : "rgba(255,255,255,.9)";
    ctx.beginPath();
    ctx.arc(x, y, 26 * s, 0, Math.PI * 2);
    ctx.arc(x + 30 * s, y - 12 * s, 32 * s, 0, Math.PI * 2);
    ctx.arc(x + 64 * s, y, 24 * s, 0, Math.PI * 2);
    ctx.closePath(); ctx.fill();
    // アニメ風の平らな底
    ctx.fillRect(x - 26 * s, y, 114 * s, 14 * s);
  }

  function drawStars(night) {
    if (night <= 0) return;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.tw += .04;
      var a = night * (0.4 + 0.6 * Math.abs(Math.sin(s.tw)));
      ctx.fillStyle = "rgba(255,250,220," + a + ")";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* 祭事：画面上部に連なる提灯（夜はほんのり灯る） */
  function drawLanterns(time, night) {
    var n = Math.max(5, Math.floor(innerWidth / 170));
    ctx.strokeStyle = "rgba(60,40,40,.55)";
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var x = (w / n) * i;
      var y = h * .06 + Math.sin(i * 1.2) * 8 * dpr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (var j = 0; j < n; j++) {
      var lx = (w / n) * (j + .5);
      var ly = h * .06 + Math.sin((j + .5) * 1.2) * 8 * dpr + 12 * dpr;
      var swing = Math.sin(time / 900 + j) * 4 * dpr;
      lx += swing;
      // 灯り（夜ほど強く光る）
      if (night > .15) {
        var glow = ctx.createRadialGradient(lx, ly + 14 * dpr, 0, lx, ly + 14 * dpr, 40 * dpr);
        glow.addColorStop(0, "rgba(255,170,80," + (.5 * night) + ")");
        glow.addColorStop(1, "rgba(255,170,80,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(lx, ly + 14 * dpr, 40 * dpr, 0, Math.PI * 2); ctx.fill();
      }
      // 本体（赤提灯）
      ctx.fillStyle = night > .5 ? "#ff8a4d" : "#e05545";
      ctx.beginPath();
      ctx.ellipse(lx, ly + 14 * dpr, 10 * dpr, 13 * dpr, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(40,25,25,.8)";
      ctx.fillRect(lx - 6 * dpr, ly - 1 * dpr, 12 * dpr, 4 * dpr);
      ctx.fillRect(lx - 6 * dpr, ly + 25 * dpr, 12 * dpr, 4 * dpr);
      // 提灯のスジ
      ctx.strokeStyle = "rgba(120,40,30,.5)";
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(lx - 10 * dpr, ly + 14 * dpr);
      ctx.lineTo(lx + 10 * dpr, ly + 14 * dpr);
      ctx.stroke();
    }
  }

  /* 祭事：夜の打ち上げ花火 */
  function spawnFirework() {
    var cx = rand(w * .15, w * .85);
    var cy = rand(h * .12, h * .4);
    var col = ["#ff9db3", "#ffd97a", "#9fd8ff", "#c7a4ff", "#a8f0c1"][(Math.random() * 5) | 0];
    var parts = [];
    var n = 42;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var sp = rand(1.6, 2.6) * dpr;
      parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
    }
    fireworks.push({ parts: parts, col: col });
  }

  function drawFireworks(night, dt) {
    if (night > .55 && fireworks.length < 3 && Math.random() < .012) spawnFirework();
    for (var i = fireworks.length - 1; i >= 0; i--) {
      var fw = fireworks[i];
      var alive = false;
      for (var j = 0; j < fw.parts.length; j++) {
        var p = fw.parts[j];
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx * dt; p.y += p.vy * dt + .3 * dpr * dt;
        p.vx *= .985; p.vy *= .985;
        p.life -= .012 * dt;
        ctx.globalAlpha = Math.max(0, p.life) * night;
        ctx.fillStyle = fw.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * dpr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!alive) fireworks.splice(i, 1);
    }
  }

  /* 季節の舞い物 */
  function drawLeaf(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    var t = SEASON_LEAF[season].type;
    if (t === "snow") {
      ctx.beginPath(); ctx.arc(0, 0, p.r * .55, 0, Math.PI * 2); ctx.fill();
    } else if (t === "momiji") {
      // 簡略化した紅葉（5枚の先とがり）
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a = (i / 5) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
        ctx.lineTo(Math.cos(a + Math.PI / 5) * p.r * .45, Math.sin(a + Math.PI / 5) * p.r * .45);
      }
      ctx.closePath(); ctx.fill();
    } else {
      // 花びら / 葉（先のとがった楕円）
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * .8, -p.r * .4, p.r * .8, p.r * .4, 0, p.r);
      ctx.bezierCurveTo(-p.r * .8, p.r * .4, -p.r * .8, -p.r * .4, 0, -p.r);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function stepLeaves(dt) {
    for (var i = 0; i < leaves.length; i++) {
      var p = leaves[i];
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
  function frame(ts) {
    var dt = Math.min(2, (ts - last) / 16.67 || 1);
    last = ts;
    var t = (ts % CYCLE) / CYCLE;
    var sky = drawSky(t);
    drawStars(sky.night);
    drawSunMoon(t);
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      c.x += c.v * dt;
      if (c.x > w + 90 * c.s) c.x = -120 * c.s;
      drawCloud(c, sky.night);
    }
    drawFireworks(sky.night, dt);
    drawLanterns(ts, sky.night);
    stepLeaves(dt);
    for (var j = 0; j < leaves.length; j++) drawLeaf(leaves[j]);
  }

  function drawStatic() {
    // 動きを抑える設定：昼の空で静止画
    var sky = drawSky(.25);
    drawSunMoon(.25);
    for (var i = 0; i < clouds.length; i++) drawCloud(clouds[i], 0);
    drawLanterns(0, 0);
    for (var j = 0; j < leaves.length; j++) drawLeaf(leaves[j]);
  }

  function loop(ts) {
    try { frame(ts); } catch (e) { /* 継続 */ }
    requestAnimationFrame(loop);
  }

  addEventListener("resize", resize, { passive: true });
  resize();
  if (reduceMotion) drawStatic();
  else requestAnimationFrame(loop);
})();
