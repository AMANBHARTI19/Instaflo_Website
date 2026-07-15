// Instaflo Calm — Inbox (conversation list + thread)
function InboxScreen() {
  const { useState } = React;
  const [active, setActive] = useState("c1");
  const [draft, setDraft] = useState("");

  const conv = CONVERSATIONS.find(c => c.id === active) || CONVERSATIONS[0];

  return (
    <div className="inbox">
      {/* conversation list */}
      <div className="conv-list">
        <div className="conv-search">
          <div className="input" style={{ borderRadius: "var(--r-pill)", padding: "8px 14px" }}>
            <Icon name="magnifying-glass" style={{ fontSize: 15 }} />
            <input placeholder="Search DMs…" />
          </div>
        </div>
        {CONVERSATIONS.map(c => (
          <div
            key={c.id}
            className={`conv${active === c.id ? " active" : ""}`}
            onClick={() => setActive(c.id)}
          >
            <Avatar name={c.name} size={38} />
            <div className="cv-meta">
              <div className="cv-top">
                <span className="cv-name">{c.name}</span>
                {c.auto && <Tag>Auto</Tag>}
                <span className="cv-time">{c.time}</span>
              </div>
              <div className="cv-snip">{c.snippet}</div>
            </div>
            {c.unread && <span className="cv-unread" />}
          </div>
        ))}
      </div>

      {/* thread */}
      <div className="thread">
        <div className="thread-head">
          <Avatar name={conv.name} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{conv.name}</div>
            <div className="mono" style={{ fontSize: 11 }}>{conv.handle} · Instagram DM</div>
          </div>
          <div style={{ flex: 1 }} />
          {conv.auto && <span className="live-pill"><span className="dot" />Automated</span>}
          <button className="btn btn-secondary btn-sm">
            <Icon name="user" /> Profile
          </button>
        </div>

        <div className="thread-body">
          <div className="sys" style={{ textAlign: "center", marginBottom: 8 }}>Today</div>
          {THREAD.map((m, i) => (
            <React.Fragment key={i}>
              <div className={`bubble ${m.from}`}>{m.text}</div>
              {m.from === "auto" && THREAD[i + 1]?.from !== "auto" && (
                <div className="bubble-tag">
                  <Icon name="lightning" weight="fill" style={{ fontSize: 11 }} />
                  Sent by automation · {m.t}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="thread-compose">
          <button className="btn btn-ghost btn-icon">
            <Icon name="paperclip" />
          </button>
          <div className="input" style={{ flex: 1, borderRadius: "var(--r-pill)", padding: "8px 14px" }}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Jump in and reply…"
            />
            <Icon name="smiley" style={{ fontSize: 17, color: "var(--ink-3)", cursor: "pointer" }} />
          </div>
          <button
            className="btn btn-primary btn-icon"
            disabled={!draft.trim()}
            onClick={() => setDraft("")}
          >
            <Icon name="paper-plane-tilt" />
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InboxScreen });
