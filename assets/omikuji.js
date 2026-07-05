/* =========================================================
   おみくじ：抽選ロジック（1日1回、localStorageで日付管理）
   ・引く時は「箱を振る→みくじ棒がせり出す→光」の演出つき
   ・抽選と保存はクリック直後に確定し、表示だけを演出後に行う
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var box     = document.getElementById("omikujiBox");
  var result  = document.getElementById("result");
  var already = document.getElementById("omikujiAlready");
  if (!box || !result) return;

  var STORAGE_KEY = "omikuji_last_draw";
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
    result.scrollIntoView({ behavior: "smooth", block: "start" });
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

  var existing = loadToday();
  if (existing) {
    box.classList.add("drawn");
    box.textContent = "🎋";
    if (already) already.hidden = false;
    render(existing, false);
  }

  function spawnSparks() {
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span");
      s.className = "ok-spark";
      var ang  = (Math.PI * 2 * i) / 14 + Math.random() * .5;
      var dist = 90 + Math.random() * 80;
      s.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist).toFixed(1) + "px");
      s.style.animationDelay = (Math.random() * .15).toFixed(2) + "s";
      box.appendChild(s);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1500); })(s);
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

    /* 1) 箱を振る */
    box.classList.add("shaking");
    status.textContent = "シャカシャカ……";
    setTimeout(function () {
      box.classList.remove("shaking");

      /* 2) みくじ棒がせり出す */
      var stick = document.createElement("span");
      stick.className = "omikuji-stick";
      stick.textContent = "御神籤";
      box.appendChild(stick);
      box.classList.add("stick-out");
      status.textContent = "出てきた……！";

      setTimeout(function () {
        /* 3) 光のバースト＋結果表示（textContent の差し替えで棒は自然に消える） */
        box.classList.remove("stick-out");
        box.classList.add("drawn");
        box.textContent = "🎋";
        box.classList.add("flash");
        spawnSparks();
        status.textContent = "";
        render(o, true);
        setTimeout(function () { box.classList.remove("flash"); drawing = false; }, 900);
      }, 950);
    }, 1650);
  }
  box.addEventListener("click", doDraw);
  box.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); doDraw(); }
  });
});
