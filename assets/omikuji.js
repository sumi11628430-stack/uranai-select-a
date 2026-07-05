/* =========================================================
   おみくじ：抽選ロジック（1日1回、localStorageで日付管理）
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var box    = document.getElementById("omikujiBox");
  var result = document.getElementById("result");
  var already = document.getElementById("omikujiAlready");
  if (!box || !result) return;

  var STORAGE_KEY = "omikuji_last_draw";

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function fortuneSec(icon, label, text, extra) {
    return '<div class="f-sec' + (extra ? ' ' + extra : '') + '"><h3>' + icon + ' ' + label + '</h3><p>' + text + '</p></div>';
  }

  function render(o, isReplay) {
    result.hidden = false;
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
    render(existing, true);
  }

  function doDraw() {
    if (box.classList.contains("drawn")) return;
    box.classList.add("drawn");
    box.textContent = "🎋";
    var o = drawOmikuji();
    saveToday(o);
    if (already) already.hidden = true;
    render(o, false);
  }
  box.addEventListener("click", doDraw);
  box.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); doDraw(); }
  });
});
