// Instaflo Calm — Agent live test, styled like the AI-automation Test drive:
// role-play as a follower and watch the agent react, with a plain-English trace.

function runAgentSim(draft, text, mode) {
  const t = (text || "").toLowerCase();
  const caps = draft.caps || [];
  const has = c => caps.includes(c);
  const events = [], trace = [];
  const spam = /(https?:\/\/|www\.|\.com\/|follow back|check my page|free followers|earn \$|click here|promo code|bit\.ly)/i.test(text) || /(.)\1{6,}/.test(text);
  const pricey = /price|pricing|cost|how much|\$\d|expensive|cheap/.test(t);
  const buy = /\bbuy\b|interested|i want|purchase|sign me up|where.*(get|buy)|cop|take my money/.test(t);
  const ship = /ship|delivery|deliver|arrive|canada|international/.test(t);
  const src = (draft.knowledge || []).find(k => k.type === "doc" || k.type === "url");

  if (mode === "comment") {
    if (spam) {
      if (has("moderate")) {
        trace.push({ ok: true, text: "Flagged an external link / spam pattern" });
        trace.push({ ok: true, text: "Hid the comment automatically" });
        events.push({ kind: "action", icon: "eye-slash", text: "Hid comment · flagged as spam" });
      } else {
        trace.push({ ok: false, text: "Looks like spam, but “Moderate junk & spam” is off" });
        events.push({ kind: "action", icon: "warning", text: "Looks like spam — turn on moderation to auto-hide" });
      }
      return { events, trace };
    }
    if (has("moderate")) trace.push({ ok: true, text: "Checked for spam — looks genuine" });
    if (has("engage")) {
      trace.push({ ok: true, text: "Liked the comment" });
      events.push({ kind: "action", icon: "heart", text: "Liked the comment" });
      const reply = pick(["ahh thank you so much 🥹", "you're the sweetest 💚", "appreciate you!! 🙌", "this made my day 🫶", "omg thank you 🥰"], t);
      trace.push({ ok: true, text: "Replied under the comment" });
      events.push({ kind: "public", text: reply });
      if ((pricey || buy) && has("reply")) {
        trace.push({ ok: true, text: "Followed up with a DM" });
        events.push({ kind: "dm", text: "hey! popping into your DMs 💌 the launch kit is $48 → shop.dmflo.co/maya", cite: src ? src.label : null });
      }
    } else {
      trace.push({ ok: false, text: "No comment capability enabled" });
      events.push({ kind: "action", icon: "moon", text: "No comment capability, so it stayed quiet" });
    }
    return { events, trace };
  }

  // DM mode
  if (has("qualify") && (buy || pricey)) {
    trace.push({ ok: true, text: "Detected buying intent" });
    events.push({ kind: "action", icon: "user-plus", text: "Tagged as Hot lead" });
  }
  if (has("faq") && (pricey || ship)) {
    trace.push({ ok: true, text: `Pulled the answer from ${src ? src.label : "your Brand Kit"}` });
    const reply = ship
      ? "yes! we ship worldwide 🌍 most orders land in 3–5 days. want me to send the link?"
      : "heya! 💚 the launch kit is $48 and ships worldwide. here's everything → shop.dmflo.co/maya";
    events.push({ kind: "dm", text: reply, cite: src ? src.label : "Brand Kit" });
    return { events, trace };
  }
  if (has("reply")) {
    trace.push({ ok: true, text: "Replied in your brand voice" });
    if (buy) events.push({ kind: "dm", text: "yesss 🙌 here's the link → shop.dmflo.co/maya, lmk if you have any qs!" });
    else events.push({ kind: "dm", text: pick(["hey hey 👋 thanks for the message! how can i help?", "omg hi! 💚 what can i do for you?", "heyy! happy to help, what's up?"], t) });
    return { events, trace };
  }
  trace.push({ ok: false, text: "No matching capability for this message" });
  events.push({ kind: "action", icon: "moon", text: "No matching capability, so the agent stayed quiet" });
  return { events, trace };
}
function pick(arr, seed) { let h = 0; for (const ch of (seed || "x")) h += ch.charCodeAt(0); return arr[h % arr.length]; }

