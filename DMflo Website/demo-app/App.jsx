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

function BuilderTopbar({ auto, onBack, onRename, onPublish }) {
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
      <button className="btn btn-primary" onClick={() => onPublish(auto ? auto.id : null, name)}>
        <Icon name="lightning" weight="fill" /> Publish flow
      </button>
    </div>
  );
}

function Topbar({ route, editing, autos, onBack, onNew, onRename, onPublish, period, setPeriod }) {
  const { useState, useRef, useEffect } = React;
  if (route === "builder") {
    const auto = editing ? autos.find(a => a.id === editing) : null;
    return <BuilderTopbar auto={auto} onBack={onBack} onRename={onRename} onPublish={onPublish} />;
  }

  const periodLabel = (PERIOD_OPTS.find(o => o[0] === period) || PERIOD_OPTS[1])[1];
  const infoMap = {
    home:        { title: "Home",        sub: "Tuesday, 24 June" },
    automations: { title: "Automations", sub: autos ? `${autos.length} total \u00b7 ${autos.filter(a => a.status === "live").length} live` : "" },
    inbox:       { title: "Inbox",       sub: "12 unread conversations" },
    contacts:    { title: "Contacts",    sub: "Everyone your automations have reached" },
    analytics:   { title: "Analytics",   sub: periodLabel },
    connect:     { title: "Connect AI",  sub: "Run DMflo from Claude or ChatGPT" },
    integrations:{ title: "Integrations", sub: "Connect apps & AI to DMflo" },
    brand:       { title: "Brand Kit",   sub: "Voice, guidelines & products every agent uses" },
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
      {route === "analytics" && (
        <PeriodPicker period={period} setPeriod={setPeriod} />
      )}
    </div>
  );
}

const FLOW_CARDS = [
  { id: "link",  tone: "lime", cat: "Comments", art: "comment", t: "Comment to DM", s: "When someone comments a keyword" },
  { id: "story", tone: "blue", cat: "Stories",  art: "story",   t: "Story Reply",   s: "When someone reacts or replies" },
  { id: "faq",   tone: "pink", cat: "DMs",      art: "keyword", t: "Auto reply to DMs", s: "When someone DMs a keyword" },
];

function CardArt({ kind }) {
  const plane = <span className="a-plane"><Icon name="paper-plane-tilt" weight="fill" /></span>;
  if (kind === "story") {
    return (
      <span className="art">
        <span className="a-story">
          <span className="as-ring" />
          <span className="as-reply">
            <span className="as-heart"><Icon name="heart" weight="fill" /></span>
            <span className="as-rl" />
          </span>
          {plane}
        </span>
      </span>
    );
  }
  if (kind === "keyword") {
    return (
      <span className="art">
        <span className="a-chat">
          <span className="ac-head"><span className="ac-av" /><span className="ac-nm" /></span>
          <span className="ac-in"><span className="l a" /><span className="l b" /></span>
          <span className="ac-out"><span className="l a" /><span className="l b" /></span>
        </span>
      </span>
    );
  }
  return (
    <span className="art">
      <span className="a-post">
        <span className="ap-media" />
        <span className="ap-acts">
          <Icon name="heart" weight="fill" />
          <Icon name="chat-circle" weight="fill" />
          <Icon name="paper-plane-tilt" weight="fill" />
        </span>
        <span className="ap-cmt"><span className="ap-av" /><span className="ap-line" /></span>
        {plane}
      </span>
    </span>
  );
}

