/* =========================================================
   本格姓名判断（熊崎式）：五格計算とロジック
   ・天格 = 姓の画数合計（+ 姓が1字なら霊数1）
   ・地格 = 名の画数合計（+ 名が1字なら霊数1）
   ・人格 = 姓の最後の字 + 名の最初の字（霊数なし）
   ・総格 = 姓名すべての画数合計（霊数なし）
   ・外格 = 天格 + 地格 − 人格（この式で1字姓・1字名の例外も自動的に処理される）
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var seiInput = document.getElementById("seiInput");
  var meiInput = document.getElementById("meiInput");
  var btn      = document.getElementById("btnDivine");
  var result   = document.getElementById("result");
  var errBox   = document.getElementById("seimeiError");
  if (!seiInput || !meiInput || !btn || !result) return;

  function analyzeName(str) {
    var chars = Array.from(str);
    var items = [];
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      // 々（同の字点・踊り字）は直前の文字と同じ画数として数える（例: 佐々木の々＝佐と同じ7画）
      if ((c === "々" || c === "〻") && items.length > 0 && items[items.length - 1].ok) {
        items.push({ ch: c, ok: true, n: items[items.length - 1].n });
        continue;
      }
      var r = charStrokes(c);
      items.push({ ch: c, ok: r.ok, n: r.n });
    }
    return items;
  }

  function sumOk(items) {
    return items.reduce(function (a, b) { return a + (b.ok ? b.n : 0); }, 0);
  }

  function gradeClass(kind) {
    if (kind === "大吉") return "kk-daikichi";
    if (kind === "吉") return "kk-kichi";
    if (kind === "半吉") return "kk-hankichi";
    if (kind === "凶") return "kk-kyo";
    return "kk-daikyo";
  }

  function gridCard(label, n, roleNote) {
    var info = kakusuInfo(n);
    return '' +
      '<div class="grid-card ' + gradeClass(info.kind) + '">' +
        '<div class="grid-label">' + label + '<span class="grid-role">' + roleNote + '</span></div>' +
        '<div class="grid-num">' + n + '<small>画</small></div>' +
        '<div class="grid-kind">' + info.kind + '　「' + info.title + '」</div>' +
        '<p class="grid-text">' + info.text + '</p>' +
      '</div>';
  }

  function charChip(item) {
    var cls = item.ok ? "char-chip" : "char-chip bad";
    var num = item.ok ? item.n + "画" : "非対応";
    return '<span class="' + cls + '">' + item.ch + '<b>' + num + '</b></span>';
  }

  /* ---- 陰陽配列（画数の奇数=陽・偶数=陰の並びを見る） --------------- */
  function inyouOf(n) { return n % 2 === 1 ? "陽" : "陰"; }

  function inyouSection(allItems) {
    var marks = allItems.map(function (i) { return inyouOf(i.n); });
    var dots = marks.map(function (m) {
      return '<span class="inyou-dot ' + (m === "陽" ? "yo" : "in") + '">' + (m === "陽" ? "○" : "●") + '<b>' + m + '</b></span>';
    }).join('<span class="inyou-arrow">-</span>');

    var allSame = marks.every(function (m) { return m === marks[0]; });
    var judge, note;
    if (marks.length >= 3 && allSame) {
      judge = "凶";
      note = (marks[0] === "陽" ? "全て陽" : "全て陰") + "に偏った配列です。エネルギーが一方向に偏りすぎ、" +
        (marks[0] === "陽" ? "強すぎる勢いが空回りしたり、周囲と衝突しやすい" : "力が弱まり、消極的になったり苦労が続きやすい") +
        "傾向があるとされます。";
      judge = "要注意";
    } else {
      var alternating = true;
      for (var i = 1; i < marks.length; i++) { if (marks[i] === marks[i - 1]) { alternating = false; break; } }
      if (alternating) {
        judge = "良好";
        note = "陰と陽が交互に現れる、バランスの取れた配列です。物事に偏りが出にくく、安定した運勢の後押しとなります。";
      } else {
        judge = "普通";
        note = "陰陽が適度に混ざった配列です。極端な偏りはなく、大きな乱れは見られません。";
      }
    }

    return '<div class="f-sec"><h3>☯ 陰陽配列</h3>' +
      '<div class="inyou-row">' + dots + '</div>' +
      '<p class="inyou-judge">判定：<b>' + judge + '</b></p>' +
      '<p>' + note + '</p>' +
      '<p class="bs-source" style="margin-top:.8rem;">※陰陽配列は画数の奇偶（奇数=陽・偶数=陰）の並びを見る補助的な鑑定法です。五格ほど重視しない流派もあります。</p>' +
      '</div>';
  }

  /* ---- 三才配置と名前の色（画数の一の位から五行を判定） ------------- */
  var GOGYO_COLOR = {
    "木": { hex: "#4a9d5f", name: "若葉のような緑", desc: "成長・向上・のびやかさを象徴する色。物事を発展させる力を後押しします。" },
    "火": { hex: "#e0453f", name: "燃えるような赤", desc: "情熱・行動力・直感を象徴する色。物事を前に進めるエネルギーを表します。" },
    "土": { hex: "#c99a3e", name: "大地のような黄土色", desc: "安定・信頼・実り豊かさを象徴する色。地に足のついた着実さを表します。" },
    "金": { hex: "#c9b458", name: "輝く金・白", desc: "決断力・潔さ・洗練を象徴する色。物事をやり遂げる強さを表します。" },
    "水": { hex: "#3a5f8a", name: "深い海のような紺", desc: "知性・柔軟さ・包容力を象徴する色。流れに逆らわずしなやかに生きる力を表します。" }
  };
  function gogyoOf(n) {
    var d = n % 10;
    if (d === 1 || d === 2) return "木";
    if (d === 3 || d === 4) return "火";
    if (d === 5 || d === 6) return "土";
    if (d === 7 || d === 8) return "金";
    return "水"; // 9 or 0
  }
  function gogyoRelate(a, b) {
    if (a === b) return "比和";
    var gen = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
    var des = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };
    if (gen[a] === b || gen[b] === a) return "相生";
    if (des[a] === b || des[b] === a) return "相剋";
    return "－";
  }

  function sansaiSection(tenkaku, jinkaku, chikaku) {
    var tE = gogyoOf(tenkaku), jE = gogyoOf(jinkaku), cE = gogyoOf(chikaku);
    var r1 = gogyoRelate(tE, jE);
    var r2 = gogyoRelate(jE, cE);
    var relClass = function (r) { return r === "相剋" ? "rel-bad" : (r === "相生" ? "rel-good" : "rel-neutral"); };

    var overallGood = r1 !== "相剋" && r2 !== "相剋";
    var overallNote = overallGood
      ? "天格・人格・地格の五行が相生（または比和）でつながり、流れのよい配置です。物事が滞りなく循環しやすいでしょう。"
      : "天格・人格・地格の間に相剋（打ち消し合う関係）が見られます。運勢の流れがせき止められやすい面もありますが、ご本人の努力次第で十分に補えるとされています。";

    var color = GOGYO_COLOR[jE];

    var sansaiHtml =
      '<div class="f-sec"><h3>🌳 三才配置（天格・人格・地格の五行）</h3>' +
      '<div class="sansai-row">' +
        '<span class="sansai-badge">天格<b>' + tE + '</b></span>' +
        '<span class="sansai-rel ' + relClass(r1) + '">' + r1 + '</span>' +
        '<span class="sansai-badge">人格<b>' + jE + '</b></span>' +
        '<span class="sansai-rel ' + relClass(r2) + '">' + r2 + '</span>' +
        '<span class="sansai-badge">地格<b>' + cE + '</b></span>' +
      '</div>' +
      '<p>' + overallNote + '</p>' +
      '</div>';

    var colorHtml =
      '<div class="f-sec"><h3>🎨 あなたの名前の色</h3>' +
      '<div class="name-color-row">' +
        '<span class="name-color-swatch" style="--nc:' + color.hex + '"></span>' +
        '<div><div class="name-color-name">' + jE + '（' + color.name + '）</div>' +
        '<p style="margin:0;">' + color.desc + '</p></div>' +
      '</div>' +
      '<p class="bs-source" style="margin-top:.8rem;">※もっとも重視される「人格」の画数から、五行（木・火・土・金・水）を判定し、対応する色でご紹介しています。</p>' +
      '</div>';

    return sansaiHtml + colorHtml;
  }

  btn.addEventListener("click", function () {
    var sei = seiInput.value.replace(/\s/g, "");
    var mei = meiInput.value.replace(/\s/g, "");
    if (errBox) errBox.hidden = true;
    result.hidden = true;

    if (!sei || !mei) {
      if (errBox) { errBox.hidden = false; errBox.textContent = "姓と名の両方を入力してください。"; }
      return;
    }

    var seiItems = analyzeName(sei);
    var meiItems = analyzeName(mei);
    var unsupported = seiItems.concat(meiItems).filter(function (i) { return !i.ok; });

    if (unsupported.length > 0) {
      if (errBox) {
        errBox.hidden = false;
        var uniq = [];
        unsupported.forEach(function (i) { if (uniq.indexOf(i.ch) < 0) uniq.push(i.ch); });
        errBox.textContent = "申し訳ございません、次の文字は画数辞典に未収録のため判定できません：" + uniq.join("　") +
          "。憶測の画数で結果を出すことはいたしません。";
      }
      return;
    }

    var seiSum = sumOk(seiItems);
    var meiSum = sumOk(meiItems);
    var tenkaku = seiSum + (seiItems.length === 1 ? 1 : 0);
    var chikaku = meiSum + (meiItems.length === 1 ? 1 : 0);
    var jinkaku = seiItems[seiItems.length - 1].n + meiItems[0].n;
    var soukaku = seiSum + meiSum;
    var gaikaku = tenkaku + chikaku - jinkaku;

    var jinInfo = kakusuInfo(jinkaku);
    var souInfo = kakusuInfo(soukaku);

    var chipsRow =
      '<div class="char-chips">' +
        seiItems.map(charChip).join("") +
        '<span class="chip-sep">＋</span>' +
        meiItems.map(charChip).join("") +
      '</div>';

    var summary =
      '<div class="f-sec advice">' +
        '<h3>🔮 総合鑑定</h3>' +
        '<p>もっとも重視される「人格」（' + jinkaku + '画・' + jinInfo.kind + '「' + jinInfo.title + '」）は、あなたの性格や対人運、中年期までの運勢を映す核となる数です。' + jinInfo.text + '</p>' +
        '<p>人生全体・晩年運を示す「総格」（' + soukaku + '画・' + souInfo.kind + '「' + souInfo.title + '」）は、' + souInfo.text + '</p>' +
      '</div>';

    var grids =
      '<div class="grid-showcase">' +
        gridCard("人格", jinkaku, "性格・対人運（最重要）") +
        gridCard("総格", soukaku, "人生全体・晩年運") +
        gridCard("地格", chikaku, "幼少期〜青年期の運勢") +
        gridCard("外格", gaikaku, "社会運・対外運") +
        gridCard("天格", tenkaku, "先祖から受け継ぐ宿命（参考）") +
      '</div>';

    var allItems = seiItems.concat(meiItems);

    result.hidden = false;
    result.innerHTML =
      '<h2 class="bs-rtitle">「' + sei + '　' + mei + '」の姓名判断</h2>' +
      chipsRow +
      summary +
      '<p class="bs-listtitle" style="margin-top:2rem;">五格 詳細</p>' +
      grids +
      '<p class="bs-listtitle" style="margin-top:2rem;">陰陽・五行でみる、もうひとつの鑑定</p>' +
      inyouSection(allItems) +
      sansaiSection(tenkaku, jinkaku, chikaku) +
      '<p class="bs-source" style="margin-top:2rem;">' +
        '※画数は伝統的な「旧字体（正字）」基準を採用し、新字体と旧字体で画数が異なる代表的な漢字は旧字体の画数で判定しています。' +
        '画数の吉凶は熊崎式姓名判断の考え方に基づく代表的な分類ですが、49画以降を中心に流派によって評価が分かれる数があります。' +
        '姓名判断は統計的な伝承に基づく占いであり、結果は絶対的なものではなく、楽しみの一つとしてご覧ください。' +
      '</p>';

    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
