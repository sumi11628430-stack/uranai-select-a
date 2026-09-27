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

  /* 入口を押した時の「転移」の効果音（ファイルを使わず、ここで作る）。
     ・ザーッと高くなっていく風の音（光の渦に吸い込まれる）
     ・キラキラと上がっていく音の粒
     ・最後に光に包まれる「シャラーン」
     BGMを♪ボタンで止めている時は鳴らさない */
  function playWarpSound() {
    try { if (sessionStorage.getItem("bgm_muted") === "1") return; } catch (e) {}
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    var ac;
    try { ac = new Ctor(); } catch (e) { return; }
    if (ac.state === "suspended" && ac.resume) ac.resume();
    var t0 = ac.currentTime + 0.02;
    var master = ac.createGain();
    master.gain.value = 0.7;
    master.connect(ac.destination);

    /* 風の音：雑音を、通す高さを上げながら大きく→消える */
    var len = Math.floor(ac.sampleRate * 1.5);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var noise = ac.createBufferSource();
    noise.buffer = buf;
    var band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.2;
    band.frequency.setValueAtTime(260, t0);
    band.frequency.exponentialRampToValueAtTime(3800, t0 + 1.25);
    var ng = ac.createGain();
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.22, t0 + 0.9);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.45);
    noise.connect(band).connect(ng).connect(master);
    noise.start(t0);
    noise.stop(t0 + 1.5);

    /* キラキラ上がっていく音の粒（ド・ミ・ソを2オクターブ） */
    var notes = [523, 659, 784, 1047, 1319, 1568, 2093];
    notes.forEach(function (f, k) {
      var t = t0 + 0.15 + k * 0.12;
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.4);
    });

    /* 光に包まれる「シャラーン」（高い和音をゆっくり消す） */
    [1047, 1319, 1568, 2637].forEach(function (f) {
      var t = t0 + 1.12;
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 1.7);
    });
    setTimeout(function () { try { ac.close(); } catch (e) {} }, 3200);
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
      playWarpSound();
      /* 光の渦と白い光は、魔法陣（入口）の中心から広がるようにする */
      var rect = gate.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var portal = document.createElement("div");
      portal.className = "enter-portal";
      portal.style.left = cx + "px";
      portal.style.top = cy + "px";
      var flash = document.createElement("div");
      flash.className = "enter-flash";
      flash.style.setProperty("--fx-x", cx + "px");
      flash.style.setProperty("--fx-y", cy + "px");
      document.body.appendChild(portal);
      document.body.appendChild(flash);
      try { sessionStorage.setItem(FLAG, "1"); } catch (err) {}
      setTimeout(function () {
        /* BGMの土台（assets/bgm.js）があれば、ページを移らずに占いのページを重ねて開く（曲が途切れない） */
        if (window.__bgmShell) {
          window.__bgmShell.open(href);
          setTimeout(cleanupEnter, 250);
        } else {
          location.href = href;
        }
      }, 1350);
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
