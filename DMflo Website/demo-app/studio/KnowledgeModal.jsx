// Flow Studio — Knowledge editor. Upload a file / add a link / paste text,
// then EDIT what the AI learned (extracted text + Q&A pairs) before saving.
const { useState: useKbState } = React;

const SAMPLE_DOCS = [
  { label: "Pricing & FAQ.pdf", meta: "PDF · 4 pages",
    text: "LAUNCH KIT — $48 USD. Includes the full toolkit + templates.\nShipping: worldwide, 3–5 business days. Free over $75.\nReturns: 30 days, no questions asked.\nPayment: cards, Apple Pay, UPI.",
    qa: [
      { q: "How much is the launch kit?", a: "The launch kit is $48 USD and includes the full toolkit plus templates." },
      { q: "Do you ship internationally?", a: "Yes — worldwide, usually 3–5 business days. Free shipping over $75." },
      { q: "What's your return policy?", a: "30 days, no questions asked." },
    ] },
  { label: "Shipping policy.pdf", meta: "PDF · 2 pages",
    text: "We ship worldwide from India. Standard 3–5 days, express 1–2 days.\nTracking sent by email once dispatched.",
    qa: [
      { q: "How long does delivery take?", a: "Standard is 3–5 days, express 1–2 days." },
      { q: "Do I get tracking?", a: "Yes, a tracking link is emailed when your order ships." },
    ] },
  { label: "Product catalog.pdf", meta: "PDF · 8 pages",
    text: "Launch Kit — $48\nBrand Pack — $29\nTemplate Bundle — $19\nGift card — from $10",
    qa: [
      { q: "What products do you sell?", a: "The Launch Kit ($48), Brand Pack ($29), Template Bundle ($19), and gift cards from $10." },
    ] },
];

