/**
 * DMflo Waitlist Server
 * Serves the static site
 *
 * Setup:
 *   1. npm install
 *   2. node waitlist-server.js
 *   3. Open http://localhost:3000
 */

require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const SITE_DIR = path.join(__dirname, "DMflo Website");

// ---- Content negotiation: Accept: text/markdown ----
app.use((req, res, next) => {
  res.setHeader("Vary", "Accept, Accept-Encoding");
  const accept = req.headers.accept || "";
  if (accept.includes("text/markdown")) {
    let clean = req.path.replace(/^\//, "");
    clean = clean.replace(/\.html$/, "").replace(/\.xml$/, "").replace(/\.txt$/, "");
    const mdPath = path.join(SITE_DIR, clean + ".md");
    if (fs.existsSync(mdPath)) {
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      return res.status(200).send(fs.readFileSync(mdPath, "utf8"));
    }
  }
  next();
});

app.use(express.json());
app.use(express.static(SITE_DIR));

// ---- Redirect /about, /contact, /privacy to .html ----
["about", "contact", "privacy", "support", "terms", "features", "pricing", "mcp", "sitemap", "llms"].forEach(function (page) {
  app.get("/" + page, function (req, res) {
    res.redirect(301, "/" + page + (page === "sitemap" ? ".xml" : page === "llms" ? ".txt" : ".html"));
  });
});

// ---- POST /api/waitlist ----
app.post("/api/waitlist", async (req, res) => {
  const { name, email, handle, tier, accountType } = req.body || {};

  if (!email) return res.status(400).json({ error: "Email is required." });

  console.log(`[waitlist] New signup: ${email}`);
  res.json({ ok: true });
});

// ---- Agent-friendly 404 with markdown body ----
app.use((req, res) => {
  res.status(404);
  const accept = req.headers.accept || "";
  if (accept.includes("text/markdown")) {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(
      "# 404 — Page Not Found\n\n"
      + "This path does not exist on DMflo.\n\n"
      + "Try these instead:\n\n"
      + "- [Home](https://trydmflo.com/)\n"
      + "- [Features](https://trydmflo.com/features.html)\n"
      + "- [Pricing](https://trydmflo.com/pricing.html)\n"
      + "- [About](https://trydmflo.com/about.html)\n"
      + "- [Contact](https://trydmflo.com/contact.html)\n"
      + "- [Privacy](https://trydmflo.com/privacy.html)\n"
      + "- [Support](https://trydmflo.com/support.html)\n"
      + "- [Sitemap](https://trydmflo.com/sitemap.xml)\n"
      + "- [llms.txt](https://trydmflo.com/llms.txt)\n"
    );
  } else {
    res.sendFile(path.join(SITE_DIR, "404.html"));
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  DMflo running at http://localhost:${PORT}\n`);
  });
}

module.exports = { app };
