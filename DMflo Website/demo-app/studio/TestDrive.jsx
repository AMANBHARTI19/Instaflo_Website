// Flow Studio — Test drive. Role-play as a follower (comment or DM, depending
// on the flow) and watch the automation react, with a plain-English trace.
const { useState: useTestState, useRef: useTestRef, useEffect: useTestEffect } = React;

function TestDrive({ spec, onClose }) {
  const surface = spec.triggerType === "dm" ? "dm" : "comment";
  const [turns, setTurns] = useTestState([]);
  const [val, setVal] = useTestState("");
  const [busy, setBusy] = useTestState(false);
  const feedRef = useTestRef(null);
  const timers = useTestRef([]);
  const post = IG_CONTENT.find(p => p.id === spec.postId) || IG_CONTENT[0];

  useTestEffect(() => () => timers.current.forEach(clearTimeout), []);
  useTestEffect(() => { const el = feedRef.current; if (el) el.scrollTop = el.scrollHeight; }, [turns, busy]);

  const suggestions = surface === "dm"
    ? ["how much is the launch kit?", "do you ship to canada?", "omg i want this!!", "what's your return policy?"]
    : spec.anyComment
      ? ["love this! 😍", "need this in my life", "🔥🔥🔥"]
      : [spec.keywords[0] || "PRICE", `${spec.keywords[0] || "PRICE"}!! 🙌`, "how much??", "free followers → bit.ly/x"];

  function send(text) {
    const msg = (text != null ? text : val).trim();
    if (!msg || busy) return;
    setVal(""); setBusy(true);
    const { events, trace } = simulate(spec, msg);
    const turn = { userText: msg, events: [], trace, revealed: 0 };
    setTurns(prev => [...prev, turn]);
    // reveal events one at a time for a live feel
    events.forEach((ev, i) => {
      timers.current.push(setTimeout(() => {
        setTurns(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          last.events = [...last.events, ev];
          return next;
        });
      }, 600 + i * 700));
    });
    timers.current.push(setTimeout(() => setBusy(false), 600 + events.length * 700));
  }

  const empty = turns.length === 0;

  return (
    <Portal>
      <div className="st-test-overlay">
        <div className="st-test">
          <div className="st-test-head">
            <div className="st-test-htxt">
              <div className="st-test-title"><Icon name="play" weight="fill" /> Test drive</div>
              <div className="st-test-sub">You're a follower. {surface === "dm" ? "Send a DM" : "Leave a comment"} and watch “{spec.name}” react. Nothing here is real.</div>
            </div>
            <button className="btn btn-ghost btn-icon" title="Reset" onClick={() => { setTurns([]); setBusy(false); }}><Icon name="arrow-counter-clockwise" /></button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}><Icon name="x" /> Close</button>
          </div>

          <div className="st-test-body">
            {/* stage */}
            <div className="st-stage">
              {surface === "comment" && (
                <div className="st-post">
                  <div className="st-post-head">
                    <Avatar name="Maya Rin" size={32} />
                    <div className="st-post-who"><b>mayamakes</b><span className="sys">{post.kind}</span></div>
                  </div>
                  <div className="st-post-media">{post.emoji}</div>
                  <div className="st-post-cap"><b>mayamakes</b> {post.cap}</div>
                </div>
              )}
              <div className={`st-feed ${surface}`} ref={feedRef}>
                {empty && (
                  <div className="st-feed-empty">
                    <span className="ate-ico"><Icon name={surface === "dm" ? "chat-circle-dots" : "chat-text"} /></span>
                    <div className="ate-t">{surface === "dm" ? "Send a DM to try it" : "Leave a comment to try it"}</div>
                    <div className="ate-s">Type below as if you were a follower.</div>
                  </div>
                )}
                {turns.map((turn, ti) => (
                  <div key={ti} className="st-turn">
                    {surface === "comment" ? (
                      <div className="st-comment">
                        <Avatar name="Sam Lee" size={28} />
                        <div className="st-comment-body"><b>sam.lee</b> {turn.userText}</div>
                      </div>
                    ) : (
                      <div className="st-dm-bubble user">{turn.userText}</div>
                    )}
                    {turn.events.map((ev, ei) => <EventBubble key={ei} ev={ev} surface={surface} spec={spec} />)}
                  </div>
                ))}
                {busy && (
                  <div className="st-dm-row">
                    <span className="st-dm-av"><Icon name="sparkle" weight="fill" /></span>
                    <div className="st-dm-bubble agent typing"><span /><span /><span /></div>
                  </div>
                )}
              </div>
              <div className="st-test-suggest">
                {suggestions.map((s, i) => <button key={i} className="st-sugg-chip" onClick={() => send(s)}>{s}</button>)}
              </div>
              <div className="st-test-compose">
                <div className="input st-compose-input">
                  <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                    placeholder={surface === "dm" ? "Type a DM as a follower…" : "Write a comment…"} />
                </div>
                <button className="btn btn-primary btn-icon" disabled={!val.trim() || busy} onClick={() => send()}><Icon name="paper-plane-tilt" /></button>
              </div>
            </div>

            {/* trace */}
            <div className="st-trace">
              <div className="st-trace-head"><Icon name="list-checks" weight="bold" /> What the automation did</div>
              <div className="st-trace-body">
                {empty && <div className="st-trace-empty">Steps will appear here so you can see exactly why it did — or didn't — respond.</div>}
                {turns.map((turn, ti) => (
                  <div key={ti} className="st-trace-turn">
                    <div className="st-trace-in">“{turn.userText}”</div>
                    {turn.trace.map((s, si) => (
                      <div key={si} className={`st-trace-step${s.ok ? "" : " off"}`}>
                        <Icon name={s.ok ? "check-circle" : "minus-circle"} weight="fill" /> {s.text}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function EventBubble({ ev, surface, spec }) {
  if (ev.kind === "public") {
    return (
      <div className="st-reply">
        <Avatar name="Maya Rin" size={24} />
        <div className="st-reply-body"><b>mayamakes</b> {ev.text} <span className="st-auto-tag">auto</span></div>
      </div>
    );
  }
  // a DM — render as a little inbound-DM card
  return (
    <div className={`st-dm-card${surface === "dm" ? " inline" : ""}`}>
      {surface === "comment" && <div className="st-dm-card-head"><Icon name="paper-plane-tilt" weight="fill" /> Sent a direct message</div>}
      <div className="st-dm-row">
        <span className="st-dm-av"><Icon name={spec.icon} weight="fill" /></span>
        <div className="st-dm-bubble agent">
          {ev.text}
          {ev.cite && <span className="at-cite"><Icon name="books" weight="fill" style={{ fontSize: 11 }} /> {ev.cite}</span>}
          {ev.links && ev.links.length > 0 && (
            <div className="dm-links" style={{ marginTop: 8 }}>
              {ev.links.map((ln, i) => <div key={i} className="dm-linkbtn"><span>{ln.label || "Open"}</span></div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TestDrive });
