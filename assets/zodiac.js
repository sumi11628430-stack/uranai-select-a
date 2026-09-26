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

  /* 星座のイラスト（assets/zodiac/<key>.webp）。画像がまだ無い・読めない時は記号（♈など）を表示 */
  function zodiacIcon(z, cls) {
    return '<img class="' + cls + '" src="assets/zodiac/' + z.key + '.webp" alt="' + z.name + '" ' +
           'onerror="this.replaceWith(document.createTextNode(&quot;' + z.symbol + '&quot;))">';
  }

  function render(z) {
    result.hidden = false;
    result.innerHTML =
      '<div class="zodiac-symbol">' + zodiacIcon(z, "zodiac-symbol-img") + '</div>' +
      '<h2 class="bs-rtitle">' + z.name + '<small style="display:block;font-size:.5em;letter-spacing:.2em;color:var(--text-dim);margin-top:.3em;">' + z.en + '　' + z.range + '</small></h2>' +
      '<p class="bs-title">' + z.catch + '</p>' +
      '<div class="zodiac-top">' +
        '<div class="zodiac-basics">' +
          '<span class="lucky-chip"><b>エレメント</b>' + z.element + '</span>' +
          '<span class="lucky-chip"><b>支配星</b>' + z.planet + '</span>' +
          '<span class="lucky-chip"><b>守護石</b>' + z.stone + '</span>' +
          '<span class="lucky-chip"><b>ラッキーカラー</b>' + z.color + '</span>' +
        '</div>' +
        fortuneSec("🌟", "性格", z.personality) +
      '</div>' +
      zodiacDailyHTML(ZODIAC.indexOf(z)) +
      '<div class="fortune-sections">' +
        fortuneSec("💗", "恋愛傾向", z.love) +
        fortuneSec("💼", "仕事傾向", z.work) +
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
    /* イラストだけでは何座か分からない人のために、星座名と誕生日の範囲を文字で添える */
    b.innerHTML = '<span class="zodiac-btn-symbol">' + zodiacIcon(z, "zodiac-btn-img") + '</span>' +
                  '<span class="zodiac-btn-name">' + z.name + '</span>' +
                  '<span class="zodiac-btn-range">' + z.range + '</span>';
    b.addEventListener("click", function () {
      var actives = grid.querySelectorAll(".month-btn");
      for (var i = 0; i < actives.length; i++) actives[i].classList.remove("on");
      b.classList.add("on");
      render(z);
    });
    grid.appendChild(b);
  });
});
