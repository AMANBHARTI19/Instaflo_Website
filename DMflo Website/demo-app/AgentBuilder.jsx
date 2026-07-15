// Instaflo Calm — Agent builder (prompt + knowledge + live test)
function detectCaps(p) {
  const t = (p || "").toLowerCase();
  const s = new Set();
  if (/\bdm\b|message|reply|respond|answer|triage/.test(t)) s.add("reply");
  if (/lead|intent|interested|\btag\b|buy|qualif|email/.test(t)) s.add("qualify");
  if (/faq|question|pricing|price|knowledge|\bdoc|shipping|how much/.test(t)) s.add("faq");
  if (/comment|reel|\bpost\b|engage/.test(t)) s.add("engage");
  if (/spam|hide|moderat|inappropriate|junk|block|delete/.test(t)) s.add("moderate");
  return [...s];
}

const AGENT_ICONS = ["robot", "headset", "magnet", "shield-check", "sparkle", "chat-circle-dots", "heart", "books"];

function AgentBuilder({ agent, onSave, onCancel }) {
  const { useState, useMemo } = React;
  const [name, setName] = useState(agent?.name || "");
  const [icon, setIcon] = useState(agent?.icon || "robot");
  const [prompt, setPrompt] = useState(agent?.prompt || "");
  const [caps, setCaps] = useState(agent?.caps || []);
  const [knowledge, setKnowledge] = useState(agent?.knowledge || []);
  const [active, setActive] = useState(agent?.status === "active");
  const [layout, setLayout] = useState("split");
  const [addMode, setAddMode] = useState(null); // url | text | null
  const [tmp, setTmp] = useState("");

  const suggested = useMemo(() => detectCaps(prompt).filter(c => !caps.includes(c)), [prompt, caps]);
  const draft = { name: name || "Untitled agent", icon, prompt, caps, knowledge };
  const canSave = name.trim() && prompt.trim();

  function toggleCap(id) {
    setCaps(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  }
  function addSuggested() { setCaps(c => [...new Set([...c, ...suggested])]); }
  function uploadDoc() {
    const names = ["Brand voice guide.pdf", "Pricing & FAQ.pdf", "Shipping policy.docx", "Product catalog.pdf"];
    const label = names[knowledge.filter(k => k.type === "doc").length % names.length];
    setKnowledge(k => [...k, { type: "doc", label, meta: (180 + Math.floor(Math.random() * 600)) + " KB" }]);
  }
  function commitAdd() {
    const v = tmp.trim();
    if (!v) { setAddMode(null); return; }
    if (addMode === "url") setKnowledge(k => [...k, { type: "url", label: v.replace(/^https?:\/\//, ""), meta: "Website" }]);
    else setKnowledge(k => [...k, { type: "text", label: v.split("\n")[0].slice(0, 42) || "Pasted note", meta: "Note · " + v.split("\n").length + " lines" }]);
    setTmp(""); setAddMode(null);
  }
  function removeKnowledge(i) { setKnowledge(k => k.filter((_, idx) => idx !== i)); }

  const kbIcon = { doc: "file-text", url: "link", text: "note" };

  return (
    <div className="agent-build-wrap">
      {/* header */}
      <div className="ab-header">
        <button className="btn btn-ghost btn-icon" onClick={onCancel} title="Back"><Icon name="arrow-left" /></button>
        <div className="ab-title">
          <span className="ab-ico"><Icon name={icon} weight="fill" /></span>
          <div>
            <div className="ab-name">{name || "New agent"}</div>
            <div className="ab-sub">{agent?.id ? "Editing agent" : "New agent"} · {active ? "Active" : "Draft"}</div>
          </div>
        </div>
        <div className="spacer" style={{ flex: 1 }} />
        <div className="seg">
          <button className={layout === "split" ? "on" : ""} onClick={() => setLayout("split")} title="Side by side"><Icon name="columns" /></button>
          <button className={layout === "stacked" ? "on" : ""} onClick={() => setLayout("stacked")} title="Stacked"><Icon name="rows" /></button>
        </div>
        <label className="ab-active">
          <Toggle on={active} onClick={() => setActive(a => !a)} /> Active
        </label>
        <button className="btn btn-primary" disabled={!canSave} onClick={() => onSave({ id: agent?.id, name: name.trim(), icon, prompt, caps, knowledge, status: active ? "active" : "draft" })}>
          <Icon name="check" /> Save agent
        </button>
      </div>

      {/* body */}
      <div className={`ab-body ${layout}`}>
        {/* config */}
        <div className="ab-config">
          <div className="ab-field">
            <label className="ab-label">Agent name</label>
            <div className="ab-iconrow">
              <div className="input input-surface" style={{ flex: 1 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frontdesk" />
              </div>
            </div>
            <div className="icon-pick">
              {AGENT_ICONS.map(ic => (
                <button key={ic} className={`ip${icon === ic ? " on" : ""}`} onClick={() => setIcon(ic)}><Icon name={ic} weight="fill" /></button>
              ))}
            </div>
          </div>

          <div className="ab-field">
            <label className="ab-label">Instructions</label>
            <div className="ab-hint">Describe what this agent should do, in plain words.</div>
            <textarea
              className="ab-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Reply to my DMs in a warm, casual tone. Answer questions about pricing and shipping from my docs, and if someone wants to buy, send them the shop link…"
            />
            {suggested.length > 0 && (
              <div className="ab-suggest">
                <Icon name="sparkle" weight="fill" /> Detected from your prompt:
                {suggested.map(id => {
                  const c = AGENT_CAPS.find(x => x.id === id);
                  return <span key={id} className="sug-chip" onClick={() => toggleCap(id)}>{c.t} <Icon name="plus" weight="bold" /></span>;
                })}
                <button className="sug-all" onClick={addSuggested}>Add all</button>
              </div>
            )}
          </div>

          <div className="ab-field">
            <label className="ab-label">Capabilities</label>
            <div className="ab-hint">What the agent is allowed to do.</div>
            <div className="cap-list">
              {AGENT_CAPS.map(c => (
                <button key={c.id} className={`cap-row${caps.includes(c.id) ? " on" : ""}`} onClick={() => toggleCap(c.id)}>
                  <span className="cr-ico"><Icon name={c.icon} /></span>
                  <span className="cr-body"><span className="cr-t">{c.t}</span><span className="cr-s">{c.s}</span></span>
                  <span className="cr-box"><Icon name="check" weight="bold" /></span>
                </button>
              ))}
            </div>
          </div>

          <div className="ab-field">
            <label className="ab-label">Knowledge base</label>
            <div className="ab-hint">Give the agent sources to learn your answers from.</div>
            <div className="kb-list">
              {knowledge.map((k, i) => (
                <div key={i} className="kb-row">
                  <span className="kb-ico"><Icon name={kbIcon[k.type]} weight="fill" /></span>
                  <span className="kb-label">{k.label}</span>
                  <span className="kb-meta">{k.meta}</span>
                  <button className="kb-x" onClick={() => removeKnowledge(i)} title="Remove"><Icon name="x" weight="bold" /></button>
                </div>
              ))}
              {knowledge.length === 0 && addMode === null && (
                <div className="kb-empty">No sources yet. The agent will rely on your instructions alone.</div>
              )}
              {addMode && (
                <div className="kb-add">
                  {addMode === "text"
                    ? <textarea autoFocus value={tmp} onChange={e => setTmp(e.target.value)} placeholder="Paste text the agent should know…" />
                    : <input autoFocus value={tmp} onChange={e => setTmp(e.target.value)} onKeyDown={e => e.key === "Enter" && commitAdd()} placeholder="https://yoursite.com/faq" />}
                  <div className="kb-add-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setAddMode(null); setTmp(""); }}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={commitAdd}>Add</button>
                  </div>
                </div>
              )}
            </div>
            {!addMode && (
              <div className="kb-actions">
                <button className="kb-btn" onClick={uploadDoc}><Icon name="upload-simple" /> Upload document</button>
                <button className="kb-btn" onClick={() => { setAddMode("url"); setTmp(""); }}><Icon name="link" /> Add URL</button>
                <button className="kb-btn" onClick={() => { setAddMode("text"); setTmp(""); }}><Icon name="note-pencil" /> Paste text</button>
              </div>
            )}
          </div>
        </div>

        {/* live test */}
        <AgentTest draft={draft} />
      </div>
    </div>
  );
}

Object.assign(window, { AgentBuilder, detectCaps });
