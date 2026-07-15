// Instaflo Calm — Contacts (Attio/HubSpot-style table, all fields)

// ---- Column registry: drives which columns the table can show ------------
const Dash = () => <span className="muted">—</span>;

// Chip that shows remaining tags in a fixed-position (portal) tooltip on hover/focus,
// so it isn't clipped by the table's scroll container.
function MoreTags({ tags }) {
  const { useState, useRef } = React;
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  function show() {
    const r = ref.current.getBoundingClientRect();
    setPos({ left: r.left + r.width / 2, top: r.top });
  }
  function hide() { setPos(null); }
  return (
    <span
      ref={ref} className="list-chip more" tabIndex={0}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}
    >
      +{tags.length}
      {pos && (
        <Portal>
          <div className="chip-pop" style={{ left: pos.left, top: pos.top }}>
            {tags.map(t => <span key={t} className="chip-pop-item">{t}</span>)}
          </div>
        </Portal>
      )}
    </span>
  );
}

// ---- Sync / enrichment helpers -------------------------------------------
// Simulates pulling the latest data from the connected account: fills in fields
// that are missing (email / phone / location) and refreshes stale activity.
// It never adds or removes contacts.
const SYNC_LOCATIONS = [
  "Los Angeles, CA", "Chicago, IL", "Miami, FL", "Seattle, WA", "Denver, CO",
  "Portland, OR", "Nashville, TN", "Boston, MA", "San Diego, CA", "Atlanta, GA",
  "Toronto, ON", "London, UK", "Dublin, IE", "Melbourne, AU",
];
function genEmailFor(c) {
  const base = (c.handle || c.name || "contact").replace(/^@/, "").replace(/[^a-z0-9._]/gi, "").toLowerCase() || "contact";
  return `${base}@gmail.com`;
}
function genPhone() {
  const area = 201 + Math.floor(Math.random() * 798);
  const mid = 201 + Math.floor(Math.random() * 798);
  const last = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `+1 (${area}) ${mid}-${last}`;
}
function genLocation() { return SYNC_LOCATIONS[Math.floor(Math.random() * SYNC_LOCATIONS.length)]; }
const STALE_ACTIVITY = /\d+\s*[hdw]\s*ago/i; // hours / days / weeks old

const CONTACT_COLUMNS = [
  { id: "handle", label: "Username", cls: "col-name", locked: true, sortKey: "handle",
    text: c => c.handle,
    render: c => (
      <div className="cn-wrap">
        <Avatar name={c.name} size={32} />
        <div className="cn-id"><div className="cn-name">{c.handle}</div></div>
      </div>
    ) },
  { id: "name", label: "Name", cls: "col-realname", sortKey: "name",
    text: c => c.name, render: c => c.name },
  { id: "email", label: "Email", cls: "col-email",
    text: c => c.email || "", render: c => c.email || <Dash /> },
  { id: "phone", label: "Phone", cls: "col-phone", off: true,
    text: c => c.phone || "", render: c => c.phone || <Dash /> },
  { id: "follows", label: "Follows you", cls: "col-follows",
    text: c => (c.follows ? "Yes" : "No"),
    render: c => c.follows
      ? <span className="follows-yes"><Icon name="check-circle" weight="fill" className="fi" /> Follows you</span>
      : <span className="muted">Not following</span> },
  { id: "followers", label: "Followers", cls: "col-followers", sortKey: "followers", off: true,
    text: c => c.followers || "", render: c => c.followers || <Dash /> },
  { id: "tags", label: "Tags", cls: "col-tags",
    text: c => c.tags.join("; "),
    render: c => c.tags.length === 0 ? <Dash /> : (
      <div className="list-chips">
        <span className="list-chip">{c.tags[0]}</span>
        {c.tags.length > 1 && <MoreTags tags={c.tags.slice(1)} />}
      </div>
    ) },
  { id: "location", label: "Location", cls: "col-loc", off: true,
    text: c => c.location || "", render: c => c.location || <Dash /> },
  { id: "active", label: "Last activity", cls: "col-active", sortKey: "active",
    text: c => c.lastSeen, render: c => c.lastSeen },
  { id: "source", label: "Source", cls: "col-source", off: true,
    text: c => c.source, render: c => <span className="src">{c.source}</span> },
];