function NewFlowModal({ onClose, onPick, onAI, onPickAgent, comingSoon = false }) {
  useAppEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goStudio = params => { location.href = "studio/Flow Studio.html" + params; };
  const pickAgent = (tplId, blank) => { onClose(); onPickAgent(tplId, blank); };
  return (
    <Portal>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal nf-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="mh-txt">
            <h2>Start a new automation</h2>
            <div className="mh-sub">Choose what triggers it, or pick a ready-made template.</div>
          </div>
          <button className="mh-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="modal-body nf-body">
          <div className="nf-grid">
            {FLOW_CARDS.map(c => {
              const soon = comingSoon && c.id === "faq";
              const isNew = comingSoon && c.id === "story";
              return (
                <button key={c.id} className={"nf-card tone-" + c.tone + (soon ? " is-soon" : "")} disabled={soon} onClick={soon ? undefined : () => goStudio("?tpl=" + c.id)}>
                  {soon && <span className="nf-soon">Coming soon</span>}
                  {isNew && <span className="nf-soon nf-new">New</span>}
                  <span className="nf-art"><CardArt kind={c.art} /></span>
                  <span className="nf-cat">{c.cat}</span>
                  <span className="nf-t">{c.t}</span>
                  <span className="nf-s">{c.s}</span>
                  <span className="nf-start">
                    {soon ? "Coming soon" : <>Start here <Icon name="arrow-right" weight="bold" /></>}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="nf-agents-head">
            <span className="nf-ah-line" />
            <span className="nf-ah-txt"><Icon name="sparkle" weight="fill" /> Or hand it to an AI agent</span>
            <span className="nf-ah-line" />
          </div>
          <div className="nf-agent-grid">
            {[{ id: "t-dm" }, { id: "t-mod" }, { id: "t-blank", name: "Create your own agent", blank: true }].map(pick => {
              const tpl = AGENT_TEMPLATES.find(t => t.id === pick.id) || {};
              return (
                <button key={pick.id} className={"nf-agent" + (pick.blank ? " create" : "")} onClick={() => pickAgent(pick.id, pick.blank)}>
                  <span className="nf-agent-ico"><Icon name={pick.blank ? "plus" : tpl.icon} weight={pick.blank ? "bold" : "fill"} /></span>
                  <span className="nf-agent-body">
                    <span className="nf-agent-tr">
                      <span className="nf-agent-t">{pick.name || tpl.t}</span>
                      {!pick.blank && <span className="nf-agent-badge"><Icon name="sparkle" weight="fill" /> AI</span>}
                    </span>
                    <span className="nf-agent-s">{pick.blank ? "Start from a blank prompt and shape it yourself" : tpl.s}</span>
                  </span>
                  <Icon name="arrow-right" weight="bold" className="nf-agent-arrow" />
                </button>
              );
            })}
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

function deriveAgentMeta(prompt, caps) {
  const presets = [
    { has: ["qualify"],          name: "Lead Catcher",   icon: "magnet" },
    { has: ["moderate"],         name: "Comment Moderator",  icon: "shield-check" },
    { has: ["reply", "faq"],     name: "Frontdesk",      icon: "headset" },
    { has: ["faq"],              name: "FAQ Helper",     icon: "books" },
    { has: ["engage"],           name: "Comment Buddy",  icon: "heart" },
    { has: ["reply"],            name: "DM Assistant",   icon: "chat-circle-dots" },
  ];
  const hit = presets.find(p => p.has.every(c => caps.includes(c)));
  return hit || { name: "Custom Agent", icon: "robot" };
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "plan": "free",
  "dmsSent": 342,
  "flowLayout": "rows",
  "flowDensity": "comfy",
  "homeAibar": "show",
  "newFlowComingSoon": "off",
  "aiProvider": "claude"
}/*EDITMODE-END*/;

function App() {
  const hash = location.hash.slice(1);
  const [isMobile, setIsMobile] = useAppState(() => window.matchMedia("(max-width: 768px)").matches);
  const [view,    setView]    = useAppState("app");
  const [route,   setRoute]   = useAppState(hash || "home");
  const [editing, setEditing] = useAppState(null);
  const [dark,    setDark]    = useAppState(false);
  const [autos,   setAutos]   = useAppState(AUTOMATIONS);
  const [agents,  setAgents]  = useAppState(AGENTS);
  const [builderAgent, setBuilderAgent] = useAppState(null);
  const [creating, setCreating] = useAppState(false);
  const [flowSeed, setFlowSeed] = useAppState(null);
  const [aiPrompt, setAiPrompt] = useAppState("");
  const [aiAttachments, setAiAttachments] = useAppState([]);
  const [aiAgent, setAiAgent] = useAppState(null);
  const [aiSession, setAiSession] = useAppState(0);
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

  const agentsRef = React.useRef(agents);
  useAppEffect(() => { agentsRef.current = agents; });
  useAppEffect(() => {
    window.__nav = (r) => { setView("app"); setEditing(null); setRoute(r); };
    window.__openAgent = (id) => { const ag = agentsRef.current.find(a => a.id === id); setBuilderAgent(ag || null); setEditing(null); setRoute("agentbuilder"); };
    window.__demo = {
      newFlow: () => { setView("app"); setEditing(null); setRoute("automations"); setCreating(true); },
      pickComment: () => { setCreating(false); setFlowSeed(null); setEditing("a1"); setRoute("builder"); },
      moderator: () => { setCreating(false); setEditing(null); const ag = agentsRef.current.find(a => a.id === "ag3"); setBuilderAgent(ag || null); setRoute("agentbuilder"); },
    };
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

  const openBuilder = (id = null) => { setFlowSeed(null); setEditing(id); setRoute("builder"); };

  // Mirror a saved agent into the automations list as an "agent" flow row.
  const syncAgentAutomation = (ag) => {
    const autoId = "agentauto-" + ag.id;
    const rec = {
      id: autoId, kind: "agent", agentId: ag.id,
      name: ag.name, icon: ag.icon, prompt: ag.prompt || "", caps: ag.caps || [],
      status: ag.status === "active" ? "live" : "draft",
      trigger: "", triggerType: "comment", desc: ag.prompt || "",
      sent: ag.stat || "0", contacts: "0", lastTriggered: ag.status === "active" ? "just now" : "Never", created: Date.now(),
    };
    setAutos(prev => {
      const idx = prev.findIndex(a => a.id === autoId);
      if (idx >= 0) { const next = [...prev]; next[idx] = { ...prev[idx], ...rec, created: prev[idx].created }; return next; }
      return [rec, ...prev];
    });
  };
  const openAgentById = (agentId) => { const ag = agents.find(a => a.id === agentId); setBuilderAgent(ag || null); setEditing(null); setRoute("agentbuilder"); };

  const pickAgentTemplate = (tplId, blank) => {
    if (blank) { setBuilderAgent(null); setRoute("agentbuilder"); return; }
    const tpl = AGENT_TEMPLATES.find(t => t.id === tplId);
    const builtin = tpl && agents.find(a => a.default && a.name === tpl.t);
    if (builtin) { setBuilderAgent(builtin); setRoute("agentbuilder"); return; }
    setBuilderAgent(tpl ? { fromTemplate: true, name: tpl.t === "Blank agent" ? "" : tpl.t, icon: tpl.icon, prompt: tpl.prompt, caps: tpl.caps, knowledge: [], status: "draft" } : null);
    setRoute("agentbuilder");
  };

  const saveAgentRecord = (data, opts = {}) => {
    const publish = !!opts.publish;
    const isEdit = data.id && agents.some(a => a.id === data.id);
    const status = publish ? "active" : (data.status || "draft");
    const base = isEdit ? { ...agents.find(a => a.id === data.id), ...data } : { ...data, id: "ag" + Date.now(), stat: "0", statLabel: "Handled" };
    const record = { ...base, status, edited: "Just now" };
    setAgents(prev => isEdit ? prev.map(a => a.id === record.id ? record : a) : [record, ...prev]);
    syncAgentAutomation(record);
    if (publish) { setBuilderAgent(null); setRoute("automations"); showToast("Agent published \u2014 it\u2019s now live"); }
    else { setBuilderAgent(record); }
  };

  const startNew = (seed = null) => { setCreating(false); setFlowSeed(null); setEditing(seed); setRoute("builder"); };
  const startAI = (prompt = "") => { setCreating(false); setEditing(null); setAiPrompt(prompt); setAiAttachments([]); setAiAgent(null); setAiSession(s => s + 1); setRoute("ai"); };
  const openFromAI = (spec) => { setFlowSeed(spec); setEditing(null); setRoute("builder"); };

  // Background: pick a suitable existing agent, or spin up a new one and add it
  // to the Agents tab while the user builds the flow up front.
  const agentTimers = React.useRef([]);
  useAppEffect(() => () => agentTimers.current.forEach(clearTimeout), []);
  function ensureAgentForPrompt(prompt, attachments = []) {
    const caps = (window.detectCaps ? window.detectCaps(prompt) : []);
    if (attachments.length && !caps.includes("faq")) caps.push("faq");
    // reuse an existing agent whose capabilities already cover this request
    const reusable = agents.find(a => a.status !== "building" && caps.length && a.caps && caps.every(c => a.caps.includes(c)));
    if (reusable) return { id: reusable.id, name: reusable.name, icon: reusable.icon, reused: true };
    const meta = deriveAgentMeta(prompt, caps);
    const id = "ag" + Date.now();
    const placeholder = {
      id, status: "building", prompt, knowledge: attachments, caps,
      name: "Building your agent…", icon: "sparkle", stat: "0", statLabel: "Handled", edited: "Just now", auto: true,
    };
    setAgents(prev => [placeholder, ...prev]);
    const tm = setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: "draft", name: meta.name, icon: meta.icon } : a));
    }, 2400);
    agentTimers.current.push(tm);
    return { id, name: meta.name, icon: meta.icon, reused: false };
  }

  // Home composer: build a complete automation. Kicks off a background agent,
  // then drops the user into the flow wizard with the AI already at work.
  const startAutomation = (prompt = "", attachments = []) => {
    setCreating(false);
    setEditing(null);
    const agent = ensureAgentForPrompt(prompt, attachments);
    setAiPrompt(prompt);
    setAiAttachments(attachments || []);
    setAiAgent(agent);
    setAiSession(s => s + 1);
    setRoute("ai");
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 3800);
  };

  const publishFlow = (id, name, spec) => {
    let liveId = id;
    if (id && autos.some(a => a.id === id)) {
      setAutos(prev => prev.map(a => a.id === id ? { ...a, status: "live" } : a));
    } else {
      liveId = "a" + Date.now();
      const trg = spec
        ? (spec.anyComment ? (spec.triggerType === "comment" ? "any comment" : "any reply") : spec.keywords.join(", "))
        : "PRICE";
      const newAuto = spec ? {
        id: liveId,
        name: name || spec.name,
        icon: spec.icon || "link", trigger: trg, triggerType: spec.triggerType, status: "live", sent: "0",
        ctr: "\u2014", contacts: "0", lastTriggered: "just now", created: Date.now(),
        desc: "Built with AI \u2014 " + (spec.name || "custom automation"),
        reply: (spec.msg || "") + (spec.links && spec.links[0] ? spec.links[0].url : ""),
      } : {
        id: liveId,
        name: name || "Comment \u2192 DM the link",
        icon: "link", trigger: "PRICE", triggerType: "comment", status: "live", sent: "0",
        ctr: "\u2014", contacts: "0", lastTriggered: "just now", created: Date.now(),
        desc: "Replies with your shop link when someone comments a keyword",
      };
      setAutos(prev => [newAuto, ...prev]);
    }
    setFlowSeed(null);
    setEditing(null);
    setHighlightId(liveId);
    setRoute("automations");
    showToast("Flow published \u2014 it\u2019s now live");
    clearTimeout(window.__hlT);
    window.__hlT = setTimeout(() => setHighlightId(null), 2600);
  };

  const sideRoute = (route === "builder" || route === "ai" || route === "agentbuilder") ? "automations" : route;

  return (
    <div className="shell">
      <Sidebar
        route={sideRoute}
        setRoute={r => { setEditing(null); setRoute(r); }}
        dark={dark}
        setDark={setDark}
        onExit={() => { window.location.href = "onboarding.html"; }}
      />
      <main className="main">
        {route !== "ai" && <Topbar route={route} editing={editing} autos={autos} onBack={() => setRoute("automations")} onNew={() => setCreating(true)} onRename={renameAuto} onPublish={publishFlow} period={anPeriod} setPeriod={setAnPeriod} />}
        {route === "home"        && <HomeScreen        autos={autos} toggleAuto={toggleAuto} openBuilder={openBuilder} onNew={() => setCreating(true)} onAI={t.homeAibar === "show" ? startAI : null} onCreateAgent={startAutomation} plan={plan} onUpgrade={openUpgrade} />}
        {route === "automations" && <AutomationsScreen autos={autos} toggleAuto={toggleAuto} openBuilder={openBuilder} openAgent={openAgentById} deleteAuto={deleteAuto} duplicateAuto={duplicateAuto} renameAuto={renameAuto} bulkStatus={bulkStatus} bulkDelete={bulkDelete} onNew={() => setCreating(true)} highlightId={highlightId} layout={t.flowLayout} setLayout={v => setTweak("flowLayout", v)} density={t.flowDensity} setArchived={setArchived} />}
        {route === "builder"     && <BuilderScreen     auto={editing ? autos.find(a => a.id === editing) : null} plan={plan} onPublish={publishFlow} seed={flowSeed} />}
        {route === "ai"          && <AIFlowBuilder     key={aiSession} initialPrompt={aiPrompt} attachments={aiAttachments} agent={aiAgent} isPro={isPro} onOpenInBuilder={openFromAI} onPublish={(spec) => publishFlow(null, spec.name, spec)} onCancel={() => setRoute("automations")} />}
        {route === "connect"     && <ConnectAIScreen defaultProvider={t.aiProvider} />}
        {route === "integrations" && <IntegrationsScreen defaultProvider={t.aiProvider} />}
        {route === "inbox"       && <InboxScreen />}
        {route === "contacts"    && <ContactsScreen />}
        {route === "agentbuilder" && <AgentBuilder agent={builderAgent} onSave={saveAgentRecord} onCancel={() => { setBuilderAgent(null); setRoute("automations"); }} />}
        {route === "analytics"   && <AnalyticsScreen   autos={autos} plan={plan} onUpgrade={openUpgrade} period={anPeriod} />}
        {route === "brand"       && <BrandScreen />}
        {route === "settings"    && <SettingsScreen plan={plan} onUpgrade={openUpgrade} />}
        {route === "billing"     && <BillingScreen plan={plan} onUpgrade={openUpgrade} />}
      </main>
      {creating && <NewFlowModal onClose={() => setCreating(false)} onPick={startNew} onAI={() => startAI("")} onPickAgent={pickAgentTemplate} comingSoon={t.newFlowComingSoon === "on"} />}
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
        <TweakSection label="AI features" />
        <TweakRadio label="Home AI bar" value={t.homeAibar} options={["show", "hide"]} onChange={v => setTweak("homeAibar", v)} />
        <TweakRadio label="Story & DM cards" value={t.newFlowComingSoon} options={["off", "on"]} onChange={v => setTweak("newFlowComingSoon", v)} />
        <TweakRadio label="Default AI provider" value={t.aiProvider} options={["claude", "chatgpt"]} onChange={v => setTweak("aiProvider", v)} />
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
