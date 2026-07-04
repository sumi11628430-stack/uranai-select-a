/* =========================================================
   誕生石データ（誕生月ごと）と表示ロジック
   ・国際的／日本の宝石業界で一般的に用いられる誕生石一覧に基づく
   ・月によって複数の石があるものは、すべて掲載
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
              { jp: "サードオニキス", en: "Sardonyx", c: "#a0522d", w: "夫婦の幸福・friendship" },
              { jp: "スピネル", en: "Spinel", c: "#d6336c", w: "向上心・情熱・成功" } ] },

  { m: 9,  msg: "深く澄んだ心のあなたへ。青と薄紅の石が、誠実な愛と無償のやさしさを守ります。",
    stones: [ { jp: "サファイア", en: "Sapphire", c: "#2a6fd6", w: "誠実・慈愛・貞操" },
              { jp: "クンツァイト", en: "Kunzite", c: "#f19cc0", w: "無償の愛・純愛・癒し" } ] },

  { m: 10, msg: "七色の魅力を放つあなたへ。移ろう光の石が、希望と忍耐、心身の浄化を導きます。",
    stones: [ { jp: "オパール", en: "Opal", c: "#8fd6d0", w: "希望・幸福・忍耐" },
              { jp: "トルマリン", en: "Tourmaline", c: "#e0457b", w: "心身の浄化・希望・電気の石" } ] },

  { m: 11, msg: "実りの季節に育つあなたへ。金と黄の石が、友情と希望、豊かな繁栄をもたらします。",
    stones: [ { jp: "トパーズ", en: "Topaz", c: "#f2b705", w: "友情・希望・潔白" },
              { jp: "シトリン", en: "Citrine", c: "#e6a817", w: "繁栄・富・friendship" } ] },

  { m: 12, msg: "冬の澄んだ空を映すあなたへ。青の石々が、成功と真実、旅の安全と安らぎを守ります。",
    stones: [ { jp: "ターコイズ（トルコ石）", en: "Turquoise", c: "#17a2b8", w: "成功・繁栄・旅の安全" },
              { jp: "ラピスラズリ", en: "Lapis Lazuli", c: "#1e3a8a", w: "幸運・成功・真実" },
              { jp: "タンザナイト", en: "Tanzanite", c: "#5b3fbf", w: "冷静・誇り高き人生" },
              { jp: "ジルコン", en: "Zircon", c: "#7fbfe0", w: "安らかな眠り・平和" } ] }
];

document.addEventListener("DOMContentLoaded", function () {
  const grid   = document.getElementById("monthGrid");
  const result = document.getElementById("result");
  const list   = document.getElementById("stoneList");
  if (!grid || !result || !list) return;

  function gemCard(s) {
    return '<div class="gem-card">' +
             '<span class="gem-ico" style="--gem:' + s.c + '"></span>' +
             '<span class="gem-name">' + s.jp + '<small>' + s.en + '</small></span>' +
             '<span class="gem-words">' + s.w + '</span>' +
           '</div>';
  }

  // 月ボタンを生成
  BIRTHSTONES.forEach(function (b) {
    const btn = document.createElement("button");
    btn.className = "month-btn";
    btn.type = "button";
    btn.textContent = b.m + "月";
    btn.addEventListener("click", function () {
      document.querySelectorAll(".month-btn").forEach(function (x) { x.classList.remove("on"); });
      btn.classList.add("on");
      result.hidden = false;
      result.innerHTML =
        '<h2 class="bs-rtitle">' + b.m + '月生まれのあなたの誕生石</h2>' +
        '<p class="bs-msg">' + b.msg + '</p>' +
        '<div class="gem-cards">' + b.stones.map(gemCard).join("") + '</div>';
      result.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    grid.appendChild(btn);
  });

  // 全月の一覧（網羅）を生成
  list.innerHTML = BIRTHSTONES.map(function (b) {
    const gems = b.stones.map(function (s) {
      return '<span class="list-gem"><span class="gem-ico sm" style="--gem:' + s.c + '"></span>' + s.jp + '</span>';
    }).join("");
    return '<div class="list-row"><span class="list-month">' + b.m + '月</span>' +
           '<div class="list-gems">' + gems + '</div></div>';
  }).join("");
});