function AgentTest({ draft }) {
  const { useState, useRef, useEffect } = React;
  const dcaps = draft.caps || [];
  const canComment = dcaps.some(c => c === "moderate" || c === "engage");
  const canDm = dcaps.some(c => c === "reply" || c === "qualify" || c === "faq");
  const [mode, setMode] = useState(canComment ? "comment" : "dm");
  const [turns, setTurns] = useState([]);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const feedRef = useRef(null);
  const timers = useRef([]);
  const allPosts = window.IG_POSTS || [];
  const watchIds = (draft.watch && draft.watch.mode === "selected" && draft.watch.postIds) || [];
  const watched = allPosts.filter(p => watchIds.includes(p.id));
  const pool = watched.length ? watched : allPosts;
  const [postIdx, setPostIdx] = useState(0);
  const post = pool[postIdx % pool.length] || { kind: "Reel", cap: "5 tips for faster launches", emoji: "🚀" };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { const el = feedRef.current; if (el) el.scrollTop = el.scrollHeight; }, [turns, busy]);
  useEffect(() => { setTurns([]); setBusy(false); timers.current.forEach(clearTimeout); }, [mode]);

  const suggestions = mode === "dm"
    ? ["how much is the launch kit?", "do you ship to canada?", "omg i want this!!", "hey! quick question"]
    : ["this is amazing 😍", "price?? 👀", "🔥 free followers → bit.ly/get", "where do i buy this"];

  function send(text) {
    const msg = (text != null ? text : val).trim();
    if (!msg || busy) return;
    setVal(""); setBusy(true);
    const { events, trace } = runAgentSim(draft, msg, mode);
    setTurns(prev => [...prev, { userText: msg, events: [], trace, done: false }]);
    events.forEach((ev, i) => {
      timers.current.push(setTimeout(() => {
        setTurns(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          last.events = [...last.events, ev];
          return next;
        });
      }, 620 + i * 720));
    });
    timers.current.push(setTimeout(() => setBusy(false), 620 + events.length * 720));
  }

  function reset() { timers.current.forEach(clearTimeout); setTurns([]); setBusy(false); }

  const empty = turns.length === 0;
  const surface = mode;

  return (
    <div className="atx">
      <div className="atx-head">
        <div className="atx-htxt">
          <div className="atx-title"><Icon name="play" weight="fill" /> Test your agent</div>
          <div className="atx-sub">You're a follower. {mode === "dm" ? "Send a DM" : "Leave a comment"} and watch {draft.name || "your agent"} react. Nothing here is real.</div>
        </div>
        {canDm && canComment && (
          <div className="seg sm">
            <button className={mode === "dm" ? "on" : ""} onClick={() => setMode("dm")}><Icon name="chat-circle-dots" /> DM</button>
            <button className={mode === "comment" ? "on" : ""} onClick={() => setMode("comment")}><Icon name="chat-text" /> Comment</button>
          </div>
        )}
        <button className="btn btn-ghost btn-icon" title="Reset" onClick={reset}><Icon name="arrow-counter-clockwise" /></button>
      </div>

      <div className="atx-body">
        <div className="atx-stage">
          {surface === "comment" && (
            <div className="atx-post">
              <div className="atx-post-head">
                <Avatar name="Maya Rin" size={30} />
                <div className="atx-post-who"><b>mayamakes</b><span className="sys">{post.kind}</span></div>
                {pool.length > 1 && (
                  <button className="atx-post-switch" title="Load another selected post" onClick={() => { setPostIdx(i => (i + 1) % pool.length); reset(); }}>
                    <Icon name="arrows-clockwise" weight="bold" /> {(postIdx % pool.length) + 1}/{pool.length}
                  </button>
                )}
              </div>
              <div className="atx-post-media">{post.emoji}</div>
              <div className="atx-post-cap"><b>mayamakes</b> {post.cap}</div>
            </div>
          )}
          <div className={`atx-feed ${surface}`} ref={feedRef}>
            {empty ? (
              <div className="atx-feed-empty">
                <span className="ate-ico"><Icon name={surface === "dm" ? "chat-circle-dots" : "chat-text"} /></span>
                <div className="ate-t">{surface === "dm" ? "Send a DM to try it" : "Leave a comment to try it"}</div>
                <div className="ate-s">Type below as if you were a follower.</div>
              </div>
            ) : turns.map((turn, ti) => (
              <div key={ti} className="atx-turn">
                {surface === "comment" ? (
                  <div className="atx-comment">
                    <Avatar name="Sam Lee" size={26} />
                    <div className="atx-comment-body"><b>sam.lee</b> {turn.userText}</div>
                  </div>
                ) : (
                  <div className="atx-dm-bubble user">{turn.userText}</div>
                )}
                {turn.events.map((ev, ei) => <AtxEvent key={ei} ev={ev} surface={surface} draft={draft} />)}
                {turn.trace.length > 0 && turn.events.length > 0 && <AtxTrace steps={turn.trace} />}
              </div>
            ))}
            {busy && (
              <div className="atx-dm-row">
                <span className="atx-dm-av"><Icon name={draft.icon} weight="fill" /></span>
                <div className="atx-dm-bubble agent typing"><span /><span /><span /></div>
              </div>
            )}
          </div>

          <div className="atx-suggest">
            {suggestions.map((s, i) => <button key={i} className="atx-sug" onClick={() => send(s)}>{s}</button>)}
          </div>
          <div className="atx-compose">
            <div className="input atx-compose-input">
              <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder={surface === "dm" ? "Type a DM as a follower…" : "Write a comment…"} />
            </div>
            <button className="btn btn-primary btn-icon" disabled={!val.trim() || busy} onClick={() => send()}><Icon name="paper-plane-tilt" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AtxTrace({ steps }) {
  const { useState } = React;
  const [open, setOpen] = useState(false);
  return (
    <div className={`atx-trace-inline${open ? " open" : ""}`}>
      <button className="atx-trace-toggle" onClick={() => setOpen(o => !o)}>
        <Icon name="list-checks" weight="bold" />
        <span>What the agent did</span>
        <span className="atx-trace-count">{steps.length}</span>
        <Icon name="caret-down" weight="bold" className="atx-trace-caret" />
      </button>
      {open && (
        <div className="atx-trace-steps">
          {steps.map((s, i) => (
            <div key={i} className={`atx-trace-step${s.ok ? "" : " off"}`}>
              <Icon name={s.ok ? "check-circle" : "minus-circle"} weight="fill" /> {s.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AtxEvent({ ev, surface, draft }) {
  if (ev.kind === "public") {
    return (
      <div className="atx-reply">
        <Avatar name="Maya Rin" size={22} />
        <div className="atx-reply-body"><b>mayamakes</b> {ev.text} <span className="atx-auto-tag">auto</span></div>
      </div>
    );
  }
  if (ev.kind === "dm") {
    return (
      <div className={`atx-dm-card${surface === "dm" ? " inline" : ""}`}>
        {surface === "comment" && <div className="atx-dm-card-head"><Icon name="paper-plane-tilt" weight="fill" /> Sent a direct message</div>}
        <div className="atx-dm-row">
          <span className="atx-dm-av"><Icon name={draft.icon} weight="fill" /></span>
          <div className="atx-dm-bubble agent">
            {ev.text}
            {ev.cite && <span className="at-cite"><Icon name="books" weight="fill" style={{ fontSize: 11 }} /> {ev.cite}</span>}
          </div>
        </div>
      </div>
    );
  }
  return <div className={`atx-action${ev.icon === "warning" ? " warn" : ""}`}><Icon name={ev.icon} weight="fill" /> {ev.text}</div>;
}

Object.assign(window, { AgentTest, runAgentSim, AtxEvent, AtxTrace });
