/* Instaflo site — shared behavior: theme, mobile nav, waitlist, year, active nav, scroll-reveal */
(function () {
  // ---- theme (persisted, shared across pages) ----
  var KEY = "instaflo-theme";
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
    else root.setAttribute("data-theme", "light");
  } catch (e) {}

  function bind() {
    // ---- theme toggle ----
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });

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