const DEFAULT_COLS = CONTACT_COLUMNS.filter(c => !c.off).map(c => c.id);
const COLS_KEY = "dmflo.contacts.columns.v2";
function loadCols() {
  try { const raw = localStorage.getItem(COLS_KEY); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a; } } catch (e) {}
  return DEFAULT_COLS;
}
function saveCols(v) { try { localStorage.setItem(COLS_KEY, JSON.stringify(v)); } catch (e) {} }

function ContactsScreen() {
  const { useState, useMemo } = React;
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);      // drawer
  const [deletedIds, setDeletedIds] = useState([]); // locally deleted contacts
  const [selected, setSelected] = useState([]);    // bulk select
  const [flowFilter, setFlowFilter] = useState("all");       // automation flow (prominent)
  const [flowQuery, setFlowQuery] = useState("");            // search within flow dropdown
  const [followFilter, setFollowFilter] = useState("all");   // all | yes | no
  const [emailFilter, setEmailFilter] = useState("all");     // all | yes | no
  const [phoneFilter, setPhoneFilter] = useState("all");     // all | yes | no
  const [tagFilter, setTagFilter] = useState([]);            // multi-select
  const [openMenu, setOpenMenu] = useState(null);            // flow | filters | export
  const [sort, setSort] = useState({ key: "active", dir: "desc" });
  const [visibleCols, setVisibleCols] = useState(loadCols);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  // --- sync state ---
  const [patches, setPatches] = useState({});      // id -> enriched fields overlay
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState(null);    // { enriched, updated } | null
  const [syncedLabel, setSyncedLabel] = useState("1h ago");
  const [flashIds, setFlashIds] = useState([]);    // rows to briefly highlight

  // contacts with the latest synced overlay applied
  const data = useMemo(
    () => CONTACTS.map(c => (patches[c.id] ? { ...c, ...patches[c.id] } : c)),
    [patches]
  );

  function runSync() {
    if (syncing) return;
    setSyncing(true);
    setSummary(null);
    window.setTimeout(() => {
      const next = { ...patches };
      const changed = [];
      let enriched = 0, updated = 0;
      CONTACTS.forEach(c => {
        const eff = { ...c, ...(patches[c.id] || {}) };
        const patch = { ...(patches[c.id] || {}) };
        let didEnrich = false, didUpdate = false;
        if (!eff.email)    { patch.email = genEmailFor(eff); didEnrich = true; }
        if (!eff.phone)    { patch.phone = genPhone();       didEnrich = true; }
        if (!eff.location) { patch.location = genLocation(); didEnrich = true; }
        // freshen activity on contacts that already had their info
        if (!didEnrich && STALE_ACTIVITY.test(eff.lastSeen || "")) {
          patch.lastSeen = "just now";
          didUpdate = true;
        }
        if (didEnrich) enriched++; else if (didUpdate) updated++;
        if (didEnrich || didUpdate) { next[c.id] = patch; changed.push(c.id); }
      });
      setPatches(next);
      setSyncing(false);
      setSummary({ enriched, updated });
      setSyncedLabel("just now");
      setFlashIds(changed);
      window.setTimeout(() => setFlashIds([]), 2600);
    }, 1600);
  }

  // resync a single contact (used from the drawer): same rules, one row
  function syncContact(id) {
    const c = CONTACTS.find(x => x.id === id);
    if (!c) return;
    const eff = { ...c, ...(patches[id] || {}) };
    const patch = { ...(patches[id] || {}) };
    if (!eff.email)    patch.email = genEmailFor(eff);
    if (!eff.phone)    patch.phone = genPhone();
    if (!eff.location) patch.location = genLocation();
    if (STALE_ACTIVITY.test(eff.lastSeen || "")) patch.lastSeen = "just now";
    setPatches(p => ({ ...p, [id]: patch }));
  }

  // available flows + tags, with contact counts, derived from the dataset
  const flows = useMemo(() => {
    const m = new Map();
    CONTACTS.forEach(c => m.set(c.source, (m.get(c.source) || 0) + 1));
    return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, []);
  const allTags = useMemo(() => {
    const m = new Map();
    CONTACTS.forEach(c => c.tags.forEach(t => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = data.filter(c => {
      if (deletedIds.includes(c.id)) return false;
      const inFlow   = flowFilter === "all" || c.source === flowFilter;
      const inFollow = followFilter === "all" || (followFilter === "yes" ? !!c.follows : !c.follows);
      const inEmail  = emailFilter === "all" || (emailFilter === "yes" ? !!c.email : !c.email);
      const inPhone  = phoneFilter === "all" || (phoneFilter === "yes" ? !!c.phone : !c.phone);
      const inTags   = tagFilter.length === 0 || c.tags.some(t => tagFilter.includes(t));
      const match = !q
        || c.name.toLowerCase().includes(q)
        || c.handle.toLowerCase().includes(q)
        || (c.email || "").toLowerCase().includes(q)
        || (c.location || "").toLowerCase().includes(q)
        || c.tags.some(t => t.toLowerCase().includes(q));
      return inFlow && inFollow && inEmail && inPhone && inTags && match;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => {
      let av, bv;
      if (sort.key === "name") { av = a.name; bv = b.name; }
      else if (sort.key === "handle") { av = a.handle.toLowerCase(); bv = b.handle.toLowerCase(); }
      else if (sort.key === "active") { av = activeRank(a.lastSeen); bv = activeRank(b.lastSeen); }
      else { av = numVal(a.followers); bv = numVal(b.followers); }
      return av > bv ? dir : av < bv ? -dir : 0;
    });
    return r;
  }, [query, flowFilter, followFilter, emailFilter, phoneFilter, tagFilter, sort, deletedIds, data]);

  // reset to first page whenever the result set changes
  React.useEffect(() => { setPage(1); }, [query, flowFilter, followFilter, emailFilter, phoneFilter, tagFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const open = openId ? data.find(c => c.id === openId) : null;
  const allChecked = pageRows.length > 0 && pageRows.every(r => selected.includes(r.id));

  // count of active "advanced" filters (everything except the prominent flow + status)
  const advancedCount =
    (followFilter !== "all" ? 1 : 0) +
    (emailFilter !== "all" ? 1 : 0) +
    (phoneFilter !== "all" ? 1 : 0) +
    tagFilter.length;
  const anyFilter = flowFilter !== "all" || advancedCount > 0;

  function toggleSort(key) {
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: (key === "name" || key === "handle") ? "asc" : "desc" });
  }
  function toggleAll() { setSelected(allChecked ? selected.filter(id => !pageRows.some(r => r.id === id)) : [...new Set([...selected, ...pageRows.map(r => r.id)])]); }
  function toggleOne(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleTag(t) { setTagFilter(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]); }
  function clearAdvanced() { setFollowFilter("all"); setEmailFilter("all"); setPhoneFilter("all"); setTagFilter([]); }
  function clearAll() { setFlowFilter("all"); clearAdvanced(); }
  function toggleCol(id) { setVisibleCols(v => { const nv = v.includes(id) ? v.filter(x => x !== id) : [...v, id]; saveCols(nv); return nv; }); }
  function resetCols() { setVisibleCols(DEFAULT_COLS); saveCols(DEFAULT_COLS); }

  // columns currently shown, always in registry order (locked cols forced on)
  const shownCols = CONTACT_COLUMNS.filter(col => col.locked || visibleCols.includes(col.id));

  return (
    <div className="content cts-content">
      <div className="cts-table-card card">
        {/* toolbar */}
        <div className="ct-toolbar">
          <div className="input ct-search">
            <Icon name="magnifying-glass" style={{ fontSize: 15 }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, handle, email, location or tag…" />
          </div>

          {/* prominent: filter by automation flow */}
          <div className="ct-filter">
            <button
              className={`ct-flowbtn${flowFilter !== "all" ? " on" : ""}`}
              onClick={() => { setOpenMenu(openMenu === "flow" ? null : "flow"); setFlowQuery(""); }}
            >
              <Icon name="flow-arrow" className="fb-flow" />
              <span className="fb-label">{flowFilter === "all" ? "All flows" : flowFilter}</span>
              <Icon name="caret-down" className="fb-caret" />
            </button>
            {openMenu === "flow" && (() => {
              const fq = flowQuery.trim().toLowerCase();
              const showAll = !fq || "all flows".includes(fq);
              const filteredFlows = flows.filter(f => f.name.toLowerCase().includes(fq));
              return (
                <React.Fragment>
                  <div className="flt-backdrop" onClick={() => setOpenMenu(null)} />
                  <div className="flt-menu">
                    <div className="flt-head">Automation flow</div>
                    <div className="flt-search">
                      <Icon name="magnifying-glass" className="fs-ico" />
                      <input
                        autoFocus
                        value={flowQuery}
                        onChange={e => setFlowQuery(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        placeholder="Search flows…"
                      />
                    </div>
                    <div className="flt-menu-list">
                      {showAll && (
                        <button className={`flt-item${flowFilter === "all" ? " on" : ""}`} onClick={() => { setFlowFilter("all"); setOpenMenu(null); }}>
                          <Icon name="stack" className="fi-ico" />
                          <span className="fi-name">All flows</span>
                          <span className="fi-count">{CONTACTS.length}</span>
                          {flowFilter === "all" && <Icon name="check" className="fi-check" />}
                        </button>
                      )}
                      {filteredFlows.map(f => (
                        <button key={f.name} className={`flt-item${flowFilter === f.name ? " on" : ""}`} onClick={() => { setFlowFilter(f.name); setOpenMenu(null); }}>
                          <Icon name="flow-arrow" className="fi-ico" />
                          <span className="fi-name">{f.name}</span>
                          <span className="fi-count">{f.count}</span>
                          {flowFilter === f.name && <Icon name="check" className="fi-check" />}
                        </button>
                      ))}
                      {!showAll && filteredFlows.length === 0 && (
                        <div className="flt-empty">No flows match “{flowQuery.trim()}”.</div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })()}
          </div>

          {/* advanced filters: follows / email / phone / tags */}
          <div className="ct-filter">
            <button
              className={`btn btn-secondary btn-sm${advancedCount > 0 ? " on" : ""}`}
              onClick={() => setOpenMenu(openMenu === "filters" ? null : "filters")}
            >
              <Icon name="sliders-horizontal" /> Filters
              {advancedCount > 0 && <span className="flt-badge">{advancedCount}</span>}
            </button>
            {openMenu === "filters" && (
              <React.Fragment>
                <div className="flt-backdrop" onClick={() => setOpenMenu(null)} />
                <div className="flt-menu flt-menu-wide">
                  <div className="flt-sec">
                    <div className="flt-head">Follows you</div>
                    <Seg value={followFilter} onChange={setFollowFilter} opts={[["all", "Any"], ["yes", "Following"], ["no", "Not following"]]} />
                  </div>
                  <div className="flt-sec">
                    <div className="flt-head">Has email</div>
                    <Seg value={emailFilter} onChange={setEmailFilter} opts={[["all", "Any"], ["yes", "Yes"], ["no", "No"]]} />
                  </div>
                  <div className="flt-sec">
                    <div className="flt-head">Has phone number</div>
                    <Seg value={phoneFilter} onChange={setPhoneFilter} opts={[["all", "Any"], ["yes", "Yes"], ["no", "No"]]} />
                  </div>
                  <div className="flt-sec">
                    <div className="flt-head">Tags{tagFilter.length > 0 ? ` · ${tagFilter.length} selected` : ""}</div>
                    <div className="flt-tags">
                      {allTags.map(t => (
                        <button key={t.name} className={`flt-tag${tagFilter.includes(t.name) ? " on" : ""}`} onClick={() => toggleTag(t.name)}>
                          {t.name}<span className="ftg-n">{t.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flt-foot">
                    <button className="btn btn-ghost btn-sm" onClick={clearAdvanced} disabled={advancedCount === 0}>Clear</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setOpenMenu(null)}>Done</button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>

          {/* manage which columns the table shows */}
          <div className="ct-filter">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setOpenMenu(openMenu === "columns" ? null : "columns")}
            >
              <Icon name="columns" /> Columns
            </button>
            {openMenu === "columns" && (
              <React.Fragment>
                <div className="flt-backdrop" onClick={() => setOpenMenu(null)} />
                <div className="flt-menu flt-menu-cols">
                  <div className="flt-head">Show columns</div>
                  <div className="col-toggle-list">
                    {CONTACT_COLUMNS.map(col => {
                      const on = col.locked || visibleCols.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          className={`flt-item col-toggle${on ? " on" : ""}`}
                          onClick={() => { if (!col.locked) toggleCol(col.id); }}
                          disabled={col.locked}
                        >
                          <label className="ct-check" onClick={e => e.preventDefault()}>
                            <input type="checkbox" checked={on} readOnly disabled={col.locked} /><span />
                          </label>
                          <span className="fi-name">{col.label}</span>
                          {col.locked && <span className="fi-count">Fixed</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flt-foot">
                    <button className="btn btn-ghost btn-sm" onClick={resetCols}>Reset to default</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setOpenMenu(null)}>Done</button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>

          <div className="ct-tb-spacer" />

          {/* resync latest contact data */}
          <div className="ct-sync">
            <span className="ct-synced">Synced {syncedLabel}</span>
            <button
              className={`btn btn-secondary btn-sm ct-syncbtn${syncing ? " syncing" : ""}`}
              onClick={runSync}
              disabled={syncing}
              title="Pull the latest info for existing contacts"
            >
              <Icon name="arrows-clockwise" className="sync-i" />
              {syncing ? "Syncing\u2026" : "Sync"}
            </button>
          </div>

          {/* export filtered result */}
          <div className="ct-filter">
            <button className="btn btn-secondary btn-sm" onClick={() => setOpenMenu(openMenu === "export" ? null : "export")}>
              <Icon name="export" /> Export
              <Icon name="caret-down" className="fb-caret" />
            </button>
            {openMenu === "export" && (
              <React.Fragment>
                <div className="flt-backdrop" onClick={() => setOpenMenu(null)} />
                <div className="flt-menu flt-menu-right">
                  <div className="flt-head">Export {rows.length} contact{rows.length !== 1 ? "s" : ""}</div>
                  <button className="flt-item" onClick={() => { exportContacts(rows, "csv", shownCols); setOpenMenu(null); }}>
                    <Icon name="file-csv" className="fi-ico" />
                    <span className="fi-name">Download CSV</span>
                  </button>
                  <button className="flt-item" onClick={() => { exportContacts(rows, "xls", shownCols); setOpenMenu(null); }}>
                    <Icon name="microsoft-excel-logo" className="fi-ico" />
                    <span className="fi-name">Download Excel</span>
                  </button>
                  <div className="flt-note">Exports every contact matching your filters, not just this page.</div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        {syncing && <div className="ct-syncline"><span /></div>}

        {/* sync result banner */}
        {summary && (
          <div className="ct-syncbar">
            <Icon name="check-circle" weight="fill" className="csb-ok" />
            <span className="csb-msg">
              {summary.enriched === 0 && summary.updated === 0 ? (
                <>Everything&rsquo;s already up to date &mdash; no missing info found.</>
              ) : (
                <>
                  Contacts synced.{" "}
                  {summary.enriched > 0 && <><b>{summary.enriched}</b> enriched with missing info</>}
                  {summary.enriched > 0 && summary.updated > 0 && <span className="csb-dot"> &middot; </span>}
                  {summary.updated > 0 && <><b>{summary.updated}</b> refreshed with latest activity</>}
                  .
                </>
              )}
            </span>
            <button className="csb-x" onClick={() => setSummary(null)} aria-label="Dismiss"><Icon name="x" weight="bold" /></button>
          </div>
        )}

        {/* active filter chips */}
        {anyFilter && (
          <div className="ct-filterbar">
            <Icon name="funnel" className="cfb-ico" />
            {flowFilter !== "all" && <FilterChip label={<><span className="fp-k">Flow</span> {flowFilter}</>} onClear={() => setFlowFilter("all")} />}
            {followFilter !== "all" && <FilterChip label={followFilter === "yes" ? "Follows you" : "Doesn’t follow you"} onClear={() => setFollowFilter("all")} />}
            {emailFilter !== "all" && <FilterChip label={emailFilter === "yes" ? "Has email" : "No email"} onClear={() => setEmailFilter("all")} />}
            {phoneFilter !== "all" && <FilterChip label={phoneFilter === "yes" ? "Has phone" : "No phone"} onClear={() => setPhoneFilter("all")} />}
            {tagFilter.map(t => <FilterChip key={t} label={<><span className="fp-k">Tag</span> {t}</>} onClear={() => toggleTag(t)} />)}
            <button className="ct-clearall" onClick={clearAll}>Clear all</button>
          </div>
        )}

        {/* selection bar OR count */}
        {selected.length > 0 ? (
          <div className="ct-selbar">
            <label className="ct-check"><input type="checkbox" checked={allChecked} onChange={toggleAll} /><span /></label>
            <b>{selected.length} selected</b>
            <div className="spacer" style={{ flex: 1 }} />
            <button className="btn btn-secondary btn-sm"><Icon name="tag" /> Add tag</button>
            <button className="btn btn-secondary btn-sm" onClick={() => exportContacts(data.filter(c => selected.includes(c.id)), "csv", shownCols)}><Icon name="export" /> Export</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
          </div>
        ) : (
          <div className="ct-countbar">
            <span className="ct-count">{rows.length} contact{rows.length !== 1 ? "s" : ""}<span className="in"> · {CONTACTS.length} total</span></span>
          </div>
        )}

        {/* table */}
        <div className="ct-scroll">
          <table className="ct-table">
            <thead>
              <tr>
                <th className="col-check"><label className="ct-check"><input type="checkbox" checked={allChecked} onChange={toggleAll} /><span /></label></th>
                {shownCols.map(col => col.sortKey
                  ? <SortTh key={col.id} label={col.label} k={col.sortKey} sort={sort} onSort={toggleSort} />
                  : <th key={col.id} className={col.cls}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(c => (
                <ContactRow
                  key={c.id} c={c} cols={shownCols}
                  checked={selected.includes(c.id)}
                  active={openId === c.id}
                  flash={flashIds.includes(c.id)}
                  onCheck={() => toggleOne(c.id)}
                  onOpen={() => setOpenId(c.id)}
                />
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={shownCols.length + 1}><div className="cts-empty"><Icon name="ghost" /> No contacts match your filters.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div className="ct-pager">
            <span className="ctp-info">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}
            </span>
            <div className="ctp-nav">
              <button className="ctp-btn" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                <Icon name="caret-left" weight="bold" /> Prev
              </button>
              <div className="ctp-pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`ctp-page${p === safePage ? " on" : ""}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
              </div>
              <button className="ctp-btn" disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>
                Next <Icon name="caret-right" weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      {open && <ContactDrawer c={open} onClose={() => setOpenId(null)} onSync={syncContact} onDelete={() => { setDeletedIds(d => [...d, open.id]); setSelected(s => s.filter(x => x !== open.id)); setOpenId(null); }} />}
    </div>
  );
}

// Segmented tri-state control used inside the filter popover
function Seg({ value, onChange, opts }) {
  return (
    <div className="flt-seg">
      {opts.map(([v, l]) => (
        <button key={v} className={`flt-seg-b${value === v ? " on" : ""}`} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

// Removable active-filter chip
function FilterChip({ label, onClear }) {
  return (
    <span className="flt-pill">
      {label}
      <span className="fp-x" onClick={onClear}><Icon name="x" weight="bold" /></span>
    </span>
  );
}

// ---- Export helpers -------------------------------------------------------
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportContacts(list, format, cols) {
  cols = (cols && cols.length ? cols : CONTACT_COLUMNS);
  const headers = cols.map(c => c.label);
  const data = list.map(c => cols.map(col => col.text(c)));
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "xls") {
    const esc = v => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const head = "<tr>" + headers.map(h => `<th>${esc(h)}</th>`).join("") + "</tr>";
    const body = data.map(r => "<tr>" + r.map(v => `<td>${esc(v)}</td>`).join("") + "</tr>").join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1">${head}${body}</table></body></html>`;
    triggerDownload(new Blob([html], { type: "application/vnd.ms-excel" }), `instaflo-contacts-${stamp}.xls`);
  } else {
    const esc = v => { const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = [headers, ...data].map(r => r.map(esc).join(",")).join("\r\n");
    triggerDownload(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }), `instaflo-contacts-${stamp}.csv`);
  }
}

function numVal(s) {
  if (!s) return 0;
  const m = String(s).match(/([\d.]+)\s*([km]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = m[2].toLowerCase();
  return n * (u === "k" ? 1e3 : u === "m" ? 1e6 : 1);
}

function activeRank(s) {
  if (!s) return 1e9;
  const m = s.match(/(\d+)\s*(m|h|d)/);
  if (!m) return 1e8;
  const n = +m[1];
  return n * (m[2] === "m" ? 1 : m[2] === "h" ? 60 : 1440);
}

function SortTh({ label, k, sort, onSort }) {
  const on = sort.key === k;
  return (
    <th className={`sortable${on ? " on" : ""}`} onClick={() => onSort(k)}>
      <span>{label}</span>
      <Icon name={on ? (sort.dir === "asc" ? "arrow-up" : "arrow-down") : "arrows-down-up"} className="sort-i" />
    </th>
  );
}

function ContactRow({ c, cols, checked, active, flash, onCheck, onOpen }) {
  return (
    <tr className={`ct-row${checked ? " checked" : ""}${active ? " active" : ""}${flash ? " just-synced" : ""}`} onClick={onOpen}>
      <td className="col-check" onClick={e => e.stopPropagation()}>
        <label className="ct-check"><input type="checkbox" checked={checked} onChange={onCheck} /><span /></label>
      </td>
      {cols.map(col => <td key={col.id} className={col.cls}>{col.render(c)}</td>)}
    </tr>
  );
}

function StatusDot({ status }) {
  const map = {
    lead:       { c: "var(--warn)",   t: "Lead" },
    subscriber: { c: "var(--accent)", t: "Subscriber" },
    customer:   { c: "var(--up)",     t: "Customer" },
  };
  const s = map[status] || map.lead;
  return <span className="status-dot" style={{ "--sc": s.c }}>{s.t}</span>;
}

Object.assign(window, { ContactsScreen, StatusDot, SortTh, ContactRow, Seg, FilterChip, exportContacts });
