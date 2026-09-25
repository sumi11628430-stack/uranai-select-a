/* =========================================================
   「あなたは何の日？」表示ロジック
   ・月日ピッカー →「結果」でその日の記念日（代表＋由来）と、
     そのほかの記念日を大量に表示
   ・一覧は表示しない（1日ずつ調べる楽しみを残すため）
   ・月を変えると背景の季節も切り替わる（seasons.js 連動）
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var selMonth = document.getElementById("selMonth");
  var selDay   = document.getElementById("selDay");
  var btn      = document.getElementById("btnDivine");
  var result   = document.getElementById("result");
  if (!selMonth || !selDay || !btn || !result) return;

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
    var v = (typeof DAYS_OF !== "undefined" && DAYS_OF[mm] && DAYS_OF[mm][dd]) ? DAYS_OF[mm][dd] : "記念日|";
    var p = v.split("|");
    return { name: p[0], origin: p[1] || "" };
  }

  function moreOf(mm, dd, headline) {
    var s = (typeof DAYS_MORE !== "undefined" && DAYS_MORE[mm] && DAYS_MORE[mm][dd]) ? DAYS_MORE[mm][dd] : "";
    if (!s) return "";
    if (headline) {
      s = ("・" + s + "・").split("・" + headline + "・").join("・");
      s = s.replace(/^・+|・+$/g, "");
    }
    return s;
  }

  /* そのほかの記念日の由来（月ごとのJSONを必要な時だけ読み込む）
     assets/daysof_origin/MM.json = { "日": { "記念日名": "由来・意味" } } */
  var ORIGIN_CACHE = {};
  function loadOrigins(mm, cb) {
    if (ORIGIN_CACHE[mm]) { cb(ORIGIN_CACHE[mm]); return; }
    var done = function (j) { ORIGIN_CACHE[mm] = j || {}; cb(ORIGIN_CACHE[mm]); };
    if (typeof fetch !== "function") { done({}); return; }
    fetch("assets/daysof_origin/" + (mm < 10 ? "0" : "") + mm + ".json?v=1")
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(done)
      .catch(function () { done({}); });
  }

  var state = null;   // { mm, dd, names:[代表, そのほか…], origin:function(name) }

  function render(mm, dd, selected) {
    var e = entry(mm, dd);
    var more = moreOf(mm, dd, e.name);
    var parts = more ? more.split("・").filter(function (n) { return n; }) : [];
    result.hidden = false;
    loadOrigins(mm, function (O) {
      var od = O[dd] || {};
      // 名前自体に「・」を含む記念日（例：ホーリー・スリー・キングス・デー）は由来データの名前に合わせて結合
      var names = [e.name];
      for (var i = 0; i < parts.length; ) {
        var hit = 1;
        for (var k = parts.length - i; k > 1; k--) {
          if (od[parts.slice(i, i + k).join("・")]) { hit = k; break; }
        }
        names.push(parts.slice(i, i + hit).join("・"));
        i += hit;
      }
      var originOf = function (n) { return n === e.name ? e.origin : (od[n] || ""); };
      var cur = (selected && names.indexOf(selected) >= 0) ? selected : e.name;
      state = { mm: mm, dd: dd, names: names };
      var others = [];
      names.forEach(function (n, i) {
        if (n === cur) return;
        others.push(originOf(n)
          ? '<button type="button" class="dayof-more-btn" data-i="' + i + '">' + n + '</button>'
          : '<span class="dayof-more-plain">' + n + '</span>');
      });
      var moreHtml = others.length
        ? '<div class="f-sec" style="margin-top:1.1rem;"><h3>🎌 この日のほかの記念日（' + others.length + '件）</h3>' +
          '<p class="dayof-more">' + others.join('<span class="dayof-sep">・</span>') + '</p>' +
          '<p class="dayof-more-note">名前をタップすると、その記念日の由来・意味に切り替わります。</p></div>'
        : '';
      result.innerHTML =
        '<h2 class="bs-rtitle">' + mm + '月' + dd + '日は…</h2>' +
        '<p class="dayof-name">「' + cur + '」</p>' +
        '<div class="f-sec advice"><h3>📖 由来・意味</h3><p>' + originOf(cur) + '</p></div>' +
        moreHtml +
        '<p class="bs-catch" style="margin:1.2rem 0 0;">' + mm + '月は ' + SEASON_NOTE[mm] +
        '。記念日は語呂合わせ・歴史の出来事・祭事など由来はさまざまで、諸説あります。</p>';
    });
    if (typeof setSeasonMonth === "function") setSeasonMonth(mm);
  }

  // ほかの記念日をタップ → その記念日を主表示に切り替え
  result.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest(".dayof-more-btn") : null;
    if (!b || !state) return;
    render(state.mm, state.dd, state.names[parseInt(b.getAttribute("data-i"), 10)]);
    var t = result.querySelector(".bs-rtitle");
    (t || result).scrollIntoView({ behavior: "smooth", block: "start" });
  });

  selMonth.addEventListener("change", function () {
    var mm = parseInt(selMonth.value, 10);
    fillDays(mm);
    if (typeof setSeasonMonth === "function") setSeasonMonth(mm);
  });

  btn.addEventListener("click", function () {
    render(parseInt(selMonth.value, 10), parseInt(selDay.value, 10));
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // 初期表示：今日の日付（結果のみ。一覧は出さない）
  var now = new Date();
  var im = now.getMonth() + 1;
  selMonth.value = im;
  fillDays(im);
  selDay.value = Math.min(now.getDate(), DAYS[im - 1]);
  render(im, parseInt(selDay.value, 10));
});
