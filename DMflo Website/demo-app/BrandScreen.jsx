// DMflo Calm — Brand Kit (auto-derived from the user's website/docs; editable)
const BRAND_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "stage": "ready"
}/*EDITMODE-END*/;

const SCAN_STEPS = [
  "Reading maya-makes.com",
  "Learning your voice & tone",
  "Pulling do’s and don’ts",
  "Importing your product catalog",
];

/* ---- read-only + edit-on-demand section shell ------------------------- */
function DerivedSection({ label, note, derived = true, lockEditing = false, editing, onEdit, onDone, children }) {
  return (
    <section className="bk-section">
      <div className="bk-sh">
        <span className="sys">{label}</span>
        {!editing && derived && <span className="bk-auto"><Icon name="sparkle" weight="fill" /> Auto-detected</span>}
        <span className="bk-sh-note">{note}</span>
        <span className="bk-sh-sp" />
        {!lockEditing && (editing
          ? <button className="btn btn-primary btn-sm" onClick={onDone}><Icon name="check" /> Done</button>
          : <button className="bk-edit" onClick={onEdit}><Icon name="pencil-simple" /> Edit</button>)}
      </div>
      {children}
    </section>
  );
}

function ReadRow({ label, value }) {
  return (
    <div className="bk-read">
      <span className="bk-read-l">{label}</span>
      <span className="bk-read-v">{value || <em className="bk-missing">Not found — add it</em>}</span>
    </div>
  );
}

function BrandField({ label, value, onChange, placeholder, multiline }) {
  return (
    <label className="bk-field">
      <span className="bk-flabel">{label}</span>
      <div className="input input-surface bk-input">
        {multiline
          ? <textarea rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
          : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}
      </div>
    </label>
  );
}

function EditableList({ items, onChange, tone, addLabel }) {
  const update = (i, v) => onChange(items.map((x, idx) => idx === i ? v : x));
  const remove = i => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);
  return (
    <div className="bk-list">
      {items.map((it, i) => (
        <div key={i} className={`bk-li tone-${tone} editing`}>
          <span className="bk-li-mark"><Icon name={tone === "do" ? "check" : "x"} weight="bold" /></span>
          <input value={it} onChange={e => update(i, e.target.value)} placeholder={tone === "do" ? "Add a do…" : "Add a don’t…"} />
          <button className="bk-li-x" onClick={() => remove(i)} title="Remove"><Icon name="x" weight="bold" /></button>
        </div>
      ))}
      <button className="bk-li-add" onClick={add}><Icon name="plus" weight="bold" /> {addLabel}</button>
    </div>
  );
}

function ReadList({ items, tone }) {
  return (
    <div className="bk-list">
      {items.map((it, i) => (
        <div key={i} className={`bk-li tone-${tone}`}>
          <span className="bk-li-mark"><Icon name={tone === "do" ? "check" : "x"} weight="bold" /></span>
          <span className="bk-li-txt">{it}</span>
        </div>
      ))}
    </div>
  );
}

