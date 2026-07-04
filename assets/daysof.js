/* =========================================================
   「あなたは何の日？」表示ロジック
   ・月日ピッカー →「結果」でその日の記念日と由来を表示
   ・下部に選択中の月の記念日一覧（クリックでその日を表示）
   ・月を変えると背景の季節も切り替わる（seasons.js 連動）
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var selMonth = document.getElementById("selMonth");
  var selDay   = document.getElementById("selDay");
  var btn      = document.getElementById("btnDivine");
  var result   = document.getElementById("result");
  var list     = document.getElementById("dayList");
  var listTitle= document.getElementById("listTitle");
  if (!selMonth || !selDay || !btn || !result || !list) return;

  var DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var SEASON_NOTE = {
    1: "お正月・冬の祭事の季節", 2: "節分・立春の季節", 3: "ひな祭り・春の訪れの季節",
    4: "お花見・入学の季節", 5: "端午の節句・新緑の季節", 6: "衣替え・梅雨の季節",
    7: "七夕・夏祭りの季節", 8: "花火・お盆の季節", 9: "お月見・実りの季節",
    10: "収穫祭・紅葉の季節", 11: "七五三・晩秋の季節", 12: "冬至・年の瀬の季節"
  };

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

  function entry(mm, dd) {
    var v = (DAYS_OF[mm] && DAYS_OF[mm][dd]) ? DAYS_OF[mm][dd] : "記念日|";
    var p = v.split("|");
    return { name: p[0], origin: p[1] || "" };
  }

  function render(mm, dd) {
    var e = entry(mm, dd);
    result.hidden = false;
    result.innerHTML =
      '<h2 class="bs-rtitle">' + mm + '月' + dd + '日は…</h2>' +
      '<p class="dayof-name">「' + e.name + '」</p>' +
      '<div class="f-sec advice" style="margin-bottom:1.2rem;"><h3>📖 由来・意味</h3><p>' + e.origin + '</p></div>' +
      '<p class="bs-catch" style="margin-bottom:.6rem;">' + mm + '月は ' + SEASON_NOTE[mm] + '。' +
      '記念日は一日にいくつもあり、語呂合わせや歴史の出来事、祭事など由来はさまざま（諸説あります）。</p>';
    if (typeof setSeasonMonth === "function") setSeasonMonth(mm);
  }

  function renderList(mm) {
    if (listTitle) listTitle.textContent = mm + "月の「何の日」一覧";
    var rows = [];
    for (var d = 1; d <= DAYS[mm - 1]; d++) {
      var e = entry(mm, d);
      rows.push('<button type="button" class="list-row day-row" data-d="' + d + '">' +
        '<span class="list-month">' + d + '日</span>' +
        '<span class="day-row-name">' + e.name + '</span></button>');
    }
    list.innerHTML = rows.join("");
    var btns = list.querySelectorAll(".day-row");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        var d = parseInt(this.getAttribute("data-d"), 10);
        selDay.value = d;
        render(parseInt(selMonth.value, 10), d);
        result.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  selMonth.addEventListener("change", function () {
    var mm = parseInt(selMonth.value, 10);
    fillDays(mm);
    renderList(mm);
    if (typeof setSeasonMonth === "function") setSeasonMonth(mm);
  });

  btn.addEventListener("click", function () {
    render(parseInt(selMonth.value, 10), parseInt(selDay.value, 10));
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // 初期表示：今日の日付
  var now = new Date();
  selMonth.value = now.getMonth() + 1;
  fillDays(now.getMonth() + 1);
  selDay.value = Math.min(now.getDate(), DAYS[now.getMonth()]);
  renderList(now.getMonth() + 1);
  render(now.getMonth() + 1, parseInt(selDay.value, 10));
});
