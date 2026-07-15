// Instaflo Calm — Analytics
// Focused view: five headline metrics, a line-chart trend, per-flow
// performance and the posts driving the most DMs.

// ---- helpers --------------------------------------------------------------
function fmtK(n) {
  n = Math.round(n);
  if (n >= 1000) { const k = n / 1000; return (k >= 10 ? Math.round(k) : k.toFixed(1)) + "k"; }
  return n.toLocaleString();
}

// deterministic little series generator so the trend feels real & stable
function buildSeries(metric, period) {
  const cfg = {
    dms:     { base: 1770, spread: 620, seed: 7,  unit: "DMs sent" },
    clicks:  { base: 630,  spread: 250, seed: 19, unit: "link clicks" },
    reached: { base: 1380, spread: 480, seed: 41, unit: "accounts reached" },
  }[metric];

  const chart = {
    "1d":  { n: 8,  per: 1 / 7, sMul: 1, lbl: i => ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"][i] },
    "7d":  { n: 7,  per: 1,     sMul: 1, lbl: i => ["M", "T", "W", "T", "F", "S", "S"][i] },
    "15d": { n: 15, per: 1,     sMul: 4, lbl: i => ((i + 1) % 3 === 0) ? String(i + 1) : "" },
    "30d": { n: 30, per: 1,     sMul: 2, lbl: i => ((i + 1) % 5 === 0) ? String(i + 1) : "" },
    "60d": { n: 15, per: 4,     sMul: 5, lbl: i => ((i + 1) % 3 === 0) ? String((i + 1) * 4) : "" },
    "90d": { n: 13, per: 7,     sMul: 3, lbl: i => "W" + (i + 1) },
  }[period] || { n: 7, per: 1, sMul: 1, lbl: i => ["M", "T", "W", "T", "F", "S", "S"][i] };

  let s = cfg.seed * chart.sMul + 1;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const bars = [];
  for (let i = 0; i < chart.n; i++) {
    const v = Math.max(cfg.base * 0.35, (cfg.base + (rnd() - 0.38) * cfg.spread) * chart.per);
    bars.push({ d: chart.lbl(i) || "", v: Math.round(v) });
  }
  const maxV = Math.max(...bars.map(b => b.v));
  bars.forEach(b => { if (b.v === maxV) b.peak = true; });
  const total = bars.reduce((a, b) => a + b.v, 0);
  return { bars, total, unit: cfg.unit, peakLabel: bars.find(b => b.peak).d };
}

// smooth path via catmull-rom → bezier
function smoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// measures its container so the SVG uses real pixel coords (crisp strokes/dots)
function useWidth() {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(entries => setW(entries[0].contentRect.width));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function LineChart({ series, mounted }) {
  const [ref, w] = useWidth();
  const H = 190, padT = 18, padB = 26, padX = 10;
  const bars = series.bars;
  const innerW = Math.max(w - padX * 2, 10);
  const innerH = H - padT - padB;

  const vals = bars.map(b => b.v);
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const lo = min - range * 0.28, hi = max + range * 0.22;

  const pts = bars.map((b, i) => {
    const x = padX + (bars.length === 1 ? innerW / 2 : innerW * i / (bars.length - 1));
    const y = padT + innerH * (1 - (b.v - lo) / (hi - lo));
    return { x, y, ...b };
  });

  const line = smoothPath(pts);
  const area = line + ` L ${pts[pts.length - 1].x.toFixed(2)} ${(padT + innerH).toFixed(2)} L ${pts[0].x.toFixed(2)} ${(padT + innerH).toFixed(2)} Z`;
  const showDots = bars.length <= 14;
  const gid = "lc-grad";

  // gridlines (4 rows)
  const grid = [0, 0.25, 0.5, 0.75, 1].map(t => padT + innerH * t);

  return (
    <div className="an-line" ref={ref} style={{ height: H }}>
      {w > 0 && (
        <svg width={w} height={H} className="an-line-svg">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((gy, i) => (
            <line key={i} x1={padX} y1={gy} x2={w - padX} y2={gy} className="an-line-grid" />
          ))}
          <path d={area} fill={`url(#${gid})`} style={{ opacity: mounted ? 1 : 0, transition: "opacity .8s ease .25s" }} />
          <path
            d={line} className="an-line-path" pathLength="1"
            style={{ strokeDasharray: 1, strokeDashoffset: mounted ? 0 : 1, transition: "stroke-dashoffset 1.1s cubic-bezier(.4,.9,.3,1)" }}
          />
          {showDots && pts.map((p, i) => (
            <circle
              key={i} cx={p.x} cy={p.y} r={p.peak ? 5 : 3.5}
              className={`an-line-dot${p.peak ? " peak" : ""}`}
              style={{ opacity: mounted ? 1 : 0, transition: `opacity .4s ease ${0.5 + i * 0.04}s` }}
            >
              <title>{p.v.toLocaleString()} {series.unit}{p.d ? ` · ${p.d}` : ""}</title>
            </circle>
          ))}
          {pts.map((p, i) => p.d ? (
            <text key={i} x={p.x} y={H - 8} className="an-line-lbl" textAnchor="middle">{p.d}</text>
          ) : null)}
        </svg>
      )}
    </div>
  );
}

function AnalyticsScreen({ autos, plan = {}, onUpgrade, period = "7d" }) {
  const { useState } = React;
  const mounted = useMounted();
  const [metric, setMetric] = useState("dms");
  const isPro = !!plan.isPro;

  const PERIOD_META = {
    "1d":  { mult: 0.14, word: "vs prior 24 hours" },
    "7d":  { mult: 1,    word: "vs last week" },
    "15d": { mult: 2.1,  word: "vs prior 15 days" },
    "30d": { mult: 4.15, word: "vs prior 30 days" },
    "60d": { mult: 8.2,  word: "vs prior 60 days" },
    "90d": { mult: 11.8, word: "vs prior quarter" },
  };
  const pm = PERIOD_META[period] || PERIOD_META["7d"];
  const mult = pm.mult;
  const periodWord = pm.word;

  // ---- top-line KPIs ------------------------------------------------------
  const deltas = {
    "1d":  { dms: "+6%",  clicks: "+9%",  reached: "+4%",  followers: "+3%" },
    "7d":  { dms: "+18%", clicks: "+22%", reached: "+14%", followers: "+9%" },
    "15d": { dms: "+15%", clicks: "+19%", reached: "+12%", followers: "+8%" },
    "30d": { dms: "+11%", clicks: "+15%", reached: "+10%", followers: "+7%" },
    "60d": { dms: "+24%", clicks: "+21%", reached: "+18%", followers: "+15%" },
    "90d": { dms: "+34%", clicks: "+29%", reached: "+26%", followers: "+21%" },
  }[period] || { dms: "+18%", clicks: "+22%", reached: "+14%", followers: "+9%" };

  const kpis = [
    { icon: "paper-plane-tilt", num: fmtK(12400 * mult), lbl: "DMs sent",         sub: "auto-replies delivered",   delta: deltas.dms },
    { icon: "cursor-click",     num: fmtK(4410 * mult),  lbl: "Link clicks",       sub: "36% click-through rate",   delta: deltas.clicks },
    { icon: "users-three",      num: fmtK(9800 * mult),  lbl: "Accounts reached",  sub: "unique contacts engaged",  delta: deltas.reached },
    { icon: "user-circle-plus", num: fmtK(214 * mult),   lbl: "New followers",     sub: "attributed to DMs",        delta: deltas.followers, pro: true },
  ];

  // ---- trend --------------------------------------------------------------
  const series = buildSeries(metric, period);
  const metricOpts = [
    { id: "dms", icon: "paper-plane-tilt", label: "DMs sent" },
    { id: "clicks", icon: "cursor-click", label: "Links clicked" },
    { id: "reached", icon: "users-three", label: "Accounts reached" },
  ];

  // ---- per-flow performance ----------------------------------------------
  const flows = [
    { name: "Comment → DM the link", icon: "link",      status: "live",   sent: 8200, clicks: 3120, ctr: 38, leads: 210, resp: "2s" },
    { name: "Story reply welcome",    icon: "image",     status: "live",   sent: 3100, clicks: 680,  ctr: 22, leads: 64,  resp: "3s" },
    { name: "Waitlist collector",     icon: "user-plus", status: "live",   sent: 1400, clicks: 240,  ctr: 17, leads: 232, resp: "4s" },
    { name: "Out-of-office auto-reply", icon: "moon",    status: "paused", sent: 642,  clicks: 52,   ctr: 8,  leads: 6,   resp: "5s" },
  ];

  // ---- top posts ----------------------------------------------------------
  const posts = [
    { t: "5 tips for faster launches", kind: "Reel",  v: 6240 },
    { t: "Behind the build",           kind: "Reel",  v: 2980 },
    { t: "Launch teaser · day 2",      kind: "Story", v: 1410 },
    { t: "Pricing, honestly",          kind: "Post",  v: 870 },
  ];

  return (
    <div className="content an-content">
      {/* KPI cards */}
      <div className="stat-grid an-kpis">
        {kpis.map((s, i) => (
          s.pro && !isPro ? (
            <div className="card stat an-kpi an-kpi-locked" key={i}>
              <span className="pro-tag an-kpi-protag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>
              <div className="s-ico"><Icon name={s.icon} /></div>
              <div className="s-lbl">{s.lbl}</div>
              <div className="s-num an-lock-num">——</div>
              <div className="an-kpi-sub">{s.sub}</div>
              <button className="an-lock-btn" onClick={onUpgrade}>
                <Icon name="lightning" weight="fill" style={{ fontSize: 11 }} /> Upgrade to unlock
              </button>
            </div>
          ) : (
            <div className="card stat an-kpi" key={i}>
              <div className="s-ico"><Icon name={s.icon} /></div>
              <div className="s-lbl">{s.lbl}</div>
              <div className="s-num">{s.num}</div>
              <div className="an-kpi-sub">{s.sub}</div>
              <div className="s-delta up">
                <Icon name="arrow-up" style={{ fontSize: 10 }} />
                {s.delta} <span className="an-delta-word">{periodWord}</span>
              </div>
            </div>
          )
        ))}
      </div>

      {/* trend */}
      <div className="card an-card">
        <div className="section-head">
          <h3>Trend over time</h3>
          <div className="spacer" />
          <div className="an-metric">
            {metricOpts.map(m => (
              <button key={m.id} className={`an-chip${metric === m.id ? " on" : ""}`} onClick={() => setMetric(m.id)}>
                <Icon name={m.icon} style={{ fontSize: 13 }} /> {m.label}
              </button>
            ))}
          </div>
        </div>
        <LineChart series={series} mounted={mounted} />
        <div className="chart-foot">
          <span className="cf-big">{fmtK(series.total)}</span>
          <span className="cf-cap">total {series.unit} · peak {series.peakLabel || "mid-period"}</span>
        </div>
      </div>

      {/* per-flow performance */}
      <div className="card an-card">
        <div className="section-head">
          <h3>Performance by automation</h3>
          <div className="spacer" />
          <span className="an-hint">Sorted by DMs sent</span>
        </div>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>Automation</th>
                <th className="num">Sent</th>
                <th className="num">Links clicked</th>
                <th>Click-through</th>
                <th className="num">Engaged accounts</th>
                <th className="num">Avg response</th>
              </tr>
            </thead>
            <tbody>
              {flows.map((f, i) => (
                <tr key={i}>
                  <td>
                    <div className="an-flow">
                      <div className="an-flow-ico"><Icon name={f.icon} /></div>
                      <div className="an-flow-name">{f.name}
                        <span className={`an-flow-status ${f.status}`}>{f.status}</span>
                      </div>
                    </div>
                  </td>
                  <td className="num">{fmtK(f.sent * mult)}</td>
                  <td className="num">{fmtK(f.clicks * mult)}</td>
                  <td>
                    <div className="an-ctr">
                      <div className="an-ctr-track"><div className="an-ctr-fill" style={{ width: mounted ? f.ctr + "%" : "0%" }} /></div>
                      <span className="an-ctr-v">{f.ctr}%</span>
                    </div>
                  </td>
                  <td className="num">{fmtK(f.leads * mult)}</td>
                  <td className="num">{f.resp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="an-resp-foot">
          <div className="an-sec-ico"><Icon name="timer" /></div>
          <div className="an-sec-body">
            <span className="an-sec-lbl">Average response time</span>
            <span className="an-sec-sub">across all flows · trigger to auto-reply sent</span>
          </div>
          <div className="an-sec-fig">
            <span className="an-sec-num">3.2s</span>
            <span className="an-sec-delta up"><Icon name="arrow-down" style={{ fontSize: 10 }} /> 0.4s faster {periodWord}</span>
          </div>
        </div>
      </div>

      {/* top posts — leaderboard */}
      <div className="card an-card">
        <div className="section-head">
          <h3>Top posts driving DMs</h3>
          <div className="spacer" />
          <span className="an-hint">By DMs generated</span>
        </div>
        <div className="lb">
          <div className="lb-top">
            <div className="lb-top-medal"><Icon name="crown" weight="fill" /></div>
            <div className="lb-top-main">
              <div className="lb-top-kind">#1 · {posts[0].kind}</div>
              <div className="lb-top-t">{posts[0].t}</div>
              <div className="lb-top-bar"><div className="lb-top-fill" style={{ width: mounted ? "100%" : "0%" }} /></div>
            </div>
            <div className="lb-top-fig">
              <div className="lb-top-v">{fmtK(posts[0].v * mult)}</div>
              <div className="lb-top-lbl">DMs driven</div>
            </div>
          </div>
          <div className="lb-rows">
            {posts.slice(1).map((p, i) => {
              const pct = Math.round(p.v / posts[0].v * 100);
              return (
                <div key={i} className="lb-row">
                  <div className="lb-rank">{i + 2}</div>
                  <div className="lb-body">
                    <div className="lb-t">{p.t}</div>
                    <div className="lb-kind">{p.kind}</div>
                  </div>
                  <div className="lb-track"><div className="lb-fill" style={{ width: mounted ? pct + "%" : "0%" }} /></div>
                  <div className="lb-v">{fmtK(p.v * mult)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsScreen });
