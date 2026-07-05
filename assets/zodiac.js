/* =========================================================
   星座占い：表示ロジック
   ・12星座ボタン、または生まれ月日から星座を判定して「結果」で詳細表示
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var grid   = document.getElementById("zodiacGrid");
  var selMonth = document.getElementById("selMonth");
  var selDay   = document.getElementById("selDay");
  var btn      = document.getElementById("btnDivine");
  var result   = document.getElementById("result");
  if (!result) return;

  var DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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

  if (grid) {
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
  }

  if (selMonth && selDay && btn) {
    function fillDays(m) {
      var max = DAYS[m - 1];
      var cur = parseInt(selDay.value, 10) || 1;
      selDay.innerHTML = "";
      for (var d = 1; d <= max; d++) {
        var o = document.createElement("option");
        o.value = d; o.textContent = d + "日";
        selDay.appendChild(o);
      }
      selDay.value = Math.min(cur, max);
    }
    for (var m = 1; m <= 12; m++) {
      var o = document.createElement("option");
      o.value = m; o.textContent = m + "月";
      selMonth.appendChild(o);
    }
    selMonth.addEventListener("change", function () { fillDays(parseInt(selMonth.value, 10)); });
    fillDays(1);

    btn.addEventListener("click", function () {
      var mm = parseInt(selMonth.value, 10), dd = parseInt(selDay.value, 10);
      var z = zodiacOf(mm, dd);
      if (grid) {
        var actives = grid.querySelectorAll(".month-btn");
        for (var i = 0; i < actives.length; i++) actives[i].classList.toggle("on", actives[i].textContent.indexOf(z.name) >= 0);
      }
      render(z);
    });
  }
});
