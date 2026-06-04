import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE = Path("/Users/aman/Documents/Instaflo Website")
CSS_PATH = BASE / "Instaflo Website" / "colors_and_type.css"

# Read the shared CSS
CSS = CSS_PATH.read_text()

BANNER_HTML = {
    "banner_v1_quiet_statement": """
      <div class="banner b1">
        <div class="dg"></div>
        <div class="mark-wrap">
          <svg class="mark" width="150" height="150" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.75" y="2.75" width="114.5" height="114.5" rx="28" fill="#D6F84A" stroke="#211F1C" stroke-width="5.5"></rect>
            <circle cx="60" cy="60" r="34" stroke="#211F1C" stroke-width="6"></circle>
            <circle cx="60" cy="60" r="17" stroke="#211F1C" stroke-width="6"></circle>
            <circle cx="60" cy="60" r="5.5" fill="#211F1C"></circle>
          </svg>
        </div>
        <div class="copy">
          <span class="eyebrow"><span class="dot"></span>Stealth mode · Est. 2026</span>
          <h2>Heads down.<br>Building <span class="mk">quietly</span>.</h2>
          <p class="sub">Good things take a little quiet. More soon.</p>
        </div>
      </div>
    """,

    "banner_v2_dark_badge": """
      <div class="banner b2">
        <div class="dg"></div>
        <div class="badge">
          <span class="big">Soon™</span>
          <span class="small">2026</span>
        </div>
        <div class="copy">
          <span class="mono-tag">/// currently in stealth</span>
          <h2>Something new is<br><em>in the works.</em></h2>
          <p class="sub">Small team, big plans. Watch this space.</p>
        </div>
      </div>
    """,

    "banner_v3_lime_playful": """
      <div class="banner b3">
        <div class="dg"></div>
        <div class="mark-wrap">
          <svg class="mark" width="170" height="170" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="40" stroke="#211F1C" stroke-width="6"></circle>
            <circle cx="60" cy="60" r="20" stroke="#211F1C" stroke-width="6"></circle>
            <circle cx="60" cy="60" r="6.5" fill="#211F1C"></circle>
          </svg>
        </div>
        <span class="sticker">stealth ⚡</span>
        <span class="sticker b">coming soon</span>
        <div class="copy">
          <span class="mono-tag">No name yet. On purpose.</span>
          <h2>We're building<br>something fun.</h2>
          <p class="sub">In stealth for now — the reveal's worth the wait.</p>
        </div>
      </div>
    """,
}

