/* =========================================================
   誕生花：月別の占いコンテンツ＋花のSVG描画＋日別表示ロジック
   日別データ（花名・花言葉）は birthflowers_daily.js の DAILY_FLOWERS を参照。
   ========================================================= */

/* ---- 花をSVGで描く（八重咲きのブルーム） -------------------------- */
var __flId = 0;
function flowerSVG(color) {
  var id = "flg" + (++__flId);
  var s = '<svg viewBox="0 0 100 100" class="flower-svg" aria-hidden="true">';
  s += '<defs><radialGradient id="' + id + '" cx="50%" cy="46%" r="58%">' +
       '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>' +
       '<stop offset="55%" stop-color="' + color + '"/>' +
       '<stop offset="100%" stop-color="' + color + '"/></radialGradient></defs>';
  // 外側の花びら（8枚）
  s += '<g fill="url(#' + id + ')" stroke="rgba(80,20,50,0.10)" stroke-width="0.5">';
  for (var i = 0; i < 8; i++) {
    s += '<ellipse cx="50" cy="26" rx="10.5" ry="23" transform="rotate(' + (i * 45) + ' 50 50)" opacity="0.9"/>';
  }
  s += '</g>';
  // 内側の花びら（6枚・少し立ち上がる）
  s += '<g fill="url(#' + id + ')">';
  for (var j = 0; j < 6; j++) {
    s += '<ellipse cx="50" cy="34" rx="7" ry="15" transform="rotate(' + (j * 60 + 30) + ' 50 50)" opacity="0.92"/>';
  }
  s += '</g>';
  // 中心
  s += '<circle cx="50" cy="50" r="9" fill="#f4d06a"/>';
  s += '<circle cx="50" cy="50" r="9" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>';
  s += '<circle cx="47" cy="47" r="3" fill="#fff7d4" opacity="0.85"/>';
  s += '</svg>';
  return s;
}

/* 花名から表示色を推定（見た目用。花名・花言葉は正確なデータ） */
function colorForFlower(n) {
  n = String(n);
  function has(a) { for (var i = 0; i < a.length; i++) if (n.indexOf(a[i]) >= 0) return true; return false; }
  if (has(["（赤）", "赤）", "ハイビスカス", "サルスベリ", "ザクロ", "ポインセチア", "彼岸", "紅花", "カーネーション", "ホウセンカ", "鳳仙花"])) return "#e0455f";
  if (has(["ピンク", "桜", "サクラ", "桃", "コスモス", "芍薬", "ナデシコ", "梅", "アザレア", "秋桜", "シクラメン", "ハナカイドウ", "サザンカ", "山茶花", "月下美人", "ネリネ"])) return "#f2799f";
  if (has(["黄", "ひまわり", "ヒマワリ", "向日葵", "タンポポ", "蒲公英", "菜の花", "ナノハナ", "フリージア", "金木犀", "マリーゴールド", "福寿草", "ミモザ", "水仙", "スイセン", "山吹", "ロウバイ", "サイネリア", "オンシジューム"])) return "#f2c53d";
  if (has(["紫", "ラベンダー", "アイリス", "菖蒲", "ヒヤシンス", "スミレ", "ビオラ", "パンジー", "桔梗", "リンドウ", "藤", "ライラック", "クロッカス", "ラークスパー", "紫式部", "カトレア", "シンビジウム"])) return "#9b6dd6";
  if (has(["青", "ブルー", "勿忘草", "忘れな草", "ワスレナグサ", "矢車", "ネモフィラ", "デルフィニウム", "アガパンサス", "ブルースター", "紫陽花", "アジサイ", "ルリ", "セージ"])) return "#5b8de0";
  if (has(["白", "スズラン", "鈴蘭", "カスミソウ", "マーガレット", "ユリ", "百合", "カサブランカ", "スノードロップ", "デージー", "デイジー", "ノースポール", "スイレン", "睡蓄", "ツバキ（白", "サギソウ", "鷺草"])) return "#f5e9f2";
  return "#ee87a8";
}

