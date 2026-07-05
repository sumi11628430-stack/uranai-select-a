/* =========================================================
   星座占い：表示ロジック
   ・12星座ボタンから選んで詳細表示
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var grid   = document.getElementById("zodiacGrid");
  var result = document.getElementById("result");
  if (!grid || !result) return;

  function fortuneSec(icon, label, text, extra) {
    return '<div class="f-sec' + (extra ? ' ' + extra : '') + '"><h3>' + icon + ' ' + label + '</h3><p>' + text + '</p></div>';
  }

  function render(z) {
    result.hidden = false;
    result.innerHTML =
      '<div class="zodiac-symbol">' + z.symbol + '</div>' +
      '<h2 class="bs-rtitle">' + z.name + '<small style="display:block;font-size:.5em;letter-spacing:.2em;color:var(--text-dim);margin-top:.3em;">' + z.en + '　' + z.range + '</small></h2>' +
      '<p class="bs-title">' + z.catch + '</p>' +
      '<div class="lucky-row" style="margin-bottom:1.6rem;">' +
        '<span class="lucky-chip"><b>エレメント</b>' + z.element + '</span>' +
        '<span class="lucky-chip"><b>支配星</b>' + z.planet + '</span>' +
        '<span class="lucky-chip"><b>守護石</b>' + z.stone + '</span>' +
        '<span class="lucky-chip"><b>ラッキーカラー</b>' + z.color + '</span>' +
      '</div>' +
      '<div class="fortune-sections">' +
        fortuneSec("🌟", "性格", z.personality) +
        fortuneSec("💗", "恋愛運", z.love) +
        fortuneSec("💼", "仕事運", z.work) +
        fortuneSec("✨", "開運アドバイス", z.advice, "advice") +
      '</div>' +
      '<p class="bs-listtitle" style="margin-top:1.6rem;">相性の良い星座</p>' +
      '<div class="lucky-row"><span class="lucky-chip"><b>好相性</b>' + z.compatible.join("・") + '</span></div>';

    if (typeof setZodiacConstellation === "function") setZodiacConstellation(z.key);
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  ZODIAC.forEach(function (z) {
    var b = document.createElement("button");
    b.className = "month-btn zodiac-btn";
    b.type = "button";
    b.innerHTML = '<span class="zodiac-btn-symbol">' + z.symbol + '</span>' + z.name;
    b.addEventListener("click", function () {
      var actives = grid.querySelectorAll(".month-btn");
      for (var i = 0; i < actives.length; i++) actives[i].classList.remove("on");
      b.classList.add("on");
      render(z);
    });
    grid.appendChild(b);
  });
});
