// Flow Studio — the manual inspector. Slides over the canvas when a node is
// clicked. Trigger + knowledge write to the spec; step nodes write to their step.
const { useState: useInspState } = React;

function StudioInspector({ node, spec, onPatch, onPatchStep, onMoveStep, onDeleteStep, onClose, onOpenUpload, onEditKnowledge }) {
  const set = patch => onPatch(patch, "merge");
  const step = spec.steps.find(s => s.id === node);
  const setStep = patch => onPatchStep(node, patch);

  let title, canMove = false, idx = -1;
  if (node === "trigger") title = "Trigger";
  else if (node === "knowledge") title = "Knowledge";
  else if (step) {
    title = STEP_META[step.type].tag;
    idx = spec.steps.indexOf(step);
    canMove = spec.steps.length > 1;
  } else title = "Edit";

  return (
    <aside className="st-insp">
      <div className="st-insp-head">
        <div className="sys">{title}</div>
        <div style={{ flex: 1 }} />
        {canMove && (
          <div className="st-insp-move">
            <button className="btn btn-ghost btn-icon" disabled={idx === 0} title="Move up" onClick={() => onMoveStep(node, -1)}><Icon name="arrow-up" /></button>
            <button className="btn btn-ghost btn-icon" disabled={idx === spec.steps.length - 1} title="Move down" onClick={() => onMoveStep(node, 1)}><Icon name="arrow-down" /></button>
          </div>
        )}
        {step && <button className="btn btn-ghost btn-icon st-insp-del" title="Delete step" onClick={() => onDeleteStep(node)}><Icon name="trash" /></button>}
        <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
      </div>
      <div className="st-insp-body">
        {node === "trigger" && <TriggerForm spec={spec} set={set} />}
        {node === "knowledge" && <KnowledgeForm spec={spec} set={set} onOpenUpload={onOpenUpload} onEditKnowledge={onEditKnowledge} />}
        {step && step.type === "public" && <PublicForm step={step} setStep={setStep} />}
        {step && step.type === "condition" && <ConditionForm step={step} setStep={setStep} />}
        {step && step.type === "delay" && <DelayForm step={step} setStep={setStep} />}
        {step && step.type === "dm" && <DMForm step={step} setStep={setStep} />}
        {step && step.type === "ai" && <AIForm spec={spec} onOpenUpload={onOpenUpload} />}
      </div>
    </aside>
  );
}

