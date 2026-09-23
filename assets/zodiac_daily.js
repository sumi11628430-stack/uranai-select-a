/* =========================================================
   星座占い：今日の運勢（日替わり）
   ・日付（端末のローカル日付）と星座から決まる擬似乱数で生成
   ・同じ日・同じ星座なら誰が見ても同じ結果、日付が変わると入れ替わる
   ========================================================= */
var ZODIAC_DAILY_WORDS = [null,
  ["今日は充電の日。予定を詰め込まず、自分をいたわる時間を大切に。",
   "うまくいかない時は「そういう日」と割り切って。早寝がいちばんの開運法です。",
   "慎重さが身を守る日。大きな決断は後日に回すのが安心です。",
   "気持ちが沈んだら、好きな音楽や香りに頼って。心がふっと軽くなります。",
   "今日つまずいた分だけ、明日の伸びしろが大きくなります。前向きに。",
   "身の回りの小さな整理整頓が、運気の立て直しにつながります。"],
  ["少し空回りしやすい日。深呼吸して、優先順位を一つに絞って。",
   "言葉の行き違いに注意。大切なことはひと言多めに伝えて。",
   "予定が崩れても慌てないで。柔軟に切り替えるほど運は戻ります。",
   "疲れがたまりやすい日。温かい飲み物でひと息つく時間を。",
   "衝動買いには要注意。本当に必要か、一晩寝かせて考えて。",
   "無理に結果を求めず、守りに徹すると吉。明日は流れが変わります。"],
  ["可もなく不可もない安定の日。いつもどおりのペースがいちばん。",
   "焦らず丁寧に進めれば、夕方以降に流れが良くなりそう。",
   "無理をせず、できることを一つずつ。小さな達成感が運を育てます。",
   "人の話にじっくり耳を傾けると、思わぬヒントが見つかります。",
   "寄り道で良い発見がありそうな日。いつもと違う道を選んでみて。",
   "今日は準備の日。明日のために早めに休むのが開運のコツ。"],
  ["穏やかに運気が上向く日。小さな親切が大きな幸運になって返ってきます。",
   "人とのつながりに恵まれる日。気になる人に声をかけてみて。",
   "計画どおりに物事が進みやすい日。やることリストの消化がはかどります。",
   "ひらめきが冴える日。思いついたアイデアはすぐメモを。",
   "いつもより少し欲張ってOKな日。やりたいことを一つ増やして。",
   "身の回りを整えると運気がさらにアップ。机の上の片づけから。"],
  ["思い描いたことが形になりやすい絶好調の日。遠慮せず一歩前へ。",
   "チャンスの扉が開く日。直感で「これだ」と思ったものを選んで正解。",
   "周りからの追い風を感じられる日。大事な連絡や決断は今日のうちに。",
   "笑顔が幸運を呼び込む日。あなたの明るさが人とツキを集めます。",
   "何をしてもうまく回る日。新しい挑戦のスタートに最適です。",
   "努力が報われるうれしい知らせが届きそう。自分をほめてあげて。"]
];
var ZODIAC_DAILY_COLORS = ["ローズピンク", "ミントグリーン", "ラベンダー", "スカイブルー", "レモンイエロー",
  "コーラルオレンジ", "ネイビー", "ワインレッド", "パールホワイト", "ゴールド", "シルバー", "ターコイズ",
  "ベージュ", "チャコールグレー", "エメラルドグリーン", "サーモンピンク", "ロイヤルブルー", "ライラック",
  "オリーブ", "アイボリー"];
var ZODIAC_DAILY_ITEMS = ["ハンカチ", "手帳", "お気に入りのペン", "リップクリーム", "腕時計", "イヤホン",
  "マグカップ", "花柄の小物", "キーホルダー", "ハンドクリーム", "本", "アロマ・香水", "ヘアアクセサリー",
  "スニーカー", "折りたたみ傘", "チョコレート", "紅茶", "観葉植物", "キャンドル", "ポーチ", "サングラス",
  "ストール", "小銭入れ", "付箋", "天然石のアクセサリー", "お気に入りの写真", "トートバッグ",
  "ミネラルウォーター", "のど飴", "星モチーフの小物"];

function zodiacDailyRand(seed) {             // mulberry32
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function zodiacDailyStar(r) {                 // ★1:5% ★2:15% ★3:35% ★4:30% ★5:15%
  var x = r();
  return x < .05 ? 1 : x < .20 ? 2 : x < .55 ? 3 : x < .85 ? 4 : 5;
}

/* signIndex: ZODIAC配列の添字(0〜11), date: Date */
function zodiacDaily(signIndex, date) {
  var ymd = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  var r = zodiacDailyRand(ymd * 31 + (signIndex + 1) * 7919);
  r(); r();                                    // 初期値の偏りを捨てる
  var love = zodiacDailyStar(r), money = zodiacDailyStar(r), work = zodiacDailyStar(r);
  var total = Math.max(1, Math.min(5, Math.round((love + money + work) / 3 + (r() - .5))));
  var words = ZODIAC_DAILY_WORDS[total];
  return {
    month: date.getMonth() + 1, day: date.getDate(),
    total: total, love: love, money: money, work: work,
    word: words[Math.floor(r() * words.length)],
    color: ZODIAC_DAILY_COLORS[Math.floor(r() * ZODIAC_DAILY_COLORS.length)],
    item: ZODIAC_DAILY_ITEMS[Math.floor(r() * ZODIAC_DAILY_ITEMS.length)]
  };
}

function zodiacStars(n) {
  return '<span class="unsei-stars" aria-label="5段階中' + n + '">' +
           '★★★★★'.slice(0, n) + '<span class="off">' + '★★★★★'.slice(0, 5 - n) + '</span>' +
         '</span>';
}

function zodiacDailyHTML(signIndex) {
  var d = zodiacDaily(signIndex, new Date());
  var row = function (icon, label, n) {
    return '<div class="today-item"><span>' + icon + ' ' + label + '</span>' + zodiacStars(n) + '</div>';
  };
  return '<div class="f-sec zodiac-today">' +
           '<h3>📅 今日の運勢<span class="unsei-sub">' + d.month + '月' + d.day + '日</span></h3>' +
           '<div class="today-grid">' +
             row("🌟", "総合運", d.total) + row("💗", "恋愛運", d.love) +
             row("💰", "金運", d.money) + row("💼", "仕事運", d.work) +
           '</div>' +
           '<p class="today-word">' + d.word + '</p>' +
           '<div class="lucky-row" style="justify-content:flex-start;">' +
             '<span class="lucky-chip"><b>今日のラッキーカラー</b>' + d.color + '</span>' +
             '<span class="lucky-chip"><b>今日のラッキーアイテム</b>' + d.item + '</span>' +
           '</div>' +
         '</div>';
}
