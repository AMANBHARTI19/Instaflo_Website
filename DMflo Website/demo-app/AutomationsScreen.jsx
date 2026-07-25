// Instaflo Calm — Automations list screen (redesigned: quick stats, inline + expandable edit, rows/grid, search/sort/filter, bulk, pagination)

/* ---- sort / parse helpers --------------------------------------------- */
function autoNum(s) {
  if (s == null) return 0;
  const m = String(s).match(/([\d.]+)\s*([km]?)/i);
  if (!m) return 0;
  return parseFloat(m[1]) * (m[2].toLowerCase() === "k" ? 1e3 : m[2].toLowerCase() === "m" ? 1e6 : 1);
}
function autoPct(s) { const m = String(s).match(/([\d.]+)/); return m ? parseFloat(m[1]) : -1; }
function autoTimeRank(s) {
  if (!s || /never/i.test(s)) return 1e12;
  if (/now/i.test(s)) return 0;
  const m = String(s).match(/(\d+)\s*(m|h|d|w)/);
  if (!m) return 1e11;
  const n = +m[1];
  return n * (m[2] === "m" ? 1 : m[2] === "h" ? 60 : m[2] === "d" ? 1440 : 10080);
}

/* ---- trigger keyword + details line (replaces the flow description) --- */
function triggerSummary(a) {
  const kw = (a.trigger || "").trim();
  if (/^any\b/i.test(kw)) {
    if (a.triggerType === "dm") return "Any DM message";
    if (a.triggerType === "story") return "Any story reply";
    if (a.triggerType === "mention") return "Any mention";
    return "Any comment";
  }
  const tt = (window.TRIGGER_TYPES || {})[a.triggerType] || { label: a.triggerType };
  // multiple keywords are stored comma-separated (e.g. "PRICE, COST, HOWMUCH")
  const parts = kw.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    return `${tt.label} contains \u201c${parts[0]}\u201d +${parts.length - 1} more`;
  }
  return `${tt.label} contains \u201c${kw}\u201d`;
}
function TriggerLine({ auto }) {
  const tt = (window.TRIGGER_TYPES || {})[auto.triggerType] || { label: auto.triggerType, icon: "lightning" };
  return <span className="a-trig"><Icon name={tt.icon} weight="bold" className="a-trig-i" />{triggerSummary(auto)}</span>;
}

const SORT_OPTS = [
  { key: "created",   label: "Recently created", get: a => a.created || 0,       defDesc: true },
  { key: "triggered", label: "Last triggered", get: a => -autoTimeRank(a.lastTriggered), defDesc: true },
  { key: "sent",      label: "DMs sent",       get: a => autoNum(a.sent),      defDesc: true },
  { key: "contacts",  label: "Contacts",   get: a => autoNum(a.contacts),  defDesc: true },
];

/* ---- one stat cell ---------------------------------------------------- */
function Stat({ icon, value, label, accent }) {
  return (
    <div className={`a-stat${accent ? " accent" : ""}`}>
      <div className="as-v"><Icon name={icon} className="as-i" weight="bold" /> {value}</div>
      <div className="as-k">{label}</div>
    </div>
  );
}

/* ---- agent-specific stat set ------------------------------------------ */
function AgentStats({ auto }) {
  const caps = auto.caps || [];
  const isComment = caps.includes("moderate") || caps.includes("engage");
  const first = isComment
    ? { icon: "chat-text", value: auto.sent, label: "Replies sent" }
    : { icon: "paper-plane-tilt", value: auto.sent, label: "DMs sent" };
  return (
    <>
      <Stat icon={first.icon} value={first.value} label={first.label} accent={auto.status === "live"} />
      <Stat icon="user-plus" value={auto.contacts} label="Contacts" />
      <Stat icon="clock" value={auto.lastTriggered} label="Last run" />
    </>
  );
}

function StatusPill({ status }) {  if (status === "live") return <span className="st-pill live"><span className="st-dot" /> Live</span>;
  if (status === "paused") return <span className="st-pill paused"><span className="st-dot" /> Paused</span>;
  return <span className="st-pill draft"><span className="st-dot" /> Draft</span>;
}

/* has this flow ever sent a DM? */
function hasActivity(a) { return autoNum(a.sent) > 0; }