/* ---- 月別の占いプロフィール ------------------------------------- */
var MONTH_FLOWER = [
  { m: 1, title: "凛と咲く、冬の花の月", flower: "福寿草・水仙",
    catch: "寒さの中でまっすぐ咲く花のように、あなたは芯の強さと清らかさを併せ持つ人。",
    personality: "物静かに見えて、内側には揺るがない意志。控えめでも、いざという時に頼れる芯の強さがあります。誠実さで信頼を積み上げる人。",
    love: "一途で誠実。派手な駆け引きより、まっすぐな想いが実る恋です。今年は「素直な一言」が距離を縮めます。",
    talent: "地道な努力を継続できるのが才能。人が見ていない所での積み重ねが、確かな評価と実りに変わります。",
    advice: "凛と咲く冬の花のように、自分のペースを大切に。朝の白湯や深呼吸で心を整えると、一日の巡りが良くなります。",
    lucky: { color: "白・ゴールド", flower: "水仙", action: "朝、窓を開けて深呼吸", match: "5月・9月生まれ" } },

  { m: 2, title: "春を告げる、やさしさの月", flower: "マーガレット・ミモザ",
    catch: "まだ寒い季節にほころぶ花のように、あなたはそっと人の心を温める優しさの持ち主。",
    personality: "感受性が豊かで思いやり深く、場の空気をやわらげる人。奥ゆかしさの中に、秘めた情熱を持っています。",
    love: "秘めた恋を大切に育むタイプ。想いを言葉にする勇気が、幸せの扉を開きます。ミモザのように、あなたから微笑みかけて。",
    talent: "細やかな気配りと共感力が武器。人を支える役割で本領を発揮し、信頼を集めます。",
    advice: "自分を後回しにしがち。たまには自分のための花を一輪飾って、心を満たしてあげて。",
    lucky: { color: "イエロー・淡いピンク", flower: "ミモザ", action: "好きな花を一輪飾る", match: "6月・11月生まれ" } },

  { m: 3, title: "芽吹きの門出、桜の月", flower: "桜・チューリップ",
    catch: "春の芽吹きとともに歩むあなたは、新しい始まりを彩る華やかさの持ち主。",
    personality: "明るく柔軟で、変化を楽しめる人。人を惹きつける親しみやすさと、内に秘めた繊細さを併せ持ちます。",
    love: "新しい出会いに恵まれる季節生まれ。ときめきを素直に受け取ると、恋がふわりと動き出します。",
    talent: "場を明るくし、人と人をつなぐ力。新しい環境に飛び込むほど、あなたの魅力が花開きます。",
    advice: "桜のように「今」を惜しみなく咲かせて。迷ったら、わくわくする方を選ぶのが吉。",
    lucky: { color: "桜色・新緑グリーン", flower: "チューリップ", action: "新しいことを一つ始める", match: "7月・11月生まれ" } },

  { m: 4, title: "満開の春、華やぎの月", flower: "桜・藤",
    catch: "花々が咲き誇る季節に生まれたあなたは、周囲を明るく照らす華やかな存在。",
    personality: "おおらかで愛情深く、人望を集めるタイプ。マイペースに見えて、大切なものはしっかり守る強さがあります。",
    love: "包容力で愛される人。相手を安心させる温かさが魅力です。今年は自然体でいることが恋を育てます。",
    talent: "人を惹きつける魅力と美的センス。楽しみながら続けられることが、いつしか実になります。",
    advice: "咲き急がなくて大丈夫。あなたの季節は必ず来ます。心地よさを大切に過ごして。",
    lucky: { color: "藤色・ローズ", flower: "藤", action: "季節の花を眺めに出かける", match: "8月・12月生まれ" } },

  { m: 5, title: "初夏の香り、愛と感謝の月", flower: "鈴蘭・カーネーション",
    catch: "さわやかな初夏の花をまとうあなたは、愛情深く、周りに安らぎを与える人。",
    personality: "穏やかで誠実、身近な人を大切にする愛情家。美しいものや心地よさへの感度が高い人です。",
    love: "深く長く愛するタイプ。焦らずじっくり育てる恋が実ります。感謝を言葉にすると絆が深まります。",
    talent: "堅実さと思いやりで信頼を築く力。コツコツ続けたことが、豊かさとなって返ってきます。",
    advice: "「ありがとう」を惜しまないで。感謝を贈るほど、愛も幸運もあなたに巡ってきます。",
    lucky: { color: "白・グリーン", flower: "スズラン", action: "身近な人に感謝を伝える", match: "1月・9月生まれ" } },

  { m: 6, title: "雨に映える、移ろう美の月", flower: "バラ・紫陽花",
    catch: "雨の季節に色を深める花のように、あなたは静かな変化の中で美しさを増す人。",
    personality: "しなやかで感受性ゆたか。環境に合わせて自分を変えられる柔軟さと、内に秘めた情熱を持ちます。",
    love: "ロマンチストで愛の勘が鋭い季節生まれ。移ろう気持ちも魅力のうち。直感を信じて。",
    talent: "多面的な魅力と適応力。状況に応じて色を変えられる紫陽花のように、どんな場でも輝けます。",
    advice: "気分の波は責めないで。雨の日は雨の美しさを。心が潤うと、次の一歩が軽くなります。",
    lucky: { color: "青紫・ローズレッド", flower: "紫陽花", action: "雨音を静かに味わう", match: "2月・10月生まれ" } },

  { m: 7, title: "太陽を仰ぐ、情熱の月", flower: "ひまわり・ゆり",
    catch: "夏の陽を全身で浴びる花のように、あなたは明るく前向きなエネルギーの持ち主。",
    personality: "素直で情熱的、まっすぐに前を向く人。人を惹きつける明るさと、裏表のなさが魅力です。",
    love: "ストレートな愛情表現が武器。ひまわりのように、まっすぐ想いを向けるほど恋は実ります。",
    talent: "行動力と前向きさで道を切り開く力。太陽に向かう花のように、目標を掲げると力を発揮します。",
    advice: "迷ったら明るい方へ。やりたいことは今日始めて。あなたの笑顔が最大の開運アイテムです。",
    lucky: { color: "ひまわりイエロー", flower: "ひまわり", action: "朝日を浴びる", match: "3月・11月生まれ" } },

  { m: 8, title: "真夏に咲く、生命力の月", flower: "ひまわり・ハイビスカス",
    catch: "灼ける夏に鮮やかに咲く花のように、あなたは尽きない生命力と華やかさの人。",
    personality: "エネルギッシュで社交的、周囲を元気にするムードメーカー。困難にも折れないタフさがあります。",
    love: "情熱的で華やか。楽しい雰囲気づくりが恋を呼びます。素直な「好き」がいちばんの魅力。",
    talent: "行動力と人を巻き込む力。勢いに乗った時の推進力は抜群。挑戦するほどチャンスが広がります。",
    advice: "元気がない時こそ、日差しと色の力を借りて。鮮やかな花や色を身近に置くと活力が戻ります。",
    lucky: { color: "赤・トロピカルカラー", flower: "ハイビスカス", action: "鮮やかな色を身につける", match: "4月・12月生まれ" } },

  { m: 9, title: "実りの秋、調和の月", flower: "コスモス・ダリア",
    catch: "秋風に揺れるコスモスのように、あなたはしなやかで調和を大切にする人。",
    personality: "穏やかでバランス感覚に優れ、人の気持ちを汲む優しさがあります。控えめでも芯の通った美意識の持ち主。",
    love: "誠実で思いやり深い恋を育むタイプ。相手を尊重する姿勢が、深い信頼と愛を築きます。",
    talent: "調整力と美的センス。人と人の間をつなぎ、場を整える才能で頼られます。",
    advice: "頑張りすぎたら、秋の空をゆっくり見上げて。心にゆとりが戻ると、良い縁が巡ってきます。",
    lucky: { color: "コスモスピンク・秋色", flower: "コスモス", action: "夕暮れの空を眺める", match: "1月・5月生まれ" } },

  { m: 10, title: "深まる秋、気高さの月", flower: "金木犀・コスモス",
    catch: "どこからともなく香る金木犀のように、あなたはさりげなく人を惹きつける気品の持ち主。",
    personality: "上品で知的、自分の世界を持つ人。多才で美意識が高く、 さりげない魅力で人を惹きつけます。",
    love: "奥ゆかしくも情熱的。香りのようにそっと近づく恋が似合います。あなたらしさが最大の魅力。",
    talent: "感性と表現力が光る季節生まれ。創造的なことや、こだわりを活かす分野で花開きます。",
    advice: "香りや音楽など、五感を満たす時間を。心が豊かになると、あなたの魅力がいっそう香り立ちます。",
    lucky: { color: "オレンジ・金木犀色", flower: "金木犀", action: "好きな香りをまとう", match: "2月・6月生まれ" } },

  { m: 11, title: "晩秋に映える、静かな強さの月", flower: "椿・百合",
    catch: "冷たい空気の中で凛と咲く花のように、あなたは落ち着きと芯の強さを備えた人。",
    personality: "誠実で責任感が強く、物事を最後までやり遂げる人。派手さより、確かな信頼で愛されます。",
    love: "一途で献身的。時間をかけて築く深い絆を大切にします。誠実さがそのまま魅力になります。",
    talent: "粘り強さと集中力。じっくり取り組むほど成果が出るタイプ。専門性を磨くと強い武器に。",
    advice: "頑張り屋だからこそ、休むことも大切に。温かい飲み物とひと息が、次の力を育てます。",
    lucky: { color: "深紅・白", flower: "椿", action: "温かい飲み物でひと休み", match: "3月・7月生まれ" } },

  { m: 12, title: "冬を彩る、祝福の月", flower: "ポインセチア・椿",
    catch: "聖なる季節を彩る花をまとうあなたは、人に幸福を分け与える祝福の人。",
    personality: "明るく自由で、人を楽しませるのが得意。好奇心旺盛で、周囲に希望と華やぎを運びます。",
    love: "オープンで愛情表現が豊か。一緒にいて楽しい関係が長続きの秘訣。フットワークが恋を運びます。",
    talent: "発想力と行動力で新しい道を開く力。人を祝福し、盛り上げる才能で慕われます。",
    advice: "一年の締めくくりに、感謝と小さなご褒美を。周りを照らすあなた自身にも、光を分けてあげて。",
    lucky: { color: "赤・グリーン・ゴールド", flower: "ポインセチア", action: "身近な人を祝福する", match: "4月・8月生まれ" } }
];

