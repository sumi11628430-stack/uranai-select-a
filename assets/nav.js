/* =========================================================
   ページ遷移について
   ・リンクは通常のブラウザ遷移に任せる（独自のフェードアウトは
     「暗転したまま戻らない」不具合を避けるため撤去）。
   ・古いキャッシュ由来で残った可能性のある状態クラスを、
     念のため読み込み時に除去する（無害な保険）。
   ========================================================= */
(function () {
  function cleanup() {
    document.body.classList.remove("leaving", "loaded");
  }
  window.addEventListener("pageshow", cleanup);
  document.addEventListener("DOMContentLoaded", cleanup);
})();