/* per-flow zero-state (no DMs sent yet) — copy adapts to status */
const ZERO_COPY = {
  draft:  { icon: "rocket-launch", t: "Not live yet", s: "Flip it on to start sending DMs." },
  paused: { icon: "pause-circle",  t: "Nothing sent yet", s: "Resume to start replying." },
  live:   { icon: "hourglass-medium", t: "Waiting for the first trigger", s: "Stats appear the moment it fires." },
};
function FlowZero({ auto, variant }) {
  const c = ZERO_COPY[auto.status] || ZERO_COPY.live;
  return (
    <div className={`a-zero a-zero-${variant}`}>
      <span className="az-ico"><Icon name={c.icon} weight="bold" /></span>
      <div className="az-txt">
        <div className="az-t">{c.t}</div>
        <div className="az-s">{c.s}</div>
      </div>
    </div>
  );
}

/* ---- ⋯ actions menu (Edit / Delete) ----------------------------------- */
function FlowMenu({ open, onToggle, onClose, onEdit, onDelete, onArchive, onRestore, archived }) {
  const btnRef = React.useRef(null);
  const [pos, setPos] = React.useState(null);
  React.useEffect(() => {
    if (!open) { setPos(null); return; }
    const r = btnRef.current.getBoundingClientRect();
    const top = Math.min(r.bottom + 4, window.innerHeight - 150);
    setPos({ top, left: r.right - 168 });
    const onDown = e => { if (!e.target.closest(".row-menu") && !e.target.closest(".row-menu-wrap")) onClose(); };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onScroll); };
  }, [open]);
  return (
    <div className="row-menu-wrap">
      <button ref={btnRef} className={`rowbtn${open ? " active" : ""}`} title="More options" aria-label="More options"
        onClick={e => { e.stopPropagation(); onToggle(); }}>
        <Icon name="dots-three" weight="bold" />
      </button>
      {open && pos && (
        <Portal>
          <div className="row-menu row-menu-fixed" style={{ top: pos.top, left: pos.left }} onClick={e => e.stopPropagation()}>
            {archived ? (
              <button className="rm-item" onClick={() => { onClose(); onRestore(); }}><Icon name="arrow-counter-clockwise" /> Restore</button>
            ) : (
              <>
                <button className="rm-item" onClick={() => { onClose(); onEdit(); }}><Icon name="pencil-simple" /> Edit</button>
                <button className="rm-item" onClick={() => { onClose(); onArchive(); }}><Icon name="archive" /> Archive</button>
              </>
            )}
            <div className="rm-div" />
            <button className="rm-item danger" onClick={() => { onClose(); onDelete(); }}><Icon name="trash" /> Delete</button>
          </div>
        </Portal>
      )}
    </div>
  );
}

/* ---- row (list layout) ------------------------------------------------ */
function FlowRow(p) {
  const { auto, checked, highlight, showStats, menuOpen, onMenuToggle, onMenuClose, onToggleCheck, onToggleStatus, onOpen, openBuilder, askDelete, archived, onArchive, onRestore } = p;
  return (
    <div className={`auto-row${auto.status === "live" ? " live" : ""}${auto.kind === "agent" ? " is-agent" : ""}${highlight ? " just-published" : ""}${checked ? " checked" : ""}${archived ? " archived" : ""}`}>
      <div className="ar-main" onClick={archived ? undefined : onOpen} title={archived ? undefined : "Open in builder"} style={archived ? { cursor: "default" } : undefined}>
        <div className="ar-select">
          <div className="a-ico"><Icon name={auto.icon} /></div>
          <label className="ct-check ar-check" onClick={e => e.stopPropagation()}>
            <input type="checkbox" checked={checked} onChange={onToggleCheck} /><span />
          </label>
        </div>
        <div className="a-info">
          <div className="h">
            <span className="a-name">{auto.name}</span>
            {archived ? <span className="st-pill arch"><Icon name="archive" weight="bold" className="st-arch-i" /> Archived</span> : <StatusPill status={auto.status} />}
            {auto.kind === "agent" && <span className="a-agent-tag"><Icon name="sparkle" weight="fill" /> Agent</span>}
          </div>
          {auto.kind === "agent"
            ? <div className="s a-instr" title={auto.prompt}>{auto.prompt || "No instructions yet."}</div>
            : <div className="s"><TriggerLine auto={auto} /></div>}
        </div>
        {showStats && (hasActivity(auto) ? (
          <div className="a-stats">
            {auto.kind === "agent"
              ? <AgentStats auto={auto} />
              : <>
                  <Stat icon="paper-plane-tilt" value={auto.sent} label="DMs sent" accent={auto.status === "live"} />
                  <Stat icon="user-plus" value={auto.contacts} label="Contacts" />
                  <Stat icon="clock" value={auto.lastTriggered} label="Last run" />
                </>}
          </div>
        ) : (
          <FlowZero auto={auto} variant="row" />
        ))}
        <div className="ar-controls" onClick={e => e.stopPropagation()}>
          {archived
            ? <button className="btn btn-secondary btn-sm ar-restore" onClick={onRestore}><Icon name="arrow-counter-clockwise" /> Restore</button>
            : <Toggle on={auto.status === "live"} onClick={onToggleStatus} />}
          <FlowMenu open={menuOpen} onToggle={onMenuToggle} onClose={onMenuClose} archived={archived}
            onEdit={() => openBuilder(auto.id)} onDelete={() => askDelete(auto.id)} onArchive={onArchive} onRestore={onRestore} />
        </div>
      </div>
    </div>
  );
}

