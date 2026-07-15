// Instaflo Calm — Agents (composer + list + templates + builder host)

// Derive a name + icon for an auto-built agent from its prompt
function deriveAgentMeta(prompt, caps) {
  const presets = [
    { has: ["qualify"],          name: "Lead Catcher",   icon: "magnet" },
    { has: ["moderate"],         name: "Comment Guard",  icon: "shield-check" },
    { has: ["reply", "faq"],     name: "Frontdesk",      icon: "headset" },
    { has: ["faq"],              name: "FAQ Helper",     icon: "books" },
    { has: ["engage"],           name: "Comment Buddy",  icon: "heart" },
    { has: ["reply"],            name: "DM Assistant",   icon: "chat-circle-dots" },
  ];
  const hit = presets.find(p => p.has.every(c => caps.includes(c)));
  return hit || { name: "Custom Agent", icon: "robot" };
}

function AgentComposer({ onCreate }) {
  const { useState } = React;
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [addMode, setAddMode] = useState(null); // url | null
  const [tmp, setTmp] = useState("");

  const kbIcon = { doc: "file-text", url: "link", text: "note" };

  function uploadDoc() {
    const names = ["Brand voice guide.pdf", "Pricing & FAQ.pdf", "Shipping policy.docx", "Product catalog.pdf"];
    const label = names[attachments.filter(k => k.type === "doc").length % names.length];
    setAttachments(a => [...a, { type: "doc", label, meta: (180 + Math.floor(Math.random() * 600)) + " KB" }]);
  }
  function commitUrl() {
    const v = tmp.trim();
    if (!v) { setAddMode(null); return; }
    setAttachments(a => [...a, { type: "url", label: v.replace(/^https?:\/\//, ""), meta: "Website" }]);
    setTmp(""); setAddMode(null);
  }
  function removeAttachment(i) { setAttachments(a => a.filter((_, idx) => idx !== i)); }

  function submit() {
    if (!prompt.trim()) return;
    onCreate(prompt.trim(), attachments);
    setPrompt(""); setAttachments([]); setAddMode(null); setTmp("");
  }

  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); submit(); }
  }

  return (
    <div className="agent-composer">
      <div className="acm-head">
        <span className="acm-spark"><Icon name="sparkle" weight="fill" /></span>
        <div className="acm-titles">
          <div className="acm-t">Describe your agent</div>
          <div className="acm-s">Tell us what it should do in plain English, and we’ll build it and add it below.</div>
        </div>
      </div>

      <textarea
        className="acm-input"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="e.g. Reply to my DMs in a warm, lowercase tone. Answer questions about pricing and shipping from my docs, and if someone wants to buy, send them my shop link…"
      />

      {attachments.length > 0 && (
        <div className="acm-chips">
          {attachments.map((k, i) => (
            <span key={i} className="acm-chip">
              <Icon name={kbIcon[k.type]} weight="fill" />
              <span className="acm-chip-label">{k.label}</span>
              <button className="acm-chip-x" onClick={() => removeAttachment(i)} title="Remove"><Icon name="x" weight="bold" /></button>
            </span>
          ))}
        </div>
      )}

      {addMode === "url" && (
        <div className="acm-urlrow">
          <div className="input input-surface" style={{ flex: 1 }}>
            <Icon name="link" />
            <input autoFocus value={tmp} onChange={e => setTmp(e.target.value)} onKeyDown={e => e.key === "Enter" && commitUrl()} placeholder="https://yoursite.com/faq" />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setAddMode(null); setTmp(""); }}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={commitUrl}>Add link</button>
        </div>
      )}

      <div className="acm-foot">
        <div className="acm-attach">
          <button className="acm-attach-btn" onClick={uploadDoc}><Icon name="paperclip" /> Attach files</button>
          <button className="acm-attach-btn" onClick={() => { setAddMode("url"); setTmp(""); }}><Icon name="link" /> Add link</button>
        </div>
        <div className="acm-go">
          <span className="acm-kbd">⌘↵</span>
          <button className="btn btn-primary" disabled={!prompt.trim()} onClick={submit}>
            <Icon name="sparkle" weight="fill" /> Create agent
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentsScreen() {
  const { useState, useEffect, useRef } = React;
  const [agents, setAgents] = useState(AGENTS);
  const [view, setView] = useState("list");   // list | build
  const [editing, setEditing] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    const onNew = () => { setEditing(null); setView("build"); };
    window.addEventListener("new-agent", onNew);
    return () => {
      window.removeEventListener("new-agent", onNew);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function openTemplate(t) {
    setEditing({ fromTemplate: true, name: t.t === "Blank agent" ? "" : t.t, icon: t.icon, prompt: t.prompt, caps: t.caps, knowledge: [], status: "draft" });
    setView("build");
  }
  function editAgent(a) { if (a.status === "building") return; setEditing(a); setView("build"); }

  function saveAgent(data) {
    setAgents(prev => {
      const exists = data.id && prev.some(a => a.id === data.id);
      if (exists) return prev.map(a => a.id === data.id ? { ...a, ...data, edited: "Just now" } : a);
      return [{ ...data, id: "ag" + Date.now(), stat: "0", statLabel: "Handled", edited: "Just now" }, ...prev];
    });
    setView("list");
  }

  // Composer → background build
  function createFromPrompt(prompt, attachments) {
    const id = "ag" + Date.now();
    const caps = detectCaps(prompt);
    const placeholder = {
      id, status: "building", prompt, knowledge: attachments,
      caps, name: "Building your agent…", icon: "sparkle",
      stat: "0", statLabel: "Handled", edited: "Just now",
    };
    setAgents(prev => [placeholder, ...prev]);

    const t = setTimeout(() => {
      const meta = deriveAgentMeta(prompt, caps);
      setAgents(prev => prev.map(a => a.id === id
        ? { ...a, status: "draft", name: meta.name, icon: meta.icon }
        : a));
    }, 2400);
    timers.current.push(t);
  }

  if (view === "build") {
    return <AgentBuilder agent={editing} onSave={saveAgent} onCancel={() => setView("list")} />;
  }

  const building = agents.some(a => a.status === "building");

  return (
    <div className="content agents-content">
      <div className="content-col">

      <AgentComposer onCreate={createFromPrompt} />

      <div className="section-head" style={{ marginTop: 30 }}>
        <h3>Your agents</h3>
        <span className="sys">{agents.filter(a => a.status !== "building").length} saved</span>
        {building && <span className="acm-working"><span className="acm-dot" /> Building…</span>}
      </div>
      <div className="agent-grid">
        {agents.map(a => (
          <AgentCard key={a.id} a={a} onClick={() => editAgent(a)} />
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 34 }}>
        <h3>Start from a template</h3>
      </div>
      <div className="tpl-row">
        {AGENT_TEMPLATES.map(t => (
          <button key={t.id} className={`agent-tpl${t.id === "t-blank" ? " blank" : ""}`} onClick={() => openTemplate(t)}>
            <span className="at-ico"><Icon name={t.icon} weight="fill" /></span>
            <span className="at-body">
              <span className="at-t">{t.t}</span>
              <span className="at-s">{t.s}</span>
            </span>
            <Icon name="arrow-right" className="at-arrow" />
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}

function AgentCard({ a, onClick }) {
  const caps = a.caps.map(id => AGENT_CAPS.find(c => c.id === id)).filter(Boolean);

  if (a.status === "building") {
    return (
      <div className="agent-card card building">
        <div className="ac-head">
          <span className="ac-ico building"><span className="ac-spinner" /></span>
          <div className="ac-id">
            <div className="ac-name">{a.name}</div>
            <span className="build-pill"><span className="dot beat" />Setting up</span>
          </div>
        </div>
        <p className="ac-prompt">{a.prompt}</p>
        <div className="ac-caps">
          {caps.length
            ? caps.map(c => <span key={c.id} className="cap-chip"><Icon name={c.icon} style={{ fontSize: 12 }} />{c.t}</span>)
            : <><span className="cap-skel" /><span className="cap-skel" /></>}
        </div>
        <div className="ac-build-bar"><span /></div>
      </div>
    );
  }

  return (
    <div className="agent-card card" onClick={onClick}>
      <div className="ac-head">
        <span className="ac-ico"><Icon name={a.icon} weight="fill" /></span>
        <div className="ac-id">
          <div className="ac-name">{a.name}</div>
          {a.status === "active"
            ? <span className="live-pill"><span className="dot beat" />Active</span>
            : <span className="draft-tag">Draft</span>}
        </div>
        <button className="btn btn-ghost btn-icon ac-edit" title="Edit"><Icon name="pencil-simple" /></button>
      </div>
      <p className="ac-prompt">{a.prompt || "No instructions yet."}</p>
      <div className="ac-caps">
        {caps.map(c => (
          <span key={c.id} className="cap-chip"><Icon name={c.icon} style={{ fontSize: 12 }} />{c.t}</span>
        ))}
      </div>
      <div className="ac-foot">
        <span className="ac-stat"><b>{a.stat}</b> {a.statLabel}</span>
        <span className="ac-edited"><Icon name="clock" style={{ fontSize: 12 }} /> {a.edited}</span>
      </div>
    </div>
  );
}

Object.assign(window, { AgentsScreen, AgentCard, AgentComposer });
