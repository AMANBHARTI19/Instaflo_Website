// DMflo Calm — Story reply → DM flow builder (story variant of the comment builder)
function StoryBuilderScreen({ auto, plan, onPublish }) {
  const { useState } = React;
  const isPro = plan && plan.isPro;

  // Currently-live stories (24h window). Ephemeral, so a "future" catch-all exists too.
  const STORIES = [
    { id: "s1", kind: "Story", cap: "New drop teaser",      emoji: "\uD83D\uDECD\uFE0F", left: "8h left",  views: "2.4k", tint: "linear-gradient(145deg, oklch(0.9 0.09 20), oklch(0.86 0.11 45))" },
    { id: "s2", kind: "Story", cap: "Poll: which color?",   emoji: "\uD83C\uDFA8",       left: "6h left",  views: "1.9k", tint: "linear-gradient(145deg, oklch(0.88 0.1 300), oklch(0.85 0.11 260))" },
    { id: "s3", kind: "Story", cap: "Behind the scenes",    emoji: "\uD83C\uDFAC",       left: "3h left",  views: "980",  tint: "linear-gradient(145deg, oklch(0.86 0.09 200), oklch(0.83 0.1 165))" },
    { id: "s4", kind: "Story", cap: "Reply LINK for guide", emoji: "\uD83D\uDCD8",       left: "1h left",  views: "640",  tint: "linear-gradient(145deg, oklch(0.9 0.13 120), oklch(0.86 0.12 95))" },
    { id: "s5", kind: "Story", cap: "Studio tour",          emoji: "\uD83C\uDFE0",       left: "11h left", views: "3.1k", tint: "linear-gradient(145deg, oklch(0.88 0.1 75), oklch(0.85 0.11 40))" },
    { id: "s6", kind: "Story", cap: "Q&A \u2014 ask me",       emoji: "\uD83D\uDCAC",       left: "9h left",  views: "2.2k", tint: "linear-gradient(145deg, oklch(0.87 0.1 240), oklch(0.85 0.11 200))" },
    { id: "s7", kind: "Story", cap: "Packing orders",       emoji: "\uD83D\uDCE6",       left: "5h left",  views: "1.4k", tint: "linear-gradient(145deg, oklch(0.89 0.1 340), oklch(0.86 0.11 305))" },
    { id: "s8", kind: "Story", cap: "Restock alert",        emoji: "\uD83D\uDD14",       left: "2h left",  views: "870",  tint: "linear-gradient(145deg, oklch(0.9 0.12 140), oklch(0.86 0.11 175))" },
  ];

  const [sel, setSel] = useState("story");
  const [storySrc, setStorySrc] = useState("specific"); // specific | any
  const [story, setStory] = useState("s4");
  const [showAll, setShowAll] = useState(false);
  const STORY_PREVIEW = 4;
  const [showUpgrade, setShowUpgrade] = useState(null);

  const [anyReply, setAnyReply] = useState(false);
  const [keywords, setKeywords] = useState(["LINK"]);
  const [kwInput, setKwInput] = useState("");
  const [emojiOn, setEmojiOn] = useState(true);
  const [emojis, setEmojis] = useState(["\uD83D\uDD25", "\u2764\uFE0F"]);
  const EMOJI_POOL = ["\uD83D\uDD25", "\u2764\uFE0F", "\uD83D\uDE0D", "\uD83D\uDC4F", "\uD83D\uDE2E", "\uD83D\uDE4C", "\uD83D\uDCAF"];
  const [reactBack, setReactBack] = useState(true); // auto-react ❤️ to their reply

  const [msg, setMsg] = useState("ahh thanks for replying! \uD83D\uDC9A here's the link you asked for \uD83D\uDC47");
  const [links, setLinks] = useState([{ label: "Get the link", url: "https://shop.dmflo.co/maya" }]);
  const [requireFollow, setRequireFollow] = useState(false);
  const [followMsg, setFollowMsg] = useState("one tiny thing first \u2014 hit follow and I'll send it right over \uD83D\uDC9B");
  const [followBtn, setFollowBtn] = useState("Following now");
  const [collectEmail, setCollectEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState("Want it in your inbox too? Drop your best email and it's all yours \uD83D\uDE80");
  const [delayOn, setDelayOn] = useState(true);
  const [delay, setDelay] = useState("30s");
  const DELAYS = ["instant", "30s", "1 min", "5 min", "10 min"];
  const [cooldownOn, setCooldownOn] = useState(true);
  const [cooldown, setCooldown] = useState("24h");
  const COOLDOWNS = ["6h", "12h", "18h", "24h"];

  const chosen = STORIES.find(s => s.id === story) || STORIES[0];

  const addKw = e => {
    if (e.key === "Enter" && kwInput.trim()) { setKeywords([...keywords, kwInput.trim().toUpperCase()]); setKwInput(""); }
  };
  const removeKw = k => setKeywords(keywords.filter(x => x !== k));
  const toggleEmoji = e => setEmojis(emojis.includes(e) ? emojis.filter(x => x !== e) : [...emojis, e]);

  return (
    <div className="builder-shell">
      {/* canvas */}
      <div className="canvas-area">
        <div className="builder-flow">
          <div className="sys" style={{ marginBottom: 18 }}>
            Flow · {auto ? auto.name : "Story reply \u2192 DM"}
          </div>

          {/* compliance rail */}
          <div className="compliance-note">
            <Icon name="clock-countdown" weight="bold" />
            <span>Replies open a <b>24-hour</b> window. DMflo sends within it — no cold messages, always compliant.</span>
          </div>

          <div className={`bnode source${sel === "story" ? " sel" : ""}`} onClick={() => setSel("story")}>
            <div className="nhead">
              <span className="ni"><Icon name="image-square" /></span>
              <span className="nt">Choose a story</span>
              <span className="sys">Source</span>
            </div>
            <div className="nbody">
              {storySrc === "specific" ? (
                <div className="post-chosen">
                  <span className="pc-thumb story">{chosen.emoji}</span>
                  <span style={{ minWidth: 0 }}>
                    <b>{chosen.cap}</b>
                    <span className="pc-meta">{chosen.left} · {chosen.views} views</span>
                  </span>
                </div>
              ) : <span>Runs on <b>every story</b> you post, now and later</span>}
            </div>
          </div>

          <div className="connector" />

          <div className={`bnode trigger${sel === "trigger" ? " sel" : ""}`} onClick={() => setSel("trigger")}>
            <div className="nhead">
              <span className="ni"><Icon name="chat-teardrop-text" /></span>
              <span className="nt">When someone replies</span>
              <span className="sys">Trigger</span>
            </div>
            <div className="nbody">
              On <b>{storySrc === "specific" ? "this story" : "any story"}</b>, {anyReply ? "for every reply or reaction:" : "if their reply contains:"}
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                {anyReply
                  ? <span className="chip-kw">ANY REPLY</span>
                  : <>
                      {keywords.map(k => <span className="chip-kw" key={k}>{k}</span>)}
                      {emojiOn && emojis.map(e => <span className="chip-emoji" key={e}>{e}</span>)}
                    </>}
              </div>
            </div>
          </div>

          {isPro && reactBack && (
            <React.Fragment>
              <div className="connector" />
              <div className="bnode action" onClick={() => setSel("trigger")} style={{ cursor: "pointer" }}>
                <div className="nhead">
                  <span className="ni"><Icon name="heart" /></span>
                  <span className="nt">React to their reply</span>
                  <span className="sys">Acknowledge</span>
                </div>
                <div className="nbody">
                  Sends a quick <b>❤️</b> back so they feel seen the second they reply.
                </div>
              </div>
            </React.Fragment>
          )}

          {isPro && delayOn && delay !== "instant" && (
            <React.Fragment>
              <div className="connector" />
              <div className="bnode cond" onClick={() => setSel("dm")} style={{ cursor: "pointer" }}>
                <div className="nhead">
                  <span className="ni"><Icon name="hourglass-medium" /></span>
                  <span className="nt">Wait a moment</span>
                  <span className="sys">Delay</span>
                </div>
                <div className="nbody">
                  Pauses <b>{delay}</b> before the first message, so it feels typed by hand.
                </div>
              </div>
            </React.Fragment>
          )}

          {isPro && requireFollow && (
            <React.Fragment>
              <div className="connector" />
              <div className="bnode action" onClick={() => setSel("dm")} style={{ cursor: "pointer" }}>
                <div className="nhead">
                  <span className="ni"><Icon name="user-plus" /></span>
                  <span className="nt">Ask them to follow</span>
                  <span className="sys">Gate</span>
                </div>
                <div className="nbody">
                  <div className="dm-preview">
                    <div className="dm-text">{followMsg}</div>
                    <div className="dm-links">
                      <div className="dm-linkbtn"><Icon name="user-plus" style={{ fontSize: 13 }} /> <span>{followBtn.trim() || "Button label"}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}

          {isPro && collectEmail && (
            <React.Fragment>
              <div className="connector" />
              <div className="bnode action" onClick={() => setSel("dm")} style={{ cursor: "pointer" }}>
                <div className="nhead">
                  <span className="ni"><Icon name="envelope-simple" /></span>
                  <span className="nt">Collect their email</span>
                  <span className="sys">Before link</span>
                </div>
                <div className="nbody">
                  <div className="dm-preview"><div className="dm-text">{emailMsg}</div></div>
                </div>
              </div>
            </React.Fragment>
          )}

          <div className="connector" />

          <div className={`bnode action${sel === "dm" ? " sel" : ""}`} onClick={() => setSel("dm")}>
            <div className="nhead">
              <span className="ni"><Icon name="paper-plane-tilt" /></span>
              <span className="nt">Send a DM</span>
              <span className="sys">Action</span>
            </div>
            <div className="nbody">
              <div className="dm-preview">
                <div className="dm-text">{msg}</div>
                {links.length > 0 && (
                  <div className="dm-links">
                    {links.map((ln, i) => <div key={i} className="dm-linkbtn"><span>{ln.label.trim() || "Button label"}</span></div>)}
                  </div>
                )}
              </div>
              {isPro && cooldownOn && (
                <div className="node-foot"><Icon name="shield-check" weight="fill" /> One DM per person every <b>{cooldown}</b></div>
              )}
            </div>
          </div>

          <div className="connector" />
        </div>
      </div>

      {/* inspector */}
      <aside className="inspector">
        {sel === "story" && (
          <>
            <div className="insp-body">
              <div className="sys">Source settings</div>
              <div className="insp-h3">Which story?</div>
              <div style={{ marginTop: 18 }}>
                <div className="insp-label">Where should this run?</div>
                <div className={`insp-choice${storySrc === "specific" ? " active" : ""}`} style={{ marginBottom: 9 }} onClick={() => setStorySrc("specific")}>
                  <Icon name="selection-foreground" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct">A specific live story</div>
                    <div className="cs">Pick one story from the last 24h</div>
                  </div>
                  {storySrc === "specific" && <Icon name="check-circle" weight="fill" style={{ fontSize: 18, color: "var(--accent)", flex: "none" }} />}
                </div>
                <div className={`insp-choice${storySrc === "any" ? " active" : ""}${isPro ? "" : " locked"}`} onClick={() => isPro ? setStorySrc("any") : setShowUpgrade("Any story")}>
                  <Icon name="stack" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      Any story {!isPro && <span className="pro-tag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                    </div>
                    <div className="cs">Every story you post, now &amp; later</div>
                  </div>
                  {storySrc === "any" && isPro && <Icon name="check-circle" weight="fill" style={{ fontSize: 18, color: "var(--accent)", flex: "none" }} />}
                </div>
              </div>
              {storySrc === "specific" && (
                <div style={{ marginTop: 20 }}>
                  <div className="insp-label">Your live stories · {STORIES.length}</div>
                  <div className="story-grid">
                    {STORIES.slice(0, STORY_PREVIEW).map(s => (
                      <button key={s.id} className={`story-cell${story === s.id ? " sel" : ""}`} onClick={() => setStory(s.id)} style={{ backgroundImage: s.tint }}>
                        <span className="sc-emoji">{s.emoji}</span>
                        <span className="pcell-left"><span className="live-dot" /> {s.left}</span>
                        {story === s.id && <span className="pcell-check"><Icon name="check" weight="bold" /></span>}
                        <span className="sc-cap">{s.cap}</span>
                      </button>
                    ))}
                  </div>
                  {STORIES.length > STORY_PREVIEW && (
                    <button className="post-seeall" onClick={() => setShowAll(true)}>
                      <Icon name="squares-four" /> See all live stories
                    </button>
                  )}
                  <div className="opt-note"><Icon name="info" weight="fill" /> <span>Only stories live right now show here. Pick <b>Any story</b> to keep the flow running after they expire.</span></div>
                </div>
              )}
            </div>
            <div className="insp-done-bar sb-done">
              <button className="btn btn-primary btn-next" onClick={() => setSel("trigger")}>Next <Icon name="arrow-right" /></button>
            </div>
          </>
        )}

        {sel === "trigger" && (
          <>
            <div className="insp-body">
              <div className="sys">Trigger settings</div>
              <div className="insp-h3">Which replies fire it?</div>

              <div className={`any-comment-card${anyReply ? " on" : ""}`} onClick={() => setAnyReply(!anyReply)}>
                <span className="ac-star"><Icon name="asterisk" weight="bold" /></span>
                <div className="ac-info">
                  <div className="ac-t">Any reply counts</div>
                  <div className="ac-s">Skip keywords and reply to everyone</div>
                </div>
                <Toggle on={anyReply} onClick={e => { e.stopPropagation(); setAnyReply(!anyReply); }} />
              </div>

              <div style={{ marginTop: 18, opacity: anyReply ? 0.45 : 1, pointerEvents: anyReply ? "none" : "auto", transition: "opacity .16s" }}>
                <div className="insp-label">Keywords</div>
                <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
                  {keywords.map(k => (
                    <span className="chip-kw" key={k}>{k}<Icon name="x" weight="bold" style={{ fontSize: 10, cursor: "pointer" }} onClick={() => removeKw(k)} /></span>
                  ))}
                </div>
                <div className="input input-surface">
                  <Icon name="hash" />
                  <input placeholder="Add keyword, press ↵" value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={addKw} />
                </div>

                <div className="insp-choice" style={{ marginTop: 16 }} onClick={() => setEmojiOn(!emojiOn)}>
                  <Icon name="smiley" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct">Trigger on emoji reactions</div>
                    <div className="cs">Fire on quick reactions too</div>
                  </div>
                  <Toggle on={emojiOn} onClick={e => { e.stopPropagation(); setEmojiOn(!emojiOn); }} />
                </div>
                {emojiOn && (
                  <div className="emoji-row">
                    {EMOJI_POOL.map(e => (
                      <button key={e} className={`emoji-pick${emojis.includes(e) ? " on" : ""}`} onClick={() => toggleEmoji(e)}>{e}</button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="insp-label">Options</div>
                <div className={`insp-choice${reactBack && isPro ? " active" : ""}${isPro ? "" : " locked"}`} onClick={() => isPro ? setReactBack(!reactBack) : setShowUpgrade("React with \u2764\uFE0F")}>
                  <Icon name="heart" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      React with ❤️ {!isPro && <span className="pro-tag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                    </div>
                    <div className="cs">Auto-like their reply so it feels human</div>
                  </div>
                  {isPro && <Toggle on={reactBack} onClick={e => { e.stopPropagation(); setReactBack(!reactBack); }} />}
                </div>
              </div>
            </div>
            <div className="insp-done-bar sb-done">
              <button className="btn btn-secondary btn-back" onClick={() => setSel("story")} aria-label="Back"><Icon name="arrow-left" /></button>
              <button className="btn btn-primary btn-next" disabled={!anyReply && keywords.length === 0 && !(emojiOn && emojis.length)} onClick={() => setSel("dm")}>Next <Icon name="arrow-right" /></button>
            </div>
          </>
        )}

        {sel === "dm" && (
          <>
            <div className="insp-body">
              <div className="sys">Action settings</div>
              <div className="insp-h3">The DM</div>
              <div style={{ marginTop: 18 }}>
                <div className="insp-label">Message</div>
                <div className="input input-surface" style={{ alignItems: "flex-start" }}>
                  <textarea rows={5} value={msg} onChange={e => setMsg(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn btn-secondary btn-sm" disabled={links.length >= 2} onClick={() => links.length < 2 && setLinks([...links, { label: "", url: "" }])}>
                    <Icon name="link-simple" /> Add link
                  </button>
                </div>
                {links.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div className="insp-label">Link buttons · {links.length}/2</div>
                    {links.map((ln, i) => (
                      <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 11, marginBottom: 8, background: "var(--surface)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <span className="sys" style={{ fontSize: 10 }}>Link {i + 1}</span>
                          <div style={{ flex: 1 }} />
                          <button className="rowbtn" title="Remove" onClick={() => setLinks(links.filter((_, j) => j !== i))}><Icon name="trash" /></button>
                        </div>
                        <div className="input input-surface" style={{ padding: "8px 11px", marginBottom: 7 }}>
                          <Icon name="text-aa" />
                          <input placeholder="Button label" value={ln.label} onChange={e => setLinks(links.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                        </div>
                        <div className="input input-surface" style={{ padding: "8px 11px" }}>
                          <Icon name="link-simple" />
                          <input placeholder="https://" value={ln.url} onChange={e => setLinks(links.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="insp-label">Timing &amp; pacing</div>
                <div className={`insp-choice${delayOn && isPro ? " active" : ""}${isPro ? "" : " locked"}`} style={{ marginBottom: (isPro && delayOn) ? 0 : 9 }} onClick={() => isPro ? setDelayOn(!delayOn) : setShowUpgrade("Natural send delay")}>
                  <Icon name="hourglass-medium" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      Natural send delay {!isPro && <span className="pro-tag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                    </div>
                    <div className="cs">Wait a beat so it feels hand-typed</div>
                  </div>
                  {isPro && <Toggle on={delayOn} onClick={e => { e.stopPropagation(); setDelayOn(!delayOn); }} />}
                </div>
                {isPro && delayOn && (
                  <div className="seg-row">
                    {DELAYS.map(d => (
                      <button key={d} className={`seg-pick${delay === d ? " on" : ""}`} onClick={() => setDelay(d)}>{d}</button>
                    ))}
                  </div>
                )}
                <div className={`insp-choice${cooldownOn && isPro ? " active" : ""}${isPro ? "" : " locked"}`} style={{ marginTop: 9 }} onClick={() => isPro ? setCooldownOn(!cooldownOn) : setShowUpgrade("Per-person cooldown")}>
                  <Icon name="shield-check" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      Per-person cooldown {!isPro && <span className="pro-tag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                    </div>
                    <div className="cs">Don't re-DM the same person too soon</div>
                  </div>
                  {isPro && <Toggle on={cooldownOn} onClick={e => { e.stopPropagation(); setCooldownOn(!cooldownOn); }} />}
                </div>
                {isPro && cooldownOn && (
                  <div className="seg-row">
                    {COOLDOWNS.map(c => (
                      <button key={c} className={`seg-pick${cooldown === c ? " on" : ""}`} onClick={() => setCooldown(c)}>{c}</button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="insp-label">More options</div>
                <div className={`insp-choice${requireFollow && isPro ? " active" : ""}${isPro ? "" : " locked"}`} style={{ marginBottom: 9 }}
                  onClick={() => isPro ? setRequireFollow(!requireFollow) : setShowUpgrade("Require a follow first")}>
                  <Icon name="user-plus" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      Require a follow first {!isPro && <span className="pro-tag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                    </div>
                    <div className="cs">Only send if they follow you</div>
                  </div>
                  {isPro && <Toggle on={requireFollow} onClick={e => { e.stopPropagation(); setRequireFollow(!requireFollow); }} />}
                </div>
                {isPro && requireFollow && (
                  <div className="opt-config">
                    <div className="insp-label">The follow nudge</div>
                    <div className="input input-surface" style={{ alignItems: "flex-start", marginBottom: 14 }}>
                      <textarea rows={3} value={followMsg} onChange={e => setFollowMsg(e.target.value)} placeholder="Message asking them to follow" />
                    </div>
                    <div className="insp-label">Button label</div>
                    <div className="input input-surface">
                      <Icon name="text-aa" />
                      <input value={followBtn} onChange={e => setFollowBtn(e.target.value)} placeholder="Follow button text" />
                    </div>
                    <div className="opt-note"><Icon name="check-circle" weight="fill" /> Already follows you? They skip this and get the link instantly.</div>
                  </div>
                )}
                <div className={`insp-choice${collectEmail && isPro ? " active" : ""}${isPro ? "" : " locked"}`}
                  onClick={() => isPro ? setCollectEmail(!collectEmail) : setShowUpgrade("Collect email first")}>
                  <Icon name="envelope-simple" className="ic" style={{ fontSize: 16 }} />
                  <div className="ic-info">
                    <div className="ct" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      Collect email first {!isPro && <span className="pro-tag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                    </div>
                    <div className="cs">Ask before sending the link</div>
                  </div>
                  {isPro && <Toggle on={collectEmail} onClick={e => { e.stopPropagation(); setCollectEmail(!collectEmail); }} />}
                </div>
                {isPro && collectEmail && (
                  <div className="opt-config">
                    <div className="insp-label">Email ask message</div>
                    <div className="input input-surface" style={{ alignItems: "flex-start" }}>
                      <textarea rows={4} value={emailMsg} onChange={e => setEmailMsg(e.target.value)} placeholder="Message asking for their email" />
                    </div>
                    <div className="opt-note"><Icon name="envelope-simple" weight="fill" /> Sent before the link. Their reply saves to the contact's email field automatically.</div>
                  </div>
                )}
              </div>
            </div>
            <div className="insp-done-bar sb-done">
              <button className="btn btn-secondary btn-back" onClick={() => setSel("trigger")} aria-label="Back"><Icon name="arrow-left" /></button>
              <button className="btn btn-primary btn-next" onClick={() => onPublish && onPublish(auto ? auto.id : null, auto ? auto.name : "Story reply \u2192 DM", "story")}><Icon name="lightning" weight="fill" /> Publish now</button>
            </div>
          </>
        )}
      </aside>

      {showUpgrade && <UpgradeModal feature={showUpgrade} onClose={() => setShowUpgrade(null)} />}

      {showAll && (
        <Portal>
          <div className="modal-overlay" onClick={() => setShowAll(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <div className="mh-txt">
                  <h2>Your live stories</h2>
                  <div className="mh-sub">Pick one story that's live right now to run this automation on.</div>
                </div>
                <button className="mh-close" onClick={() => setShowAll(false)} aria-label="Close"><Icon name="x" /></button>
              </div>
              <div className="modal-body">
                <div className="story-grid story-grid-lg">
                  {STORIES.map(s => (
                    <button key={s.id} className={`story-cell${story === s.id ? " sel" : ""}`} onClick={() => { setStory(s.id); setShowAll(false); }} style={{ backgroundImage: s.tint }}>
                      <span className="sc-emoji">{s.emoji}</span>
                      <span className="pcell-left"><span className="live-dot" /> {s.left}</span>
                      {story === s.id && <span className="pcell-check"><Icon name="check" weight="bold" /></span>}
                      <span className="sc-cap">{s.cap}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

Object.assign(window, { StoryBuilderScreen });
