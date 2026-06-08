/**
 * Instaflo Waitlist Server
 * Serves the static site and handles POST /api/waitlist → Notion DB
 *
 * Setup:
 *   1. npm install (installs express + @notionhq/client)
 *   2. Create a .env file with:
 *        NOTION_TOKEN=secret_xxxxx
 *        NOTION_DB_ID=c271e2bf2f7c455e9587d8c599d16fb2
 *   3. node waitlist-server.js
 *   4. Open http://localhost:3000
 */

require("dotenv").config();
const express  = require("express");
const path     = require("path");
const { Client } = require("@notionhq/client");

const app    = express();
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID  = process.env.NOTION_DB_ID || "c271e2bf2f7c455e9587d8c599d16fb2";
const PORT   = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "Instaflo Website")));

// ---- POST /api/waitlist ----
app.post("/api/waitlist", async (req, res) => {
  const { name, email, handle, tier, accountType } = req.body || {};

  if (!email) return res.status(400).json({ error: "Email is required." });

  const cleanHandle     = handle ? handle.replace(/^@/, "") : "";
  const validTiers      = ["Up to 50K", "Up to 100K", "Up to 500K", "Up to 1M", "1M+"];
  const safeTier        = validTiers.includes(tier) ? tier : null;
  const validTypes      = ["Creator", "Brand", "Agency"];
  const safeAccountType = validTypes.includes(accountType) ? accountType : null;

  try {
    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        Name: { title: [{ text: { content: name || email } }] },
        Email: { email: email },
        "Instagram Handle": { rich_text: [{ text: { content: cleanHandle } }] },
        ...(safeTier        && { "Follower Tier": { select: { name: safeTier } } }),
        ...(safeAccountType && { "Account Type": { select: { name: safeAccountType } } })
      }
    });

    console.log(`[waitlist] New signup: ${email} (${safeAccountType || "no type"}, ${safeTier || "no tier"})`);
    res.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] Notion error:", err.message);
    res.status(500).json({ error: "Failed to save. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Instaflo running at http://localhost:${PORT}\n`);
});