function ProductsConnected({ shop }) {  const stockCls = s => s === "Sold out" ? "out" : s === "Low stock" ? "low" : "ok";
  return (
    <div className="bk-products">
      <div className="bk-ptable-scroll">
        <table className="ct-table bk-ptable">
          <thead>
            <tr>
              <th className="bk-pt-prod">Product</th>
              <th className="bk-pt-price">Price</th>
              <th className="bk-pt-stock">Stock</th>
              <th className="bk-pt-desc">Description</th>
              <th className="bk-pt-link">Link</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(p => (
              <tr key={p.id} className="ct-row bk-prow">
                <td className="bk-pt-prod">
                  <div className="bk-ptprod">
                    <span className={`bk-pthumb tone-${p.tone}`}>{p.emoji}</span>
                    <span className="bk-pname">{p.name}</span>
                  </div>
                </td>
                <td className="bk-pt-price"><span className="bk-pprice">{p.price}</span></td>
                <td className="bk-pt-stock"><span className={`bk-pstock ${stockCls(p.stock)}`}>{p.stock}</span></td>
                <td className="bk-pt-desc"><span className="bk-pblurb">{p.blurb}</span></td>
                <td className="bk-pt-link">
                  <a className="bk-plink" href={`https://${p.link}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}><Icon name="link-simple" weight="bold" /> {p.link}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- product catalog empty state: connect Shopify or add a shop link --- */
function ProductCatalogEmpty({ onConnect }) {
  const { useState } = React;
  const [url, setUrl] = useState("");
  const clean = url.trim().replace(/^https?:\/\//, "");
  return (
    <div className="bk-cat-empty">
      <div className="bk-cat-intro">
        <span className="bk-cat-ico"><Icon name="shopping-bag" weight="fill" /></span>
        <div className="bk-cat-txt">
          <div className="h">Add your product catalog</div>
          <div className="s">Agents recommend and link the right product from your catalog. Pull it in one of two ways.</div>
        </div>
      </div>
      <div className="bk-cat-opts">
        <div className="card bk-cat-card">
          <span className="bk-cat-optico shopify"><Icon name="storefront" weight="fill" /></span>
          <div className="h">Connect Shopify</div>
          <div className="s">Sync products, prices and stock automatically. Best if you sell on Shopify.</div>
          <button className="btn btn-primary" onClick={() => onConnect(null)}><Icon name="plugs-connected" weight="fill" /> Connect store</button>
        </div>
        <div className="card bk-cat-card">
          <span className="bk-cat-optico link"><Icon name="link-simple" weight="fill" /></span>
          <div className="h">Generate from your shop link</div>
          <div className="s">Paste your store URL and we’ll scan it to build your catalog.</div>
          <div className="bk-cat-form">
            <div className="input input-surface"><input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && clean && onConnect(clean)} placeholder="maya-makes.com/shop" /></div>
            <button className="btn btn-secondary" disabled={!clean} onClick={() => clean && onConnect(clean)}><Icon name="magic-wand" weight="fill" /> Generate catalog</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- empty state: connect a source ------------------------------------ */
function BrandEmpty({ onScan, onManual }) {
  const { useState } = React;
  const [url, setUrl] = useState("");
  const [docs, setDocs] = useState([]);
  const fileRef = React.useRef(null);
  const onFiles = e => {
    const names = Array.from(e.target.files || []).map(f => f.name);
    if (names.length) setDocs(d => [...d, ...names]);
    e.target.value = "";
  };
  const canScan = url.trim() || docs.length;
  return (
    <div className="bk-empty-wrap">
      <div className="bk-empty-hero">
        <span className="bk-empty-ico"><Icon name="sparkle" weight="fill" /></span>
        <h2>Build your Brand Kit automatically</h2>
        <p>Point us at your website or drop in a few documents. We’ll read them and fill in your voice, guidelines and products — you just review and tweak.</p>
      </div>
      <div className="card bk-card bk-empty-card">
        <label className="bk-field">
          <span className="bk-flabel">Your website</span>
          <div className="input input-surface bk-input">
            <Icon name="globe" />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourshop.com" onKeyDown={e => e.key === "Enter" && canScan && onScan()} />
          </div>
        </label>
        <div className="bk-empty-or"><span>and / or</span></div>
        <div className="bk-field">
          <span className="bk-flabel">Documents</span>
          <input ref={fileRef} type="file" multiple hidden onChange={onFiles} />
          {docs.length > 0 && (
            <div className="acm-chips" style={{ marginBottom: 4 }}>
              {docs.map((d, i) => (
                <span key={i} className="acm-chip">
                  <Icon name="file-text" weight="fill" /><span className="acm-chip-label">{d}</span>
                  <button className="acm-chip-x" onClick={() => setDocs(docs.filter((_, idx) => idx !== i))}><Icon name="x" weight="bold" /></button>
                </span>
              ))}
            </div>
          )}
          <button className="bk-drop" onClick={() => fileRef.current && fileRef.current.click()}>
            <Icon name="upload-simple" /> Upload brand guide, catalog, FAQ…
          </button>
        </div>
        <button className="btn btn-primary bk-scan-cta" disabled={!canScan} onClick={onScan}>
          <Icon name="sparkle" weight="fill" /> Analyze & build my kit
        </button>
      </div>
      <button className="bk-manual-link" onClick={onManual}>Don’t have a site? <b>Set it up manually</b> <Icon name="arrow-right" weight="bold" /></button>
    </div>
  );
}

/* ---- scanning state --------------------------------------------------- */
function BrandScanning() {
  const { useState, useEffect } = React;
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= SCAN_STEPS.length - 1) return;
    const t = setTimeout(() => setStep(s => s + 1), 850);
    return () => clearTimeout(t);
  }, [step]);
  return (
    <div className="bk-scan">
      <span className="bk-scan-ico"><span className="ac-spinner" /></span>
      <h2>Reading your brand…</h2>
      <ul className="bk-scan-steps">
        {SCAN_STEPS.map((s, i) => (
          <li key={i} className={i < step ? "done" : i === step ? "on" : ""}>
            <Icon name={i < step ? "check-circle" : i === step ? "circle-dashed" : "circle"} weight={i < step ? "fill" : "regular"} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- links & resources (creators may have no store) ------------------- */
function linkMeta(type) { return LINK_TYPES.find(l => l.id === type) || LINK_TYPES[LINK_TYPES.length - 1]; }

function LinksSection({ links, setLinks, editing }) {
  const { useState } = React;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ type: "shop", label: "", url: "" });
  const update = (i, k, v) => setLinks(links.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const remove = i => setLinks(links.filter((_, idx) => idx !== i));
  const commit = () => {
    if (!draft.url.trim()) return;
    setLinks([...links, { ...draft, label: draft.label.trim() || linkMeta(draft.type).label, url: draft.url.replace(/^https?:\/\//, "") }]);
    setDraft({ type: "shop", label: "", url: "" }); setAdding(false);
  };

  if (!editing) {
    const removeRead = i => setLinks(links.filter((_, idx) => idx !== i));
    return (
      <div className="bk-linklist">
        {links.length === 0 && <div className="kb-empty" style={{ fontStyle: "normal" }}>No links yet. Hit Edit to add your shop, calendar, newsletter and more.</div>}
        {links.map((l, i) => {
          const m = linkMeta(l.type);
          return (
            <div key={i} className="bk-linkrow">
              <span className="bk-link-ico"><Icon name={m.icon} weight="fill" /></span>
              <div className="bk-link-body">
                <div className="bk-link-label">{l.label}</div>
                <div className="bk-link-url">{l.url}</div>
              </div>
              <span className="bk-link-type">{m.label}</span>
              <button className="bk-row-x" onClick={() => removeRead(i)} title="Remove link"><Icon name="x" weight="bold" /></button>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="bk-linklist">
      {links.map((l, i) => (
        <div key={i} className="bk-linkedit">
          <select value={l.type} onChange={e => update(i, "type", e.target.value)} className="bk-link-select">
            {LINK_TYPES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <input className="bk-link-in" value={l.label} onChange={e => update(i, "label", e.target.value)} placeholder="Label" />
          <input className="bk-link-in" value={l.url} onChange={e => update(i, "url", e.target.value)} placeholder="link.com/…" />
          <button className="bk-li-x" onClick={() => remove(i)} title="Remove"><Icon name="x" weight="bold" /></button>
        </div>
      ))}
      {adding ? (
        <div className="bk-linkedit adding">
          <select value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })} className="bk-link-select">
            {LINK_TYPES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <input className="bk-link-in" value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Label (optional)" />
          <input className="bk-link-in" autoFocus value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} onKeyDown={e => e.key === "Enter" && commit()} placeholder="link.com/…" />
          <button className="btn btn-primary btn-sm" onClick={commit}>Add</button>
        </div>
      ) : (
        <button className="bk-li-add" onClick={() => setAdding(true)}><Icon name="plus" weight="bold" /> Add a link</button>
      )}
    </div>
  );
}

const RES_ICON = { doc: "file-text", url: "link", text: "note" };
function ResourcesSection({ resources, setResources, editing }) {
  const remove = i => setResources(resources.filter((_, idx) => idx !== i));
  const addDoc = () => {
    const names = ["Brand voice guide.pdf", "Product catalog.pdf", "Returns & refunds.pdf", "Studio story.docx"];
    const label = names[resources.filter(r => r.type === "doc").length % names.length];
    setResources([...resources, { type: "doc", label, meta: (120 + Math.floor(Math.random() * 500)) + " KB · added" }]);
  };
  if (!editing && (!resources || resources.length === 0)) return null;
  return (
    <div className="bk-res">
      <div className="bk-res-head"><Icon name="folder-simple" weight="fill" /> Resources</div>
      <div className="bk-linklist">
        {resources.map((r, i) => (
          <div key={i} className="bk-linkrow">
            <span className="bk-link-ico"><Icon name={RES_ICON[r.type] || "file-text"} weight="fill" /></span>
            <div className="bk-link-body">
              <div className="bk-link-label">{r.label}</div>
              <div className="bk-link-url">{r.meta}</div>
            </div>
            <button className="bk-row-x" onClick={() => remove(i)} title="Remove resource"><Icon name="x" weight="bold" /></button>
          </div>
        ))}
        {editing && resources.length === 0 && <div className="kb-empty" style={{ fontStyle: "normal" }}>No resources yet. Add docs the agents can answer from.</div>}
      </div>
      {editing && <button className="bk-li-add" onClick={addDoc}><Icon name="plus" weight="bold" /> Add a resource</button>}
    </div>
  );
}

function BrandScreen() {
  const { useState } = React;
  const [t, setTweak] = useTweaks(BRAND_TWEAK_DEFAULTS);
  const [name, setName] = useState(BRAND.name);
  const [tagline, setTagline] = useState(BRAND.tagline);
  const [audience, setAudience] = useState(BRAND.audience);
  const [tones, setTones] = useState(BRAND.tones);
  const [sample, setSample] = useState(BRAND.sample);
  const [dos, setDos] = useState(BRAND.dos);
  const [donts, setDonts] = useState(BRAND.donts);
  const [links, setLinks] = useState(BRAND.links);
  const [resources, setResources] = useState(BRAND.resources);
  const [catalog, setCatalog] = useState(null); // null until user connects Shopify or generates from a link
  const [mode, setMode] = useState("derived");
  const [edit, setEdit] = useState({});
  const [tab, setTab] = useState("brand");

  const setSection = (k, v) => setEdit(e => ({ ...e, [k]: v }));
  React.useEffect(() => {
    try { localStorage.setItem("dmflo_brandkit", t.stage === "empty" ? "empty" : "ready"); } catch (e) {}
  }, [t.stage]);
  const toggleTone = id => setTones(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const startScan = () => {
    setMode("derived");
    setTweak("stage", "scanning");
    setTimeout(() => {
      setName(BRAND.name); setTagline(BRAND.tagline); setAudience(BRAND.audience);
      setTones(BRAND.tones); setSample(BRAND.sample); setDos(BRAND.dos); setDonts(BRAND.donts); setLinks(BRAND.links);
      setEdit({});
      setTweak("stage", "ready");
    }, SCAN_STEPS.length * 850 + 400);
  };
  const startManual = () => {
    setMode("manual");
    setName(""); setTagline(""); setAudience(""); setTones([]); setSample("");
    setDos([""]); setDonts([""]); setLinks([]);
    setEdit({ identity: true, voice: true, guide: true, links: true });
    setTweak("stage", "ready");
  };

  if (t.stage === "empty")    return <div className="brand-body"><div className="brand-inner">{tweaksFor(t, setTweak)}<BrandEmpty onScan={startScan} onManual={startManual} /></div></div>;
  if (t.stage === "scanning") return <div className="brand-body"><div className="brand-inner">{tweaksFor(t, setTweak)}<BrandScanning /></div></div>;

  const toneLabels = tones.map(id => { const o = TONE_OPTIONS.find(o => o.id === id); return o ? o.label : id; }).filter(Boolean);

  return (
    <div className="brand-body">
      <div className={`brand-inner${tab === "products" ? " wide" : ""}`}>

        <div className="seg bk-tabs">
          <button className={tab === "brand" ? "on" : ""} onClick={() => setTab("brand")}><Icon name="palette" weight={tab === "brand" ? "fill" : "regular"} /> Brand</button>
          <button className={tab === "products" ? "on" : ""} onClick={() => setTab("products")}><Icon name="shopping-bag" weight={tab === "products" ? "fill" : "regular"} /> Product catalog</button>
        </div>

        {tab === "brand" && (<>
        {/* what it learned from */}
        <div className="bk-source">
          <span className="bk-source-ico"><Icon name={mode === "manual" ? "pencil-simple" : "sparkle"} weight="fill" /></span>
          <div className="bk-source-txt">
            {mode === "manual" ? (
              <>
                <div className="h">Manual Brand Kit</div>
                <div className="s">You’re filling this in yourself. Want a head start? Scan your website or documents instead.</div>
              </>
            ) : (
              <>
                <div className="h">Built from your website &amp; documents</div>
                <div className="s">Learned from <b>maya-makes.com</b> · 2 documents · scanned 2m ago. Review below and edit anything we got wrong.</div>
              </>
            )}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setMode("derived"); setTweak("stage", "empty"); }}><Icon name={mode === "manual" ? "sparkle" : "arrows-clockwise"} /> {mode === "manual" ? "Scan a source" : "Re-scan"}</button>
        </div>

        {/* identity */}
        <DerivedSection label="Brand identity" derived={mode !== "manual"} lockEditing={mode === "manual"} editing={edit.identity} onEdit={() => setSection("identity", true)} onDone={() => setSection("identity", false)}>
          <div className="card bk-card">
            {edit.identity ? (
              <>
                <BrandField label="Brand name" value={name} onChange={setName} placeholder="Your brand or handle" />
                <BrandField label="Description" value={tagline} onChange={setTagline} placeholder="What you make or sell" />
                <BrandField label="Who you talk to" value={audience} onChange={setAudience} placeholder="Describe your typical customer" multiline />
              </>
            ) : (
              <>
                <ReadRow label="Brand name" value={name} />
                <ReadRow label="Description" value={tagline} />
                <ReadRow label="Audience" value={audience} />
              </>
            )}
          </div>
        </DerivedSection>

        {/* voice & tone */}
        <DerivedSection label="Voice & tone" derived={mode !== "manual"} lockEditing={mode === "manual"} editing={edit.voice} onEdit={() => setSection("voice", true)} onDone={() => setSection("voice", false)}>
          <div className="card bk-card">
            <div className="bk-field">
              <span className="bk-flabel">How you sound</span>
              {edit.voice ? (
                <div className="bk-tones">
                  {TONE_OPTIONS.map(o => (
                    <button key={o.id} className={`bk-tone${tones.includes(o.id) ? " on" : ""}`} onClick={() => toggleTone(o.id)}>
                      {o.label}{tones.includes(o.id) && <Icon name="check" weight="bold" />}
                    </button>
                  ))}
                  {tones.filter(id => !TONE_OPTIONS.some(o => o.id === id)).map(id => (
                    <button key={id} className="bk-tone on custom" onClick={() => toggleTone(id)}>
                      {id}<Icon name="x" weight="bold" />
                    </button>
                  ))}
                  <input className="bk-tone-add" placeholder="+ add your own" onKeyDown={e => {
                    if (e.key === "Enter") {
                      const v = e.target.value.trim();
                      if (v && !tones.includes(v)) setTones(t => [...t, v]);
                      e.target.value = "";
                    }
                  }} />
                </div>
              ) : (
                <div className="bk-tones">
                  {toneLabels.map(l => <span key={l} className="bk-tone on read">{l}</span>)}
                </div>
              )}
            </div>
            <div className="bk-field">
              <span className="bk-flabel">Sounds like</span>
              <div className="bk-sample">
                <span className="bk-sample-av"><Icon name="robot" weight="fill" /></span>
                {edit.voice ? (
                  <div className="input input-surface bk-input" style={{ flex: 1 }}>
                    <textarea rows={3} value={sample} onChange={e => setSample(e.target.value)} placeholder="Example reply in your voice…" />
                  </div>
                ) : (
                  <p className="bk-sample-read">{sample}</p>
                )}
              </div>
            </div>
          </div>
        </DerivedSection>

        {/* guidelines */}
        <DerivedSection label="Guidelines" derived={mode !== "manual"} lockEditing={mode === "manual"} editing={edit.guide} onEdit={() => setSection("guide", true)} onDone={() => setSection("guide", false)}>
          <div className="bk-guide">
            <div className="card bk-card">
              <div className="bk-flabel bk-glabel do"><Icon name="check-circle" weight="fill" /> Do</div>
              {edit.guide ? <EditableList items={dos} onChange={setDos} tone="do" addLabel="Add a do" /> : <ReadList items={dos} tone="do" />}
            </div>
            <div className="card bk-card">
              <div className="bk-flabel bk-glabel dont"><Icon name="x-circle" weight="fill" /> Don’t</div>
              {edit.guide ? <EditableList items={donts} onChange={setDonts} tone="dont" addLabel="Add a don’t" /> : <ReadList items={donts} tone="dont" />}
            </div>
          </div>
        </DerivedSection>

        {/* links & resources */}
        <DerivedSection label="Links & resources" derived={mode !== "manual"} lockEditing={mode === "manual"} editing={edit.links} onEdit={() => setSection("links", true)} onDone={() => setSection("links", false)}>
          <div className="card bk-card">
            <LinksSection links={links} setLinks={setLinks} editing={edit.links} />
            <ResourcesSection resources={resources} setResources={setResources} editing={edit.links} />
          </div>
        </DerivedSection>

        {/* products (only when a store is connected) */}
        </>)}

        {tab === "products" && (<>
        {catalog && (
          <section className="bk-section">
            <div className="bk-sh">
              <span className="sys">Products</span>
              <span className="bk-auto"><Icon name="sparkle" weight="fill" /> Auto-detected</span>
              <span className="bk-sh-note">{SHOP.productCount} products {catalog.type === "shopify" ? "imported from Shopify" : `generated from ${catalog.url}`}</span>
            </div>
            <div className="card bk-card">
              <div className="bk-shopbar">
                <span className="bk-shop-ico"><Icon name={catalog.type === "shopify" ? "storefront" : "link-simple"} weight="fill" /></span>
                <div className="bk-shop-meta">
                  <div className="h">{catalog.type === "shopify" ? SHOP.store : catalog.url}</div>
                  <div className="s">{catalog.type === "shopify" ? "Shopify" : "Shop link"} · {SHOP.productCount} products · synced {SHOP.synced}</div>
                </div>
                <span className="live-pill"><span className="dot beat" />Connected</span>
              </div>
              <ProductsConnected shop={SHOP} />
            </div>
          </section>
        )}

        {/* Choose a source when no catalog is connected yet */}
        {!catalog && (
          <section className="bk-section">
            <div className="bk-sh"><span className="sys">Products</span></div>
            <ProductCatalogEmpty onConnect={(url) => setCatalog(url ? { type: "link", url } : { type: "shopify" })} />
          </section>
        )}
        </>)}

      </div>
      {tweaksFor(t, setTweak)}
    </div>
  );
}

function tweaksFor(t, setTweak) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Preview state" />
      <TweakRadio label="Stage" value={t.stage} options={["empty", "scanning", "ready"]} onChange={v => setTweak("stage", v)} />
    </TweaksPanel>
  );
}

Object.assign(window, { BrandScreen });
