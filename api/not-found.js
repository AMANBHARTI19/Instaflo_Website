module.exports = async function handler(req, res) {
  const base = "https://trydmflo.com";
  const md =
    "# 404 — Not Found\n\n"
    + "This path does not exist on DMflo.\n\n"
    + "See [sitemap](" + base + "/sitemap.xml), [llms.txt](" + base + "/llms.txt), or the [docs index](" + base + "/).\n";
  res.setHeader("Vary", "Accept, Accept-Encoding");
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.status(404).send(md);
};
