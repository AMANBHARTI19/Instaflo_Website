// Returns the visitor's country so the site can route to the right
// regional pricing. Vercel injects `x-vercel-ip-country` at the edge, so no
// third-party IP lookup or visitor-IP sharing is involved.
//
// Any country other than IN is treated as USD, matching the two page variants
// we ship (India / rest of world).

module.exports = function handler(req, res) {
  const country = (
    req.headers["x-vercel-ip-country"] ||
    ""
  ).toUpperCase();

  // Never cache per-visitor geo on a shared CDN edge.
  res.setHeader("Cache-Control", "no-store, max-age=0");

  res.status(200).json({
    country: country || null,
    region: country === "IN" ? "in" : "us",
  });
};
