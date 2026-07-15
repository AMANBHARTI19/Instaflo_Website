/* DMflo — phone demo: the agent team selling + capturing a lead, on loop */
(function () {
  var feeds = Array.prototype.slice.call(document.querySelectorAll(".demo-feed"));
  if (!feeds.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // each step: {t: type, html, delay before showing}
  var script = [
    { t: "them", who: "R", delay: 500, html: "Omggg this kurta 🔥🔥 <b>how much is it?</b> do you have COD? 🙏" },
    { t: "detect", delay: 1100, html: 'Sales agent · intent <span class="k">BUYING</span>' },
    { t: "typing", delay: 800 },
    { t: "us", who: "if", delay: 1400, html: "Heyy! 💚 This kurta is <b>₹1,299</b> and COD is available. Tell me your size and I'll send the link 👇" },
    { t: "them", who: "R", delay: 1300, html: "Size M!! please send the link 🥺" },
    { t: "us", who: "if", delay: 1300, html: "Done ✨ riya.style/kurta-m — order it and tag us in your story 😉" },
    { t: "detect", delay: 1100, html: 'Lead captured <i class="ph-fill ph-check-circle"></i> · Moderation agent hid <span class="k">2 spam</span> comments' },
  ];

  function bubble(step) {
    var row = document.createElement("div");
    row.className = "demo-row " + (step.t === "us" ? "us" : "them");
    var ava = document.createElement("div");
    ava.className = "b-ava";
    if (step.who === "if") ava.textContent = "if"; else ava.textContent = step.who || "?";
    var b = document.createElement("div");
    b.className = "bubble";
    b.innerHTML = step.html;
    row.appendChild(ava); row.appendChild(b);
    return row;
  }
  function detect(step) {
    var d = document.createElement("div");
    d.className = "tag-detect";
    d.innerHTML = step.html;
    return d;
  }
  function typing() {
    var row = document.createElement("div");
    row.className = "demo-row us typing-row";
    var ava = document.createElement("div");
    ava.className = "b-ava"; ava.textContent = "if";
    var b = document.createElement("div");
    b.className = "bubble";
    b.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    row.appendChild(ava); row.appendChild(b);
    return row;
  }

  function controller(feed) {
    var timers = [];
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function run() {
      feed.innerHTML = "";
      var acc = 0;
      var lastTyping = null;
      script.forEach(function (step) {
        acc += step.delay;
        timers.push(setTimeout(function () {
          if (lastTyping) { lastTyping.remove(); lastTyping = null; }
          var node;
          if (step.t === "detect") node = detect(step);
          else if (step.t === "typing") { node = typing(); lastTyping = node; }
          else node = bubble(step);
          feed.appendChild(node);
          feed.scrollTop = feed.scrollHeight;
        }, acc));
      });
      if (!reduce) timers.push(setTimeout(run, acc + 3400));
    }
    return { run: function () { clearTimers(); run(); }, stop: clearTimers };
  }

  feeds.forEach(function (feed) {
    var ctl = controller(feed);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) ctl.run(); else ctl.stop();
        });
      }, { threshold: 0.2 });
      io.observe(feed);
    } else { ctl.run(); }
  });
})();
