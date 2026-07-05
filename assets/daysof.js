/* =========================================================
   「あなたは何の日？」表示ロジック
   ・月日ピッカー →「結果」でその日の記念日（代表＋由来）と、
     そのほかの記念日を大量に表示
   ・下部の月別一覧は「結果」を押すまで隠す（結果を見る前のネタバレ防止）
   ・月を変えると背景の季節も切り替わる（seasons.js 連動）
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var selMonth = document.getElementById("selMonth");
  var selDay   = document.getElementById("selDay");
  var btn      = document.getElementById("btnDivine");
  var result   = document.getElementById("result");
  var list     = document.getElementById("dayList");
  var listWrap = document.getElementById("listWrap");
  var listTitle= document.getElementById("listTitle");
  if (!selMonth || !selDay || !btn || !result) return;

  var DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var SEASON_NOTE = {
    1: "お正月・冬の祭事の季節", 2: "節分・立春の季節", 3: "ひな祭り・春の訪れの季節",
    4: "お花見・入学の季節", 5: "端午の節句・新緑の季節", 6: "衣替え・梅雨の季節",
    7: "七夕・夏祭りの季節", 8: "花火・お盆の季節", 9: "お月見・実りの季節",
    10: "収穫祭・紅葉の季節", 11: "七五三・晩秋の季節", 12: "冬至・年の瀬の季節"
  };
  var listShown = false;

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
    var v = (typeof DAYS_OF !== "undefined" && DAYS_OF[mm] && DAYS_OF[mm][dd]) ? DAYS_OF[mm][dd] : "記念日|";
    var p = v.split("|");
    return { name: p[0], origin: p[1] || "" };
  }

  function moreOf(mm, dd, headline) {
    var s = (typeof DAYS_MORE !== "undefined" && DAYS_MORE[mm] && DAYS_MORE[mm][dd]) ? DAYS_MORE[mm][dd] : "";
    if (!s) return "";
    // 見出しの記念日名を（区切りの単位で）取り除く
    if (headline) {
      s = ("・" + s + "・").split("・" + headline + "・").join("・");
      s = s.replace(/^・+|・+$/g, "");
    }
    return s;
  }

  function render(mm, dd) {
    var e = entry(mm, dd);
    var more = moreOf(mm, dd, e.name);
    var moreCount = more ? more.split("・").length : 0;
    var moreHtml = more
      ? '<div class="f-sec" style="margin-top:1.1rem;"><h3>🎌 この日のそのほかの記念日（約' + moreCount + '件）</h3>' +
        '<p class="dayof-more">' + more.split("・").join("　・　") + '</p></div>'
      : '';
    result.hidden = false;
    result.innerHTML =
      '<h2 class="bs-rtitle">' + mm + '月' + dd + '日は…</h2>' +
      '<p class="dayof-name">「' + e.name + '」</p>' +
      '<div class="f-sec advice"><h3>📖 由来・意味</h3><p>' + e.origin + '</p></div>' +
      moreHtml +
      '<p class="bs-catch" style="margin:1.2rem 0 0;">' + mm + '月は ' + SEASON_NOTE[mm] +
      '。記念日は語呂合わせ・歴史の出来事・祭事など由来はさまざまで、諸説あります。</p>';
    if (typeof setSeasonMonth === "function") setSeasonMonth(mm);
  }

  function renderList(mm) {
    if (!list) return;
    if (listTitle) listTitle.textContent = mm + "月の「何の日」一覧（代表）";
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
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function revealList(mm) {
    renderList(mm);
    if (listWrap) listWrap.hidden = false;
    listShown = true;
  }

  selMonth.addEventListener("change", function () {
    var mm = parseInt(selMonth.value, 10);
    fillDays(mm);
    if (listShown) renderList(mm);
    if (typeof setSeasonMonth === "function") setSeasonMonth(mm);
  });

  btn.addEventListener("click", function () {
    var mm = parseInt(selMonth.value, 10);
    render(mm, parseInt(selDay.value, 10));
    revealList(mm);
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // 初期表示：今日の日付（結果は表示、一覧は隠したまま）
  var now = new Date();
  var im = now.getMonth() + 1;
  selMonth.value = im;
  fillDays(im);
  selDay.value = Math.min(now.getDate(), DAYS[im - 1]);
  render(im, parseInt(selDay.value, 10));
  if (listWrap) listWrap.hidden = true;
});