/* ---- card (grid layout) ----------------------------------------------- */
function FlowCard(p) {
  const { auto, checked, highlight, menuOpen, onMenuToggle, onMenuClose, onToggleCheck, onToggleStatus, onOpen, openBuilder, askDelete, archived, onArchive, onRestore } = p;
  return (
    <div className={`auto-card${auto.status === "live" ? " live" : ""}${auto.kind === "agent" ? " is-agent" : ""}${highlight ? " just-published" : ""}${checked ? " checked" : ""}${archived ? " archived" : ""}`} onClick={archived ? undefined : onOpen} title={archived ? undefined : "Open in builder"}>
      <div className="ac-top">
        <div className="a-ico"><Icon name={auto.icon} /></div>
        <label className="ct-check ac-check" onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={checked} onChange={onToggleCheck} /><span />
        </label>
        <StatusPill status={auto.status} />
        <div style={{ flex: 1 }} />
        <div className="ac-controls" onClick={e => e.stopPropagation()}>
          {archived
            ? <button className="btn btn-secondary btn-sm ar-restore" onClick={onRestore}><Icon name="arrow-counter-clockwise" /> Restore</button>
            : <Toggle on={auto.status === "live"} onClick={onToggleStatus} />}
          <FlowMenu open={menuOpen} onToggle={onMenuToggle} onClose={onMenuClose} archived={archived}
            onEdit={() => openBuilder(auto.id)} onDelete={() => askDelete(auto.id)} onArchive={onArchive} onRestore={onRestore} />
        </div>
      </div>
      <div className="ac-body">
        <div className="ac-name"><span className="a-name">{auto.name}</span></div>
        {auto.kind === "agent"
          ? <div className="ac-desc a-instr" title={auto.prompt}>{auto.prompt || "No instructions yet."}</div>
          : <div className="ac-desc"><TriggerLine auto={auto} /></div>}
      </div>
      {hasActivity(auto) ? (
        <div className="ac-stats">
          {auto.kind === "agent"
            ? <AgentStats auto={auto} />
            : <>
                <Stat icon="paper-plane-tilt" value={auto.sent} label="DMs sent" accent={auto.status === "live"} />
                <Stat icon="user-plus" value={auto.contacts} label="Contacts" />
                <Stat icon="clock" value={auto.lastTriggered} label="Last run" />
              </>}
        </div>
      ) : (
        <FlowZero auto={auto} variant="card" />
      )}
    </div>
  );
}

