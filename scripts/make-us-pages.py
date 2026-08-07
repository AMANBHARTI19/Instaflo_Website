"""Generate the USD variants of index.html and pricing.html.

    python3 scripts/make-us-pages.py

Rewrites index-us.html / pricing-us.html from the INR originals so the pair
stays in sync. Edit the INR page, re-run this, done — never hand-edit a *-us
page, it gets overwritten.

Exits non-zero if any rupee amount has no USD mapping, so a half-converted
page can't ship.
"""
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parent.parent / "DMflo Website"

# Monthly / yearly pairs, INR -> USD.
#   Pro:     Rs599 -> $15   |  Rs499 -> $12
#   Agentic: Rs1,999 -> $35 |  Rs1,499 -> $29
# Yearly totals are 12x the yearly monthly-equivalent; savings = 12*(m - y).
REPLACEMENTS = [
    # --- long strings first, so shorter ones can't eat them ---------------

    # meta descriptions
    ("Three flat plans: Free to start, Pro from ₹499/month, Agentic from ₹1,499/month.",
     "Three flat plans: Free to start, Pro from $12/month, Agentic from $29/month."),

    # pricing.html bill-sub lines
    ("₹5,988 billed yearly · save ₹1,200",
     "$144 billed yearly · save $36"),
    ("₹17,988 billed yearly · save ₹6,000",
     "$348 billed yearly · save $72"),

    # index.html still carries a ".usd" secondary line under each card price.
    # pricing.html no longer does — its cards show price + bill-sub only.
    ("₹599/mo if billed monthly", "$15/mo if billed monthly"),
    ("₹1,999/mo if billed monthly", "$35/mo if billed monthly"),

    # FAQ answer (appears in both visible copy and JSON-LD, both encodings)
    ("Pro is ₹599/month (₹499 billed yearly) and Agentic is ₹1,999/month (₹1,499 billed yearly).",
     "Pro is $15/month ($12 billed yearly) and Agentic is $35/month ($29 billed yearly)."),
    ("Pro is &#8377;599/month (&#8377;499 billed yearly) and Agentic is &#8377;1,999/month (&#8377;1,499 billed yearly).",
     "Pro is $15/month ($12 billed yearly) and Agentic is $35/month ($29 billed yearly)."),

    # comparison table rows on index.html
    ("Flat: ₹0, ₹599 or ₹1,999 a month", "Flat: $0, $15 or $35 a month"),
    ("20% off, ₹499 and ₹1,499 a month", "20% off, $12 and $29 a month"),

    # JSON-LD offer descriptions
    ("Flat monthly. No per-contact billing. ₹499/month billed yearly.",
     "Flat monthly. No per-contact billing. $12/month billed yearly."),
    ("Flat monthly. No per-contact billing. ₹1,499/month billed yearly.",
     "Flat monthly. No per-contact billing. $29/month billed yearly."),

    # closing note on pricing.html
    ("Prices in INR.", "Prices in USD."),

    # --- data-* price attributes -----------------------------------------
    ('data-price-m="₹599" data-price-y="₹499"',
     'data-price-m="$15" data-price-y="$12"'),
    ('data-price-m="₹1,999" data-price-y="₹1,499"',
     'data-price-m="$35" data-price-y="$29"'),

    # --- JSON-LD numeric price fields ------------------------------------
    ('"price": "599",  "priceCurrency": "INR"', '"price": "15",  "priceCurrency": "USD"'),
    ('"price": "1999", "priceCurrency": "INR"', '"price": "35", "priceCurrency": "USD"'),
    ('"price": "0",    "priceCurrency": "INR"', '"price": "0",    "priceCurrency": "USD"'),

    # --- bare price spans, longest numbers first -------------------------
    ("₹1,999", "$35"),
    ("₹1,499", "$29"),
    ("₹599", "$15"),
    ("₹499", "$12"),
    ("₹0", "$0"),
]

# Internal links that must point at the sibling US page.
LINK_REWRITES = [
    ('href="pricing.html"', 'href="pricing-us.html"'),
    ('href="index.html"', 'href="index-us.html"'),
    ('href="index.html#', 'href="index-us.html#'),
    # JSON-LD offer urls
    ('"url": "https://trydmflo.com/pricing.html"',
     '"url": "https://trydmflo.com/pricing-us.html"'),
]


def build(src_name, out_name, canonical_slug):
    src = SITE / src_name
    text = src.read_text(encoding="utf-8")

    for old, new in REPLACEMENTS:
        text = text.replace(old, new)

    for old, new in LINK_REWRITES:
        text = text.replace(old, new)

    # The INR page stays the canonical target for the pair, so the two variants
    # never compete for the same query. Point this page's canonical at it and
    # keep the variant out of the index.
    #
    # index.html canonicalises to the bare domain ("/"), pricing.html to
    # "/pricing.html", so both shapes need handling.
    text = re.sub(
        r'<link rel="canonical" href="[^"]*">',
        '<link rel="canonical" href="https://trydmflo.com/'
        + ("" if canonical_slug == "index" else canonical_slug + ".html")
        + '">',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta property="og:url" content="[^"]*">',
        '<meta property="og:url" content="https://trydmflo.com/'
        + ("" if canonical_slug == "index" else canonical_slug + ".html")
        + '">',
        text,
        count=1,
    )

    # geo-route.js is already in the source page's <head>, so it carries over
    # with the copy — nothing to add here.
    text = text.replace(
        "</head>",
        '<meta name="robots" content="noindex, follow">\n</head>',
        1,
    )

    # Leftover rupee sign means a price we didn't map. Fail loudly rather than
    # shipping a page with mixed currencies.
    leftovers = [
        line for line in text.splitlines()
        if "₹" in line and "lm-msg" not in line
    ]
    if leftovers:
        print(f"!! {out_name}: unmapped INR value(s):", file=sys.stderr)
        for line in leftovers:
            print("   " + line.strip()[:120], file=sys.stderr)
        return False

    (SITE / out_name).write_text(text, encoding="utf-8")
    print(f"ok: {out_name}")
    return True


ok = True
ok &= build("index.html", "index-us.html", "index")
ok &= build("pricing.html", "pricing-us.html", "pricing")
sys.exit(0 if ok else 1)
