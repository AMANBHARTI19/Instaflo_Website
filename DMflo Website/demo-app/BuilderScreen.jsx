// Instaflo Calm — Flow builder (canvas + inspector)
function BuilderScreen({ auto, plan, onPublish, seed }) {
  const { useState, useRef, useEffect } = React;
  const POSTS = [
    { id: "p1", kind: "Reel", cap: "5 tips for faster launches", emoji: "\uD83D\uDE80", likes: "12.4k" },
    { id: "p2", kind: "Post", cap: "New drop is live",           emoji: "\uD83D\uDECD\uFE0F", likes: "8.1k" },
    { id: "p3", kind: "Reel", cap: "Behind the scenes",          emoji: "\uD83C\uDFAC", likes: "5.7k" },
    { id: "p4", kind: "Post", cap: "Q&A with you",               emoji: "\uD83D\uDCAC", likes: "3.2k" },
  ];
  const [sel, setSel] = useState("post");
  const [postSrc, setPostSrc] = useState(seed?.postSrc || "specific");
  const [post, setPost] = useState(seed?.postId || "p1");
  const [showAll, setShowAll] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(null);
  const isPro = plan && plan.isPro;
  const EXTRA = [
    { id: "p5", kind: "Post", cap: "Studio tour",    emoji: "\uD83C\uDFE0", likes: "2.1k" },
    { id: "p6", kind: "Reel", cap: "Packing orders", emoji: "\uD83D\uDCE6", likes: "9.4k" },
    { id: "p7", kind: "Post", cap: "Customer love",  emoji: "\uD83D\uDC9D", likes: "1.8k" },
    { id: "p8", kind: "Reel", cap: "Restock alert",  emoji: "\uD83D\uDD14", likes: "4.6k" },
  ];
  const ALL_POSTS = POSTS.concat(EXTRA);
  const [msg, setMsg] = useState(seed?.msg ? (seed.msg + (seed.links?.[0]?.url || "")).trim() : "hey! 👋 here's the link you asked for, plus a lil welcome gift inside 💚");
  const [keywords, setKeywords] = useState(seed?.keywords?.length ? seed.keywords : ["PRICE", "COST", "LINK"]);
  const [kwInput, setKwInput] = useState("");
  const [anyComment, setAnyComment] = useState(seed?.anyComment || false);
  const [publicReply, setPublicReply] = useState(seed ? !!seed.publicReply : true);
  const [replies, setReplies] = useState(seed?.replies?.length ? seed.replies : ["Sent you a DM! \uD83D\uDC8C", "Check your inbox \uD83D\uDC40", "Just slid into your DMs \uD83D\uDE80"]);
  const [collectEmail, setCollectEmail] = useState(seed?.collectEmail || false);
  const [requireFollow, setRequireFollow] = useState(seed?.requireFollow || false);
  const [followMsg, setFollowMsg] = useState("one tiny thing first, just hit follow and I'll send it right over 💛");
  const [followBtn, setFollowBtn] = useState("Following now");
  const [emailMsg, setEmailMsg] = useState("Thanks for your comment ❤️ Just one last thing, what's a good email for you? We'll send it to your inbox too 🚀");
  const [links, setLinks] = useState(seed?.links?.length ? seed.links : [{ label: "Get the link", url: "https://shop.dmflo.co/maya" }]);
  const chosen = ALL_POSTS.find(p => p.id === post) || ALL_POSTS[0];

  const addKw = e => {
    if (e.key === "Enter" && kwInput.trim()) {
      setKeywords([...keywords, kwInput.trim().toUpperCase()]);
      setKwInput("");
    }
  };
  const removeKw = k => setKeywords(keywords.filter(x => x !== k));

  return (
    <div className="builder-shell">
      {/* canvas */}
      <div className="canvas-area">
        <div className="builder-flow">
          <div className="sys" style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
            Flow · {auto ? auto.name : "Untitled automation"}
            {seed && <span className="ai-made-tag"><Icon name="sparkle" weight="fill" /> Generated with AI — tweak anything</span>}
          </div>

          <div className={`bnode source${sel === "post" ? " sel" : ""}`} onClick={() => setSel("post")}>
            <div className="nhead">
              <span className="ni"><Icon name="image-square" /></span>
              <span className="nt">Choose a post or reel</span>
              <span className="sys">Source</span>
            </div>
            <div className="nbody">
              {postSrc === "specific" ? (
                <div className="post-chosen">
                  <span className="pc-thumb">{chosen.emoji}</span>
                  <span style={{ minWidth: 0 }}>
                    <b>{chosen.cap}</b>
                    <span className="pc-meta">{chosen.kind} · {chosen.likes} likes</span>
                  </span>
                </div>
              ) : <span>Runs on <b>any post or reel</b></span>}
            </div>
          </div>

          <div className="connector" />

          <div className={`bnode trigger${sel === "trigger" ? " sel" : ""}`} onClick={() => setSel("trigger")}>
            <div className="nhead">
              <span className="ni"><Icon name="chat-teardrop-text" /></span>
              <span className="nt">When someone comments</span>
              <span className="sys">Trigger</span>
            </div>
            <div className="nbody">
              On <b>{postSrc === "specific" ? "the selected post" : "any post or reel"}</b>, {anyComment ? "on every comment:" : "if the comment contains:"}
              <div style={{ marginTop: 8 }}>
                {anyComment
                  ? <span className="chip-kw">ANY COMMENT</span>
                  : keywords.map(k => <span className="chip-kw" key={k}>{k}</span>)}
              </div>
            </div>
          </div>

          {publicReply && (
            <React.Fragment>
              <div className="connector" />
              <div className="bnode action" onClick={() => setSel("trigger")} style={{ cursor: "pointer" }}>
                <div className="nhead">
                  <span className="ni"><Icon name="chats" /></span>
                  <span className="nt">Reply under their comment</span>
                  <span className="sys">Public</span>
                </div>
                <div className="nbody">
                  Comments back publicly, shuffled so it feels handwritten:
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {replies.filter(r => r.trim()).map((r, i) => (
                      <span key={i} style={{ background: "var(--sunken)", border: "1px solid var(--line)", borderRadius: "var(--r-pill)", padding: "4px 11px", fontSize: 12.5, color: "var(--ink-2)" }}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}

          <div className="connector" />

          {isPro && requireFollow && (
            <React.Fragment>
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
              <div className="connector" />
            </React.Fragment>
          )}

          {isPro && collectEmail && (
            <React.Fragment>
              <div className="bnode action" onClick={() => setSel("dm")} style={{ cursor: "pointer" }}>
                <div className="nhead">
                  <span className="ni"><Icon name="envelope-simple" /></span>
                  <span className="nt">Collect their email</span>
                  <span className="sys">Before link</span>
                </div>
                <div className="nbody">
                  <div className="dm-preview">
                    <div className="dm-text">{emailMsg}</div>
                  </div>
                </div>
              </div>
              <div className="connector" />
            </React.Fragment>
          )}

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
                    {links.map((ln, i) => (
                      <div key={i} className="dm-linkbtn">
                        <span>{ln.label.trim() || "Button label"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="connector" />
        </div>
      </div>

      {/* inspector */}
      <aside className="inspector">
        {sel === "post" && (
          <>
            <div className="insp-body">
            <div className="sys">Source settings</div>
            <div className="insp-h3">Post or reel</div>
            <div style={{ marginTop: 18 }}>
              <div className="insp-label">Where should this run?</div>
              <div
                className={`insp-choice${postSrc === "specific" ? " active" : ""}`}
                style={{ marginBottom: 9 }}
                onClick={() => setPostSrc("specific")}
              >
                <Icon name="selection-foreground" className="ic" style={{ fontSize: 16, color: "var(--ink-2)" }} />
                <div className="ic-info">
                  <div className="ct">A specific post or reel</div>
                  <div className="cs">Pick one piece of content</div>
                </div>
                {postSrc === "specific" && <Icon name="check-circle" weight="fill" style={{ fontSize: 18, color: "var(--accent)", flex: "none" }} />}
              </div>
              <div
                className={`insp-choice${postSrc === "any" ? " active" : ""}${isPro ? "" : " locked"}`}
                onClick={() => isPro ? setPostSrc("any") : setShowUpgrade("Any post or reel")}
              >
                <Icon name="stack" className="ic" style={{ fontSize: 16, color: "var(--ink-2)" }} />
                <div className="ic-info">
                  <div className="ct" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    Any post or reel {!isPro && <span className="pro-tag"><Icon name="lock-simple" weight="fill" style={{ fontSize: 9 }} /> Pro</span>}
                  </div>
                  <div className="cs">Runs across all your content</div>
                </div>
                {postSrc === "any" && isPro && <Icon name="check-circle" weight="fill" style={{ fontSize: 18, color: "var(--accent)", flex: "none" }} />}
              </div>
            </div>
            {postSrc === "specific" && (
              <div style={{ marginTop: 20 }}>
                <div className="insp-label">Select content</div>
                <div className="post-grid">
                  {POSTS.map(p => (
                    <button key={p.id} className={`post-cell${post === p.id ? " sel" : ""}`} onClick={() => setPost(p.id)}>
                      <span className="pcell-thumb">
                        {p.emoji}
                        <span className="pcell-kind">{p.kind}</span>
                        {post === p.id && <span className="pcell-check"><Icon name="check" weight="bold" /></span>}
                      </span>
                      <span className="pcell-cap">{p.cap}</span>
                    </button>
                  ))}
                </div>
                <button className="post-seeall" onClick={() => setShowAll(true)}>
                  <Icon name="squares-four" /> See all content
                </button>
              </div>
            )}
            </div>
          <div className="insp-done-bar">
            <button className="btn btn-primary" disabled={!post} onClick={() => setSel("trigger")}>Done <Icon name="arrow-right" /></button>
          </div>
        </>
        )}

        {sel === "trigger" && (
          <>
            <div className="insp-body">
            <div className="sys">Trigger settings</div>
            <div className="insp-h3">Which comments fire it?</div>

            <div className={`any-comment-card${anyComment ? " on" : ""}`} onClick={() => setAnyComment(!anyComment)}>
              <span className="ac-star"><Icon name="asterisk" weight="bold" /></span>
              <div className="ac-info">
                <div className="ac-t">Any comment counts</div>
                <div className="ac-s">Skip keywords and reply to everyone</div>
              </div>
              <Toggle on={anyComment} onClick={e => { e.stopPropagation(); setAnyComment(!anyComment); }} />
            </div>

            <div style={{ marginTop: 18, opacity: anyComment ? 0.45 : 1, pointerEvents: anyComment ? "none" : "auto", transition: "opacity .16s" }}>
              <div className="insp-label">Keywords</div>
              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
                {keywords.map(k => (
                  <span className="chip-kw" key={k}>
                    {k}
                    <Icon name="x" weight="bold" style={{ fontSize: 10, cursor: "pointer" }} onClick={() => removeKw(k)} />
                  </span>
                ))}
              </div>
              <div className="input input-surface">
                <Icon name="hash" />
                <input
                  placeholder="Add keyword, press ↵"
                  value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  onKeyDown={addKw}
                />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <div className="insp-label">Options</div>
              <div className="insp-choice" onClick={() => setPublicReply(!publicReply)}>
                <Icon name="chats" className="ic" style={{ fontSize: 16, color: "var(--ink-2)" }} />
                <div className="ic-info">
                  <div className="ct">Also reply publicly</div>
                  <div className="cs">Comment back so it looks human</div>
                </div>
                <Toggle on={publicReply} onClick={e => { e.stopPropagation(); setPublicReply(!publicReply); }} />
              </div>
              {publicReply && (
                <div style={{ marginTop: 16 }}>
                  <div className="insp-label">Public reply variations</div>
                  {replies.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
                      <div className="input input-surface" style={{ flex: 1, padding: "8px 11px" }}>
                        <input value={r} onChange={e => setReplies(replies.map((x, j) => j === i ? e.target.value : x))} />
                      </div>
                      <button className="rowbtn" title="Delete" onClick={() => setReplies(replies.filter((_, j) => j !== i))}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" style={{ width: "100%", marginTop: 3 }} onClick={() => setReplies([...replies, ""])}>
                    <Icon name="plus" /> Add variation
                  </button>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 12, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
                    <Icon name="shuffle" style={{ fontSize: 14, marginTop: 1, flex: "none" }} />
                    <span>These replies shuffle at random, so every comment feels handwritten.</span>
                  </div>
                </div>
              )}
            </div>
            </div>
          <div className="insp-done-bar">
            <button className="btn btn-primary" disabled={!anyComment && keywords.length === 0} onClick={() => setSel("dm")}>Done <Icon name="arrow-right" /></button>
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
                <textarea rows={6} value={msg} onChange={e => setMsg(e.target.value)} />
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
              <div className="insp-label">More options</div>
              <div
                className={`insp-choice${requireFollow && isPro ? " active" : ""}${isPro ? "" : " locked"}`}
                style={{ marginBottom: 9 }}
                onClick={() => isPro ? setRequireFollow(!requireFollow) : setShowUpgrade("Require a follow first")}
              >
                <Icon name="user-plus" className="ic" style={{ fontSize: 16, color: "var(--ink-2)" }} />
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
              <div
                className={`insp-choice${collectEmail && isPro ? " active" : ""}${isPro ? "" : " locked"}`}
                onClick={() => isPro ? setCollectEmail(!collectEmail) : setShowUpgrade("Collect email first")}
              >
                <Icon name="envelope-simple" className="ic" style={{ fontSize: 16, color: "var(--ink-2)" }} />
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
                  <div className="opt-note"><Icon name="envelope-simple" weight="fill" /> Sent before the link. The reply captures their email and saves it to the contact’s email field automatically.</div>
                </div>
              )}
            </div>
            </div>
          <div className="insp-done-bar">
            <button className="btn btn-primary" onClick={() => onPublish && onPublish(auto ? auto.id : null, auto ? auto.name : null)}><Icon name="lightning" weight="fill" /> Publish now</button>
          </div>
        </>
        )}

        {sel === "cond" && (
          <div>
            <div className="sys">Condition settings</div>
            <div className="insp-h3">Wait for reply</div>
            <div style={{ marginTop: 18 }}>
              <div className="insp-label">Timeout window</div>
              <div className="input input-surface">
                <Icon name="clock" />
                <input defaultValue="24 hours" />
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 14, lineHeight: 1.6 }}>
                If they don't reply in time, the flow ends quietly. No spam, no pressure.
              </p>
            </div>
          </div>
        )}
      </aside>

      {showUpgrade && <UpgradeModal feature={showUpgrade} onClose={() => setShowUpgrade(null)} />}

      {showAll && (
        <Portal>
          <div className="modal-overlay" onClick={() => setShowAll(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="mh-txt">
                <h2>Your content</h2>
                <div className="mh-sub">Pick one post or reel to run this automation on.</div>
              </div>
              <button className="mh-close" onClick={() => setShowAll(false)} aria-label="Close"><Icon name="x" /></button>
            </div>
            <div className="modal-body">
              <div className="post-grid post-grid-lg">
                {ALL_POSTS.map(p => (
                  <button key={p.id} className={`post-cell${post === p.id ? " sel" : ""}`} onClick={() => { setPost(p.id); setShowAll(false); }}>
                    <span className="pcell-thumb">
                      {p.emoji}
                      <span className="pcell-kind">{p.kind}</span>
                      {post === p.id && <span className="pcell-check"><Icon name="check" weight="bold" /></span>}
                    </span>
                    <span className="pcell-cap">{p.cap}</span>
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

Object.assign(window, { BuilderScreen });
