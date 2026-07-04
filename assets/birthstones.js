/* =========================================================
   誕生石（月別）データ＋占いコンテンツ＋宝石SVG描画＋表示ロジック
   月を選ぶと、その月の誕生石を魅力的に解説する。
   ========================================================= */

/* ---- 宝石をリアルに描くSVG ------------------------------------- */
var __gemId = 0;

function __oct(cx, cy, r, rot) {
  var a = [];
  for (var i = 0; i < 8; i++) { var ang = rot + i * Math.PI / 4; a.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]); }
  return a;
}
function __pts(arr) { return arr.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }

/* ファセット（多面カット）の透明宝石 */
function facetedGem(base) {
  var id = "fg" + (++__gemId);
  var rot = Math.PI / 8;
  var outer = __oct(50, 50, 46, rot);
  var inner = __oct(50, 50, 19, rot);
  var s = '<svg viewBox="0 0 100 100" class="gem-svg" aria-hidden="true">';
  s += '<defs><radialGradient id="' + id + '" cx="40%" cy="32%" r="80%">' +
       '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>' +
       '<stop offset="42%" stop-color="' + base + '" stop-opacity="0.10"/>' +
       '<stop offset="100%" stop-color="' + base + '" stop-opacity="0"/></radialGradient></defs>';
  s += '<polygon points="' + __pts(outer) + '" fill="' + base + '"/>';
  for (var i = 0; i < 8; i++) {
    var tri = [outer[i], outer[(i + 1) % 8], inner[(i + 1) % 8]];
    var shade = (i % 2 === 0) ? "rgba(255,255,255,0.17)" : "rgba(0,0,0,0.20)";
    s += '<polygon points="' + __pts(tri) + '" fill="' + shade + '"/>';
  }
  s += '<polygon points="' + __pts(inner) + '" fill="rgba(255,255,255,0.20)"/>';
  s += '<polygon points="' + __pts(outer) + '" fill="url(#' + id + ')"/>';
  s += '<polygon points="' + __pts(outer) + '" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>';
  s += '<path d="M38 26 L41 37 L52 40 L41 43 L38 54 L35 43 L24 40 L35 37 Z" fill="#ffffff" opacity="0.9"/>';
  s += '</svg>';
  return s;
}

/* カボション（不透明・つやのあるドーム型）：真珠・翡翠・ターコイズ等 */
function cabochonGem(base) {
  var id = "cg" + (++__gemId), id2 = "cs" + (++__gemId);
  var s = '<svg viewBox="0 0 100 100" class="gem-svg" aria-hidden="true">';
  s += '<defs><radialGradient id="' + id + '" cx="38%" cy="33%" r="75%">' +
       '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>' +
       '<stop offset="32%" stop-color="' + base + '"/>' +
       '<stop offset="100%" stop-color="' + base + '"/></radialGradient>' +
       '<radialGradient id="' + id2 + '" cx="58%" cy="82%" r="62%">' +
       '<stop offset="0%" stop-color="#000000" stop-opacity="0.35"/>' +
       '<stop offset="70%" stop-color="#000000" stop-opacity="0"/></radialGradient></defs>';
  s += '<ellipse cx="50" cy="50" rx="45" ry="41" fill="' + base + '"/>';
  s += '<ellipse cx="50" cy="50" rx="45" ry="41" fill="url(#' + id + ')"/>';
  s += '<ellipse cx="50" cy="50" rx="45" ry="41" fill="url(#' + id2 + ')"/>';
  s += '<ellipse cx="37" cy="33" rx="13" ry="8" fill="#ffffff" opacity="0.6"/>';
  s += '</svg>';
  return s;
}

function gemSVG(stone) {
  return stone.t === "cab" ? cabochonGem(stone.c) : facetedGem(stone.c);
}