function KnowledgeModal({ initial, onSave, onClose }) {
  // stage: pick (choose source) → editor
  const [stage, setStage] = useKbState(initial ? "editor" : "pick");
  const [type, setType] = useKbState(initial?.type || "doc");
  const [label, setLabel] = useKbState(initial?.label || "");
  const [meta, setMeta] = useKbState(initial?.meta || "");
  const [text, setText] = useKbState(initial?.text || "");
  const [qa, setQa] = useKbState(initial?.qa || []);
  const [tab, setTab] = useKbState("qa");
  const [urlVal, setUrlVal] = useKbState("");
  const [parsing, setParsing] = useKbState(false);

  function pickDoc() {
    setParsing(true);
    setType("doc");
    const d = SAMPLE_DOCS[Math.floor(Math.random() * SAMPLE_DOCS.length)];
    setTimeout(() => {
      setLabel(d.label); setMeta(d.meta); setText(d.text); setQa(d.qa);
      setParsing(false); setStage("editor");
    }, 900);
  }
  function fetchUrl() {
    if (!urlVal.trim()) return;
    setParsing(true); setType("url");
    const clean = urlVal.replace(/^https?:\/\//, "");
    setTimeout(() => {
      setLabel(clean); setMeta("Website");
      setText("Extracted from " + clean + ":\nPricing, shipping and FAQ content pulled from the page.");
      setQa([{ q: "What's on this page?", a: "Pricing, shipping and FAQ details for the store." }]);
      setParsing(false); setStage("editor");
    }, 1100);
  }
  function startText() { setType("text"); setLabel(""); setMeta("Pasted note"); setText(""); setQa([]); setStage("editor"); }

  function save() {
    const finalLabel = label.trim() || (type === "text" ? (text.split("\n")[0].slice(0, 40) || "Pasted note") : "Untitled");
    const finalMeta = type === "text" ? ("Note · " + text.split("\n").length + " lines") : meta;
    onSave({ type, label: finalLabel, meta: finalMeta, text, qa });
  }

  const canSave = (text.trim() || qa.length) && (type === "text" || label.trim());

  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal st-kbmodal" onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div className="mh-txt">
              <h2>{initial ? "Edit knowledge" : "Add knowledge"}</h2>
              <div className="mh-sub">{stage === "pick" ? "Give the AI something to answer from." : "Review and fix what the AI learned before saving."}</div>
            </div>
            <button className="mh-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
          </div>

          <div className="modal-body">
            {stage === "pick" && !parsing && (
              <div className="st-kb-pick">
                <button className="st-kb-src" onClick={pickDoc}>
                  <span className="st-kb-srcic"><Icon name="upload-simple" weight="bold" /></span>
                  <span className="st-kb-srctxt"><b>Upload a document</b><span>PDF, Word, or a spreadsheet</span></span>
                  <Icon name="arrow-right" className="st-kb-srcarrow" />
                </button>
                <div className="st-kb-url">
                  <div className="input input-surface" style={{ flex: 1 }}><Icon name="link" />
                    <input placeholder="Paste a URL — e.g. yoursite.com/faq" value={urlVal} onChange={e => setUrlVal(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchUrl()} />
                  </div>
                  <button className="btn btn-secondary" disabled={!urlVal.trim()} onClick={fetchUrl}><Icon name="download-simple" /> Fetch</button>
                </div>
                <button className="st-kb-src" onClick={startText}>
                  <span className="st-kb-srcic"><Icon name="note-pencil" weight="bold" /></span>
                  <span className="st-kb-srctxt"><b>Paste text</b><span>Type or paste answers directly</span></span>
                  <Icon name="arrow-right" className="st-kb-srcarrow" />
                </button>
              </div>
            )}

            {parsing && (
              <div className="st-kb-parsing">
                <span className="st-kb-spin" />
                <div className="st-kb-parsetxt">Reading your source…<span className="sys">extracting text · finding Q&amp;A</span></div>
              </div>
            )}

            {stage === "editor" && !parsing && (
              <div className="st-kb-editor">
                <div className="st-kb-file">
                  <span className="kb-ico"><Icon name={KB_ICON[type]} weight="fill" /></span>
                  {type === "text"
                    ? <input className="st-kb-title" placeholder="Name this note" value={label} onChange={e => setLabel(e.target.value)} />
                    : <input className="st-kb-title" value={label} onChange={e => setLabel(e.target.value)} />}
                  <span className="st-kb-parsed"><Icon name="check-circle" weight="fill" /> Parsed</span>
                </div>

                <div className="st-kb-tabs">
                  <button className={tab === "qa" ? "on" : ""} onClick={() => setTab("qa")}>Q&amp;A pairs · {qa.length}</button>
                  <button className={tab === "text" ? "on" : ""} onClick={() => setTab("text")}>Extracted text</button>
                </div>

                {tab === "qa" ? (
                  <div className="st-qa-list">
                    {qa.map((pair, i) => (
                      <div key={i} className="st-qa-row">
                        <div className="st-qa-fields">
                          <div className="input input-surface st-qa-q"><Icon name="question" />
                            <input placeholder="Question people ask" value={pair.q} onChange={e => setQa(qa.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
                          </div>
                          <div className="input input-surface st-qa-a" style={{ alignItems: "flex-start" }}>
                            <textarea rows={2} placeholder="How the AI should answer" value={pair.a} onChange={e => setQa(qa.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} />
                          </div>
                        </div>
                        <button className="rowbtn" onClick={() => setQa(qa.filter((_, j) => j !== i))}><Icon name="trash" /></button>
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={() => setQa([...qa, { q: "", a: "" }])}>
                      <Icon name="plus" /> Add a Q&amp;A pair
                    </button>
                  </div>
                ) : (
                  <div className="input input-surface" style={{ alignItems: "flex-start" }}>
                    <textarea rows={9} className="st-kb-textarea" placeholder="The raw text the AI reads. Fix anything the parser got wrong." value={text} onChange={e => setText(e.target.value)} />
                  </div>
                )}
              </div>
            )}
          </div>

          {stage === "editor" && !parsing && (
            <div className="st-kbmodal-foot">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" disabled={!canSave} onClick={save}><Icon name="check" /> Save knowledge</button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

Object.assign(window, { KnowledgeModal });
