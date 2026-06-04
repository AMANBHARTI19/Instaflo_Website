/* Instaflo — phone demo: a Hinglish comment getting auto-replied, on loop */
(function () {
  var feeds = Array.prototype.slice.call(document.querySelectorAll(".demo-feed"));
  if (!feeds.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // each step: {t: type, html, delay before showing}
  var script = [
    { t: "them", who: "R", delay: 500, html: "Omggg this jacket 🔥🔥 <b>price kitna hai?</b> DM me pls 🙏" },
    { t: "detect", delay: 1100, html: 'Keyword matched · <span class="k">PRICE</span> <i class="ph-fill ph-circle"></i> Hinglish + English' },
    { t: "typing", delay: 800 },
    { t: "us", who: "if", delay: 1400, html: "Heyy Riya! 🧡 Yeh jacket hai <b>₹2,199</b> — limited stock mein hai abhi!" },
    { t: "us", who: "if", delay: 1000, html: "Konsa size chahiye? 🙌" },
    { t: "cta", delay: 700, options: ["S", "M", "L", "XL"] },
    { t: "them", who: "R", delay: 1400, html: "M please!! aur COD available hai kya? 👀", selectCta: "M" },
    { t: "typing", delay: 700 },
    { t: "us", who: "if", delay: 1300, html: "Yes COD available hai! ✅ Link bhej rahi hoon — <b>sirf 3 left</b> hain M mein 🔥" },
    { t: "detect", delay: 900, html: 'New lead saved <i class="ph-fill ph-check-circle"></i> auto-tagged <span class="k">hot</span>' },
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
  function cta(step) {
    var wrap = document.createElement("div");
    wrap.className = "cta-chips";
    step.options.forEach(function (label) {
      var chip = document.createElement("span");
      chip.className = "cta-chip";
      chip.textContent = label;
      wrap.appendChild(chip);
    });
    return wrap;
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
          else if (step.t === "cta") node = cta(step);
          else {
            node = bubble(step);
            if (step.selectCta) {
              var chips = feed.querySelectorAll(".cta-chip");
              chips.forEach(function (c) {
                c.classList.toggle("selected", c.textContent === step.selectCta);
              });
            }
          }
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