function AutomationsScreen({ autos, toggleAuto, openBuilder, openAgent, deleteAuto, duplicateAuto, renameAuto, bulkStatus, bulkDelete, onNew, highlightId, layout, setLayout, density, setArchived }) {
  layout = "rows"; // list view only (grid toggle removed)
  const { useState, useMemo, useEffect, useRef } = React;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "created", dir: "desc" });
  const [openMenu, setOpenMenu] = useState(null);    // "sort"
  const [selected, setSelected] = useState([]);
  const [rowMenuId, setRowMenuId] = useState(null);  // which flow's ⋯ menu is open
  const [confirm, setConfirm] = useState(null);      // { ids:[...] } delete confirm
  const [undoBar, setUndoBar] = useState(null);      // { msg, undo }
  const undoTimer = useRef(null);
  const isArchivedView = status === "archived";
  const [page, setPage] = useState(1);
  const PAGE_SIZE = layout === "grid" ? 9 : 8;

  const counts = useMemo(() => {
    const c = { all: 0, live: 0, paused: 0, draft: 0, archived: 0 };
    autos.forEach(a => {
      if (a.archived) { c.archived += 1; return; }
      c.all += 1;
      c[a.status] = (c[a.status] || 0) + 1;
    });
    return c;
  }, [autos]);

  const typeList = null; // trigger filter removed

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = autos.filter(a => {
      const match = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.trigger.toLowerCase().includes(q);
      if (status === "archived") return !!a.archived && match;
      if (a.archived) return false;
      const inStatus = status === "all" || a.status === status;
      return inStatus && match;
    });
    const opt = SORT_OPTS.find(o => o.key === sort.key) || SORT_OPTS[0];
    const dir = sort.dir === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => { const av = opt.get(a), bv = opt.get(b); return av > bv ? dir : av < bv ? -dir : 0; });
    return r;
  }, [autos, query, status, sort]);

  useEffect(() => { setPage(1); }, [query, status, sort, layout]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const allChecked = pageRows.length > 0 && pageRows.every(a => selected.includes(a.id));

  const menuRef = useRef(null);
  useEffect(() => {
    if (!openMenu) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [openMenu]);

  function toggleOne(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleAllPage() { setSelected(allChecked ? selected.filter(id => !pageRows.some(a => a.id === id)) : [...new Set([...selected, ...pageRows.map(a => a.id)])]); }
  function pickSort(key) { const o = SORT_OPTS.find(s => s.key === key); setSort({ key, dir: o.defDesc ? "desc" : "asc" }); setOpenMenu(null); }

  function flashUndo(msg, undo) {
    clearTimeout(undoTimer.current);
    setUndoBar({ msg, undo });
    undoTimer.current = setTimeout(() => setUndoBar(null), 5600);
  }
  function dismissUndo() { clearTimeout(undoTimer.current); setUndoBar(null); }
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  function doArchive(ids, name) {
    setArchived(ids, true);
    setSelected(s => s.filter(x => !ids.includes(x)));
    setRowMenuId(null);
    flashUndo(ids.length === 1 && name ? `“${name}” archived` : `${ids.length} flow${ids.length !== 1 ? "s" : ""} archived`, () => setArchived(ids, false));
  }
  function doRestore(ids, name) {
    setArchived(ids, false);
    setSelected(s => s.filter(x => !ids.includes(x)));
    setRowMenuId(null);
    flashUndo(ids.length === 1 && name ? `“${name}” restored` : `${ids.length} flow${ids.length !== 1 ? "s" : ""} restored`, () => setArchived(ids, true));
  }

  const anyFilter = !isArchivedView && (status !== "all" || query.trim());
  const selCount = selected.length;
  const selLive = autos.filter(a => selected.includes(a.id) && a.status === "live").length;

  const rowProps = a => ({
    auto: a,
    checked: selected.includes(a.id),
    highlight: a.id === highlightId,
    menuOpen: rowMenuId === a.id,
    onMenuToggle: () => setRowMenuId(id => id === a.id ? null : a.id),
    onMenuClose: () => setRowMenuId(null),
    onToggleCheck: () => toggleOne(a.id),
    onToggleStatus: () => toggleAuto(a.id),
    onOpen: () => (a.kind === "agent" && openAgent ? openAgent(a.agentId) : openBuilder(a.id)),
    openBuilder: a.kind === "agent" && openAgent ? () => openAgent(a.agentId) : openBuilder,
    askDelete: id => setConfirm({ ids: [id] }),
    archived: isArchivedView,
    onArchive: () => doArchive([a.id], a.name),
    onRestore: () => doRestore([a.id], a.name),
  });

  return (
    <div className="content autos-content">
      <div className="autos-shell card">
        {/* toolbar */}
        <div className="ct-toolbar">
          <div className="input ct-search">
            <Icon name="magnifying-glass" style={{ fontSize: 15 }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search flows by name, keyword or trigger…" />
            {query && <button className="ct-search-x" onClick={() => setQuery("")} aria-label="Clear"><Icon name="x" weight="bold" /></button>}
          </div>

          {/* status segmented */}
          <div className="a-statusseg">
            {[["all", "All"], ["live", "Live"], ["paused", "Paused"]].map(([v, l]) => (
              <button key={v} className={`a-seg-b${status === v ? " on" : ""}`} onClick={() => setStatus(v)}>
                {l}<span className="a-seg-n">{counts[v] || 0}</span>
              </button>
            ))}
          </div>

          {/* sort */}
          <div className="ct-filter" ref={openMenu === "sort" ? menuRef : null}>
            <button className="btn btn-secondary btn-sm" onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}>
              <Icon name="arrows-down-up" /> {(SORT_OPTS.find(o => o.key === sort.key) || {}).label}
              <Icon name="caret-down" className="fb-caret" />
            </button>
            {openMenu === "sort" && (
              <div className="flt-menu flt-menu-right">
                <div className="flt-head">Sort by</div>
                {SORT_OPTS.map(o => (
                  <button key={o.key} className={`flt-item${sort.key === o.key ? " on" : ""}`} onClick={() => pickSort(o.key)}>
                    <span className="fi-name">{o.label}</span>
                    {sort.key === o.key && <Icon name="check" className="fi-check" />}
                  </button>
                ))}
                <div className="flt-div" />
                <button className="flt-item" onClick={() => setSort(s => ({ ...s, dir: s.dir === "asc" ? "desc" : "asc" }))}>
                  <Icon name={sort.dir === "asc" ? "sort-ascending" : "sort-descending"} className="fi-ico" />
                  <span className="fi-name">{sort.dir === "asc" ? "Ascending" : "Descending"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* archived-view banner */}
        {isArchivedView && (
          <div className="ct-archbanner">
            <Icon name="archive" weight="fill" className="cab-ico" />
            <span className="cab-txt">Archived flows are paused and hidden from your active list. Restore one to bring it back.</span>
            <button className="cab-back" onClick={() => setStatus("all")}><Icon name="arrow-left" weight="bold" /> Active flows</button>
          </div>
        )}

        {/* active filter chips */}
        {anyFilter && (
          <div className="ct-filterbar">
            <Icon name="funnel" className="cfb-ico" />
            {status !== "all" && <FilterChip label={<><span className="fp-k">Status</span> {status[0].toUpperCase() + status.slice(1)}</>} onClear={() => setStatus("all")} />}
            {query.trim() && <FilterChip label={<><span className="fp-k">Search</span> {query.trim()}</>} onClear={() => setQuery("")} />}
            <button className="ct-clearall" onClick={() => { setStatus("all"); setQuery(""); }}>Clear all</button>
          </div>
        )}

        {/* selection bar OR count */}
        {selCount > 0 ? (
          <div className="ct-selbar">
            <label className="ct-check"><input type="checkbox" checked={allChecked} onChange={toggleAllPage} /><span /></label>
            <b>{selCount} selected</b>
            <div style={{ flex: 1 }} />
            {!isArchivedView && selLive > 0 && <button className="btn btn-secondary btn-sm" onClick={() => { bulkStatus(selected, "paused"); }}><Icon name="pause" /> Pause</button>}
            {!isArchivedView && selLive < selCount && <button className="btn btn-secondary btn-sm" onClick={() => { bulkStatus(selected, "live"); }}><Icon name="play" /> Resume</button>}
            {isArchivedView
              ? <button className="btn btn-secondary btn-sm" onClick={() => doRestore([...selected])}><Icon name="arrow-counter-clockwise" /> Restore</button>
              : <button className="btn btn-secondary btn-sm" onClick={() => doArchive([...selected])}><Icon name="archive" /> Archive</button>}
            <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ ids: [...selected] })}><Icon name="trash" /> Delete</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
          </div>
        ) : (
          <div className="ct-countbar">
            <label className="ct-check" title="Select page"><input type="checkbox" checked={allChecked} onChange={toggleAllPage} /><span /></label>
            <span className="ct-count">{rows.length} flow{rows.length !== 1 ? "s" : ""}<span className="in"> · {counts.live} live</span></span>
            <div style={{ flex: 1 }} />
            {!isArchivedView && counts.archived > 0 && (
              <button className="ct-archlink" onClick={() => { setStatus("archived"); setSelected([]); }} title="View archived flows">
                <Icon name="archive" weight="bold" /> {counts.archived} archived
              </button>
            )}
          </div>
        )}

        {/* list / grid */}
        {rows.length === 0 ? (
          <div className="empty-state autos-empty">
            <Icon name={isArchivedView ? "archive" : anyFilter ? "magnifying-glass" : "ghost"} />
            <div className="t">{isArchivedView ? "Nothing archived" : anyFilter ? "No flows match your filters." : "No automations yet. Let's fix that."}</div>
            <div className="s">{isArchivedView ? "Flows you archive will land here — out of the way, but never deleted." : anyFilter ? "Try clearing a filter or search." : "Build your first flow to start replying on autopilot."}</div>
            {isArchivedView
              ? <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => setStatus("all")}><Icon name="arrow-left" /> Active flows</button>
              : anyFilter
              ? <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => { setStatus("all"); setQuery(""); }}>Clear filters</button>
              : <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={onNew}><Icon name="plus" /> New flow</button>}
          </div>
        ) : layout === "grid" ? (
          <div className={`autos-grid dens-${density}${selCount > 0 ? " has-selection" : ""}`}>
            {pageRows.map(a => <FlowCard key={a.id} {...rowProps(a)} />)}
          </div>
        ) : (
          <div className={`autos-list dens-${density}${selCount > 0 ? " has-selection" : ""}`}>
            {pageRows.map(a => <FlowRow key={a.id} showStats={true} {...rowProps(a)} />)}
          </div>
        )}

        {/* pager */}
        {pageCount > 1 && (
          <div className="ct-pager">
            <span className="ctp-info">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}</span>
            <div className="ctp-nav">
              <button className="ctp-btn" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}><Icon name="caret-left" weight="bold" /> Prev</button>
              <div className="ctp-pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(pp => (
                  <button key={pp} className={`ctp-page${pp === safePage ? " on" : ""}`} onClick={() => setPage(pp)}>{pp}</button>
                ))}
              </div>
              <button className="ctp-btn" disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>Next <Icon name="caret-right" weight="bold" /></button>
            </div>
          </div>
        )}
      </div>

      {/* undo snackbar */}
      {undoBar && (
        <Portal>
          <div className="undo-snack" role="status">
            <span className="us-ico"><Icon name="archive" weight="fill" /></span>
            <span className="us-msg">{undoBar.msg}</span>
            <button className="us-undo" onClick={() => { undoBar.undo(); dismissUndo(); }}><Icon name="arrow-counter-clockwise" weight="bold" /> Undo</button>
            <button className="us-x" onClick={dismissUndo} aria-label="Dismiss"><Icon name="x" weight="bold" /></button>
          </div>
        </Portal>
      )}

      {/* delete confirm */}
      {confirm && (() => {
        const ids = confirm.ids;
        const single = ids.length === 1 ? autos.find(a => a.id === ids[0]) : null;
        return (
          <Portal>
            <div className="modal-overlay" onClick={() => setConfirm(null)}>
              <div className="modal del-confirm" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                  <div className="mh-txt">
                    <h2>{single ? `Delete "${single.name}"?` : `Delete ${ids.length} flows?`}</h2>
                    <div className="mh-sub">This permanently removes {single ? "the automation" : "these automations"} and {single ? "its" : "their"} history. This can't be undone.</div>
                  </div>
                  <button className="mh-close" onClick={() => setConfirm(null)} aria-label="Close"><Icon name="x" /></button>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => {
                    if (single) deleteAuto(ids[0]); else bulkDelete(ids);
                    setSelected(s => s.filter(x => !ids.includes(x)));
                    setConfirm(null);
                  }}><Icon name="trash" /> {single ? "Delete automation" : `Delete ${ids.length} flows`}</button>
                </div>
              </div>
            </div>
          </Portal>
        );
      })()}
    </div>
  );
}

Object.assign(window, { AutomationsScreen });
