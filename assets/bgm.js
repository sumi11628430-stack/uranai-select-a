/* =========================================================
   BGM（全ページ共通）
   ・トップ：最初は背景だけを表示し、画面を押すとロゴと入口が現れて
   　「ほしねこうらなぽ」（元の曲）が流れる。
   ・入口を押した後：トップのページを「土台」にしたまま、占いのページを
   　土台の上に全画面で重ねて表示する（占いページ同士の移動も重ねた画面の中）。
   　曲は土台で流し続けるので、ページを移っても途切れない。
   　元の曲から、リミックス版（小さい音量）に切り替える。
   ・アドレス欄は、見ているページに合わせて書き換える。ブラウザの「戻る」も使える。
   ・占いのページを直接開いた時（再読み込み・URL共有など）は、そのページ単体で
   　リミックスを続きの位置から流す。自動再生が止められたら、最初に押した時に流す。
   ・右下の「♪」ボタンで、いつでも止めたり流したりできる（設定は訪問中ずっと保持）。
   ========================================================= */
(function () {
  var KEY_ENTERED = "bgm_entered";   // トップで画面を押した（＝音を流してよい）
  var KEY_MUTED = "bgm_muted";       // ♪ボタンで止めた
  var KEY_POS = "bgm_remix_pos";     // リミックスの再生位置（秒）

  var SRC_TOP = "assets/audio/hoshineko.mp3";
  var SRC_REMIX = "assets/audio/hoshineko-remix.mp3";
  var VOL_TOP = 0.385;    // 元の曲（以前の0.55から3割下げ）
  var VOL_REMIX = 0.105;  // リミックス（以前の0.15から3割下げ）

  function getItem(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  function setItem(key, value) { try { sessionStorage.setItem(key, value); } catch (e) {} }

  /* ---- 重ねた画面（土台の中）で開かれたページ：音は土台に任せ、ここでは鳴らさない ---- */
  var shell = null;
  try { if (window.parent !== window && window.parent.__bgmShell) shell = window.parent.__bgmShell; } catch (e) {}
  if (shell) {
    /* 「入口へ戻る」は、重ねた画面を閉じて土台のトップを見せる */
    document.addEventListener("click", function (e) {
      var link = e.target.closest && e.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (href === "index.html" || href === "./" || href === "/") {
        e.preventDefault();
        shell.close();
      }
    }, true);
    return;
  }

  var root = document.documentElement;
  var isTop = document.body.classList.contains("top-body");

  var audio = null;
  var currentKind = null; // "top" | "remix"
  var fadeTimer = null;
  var waitingGesture = false;

  function isMuted() { return getItem(KEY_MUTED) === "1"; }

  /* 音は1つの再生部品を使い回す（スマホで、押して許可された部品をそのまま使うため） */
  function getAudio() {
    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      audio.addEventListener("play", updateButton);
      audio.addEventListener("pause", updateButton);
    }
    return audio;
  }

  function setSource(kind) {
    var a = getAudio();
    if (currentKind === kind) return a;
    currentKind = kind;
    a.src = kind === "top" ? SRC_TOP : SRC_REMIX;
    if (kind === "remix") {
      var pos = parseFloat(getItem(KEY_POS));
      if (pos > 0) {
        a.addEventListener("loadedmetadata", function () {
          if (pos < a.duration) a.currentTime = pos;
        }, { once: true });
      }
    }
    return a;
  }

  function targetVolume() { return currentKind === "top" ? VOL_TOP : VOL_REMIX; }

  function fadeTo(target, ms, done) {
    if (!audio) { if (done) done(); return; }
    clearInterval(fadeTimer);
    var start = audio.volume;
    var steps = Math.max(Math.round(ms / 50), 1);
    var i = 0;
    fadeTimer = setInterval(function () {
      i++;
      audio.volume = Math.min(Math.max(start + (target - start) * (i / steps), 0), 1);
      if (i >= steps) {
        clearInterval(fadeTimer);
        if (done) done();
      }
    }, 50);
  }

  function play(kind) {
    if (isMuted()) { updateButton(); return; }
    var a = setSource(kind || currentKind || (isTop ? "top" : "remix"));
    var p = a.play();
    if (p && p.then) {
      p.then(function () { fadeTo(targetVolume(), 1500); })
       .catch(function () { waitForGesture(); });
    } else {
      fadeTo(targetVolume(), 1500);
    }
  }

  function stop() {
    if (!audio) return;
    fadeTo(0, 400, function () { audio.pause(); });
  }

  /* 元の曲 → リミックスへ、静かに切り替える */
  function switchToRemix() {
    if (currentKind === "remix") return;
    if (!audio || audio.paused) { currentKind = null; play("remix"); return; }
    fadeTo(0, 1000, function () { play("remix"); });
  }

  /* 自動再生が止められた時：このページで最初に押した瞬間に流す */
  function waitForGesture() {
    if (waitingGesture) return;
    waitingGesture = true;
    var handler = function (e) {
      if (e.target && e.target.closest && e.target.closest(".bgm-toggle")) return;
      window.removeEventListener("pointerdown", handler, true);
      window.removeEventListener("keydown", handler, true);
      waitingGesture = false;
      play();
    };
    window.addEventListener("pointerdown", handler, true);
    window.addEventListener("keydown", handler, true);
  }

  function saveRemixPos() {
    if (audio && currentKind === "remix") setItem(KEY_POS, String(audio.currentTime || 0));
  }

  /* 右下の♪ボタン */
  var button = document.createElement("button");
  button.type = "button";
  button.className = "bgm-toggle";
  button.hidden = true;
  button.textContent = "♪";
  button.addEventListener("click", function () {
    if (audio && !audio.paused) {
      setItem(KEY_MUTED, "1");
      stop();
    } else {
      setItem(KEY_MUTED, "0");
      setItem(KEY_ENTERED, "1");
      play();
    }
  });
  document.body.appendChild(button);

  function updateButton() {
    var playing = !!audio && !audio.paused;
    button.hidden = isTop && root.classList.contains("tap-gate-open");
    button.classList.toggle("is-off", !playing);
    button.setAttribute("aria-label", playing ? "BGMを止める" : "BGMを流す");
    button.title = playing ? "BGMを止める" : "BGMを流す";
  }

  window.addEventListener("pagehide", saveRemixPos);
  setInterval(saveRemixPos, 2000);
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && getItem(KEY_ENTERED) === "1" && !isMuted() && audio && audio.paused) play();
    updateButton();
  });

  /* ---- 占いのページを直接開いた時（単体）：リミックスを続きから ---- */
  if (!isTop) {
    if (getItem(KEY_ENTERED) === "1") play("remix");
    updateButton();
    return;
  }

  /* ---- トップ：土台として、占いのページを重ねて表示する仕組み ---- */
  var topUrl = location.pathname + location.search;
  var topTitle = document.title;
  var frame = null;

  function syncFromFrame() {
    if (!frame) return;
    try {
      var doc = frame.contentDocument;
      var loc = frame.contentWindow.location;
      if (doc && doc.title) document.title = doc.title;
      history.replaceState({ bgmShell: true }, "", loc.pathname + loc.search + loc.hash);
      /* タロットのページは下に固定ボタンがあるので、♪を少し上に */
      root.classList.toggle("bgm-over-tarot", !!(doc && doc.body && doc.body.classList.contains("tarot-page-body")));
    } catch (e) {}
  }

  function openFrame(href, fromHistory) {
    if (frame) { frame.src = href; return; }
    frame = document.createElement("iframe");
    frame.className = "bgm-shell-frame";
    frame.setAttribute("title", "ねこ占ぽ");
    frame.addEventListener("load", syncFromFrame);
    frame.src = href;
    document.body.appendChild(frame);
    root.classList.add("bgm-shell-open");
    if (!fromHistory) history.pushState({ bgmShell: true }, "", href);
    switchToRemix();
  }

  function closeFrame(fromHistory) {
    if (!frame) return;
    frame.parentNode.removeChild(frame);
    frame = null;
    root.classList.remove("bgm-shell-open", "bgm-over-tarot");
    document.title = topTitle;
    if (!fromHistory) history.replaceState(null, "", topUrl);
    /* 入口の演出の後片付け（光の渦・暗転を戻す） */
    document.body.classList.remove("gate-entering");
    var fx = document.querySelectorAll(".enter-portal, .enter-flash");
    for (var i = 0; i < fx.length; i++) fx[i].parentNode.removeChild(fx[i]);
  }

  window.__bgmShell = {
    open: openFrame,
    close: function () { closeFrame(false); }
  };

  /* ブラウザの「戻る」で、最初に重ねたページより前に戻った時は、重ねた画面を閉じる */
  window.addEventListener("popstate", function (e) {
    var inShell = !!(e.state && e.state.bgmShell);
    if (frame && !inShell) closeFrame(true);
    /* 「進む」で、重ねた画面のページに戻ってきた時は開き直す */
    if (!frame && inShell) openFrame(location.pathname.split("/").pop() || "select.html", true);
  });

  /* 入口を押したら、元の曲を静かに消していく（重ねた画面が開いたらリミックスへ） */
  var gateLink = document.querySelector(".gate");
  if (gateLink) {
    gateLink.addEventListener("click", function () {
      setItem(KEY_ENTERED, "1");
      if (audio && !audio.paused && currentKind === "top") fadeTo(0, 1200);
    });
  }

  if (root.classList.contains("tap-gate-open")) {
    /* 最初は背景だけ。画面を押すとロゴと入口が現れて曲が流れる */
    var hint = document.createElement("p");
    hint.className = "tap-gate-hint";
    hint.textContent = "タップしてはじめる";
    document.body.appendChild(hint);
    var opened = false;
    var open = function (e) {
      if (opened) return;
      if (e && e.target && e.target.closest && e.target.closest(".bgm-toggle")) return;
      opened = true;
      setItem(KEY_ENTERED, "1");
      setItem("tap_gate_seen", "1");
      root.classList.remove("tap-gate-open");
      root.classList.add("tap-gate-leaving");
      setTimeout(function () { root.classList.remove("tap-gate-leaving"); if (hint.parentNode) hint.parentNode.removeChild(hint); }, 1200);
      window.removeEventListener("pointerdown", open, true);
      window.removeEventListener("keydown", open, true);
      play("top");
    };
    window.addEventListener("pointerdown", open, true);
    window.addEventListener("keydown", open, true);
  } else if (getItem(KEY_ENTERED) === "1") {
    play("top");
  }
  updateButton();
})();
