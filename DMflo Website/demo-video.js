/* DMflo — live product tour. Drives the real web app (demo-app/) inside an
   iframe: scripted cursor, clicks, camera zooms and headline callouts.
   Loops, pauses offscreen, honors reduced motion. */
(function () {
  var stage = document.getElementById("dvStage");
  var viewport = document.querySelector(".dv-viewport");
  var cam = document.getElementById("dvCam");
  var frame = document.getElementById("dvFrame");
  var cursor = document.getElementById("dvCursor");
  if (!stage || !viewport || !cam || !frame) return;

  var W = 1140, H = 680;          // stage size
  var AW = 1440, AH = 860;        // app (iframe) size
  var BASE = W / AW;              // fit-width scale
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scale stage to container ---------- */
  function fit() {
    var w = viewport.clientWidth;
    var s = Math.min(1, w / W);
    stage.style.transform = "scale(" + s + ")";
    viewport.style.height = (H * s) + "px";
  }
  window.addEventListener("resize", fit);
  fit();

  /* ---------- camera ---------- */
  // Focus the camera on app-space point (fx, fy) at zoom Z (1 = fit width).
  function camTo(fx, fy, Z) {
    var E = BASE * Z;
    var tx = W / 2 - fx * E;
    var ty = H / 2 - fy * E;
    tx = Math.min(0, Math.max(W - AW * E, tx));
    ty = Math.min(0, Math.max(H - AH * E, ty));
    cam.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + E + ")";
  }

  /* ---------- cursor ---------- */
  function curTo(x, y) { cursor.style.transform = "translate(" + x + "px," + y + "px)"; }
  function click() {
    cursor.classList.remove("click");
    void cursor.offsetWidth;
    cursor.classList.add("click");
  }

  /* ---------- app control ---------- */
  function nav(r) {
    try { if (frame.contentWindow && frame.contentWindow.__nav) frame.contentWindow.__nav(r); } catch (e) {}
  }
  function demo(fn) {
    try { if (frame.contentWindow && frame.contentWindow.__demo) frame.contentWindow.__demo[fn](); } catch (e) {}
  }
  function prepFrame() {
    try {
      var doc = frame.contentDocument;
      if (!doc || doc.getElementById("dv-inject")) return;
      var st = doc.createElement("style");
      st.id = "dv-inject";
      st.textContent = "::-webkit-scrollbar{display:none!important} *{scrollbar-width:none!important} body{overflow:hidden}";
      doc.head && doc.head.appendChild(st);
    } catch (e) {}
  }

  /* ---------- overlays ---------- */
  function $(id) { return document.getElementById(id); }
  var callout = $("dvCallout"), calloutK = $("dvCalloutK"), calloutH = $("dvCalloutH");
  function say(kick, head) {
    calloutK.textContent = kick;
    calloutH.textContent = head;
    callout.classList.add("on");
  }
  function hush() { callout.classList.remove("on"); }
  function title(id, show) { var el = $(id); if (el) el.classList.toggle("on", show); }

  var steps = Array.prototype.slice.call(document.querySelectorAll(".dv-step"));
  function setStep(i) { steps.forEach(function (s, j) { s.classList.toggle("on", j === i); }); }

  /* ---------- timeline ---------- */
  // Sidebar nav coords (app space) and content focus points.
  var NAV = { automations: [126, 179], agents: [126, 261], inbox: [126, 302], analytics: [126, 344] };

  var events = [
    // scene 0 · intro card
    [0,     function () { title("dvT1", true); title("dvT2", false); hush(); cursor.classList.remove("show"); nav("home"); camTo(AW / 2, AH / 2, 1); curTo(700, 620); setStep(0); }],
    [2500,  function () { title("dvT1", false); cursor.classList.add("show"); prepFrame(); }],
    // scene 1 · home
    [3100,  function () { say("Every morning", "Wake up to work already done."); curTo(640, 330); camTo(700, 300, 1.45); }],
    [6300,  function () { hush(); camTo(AW / 2, AH / 2, 1); curTo(NAV.automations[0], NAV.automations[1]); }],
    // scene 2 · comment → DM journey: new automation → template → flow builder
    [7400,  function () { click(); nav("automations"); setStep(1); }],
    [7900,  function () { say("Comment → DM", "\u201CPrice?\u201D under a reel becomes a DM, instantly."); curTo(1351, 38); camTo(1000, 200, 1.2); }],
    [9800,  function () { click(); demo("newFlow"); }],
    [10300, function () { say("Start a new automation", "Pick the Comment to DM template."); camTo(720, 430, 1.15); curTo(402, 474); }],
    [12600, function () { click(); demo("pickComment"); }],
    [13100, function () { say("Your flow, ready-made", "Keyword → reply → DM with your link. Publish."); camTo(760, 340, 1.25); curTo(780, 380); }],
    [16300, function () { hush(); camTo(AW / 2, AH / 2, 1); curTo(NAV.agents[0], NAV.agents[1]); }],
    // scene 3 · agents
    [17400, function () { click(); nav("agents"); setStep(2); }],
    [17900, function () { say("Meet the team", "Brief your agents in plain English."); camTo(760, 300, 1.4); curTo(820, 330); }],
    [21100, function () { hush(); camTo(AW / 2, AH / 2, 1); curTo(NAV.inbox[0], NAV.inbox[1]); }],
    // scene 4 · inbox
    [22200, function () { click(); nav("inbox"); setStep(3); }],
    [22700, function () { say("Replies that sell", "Your voice. Their language. 24/7."); camTo(1080, 400, 1.5); curTo(1120, 430); }],
    [25900, function () { hush(); camTo(AW / 2, AH / 2, 1); curTo(NAV.analytics[0], NAV.analytics[1]); }],
    // scene 5 · analytics
    [27000, function () { click(); nav("analytics"); setStep(4); }],
    [27500, function () { say("The receipts", "See what the team got done."); camTo(720, 300, 1.35); curTo(500, 260); }],
    [30700, function () { hush(); camTo(AW / 2, AH / 2, 1); }],
    // outro
    [31500, function () { title("dvT2", true); cursor.classList.remove("show"); }]
  ];
  var TOTAL = 34500;
  var SCENES = [0, 6300, 16300, 21100, 25900];

  var timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function run(fromT) {
    clearTimers();
    // catch up instantly (no transitions), then play
    cam.style.transition = "none";
    cursor.style.transition = "none";
    events.forEach(function (ev) { if (ev[0] <= fromT) ev[1](); });
    void cam.offsetWidth;
    cam.style.transition = "";
    cursor.style.transition = "";
    events.forEach(function (ev) {
      if (ev[0] > fromT) timers.push(setTimeout(ev[1], ev[0] - fromT));
    });
    timers.push(setTimeout(function () { run(0); }, TOTAL - fromT));
  }

  function showStatic() {
    title("dvT1", false); title("dvT2", false);
    cursor.classList.remove("show");
    nav("home"); camTo(AW / 2, AH / 2, 1);
    say("DMflo", "The team that runs your Instagram.");
    setStep(0);
  }

  /* ---------- step chips jump between scenes ---------- */
  steps.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      if (reduce) return;
      run(SCENES[i]);
    });
  });

  /* ---------- start once the app inside the iframe is ready ---------- */
  var started = false;
  function ready(cb) {
    var tries = 0;
    (function poll() {
      var ok = false;
      try { ok = !!(frame.contentWindow && frame.contentWindow.__nav); } catch (e) {}
      if (ok) return cb();
      if (++tries > 100) return cb(); // start anyway
      setTimeout(poll, 200);
    })();
  }

  function begin() {
    if (started) return;
    started = true;
    ready(function () {
      prepFrame();
      if (reduce) { showStatic(); return; }
      var playing = false;
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && !playing) { playing = true; run(0); }
            else if (!en.isIntersecting && playing) { playing = false; clearTimers(); }
          });
        }, { threshold: 0.25 });
        io.observe(viewport);
      } else { run(0); }
    });
  }

  if (frame.contentDocument && frame.contentDocument.readyState === "complete") begin();
  frame.addEventListener("load", begin);
  setTimeout(begin, 4000); // safety net
})();
