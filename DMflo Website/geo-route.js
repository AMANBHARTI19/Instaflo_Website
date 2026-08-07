/* ---------------------------------------------------------------------------
   Regional pricing routing.

   The site ships two variants of every page that quotes a price:
     index.html      / pricing.html      -> INR, for India
     index-us.html   / pricing-us.html   -> USD, for everywhere else

   This script decides which variant a visitor should be on and redirects if
   they landed on the wrong one. Order of decisions:

     1. ?region=in|us in the URL wins, and is remembered. This keeps shared
        links stable and gives support a way to reproduce either variant.
     2. A previously resolved region in localStorage is reused, so a visitor is
        only ever redirected once.
     3. Otherwise ask /api/geo, which reads Vercel's edge geo header.

   A timezone guess runs first as an instant hint so most visitors never see a
   redirect at all; the API result is authoritative and corrects it if needed.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  var STORE_KEY = "dmflo-region";
  var PAGES = { "index": 1, "pricing": 1 };

  // --- where are we? ------------------------------------------------------
  var path = location.pathname;
  var file = path.substring(path.lastIndexOf("/") + 1).replace(/\.html$/, "");
  if (file === "") file = "index";

  var isUsVariant = /-us$/.test(file);
  var base = isUsVariant ? file.replace(/-us$/, "") : file;

  // Only the pages that actually quote prices participate.
  if (!PAGES[base]) return;

  var currentRegion = isUsVariant ? "us" : "in";

  // --- helpers ------------------------------------------------------------
  function store(region) {
    try { localStorage.setItem(STORE_KEY, region); } catch (e) {}
  }

  function stored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }

  function urlFor(region) {
    var target = region === "us" ? base + "-us.html" : base + ".html";
    // Keep the visitor's place on the page and any campaign params.
    return target + location.search + location.hash;
  }

  function go(region) {
    if (region === currentRegion) return;
    store(region);
    location.replace(urlFor(region));
  }

  // --- 1. explicit override in the URL ------------------------------------
  var forced = null;
  var m = location.search.match(/[?&]region=(in|us)\b/i);
  if (m) forced = m[1].toLowerCase();

  if (forced) {
    store(forced);
    go(forced);
    return;
  }

  // --- 2. already resolved on a previous visit ----------------------------
  var remembered = stored();
  if (remembered === "in" || remembered === "us") {
    go(remembered);
    return;
  }

  // --- 3. instant local guess, then confirm with the edge ------------------
  // Asia/Kolkata is the only timezone for India, so this is a strong hint. It
  // is only used to skip an obviously-wrong first paint, never to conclude.
  var guess = null;
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") guess = "in";
  } catch (e) {}

  if (guess && guess !== currentRegion) {
    // Don't remember a guess: the API call on the next page load decides.
    location.replace(urlFor(guess));
    return;
  }

  fetch("/api/geo", { credentials: "omit" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.region) return;   // unknown geo: leave them be
      store(data.region);
      go(data.region);
    })
    .catch(function () { /* offline or blocked: current variant stands */ });
})();
