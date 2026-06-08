const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID  = process.env.NOTION_DB_ID;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, handle, tier } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required." });

  const cleanHandle = handle ? handle.replace(/^@/, "") : "";
  const validTiers  = ["Up to 50K", "Up to 100K", "Up to 500K", "Up to 1M", "1M+"];
  const safeTier    = validTiers.includes(tier) ? tier : null;

  try {
    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        Name: { title: [{ text: { content: name || email } }] },
        Email: { email },
        "Instagram Handle": { rich_text: [{ text: { content: cleanHandle } }] },
        ...(safeTier && { "Follower Tier": { select: { name: safeTier } } })
      }
    });

    console.log(`[waitlist] New signup: ${email} (${safeTier || "no tier"})`);
    res.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] Notion error:", err.message);
    res.status(500).json({ error: "Failed to save. Please try again." });
  }
};
