/* =========================================================
   トップの入口演出（index.html）と、到着演出（select.html）
   ・入口をタップ → 魔法陣が加速回転 → 光の渦が広がり画面が光に包まれる
   　→ 選択ページへ移動。移動先では光が晴れるように表示される。
   ・ブラウザの「戻る」でトップに戻った時（bfcache 復帰を含む）は、
   　演出の状態を必ず解除する（以前の「暗転したまま戻らない」不具合の再発防止）。
   ・視差効果を減らす設定の端末では演出なしで通常どおり移動する。
   ========================================================= */
(function () {
  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var FLAG = "gate_enter";

  function cleanupEnter() {
    document.body.classList.remove("gate-entering");
    var els = document.querySelectorAll(".enter-portal, .enter-flash");
    for (var i = 0; i < els.length; i++) els[i].parentNode.removeChild(els[i]);
  }

  /* 選択ページ側：入口から来た時だけ、光が晴れる演出 */
  function arrive() {
    var came = false;
    try { came = sessionStorage.getItem(FLAG) === "1"; sessionStorage.removeItem(FLAG); } catch (e) {}
    if (!came || reduced) return;
    var el = document.createElement("div");
    el.className = "arrive-flash";
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1300);
  }

  function setupGate() {
    var gate = document.querySelector(".gate");
    if (!gate) return;
    gate.addEventListener("click", function (e) {
      if (reduced || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return; // 通常の移動に任せる
      e.preventDefault();
      if (document.body.classList.contains("gate-entering")) return;
      var href = gate.getAttribute("href");
      document.body.classList.add("gate-entering");
      var portal = document.createElement("div");
      portal.className = "enter-portal";
      var flash = document.createElement("div");
      flash.className = "enter-flash";
      document.body.appendChild(portal);
      document.body.appendChild(flash);
      try { sessionStorage.setItem(FLAG, "1"); } catch (err) {}
      setTimeout(function () { location.href = href; }, 1350);
      setTimeout(cleanupEnter, 5000);   // 万一移動しなかった時の保険
    });
  }

  /* トップのロゴの☆：ランダムな間隔（2〜6秒）で、左右または上下にくるっと反転する。
     ☆は対称な形なので、途中で一度細くつぶれてから戻る動きで「反転」が見えるようにする */
  function startStarFlip() {
    var star = document.querySelector(".logo-star");
    if (!star || reduced || !star.animate) return;
    function flipOnce() {
      var horizontal = Math.random() < 0.5;
      var mid = horizontal ? "scale(-1, 1)" : "scale(1, -1)";
      star.animate(
        [{ transform: "scale(1, 1)" }, { transform: mid }, { transform: "scale(1, 1)" }],
        { duration: 900, easing: "ease-in-out" }
      );
      setTimeout(flipOnce, 2000 + Math.random() * 4000);
    }
    setTimeout(flipOnce, 1200 + Math.random() * 1500);
  }

  window.addEventListener("pageshow", cleanupEnter);
  document.addEventListener("DOMContentLoaded", function () {
    cleanupEnter();
    setupGate();
    startStarFlip();
    arrive();
  });
})();