/* ---- 月別データ ------------------------------------------------- */
var MONTHS = [
  {
    m: 1, title: "情熱を実らせる、ガーネットの月",
    catch: "深紅の炎を宿すあなたは、一度決めたら折れない芯の強さの持ち主。新年の門出を、ガーネットが力強く後押しします。",
    stones: [
      { jp: "ガーネット", en: "Garnet", c: "#8f1622", t: "f",
        appear: "ワインのように濃い赤の奥で、内側から燃える炎がゆらめく——見つめるほど吸い込まれる、生命力そのものの輝き。",
        words: "実り・情熱・真実の愛",
        meaning: "努力を確かな成果へと結晶させる「勝利の石」。ぶれない情熱を保ち、真実の愛と揺るがぬ絆を引き寄せます。" }
    ],
    personality: "外は穏やか、内は情熱家。目標を定めるとコツコツ積み上げ、最後までやり抜く粘り強さがあります。信頼した相手にはとことん誠実。",
    love: "一途で深い愛情の持ち主。押しすぎず、誠実さで魅せるのがあなたの勝ち筋です。今年は「本音を素直に伝える」ことが恋を大きく動かします。",
    work: "地道な積み重ねが評価される時期。焦らず一歩ずつ進めば、努力が形になって返ってきます。金運は「長期の視点」で安定上昇。",
    overall: "種まきの一年。今の頑張りは必ず実ります。ガーネットを味方に、情熱を絶やさず進んで。",
    advice: "迷ったら「初心」に立ち返って。朝いちばんに今日の小さな目標を1つ声に出すと、一日の集中力が高まります。",
    lucky: { color: "深紅・ワインレッド", item: "手帳・赤い小物", action: "早起きして計画を書き出す", match: "5月・9月生まれ" }
  },
  {
    m: 2, title: "心を澄ませる、アメジストの月",
    catch: "静かな気品と鋭い直感。アメジストの紫が、あなたの内なる知性と癒しの力を引き出します。",
    stones: [
      { jp: "アメジスト", en: "Amethyst", c: "#7d3cb5", t: "f",
        appear: "夜明け前の空のような澄んだ紫。光にかざすと、奥で薄紫と濃紫が層をなして揺らめく、高貴で神秘的な色。",
        words: "誠実・心の平和・高貴",
        meaning: "邪気を払い、心に静けさをもたらす「守りの石」。直感を研ぎ澄まし、良縁と安らかな眠りを招きます。" }
    ],
    personality: "穏やかで思慮深く、人の気持ちに敏感。表には出さないけれど、芯には確かな信念。ひとりの時間で力を充電するタイプです。",
    love: "誠実で一途。派手さより「安心感」で愛されます。直感が冴える時期なので、ピンと来た出会いは大切に。",
    work: "集中力と洞察力が武器。人間関係の調整役として頼られます。散財を抑えれば金運は堅実に安定。",
    overall: "心を整えると運が巡る一年。ざわつく時こそ深呼吸を。アメジストが判断力を澄ませてくれます。",
    advice: "寝る前の5分、スマホを置いて静かに過ごして。頭が冴え、翌朝の決断がクリアになります。",
    lucky: { color: "紫・ラベンダー", item: "アロマ・間接照明", action: "夜に静かな読書時間をとる", match: "6月・11月生まれ" }
  },
  {
    m: 3, title: "癒しと勇気を運ぶ、海と大地の月",
    catch: "春の芽吹きとともに歩むあなたへ。海の色・珊瑚・大地の石が、やさしさと前へ進む勇気を授けます。",
    stones: [
      { jp: "アクアマリン", en: "Aquamarine", c: "#4fc3d9", t: "f",
        appear: "遠浅の海を閉じ込めたような、透きとおる水色。見ているだけで呼吸が深くなる、清らかな癒しの輝き。",
        words: "沈着・聡明・幸福な結婚",
        meaning: "心を穏やかに整え、円満な人間関係と幸福な結婚を守る「幸せの海の石」。" },
      { jp: "コーラル（珊瑚）", en: "Coral", c: "#ff6f61", t: "cab",
        appear: "海が長い時をかけて育てた、あたたかなサーモンピンク。マットな肌にやわらかな艶が宿る、生命の色。",
        words: "長寿・幸福・魔除け",
        meaning: "古来より子どもと母を守るお守り。健康・長寿を支え、災いを遠ざけます。" },
      { jp: "ブラッドストーン", en: "Bloodstone", c: "#2e6b4f", t: "cab",
        appear: "深い森のような緑に、点々と赤い斑が散る神秘的な石。静かな力強さを感じさせる佇まい。",
        words: "勇気・献身・生命力",
        meaning: "困難に立ち向かう勇気と、途切れない生命力を与える「戦士の石」。" }
    ],
    personality: "感受性が豊かで面倒見がよく、まわりを和ませる存在。柔らかい物腰の奥に、しなやかな強さを秘めています。",
    love: "尽くすほどに愛が育つタイプ。ただし我慢しすぎは禁物。素直な甘えが二人の距離をぐっと縮めます。",
    work: "協調性とセンスが光る時期。チームの潤滑油として信頼を集めます。人からの紹介が金運のカギ。",
    overall: "変化を恐れず流れに乗ると開ける一年。アクアマリンが心を鎮め、正しい選択へ導きます。",
    advice: "水辺の散歩や、こまめな水分補給を意識して。心のさざ波が静まり、良い縁が舞い込みます。",
    lucky: { color: "水色・サンゴピンク", item: "海モチーフの小物", action: "水辺を歩く・深呼吸する", match: "7月・11月生まれ" }
  },
  {
    m: 4, title: "曇りなき輝き、ダイヤモンドの月",
    catch: "最も硬く、最も澄んだ光をまとうあなた。ダイヤモンドが、揺るがぬ自信と純粋な心を照らします。",
    stones: [
      { jp: "ダイヤモンド", en: "Diamond", c: "#cfe0ff", t: "f",
        appear: "無色透明の中で七色の火花が弾ける、究極の輝き。角度を変えるたびに新しい光を放つ、永遠の象徴。",
        words: "永遠の絆・純潔・不屈",
        meaning: "何物にも負けない強さと、変わらぬ絆をもたらす「宝石の王」。持ち主の魅力と自信を最大限に引き出します。" },
      { jp: "水晶（クォーツ）", en: "Rock Crystal", c: "#eaecf5", t: "f",
        appear: "山の清流のように澄みきった無色の結晶。あらゆる光を素直に通す、清浄と調和の石。",
        words: "浄化・万能・調和",
        meaning: "場と心を清め、あらゆる願いを後押しする万能の石。他の石の力も高めます。" }
    ],
    personality: "まっすぐで誇り高く、リーダー気質。裏表がなく、正義感が強い頑張り屋。輝く場所でこそ本領を発揮します。",
    love: "情熱的でストレート。駆け引きより本音勝負が吉。あなたの自信ある笑顔が、最強のモテ要素です。",
    work: "第一線で輝ける時期。堂々と自分を打ち出して。臆せず挑戦すれば、収入アップのチャンスも。",
    overall: "主役の一年。遠慮は不要です。ダイヤモンドの光を借りて、望む舞台へ堂々と歩み出して。",
    advice: "「どうせ無理」を封印して。大きな目標ほど口に出すと現実が動き出します。姿勢を正すだけでも運気が上向きに。",
    lucky: { color: "クリア・シルバー白", item: "きらめくアクセサリー", action: "背筋を伸ばして堂々と話す", match: "8月・12月生まれ" }
  },
  {
    m: 5, title: "生命力あふれる、エメラルドの月",
    catch: "深い翠に包まれたあなたは、愛と安らぎを与える人。エメラルドと翡翠が、豊かな実りと調和を約束します。",
    stones: [
      { jp: "エメラルド", en: "Emerald", c: "#1f9e6a", t: "f",
        appear: "深い森の奥から差す木漏れ日のような、しっとりと濃い緑。吸い込まれるほど深く、気品ある翠の輝き。",
        words: "幸運・愛・安定",
        meaning: "愛と幸運を呼び、心身に安定をもたらす「女王の石」。洞察力を高め、真実を見抜く目を授けます。" },
      { jp: "翡翠（ジェイド）", en: "Jade", c: "#4faf7f", t: "cab",
        appear: "しっとりと艶めく、やわらかな緑。東洋で最も尊ばれた、徳と繁栄を象徴するなめらかな輝き。",
        words: "徳・繁栄・調和",
        meaning: "災いを退け、繁栄と長寿、円満をもたらす「幸運の守護石」。" }
    ],
    personality: "穏やかで愛情深く、美しいものや心地よさを大切にする人。粘り強く、身近な人を守る包容力があります。",
    love: "安定と誠実を大切にする、家庭的な愛情家。焦らずじっくり育てる恋が実ります。五感を満たすデートが吉。",
    work: "堅実さと美的センスが強み。コツコツ続けたことが評価される時期。無駄遣いを控えれば貯蓄運も good。",
    overall: "実りを育てる一年。急がば回れ。エメラルドの安定の力で、着実に豊かさが積み上がります。",
    advice: "自然や花に触れる時間を。緑を眺めるだけで心が整い、愛情運と金運がまろやかに巡り出します。",
    lucky: { color: "エメラルドグリーン", item: "観葉植物・生花", action: "公園や緑地でひと息つく", match: "1月・9月生まれ" }
  },
  {
    m: 6, title: "やさしい光をまとう、月と海の月",
    catch: "月と海が育てた石をまとうあなたは、愛の予感に敏感な人。真珠・ムーンストーン・アレキサンドライトが幸運を運びます。",
    stones: [
      { jp: "真珠（パール）", en: "Pearl", c: "#f4ebde", t: "cab",
        appear: "しっとりと内側から光る乳白色。見る角度で淡いピンクや水色が滲む、上品でやわらかな海の宝物。",
        words: "健康・富・純潔",
        meaning: "持ち主を守り、健康と富、清らかな心を象徴する「月の雫」。冠婚葬祭にも寄り添う万能の石。" },
      { jp: "ムーンストーン", en: "Moonstone", c: "#cfd6ee", t: "cab",
        appear: "石の中を月光がすうっと流れるように、青白い光が浮かぶ神秘の石（シラー効果）。",
        words: "愛の予感・健康・幸運",
        meaning: "恋の訪れを告げ、絆を深める「恋人たちの石」。旅の安全も守ります。" },
      { jp: "アレキサンドライト", en: "Alexandrite", c: "#6a5acd", t: "f",
        appear: "昼は青緑、夜は赤紫へ——光で色を変える魔法のような希少石。二つの顔を持つ神秘の輝き。",
        words: "秘めた思い・高貴・変化",
        meaning: "変化を味方につけ、秘めた才能を開花させる幻の石。幸運と高貴さの象徴。" }
    ],
    personality: "感受性ゆたかで想像力豊か。人の心の機微を察する優しさがあり、周囲に安心を与えます。気分の波を味方にできる人。",
    love: "ロマンチストで愛の勘が鋭い。今は恋の予感が高まる時期。直感を信じて一歩踏み出すと物語が動きます。",
    work: "共感力と発想力が輝く時期。人を支える役割で評価が上昇。臨時収入の予感も。",
    overall: "感性が冴える一年。心のアンテナに素直に。ムーンストーンが良縁とチャンスを引き寄せます。",
    advice: "満月の夜に願い事を書き出してみて。気持ちが整い、望みが形になりやすくなります。",
    lucky: { color: "パールホワイト・月光色", item: "パールのアクセ", action: "夜空や月を眺める", match: "2月・10月生まれ" }
  },
  {
    m: 7, title: "燃える情熱、ルビーの月",
    catch: "深紅の炎を宿すあなたは、勝負強さと生命力の人。ルビーが、勝利と尽きせぬエネルギーをもたらします。",
    stones: [
      { jp: "ルビー", en: "Ruby", c: "#c81e3a", t: "f",
        appear: "燃えさかる炎を封じ込めたような鮮烈な赤。内側から力があふれ出す、まさに「宝石の女王」の輝き。",
        words: "情熱・勝利・生命力",
        meaning: "勝負運と情熱をかき立て、困難を跳ね返す「勝利の石」。愛と生命力を燃え立たせます。" }
    ],
    personality: "エネルギッシュで行動的。目立つことを恐れず、勝負どころで力を発揮する熱いハート。人を惹きつけるカリスマ性があります。",
    love: "情熱的でストレートな恋愛派。ドラマチックな展開が似合います。素直な「好き」が最大の武器。",
    work: "勝負運が高まる時期。大きな挑戦や新規開拓が吉。勢いに乗れば収入も跳ね上がるチャンス。",
    overall: "攻めの一年。守りより挑戦を。ルビーの炎で、望む勝利を掴みにいって。",
    advice: "やりたいことは「今日」始めて。迷う時間より動く時間を。赤い物を1つ身につけると勢いが増します。",
    lucky: { color: "情熱の赤", item: "赤いアイテム・勝負服", action: "気になったことに即挑戦", match: "3月・11月生まれ" }
  },
  {
    m: 8, title: "太陽のように輝く、実りの月",
    catch: "明るく前向きなあなたを、輝く石々が祝福。ペリドット・サードオニキス・スピネルが、平和と成功、幸福な絆を育てます。",
    stones: [
      { jp: "ペリドット", en: "Peridot", c: "#9acd32", t: "f",
        appear: "夏の陽光をたっぷり浴びた若葉のような、明るく澄んだ黄緑。見るだけで元気が湧く太陽の石。",
        words: "夫婦の幸福・平和・希望",
        meaning: "暗い気持ちを払い、前向きさと希望を灯す「太陽の宝石」。家庭円満と友愛を守ります。" },
      { jp: "サードオニキス", en: "Sardonyx", c: "#a0522d", t: "cab",
        appear: "赤茶と白の縞が層をなす、あたたかく落ち着いた石。素朴ながら芯の強さを感じさせます。",
        words: "夫婦の幸福・友愛",
        meaning: "夫婦や友との絆を深め、幸福な人間関係を築く「絆の石」。" },
      { jp: "スピネル", en: "Spinel", c: "#d6336c", t: "f",
        appear: "ビビッドで澄んだ濃いピンク〜赤。小さくても強く輝く、生命力に満ちた宝石。",
        words: "向上心・情熱・成功",
        meaning: "エネルギーを高め、成功へと突き進む力を与える「情熱と向上の石」。" }
    ],
    personality: "明るく社交的で、周囲を元気にするムードメーカー。裏表がなく、面倒見がよいので自然と人が集まります。",
    love: "笑顔と素直さでモテるタイプ。今は縁が広がる時期。楽しい雰囲気づくりが恋を呼びます。",
    work: "人脈と行動力が実る時期。前向きな姿勢が信頼を集めます。人との縁から収入のチャンスが。",
    overall: "陽の当たる一年。明るさを武器に。ペリドットが不安を払い、希望へ導きます。",
    advice: "落ち込んだら、まず笑顔と背伸びを。太陽の光を浴びる散歩で、運気がぐんぐん充電されます。",
    lucky: { color: "ライトグリーン・オレンジ", item: "明るい色の小物", action: "朝日を浴びて散歩する", match: "4月・12月生まれ" }
  },
  {
    m: 9, title: "深く澄んだ知性、サファイアの月",
    catch: "静かな誠実さと深い愛のあなたへ。サファイアとクンツァイトが、真実の絆と無償のやさしさを守ります。",
    stones: [
      { jp: "サファイア", en: "Sapphire", c: "#1f5fd0", t: "f",
        appear: "夜空をそのまま切り取ったような深い青。吸い込まれるほど澄んだ、知性と誠実の輝き。",
        words: "誠実・慈愛・貞操",
        meaning: "誠実さと冷静な判断力を授け、邪念を退ける「賢者の石」。真実の愛を守ります。" },
      { jp: "クンツァイト", en: "Kunzite", c: "#f0a0c8", t: "f",
        appear: "透きとおる淡いピンク〜藤色。やさしく光を含んで、そっと寄り添うような繊細な輝き。",
        words: "無償の愛・純愛・癒し",
        meaning: "見返りを求めない愛と、傷ついた心を癒す力を持つ「愛と癒しの石」。" }
    ],
    personality: "冷静で誠実、責任感が強い努力家。感情に流されず物事を見極める理性の人。信頼を積み上げる力に長けています。",
    love: "一途で献身的。深い信頼の上に愛を築くタイプ。誠実さがそのまま最大の魅力になります。",
    work: "分析力と誠実さが評価される時期。任された役割を丁寧にこなすほど信頼と収入が安定します。",
    overall: "信頼が実を結ぶ一年。誠実さは必ず見られています。サファイアが冷静な判断を後押し。",
    advice: "頑張りすぎたら、自分にも優しく。クンツァイトのように「無償の愛」を、まず自分自身へ向けて。",
    lucky: { color: "サファイアブルー・淡いピンク", item: "青い文房具", action: "感謝をひとこと言葉にする", match: "1月・5月生まれ" }
  },
  {
    m: 10, title: "七色にきらめく、オパールの月",
    catch: "移ろう光をまとうあなたは、多彩な魅力の持ち主。オパールとトルマリンが、希望と創造の力を輝かせます。",
    stones: [
      { jp: "オパール", en: "Opal", c: "#8fd6d0", t: "cab",
        appear: "乳白色の中で赤・青・緑の光が万華鏡のように踊る「遊色効果」。ひとつとして同じ表情がない、七色の奇跡。",
        words: "希望・幸福・忍耐",
        meaning: "眠れる才能と創造性を引き出し、希望をもたらす「虹を宿す石」。" },
      { jp: "トルマリン", en: "Tourmaline", c: "#e0457b", t: "f",
        appear: "ピンクやグリーンなど色の幅が広く、澄んだ発色が美しい石。心と体に流れを通す「電気の石」。",
        words: "心身の浄化・希望",
        meaning: "マイナスを払い、心身に良い流れを呼び込む浄化とエネルギーの石。" }
    ],
    personality: "多才で好奇心旺盛、感性が豊か。いろいろな顔を持ち、状況に合わせて輝ける柔軟さがあります。美意識が高い人。",
    love: "刺激と変化を楽しむロマンチスト。マンネリより新鮮さがカギ。あなたの多彩な魅力が恋を彩ります。",
    work: "創造力と表現力が花開く時期。新しいアイデアが評価されます。趣味や特技が収入につながる予感。",
    overall: "可能性が広がる一年。ひとつに絞らず、興味の翼を伸ばして。オパールが才能を虹色に輝かせます。",
    advice: "「やってみたい」を我慢しないで。小さな新しい挑戦が、思わぬ幸運の扉を開きます。",
    lucky: { color: "レインボー・ピンク", item: "カラフルな小物", action: "新しいことを1つ始める", match: "2月・6月生まれ" }
  },
  {
    m: 11, title: "実りと友愛、トパーズの月",
    catch: "あたたかな光をまとうあなたは、周囲に希望を配る人。トパーズとシトリンが、友情と豊かな繁栄をもたらします。",
    stones: [
      { jp: "トパーズ", en: "Topaz", c: "#f2b705", t: "f",
        appear: "はちみつのように澄んだ黄金色（ブルーの輝きの種類も）。あたたかく、まっすぐな希望の光。",
        words: "友情・希望・潔白",
        meaning: "希望と友情を育み、正しい道を照らす「導きの石」。誠実な絆を引き寄せます。" },
      { jp: "シトリン", en: "Citrine", c: "#e6a817", t: "f",
        appear: "太陽を溶かし込んだような明るい黄金色。見るだけで気持ちが上向く、繁栄と富の石。",
        words: "繁栄・富・友愛",
        meaning: "商売繁盛・金運を招く「幸運と繁栄の石」。明るい前向きさをもたらします。" }
    ],
    personality: "誠実で親しみやすく、人を安心させる人柄。地に足のついた考え方と、あたたかい人望を兼ね備えています。",
    love: "友情から愛が育つ、信頼型の恋。誠実さと明るさが好かれるポイント。焦らず自然体でいることが吉。",
    work: "人望と堅実さが実る時期。コツコツの積み重ねが繁栄につながります。金運は特に good、貯蓄も伸びやすい。",
    overall: "豊かさが巡る一年。誠実な行いが実を結びます。シトリンが金運と明るさを引き寄せます。",
    advice: "お財布や玄関を整えて、黄色い物を1つ取り入れて。巡りが良くなり、豊かさが舞い込みます。",
    lucky: { color: "ゴールド・イエロー", item: "黄色い財布・小物", action: "お財布と玄関を整える", match: "3月・7月生まれ" }
  },
  {
    m: 12, title: "冬空を映す、青き宝石の月",
    catch: "澄んだ冬の空をまとうあなたへ。ターコイズ・ラピスラズリ・タンザナイト・ジルコンが、成功と真実、安らぎを守ります。",
    stones: [
      { jp: "ターコイズ（トルコ石）", en: "Turquoise", c: "#1fb6c9", t: "cab",
        appear: "晴れた空のような明るい青緑。素朴で温かみがあり、旅する人を守ってきた大地の護符。",
        words: "成功・繁栄・旅の安全",
        meaning: "危険から持ち主を守り、成功と繁栄、安全な旅を導く「旅人の守護石」。" },
      { jp: "ラピスラズリ", en: "Lapis Lazuli", c: "#1e3a8a", t: "cab",
        appear: "夜空に金の星をちりばめたような、深く濃い青。古代から聖なる石として崇められた気高い輝き。",
        words: "幸運・成功・真実",
        meaning: "邪気を払い、真実を見抜く力と大きな幸運を授ける「聖なる石」。" },
      { jp: "タンザナイト", en: "Tanzanite", c: "#5b3fbf", t: "f",
        appear: "青と紫のあいだで妖艶に揺らめく、深い青紫。夕暮れの空を閉じ込めたような気品ある輝き。",
        words: "冷静・誇り高き人生",
        meaning: "冷静さと気高さを授け、人生を上質に導く「気品の石」。" },
      { jp: "ジルコン", en: "Zircon", c: "#7fbfe0", t: "f",
        appear: "ダイヤモンドに迫る強い煌めきを放つ、澄んだ淡青。清らかで凛とした輝き。",
        words: "安らかな眠り・平和",
        meaning: "心を鎮め、安らかな眠りと平和をもたらす「癒しの石」。" }
    ],
    personality: "自由を愛し、行動力とユーモアにあふれる楽天家。好奇心旺盛で、いろんな世界を旅するように生きる人。",
    love: "束縛より自由を大切にする、明るい恋愛派。一緒にいて楽しい関係が長続きの秘訣。フットワークが恋を運びます。",
    work: "挑戦とスピードが吉の時期。新天地や新しい分野で力を発揮。行動範囲を広げるほどチャンスと収入が増えます。",
    overall: "世界が広がる一年。じっとせず動いて。ターコイズが旅と挑戦の安全を守ってくれます。",
    advice: "少し遠くへ出かけてみて。環境を変えると視界が開け、新しい幸運と出会えます。青い物がお守りに。",
    lucky: { color: "ターコイズブルー・紺", item: "青い旅グッズ", action: "行ったことのない場所へ行く", match: "4月・8月生まれ" }
  }
];

