/* =========================================================
   誕生石データ（誕生月ごと）と表示ロジック
   ・月ごとの誕生石（複数石は網羅）＋ 日別の誕生日石（DAILY_BIRTHSTONES）
   c = 表示用の宝石カラー, w = 石言葉
   ========================================================= */
const BIRTHSTONES = [
  { m: 1,  msg: "新しい一年の扉を開くあなたへ。ガーネットの深紅が、努力の実りと変わらぬ情熱をもたらします。",
    stones: [ { jp: "ガーネット", en: "Garnet", c: "#a02128", w: "実り・情熱・真実の愛" } ] },

  { m: 2,  msg: "静かな強さを秘めたあなたへ。アメジストが心を鎮め、澄んだ直感で迷いを晴らします。",
    stones: [ { jp: "アメジスト", en: "Amethyst", c: "#8e44ad", w: "誠実・心の平和・高貴" } ] },

  { m: 3,  msg: "春の芽吹きとともに歩むあなたへ。海と大地の石が、癒しと勇気を運びます。",
    stones: [ { jp: "アクアマリン", en: "Aquamarine", c: "#4fc3d9", w: "沈着・聡明・幸福な結婚" },
              { jp: "コーラル（珊瑚）", en: "Coral", c: "#ff6f61", w: "長寿・幸福・魔除け" },
              { jp: "ブラッドストーン", en: "Bloodstone", c: "#2e6b4f", w: "勇気・献身・生命力" } ] },

  { m: 4,  msg: "曇りなき輝きを持つあなたへ。最も硬い光が、揺るがぬ絆と純真な心を照らします。",
    stones: [ { jp: "ダイヤモンド", en: "Diamond", c: "#d8e6ff", w: "永遠の絆・純潔・不屈" },
              { jp: "水晶（クォーツ）", en: "Rock Crystal", c: "#e8e8f2", w: "浄化・万能・調和" } ] },

  { m: 5,  msg: "緑の生命力にあふれるあなたへ。深い翠の石が、愛と安らぎ、豊かな実りを約束します。",
    stones: [ { jp: "エメラルド", en: "Emerald", c: "#1f9e6a", w: "幸運・愛・安定" },
              { jp: "翡翠（ジェイド）", en: "Jade", c: "#4faf7f", w: "徳・繁栄・調和" } ] },

  { m: 6,  msg: "やさしい光をまとうあなたへ。月と海が育てた石が、愛の予感と健やかさを届けます。",
    stones: [ { jp: "真珠（パール）", en: "Pearl", c: "#f3e9e0", w: "健康・富・純潔" },
              { jp: "ムーンストーン", en: "Moonstone", c: "#cfd6ee", w: "愛の予感・健康・幸運" },
              { jp: "アレキサンドライト", en: "Alexandrite", c: "#6a5acd", w: "秘めた思い・高貴・変化" } ] },

  { m: 7,  msg: "燃える情熱を宿すあなたへ。ルビーの深紅が、勝利と尽きせぬ生命力をもたらします。",
    stones: [ { jp: "ルビー", en: "Ruby", c: "#c0392b", w: "情熱・勝利・生命力" } ] },

  { m: 8,  msg: "太陽のような明るさのあなたへ。輝く石々が、平和と向上心、幸福な絆を育てます。",
    stones: [ { jp: "ペリドット", en: "Peridot", c: "#9acd32", w: "夫婦の幸福・平和・希望" },
              { jp: "サードオニキス", en: "Sardonyx", c: "#a0522d", w: "夫婦の幸福・友愛" },
              { jp: "スピネル", en: "Spinel", c: "#d6336c", w: "向上心・情熱・成功" } ] },

  { m: 9,  msg: "深く澄んだ心のあなたへ。青と薄紅の石が、誠実な愛と無償のやさしさを守ります。",
    stones: [ { jp: "サファイア", en: "Sapphire", c: "#2a6fd6", w: "誠実・慈愛・貞操" },
              { jp: "クンツァイト", en: "Kunzite", c: "#f19cc0", w: "無償の愛・純愛・癒し" } ] },

  { m: 10, msg: "七色の魅力を放つあなたへ。移ろう光の石が、希望と忍耐、心身の浄化を導きます。",
    stones: [ { jp: "オパール", en: "Opal", c: "#8fd6d0", w: "希望・幸福・忍耐" },
              { jp: "トルマリン", en: "Tourmaline", c: "#e0457b", w: "心身の浄化・希望" } ] },

  { m: 11, msg: "実りの季節に育つあなたへ。金と黄の石が、友情と希望、豊かな繁栄をもたらします。",
    stones: [ { jp: "トパーズ", en: "Topaz", c: "#f2b705", w: "友情・希望・潔白" },
              { jp: "シトリン", en: "Citrine", c: "#e6a817", w: "繁栄・富・友愛" } ] },

  { m: 12, msg: "冬の澄んだ空を映すあなたへ。青の石々が、成功と真実、旅の安全と安らぎを守ります。",
    stones: [ { jp: "ターコイズ（トルコ石）", en: "Turquoise", c: "#17a2b8", w: "成功・繁栄・旅の安全" },
              { jp: "ラピスラズリ", en: "Lapis Lazuli", c: "#1e3a8a", w: "幸運・成功・真実" },
              { jp: "タンザナイト", en: "Tanzanite", c: "#5b3fbf", w: "冷静・誇り高き人生" },
              { jp: "ジルコン", en: "Zircon", c: "#7fbfe0", w: "安らかな眠り・平和" } ] }
];

