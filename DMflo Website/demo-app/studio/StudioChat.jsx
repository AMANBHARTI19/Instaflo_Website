// Flow Studio — the flexible chat pane. Talk in plain English; every message
// edits the shared flow. The pane opens straight into the user's own prompt.
const { useState: useChatState, useRef: useChatRef, useEffect: useChatEffect } = React;

function StudioChat({ spec, onPatch, onOpenUpload, onMinimize, seed, onSuggestName }) {
  const [messages, setMessages] = useChatState([]);
  const [val, setVal] = useChatState("");
  const [thinking, setThinking] = useChatState(false);
  const [started, setStarted] = useChatState(false);
  const bodyRef = useChatRef(null);
  const timers = useChatRef([]);
  const seeded = useChatRef(false);

  useChatEffect(() => () => timers.current.forEach(clearTimeout), []);
  useChatEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, thinking]);

  // auto-run a seed handed in from the New-flow modal (?prompt= / ?tpl=)
  useChatEffect(() => {
    if (seeded.current || !seed) return;
    seeded.current = true;
    if (seed.tpl) { const tpl = TEMPLATES.find(x => x.id === seed.tpl); if (tpl) useTemplate(tpl); }
    else if (seed.prompt) { handleSend(seed.prompt); }
  }, [seed]);

  const schedule = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  const say = m => setMessages(prev => [...prev, { from: "ai", ...m }]);

  function pushUser(text) { setMessages(prev => [...prev, { from: "user", text }]); }

  function useTemplate(tpl) {
    setStarted(true);
    pushUser(`Start from “${tpl.title}”`);
    onPatch(tpl.patch, "template");
    setThinking(true);
    schedule(() => {
      setThinking(false);
      if (tpl.ai) {
        say({ text: `Loaded the “${tpl.title}” template. It'll answer with AI — add a file, a link, or paste text so it knows your details.`, cta: "upload" });
      } else {
        say({ text: `Loaded the “${tpl.title}” template — it's on the right. Tell me anything to change: keywords, the message, who it replies to.` });
      }
    }, 780);
  }

  function handleSend(text) {
    const msg = (text != null ? text : val).trim();
    if (!msg || thinking) return;
    setVal("");
    pushUser(msg);
    setThinking(true);
    if (!started) {
      setStarted(true);
      schedule(() => {
        setThinking(false);
        const r = firstReadFromPrompt(msg);
        onPatch(r.spec, "replace");          // replace whole spec
        say({ text: r.reply, cta: r.ask === "upload" ? "upload" : null });
      }, 900);
      return;
    }
    schedule(() => {
      setThinking(false);
      const r = interpret(msg, spec);
      if (Object.keys(r.patch).length) onPatch(r.patch, "merge");
      say({ text: r.reply, cta: r.ask === "upload" ? "upload" : null });
    }, 720);
  }

  const isAI = spec.steps.some(s => s.type === "ai");
  const suggestions = isAI
    ? ["Only reply to followers", "Add a file it can answer from", "Also watch my comments"]
    : spec.triggerType === "dm"
      ? ["Use AI to answer from my files", "Wait 30 minutes", "Make the reply friendlier"]
      : ["Add keyword SALE", "Only reply to followers", "Use AI to answer questions", "Make the message shorter"];

  return (
    <div className="st-chat">
      <div className="st-chat-head">
        <span className="st-chat-spark"><Icon name="sparkle" weight="fill" /></span>
        <div>
          <div className="st-chat-title">Build with chat</div>
          <div className="st-chat-sub">Describe it in plain words — I'll edit the flow live</div>
        </div>
        {onMinimize && (
          <button className="st-chat-min" onClick={onMinimize} title="Minimize chat"><Icon name="sidebar-simple" /></button>
        )}
      </div>

      <div className="st-chat-body" ref={bodyRef}>
        {messages.map((m, i) => {
          if (m.from === "user") return <div key={i} className="st-msg-user">{m.text}</div>;
          return (
            <div key={i} className="st-msg-ai">
              <span className="st-av"><Icon name="sparkle" weight="fill" /></span>
              <div className="st-bubble">
                {m.text}
                {m.cta === "upload" && (
                  <button className="st-inline-cta" onClick={onOpenUpload}>
                    <Icon name="paperclip" /> Add knowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {thinking && (
          <div className="st-msg-ai">
            <span className="st-av"><Icon name="sparkle" weight="fill" /></span>
            <div className="st-bubble typing"><span /><span /><span /></div>
          </div>
        )}
      </div>

      {started && (
        <div className="st-sugg">
          {suggestions.map((s, i) => (
            <button key={i} className="st-sugg-chip" onClick={() => handleSend(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="st-compose">
        <button className="st-attach" title="Attach a file or note" onClick={onOpenUpload}>
          <Icon name="paperclip" />
        </button>
        <div className="input st-compose-input">
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={started ? "Message to tweak the flow…" : "Describe what you want to automate…"}
          />
        </div>
        <button className="btn btn-primary btn-icon" disabled={!val.trim() || thinking} onClick={() => handleSend()}>
          <Icon name="arrow-up" weight="bold" />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { StudioChat });
