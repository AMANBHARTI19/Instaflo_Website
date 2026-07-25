// Flow Studio — the live flow canvas. Trigger anchor + an editable, ordered
// list of step nodes. Click any node to edit it; steps are added by chatting.
function StudioCanvas({ spec, selected, onSelect, onAddStep, onDeleteStep }) {
  const meta = TRIGGER_META[spec.triggerType];
  const post = IG_CONTENT.find(p => p.id === spec.postId) || IG_CONTENT[0];
  const activeRules = RULE_DEFS.filter(r => spec.rules.includes(r.id));
  const firstAiIdx = spec.steps.findIndex(s => s.type === "ai");

  const Inserter = () => <div className="st-ins-line solo" />;

  const StepNode = ({ step, index }) => {
    const m = STEP_META[step.type];
    return (
      <div className={`bnode ${m.kind}${selected === step.id ? " sel" : ""}`} onClick={() => onSelect(step.id)}>
        <div className="nhead">
          <span className="ni"><Icon name={step.type === "delay" ? "clock-countdown" : m.icon} weight={step.type === "ai" ? "fill" : undefined} /></span>
          <span className="nt">{stepTitle(step)}</span>
          <span className="sys">{m.tag}</span>
          <Icon name="pencil-simple" className="st-node-edit" />
          <button className="st-node-del" title="Delete step" onClick={e => { e.stopPropagation(); onDeleteStep(step.id); }}><Icon name="trash" /></button>
        </div>
        <div className="nbody">{stepBody(step)}</div>
      </div>
    );
  };

  return (
    <div className="st-canvas">
      <div className="st-flow">
        <div className="st-flow-cap">
          <span className="sys">Flow preview</span>
          <span className="st-flow-live"><span className="dot" /> Draft · nothing is live yet</span>
        </div>

        {/* trigger anchor */}
        <div className={`bnode trigger${selected === "trigger" ? " sel" : ""}`} onClick={() => onSelect("trigger")}>
          <div className="nhead">
            <span className="ni"><Icon name={meta.icon} /></span>
            <span className="nt">{meta.node}</span>
            <span className="sys">Trigger</span>
            <Icon name="pencil-simple" className="st-node-edit" />
          </div>
          <div className="nbody">
            {spec.triggerType !== "dm" && (
              <div className="st-src">
                <Icon name="image-square" style={{ fontSize: 14 }} />
                {spec.postSrc === "any"
                  ? <span>Runs on <b>any post or reel</b></span>
                  : <span>On <b>{post.cap}</b> <span className="sys" style={{ marginLeft: 4 }}>{post.kind}</span></span>}
              </div>
            )}
            <div style={{ marginTop: spec.triggerType !== "dm" ? 10 : 0 }}>
              {spec.triggerType === "dm"
                ? <>On <b>every incoming DM</b></>
                : spec.anyComment
                  ? <>On <b>every {meta.label}</b></>
                  : <>If the {meta.label} contains:</>}
              {spec.triggerType !== "dm" && !spec.anyComment && (
                <div className="st-kw-row">{spec.keywords.map(k => <span className="chip-kw" key={k}>{k}</span>)}</div>
              )}
            </div>
            {activeRules.length > 0 && (
              <div className="st-rules">
                {activeRules.map(r => <span key={r.id} className="st-rule-chip"><Icon name={r.icon} weight="fill" /> {r.label}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* step sequence */}
        {spec.steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <Inserter />
            {i === firstAiIdx && (
              <>
                <div className={`bnode cond${selected === "knowledge" ? " sel" : ""}`} onClick={() => onSelect("knowledge")}>
                  <div className="nhead">
                    <span className="ni"><Icon name="books" /></span>
                    <span className="nt">What the AI knows</span>
                    <span className="sys">Knowledge</span>
                    <Icon name="pencil-simple" className="st-node-edit" />
                  </div>
                  <div className="nbody">
                    {spec.knowledge.length === 0
                      ? <span className="st-kb-empty">No files yet — the AI will use only its instructions. <b>Add knowledge →</b></span>
                      : <div className="st-kb-mini">{spec.knowledge.map((k, j) => <span key={j} className="st-kb-pill"><Icon name={KB_ICON[k.type]} weight="fill" /> {k.label}</span>)}</div>}
                  </div>
                </div>
                <div className="st-ins-line solo" />
              </>
            )}
            <StepNode step={step} index={i} />
          </React.Fragment>
        ))}

        {spec.steps.length === 0 && (
          <div className="st-flow-empty">Describe what should happen in the chat — steps appear here as you type.</div>
        )}
      </div>
    </div>
  );

  function stepTitle(step) {
    if (step.type === "delay") return "Wait " + fmtDelay(step.minutes);
    if (step.type === "condition") { const d = RULE_DEFS.find(x => x.id === step.rule); return "Only if " + (d ? d.label.toLowerCase() : "…"); }
    return STEP_META[step.type].title;
  }

  function stepBody(step) {
    if (step.type === "public") {
      return <div className="st-reply-chips">{step.replies.filter(r => r.trim()).map((r, i) => <span key={i} className="st-reply-chip">{r}</span>)}</div>;
    }
    if (step.type === "condition") {
      const d = RULE_DEFS.find(x => x.id === step.rule);
      return <span>Continues only when <b>{d ? d.label.toLowerCase() : "the check"}</b> passes — otherwise it stops here.</span>;
    }
    if (step.type === "delay") {
      return <span>Pauses for <b>{fmtDelay(step.minutes)}</b> before the next step runs.</span>;
    }
    if (step.type === "ai") {
      return <span>Replies in your voice, drawing on the knowledge above. Sends links when someone's ready to buy.</span>;
    }
    // dm
    return (
      <div className="dm-preview">
        <div className="dm-text">{step.msg}</div>
        {step.links && step.links.length > 0 && (
          <div className="dm-links">{step.links.map((ln, i) => <div key={i} className="dm-linkbtn"><span>{ln.label || "Button"}</span></div>)}</div>
        )}
      </div>
    );
  }
}

Object.assign(window, { StudioCanvas });
