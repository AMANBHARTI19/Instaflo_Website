// Instaflo Calm — Agent live test (act as a contact, agent responds to setup)
function runAgent(draft, text, mode) {
  const t = text.toLowerCase();
  const caps = draft.caps || [];
  const has = c => caps.includes(c);
  const out = [];
  const spam = /(https?:\/\/|www\.|\.com\/|follow back|check my page|free followers|earn \$|click here|promo code)/i.test(text) || /(.)\1{6,}/.test(text);
  const pricey = /price|pricing|cost|how much|\$\d|expensive|cheap/.test(t);
  const buy = /\bbuy\b|interested|i want|purchase|sign me up|where.*(get|buy)|cop|take my money/.test(t);
  const ship = /ship|delivery|deliver|arrive|canada|international/.test(t);

  // moderation (comments)
  if (mode === "comment" && has("moderate") && spam) {
    out.push({ from: "action", icon: "eye-slash", text: "Hid comment · flagged as spam" });
    return out;
  }
  if (mode === "comment" && spam && !has("moderate")) {
    out.push({ from: "action", icon: "warning", text: "Looks like spam. Enable “Moderate junk & spam” to auto-hide" });
    return out;
  }
  // qualify
  if (has("qualify") && (buy || pricey)) {
    out.push({ from: "action", icon: "user-plus", text: "Tagged as Hot lead" });
  }
  // FAQ from knowledge
  if (has("faq") && (pricey || ship)) {
    const src = (draft.knowledge || []).find(k => k.type === "doc" || k.type === "url");
    const reply = ship
      ? "yes! we ship worldwide 🌍 most orders land in 3–5 days. want me to send the link?"
      : "heya! 💚 the launch kit is $48 and ships worldwide. here's everything → shop.dmflo.co/maya";
    out.push({ from: "agent", text: reply, cite: src ? src.label : null });
    return out;
  }
  // engage comments
  if (mode === "comment" && has("engage")) {
    out.push({ from: "action", icon: "heart", text: "Liked the comment" });
    out.push({ from: "agent", text: pick(["ahh thank you so much 🥹", "you're the sweetest 💚 ", "appreciate you!! 🙌", "this made my day 🫶"], t) });
    return out;
  }
  // default reply
  if (has("reply")) {
    if (buy) out.push({ from: "agent", text: "yesss 🙌 here's the link → shop.dmflo.co/maya, lmk if you have any qs!" });
    else out.push({ from: "agent", text: pick(["hey hey 👋 thanks for the message! how can i help?", "omg hi! 💚 what can i do for you?", "heyy! happy to help, what's up?"], t) });
    return out;
  }
  // nothing matched
  if (mode === "comment" && has("moderate")) {
    out.push({ from: "action", icon: "check-circle", text: "Looks genuine, so left it up" });
    return out;
  }
  out.push({ from: "action", icon: "moon", text: "No matching capability, so the agent stayed quiet" });
  return out;
}
function pick(arr, seed) { let h = 0; for (const ch of (seed || "x")) h += ch.charCodeAt(0); return arr[h % arr.length]; }

function AgentTest({ draft }) {
  const { useState, useRef, useEffect } = React;
  const [mode, setMode] = useState("dm");
  const [events, setEvents] = useState([]);
  const [val, setVal] = useState("");
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [events, thinking]);
  useEffect(() => { setEvents([]); }, [mode]);

  const suggestions = mode === "dm"
    ? ["how much is the launch kit?", "do you ship to canada?", "omg i want this!!", "hey! quick question"]
    : ["this is amazing 😍", "price?? 👀", "🔥 free followers → followz.com/get", "where do i buy this"];

  function send(text) {
    const msg = (text != null ? text : val).trim();
    if (!msg || thinking) return;
    setVal("");
    setEvents(e => [...e, { from: "user", text: msg }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setEvents(e => [...e, ...runAgent(draft, msg, mode)]);
    }, 650);
  }

  const empty = events.length === 0;

  return (
    <div className="agent-test">
      <div className="at-head">
        <div className="at-htxt">
          <div className="at-title"><Icon name="play" weight="fill" /> Test your agent</div>
          <div className="at-hint">You're a contact. Message {draft.name} and watch it respond.</div>
        </div>
        <div className="seg sm">
          <button className={mode === "dm" ? "on" : ""} onClick={() => setMode("dm")}><Icon name="chat-circle-dots" /> DM</button>
          <button className={mode === "comment" ? "on" : ""} onClick={() => setMode("comment")}><Icon name="chat-text" /> Comment</button>
        </div>
        <button className="btn btn-ghost btn-icon" title="Reset" onClick={() => setEvents([])}><Icon name="arrow-counter-clockwise" /></button>
      </div>

      <div className="at-body" ref={bodyRef}>
        {empty ? (
          <div className="at-empty">
            <span className="ate-ico"><Icon name={mode === "dm" ? "chat-circle-dots" : "chat-text"} /></span>
            <div className="ate-t">{mode === "dm" ? "Simulate a DM" : "Simulate a comment"}</div>
            <div className="ate-s">Send a message below to see how this agent reacts based on its setup.</div>
          </div>
        ) : (
          <div className="at-sys">{mode === "dm" ? "Direct message" : "Comment on “5 tips for faster launches”"}</div>
        )}
        {events.map((e, i) => {
          if (e.from === "user") return <div key={i} className="at-bubble user">{e.text}</div>;
          if (e.from === "agent") return (
            <div key={i} className="at-arow">
              <span className="at-av"><Icon name={draft.icon} weight="fill" /></span>
              <div className="at-bubble agent">
                {e.text}
                {e.cite && <span className="at-cite"><Icon name="books" weight="fill" style={{ fontSize: 11 }} /> {e.cite}</span>}
              </div>
            </div>
          );
          return <div key={i} className="at-action"><Icon name={e.icon} weight="fill" /> {e.text}</div>;
        })}
        {thinking && (
          <div className="at-arow">
            <span className="at-av"><Icon name={draft.icon} weight="fill" /></span>
            <div className="at-bubble agent typing"><span /><span /><span /></div>
          </div>
        )}
      </div>

      <div className="at-suggest-row">
        {suggestions.map((s, i) => (
          <button key={i} className="at-sug" onClick={() => send(s)}>{s}</button>
        ))}
      </div>
      <div className="at-compose">
        <div className="input" style={{ flex: 1, borderRadius: "var(--r-pill)", padding: "9px 15px" }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={mode === "dm" ? "Type a DM as a contact…" : "Type a comment…"}
          />
        </div>
        <button className="btn btn-primary btn-icon" disabled={!val.trim()} onClick={() => send()}><Icon name="paper-plane-tilt" /></button>
      </div>
    </div>
  );
}

Object.assign(window, { AgentTest, runAgent });
