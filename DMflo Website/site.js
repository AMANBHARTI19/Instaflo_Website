/* DMflo site — shared behavior: mobile nav, waitlist, year, active nav, scroll-reveal */
(function () {
  function bind() {

    // ---- mobile nav ----
    var burger = document.querySelector("[data-burger]");
    var links = document.querySelector(".nav-links");
    if (burger && links) {
      burger.addEventListener("click", function (e) {
        e.stopPropagation();
        links.classList.toggle("open");
      });
      // close when clicking outside
      document.addEventListener("click", function (e) {
        if (links.classList.contains("open") && !links.contains(e.target) && e.target !== burger) {
          links.classList.remove("open");
        }
      });
      // close when a link is tapped
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { links.classList.remove("open"); });
      });
    }

    // ---- active nav link (highlight current page) ----
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("#")[0];
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });

    // ---- waitlist forms ----
    document.querySelectorAll("[data-waitlist]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = form.parentElement.querySelector(".wl-ok") || form.querySelector(".wl-ok");
        if (ok) ok.classList.add("show");
        form.style.display = "none";
      });
    });

    // ---- monthly / yearly billing toggle ----
    var billBtns = document.querySelectorAll(".bill-toggle [data-bill]");
    if (billBtns.length) {
      var setBilling = function (mode) {
        var yearly = mode === "yearly";

        billBtns.forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-bill") === mode ? "true" : "false");
        });

        var caption = document.querySelector("[data-bill-caption]");
        if (caption) {
          caption.textContent = yearly
            ? "Billed once a year · save 20%"
            : "Billed every month · cancel anytime";
        }

        document.querySelectorAll(".tier .price-row[data-price-m]").forEach(function (row) {
          var tier = row.closest(".tier");
          var price = row.querySelector(".price");
          var usd = tier.querySelector(".usd");
          var sub = tier.querySelector(".bill-sub");
          var was = row.querySelector(".was");

          if (price) price.textContent = row.getAttribute(yearly ? "data-price-y" : "data-price-m");
          if (usd) usd.textContent = row.getAttribute(yearly ? "data-usd-y" : "data-usd-m");
          if (sub) sub.textContent = yearly ? (row.getAttribute("data-sub-y") || "") : "";

          // struck-through monthly price, shown only on the yearly view
          if (yearly) {
            if (!was) {
              was = document.createElement("span");
              was.className = "was";
              row.insertBefore(was, price);
            }
            was.textContent = row.getAttribute("data-price-m");
          } else if (was) {
            was.remove();
          }
        });
      };

      billBtns.forEach(function (b) {
        b.addEventListener("click", function () { setBilling(b.getAttribute("data-bill")); });
      });
      setBilling("yearly");
    }

    // ---- footer year ----
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();

    // ---- scroll-reveal ----
    if ("IntersectionObserver" in window) {
      var revealEls = document.querySelectorAll(".fcard, .step, .band-stat, .frow, .tier, .trow:not(.head)");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("revealed");
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) {
        el.classList.add("reveal");
        io.observe(el);
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

/* hero mode toggle (self / agent) + MCP endpoint copy */
(function () {
  var hero = document.querySelector('.hero[data-mode]');
  if (hero) {
    var stored = null;
    try { stored = localStorage.getItem('dmflo-hero-mode'); } catch (e) {}
    if (stored === 'agent' || stored === 'self') setMode(stored);
    hero.querySelectorAll('[data-mode-btn]').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode-btn')); });
    });
    function setMode(m) {
      hero.setAttribute('data-mode', m);
      hero.querySelectorAll('[data-mode-btn]').forEach(function (b) {
        var on = b.getAttribute('data-mode-btn') === m;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      try { localStorage.setItem('dmflo-hero-mode', m); } catch (e) {}
    }
  }
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText(btn.getAttribute('data-copy'));
      var s = btn.querySelector('span'); if (!s) return;
      var t = s.textContent; s.textContent = 'Copied'; setTimeout(function () { s.textContent = t; }, 1400);
    });
  });
})();

/* MCP page: Claude / ChatGPT guide tabs */
(function () {
  var tabs = document.querySelector('.guide-tabs');
  if (!tabs) return;
  tabs.querySelectorAll('[data-guide-btn]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-guide-btn');
      tabs.querySelectorAll('[data-guide-btn]').forEach(function (o) {
        var on = o === b;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      document.querySelectorAll('[data-guide]').forEach(function (g) {
        g.hidden = g.getAttribute('data-guide') !== k;
      });
    });
  });
})();

/* Screenshot lightbox */
(function(){
  var shots = document.querySelectorAll('.gshot img');
  if(!shots.length) return;
  var box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('aria-hidden','true');
  box.innerHTML = '<button class="lb-x" aria-label="Close">&times;</button><img class="lb-img" alt="">';
  document.body.appendChild(box);
  var img = box.querySelector('.lb-img');
  function open(src){ img.src = src; box.classList.add('is-on'); box.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function close(){ box.classList.remove('is-on'); box.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  shots.forEach(function(s){
    s.style.cursor='zoom-in';
    s.addEventListener('click', function(){ open(s.currentSrc || s.src); });
  });
  box.addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
})();