/* 石名から表示アイコンの色を推定（見た目用。石名そのものは正確なデータ） */
function colorForStone(name) {
  var n = String(name);
  function has(keys) { for (var i = 0; i < keys.length; i++) if (n.indexOf(keys[i]) >= 0) return true; return false; }
  if (has(["ルビー","ガーネット","レッド","赤","コーラル","珊瑚","カーネリアン","インカローズ","ロードクロサイト","ジャスパー"])) return "#c0392b";
  if (has(["ピンク","ローズ","モルガナイト","クンツァイト","桜","ロードナイト","インカ"])) return "#e0457b";
  if (has(["サファイア","ブルー","ラピス","アズ","青","ソーダライト","インディゴ","アイオライト"])) return "#2a6fd6";
  if (has(["アクア","ターコイズ","トルコ","カルセドニー","アマゾナイト","クリソコラ","アパタイト"])) return "#20b6c9";
  if (has(["エメラルド","グリーン","翡翠","ジェイド","ペリドット","マラカイト","ネフライト","ツァボ","緑","プレナイト","クリソプレーズ","アベンチュリン"])) return "#1f9e6a";
  if (has(["アメジスト","アメトリン","パープル","バイオレット","タンザナイト","スギライト","紫","チャロアイト","スペクトロライト","ラベンダー"])) return "#8e44ad";
  if (has(["シトリン","イエロー","ゴールド","金","トパゾ","ヘリオドール","黄","アンバー","琥珀","オレンジ","タイガー","シトリ","ヘソナイト","ブラウン"])) return "#e0b100";
  if (has(["パール","ムーンストーン","オパール","水晶","クォーツ","クリスタル","ダイヤ","ホワイト","白","銀","プラチナ","カルサイト","シェル","琅玕"])) return "#dbe6ff";
  if (has(["オニキス","オブシディアン","ブラック","黒","ジェット","ヘマタイト","スモーキー","隕石"])) return "#6a6482";
  return "#b183e0";
}

document.addEventListener("DOMContentLoaded", function () {
  var selMonth = document.getElementById("selMonth");
  var selDay   = document.getElementById("selDay");
  var btn      = document.getElementById("btnDivine");
  var result   = document.getElementById("result");
  var list     = document.getElementById("stoneList");
  if (!selMonth || !selDay || !btn || !result || !list) return;

  var DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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
  selMonth.value = 1;
  fillDays(1);
  selMonth.addEventListener("change", function () { fillDays(parseInt(selMonth.value, 10)); });

  function gemCard(s) {
    return '<div class="gem-card">' +
             '<span class="gem-ico" style="--gem:' + s.c + '"></span>' +
             '<span class="gem-name">' + s.jp + '<small>' + s.en + '</small></span>' +
             '<span class="gem-words">' + s.w + '</span>' +
           '</div>';
  }

  btn.addEventListener("click", function () {
    var m = parseInt(selMonth.value, 10);
    var d = parseInt(selDay.value, 10);
    var daily = (typeof DAILY_BIRTHSTONES !== "undefined" && DAILY_BIRTHSTONES[m] && DAILY_BIRTHSTONES[m][d]) ? DAILY_BIRTHSTONES[m][d] : "―";
    var month = BIRTHSTONES[m - 1];
    var dcol = colorForStone(daily);
    result.hidden = false;
    result.innerHTML =
      '<h2 class="bs-rtitle">' + m + '月' + d + '日生まれのあなたの誕生石</h2>' +
      '<div class="daily-hero">' +
        '<span class="gem-ico big" style="--gem:' + dcol + '"></span>' +
        '<div class="daily-name"><span class="daily-label">あなたの誕生日石</span><b>' + daily + '</b></div>' +
      '</div>' +
      '<p class="bs-msg">' + month.msg + '</p>' +
      '<div class="gem-sub">' + m + '月の誕生月石</div>' +
      '<div class="gem-cards">' + month.stones.map(gemCard).join("") + '</div>';
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // 全月の誕生月石 一覧（網羅）
  list.innerHTML = BIRTHSTONES.map(function (b) {
    var gems = b.stones.map(function (s) {
      return '<span class="list-gem"><span class="gem-ico sm" style="--gem:' + s.c + '"></span>' + s.jp + '</span>';
    }).join("");
    return '<div class="list-row"><span class="list-month">' + b.m + '月</span>' +
           '<div class="list-gems">' + gems + '</div></div>';
  }).join("");
});
