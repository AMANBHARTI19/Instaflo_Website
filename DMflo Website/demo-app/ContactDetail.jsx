// Instaflo Calm — Contact drawer (slide-over) + New-list modal
function ContactDrawer({ c, onClose, onDelete, onSync }) {
  const { useEffect } = React;
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <Portal>
      <div className="drawer-overlay" onClick={onClose}>
        <aside className="drawer" onClick={e => e.stopPropagation()}>
          <button className="drawer-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
          <ContactDetail c={c} onDelete={onDelete} onSync={onSync} />
        </aside>
      </div>
    </Portal>
  );
}

function ContactDetail({ c, onDelete, onSync }) {
  const { useState } = React;
  const [confirming, setConfirming] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  function handleSync() {
    if (syncing) return;
    setSyncing(true); setSynced(false);
    window.setTimeout(() => {
      onSync && onSync(c.id);
      setSyncing(false); setSynced(true);
      window.setTimeout(() => setSynced(false), 1800);
    }, 950);
  }
  const info = [
    { icon: "envelope-simple", label: "Email",     value: c.email },
    { icon: "phone",           label: "Phone",     value: c.phone },
    { icon: "map-pin",         label: "Location",  value: c.location },
    { icon: "users",           label: "Followers", value: c.followers },
  ];

  return (
    <div className="cts-detail" key={c.id}>
      {/* profile header */}
      <div className="cd-head">
        <Avatar name={c.name} size={54} />
        <div className="cd-id">
          <div className="cd-name">{c.name}</div>
          <div className="cd-handle">{c.handle} · {c.role}</div>
        </div>
      </div>

      <div className="cd-actions">
        <button className="btn btn-secondary btn-sm cd-msg"><Icon name="chat-circle-dots" /> Message</button>
        <button className="btn btn-secondary btn-sm cd-act-icon cd-del" title="Delete contact" aria-label="Delete contact" onClick={() => setConfirming(true)}><Icon name="trash" /></button>
      </div>

      <div className="cd-stats">
        <div className="cd-stat">
          <div className="v">{c.score}<span className="u">/100</span></div>
          <div className="k">Engagement</div>
        </div>
        <div className="cd-stat">
          <div className="v">{c.activity.length}</div>
          <div className="k">Events</div>
        </div>
        <div className="cd-stat">
          <div className="v">{c.lastSeen}</div>
          <div className="k">Active</div>
        </div>
      </div>

      <div className="cd-scroll">
        {/* collected info */}
        <div className="cd-section">
          <div className="cd-label cd-label-row">
            <span>Collected info</span>
            <button
              className={`cd-sync${syncing ? " spinning" : ""}${synced ? " ok" : ""}`}
              onClick={handleSync}
              disabled={syncing}
              title="Refresh this contact's info"
              aria-label="Refresh this contact's info"
            >
              <Icon name={synced ? "check" : "arrows-clockwise"} />
            </button>
          </div>
          <div className="cd-info">
            {info.map(r => (
              <div className="ci-row" key={r.label}>
                <Icon name={r.icon} />
                <span className="ci-label">{r.label}</span>
                <span className={`ci-value${r.value ? "" : " missing"}`}>{r.value || "Not captured"}</span>
              </div>
            ))}
          </div>
          <div className="cd-tags">
            {c.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>

        {/* activity / journey */}
        <div className="cd-section">
          <div className="cd-label">Activity &amp; journey</div>
          <div className="timeline">
            {c.activity.map((a, i) => (
              <div className={`tl-item type-${a.type}`} key={i}>
                <span className="tl-node"><Icon name={a.icon} weight="fill" /></span>
                <div className="tl-body">
                  <div className="tl-top">
                    <span className="tl-title">{a.title}</span>
                    <span className="tl-time">{a.t}</span>
                  </div>
                  <div className="tl-detail">{a.detail}</div>
                </div>
              </div>
            ))}
            <div className="tl-item origin">
              <span className="tl-node"><Icon name="flag" weight="fill" /></span>
              <div className="tl-body">
                <div className="tl-top"><span className="tl-title">First seen</span></div>
                <div className="tl-detail">Entered via {c.source}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirming && (
        <Portal>
          <div className="modal-overlay" style={{ zIndex: 70 }} onClick={() => setConfirming(false)}>
            <div className="modal del-confirm" onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <div className="mh-txt">
                  <h2>Delete “{c.name}”?</h2>
                  <div className="mh-sub">This removes the contact and their activity from your list. This can’t be undone.</div>
                </div>
                <button className="mh-close" onClick={() => setConfirming(false)} aria-label="Close"><Icon name="x" /></button>
              </div>
              <div className="modal-foot">
                <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => { setConfirming(false); onDelete && onDelete(); }}><Icon name="trash" /> Delete contact</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

Object.assign(window, { ContactDrawer, ContactDetail });
