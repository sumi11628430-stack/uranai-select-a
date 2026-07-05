/* =========================================================
   タロット占い：ケルト十字（10枚）
   ・シャッフル→10枚を展開（裏向き）→1枚ずつタップして開く
   ・下の結果欄には「直前にめくった1枚」だけを表示する
   　（積み上げ式だと下に長くなり探しづらいため）
   ・「全体の結果を見る」ボタンで、めくった分を一覧できる
   　別ウィンドウを開く（1画面にできるだけ多く収まる配置）
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  var startBtn   = document.getElementById("tarotStart");
  var spread     = document.getElementById("tarotSpread");
  var result     = document.getElementById("result");
  var intro      = document.getElementById("tarotIntro");
  var fullBtn    = document.getElementById("tarotFullResults");
  if (!startBtn || !spread || !result) return;

  var SUIT_ICON = { wand: "🔥", cup: "💧", sword: "⚔", pentacle: "🪙" };

  function cardIcon(card) {
    return card.suit ? SUIT_ICON[card.suit] : "✦";
  }

  function cardTitle(card) {
    return (typeof card.major === "number" ? card.major + ". " : "") + card.name;
  }

  function astroText(card) {
    var a = card.astro;
    if (!a) return null;
    if (a.type === "decan")   return a.sign + " 第" + a.n + "デカン（" + a.planet + "）";
    if (a.type === "sign")    return a.label + "（対応星座）";
    if (a.type === "planet")  return a.label + "（対応惑星）";
    if (a.type === "element") return a.label;
    return null;
  }

  function detailHTML(entry) {
    var orient = entry.reversed
      ? '<span class="tarot-badge tarot-badge-rev">逆位置</span>'
      : '<span class="tarot-badge tarot-badge-up">正位置</span>';
    var meaning = entry.reversed ? entry.card.reversed : entry.card.upright;
    var astro = astroText(entry.card);
    return (
      '<h3>' + entry.position.n + '. ' + entry.position.label + '</h3>' +
      '<p class="tarot-detail-pos">' + entry.position.desc + '</p>' +
      '<p class="tarot-detail-card">' + cardIcon(entry.card) + ' <b>' + cardTitle(entry.card) + '</b> ' + orient + '</p>' +
      '<p>' + meaning + '</p>' +
      (astro ? '<div class="lucky-row"><span class="lucky-chip"><b>キーワード</b>' + entry.card.keyword + '</span><span class="lucky-chip"><b>星の対応</b>' + astro + '</span></div>'
             : '<div class="lucky-row"><span class="lucky-chip"><b>キーワード</b>' + entry.card.keyword + '</span></div>')
    );
  }

  var revealedCount = 0;
  var revealedByPos = {};

  function showDetail(entry) {
    var box = document.createElement("div");
    box.className = "f-sec tarot-detail";
    box.innerHTML = detailHTML(entry);
    if (revealedCount === 10) {
      var p = document.createElement("p");
      p.className = "bs-source tarot-closing";
      p.textContent = "10枚すべてが出そろいました。「全体の結果を見る」で通して眺めると、より深いメッセージが見えてきます。";
      box.appendChild(p);
    }
    result.innerHTML = "";
    result.appendChild(box);
    result.hidden = false;
    if (revealedCount === 1) result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (fullBtn) fullBtn.hidden = false;
  }

  function openFullResults() {
    var order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var entries = order.map(function (n) { return revealedByPos[n]; }).filter(Boolean);
    if (!entries.length) return;

    var cssHref = "";
    var link = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
    if (link) cssHref = link.href;

    var items = entries.map(function (entry) {
      return '<div class="f-sec tarot-detail tarot-popup-item">' + detailHTML(entry) + '</div>';
    }).join("");

    var note = entries.length < 10
      ? '<p class="tarot-popup-note">現在 ' + entries.length + ' / 10 枚が判明しています。残りのカードもめくると全体が更新されます。</p>'
      : '<p class="tarot-popup-note">10枚すべてが出そろいました。全体を通して眺めると、より深いメッセージが見えてきます。</p>';

    var html =
      '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
      '<title>ケルト十字：全体の結果 ― 占いの館</title>' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      (cssHref ? '<link rel="stylesheet" href="' + cssHref + '">' : "") +
      '<style>' +
      'body{background:#180c28;padding:1.4rem clamp(1rem,3vw,2.2rem);}' +
      '.tarot-popup-head{max-width:1200px;margin:0 auto 1.2rem;text-align:center;}' +
      '.tarot-popup-note{color:var(--text-dim);font-size:.9rem;margin-top:.4rem;}' +
      '.tarot-popup-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(230px, 1fr));gap:.8rem;max-width:1200px;margin:0 auto;align-items:start;}' +
      '.tarot-popup-item{margin:0;padding:1rem 1.1rem;}' +
      '.tarot-popup-item h3{font-size:1rem;margin-bottom:.3rem;}' +
      '.tarot-popup-item p{font-size:.86rem;line-height:1.6;margin:.35rem 0;}' +
      '.tarot-popup-item .tarot-detail-card{font-size:.94rem;}' +
      '.tarot-popup-item .lucky-row{gap:.35rem;}' +
      '.tarot-popup-item .lucky-chip{font-size:.72rem;padding:.25rem .5rem;}' +
      '</style></head><body>' +
      '<div class="tarot-popup-head"><h1 class="brand" style="font-size:clamp(1.3rem,3.6vw,1.9rem);">🔮 ケルト十字：全体の結果</h1>' + note + '</div>' +
      '<div class="tarot-popup-grid">' + items + '</div>' +
      '</body></html>';

    var win = window.open("", "_blank");
    if (!win) return; // ポップアップブロック時は何もしない
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  function makeCardEl(entry, extraClass) {
    var cardEl = document.createElement("div");
    cardEl.className = "tarot-card" + (extraClass ? " " + extraClass : "");
    cardEl.setAttribute("role", "button");
    cardEl.setAttribute("tabindex", "0");
    cardEl.setAttribute("aria-label", entry.position.n + "番目・" + entry.position.label + "のカードをめくる");

    var inner = document.createElement("div");
    inner.className = "tarot-card-inner";

    var back = document.createElement("div");
    back.className = "tarot-card-face tarot-card-back";
    back.innerHTML = "✦";

    var front = document.createElement("div");
    front.className = "tarot-card-face tarot-card-front";
    front.innerHTML =
      '<span class="tarot-card-badge ' + (entry.reversed ? "tarot-badge-rev" : "tarot-badge-up") + '">' + (entry.reversed ? "逆" : "正") + '</span>' +
      '<span class="tarot-card-icon">' + cardIcon(entry.card) + '</span>' +
      '<span class="tarot-card-name">' + cardTitle(entry.card) + '</span>';

    inner.appendChild(back);
    inner.appendChild(front);
    cardEl.appendChild(inner);

    function reveal() {
      if (cardEl.classList.contains("revealed")) return;
      cardEl.classList.add("revealed");
      revealedCount++;
      revealedByPos[entry.position.n] = entry;
      showDetail(entry);
    }
    cardEl.addEventListener("click", reveal);
    cardEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); reveal(); }
    });
    return cardEl;
  }

  function buildSlots(draw) {
    spread.innerHTML = "";
    var cross = document.createElement("div");
    cross.className = "tarot-cross";
    var staff = document.createElement("div");
    staff.className = "tarot-staff";
    spread.appendChild(cross);
    spread.appendChild(staff);

    var byPos = {};
    draw.forEach(function (entry) { byPos[entry.position.n] = entry; });

    /* 中央セル：1番（現在）に2番（障害・鍵）を90度回転させて重ねる伝統的な配置。
       カードだけを重ね、キャプションは重ならないよう縦に並べる。 */
    var centerSlot = document.createElement("div");
    centerSlot.className = "tarot-slot tarot-slot-center";
    centerSlot.style.transitionDelay = "0ms";
    var stack = document.createElement("div");
    stack.className = "tarot-card-stack";
    stack.appendChild(makeCardEl(byPos[1]));
    stack.appendChild(makeCardEl(byPos[2], "tarot-card-cross"));
    centerSlot.appendChild(stack);
    [1, 2].forEach(function (n) {
      var cap = document.createElement("p");
      cap.className = "tarot-slot-label";
      cap.textContent = n + ". " + byPos[n].position.label;
      centerSlot.appendChild(cap);
    });
    cross.appendChild(centerSlot);

    [3, 5, 6, 4, 7, 8, 9, 10].forEach(function (n, i) {
      var entry = byPos[n];
      var slot = document.createElement("div");
      slot.className = "tarot-slot tarot-slot-" + n;
      slot.style.transitionDelay = ((i + 2) * 70) + "ms";
      var caption = document.createElement("p");
      caption.className = "tarot-slot-label";
      caption.textContent = n + ". " + entry.position.label;
      slot.appendChild(makeCardEl(entry));
      slot.appendChild(caption);
      (n <= 6 ? cross : staff).appendChild(slot);
    });
  }

  if (fullBtn) fullBtn.addEventListener("click", openFullResults);

  var drawing = false;
  startBtn.addEventListener("click", function () {
    if (drawing) return;
    drawing = true;

    result.innerHTML = "";
    result.hidden = true;
    revealedCount = 0;
    revealedByPos = {};
    if (intro) intro.hidden = true;
    if (fullBtn) fullBtn.hidden = true;

    var draw = drawCelticCross();
    spread.hidden = false;
    spread.classList.remove("dealt");
    buildSlots(draw);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { spread.classList.add("dealt"); });
    });

    startBtn.textContent = "もう一度シャッフルする";
    spread.scrollIntoView({ behavior: "smooth", block: "start" });
    drawing = false;
  });
});
