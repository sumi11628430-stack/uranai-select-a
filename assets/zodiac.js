/* =========================================================
   星座占い：表示ロジック
   ・12星座ボタンから選んで詳細表示
   ========================================================= */

/* ---- 星座のお守り（部品は assets/charm.js） ---------------------- */
// [ボタンの表示名, 楽天で検索する言葉, アイコン, ひらがな表記で検索するか]
// 楽天の調査（2026-09）で、ストラップ・ブレスレット・イヤリングはひらがな表記の方が商品が多かった
var ZODIAC_CHARM_TYPES = [
  ["ストラップ", "ストラップ", "strap", true], ["キーホルダー", "キーホルダー", "key", false],
  ["ブローチ", "ブローチ", "brooch", false], ["ブレスレット", "ブレスレット", "bracelet", true],
  ["ネックレス", "ネックレス", "necklace", false]
];
var ZODIAC_CHARM_EAR_TYPES = [["イヤリング", "イヤリング", "earring", true], ["ピアス", "ピアス", "pierce", false], ["イヤーカフ", "イヤーカフ", "cuff", false]];
var ZODIAC_KANA = {
  aries: "おひつじ座", taurus: "おうし座", gemini: "ふたご座", cancer: "かに座", leo: "しし座", virgo: "おとめ座",
  libra: "てんびん座", scorpio: "さそり座", sagittarius: "いて座", capricorn: "やぎ座", aquarius: "みずがめ座", pisces: "うお座"
};
// 宝石・光の色（星座のラッキーカラーに合わせる）
var ZODIAC_GEM = {
  aries: "#d64541", taurus: "#3f9a5a", gemini: "#7cc8e8", cancer: "#f1efe6", leo: "#e8b83a", virgo: "#34569c",
  libra: "#e89ab8", scorpio: "#8f1f3a", sagittarius: "#e8873a", capricorn: "#9a6a44", aquarius: "#3a7ad6", pisces: "#b49ae0"
};
function zodiacCharmWord(z, t) { return t[3] ? ZODIAC_KANA[z.key] : z.name; }

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
      '<div class="lucky-row"><span class="lucky-chip"><b>好相性</b>' + z.compatible.join("・") + '</span></div>' +
      charmSectionHTML({
        gem: ZODIAC_GEM[z.key],
        title: z.symbol + " " + z.name + "のお守り",
        text: "支配星は" + z.planet + "、守護石は" + z.stone + "。" + z.name + "のモチーフをお守りとして身につけると、あなたらしい輝きがそっと引き出されるといわれます。",
        name: z.name,
        types: ZODIAC_CHARM_TYPES, earTypes: ZODIAC_CHARM_EAR_TYPES,
        photos: window.ZODIAC_CHARM_PHOTOS && ZODIAC_CHARM_PHOTOS[z.key],
        words: function (t) { return [zodiacCharmWord(z, t), t[1]]; }
      });

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
