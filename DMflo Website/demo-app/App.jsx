// Instaflo Calm — App shell, Topbar, routing
const { useState: useAppState, useEffect: useAppEffect } = React;

const PERIOD_OPTS = [
  ["1d", "Last 24 hours"],
  ["7d", "Last 7 days"],
  ["15d", "Last 15 days"],
  ["30d", "Last 30 days"],
  ["60d", "Last 60 days"],
  ["90d", "Last 90 days"],
];

function PeriodPicker({ period, setPeriod }) {
  const { useState, useRef, useEffect } = React;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const label = (PERIOD_OPTS.find(o => o[0] === period) || PERIOD_OPTS[1])[1];
  return (
    <div className="period-picker" ref={ref}>
      <button className={`btn btn-secondary btn-sm${open ? " on" : ""}`} onClick={() => setOpen(o => !o)}>
        <Icon name="calendar-blank" /> {label}
        <Icon name="caret-down" style={{ fontSize: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <div className="period-menu">
          {PERIOD_OPTS.map(([v, l]) => (
            <button key={v} className={`period-item${period === v ? " on" : ""}`} onClick={() => { setPeriod(v); setOpen(false); }}>
              <span>{l}</span>
              {period === v && <Icon name="check" style={{ fontSize: 13 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BuilderTopbar({ auto, builderKind, onBack, onRename, onPublish }) {
  const { useState, useRef, useEffect } = React;
  const name = auto ? auto.name : "New automation";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(name); }, [name]);
  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);

  const start = () => { if (!auto) return; setDraft(name); setEditing(true); };
  const commit = () => {
    const v = draft.trim();
    if (v && v !== name && auto) onRename(auto.id, v);
    setEditing(false);
  };
  const onKey = e => { if (e.key === "Enter") commit(); else if (e.key === "Escape") setEditing(false); };

  return (
    <div className="topbar">
      <button className="btn btn-ghost btn-icon" onClick={onBack} title="Back to Automations" aria-label="Back to Automations">
        <Icon name="arrow-left" />
      </button>
      <div className="topbar-divider" />
      <div className="titles">
        {editing ? (
          <input
            ref={inputRef}
            className="builder-title-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKey}
            onBlur={commit}
            placeholder="Name this automation"
          />
        ) : (
          <button className="builder-title-btn" onClick={start} title="Rename automation" disabled={!auto}>
            <h1 style={{ fontSize: 18 }}>{name}</h1>
            {auto && <Icon name="pencil-simple" className="builder-title-pencil" />}
          </button>
        )}
        <div className="sub">Autosaved just now</div>
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" onClick={() => onPublish(auto ? auto.id : null, name, builderKind)}>
        <Icon name="lightning" weight="fill" /> Publish flow
      </button>
    </div>
  );
}

function Topbar({ route, editing, autos, builderKind, onBack, onNew, onRename, onPublish, period, setPeriod }) {
  const { useState, useRef, useEffect } = React;
  if (route === "builder") {
    const auto = editing ? autos.find(a => a.id === editing) : null;
    return <BuilderTopbar auto={auto} builderKind={builderKind} onBack={onBack} onRename={onRename} onPublish={onPublish} />;
  }

  const periodLabel = (PERIOD_OPTS.find(o => o[0] === period) || PERIOD_OPTS[1])[1];
  const infoMap = {
    home:        { title: "Home",        sub: "Tuesday, 24 June" },
    automations: { title: "Automations", sub: autos ? `${autos.length} total \u00b7 ${autos.filter(a => a.status === "live").length} live` : "" },
    agents:      { title: "Agents",      sub: "AI teammates for your DMs & comments" },
    inbox:       { title: "Inbox",       sub: "12 unread conversations" },
    contacts:    { title: "Contacts",    sub: "Everyone your automations have reached" },
    analytics:   { title: "Analytics",   sub: periodLabel },
    billing:     { title: "Plans & billing", sub: "Manage your subscription & payments" },
    settings:    { title: "Settings",    sub: "Account preferences" },
  };
  const info = infoMap[route] || { title: "", sub: "" };

  return (
    <div className="topbar">
      <div className="titles">
        <h1>{info.title}</h1>
        <div className="sub">{info.sub}</div>
      </div>
      <div className="spacer" />
      {route === "home" && <>
        <div className="hdr-status" title="Instagram data is up to date">
          <span className="hs-dot" /> <span>Synced 2m ago</span>
        </div>
        <button className="iconbtn" aria-label="Notifications"><Icon name="bell" /><span className="ndot" /></button>
        <button className="btn btn-primary" onClick={onNew}><Icon name="plus" /> New automation</button>
      </>}
      {route === "automations" && (
        <button className="btn btn-primary" onClick={onNew}><Icon name="plus" /> New flow</button>
      )}
      {route === "inbox" && (
        <button className="btn btn-secondary btn-sm"><Icon name="checks" /> Mark all read</button>
      )}
      {route === "agents" && (
        <button className="btn btn-primary" onClick={() => window.dispatchEvent(new CustomEvent("new-agent"))}><Icon name="plus" /> New agent</button>
      )}
      {route === "analytics" && (
        <PeriodPicker period={period} setPeriod={setPeriod} />
      )}
    </div>
  );
}

const FLOW_TEMPLATES = [
  { id: "t1", seed: "a1", tone: "comments", cat: "Comments", t: "Comment to DM",   s: "Auto-send your link when someone comments a keyword on your posts/reels.", art: "comment" },
  { id: "t3", seed: null, kind: "story", tone: "stories", fresh: true, cat: "Stories", t: "Story Reply", s: "Respond when someone reacts or replies to your stories", art: "story" },
  { id: "t2", seed: null, tone: "dms", soon: true, cat: "DMs", t: "Auto reply to DMs", s: "When someone DMs a keyword", art: "dm" },
];

function FlowArt({ kind }) {
  if (kind === "comment") {
    return (
      <span className="fa-art fa-comment">
        <span className="fa-card">
          <span className="fa-img" />
          <span className="fa-icons">
            <span className="fa-heart"><Icon name="heart" weight="fill" /></span>
            <Icon name="chat-circle" />
            <Icon name="paper-plane-tilt" />
          </span>
          <span className="fa-row"><span className="fa-dot" /><span className="fa-bar" /></span>
        </span>
        <span className="fa-send"><Icon name="paper-plane-tilt" weight="fill" /></span>
      </span>
    );
  }
  if (kind === "story") {
    return (
      <span className="fa-art fa-story">
        <span className="fa-story-tile">
          <span className="fa-ring" />
          <span className="fa-reply"><span className="fa-heart"><Icon name="heart" weight="fill" /></span><span className="fa-reply-bar" /></span>
        </span>
        <span className="fa-send"><Icon name="paper-plane-tilt" weight="fill" /></span>
      </span>
    );
  }
  return (
    <span className="fa-art fa-dm">
      <span className="fa-card">
        <span className="fa-dm-head"><span className="fa-dot" /><span className="fa-lines"><span className="fa-bar" /><span className="fa-bar short" /></span></span>
        <span className="fa-bubble"><span className="fa-bar" /></span>
      </span>
    </span>
  );
}

function NewFlowModal({ onClose, onPick }) {
  useAppEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Portal>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="mh-txt">
            <h2>Start a new automation</h2>
            <div className="mh-sub">Choose a flow template to build the automation</div>
          </div>
          <button className="mh-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="flow-grid">
            {FLOW_TEMPLATES.map(t => (
              <button
                key={t.id}
                className={`flow-card tone-${t.tone}${t.soon ? " soon" : ""}`}
                onClick={() => t.soon ? null : onPick(t.seed, t.kind)}
                disabled={t.soon}
              >
                <span className="fc-hero">
                  <FlowArt kind={t.art} />
                  {t.fresh && <span className="fc-badge">New</span>}
                  {t.soon && <span className="fc-badge ghost">Coming soon</span>}
                </span>
                <span className="fc-cat">{t.cat}</span>
                <span className="fc-t">{t.t}</span>
                <span className="fc-s">{t.s}</span>
                <span className="fc-foot">
                  <span className="fc-cta">{t.soon ? "Coming soon" : "Start here"}</span>
                  {!t.soon && <Icon name="arrow-right" className="fc-arrow" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}

function MobileBlock() {
  return (
    <div className="mblock" role="dialog" aria-modal="true">
      <div className="mblock-card">
        <div className="mb-brand">
          <img src="../assets/mark.svg" width="28" height="28" alt="" />
          <span className="word">DMflo</span>
        </div>
        <span className="mb-ico"><Icon name="desktop" weight="bold" /></span>
        <h2 className="mb-h">Best on desktop</h2>
        <p className="mb-p">The full dashboard isn’t built for small screens yet. Open DMflo on a laptop or desktop.</p>
        <div className="mb-actions">
          <a className="btn btn-primary mb-cta" href="account.html">
            <Icon name="credit-card" /> Manage plan &amp; account
          </a>
          <a className="btn btn-secondary mb-cta" href="dmflo://open">
            <Icon name="device-mobile" /> Open the DMflo app
          </a>
        </div>
        <div className="mb-note sys">You can still upgrade and manage billing from your phone</div>
      </div>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "plan": "pro",
  "dmsSent": 942,
  "flowLayout": "rows",
  "flowDensity": "comfy",
  "agentsState": "live",
  "inboxState": "live",
  "analyticsState": "live",
  "comingStyle": "screen"
}/*EDITMODE-END*/;

function App() {
  const hash = location.hash.slice(1);
  const [isMobile, setIsMobile] = useAppState(() => window.matchMedia("(max-width: 768px)").matches);
  const [view,    setView]    = useAppState("app");
  const [route,   setRoute]   = useAppState(hash || "home");
  const [editing, setEditing] = useAppState(null);
  const [dark,    setDark]    = useAppState(false);
  const [autos,   setAutos]   = useAppState(AUTOMATIONS);
  const [creating, setCreating] = useAppState(false);
  const [newKind, setNewKind] = useAppState(null);
  const [toast, setToast] = useAppState(null);
  const [highlightId, setHighlightId] = useAppState(null);
  const [anPeriod, setAnPeriod] = useAppState("7d");
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const DM_LIMIT = 1000;
  const isPro = t.plan === "pro";
  const dmsSent = isPro ? 7480 : Math.min(t.dmsSent, DM_LIMIT);
  const dmsLeft = isPro ? Infinity : Math.max(0, DM_LIMIT - dmsSent);
  const limitReached = !isPro && dmsLeft <= 0;
  const nearLimit = !isPro && !limitReached && dmsLeft <= 100;
  const pendingCount = limitReached ? 32 : 0;
  const resetsInDays = 8;
  const plan = { isPro, limit: DM_LIMIT, dmsSent, dmsLeft, limitReached, nearLimit, pendingCount, resetsInDays };
  const openUpgrade = () => { setEditing(null); setRoute("billing"); };

  useAppEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useAppEffect(() => {
    window.__nav = (r) => { setView("app"); setEditing(null); setRoute(r); };
  }, []);

  useAppEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const on = e => setIsMobile(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const toggleAuto = id =>
    setAutos(autos.map(a => a.id === id ? { ...a, status: a.status === "live" ? "paused" : "live" } : a));

  const deleteAuto = id => setAutos(autos.filter(a => a.id !== id));
  const setArchived = (ids, val) => setAutos(prev => prev.map(a =>
    ids.includes(a.id)
      ? { ...a, archived: val, status: (val && a.status === "live") ? "paused" : a.status }
      : a));
  const renameAuto = (id, name) => setAutos(autos.map(a => a.id === id ? { ...a, name } : a));
  const bulkStatus = (ids, status) => setAutos(autos.map(a => ids.includes(a.id) ? { ...a, status } : a));
  const bulkDelete = ids => setAutos(autos.filter(a => !ids.includes(a.id)));
  const duplicateAuto = id => {
    const src = autos.find(a => a.id === id);
    if (!src) return;
    setAutos(prev => {
      const idx = prev.findIndex(a => a.id === id);
      const copy = { ...src, id: "a" + Date.now(), name: src.name + " (copy)", status: "paused", sent: "0", ctr: "—", contacts: "0", lastTriggered: "never", created: Date.now() };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  };

  const openBuilder = (id = null) => { setEditing(id); setNewKind(null); setRoute("builder"); };
  const startNew = (seed = null, kind = null) => { setCreating(false); setEditing(seed); setNewKind(kind); setRoute("builder"); };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 3800);
  };

  const publishFlow = (id, name, kind) => {
    let liveId = id;
    if (id && autos.some(a => a.id === id)) {
      setAutos(prev => prev.map(a => a.id === id ? { ...a, status: "live" } : a));
    } else {
      liveId = "a" + Date.now();
      const isStory = kind === "story";
      const newAuto = {
        id: liveId,
        name: name || (isStory ? "Story reply \u2192 DM" : "Comment \u2192 DM the link"),
        icon: isStory ? "image" : "link",
        trigger: isStory ? "LINK, GUIDE, YES" : "PRICE",
        triggerType: isStory ? "story" : "comment",
        status: "live", sent: "0",
        ctr: "\u2014", contacts: "0", lastTriggered: "just now", created: Date.now(),
        desc: isStory ? "DMs your link when someone replies to your story" : "Replies with your shop link when someone comments a keyword",
      };
      setAutos(prev => [newAuto, ...prev]);
    }
    setEditing(null);
    setHighlightId(liveId);
    setRoute("automations");
    showToast("Flow published \u2014 it\u2019s now live");
    clearTimeout(window.__hlT);
    window.__hlT = setTimeout(() => setHighlightId(null), 2600);
  };

  const sideRoute = route === "builder" ? "automations" : route;
  const builderAuto = editing ? autos.find(a => a.id === editing) : null;
  const builderKind = builderAuto ? (builderAuto.triggerType === "story" ? "story" : "comment") : (newKind === "story" ? "story" : "comment");
  const comingTabs = [
    t.agentsState === "coming" && "agents",
    t.inboxState === "coming" && "inbox",
    t.analyticsState === "coming" && "analytics",
  ].filter(Boolean);

  return (
    <div className="shell">
      <Sidebar
        route={sideRoute}
        setRoute={r => { setEditing(null); setRoute(r); }}
        dark={dark}
        setDark={setDark}
        comingTabs={comingTabs}
        comingStyle={t.comingStyle}
        onExit={() => { window.location.href = "onboarding.html"; }}
      />
      <main className="main">
        <Topbar route={route} editing={editing} autos={autos} builderKind={builderKind} onBack={() => setRoute("automations")} onNew={() => setCreating(true)} onRename={renameAuto} onPublish={publishFlow} period={anPeriod} setPeriod={setAnPeriod} />
        {route === "home"        && <HomeScreen        autos={autos} toggleAuto={toggleAuto} openBuilder={openBuilder} onNew={() => setCreating(true)} plan={plan} onUpgrade={openUpgrade} />}
        {route === "automations" && <AutomationsScreen autos={autos} toggleAuto={toggleAuto} openBuilder={openBuilder} deleteAuto={deleteAuto} duplicateAuto={duplicateAuto} renameAuto={renameAuto} bulkStatus={bulkStatus} bulkDelete={bulkDelete} onNew={() => setCreating(true)} highlightId={highlightId} layout={t.flowLayout} setLayout={v => setTweak("flowLayout", v)} density={t.flowDensity} setArchived={setArchived} />}
        {route === "builder"     && (builderKind === "story"
          ? <StoryBuilderScreen auto={builderAuto} plan={plan} onPublish={publishFlow} />
          : <BuilderScreen       auto={builderAuto} plan={plan} onPublish={publishFlow} />)}
        {route === "inbox"       && (t.inboxState === "coming" ? <ComingSoon tab="inbox" /> : <InboxScreen />)}
        {route === "contacts"    && <ContactsScreen />}
        {route === "agents"      && (t.agentsState === "coming" ? <ComingSoon tab="agents" /> : <AgentsScreen />)}
        {route === "analytics"   && (t.analyticsState === "coming" ? <ComingSoon tab="analytics" /> : <AnalyticsScreen   autos={autos} plan={plan} onUpgrade={openUpgrade} period={anPeriod} />)}
        {route === "settings"    && <SettingsScreen plan={plan} onUpgrade={openUpgrade} />}
        {route === "billing"     && <BillingScreen plan={plan} onUpgrade={openUpgrade} />}
      </main>
      {creating && <NewFlowModal onClose={() => setCreating(false)} onPick={startNew} />}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-ico"><Icon name="check" weight="bold" /></span>
          <span className="toast-msg">{toast}</span>
        </div>
      )}
      {isMobile && <MobileBlock />}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Automations page" />
        <TweakRadio label="Density" value={t.flowDensity} options={["compact", "comfy"]} onChange={v => setTweak("flowDensity", v)} />
        <TweakSection label="Tab state" />
        <TweakRadio label="Coming-soon style" value={t.comingStyle} options={["screen", "disabled"]} onChange={v => setTweak("comingStyle", v)} />
        <TweakRadio label="Agents" value={t.agentsState} options={["coming", "live"]} onChange={v => setTweak("agentsState", v)} />
        <TweakRadio label="Inbox" value={t.inboxState} options={["coming", "live"]} onChange={v => setTweak("inboxState", v)} />
        <TweakRadio label="Analytics" value={t.analyticsState} options={["coming", "live"]} onChange={v => setTweak("analyticsState", v)} />
        <TweakSection label="Plan & usage" />
        <TweakRadio label="Plan" value={t.plan} options={["free", "pro"]} onChange={v => setTweak("plan", v)} />
        {t.plan === "free" && (
          <TweakSlider label="DMs sent this month" value={t.dmsSent} min={0} max={1000} step={1} onChange={v => setTweak("dmsSent", v)} />
        )}
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