/* ---- 表示ロジック ----------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  var selMonth = document.getElementById("selMonth");
  var selDay   = document.getElementById("selDay");
  var btn      = document.getElementById("btnDivine");
  var result   = document.getElementById("result");
  if (!selMonth || !selDay || !btn || !result) return;

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

  function fortuneSec(icon, label, text, extra) {
    return '<div class="f-sec' + (extra ? ' ' + extra : '') + '"><h3>' + icon + ' ' + label + '</h3><p>' + text + '</p></div>';
  }

  function render(mm, dd) {
    var entry = (DAILY_FLOWERS[mm] && DAILY_FLOWERS[mm][dd]) ? DAILY_FLOWERS[mm][dd] : "花|";
    var parts = entry.split("|");
    var name = parts[0];
    var words = (parts[1] || "").split("/");
    var wordsDisp = words.join("・");
    var firstWord = words[0] || "";
    var col = colorForFlower(name);
    var prof = MONTH_FLOWER[mm - 1];

    var msg = "この花が咲く季節の空気ごと、あなたはやわらかな強さと美しさをまとっています。" +
              "「" + firstWord + "」——それは、あなたが自然と人へ手渡している魅力そのもの。" +
              "今日という一日に、どうかあなたらしい花を、あなたのペースで咲かせてください。";

    var lucky =
      '<div class="lucky-row">' +
        '<span class="lucky-chip"><b>ラッキーカラー</b>' + prof.lucky.color + '</span>' +
        '<span class="lucky-chip"><b>ラッキーフラワー</b>' + prof.lucky.flower + '</span>' +
        '<span class="lucky-chip"><b>開運アクション</b>' + prof.lucky.action + '</span>' +
        '<span class="lucky-chip"><b>相性の良い月</b>' + prof.lucky.match + '</span>' +
      '</div>';

    result.hidden = false;
    result.innerHTML =
      '<h2 class="bs-rtitle">' + mm + '月' + dd + '日の誕生花</h2>' +
      '<div class="daily-hero">' +
        '<span class="flower-visual">' + flowerSVG(col) + '</span>' +
        '<div class="daily-name"><span class="daily-label">あなたの誕生花</span><b>' + name + '</b></div>' +
      '</div>' +
      '<div class="flower-words-wrap"><span class="stone-words">花言葉：' + wordsDisp + '</span></div>' +
      '<p class="bs-catch">' + msg + '</p>' +
      '<p class="bs-title">「' + prof.title + '」（' + prof.flower + '）</p>' +
      '<p class="bs-catch" style="margin-bottom:1.6rem;">' + prof.catch + '</p>' +
      '<div class="fortune-sections">' +
        fortuneSec("🌸", "あなたの気質", prof.personality) +
        fortuneSec("💗", "恋愛運", prof.love) +
        fortuneSec("🌟", "才能・仕事運", prof.talent) +
        fortuneSec("✨", "開運アドバイス", prof.advice, "advice") +
      '</div>' +
      lucky;
  }

  btn.addEventListener("click", function () {
    render(parseInt(selMonth.value, 10), parseInt(selDay.value, 10));
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // 初期表示（1月1日）
  render(1, 1);
});
