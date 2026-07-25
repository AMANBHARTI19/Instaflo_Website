// DMflo Calm — AI flow builder (describe it in plain English → a real flow)
// Chat that asks a couple of clarifying questions, then assembles a live flow
// preview. From there you can publish, or open it in the manual builder to tweak.

const STOP_KW = new Set(["DM", "FAQ", "AI", "URL", "OK", "USA", "UK"]);

function parseRequest(text) {
  const t = text.toLowerCase();
  // Trigger precedence: an explicit "comment"/"story"/"mention" wins even if the
  // word "DM" also appears (there it's usually the action, e.g. "DM them the link").
  let triggerType = "comment";
  if (/\bcomment|\breel|\bpost\b/.test(t)) triggerType = "comment";
  else if (/\bstor(y|ies)\b|story reply/.test(t)) triggerType = "story";
  else if (/\bmention|tag(s|ged|ging)?\b/.test(t)) triggerType = "mention";
  else if (/\bdm(s|ed|ing)?\b|direct message|message me|messages me|inbox/.test(t)) triggerType = "dm";

  // keywords: quoted tokens or ALL-CAPS words
  const quoted = [...text.matchAll(/["'‘’“”]\s*([A-Za-z0-9]{2,})\s*["'‘’“”]/g)].map(m => m[1].toUpperCase());
  const caps = [...text.matchAll(/\b([A-Z][A-Z0-9]{1,})\b/g)].map(m => m[1]).filter(w => !STOP_KW.has(w));
  let keywords = [...new Set([...quoted, ...caps])].slice(0, 4);
  if (!keywords.length) {
    if (/pric|cost|how much/.test(t)) keywords = ["PRICE"];
    else if (/guide|freebie|lead magnet|checklist|ebook|pdf/.test(t)) keywords = ["GUIDE"];
    else if (/waitlist|join|sign ?up|early access/.test(t)) keywords = ["JOIN"];
    else if (/discount|code|coupon|sale/.test(t)) keywords = ["SAVE"];
    else if (/link/.test(t)) keywords = ["LINK"];
    else keywords = ["LINK"];
  }
  const url = (text.match(/https?:\/\/[^\s]+/) || [])[0] || "https://shop.dmflo.co/maya";

  // goal → name + icon + default message
  let goal = "link";
  if (/guide|freebie|lead magnet|checklist|ebook|pdf/.test(t)) goal = "guide";
  else if (/waitlist|join|sign ?up|early access/.test(t)) goal = "waitlist";
  else if (/discount|code|coupon|sale/.test(t)) goal = "discount";
  else if (/pric|cost/.test(t)) goal = "price";
  else if (triggerType === "story") goal = "welcome";

  const preset = {
    link:     { name: "Comment → DM the link", icon: "link",           msg: "hey! 👋 here's the link you asked for → " },
    guide:    { name: "Reels → free guide",     icon: "book-open",      msg: "yay! 📚 here's your free guide, hope it helps → " },
    waitlist: { name: "Waitlist collector",     icon: "user-plus",      msg: "you're on the list! 🎉 tap below and I'll ping you the second we launch → " },
    discount: { name: "Discount for repliers",  icon: "percent",        msg: "here's your code 💸 use it at checkout → " },
    price:    { name: "Comment → pricing",      icon: "tag",            msg: "heya! 💚 here's the full pricing + everything you need → " },
    welcome:  { name: "Story reply welcome",    icon: "image",          msg: "ahh thanks for replying! 🫶 here's a lil something for you → " },
  }[goal];

  return { triggerType, keywords, url, goal, ...preset };
}

function planFor(triggerType) {
  if (triggerType === "comment") return ["source", "public", "extras"];
  if (triggerType === "story")   return ["source", "extras"];
  return ["extras"];
}

const QUESTIONS = {
  source: {
    text: "Nice — should it watch one specific post, or every post and reel you publish?",
    chips: [
      { label: "A specific post", value: "specific" },
      { label: "Any post or reel", value: "any", pro: true },
    ],
    apply: (s, v) => ({ ...s, postSrc: v }),
  },
  public: {
    text: "Want me to also reply publicly under their comment? It nudges others to comment too, and makes it feel handwritten.",
    chips: [
      { label: "Yes, reply publicly", value: true },
      { label: "Just DM them", value: false },
    ],
    apply: (s, v) => ({ ...s, publicReply: v }),
  },
  extras: {
    text: "Last thing — capture anything before the DM goes out?",
    chips: [
      { label: "Just send it", value: "none" },
      { label: "Collect email first", value: "email", pro: true },
      { label: "Require a follow", value: "follow", pro: true },
    ],
    apply: (s, v) => ({ ...s, collectEmail: v === "email", requireFollow: v === "follow" }),
  },
};

const TRIGGER_LABEL = { comment: "comment", story: "story reply", dm: "DM", mention: "mention" };

function AIFlowBuilder({ initialPrompt, attachments, agent, isPro, onOpenInBuilder, onPublish, onCancel }) {
  const { useState, useRef, useEffect } = React;
  const [messages, setMessages] = useState([]);
  const [spec, setSpec] = useState(null);
  const [plan, setPlan] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);   // -1 before first prompt
  const [phase, setPhase] = useState("await");   // await | asking | building | ready
  const [val, setVal] = useState("");
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef(null);
  const timers = useRef([]);
  const started = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  function schedule(fn, ms) { const t = setTimeout(fn, ms); timers.current.push(t); return t; }
  function say(msg) { setMessages(m => [...m, { from: "ai", ...msg }]); }

  // kick off — greet, or consume the prompt passed from Home
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initialPrompt && initialPrompt.trim()) {
      handleFirst(initialPrompt.trim());
    } else {
      say({ text: "Tell me what you'd like to automate — in plain English. For example: “when someone comments PRICE on my new reel, DM them my shop link.”" });
      setPhase("await");
    }
  }, []);

  function handleFirst(text) {
    setMessages(m => [...m, { from: "user", text }]);
    const parsed = parseRequest(text);
    const base = {
      ...parsed,
      postSrc: "specific",
      publicReply: parsed.triggerType === "comment",
      collectEmail: false,
      requireFollow: false,
      links: [{ label: parsed.goal === "waitlist" ? "Join the waitlist" : "Open the link", url: parsed.url }],
      replies: ["Sent you a DM! 💌", "Check your inbox 👀", "Just slid into your DMs 🚀"],
      anyComment: parsed.keywords.length === 0,
    };
    setSpec(base);
    const p = planFor(parsed.triggerType);
    setPlan(p);
    setThinking(true);
    schedule(() => {
      setThinking(false);
      say({
        text: `Got it. I'll watch your ${TRIGGER_LABEL[parsed.triggerType]}s${parsed.keywords.length ? ` for ${parsed.keywords.map(k => `“${k}”`).join(", ")}` : ""} and auto-DM the ${parsed.goal === "guide" ? "guide" : parsed.goal === "waitlist" ? "waitlist link" : "link"}. A couple of quick questions 👇`,
      });
      schedule(() => askStep(0, p), 520);
    }, 900);
  }

  function askStep(idx, p) {
    if (idx >= p.length) { build(); return; }
    setStepIdx(idx);
    setPhase("asking");
    const q = QUESTIONS[p[idx]];
    say({ text: q.text, chips: q.chips, qkey: p[idx] });
  }

  function answer(qkey, chip, freeText) {
    const label = chip ? chip.label : freeText;
    setMessages(m => [...m.map(x => ({ ...x, chips: x.qkey === qkey ? null : x.chips })), { from: "user", text: label }]);
    // pro-gate: locked choices fall back to the free default but stay friendly
    let value = chip ? chip.value : defaultFor(qkey);
    if (chip && chip.pro && !isPro) {
      setSpec(s => QUESTIONS[qkey].apply(s, defaultFor(qkey)));
      setThinking(true);
      schedule(() => {
        setThinking(false);
        say({ text: `That one's a Pro perk 👑 — I'll leave it off for now, you can flip it on anytime. Moving on.` });
        schedule(() => askStep(stepIdx + 1, plan), 480);
      }, 700);
      return;
    }
    setSpec(s => QUESTIONS[qkey].apply(s, value));
    // choosing a specific post → let them pick exactly which one, right here in chat
    if (qkey === "source" && value === "specific") {
      setThinking(true);
      setPhase("picking");
      schedule(() => {
        setThinking(false);
        say({ text: "Which post or reel should it watch? Tap one 👇", kind: "postpick" });
      }, 650);
      return;
    }
    setThinking(true);
    schedule(() => {
      setThinking(false);
      schedule(() => askStep(stepIdx + 1, plan), 120);
    }, 650);
  }

  function pickPost(p) {
    setSpec(s => ({ ...s, postSrc: "specific", postId: p.id, postCap: p.cap, postEmoji: p.emoji, postKind: p.kind }));
    setMessages(m => [
      ...m.map(x => x.kind === "postpick" ? { ...x, kind: "postpick-done", picked: p.id } : x),
      { from: "user", text: p.cap },
    ]);
    setPhase("asking");
    setThinking(true);
    schedule(() => {
      setThinking(false);
      schedule(() => askStep(stepIdx + 1, plan), 120);
    }, 600);
  }

  function defaultFor(qkey) {
    if (qkey === "source") return "specific";
    if (qkey === "public") return true;
    return "none";
  }

  function build() {
    setPhase("building");
    setStepIdx(-1);
    say({ kind: "building" });
    schedule(() => {
      setPhase("ready");
      setMessages(m => [
        ...m.filter(x => x.kind !== "building"),
        { from: "ai", kind: "flow", text: "All set — here's your flow 🎉 Publish it now, or open it in the builder to fine-tune the wording." },
      ]);
    }, 2100);
  }

  function onSend() {
    const text = val.trim();
    if (!text || thinking) return;
    if (phase === "picking") return;
    setVal("");
    if (phase === "await") { handleFirst(text); return; }
    if (phase === "asking") {
      const qkey = plan[stepIdx];
      answer(qkey, null, text);
      return;
    }
    // free chat after ready — accept as a tweak note, keep it light
    setMessages(m => [...m, { from: "user", text }]);
    setThinking(true);
    schedule(() => {
      setThinking(false);
      say({ text: "Got it — tweak that and anything else directly in the builder, or publish as-is 👇" });
    }, 700);
  }

  const buildingLabels = ["Reading your request", "Mapping the trigger", "Writing the DM", "Wiring it up"];

  function renderMsg(m, i) {
    if (m.from === "user") return <div key={i} className="aifc-user">{m.text}</div>;

    // building card (inline)
    if (m.kind === "building") {
      return (
        <div key={i} className="aifc-airow">
          <span className="aifc-av"><Icon name="sparkle" weight="fill" /></span>
          <div className="aifc-buildcard">
            <div className="aifc-buildhead"><span className="aifc-buildspin" /> Building your flow…</div>
            <div className="aifc-buildsteps">
              {buildingLabels.map((l, k) => (
                <div key={k} className="aifc-bstep" style={{ animationDelay: `${0.15 + k * 0.42}s` }}>
                  <span className="aifc-bcheck"><Icon name="check" weight="bold" /></span>{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // finished flow — an inline artifact card with actions
    if (m.kind === "flow" && spec) {
      return (
        <div key={i} className="aifc-airow">
          <span className="aifc-av"><Icon name="sparkle" weight="fill" /></span>
          <div className="aifc-colwide">
            <div className="aifc-abubble">{m.text}</div>
            <div className="aifc-flowcard">
              <div className="aifc-flowhead">
                <span className="aifc-flowicon"><Icon name={spec.icon} weight="fill" /></span>
                <div className="aifc-flowtitles">
                  <div className="aifc-flowname">{spec.name}</div>
                  <div className="sys">Ready to publish</div>
                </div>
                <span className="aifp-ready"><span className="dot beat" /> Ready</span>
              </div>
              <div className="aifc-flowbody"><FlowPreview spec={spec} /></div>
              <div className="aifc-flowactions">
                <button className="btn btn-secondary" onClick={() => onOpenInBuilder(spec)}>
                  <Icon name="sliders-horizontal" /> Open in builder
                </button>
                <button className="btn btn-primary" onClick={() => onPublish(spec)}>
                  <Icon name="lightning" weight="fill" /> Publish flow
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // normal assistant message (text + quick-reply chips + post picker)
    return (
      <div key={i} className="aifc-airow">
        <span className="aifc-av"><Icon name="sparkle" weight="fill" /></span>
        <div className="aifc-abubble">
          {m.text}
          {m.chips && (
            <div className="aifc-chips">
              {m.chips.map((c, j) => (
                <button key={j} className={`aifc-chip${c.pro && !isPro ? " pro" : ""}`} onClick={() => answer(m.qkey, c)}>
                  {c.label}
                  {c.pro && !isPro && <span className="aifc-pro"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                </button>
              ))}
            </div>
          )}
          {(m.kind === "postpick" || m.kind === "postpick-done") && (
            <div className="aifc-postgrid">
              {IG_POSTS.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  className={`aifc-post${m.picked === p.id ? " picked" : ""}`}
                  disabled={m.kind === "postpick-done"}
                  onClick={() => pickPost(p)}
                >
                  <span className="aifc-post-thumb">
                    {p.emoji}
                    <span className="aifc-post-kind">{p.kind}</span>
                    {m.picked === p.id && <span className="aifc-post-check"><Icon name="check" weight="bold" /></span>}
                  </span>
                  <span className="aifc-post-cap">{p.cap}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="aiflow-wrap">
      <div className="ab-header">
        <button className="btn btn-ghost btn-icon" onClick={onCancel} title="Back"><Icon name="arrow-left" /></button>
        <div className="ab-title">
          <span className="ab-ico aiflow-spark"><Icon name="sparkle" weight="fill" /></span>
          <div>
            <div className="ab-name">Create with AI</div>
            <div className="ab-sub">Describe it · we build the flow · you stay in control</div>
          </div>
        </div>
        <div className="spacer" style={{ flex: 1 }} />
        <button className="btn btn-secondary" onClick={onCancel}>
          <Icon name="sliders-horizontal" /> Build it manually
        </button>
      </div>

      {agent && (
        <div className="aiflow-agentbar">
          <span className="afa-ico"><Icon name={agent.icon || "robot"} weight="fill" /></span>
          <div className="afa-txt">
            <b>{agent.reused ? agent.name : (agent.name && agent.name !== "Building your agent\u2026" ? agent.name : "A new agent")}</b>
            {agent.reused
              ? " is powering this automation"
              : " is being set up in the background"}
            {attachments && attachments.length > 0 && " \u00b7 learning from your files"}
          </div>
          {attachments && attachments.length > 0 && (
            <div className="afa-files">
              {attachments.slice(0, 3).map((k, i) => (
                <span key={i} className="afa-file"><Icon name={k.type === "url" ? "link" : "file-text"} weight="fill" /> {k.label}</span>
              ))}
            </div>
          )}
          <a className="afa-link" onClick={() => (window.__openAgent && window.__openAgent(agent.id))}>View agent <Icon name="arrow-up-right" weight="bold" /></a>
        </div>
      )}

      <div className="aiflow-thread">
        <div className="aift-scroll" ref={bodyRef}>
          <div className="aift-inner">
            {messages.map(renderMsg)}
            {thinking && (
              <div className="aifc-airow">
                <span className="aifc-av"><Icon name="sparkle" weight="fill" /></span>
                <div className="aifc-abubble typing"><span /><span /><span /></div>
              </div>
            )}
          </div>
        </div>

        <div className="aift-compose">
          <div className="aift-composeinner">
            <div className="input" style={{ flex: 1, borderRadius: "var(--r-pill)", padding: "11px 18px" }}>
              <input
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onSend()}
                placeholder={phase === "await" ? "Describe your automation…" : phase === "picking" ? "Pick a post above…" : "Message DMflo…"}
              />
            </div>
            <button className="btn btn-primary btn-icon" disabled={!val.trim() || thinking} onClick={onSend}><Icon name="arrow-up" weight="bold" /></button>
          </div>
          <div className="aift-hint sys">DMflo builds your automation from plain English · nothing goes live until you publish</div>
        </div>
      </div>
    </div>
  );
}

function PreviewNode({ icon, title, tag, children, appear }) {
  return (
    <div className={`aifp-node${appear ? " appear" : ""}`}>
      <div className="nhead">
        <span className="ni"><Icon name={icon} /></span>
        <span className="nt">{title}</span>
        <span className="sys">{tag}</span>
      </div>
      <div className="nbody">{children}</div>
    </div>
  );
}

function FlowPreview({ spec }) {
  const trg = TRIGGER_LABEL[spec.triggerType];
  return (
    <div className="aifp-flow">
      {(spec.triggerType === "comment" || spec.triggerType === "story") && (
        <>
          <PreviewNode icon="image-square" title="Post or reel" tag="Source" appear>
            {spec.postSrc === "any"
              ? <>Runs on <b>any post or reel</b></>
              : spec.postCap
                ? <span style={{ display: "flex", alignItems: "center", gap: 9 }}><span className="aifp-postemoji">{spec.postEmoji}</span> Watches <b>{spec.postCap}</b></span>
                : <>Watches <b>your selected post</b></>}
          </PreviewNode>
          <div className="connector" />
        </>
      )}

      <PreviewNode icon="chat-teardrop-text" title={`When someone ${spec.triggerType === "comment" ? "comments" : spec.triggerType === "story" ? "replies to your story" : spec.triggerType === "mention" ? "mentions you" : "DMs you"}`} tag="Trigger" appear>
        {spec.anyComment
          ? <>On <b>every {trg}</b></>
          : <>If the {trg} contains:
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {spec.keywords.map(k => <span className="chip-kw" key={k}>{k}</span>)}
              </div>
            </>}
      </PreviewNode>

      {spec.publicReply && (
        <>
          <div className="connector" />
          <PreviewNode icon="chats" title="Reply under their comment" tag="Public" appear>
            Comments back publicly, shuffled so it feels handwritten.
          </PreviewNode>
        </>
      )}

      {spec.requireFollow && (
        <>
          <div className="connector" />
          <PreviewNode icon="user-plus" title="Ask them to follow" tag="Gate" appear>
            Only sends the link once they follow you.
          </PreviewNode>
        </>
      )}

      {spec.collectEmail && (
        <>
          <div className="connector" />
          <PreviewNode icon="envelope-simple" title="Collect their email" tag="Before link" appear>
            Asks for an email and saves it to the contact automatically.
          </PreviewNode>
        </>
      )}

      <div className="connector" />
      <PreviewNode icon="paper-plane-tilt" title="Send a DM" tag="Action" appear>
        <div className="dm-preview">
          <div className="dm-text">{spec.msg}</div>
          {spec.links && spec.links.length > 0 && (
            <div className="dm-links">
              {spec.links.map((ln, i) => <div key={i} className="dm-linkbtn"><span>{ln.label}</span></div>)}
            </div>
          )}
        </div>
      </PreviewNode>
    </div>
  );
}

Object.assign(window, { AIFlowBuilder, parseRequest });