/* ---- 表示ロジック ----------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  var grid   = document.getElementById("monthGrid");
  var result = document.getElementById("result");
  if (!grid || !result) return;

  function stoneBlock(s) {
    return '<div class="stone-block">' +
             '<div class="stone-visual">' + gemSVG(s) + '</div>' +
             '<div class="stone-info">' +
               '<div class="stone-title">' + s.jp + '<small>' + s.en + '</small></div>' +
               '<p class="stone-appear">' + s.appear + '</p>' +
               '<p class="stone-words">石言葉：' + s.words + '</p>' +
               '<p class="stone-meaning">' + s.meaning + '</p>' +
             '</div>' +
           '</div>';
  }

  function fortuneSec(icon, label, text, extra) {
    return '<div class="f-sec' + (extra ? ' ' + extra : '') + '"><h3>' + icon + ' ' + label + '</h3><p>' + text + '</p></div>';
  }

  function render(b) {
    var stones = b.stones.map(stoneBlock).join("");
    var lucky =
      '<div class="lucky-row">' +
        '<span class="lucky-chip"><b>ラッキーカラー</b>' + b.lucky.color + '</span>' +
        '<span class="lucky-chip"><b>ラッキーアイテム</b>' + b.lucky.item + '</span>' +
        '<span class="lucky-chip"><b>開運アクション</b>' + b.lucky.action + '</span>' +
        '<span class="lucky-chip"><b>相性の良い月</b>' + b.lucky.match + '</span>' +
      '</div>';

    result.hidden = false;
    result.innerHTML =
      '<h2 class="bs-rtitle">' + b.m + '月生まれのあなたへ</h2>' +
      '<p class="bs-title">「' + b.title + '」</p>' +
      '<p class="bs-catch">' + b.catch + '</p>' +
      '<div class="stone-showcase">' + stones + '</div>' +
      '<div class="fortune-sections">' +
        fortuneSec("🔮", "総合運", b.overall) +
        fortuneSec("💗", "恋愛運", b.love) +
        fortuneSec("💼", "仕事・金運", b.work) +
        fortuneSec("🌙", "あなたの気質", b.personality) +
        fortuneSec("✨", "開運アドバイス", b.advice, "advice") +
      '</div>' +
      lucky;
  }

  MONTHS.forEach(function (b) {
    var btn = document.createElement("button");
    btn.className = "month-btn";
    btn.type = "button";
    btn.textContent = b.m + "月";
    btn.addEventListener("click", function () {
      var actives = document.querySelectorAll(".month-btn");
      for (var i = 0; i < actives.length; i++) actives[i].classList.remove("on");
      btn.classList.add("on");
      render(b);
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    grid.appendChild(btn);
  });

  // 初期表示：1月を選んだ状態にしてコンテンツを見せる
  var first = grid.querySelector(".month-btn");
  if (first) { first.classList.add("on"); render(MONTHS[0]); result.hidden = false; }
});
