// Instaflo Calm — Home screen
function HomeBanner({ plan, onUpgrade }) {
  if (plan.isPro || (!plan.nearLimit && !plan.limitReached)) return null;

  if (plan.limitReached) {
    return (
      <div className="limit-banner reached">
        <div className="lb-main">
          <div className="lb-ico"><Icon name="warning" weight="fill" /></div>
          <div className="lb-copy">
            <div className="lb-kicker">Action needed</div>
            <h3>You’re out of DMs</h3>
            <p><b>{plan.pendingCount} people</b> commented this week and didn’t get a reply, so your flows are paused until your limit resets in {plan.resetsInDays} days.</p>
          </div>
        </div>
        <button className="btn btn-primary lb-cta" onClick={onUpgrade}>
          <Icon name="lightning" weight="fill" /> Upgrade to resume
        </button>
      </div>
    );
  }

  // near limit — subtle
  const pct = Math.min(100, (plan.dmsSent / plan.limit) * 100);
  return (
    <div className="limit-banner near" onClick={onUpgrade} role="button">
      <div className="lb-dot" />
      <div className="lb-near-copy">
        <b>{plan.dmsLeft} DMs left</b> this month. Flows pause at your {plan.limit.toLocaleString()} limit.
      </div>
      <div className="lb-meter"><span style={{ width: pct + "%" }} /></div>
      <span className="lb-near-link">Upgrade <Icon name="arrow-right" style={{ fontSize: 12 }} /></span>
    </div>
  );
}

function PendingPipeline_REMOVED() { return null; }

function HomeScreen({ autos, toggleAuto, openBuilder, onNew, plan, onUpgrade }) {
  const mounted = useMounted();
  const max = Math.max(...CHART.map(c => c.v));
  const live = autos.filter(a => a.status === "live");

  const stats = [
    { icon: "paper-plane-tilt", num: "12.4k",           lbl: "DMs sent",          delta: "+18% this week", cls: "up" },
    { icon: "user-circle-plus", num: "318",              lbl: "Accounts reached",  delta: "+42 this week",  cls: "up" },
    { icon: "lightning",        num: String(live.length),lbl: "Live automations",  delta: "1 in draft",     cls: "flat" },
    { icon: "cursor-click",     num: "34%",              lbl: "Click-through rate",delta: "4.4K links clicked", cls: "up" },
  ];

  const activity = [
    { acc: true,  icon: "paper-plane-tilt", body: <><b>jordan.creates</b> got your shop link via <b>Comment → DM</b>.</>, t: "just now" },
    { acc: false, icon: "user-plus",        body: <><b>thesarahb</b> joined the launch waitlist.</>,                    t: "2 min ago" },
    { acc: false, icon: "chat-circle-dots", body: <><b>leo.studio</b> replied and needs a human touch.</>,               t: "14 min ago" },
    { acc: true,  icon: "paper-plane-tilt", body: <>Story welcome sent to <b>9 new repliers</b>.</>,                   t: "1 hr ago" },
  ];

  return (
    <div className="content">
      <HomeBanner plan={plan} onUpgrade={onUpgrade} />

      <div className="greet">
        <h2>Good morning, Maya.</h2>
        <p>Your automations handled <b>1,204</b> conversations overnight and replied in under a second, every time.</p>
      </div>

      <div className="stat-grid-wrap">
        <div className="sg-header">
          <span className="sg-period"><Icon name="calendar-blank" style={{ fontSize: 13 }} /> Last 7 days</span>
        </div>
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div className="card stat" key={i}>
              <div className="s-ico"><Icon name={s.icon} /></div>
              <div className="s-lbl">{s.lbl}</div>
              <div className="s-num">{s.num}</div>
              <div className={`s-delta ${s.cls}`}>
                {s.cls === "up" && <Icon name="arrow-up"   style={{ fontSize: 10 }} />}
                {s.cls === "dn" && <Icon name="arrow-down" style={{ fontSize: 10 }} />}
                {s.delta}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-split">
        {/* automations list */}
        <div>
          <div className="section-head">
            <h3>Automations</h3>
            <LivePill count={live.length} />
            <div className="spacer" />
            <button className="btn btn-ghost btn-sm" onClick={onNew}>
              <Icon name="plus" style={{ fontSize: 14 }} /> New flow
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {autos.slice(0, 5).map(a => (
              <div key={a.id} className={`auto-row${a.status === "live" ? " live" : ""}`}>
                <div className="ar-main">
                  <div className="ar-select">
                    <div className="a-ico"><Icon name={a.icon} /></div>
                  </div>
                  <div className="a-info">
                    <div className="h">
                      <span className="a-name">{a.name}</span>
                      <StatusPill status={a.status} />
                    </div>
                    <div className="s"><TriggerLine auto={a} /></div>
                  </div>
                  {hasActivity(a) ? (
                    <div className="a-stats">
                      <Stat icon="paper-plane-tilt" value={a.sent} label="DMs sent" accent={a.status === "live"} />
                    </div>
                  ) : (
                    <FlowZero auto={a} variant="row" />
                  )}
                  <div className="ar-controls">
                    {plan.limitReached && a.status === "live"
                      ? <PausedTag />
                      : a.status === "paused"
                      ? <Toggle on={false} onClick={() => toggleAuto(a.id)} />
                      : <Toggle on={true} onClick={() => toggleAuto(a.id)} />}
                    <button className="rowbtn" onClick={() => openBuilder(a.id)} title="Edit">
                      <Icon name="pencil-simple" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* rail */}
        <div className="home-rail">
          <div className="card panel">
            <div className="ph">
              <h4>This week</h4>
              <div className="sp" />
              <span className="sys">replies / day</span>
            </div>
            <div className="minichart">
              {CHART.map((c, i) => (
                <div key={i} className={`mc-col${c.peak ? " peak" : ""}`}>
                  <div className="mc-bar" style={{ height: mounted ? `${(c.v / max) * 100}%` : "0%" }}>
                    <div className="mc-tip">{c.v.toLocaleString()} DMs</div>
                  </div>
                  <div className="mc-d">{c.d}</div>
                </div>
              ))}
            </div>
            <div className="chart-foot">
              <span className="cf-big">2,940</span>
              <span className="cf-cap">replies · peak Fri</span>
            </div>
          </div>

          <div className="card panel">
            <div className="ph"><h4>Recent activity</h4></div>
            <div className="feed">
              {activity.map((a, i) => (
                <div key={i} className="act">
                  <div className={`a-ai${a.acc ? " acc" : ""}`}>
                    <Icon name={a.icon} weight={a.acc ? "fill" : "bold"} />
                  </div>
                  <div className="a-txt">{a.body}<div className="a-t">{a.t}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
