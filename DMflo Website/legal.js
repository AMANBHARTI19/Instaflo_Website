/* DMflo — doc pages: TOC scroll-spy (active section highlight + smooth jump) */
(function () {
  function init() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".doc-toc a"));
    if (!links.length) return;
    var sections = links
      .map(function (a) { var id = a.getAttribute("href"); return id && id.charAt(0) === "#" ? document.querySelector(id) : null; })
      .filter(Boolean);
    if (!sections.length) return;

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var a = byId[e.target.id];
          if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });

    sections.forEach(function (s) { obs.observe(s); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
