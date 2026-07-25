// Instaflo Calm — Sidebar navigation
const IG_ACCOUNTS = [
  { id: "ig1", handle: "@mayamakes",     name: "Maya Rin",        kind: "Creator", followers: "48.2k", avatar: "MR" },
  { id: "ig2", handle: "@thedailybrew",  name: "The Daily Brew",  kind: "Business", followers: "31.7k", avatar: "DB" },
  { id: "ig3", handle: "@leostudio.io",  name: "Leo Studio",      kind: "Creator", followers: "5.2k",  avatar: "LS" },
];

function Sidebar({ route, setRoute, dark, setDark, onExit, comingTabs = [], comingStyle }) {
  const { useState, useRef, useEffect } = React;
  const [activeAccount, setActiveAccount] = useState("ig1");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    if (!switcherOpen) return;
    function onKey(e) { if (e.key === "Escape") setSwitcherOpen(false); }
    function onClick(e) { if (switcherRef.current && !switcherRef.current.contains(e.target)) setSwitcherOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [switcherOpen]);

  const acct = IG_ACCOUNTS.find(a => a.id === activeAccount) || IG_ACCOUNTS[0];

  const workItems = [
    { id: "home",        icon: "house",           label: "Home" },
    { id: "automations", icon: "lightning",        label: "Automations", count: 5 },
    { id: "contacts",    icon: "address-book",     label: "Contacts",     count: "4.2k" },
    { id: "inbox",       icon: "chat-circle-dots", label: "Inbox",        count: 12 },
    { id: "analytics",   icon: "chart-bar",        label: "Analytics" },
    { id: "integrations", icon: "puzzle-piece",   label: "Integrations", neu: true },
  ];
  const acctItems = [
    { id: "brand",    icon: "palette",     label: "Brand Kit" },
    { id: "billing",  icon: "credit-card", label: "Plans & billing" },
    { id: "settings", icon: "gear-six",    label: "Settings" },
  ];

  return (
    <aside className="sidebar">
      <Logo onClick={() => setRoute("home")} />

      <div className="side-scroll">
      <div className="nav-label">Workspace</div>
      {workItems.map(it => {
        const isComing = comingStyle === "disabled" && comingTabs.includes(it.id);
        return (
          <a
            key={it.id}
            className={`nav-item${route === it.id ? " active" : ""}${isComing ? " disabled" : ""}`}
            onClick={() => { if (isComing) return; setRoute(it.id); }}
            aria-disabled={isComing || undefined}
            title={isComing ? "Coming soon" : undefined}
          >
            <Icon name={it.icon} weight={route === it.id ? "fill" : "bold"} />
            {it.label}
            {isComing
              ? <span className="soon-tag">Coming soon</span>
              : it.neu
                ? <span className="nav-new">New</span>
                : it.count != null && <span className="count">{it.count}</span>}
          </a>
        );
      })}

      <div className="nav-label">Account</div>
      {acctItems.map(it => (
        <a
          key={it.id}
          className={`nav-item${route === it.id ? " active" : ""}`}
          onClick={() => setRoute(it.id)}
        >
          <Icon name={it.icon} weight={route === it.id ? "fill" : "bold"} />
          {it.label}
        </a>
      ))}
      </div>

      <div className="side-foot">
        {/* account switcher */}
        <div className="acct-switcher" ref={switcherRef}>
          {switcherOpen && (
            <div className="acct-popover">
              <div className="ap-label">Switch account</div>
              {IG_ACCOUNTS.map(a => (
                <button
                  key={a.id}
                  className={`ap-row${a.id === activeAccount ? " on" : ""}`}
                  onClick={() => { setActiveAccount(a.id); setSwitcherOpen(false); }}
                >
                  <span className="ap-av">{a.avatar}</span>
                  <span className="ap-info">
                    <span className="ap-handle">{a.handle}</span>
                    <span className="ap-meta">{a.kind} · {a.followers}</span>
                  </span>
                  {a.id === activeAccount
                    ? <Icon name="check-circle" weight="fill" className="ap-check" />
                    : <span className="ap-dot"><span /></span>}
                </button>
              ))}
              <div className="ap-div" />
              <button className="ap-add" onClick={() => { setSwitcherOpen(false); setRoute("settings"); }}>
                <Icon name="plus-circle" weight="fill" /> Add account
              </button>
            </div>
          )}
          <button className="acct" onClick={() => setSwitcherOpen(o => !o)}>
            <Avatar name={acct.name} size={34} />
            <div className="meta">
              <div className="h">{acct.handle}</div>
              <div className="s">{acct.kind} · {acct.followers}</div>
            </div>
            <Icon name="caret-up-down" className="acct-caret" style={{ fontSize: 14, color: "var(--ink-3)", flexShrink: 0 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar, IG_ACCOUNTS });
