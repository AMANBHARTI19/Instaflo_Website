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
  const brandReady = (() => { try { return localStorage.getItem("dmflo_brandkit") !== "empty"; } catch (e) { return true; } })();
  const isDefault = !!agent?.default;
  const [name, setName] = useState(agent?.name || "");
  const [icon, setIcon] = useState(agent?.icon || "robot");
  const [prompt, setPrompt] = useState(agent?.prompt || "");
  const [caps, setCaps] = useState(agent?.caps || []);
  const [knowledge, setKnowledge] = useState(agent?.knowledge || []);
  const [watch, setWatch] = useState(agent?.watch || { mode: "all", postIds: [] });
  const [active, setActive] = useState(agent?.status === "active");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [pickIcon, setPickIcon] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const nameRef = React.useRef(null);
  const iconPickRef = React.useRef(null);
  const [addMode, setAddMode] = useState(null); // url | text | null
  const [tmp, setTmp] = useState("");

  const suggested = useMemo(() => detectCaps(prompt).filter(c => !caps.includes(c)), [prompt, caps]);
  const watchesContent = caps.includes("engage") || caps.includes("moderate");
  const draft = { name: name || "Untitled agent", icon, prompt, caps, knowledge, watch };
  const canSave = name.trim() && prompt.trim();
  const POSTS = window.IG_POSTS || [];

  function toggleWatch(id) {
    setWatch(w => ({ mode: "selected", postIds: w.postIds.includes(id) ? w.postIds.filter(x => x !== id) : [...w.postIds, id] }));
  }

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

  React.useEffect(() => { if (editingName && nameRef.current) { nameRef.current.focus(); nameRef.current.select(); } }, [editingName]);
  React.useEffect(() => {
    if (!pickIcon) return;
    const close = e => { if (iconPickRef.current && !iconPickRef.current.contains(e.target)) setPickIcon(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [pickIcon]);

  return (
    <div className="agent-build-wrap">
      {/* clean top bar — immersive automation shell */}
      <div className="ab-header">
        <button className="btn btn-ghost btn-icon" onClick={onCancel} title="Back to agents"><Icon name="arrow-left" /></button>
        <div className="ab-hdiv" />
        <span className="ab-hico"><Icon name={icon} weight="fill" /></span>
        {editingName ? (
          <input ref={nameRef} className="ab-name-input" value={name}
            onChange={e => setName(e.target.value)} onBlur={() => setEditingName(false)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
            placeholder="Name your agent" />
        ) : (
          <button className="ab-name-btn" onClick={() => setEditingName(true)} title="Rename">
            {name || "New agent"}
          </button>
        )}
        <span className={`ab-status ${active ? "live" : "draft"}`}>
          {active ? <><span className="dot beat" />Active</> : "Draft"}
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary" disabled={!canSave} onClick={() => { onSave({ id: agent?.id, name: name.trim(), icon, prompt, caps, knowledge, watch, default: isDefault, status: active ? "active" : "draft" }, { publish: false }); setJustSaved(true); clearTimeout(window.__abSaveT); window.__abSaveT = setTimeout(() => setJustSaved(false), 1800); }}>
          <Icon name={justSaved ? "check-circle" : "check"} weight={justSaved ? "fill" : "regular"} /> {justSaved ? "Saved" : "Save"}
        </button>
        <button className="btn btn-primary" disabled={!canSave} onClick={() => { setActive(true); onSave({ id: agent?.id, name: name.trim(), icon, prompt, caps, knowledge, watch, default: isDefault, status: "active" }, { publish: true }); }}>
          <Icon name="rocket-launch" weight="fill" /> Publish agent
        </button>
      </div>

      {/* body */}
      <div className="ab-body">
        {/* config */}
        <div className="ab-config">
          <div className="ab-field">
            <label className="ab-label">Agent name</label>
            <div className="ab-iconrow">
              <div className="ab-iconpick" ref={iconPickRef}>
                <button type="button" className={`ab-iconbox${pickIcon ? " on" : ""}`} onClick={() => setPickIcon(v => !v)} title="Change icon">
                  <Icon name={icon} weight="fill" />
                  <span className="ab-iconbox-edit"><Icon name="pencil-simple" weight="fill" /></span>
                </button>
                {pickIcon && (
                  <div className="ab-iconpop">
                    {AGENT_ICONS.map(ic => (
                      <button key={ic} type="button" className={`ip${icon === ic ? " on" : ""}`} onClick={() => { setIcon(ic); setPickIcon(false); }}><Icon name={ic} weight="fill" /></button>
                    ))}
                  </div>
                )}
              </div>
              <div className="input input-surface" style={{ flex: 1 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frontdesk" />
              </div>
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
            {!isDefault && suggested.length > 0 && (
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

          {watchesContent && (
            <div className="ab-field">
              <label className="ab-label">Which posts to watch</label>
              <div className="ab-hint">Choose where this agent looks for comments to reply to and moderate.</div>
              <div className="seg watch-seg">
                <button className={watch.mode === "all" ? "on" : ""} onClick={() => setWatch({ mode: "all", postIds: [] })}><Icon name="globe" /> All posts &amp; reels</button>
                <button className={watch.mode === "selected" ? "on" : ""} onClick={() => setWatch(w => ({ mode: "selected", postIds: w.postIds.length ? w.postIds : (POSTS[0] ? [POSTS[0].id] : []) }))}><Icon name="squares-four" /> Choose posts</button>
              </div>
              {watch.mode === "selected" && (
                <>
                  <div className="watch-count">{watch.postIds.length ? `${watch.postIds.length} selected` : "Tap the posts and reels this agent should watch."}</div>
                  <div className="watch-grid">
                    {POSTS.slice(0, 5).map(p => {
                      const on = watch.postIds.includes(p.id);
                      return (
                        <button key={p.id} className={`aifc-post${on ? " picked" : ""}`} onClick={() => toggleWatch(p.id)}>
                          <span className="aifc-post-thumb">
                            {p.emoji}
                            <span className="aifc-post-kind">{p.kind}</span>
                            {on && <span className="aifc-post-check"><Icon name="check" weight="bold" /></span>}
                          </span>
                          <span className="aifc-post-cap">{p.cap}</span>
                        </button>
                      );
                    })}
                    {POSTS.length > 5 && (
                      <button className="aifc-post aifc-post-more" onClick={() => setShowAllPosts(true)}>
                        <Icon name="squares-four" weight="fill" />
                        <span>See all</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="ab-field">
            <label className="ab-label">Capabilities</label>
            <div className="ab-hint">{isDefault ? "Built-in agents come with a fixed skill set \u2014 here's what this one handles." : "What the agent is allowed to do."}</div>
            <div className={`cap-list${isDefault ? " read" : ""}`}>  {isDefault
                ? caps.map(id => {
                    const c = AGENT_CAPS.find(x => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={id} className="cap-row on read">
                        <span className="cr-ico"><Icon name={c.icon} /></span>
                        <span className="cr-body"><span className="cr-t">{c.t}</span><span className="cr-s">{c.s}</span></span>
                      </div>
                    );
                  })
                : AGENT_CAPS.map(c => (
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
              {brandReady ? (
                <div className="kb-row kb-pinned" title="Managed in your Brand Kit">
                  <span className="kb-ico brand"><Icon name="palette" weight="fill" /></span>
                  <span className="kb-label">Brand Kit
                    <span className="kb-sublabel">Your voice, guidelines{window.SHOP && window.SHOP.connected ? ` & ${window.SHOP.productCount} products` : ""}</span>
                  </span>
                  <span className="kb-pin-tag">Always on</span>
                  <button className="kb-open" onClick={() => window.__nav && window.__nav("brand")} title="Edit Brand Kit"><Icon name="arrow-up-right" weight="bold" /></button>
                </div>
              ) : (
                <div className="kb-nudge">
                  <span className="kb-nudge-ico"><Icon name="palette" weight="fill" /></span>
                  <div className="kb-nudge-txt">
                    <div className="h">Set up your Brand Kit</div>
                    <div className="s">It’s the shared knowledge source for every agent — your brand voice, guidelines and products. Set it up once and all your agents use it automatically.</div>
                  </div>
                  <button className="btn btn-primary btn-sm kb-nudge-cta" onClick={() => window.__nav && window.__nav("brand")}><Icon name="sparkle" weight="fill" /> Set up Brand Kit</button>
                </div>
              )}
              {knowledge.map((k, i) => (
                <div key={i} className="kb-row">
                  <span className="kb-ico"><Icon name={kbIcon[k.type]} weight="fill" /></span>
                  <span className="kb-label">{k.label}</span>
                  <span className="kb-meta">{k.meta}</span>
                  <button className="kb-x" onClick={() => removeKnowledge(i)} title="Remove"><Icon name="x" weight="bold" /></button>
                </div>
              ))}
              {knowledge.length === 0 && addMode === null && (
                <div className="kb-empty">Add extra sources here — the agent already knows your Brand Kit.</div>
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

      {showAllPosts && (
        <div className="watch-modal-scrim" onClick={() => setShowAllPosts(false)}>
          <div className="watch-modal" onClick={e => e.stopPropagation()}>
            <div className="watch-modal-head">
              <div>
                <div className="watch-modal-title">All posts &amp; reels</div>
                <div className="watch-modal-sub">{watch.postIds.length ? `${watch.postIds.length} selected` : "Tap the posts and reels this agent should watch."}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAllPosts(false)}><Icon name="x" weight="bold" /></button>
            </div>
            <div className="watch-modal-grid">
              {POSTS.map(p => {
                const on = watch.postIds.includes(p.id);
                return (
                  <button key={p.id} className={`aifc-post${on ? " picked" : ""}`} onClick={() => toggleWatch(p.id)}>
                    <span className="aifc-post-thumb">
                      {p.emoji}
                      <span className="aifc-post-kind">{p.kind}</span>
                      {on && <span className="aifc-post-check"><Icon name="check" weight="bold" /></span>}
                    </span>
                    <span className="aifc-post-cap">{p.cap}</span>
                  </button>
                );
              })}
            </div>
            <div className="watch-modal-foot">
              <button className="btn btn-primary" onClick={() => setShowAllPosts(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AgentBuilder, detectCaps });
