/* =========================================================
   「お守り」タイル（楽天アフィリエイト）：誕生石・星座ページ共通の部品
   ・タイルを押すと楽天市場の検索結果（一覧）が開く
   ・商品写真があれば写真（楽天の規約により切り取り・文字重ねをしない）、無ければ金の線画イラスト
   ========================================================= */

// 楽天アフィリエイト「URLからリンクを作成」と同じ形式（hgc/ID/?pc=楽天の検索URL）
var RAKUTEN_AFF_ID = "57f7612b.86273f71.57f7612c.b7f852bb";

function rakutenSearchLink(words) {
  var search = "https://search.rakuten.co.jp/search/mall/" + words.map(encodeURIComponent).join("+") + "/";
  return "https://hb.afl.rakuten.co.jp/hgc/" + RAKUTEN_AFF_ID + "/?pc=" + encodeURIComponent(search) + "&link_type=text";
}

/* お守りアイコン：金の線画＋宝石（色は囲みの --gem）（48×48） */
function charmGem(x, y, r) {
  return '<polygon class="ci-gem" points="' + x + ',' + (y - r) + ' ' + (x + r * .85) + ',' + (y - r * .2) + ' ' + x + ',' + (y + r) + ' ' + (x - r * .85) + ',' + (y - r * .2) + '"/>' +
         '<polygon class="ci-shine" points="' + x + ',' + (y - r) + ' ' + (x - r * .85) + ',' + (y - r * .2) + ' ' + x + ',' + (y - r * .05) + '"/>';
}
var CHARM_ICONS = {
  strap:    '<path d="M24 5 C14 5 14 19 24 21 C34 19 34 5 24 5" /><path d="M24 21 V27" />' + charmGem(24, 34, 7),
  key:      '<circle cx="17" cy="15" r="9" /><path d="M23 21 L28 26" /><path d="M28 26 l2 2 M31 29 l2 2" />' + charmGem(34, 35, 7),
  brooch:   '<ellipse cx="24" cy="25" rx="16" ry="14" /><ellipse cx="24" cy="25" rx="11.5" ry="9.5" stroke-dasharray="1.5 2.5" />' + charmGem(24, 25, 7.5),
  hair:     '<path d="M6 30 C10 18 38 18 42 30" /><path d="M9 30 C14 23 34 23 39 30" />' + charmGem(24, 22, 6.5),
  bracelet: '<ellipse cx="24" cy="26" rx="17" ry="11" /><circle cx="9" cy="23" r="1.6" /><circle cx="39" cy="23" r="1.6" /><circle cx="14" cy="33" r="1.6" /><circle cx="34" cy="33" r="1.6" />' + charmGem(24, 37, 6),
  necklace: '<path d="M8 7 C9 22 17 29 24 30 C31 29 39 22 40 7" />' + charmGem(24, 37, 7),
  earring:  '<path d="M19 8 C19 4 29 4 29 8 C29 12 24 13 24 16" /><path d="M24 16 V24" />' + charmGem(24, 32, 7.5),
  pierce:   charmGem(15, 22, 7) + charmGem(33, 22, 7) + '<path d="M15 30 V37 M33 30 V37" />',
  cuff:     '<path d="M31 9 C15 7 11 23 16 33 C19 39 27 41 32 38" /><path d="M31 15 C22 14 19 23 21 30 C23 34 27 35 30 34" />' + charmGem(18, 22, 5.5)
};
function charmIcon(key) {
  return '<svg class="charm-icon" viewBox="0 0 48 48" aria-hidden="true">' + CHARM_ICONS[key] + '</svg>';
}

/* お守りの囲み全体のHTML
   o.gem    : 宝石・光の色        o.title : 見出し（例：🔮 ガーネットのお守り）
   o.text   : 説明文              o.name  : 案内文に入れる名前（例：ガーネット）
   o.types / o.earTypes : [表示名, 検索する言葉, アイコン] の配列
   o.photos : { アイコン名: 写真URL }（無い物はイラスト）
   o.words  : function(タイル) → 楽天で検索する言葉の配列 */
function charmSectionHTML(o) {
  function chips(types) {
    return types.map(function (t, i) {
      var photo = o.photos && o.photos[t[2]];
      var visual = photo
        ? '<span class="charm-photo"><img src="' + photo + '" alt="" loading="lazy" width="128" height="128" onerror="this.parentNode.outerHTML=charmIcon(&quot;' + t[2] + '&quot;)"></span>'
        : charmIcon(t[2]);
      return '<a class="charm-chip" style="--i:' + i + '" href="' + rakutenSearchLink(o.words(t)) + '" target="_blank" rel="nofollow sponsored noopener">' +
               visual + '<span class="charm-name">' + t[0] + '</span>' +
             '</a>';
    }).join("");
  }
  return '<div class="f-sec charm-sec" style="--gem:' + o.gem + '">' +
           '<h3>' + o.title + '</h3>' +
           '<p>' + o.text + '</p>' +
           '<div class="charm-label">身につけるなら<span class="charm-pr">PR</span></div>' +
           '<p class="charm-guide">気になるものを選ぶと、楽天市場で' + o.name + 'のアイテムが一覧で見られます。参考にぜひご覧ください。</p>' +
           '<div class="charm-chips">' + chips(o.types) + '</div>' +
           '<div class="charm-sub">耳元</div>' +
           '<div class="charm-chips">' + chips(o.earTypes) + '</div>' +
           '<p class="charm-note">※楽天市場の検索結果が開きます（楽天アフィリエイトを利用しています）。写真は商品の一例です。</p>' +
           '<p class="charm-credit"><a href="https://developers.rakuten.com/" target="_blank">Supported by Rakuten Developers</a></p>' +
         '</div>';
}
