/* =========================================================
   おみくじ：抽選ロジック（1日1回、localStorageで日付管理）
   ・引く時は「箱を激しく振る→みくじ棒＋光の輪がせり出す→
   　全画面フラッシュ＋火花＋紙吹雪と共に結果が飛び出す」の
   　派手な演出つき
   ・抽選と保存はクリック直後に確定し、表示だけを演出後に行う
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var box     = document.getElementById("omikujiBox");
  var result  = document.getElementById("result");
  var already = document.getElementById("omikujiAlready");
  if (!box || !result) return;

  var STORAGE_KEY = "omikuji_last_draw";
  /* ローカルファイル(file://)で開いたときはテスト用に「1日1回」制限を無効化。
     本番(https)では通常どおり1日1回。リロードすれば何度でも引ける。 */
  var testMode = (location.protocol === "file:");
  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* 判定不能なら演出あり */ }

  /* 演出中のかけ声（スクリーンリーダーにも読み上げ） */
  var status = document.createElement("p");
  status.className = "omikuji-status";
  status.setAttribute("aria-live", "polite");
  box.insertAdjacentElement("afterend", status);

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function fortuneSec(icon, label, text, extra) {
    return '<div class="f-sec' + (extra ? ' ' + extra : '') + '"><h3>' + icon + ' ' + label + '</h3><p>' + text + '</p></div>';
  }

  function render(o, animate) {
    result.hidden = false;
    result.classList.remove("ok-reveal");
    result.innerHTML =
      '<p class="omikuji-result-title ' + o.cls + '">' + o.kind + '</p>' +
      '<p class="bs-title">' + o.catch + '</p>' +
      '<div class="fortune-sections">' +
        fortuneSec("🔮", "総合運", o.overall) +
        fortuneSec("💗", "恋愛運", o.love) +
        fortuneSec("💼", "仕事運", o.work) +
        fortuneSec("💰", "金運", o.money) +
        fortuneSec("🌿", "健康運", o.health) +
        fortuneSec("✨", "今日の一言", o.advice, "advice") +
      '</div>';
    if (animate) result.classList.add("ok-reveal");
    /* 結果への自動スクロールはしない（その場で見せる） */
  }

  function loadToday() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.date !== todayStr()) return null;
      var found = null;
      for (var i = 0; i < OMIKUJI.length; i++) { if (OMIKUJI[i].kind === data.kind) { found = OMIKUJI[i]; break; } }
      return found;
    } catch (e) { return null; }
  }

  function saveToday(o) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), kind: o.kind })); } catch (e) { /* 保存できなくても続行 */ }
  }

  var existing = testMode ? null : loadToday();
  if (existing) {
    box.classList.add("drawn");
    box.textContent = "🎋";
    if (already) already.hidden = false;
    render(existing, false);
  }

  function spawnRays() {
    var rays = document.createElement("span");
    rays.className = "ok-rays";
    box.appendChild(rays);
    setTimeout(function () { if (rays.parentNode) rays.parentNode.removeChild(rays); }, 1400);
  }

  function spawnScreenFlash() {
    var flash = document.createElement("div");
    flash.className = "ok-screen-flash";
    document.body.appendChild(flash);
    setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 650);
  }

  function spawnSparks() {
    var colors = ["#ffe9a8", "#fff6da", "#ffcf6b"];
    for (var i = 0; i < 26; i++) {
      var s = document.createElement("span");
      s.className = "ok-spark";
      var ang  = (Math.PI * 2 * i) / 26 + Math.random() * .4;
      var dist = 110 + Math.random() * 130;
      var size = 6 + Math.random() * 8;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.background = colors[i % colors.length];
      s.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist).toFixed(1) + "px");
      s.style.animationDelay = (Math.random() * .12).toFixed(2) + "s";
      box.appendChild(s);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1500); })(s);
    }
  }

  function spawnConfetti() {
    var colors = ["#f2c53d", "#e8544a", "#7fd6a0", "#9cc4e8", "#ffffff", "#f2a63d"];
    var rect = box.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height * .35;
    for (var i = 0; i < 26; i++) {
      var el = document.createElement("span");
      el.className = "ok-confetti";
      var ang  = Math.random() * Math.PI * 2;
      var dist = 140 + Math.random() * 220;
      var dx = Math.cos(ang) * dist;
      var dy = Math.sin(ang) * dist * 0.6 + 220;
      el.style.left = cx + "px";
      el.style.top = cy + "px";
      el.style.background = colors[i % colors.length];
      el.style.setProperty("--cx", dx.toFixed(1) + "px");
      el.style.setProperty("--cy", dy.toFixed(1) + "px");
      el.style.setProperty("--cr", (Math.random() * 720 - 360).toFixed(0) + "deg");
      el.style.animationDelay = (Math.random() * .2).toFixed(2) + "s";
      document.body.appendChild(el);
      (function (node) { setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 2200); })(el);
    }
  }

  /* 出た結果に応じた色のキラキラ演出。
     半吉〜大吉のみ色つき、末吉以下は何もしない（既存演出のみ）。
       大吉=金 / 中吉=銀 / 小吉=緑 / 吉=青 / 半吉=青 */
  var RESULT_GLOW = {
    "ok-daikichi": ["#ffe9a8", "#ffd76b", "#fff3c2"], // 金
    "ok-chukichi": ["#eef2f9", "#c9d3e2", "#ffffff"], // 銀
    "ok-shokichi": ["#a8ecc2", "#5ecb8b", "#d9f7e6"], // 緑
    "ok-kichi":    ["#fff27a", "#ffe63d", "#fff6c2"], // 黄
    "ok-hankichi": ["#a9cdf2", "#6ea8e6", "#dbeafe"]  // 青
  };
  function spawnResultGlow(o) {
    var palette = RESULT_GLOW[o.cls];
    if (!palette) return; // 末吉以下は色つき演出なし

    /* 色つきの光の輪 */
    var halo = document.createElement("span");
    halo.className = "ok-color-halo";
    halo.style.setProperty("--glow", palette[1]);
    box.appendChild(halo);
    setTimeout(function () { if (halo.parentNode) halo.parentNode.removeChild(halo); }, 1500);

    /* 星（キラキラ）を放射状に飛ばす */
    for (var i = 0; i < 22; i++) {
      var t = document.createElement("span");
      t.className = "ok-twinkle";
      var ang  = (Math.PI * 2 * i) / 22 + Math.random() * .5;
      var dist = 90 + Math.random() * 140;
      t.style.color = palette[i % palette.length];
      t.style.fontSize = (11 + Math.random() * 12).toFixed(0) + "px";
      t.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      t.style.setProperty("--dy", (Math.sin(ang) * dist).toFixed(1) + "px");
      t.style.animationDelay = (Math.random() * .28).toFixed(2) + "s";
      box.appendChild(t);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1900); })(t);
    }
  }

  var drawing = false;
  function doDraw() {
    if (drawing || box.classList.contains("drawn")) return;
    drawing = true;
    var o = drawOmikuji();
    saveToday(o);
    if (already) already.hidden = true;

    if (reduced) {
      box.classList.add("drawn");
      box.textContent = "🎋";
      render(o, false);
      drawing = false;
      return;
    }

    /* 1) 箱を激しく振る（画面全体も連動して揺れる） */
    box.classList.add("shaking");
    document.body.classList.add("ok-page-shake");
    status.textContent = "ジャラジャラジャラ……ッ！";
    setTimeout(function () {
      box.classList.remove("shaking");
      document.body.classList.remove("ok-page-shake");

      /* 2) みくじ棒が光の輪と共にせり出す */
      var stick = document.createElement("span");
      stick.className = "omikuji-stick";
      stick.textContent = "御神籤";
      box.appendChild(stick);
      box.classList.add("stick-out");
      spawnRays();
      status.textContent = "キター――ッ！！";

      setTimeout(function () {
        /* 3) ドバー！ピカー！の大演出＋結果表示 */
        box.classList.remove("stick-out");
        box.classList.add("drawn");
        box.textContent = "🎋";
        box.classList.add("flash");
        document.body.classList.add("ok-impact-shake");
        spawnScreenFlash();
        spawnSparks();
        spawnConfetti();
        spawnResultGlow(o);
        status.textContent = "";
        render(o, true);
        setTimeout(function () { document.body.classList.remove("ok-impact-shake"); }, 320);
        setTimeout(function () { box.classList.remove("flash"); drawing = false; }, 900);
      }, 1000);
    }, 2000);
  }
  box.addEventListener("click", doDraw);
  box.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); doDraw(); }
  });
});
