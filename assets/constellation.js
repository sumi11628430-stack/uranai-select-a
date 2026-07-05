/* =========================================================
   星座占いページ用 背景アニメーション
   ・きらめく星空（starfield.js と同系統だがやや密に）
   ・選択中の星座を、星をつないだ線画（コンステレーション風）で表示
   ・window.setZodiacConstellation(key) で切り替え
   簡略化した星座線画のため、実際の星の配置とは異なります（演出目的）。
   robust設計（例外・リサイズ・reduce-motion対応）
   ========================================================= */
(function () {
  var canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var w, h, dpr;
  var stars = [];
  var currentKey = "aries";

  /* 各星座の簡略化した線画（0〜1の正規化座標。演出目的の簡略版） */
  var SHAPES = {
    aries:       [[.30,.55],[.42,.42],[.55,.50],[.68,.38],[.78,.45]],
    taurus:      [[.25,.35],[.38,.55],[.50,.60],[.62,.55],[.75,.35],[.50,.60],[.50,.78]],
    gemini:      [[.35,.25],[.35,.75],[.65,.25],[.65,.75],[.35,.25],[.65,.25]],
    cancer:      [[.30,.45],[.45,.35],[.50,.55],[.55,.35],[.70,.45],[.50,.55],[.50,.75]],
    leo:         [[.22,.60],[.35,.40],[.48,.35],[.60,.42],[.68,.38],[.75,.45],[.60,.42],[.55,.65],[.35,.40]],
    virgo:       [[.20,.30],[.35,.45],[.48,.35],[.55,.55],[.68,.45],[.75,.65],[.55,.55],[.45,.75]],
    libra:       [[.25,.55],[.50,.30],[.75,.55],[.25,.55],[.75,.55],[.50,.30],[.50,.72]],
    scorpio:     [[.20,.30],[.32,.45],[.44,.42],[.55,.55],[.65,.62],[.72,.75],[.80,.80]],
    sagittarius: [[.22,.75],[.50,.25],[.65,.40],[.50,.25],[.42,.55],[.62,.60],[.50,.25]],
    capricorn:   [[.22,.35],[.38,.55],[.55,.42],[.68,.60],[.80,.55],[.68,.60],[.60,.78]],
    aquarius:    [[.20,.35],[.32,.45],[.44,.35],[.56,.45],[.68,.35],[.80,.45]],
    pisces:      [[.18,.40],[.30,.55],[.42,.50],[.55,.58],[.45,.30],[.55,.58],[.68,.65],[.80,.60],[.72,.42]]
  };

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    buildStars();
    if (reduceMotion) drawStatic();
  }

  function buildStars() {
    var area = (w * h) / (dpr * dpr);
    var n = Math.min(260, Math.floor(area / 4500));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: rand(.5, 1.7) * dpr, base: rand(.35, .95), tw: rand(.6, 2.2), phase: rand(0, Math.PI * 2)
      });
    }
  }

  window.setZodiacConstellation = function (key) {
    if (SHAPES[key]) currentKey = key;
  };

  function drawStars(t) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.phase += 0.02 * s.tw;
      var bright = s.base * (0.55 + 0.45 * Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(225,225,255," + bright + ")";
      ctx.shadowBlur = 3;
      ctx.shadowColor = "rgba(200,200,255,.6)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawConstellation(t) {
    var pts = SHAPES[currentKey];
    if (!pts) return;
    // 画面中央やや上に、余白を保ちつつ配置
    var boxW = Math.min(w, h) * 0.7;
    var boxH = boxW * 0.6;
    var ox = (w - boxW) / 2;
    var oy = h * 0.16;
    var pulse = 0.7 + 0.3 * Math.sin(t / 900);

    var abs = pts.map(function (p) { return [ox + p[0] * boxW, oy + p[1] * boxH]; });

    ctx.save();
    ctx.strokeStyle = "rgba(247,230,172," + (0.55 * pulse) + ")";
    ctx.lineWidth = 1.6 * dpr;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(247,230,172,.6)";
    ctx.beginPath();
    ctx.moveTo(abs[0][0], abs[0][1]);
    for (var i = 1; i < abs.length; i++) ctx.lineTo(abs[i][0], abs[i][1]);
    ctx.stroke();

    for (var j = 0; j < abs.length; j++) {
      ctx.beginPath();
      ctx.arc(abs[j][0], abs[j][1], 3.2 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,250,235,.95)";
      ctx.shadowBlur = 12;
      ctx.fill();
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    drawStars(t);
    drawConstellation(t);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    drawStars(0);
    drawConstellation(0);
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