BANNER_CSS = """
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; padding: 0; width: 1584px; height: 396px; overflow: hidden; -webkit-font-smoothing: antialiased; }

  .dg { position: absolute; inset: 0; background-image: radial-gradient(var(--line) 1.6px, transparent 1.6px); background-size: 30px 30px; }
  .mono-tag { font: var(--text-mono); font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .mark { display: block; }

  .banner { position: absolute; top: 0; left: 0; width: 1584px; height: 396px; overflow: hidden; }

  /* V1 — mark left, copy right */
  .b1 { background: var(--paper); display: flex; align-items: center; padding: 0 110px; justify-content: flex-end; }
  .b1 .dg { -webkit-mask-image: radial-gradient(ellipse 70% 120% at 12% 50%, #000 30%, transparent 76%); mask-image: radial-gradient(ellipse 70% 120% at 12% 50%, #000 30%, transparent 76%); }
  .b1 .copy { position: relative; z-index: 1; max-width: 900px; }
  .b1 .eyebrow { display: inline-flex; align-items: center; gap: 9px; font: var(--text-label); letter-spacing: var(--track-label); text-transform: uppercase; color: var(--ink-2); border: 1.5px solid var(--ink); background: var(--surface); padding: 8px 15px; border-radius: var(--radius-pill); }
  .b1 .eyebrow .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--lime); border: 1.5px solid var(--ink); }
  .b1 h2 { font-family: var(--font-display); font-weight: 700; font-size: 58px; line-height: 1.0; letter-spacing: -0.025em; margin: 20px 0 0; white-space: nowrap; }
  .b1 h2 .mk { background: var(--lime); color: var(--on-lime); padding: 0 12px; border-radius: 8px; box-decoration-break: clone; }
  .b1 .sub { font: var(--text-body-lg); color: var(--ink-2); margin-top: 18px; max-width: 46ch; }
  .b1 .mark-wrap { position: absolute; left: 96px; top: 50%; transform: translateY(-50%) rotate(-8deg); z-index: 0; }

  /* V2 — badge left, copy right */
  .b2 { background: var(--feature); display: flex; align-items: center; padding: 0 110px; position: relative; justify-content: flex-end; }
  .b2 .dg { background-image: radial-gradient(oklch(1 0 0 / 0.10) 1.6px, transparent 1.6px); -webkit-mask-image: radial-gradient(ellipse 80% 130% at 82% 50%, #000 28%, transparent 72%); mask-image: radial-gradient(ellipse 80% 130% at 82% 50%, #000 28%, transparent 72%); }
  .b2 .copy { position: relative; z-index: 1; }
  .b2 .mono-tag { color: oklch(0.88 0.20 124); }
  .b2 h2 { font-family: var(--font-display); font-weight: 700; font-size: 62px; line-height: 0.98; letter-spacing: -0.025em; color: var(--on-dark); margin: 16px 0 0; }
  .b2 h2 em { font-style: normal; color: oklch(0.88 0.20 124); }
  .b2 .sub { font: var(--text-body-lg); color: var(--on-dark-dim); margin-top: 16px; max-width: 44ch; }
  .b2 .badge { position: absolute; left: 120px; top: 50%; transform: translateY(-50%) rotate(4deg); z-index: 2;
    display: inline-flex; flex-direction: column; align-items: center; gap: 4px;
    background: var(--lime); color: var(--on-lime); border: 2.5px solid var(--ink);
    border-radius: 22px; padding: 26px 34px; box-shadow: 6px 6px 0 oklch(0 0 0 / 0.55); }
  .b2 .badge .big { font-family: var(--font-display); font-weight: 800; font-size: 30px; letter-spacing: -0.02em; line-height: 1; }
  .b2 .badge .small { font: var(--text-mono); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }

  /* V3 — mark + stickers left, copy right */
  .b3 { background: var(--lime); display: flex; align-items: center; padding: 0 110px; position: relative; overflow: hidden; justify-content: flex-end; }
  .b3 .dg { background-image: radial-gradient(var(--on-lime) 1.5px, transparent 1.5px); background-size: 34px 34px; opacity: 0.14; -webkit-mask-image: none; mask-image: none; }
  .b3 .copy { position: relative; z-index: 1; max-width: 880px; }
  .b3 .mono-tag { color: var(--on-lime); opacity: 0.8; }
  .b3 h2 { font-family: var(--font-display); font-weight: 800; font-size: 60px; line-height: 1.0; letter-spacing: -0.03em; color: var(--on-lime); margin: 14px 0 0; white-space: nowrap; }
  .b3 .sub { font: var(--text-body-lg); color: var(--on-lime); opacity: 0.78; margin-top: 16px; max-width: 48ch; }
  .b3 .sticker { position: absolute; z-index: 2; left: 150px; top: 64px; transform: rotate(-7deg);
    font-family: var(--font-display); font-weight: 800; font-size: 16px; color: var(--paper); background: var(--violet);
    border: 2.5px solid var(--ink); border-radius: 999px; padding: 9px 18px; box-shadow: 4px 4px 0 var(--ink); }
  .b3 .sticker.b { left: 96px; right: auto; top: auto; bottom: 60px; transform: rotate(5deg); background: var(--paper); color: var(--ink); }
  .b3 .mark-wrap { position: absolute; left: 130px; top: 50%; transform: translateY(-50%) rotate(6deg); z-index: 0; opacity: 0.9; }
"""

def make_html(body_html):
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Schibsted+Grotesk:wght@400..900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
{CSS}
{BANNER_CSS}
</style>
</head>
<body>
{body_html}
</body>
</html>"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for name, body_html in BANNER_HTML.items():
            html = make_html(body_html)
            tmp = BASE / f"_tmp_{name}.html"
            tmp.write_text(html)

            page = await browser.new_page(viewport={"width": 1584, "height": 396})
            await page.goto(tmp.as_uri(), wait_until="networkidle")
            await page.evaluate("document.fonts.ready")

            out = BASE / f"{name}.png"
            await page.screenshot(path=str(out))
            await page.close()
            tmp.unlink()
            print(f"Saved: {out.name}")

        await browser.close()

asyncio.run(main())
