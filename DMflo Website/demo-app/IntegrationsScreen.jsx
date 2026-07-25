// DMflo Calm — Integrations (Apps + MCP)
const APPS = [
  {
    id: "shopify", name: "Shopify", icon: "shopping-bag",
    tint: "oklch(0.72 0.15 145)", soft: "oklch(0.94 0.05 145)",
    desc: "Sync your product catalog, prices and stock so agents can recommend and link the right product.",
    cat: "Commerce",
  },
];

function AppCard({ app }) {
  const { useState } = React;
  const [connected, setConnected] = useState(false);
  return (
    <div className="card int-app">
      <div className="int-app-top">
        <span className="int-app-ico" style={{ background: app.soft, color: app.tint }}><Icon name={app.icon} weight="fill" /></span>
        <div className="int-app-id">
          <div className="int-app-name">{app.name}</div>
          <div className="int-app-cat sys">{app.cat}</div>
        </div>
        {connected && <span className="live-pill"><span className="dot beat" />Connected</span>}
      </div>
      <p className="int-app-desc">{app.desc}</p>
      <button className={`btn ${connected ? "btn-secondary" : "btn-primary"} int-app-cta`} onClick={() => setConnected(c => !c)}>
        {connected
          ? <><Icon name="link-break" /> Disconnect</>
          : <><Icon name="plugs-connected" weight="fill" /> Connect {app.name}</>}
      </button>
    </div>
  );
}

function IntegrationsScreen({ defaultProvider }) {
  const { useState } = React;
  const [tab, setTab] = useState("apps");

  return (
    <div className="content int-content">
      <div className="content-col">
        <div className="int-tabs">
          <button className={`int-tab${tab === "apps" ? " on" : ""}`} onClick={() => setTab("apps")}>
            <Icon name="squares-four" weight={tab === "apps" ? "fill" : "bold"} /> Apps
          </button>
          <button className={`int-tab${tab === "mcp" ? " on" : ""}`} onClick={() => setTab("mcp")}>
            <Icon name="plugs-connected" weight={tab === "mcp" ? "fill" : "bold"} /> MCP
            <span className="int-tab-new">New</span>
          </button>
        </div>

        {tab === "apps" ? (
          <div className="int-panel">
            <div className="section-head">
              <h3>Apps</h3>
              <span className="sys">Connect the tools you already use</span>
            </div>
            <div className="int-app-grid">
              {APPS.map(a => <AppCard key={a.id} app={a} />)}
            </div>
          </div>
        ) : (
          <div className="int-panel int-mcp">
            <ConnectAIScreen defaultProvider={defaultProvider} embedded />
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { IntegrationsScreen });
