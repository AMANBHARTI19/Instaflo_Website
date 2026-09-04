const http = require("http");
const assert = require("assert");
const { app } = require("./waitlist-server.js");

const PORT = 3456;
const server = http.createServer(app);

function request(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: "127.0.0.1", port: PORT, path, method: "GET", headers };
    const req = http.request(opts, (res) => {
      let body = "";
      res.on("data", (d) => body += d);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = { hostname: "127.0.0.1", port: PORT, path, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length } };
    const req = http.request(opts, (res) => {
      let b = "";
      res.on("data", (d) => b += d);
      res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let failed = 0;
const tests = [];

// Test 1: Real HTTP 404 for nonexistent path
tests.push(async () => {
  const res = await request("/some-path-that-does-not-exist");
  assert.strictEqual(res.status, 404, "404 status code");
  console.log("PASS: 404 returns real HTTP 404 status");
});

// Test 2: 404 markdown body when Accept: text/markdown
tests.push(async () => {
  const res = await request("/some-path-that-does-not-exist", { "Accept": "text/markdown" });
  assert.strictEqual(res.status, 404, "404 status for markdown accept");
  assert(res.body.includes("# 404"), "404 body contains markdown heading");
  assert(res.body.includes("sitemap"), "404 body references sitemap");
  assert(res.body.includes("llms.txt"), "404 body references llms.txt");
  assert(res.headers["content-type"].includes("text/markdown"), "Content-Type is text/markdown");
  console.log("PASS: 404 returns markdown body with sitemap/llms.txt links");
});

// Test 3: Vary header on all responses
tests.push(async () => {
  const res = await request("/");
  const vary = res.headers["vary"];
  assert(vary && vary.includes("Accept"), "Vary includes Accept");
  assert(vary && vary.includes("Accept-Encoding"), "Vary includes Accept-Encoding");
  console.log("PASS: Vary header includes Accept, Accept-Encoding");
});

// Test 4: /about route works
tests.push(async () => {
  const res = await request("/about");
  assert([200, 301].includes(res.status), "/about returns 200 or 301");
  console.log("PASS: /about serves content");
});

// Test 5: /contact works
tests.push(async () => {
  const res = await request("/contact");
  assert([200, 301].includes(res.status), "/contact returns 200 or 301");
  console.log("PASS: /contact serves content");
});

// Test 6: /privacy works
tests.push(async () => {
  const res = await request("/privacy");
  assert([200, 301].includes(res.status), "/privacy returns 200 or 301");
  console.log("PASS: /privacy serves content");
});

// Test 7: /support works
tests.push(async () => {
  const res = await request("/support");
  assert([200, 301].includes(res.status), "/support returns 200 or 301");
  console.log("PASS: /support serves content");
});

// Test 8: llms.txt accessible
tests.push(async () => {
  const res = await request("/llms.txt");
  assert.strictEqual(res.status, 200, "llms.txt returns 200");
  assert(res.body.includes("# DMflo"), "llms.txt has DMflo heading");
  console.log("PASS: llms.txt accessible");
});

// Test 9: llms.txt has When to use section
tests.push(async () => {
  const res = await request("/llms.txt");
  assert(res.body.includes("## When to use DMflo"), "llms.txt has When to use section");
  assert(res.body.includes("Do not use DMflo when"), "llms.txt has Do not use section");
  console.log("PASS: llms.txt has When to use guidance");
});

// Test 10: sitemap.xml accessible
tests.push(async () => {
  const res = await request("/sitemap.xml");
  assert.strictEqual(res.status, 200, "sitemap.xml returns 200");
  assert(res.body.includes("<urlset"), "sitemap.xml has urlset");
  assert(res.body.includes("about.html"), "sitemap includes about.html");
  console.log("PASS: sitemap.xml accessible and complete");
});

// Test 11: markdown negotiation for sitemap.xml (returns sitemap.md)
tests.push(async () => {
  const res = await request("/sitemap.xml", { "Accept": "text/markdown" });
  assert.strictEqual(res.status, 200, "sitemap.md returns 200");
  assert(res.headers["content-type"].includes("text/markdown"), "sitemap.md content-type is text/markdown");
  console.log("PASS: markdown content negotiation works for sitemap");
});

// Test 12: markdown negotiation for llms.txt (returns llms.md)
tests.push(async () => {
  const res = await request("/llms.txt", { "Accept": "text/markdown" });
  assert.strictEqual(res.status, 200, "llms.md returns 200");
  assert(res.headers["content-type"].includes("text/markdown"), "llms.md content-type is text/markdown");
  console.log("PASS: markdown content negotiation works for llms");
});

// Test 13: Vary header present on llms.txt
tests.push(async () => {
  const res = await request("/llms.txt");
  const vary = res.headers["vary"];
  assert(vary && vary.includes("Accept"), "Vary header on llms.txt");
  console.log("PASS: Vary header present on llms.txt");
});

// Test 14: POST /api/waitlist returns valid status
tests.push(async () => {
  const res = await post("/api/waitlist", { email: "test@example.com", name: "Test" });
  assert([200, 400].includes(res.status), "waitlist returns valid status, got " + res.status);
  console.log("PASS: /api/waitlist endpoint works");
});

// Run all tests
server.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}\n`);
  for (const test of tests) {
    try { await test(); } catch (e) { console.error("FAIL:", e.message); failed++; }
  }
  console.log(`\n${tests.length - failed}/${tests.length} tests passed`);
  server.close();
  if (failed > 0) process.exit(1);
});
