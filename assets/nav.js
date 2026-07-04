/* =========================================================
   ページのフェードイン / フェードアウト遷移
   ・読み込み時にふわっと表示
   ・[data-transition] を持つリンクは、暗転してから移動
   ========================================================= */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 読み込み完了でフェードイン
  window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => document.body.classList.add("loaded"));
  });

  // 内部リンクは暗転してから遷移
  document.querySelectorAll("a[data-transition]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      if (reduceMotion) { location.href = href; return; }
      document.body.classList.remove("loaded");
      document.body.classList.add("leaving");
      setTimeout(() => { location.href = href; }, 850);
    });
  });

  // ブラウザの戻るで戻ってきたときに暗転したままにならないよう復帰
  window.addEventListener("pageshow", () => {
    document.body.classList.remove("leaving");
    requestAnimationFrame(() => document.body.classList.add("loaded"));
  });
})();
