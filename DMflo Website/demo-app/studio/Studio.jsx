// Flow Studio — the shell. Owns the shared spec; wires chat, canvas, inspector,
// knowledge editor and test drive together.
const { useState: useStudioState, useEffect: useStudioEffect, useRef: useStudioRef } = React;

function Studio() {
  const [spec, setSpec] = useStudioState(blankSpec);
  const [selected, setSelected] = useStudioState(null);      // node key or null
  const [showTest, setShowTest] = useStudioState(false);
  const [kb, setKb] = useStudioState(null);                  // { index: number|null }
  const [toast, setToast] = useStudioState(null);
  const [editingName, setEditingName] = useStudioState(false);
  const [nameDraft, setNameDraft] = useStudioState("");
  const nameRef = useStudioRef(null);
  const toastT = useStudioRef(null);

  // seed handed from the New-flow modal via URL (?prompt= or ?tpl=)
  const seed = useStudioRef(null);
  if (seed.current === null) {
    const q = new URLSearchParams(location.search);
    const prompt = q.get("prompt"), tpl = q.get("tpl");
    seed.current = tpl ? { tpl } : { prompt: prompt || "When someone comments PRICE on my post, DM them my shop link" };
  }

  useStudioEffect(() => { if (editingName && nameRef.current) { nameRef.current.focus(); nameRef.current.select(); } }, [editingName]);

  function patchSpec(patch, mode = "merge") {
    setSpec(prev => {
      if (mode === "replace") return patch;
      if (mode === "template") return { ...blankSpec(), ...patch };
      return { ...prev, ...patch };
    });
  }

  function patchStep(id, patch) {
    setSpec(prev => ({ ...prev, steps: prev.steps.map(s => s.id === id ? { ...s, ...patch } : s) }));
  }
  function addStep(index, type) {
    const st = makeStep(type);
    setSpec(prev => { const steps = [...prev.steps]; steps.splice(index, 0, st); return { ...prev, steps }; });
    setSelected(st.id);
  }
  function deleteStep(id) {
    setSpec(prev => ({ ...prev, steps: prev.steps.filter(s => s.id !== id) }));
    setSelected(sel => sel === id ? null : sel);
  }
  function moveStep(id, dir) {
    setSpec(prev => {
      const steps = [...prev.steps];
      const i = steps.findIndex(s => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= steps.length) return prev;
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...prev, steps };
    });
  }

  function saveKnowledge(item) {
    setSpec(prev => {
      const list = [...prev.knowledge];
      if (kb && kb.index != null) list[kb.index] = item;
      else list.push(item);
      return { ...prev, knowledge: list };
    });
    setKb(null);
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 3600);
  }
  function publish() {
    showToast("Flow published — it's now live 🎉");
  }

  function commitName() {
    const v = nameDraft.trim();
    if (v) patchSpec({ name: v });
    setEditingName(false);
  }

  const [chatOpen, setChatOpen] = useStudioState(true);
  const hasAI = spec.steps.some(s => s.type === "ai");
  const selValid = selected === "trigger" || (selected === "knowledge" && hasAI) || spec.steps.some(s => s.id === selected);

  return (
    <div className="st-shell">
      <header className="st-header">
        <a className="btn btn-ghost btn-icon" href="../index.html#automations" title="Back to automations"><Icon name="arrow-left" /></a>
        <div className="st-header-divider" />
        <span className="st-header-ico"><Icon name={spec.icon} weight="fill" /></span>
        {editingName ? (
          <input ref={nameRef} className="st-name-input" value={nameDraft}
            onChange={e => setNameDraft(e.target.value)} onBlur={commitName}
            onKeyDown={e => { if (e.key === "Enter") commitName(); if (e.key === "Escape") setEditingName(false); }} />
        ) : (
          <button className="st-name" onClick={() => { setNameDraft(spec.name); setEditingName(true); }} title="Rename">
            {spec.name}<Icon name="pencil-simple" className="st-name-pencil" />
          </button>
        )}
        <div className="st-header-badge sys">Draft</div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary" onClick={() => setShowTest(true)}><Icon name="play" weight="fill" /> Test drive</button>
        <button className="btn btn-primary" onClick={publish}><Icon name="lightning" weight="fill" /> Publish flow</button>
      </header>

      <div className={`st-main${chatOpen ? "" : " chat-min"}`}>
        {chatOpen && (
          <StudioChat
            spec={spec}
            onPatch={patchSpec}
            onOpenUpload={() => setKb({ index: null })}
            onMinimize={() => setChatOpen(false)}
            seed={seed.current}
          />
        )}
        <div className="st-stagewrap">
          <StudioCanvas spec={spec} selected={selValid ? selected : null} onSelect={setSelected} onAddStep={addStep} onDeleteStep={deleteStep} />
          {selValid && <div className="st-insp-scrim" onClick={() => setSelected(null)} />}
          {selValid && (
            <StudioInspector
              node={selected}
              spec={spec}
              onPatch={patchSpec}
              onPatchStep={patchStep}
              onMoveStep={moveStep}
              onDeleteStep={deleteStep}
              onClose={() => setSelected(null)}
              onOpenUpload={() => setKb({ index: null })}
              onEditKnowledge={i => setKb({ index: i })}
            />
          )}
        </div>
      </div>

      {!chatOpen && (
        <button className="st-chat-fab" onClick={() => setChatOpen(true)} title="Open chat builder">
          <Icon name="sparkle" weight="fill" />
          <span className="st-chat-fab-label">Build with chat</span>
        </button>
      )}

      {kb && (
        <KnowledgeModal
          initial={kb.index != null ? spec.knowledge[kb.index] : null}
          onSave={saveKnowledge}
          onClose={() => setKb(null)}
        />
      )}
      {showTest && <TestDrive spec={spec} onClose={() => setShowTest(false)} />}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-ico"><Icon name="check" weight="bold" /></span>
          <span className="toast-msg">{toast}</span>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Studio />);
