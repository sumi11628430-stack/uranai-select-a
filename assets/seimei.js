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

    result.hidden = false;
    result.innerHTML =
      '<h2 class="bs-rtitle">「' + sei + '　' + mei + '」の姓名判断</h2>' +
      chipsRow +
      summary +
      '<p class="bs-listtitle" style="margin-top:2rem;">五格 詳細</p>' +
      grids +
      '<p class="bs-source" style="margin-top:2rem;">' +
        '※画数は伝統的な「旧字体（正字）」基準を採用し、新字体と旧字体で画数が異なる代表的な漢字は旧字体の画数で判定しています。' +
        '画数の吉凶は熊崎式姓名判断の考え方に基づく代表的な分類ですが、49画以降を中心に流派によって評価が分かれる数があります。' +
        '姓名判断は統計的な伝承に基づく占いであり、結果は絶対的なものではなく、楽しみの一つとしてご覧ください。' +
      '</p>';

    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