function TriggerForm({ spec, set }) {
  const [kw, setKw] = useInspState("");
  const meta = TRIGGER_META[spec.triggerType];
  const addKw = e => {
    if (e.key === "Enter" && kw.trim()) {
      set({ keywords: [...new Set([...spec.keywords, kw.trim().toUpperCase()])], anyComment: false });
      setKw("");
    }
  };
  return (
    <>
      <div className="insp-label">What sets it off</div>
      <div className="st-seg3">
        {["comment", "dm", "story"].map(tt => (
          <button key={tt} className={spec.triggerType === tt ? "on" : ""} onClick={() => set({ triggerType: tt })}>
            <Icon name={TRIGGER_META[tt].icon} /> {tt === "dm" ? "DM" : tt === "comment" ? "Comment" : "Story"}
          </button>
        ))}
      </div>

      {spec.triggerType !== "dm" && (
        <div style={{ marginTop: 20 }}>
          <div className="insp-label">Where it runs</div>
          <div className={`insp-choice${spec.postSrc === "specific" ? " active" : ""}`} style={{ marginBottom: 9 }} onClick={() => set({ postSrc: "specific" })}>
            <Icon name="selection-foreground" className="ic" />
            <div className="ic-info"><div className="ct">A specific post or reel</div><div className="cs">Pick one piece of content</div></div>
          </div>
          <div className={`insp-choice${spec.postSrc === "any" ? " active" : ""}`} onClick={() => set({ postSrc: "any" })}>
            <Icon name="stack" className="ic" />
            <div className="ic-info"><div className="ct">Any post or reel</div><div className="cs">Runs across all your content</div></div>
          </div>
          {spec.postSrc === "specific" && (
            <div className="st-postgrid">
              {IG_CONTENT.map(p => (
                <button key={p.id} className={`post-cell${spec.postId === p.id ? " sel" : ""}`} onClick={() => set({ postId: p.id })}>
                  <span className="pcell-thumb">{p.emoji}<span className="pcell-kind">{p.kind}</span>
                    {spec.postId === p.id && <span className="pcell-check"><Icon name="check" weight="bold" /></span>}</span>
                  <span className="pcell-cap">{p.cap}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {spec.triggerType !== "dm" && (
        <div style={{ marginTop: 20 }}>
          <div className={`any-comment-card${spec.anyComment ? " on" : ""}`} onClick={() => set({ anyComment: !spec.anyComment })}>
            <span className="ac-star"><Icon name="asterisk" weight="bold" /></span>
            <div className="ac-info"><div className="ac-t">Any {meta.label} counts</div><div className="ac-s">Skip keywords, reply to everyone</div></div>
            <Toggle on={spec.anyComment} onClick={e => { e.stopPropagation(); set({ anyComment: !spec.anyComment }); }} />
          </div>
          <div style={{ marginTop: 16, opacity: spec.anyComment ? 0.4 : 1, pointerEvents: spec.anyComment ? "none" : "auto" }}>
            <div className="insp-label">Keywords</div>
            <div className="st-kw-edit">
              {spec.keywords.map(k => (
                <span className="chip-kw" key={k}>{k}
                  <Icon name="x" weight="bold" style={{ fontSize: 10, cursor: "pointer" }} onClick={() => set({ keywords: spec.keywords.filter(x => x !== k) })} />
                </span>
              ))}
            </div>
            <div className="input input-surface"><Icon name="hash" />
              <input placeholder="Add keyword, press ↵" value={kw} onChange={e => setKw(e.target.value)} onKeyDown={addKw} />
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <div className="insp-label">Rules</div>
        <div className="ab-hint" style={{ marginBottom: 10 }}>Applied before anything runs. For a mid-flow check, add a Condition step instead.</div>
        <div className="st-rule-list">
          {RULE_DEFS.map(r => {
            const on = spec.rules.includes(r.id);
            const toggle = () => set({ rules: on ? spec.rules.filter(x => x !== r.id) : [...spec.rules, r.id] });
            return (
              <div key={r.id} className={`st-rule-row${on ? " on" : ""}`} onClick={toggle}>
                <span className="st-rule-ic"><Icon name={r.icon} weight="fill" /></span>
                <div className="ic-info"><div className="ct">{r.label}</div><div className="cs">{r.desc}</div></div>
                <Toggle on={on} onClick={e => { e.stopPropagation(); toggle(); }} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function PublicForm({ step, setStep }) {
  const upd = (i, v) => setStep({ replies: step.replies.map((x, j) => j === i ? v : x) });
  return (
    <>
      <div className="insp-label">Public reply variations</div>
      <div className="ab-hint" style={{ marginBottom: 12 }}>Shuffled at random so every reply feels handwritten.</div>
      {step.replies.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
          <div className="input input-surface" style={{ flex: 1, padding: "8px 11px" }}><input value={r} onChange={e => upd(i, e.target.value)} /></div>
          <button className="rowbtn" onClick={() => setStep({ replies: step.replies.filter((_, j) => j !== i) })}><Icon name="trash" /></button>
        </div>
      ))}
      <button className="btn btn-secondary btn-sm" style={{ width: "100%", marginTop: 3 }} onClick={() => setStep({ replies: [...step.replies, ""] })}>
        <Icon name="plus" /> Add variation
      </button>
    </>
  );
}

function ConditionForm({ step, setStep }) {
  return (
    <>
      <div className="insp-label">Only continue if…</div>
      <div className="ab-hint" style={{ marginBottom: 12 }}>The flow stops here for anyone who doesn't pass this check.</div>
      <div className="st-rule-list">
        {RULE_DEFS.map(r => (
          <div key={r.id} className={`st-rule-row${step.rule === r.id ? " on" : ""}`} onClick={() => setStep({ rule: r.id })}>
            <span className="st-rule-ic"><Icon name={r.icon} weight="fill" /></span>
            <div className="ic-info"><div className="ct">{r.label}</div><div className="cs">{r.desc}</div></div>
            <span className={`st-radio${step.rule === r.id ? " on" : ""}`}>{step.rule === r.id && <Icon name="check" weight="bold" />}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function DelayForm({ step, setStep }) {
  const PRESETS = [{ m: 5, l: "5 min" }, { m: 30, l: "30 min" }, { m: 60, l: "1 hour" }, { m: 180, l: "3 hours" }, { m: 1440, l: "1 day" }];
  return (
    <>
      <div className="insp-label">Wait before the next step</div>
      <div className="ab-hint" style={{ marginBottom: 12 }}>A short pause can make replies feel more human.</div>
      <div className="st-delay-grid">
        {PRESETS.map(p => (
          <button key={p.m} className={`st-delay-chip${step.minutes === p.m ? " on" : ""}`} onClick={() => setStep({ minutes: p.m })}>{p.l}</button>
        ))}
      </div>
      <div className="insp-label" style={{ marginTop: 18 }}>Custom (minutes)</div>
      <div className="input input-surface"><Icon name="clock" />
        <input type="number" min="1" value={step.minutes} onChange={e => setStep({ minutes: Math.max(1, parseInt(e.target.value || "1", 10)) })} />
      </div>
    </>
  );
}

function DMForm({ step, setStep }) {
  const links = step.links || [];
  return (
    <>
      <div className="insp-label">Message</div>
      <div className="input input-surface" style={{ alignItems: "flex-start" }}>
        <textarea rows={5} value={step.msg} onChange={e => setStep({ msg: e.target.value })} />
      </div>
      <div className="insp-label" style={{ marginTop: 16 }}>Link buttons · {links.length}/2</div>
      {links.map((ln, i) => (
        <div key={i} className="st-linkedit">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span className="sys" style={{ fontSize: 10 }}>Link {i + 1}</span><div style={{ flex: 1 }} />
            <button className="rowbtn" onClick={() => setStep({ links: links.filter((_, j) => j !== i) })}><Icon name="trash" /></button>
          </div>
          <div className="input input-surface" style={{ padding: "8px 11px", marginBottom: 7 }}><Icon name="text-aa" />
            <input placeholder="Button label" value={ln.label} onChange={e => setStep({ links: links.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
          </div>
          <div className="input input-surface" style={{ padding: "8px 11px" }}><Icon name="link-simple" />
            <input placeholder="https://" value={ln.url} onChange={e => setStep({ links: links.map((x, j) => j === i ? { ...x, url: e.target.value } : x) })} />
          </div>
        </div>
      ))}
      {links.length < 2 && (
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 6 }} onClick={() => setStep({ links: [...links, { label: "", url: "" }] })}>
          <Icon name="link-simple" /> Add link
        </button>
      )}
    </>
  );
}

function AIForm({ spec, onOpenUpload }) {
  return (
    <div className="st-ai-note" style={{ marginTop: 0 }}>
      <div className="st-ai-note-h"><Icon name="sparkle" weight="fill" /> AI replies in your voice</div>
      <p>It answers questions, sends links when people are ready, and stays on-brand. Give it good material to work from:</p>
      <div className="kb-mini-list">
        {spec.knowledge.length === 0
          ? <div className="kb-empty">No knowledge yet</div>
          : spec.knowledge.map((k, i) => <div key={i} className="st-kb-pill"><Icon name={KB_ICON[k.type]} weight="fill" /> {k.label}</div>)}
      </div>
      <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: 12 }} onClick={onOpenUpload}>
        <Icon name="plus" /> Add knowledge
      </button>
    </div>
  );
}

function KnowledgeForm({ spec, set, onOpenUpload, onEditKnowledge }) {
  return (
    <>
      <div className="insp-label">Sources</div>
      <div className="ab-hint" style={{ marginBottom: 12 }}>Files, links, or notes the AI answers from. Click one to edit what it learned.</div>
      <div className="kb-list">
        {spec.knowledge.map((k, i) => (
          <div key={i} className="kb-row st-kb-row" onClick={() => onEditKnowledge(i)}>
            <span className="kb-ico"><Icon name={KB_ICON[k.type]} weight="fill" /></span>
            <span className="kb-label">{k.label}</span>
            <span className="kb-meta">{k.meta}</span>
            <button className="kb-x" onClick={e => { e.stopPropagation(); set({ knowledge: spec.knowledge.filter((_, j) => j !== i) }); }}><Icon name="x" weight="bold" /></button>
          </div>
        ))}
        {spec.knowledge.length === 0 && <div className="kb-empty">No sources yet. Add one so the AI can answer accurately.</div>}
      </div>
      <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: 12 }} onClick={onOpenUpload}>
        <Icon name="plus" /> Add knowledge
      </button>
    </>
  );
}

Object.assign(window, { StudioInspector });
