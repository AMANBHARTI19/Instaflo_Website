// DMflo Calm — Plans & billing
const BILL_INFO = {
  holder: "Maya Rin",
  email: "maya@mayamakes.co",
  card: { brand: "Visa", last4: "4242", exp: "08 / 28" },
  proSince: "Feb 1, 2025",
  renews: "Aug 1, 2026",
  lastCharge: "Jul 1, 2026",
  address: "12 MG Road, Indiranagar\nBengaluru, KA 560038\nIndia",
};

// Pro invoice history (most recent first)
const INVOICES = [
  { id: "DMF-2607", date: "Jul 1, 2026", desc: "Pro plan · monthly", amount: "₹499.00", status: "paid" },
  { id: "DMF-2606", date: "Jun 1, 2026", desc: "Pro plan · monthly", amount: "₹499.00", status: "paid" },
  { id: "DMF-2605", date: "May 1, 2026", desc: "Pro plan · monthly", amount: "₹499.00", status: "paid" },
  { id: "DMF-2604", date: "Apr 1, 2026", desc: "Pro plan · monthly", amount: "₹499.00", status: "paid" },
];

const FREE_FEATURES = [
  { on: true,  t: "1,000 DMs / month" },
  { on: true,  t: "Basic analytics" },
  { on: false, t: "Trigger on any post or reel" },
];
const PRO_FEATURES = [
  { on: true, t: "Unlimited DMs, flat forever" },
  { on: true, t: "Trigger on any post or reel" },
  { on: true, t: "Require a follow before sending" },
  { on: true, t: "Collect emails before the link" },
  { on: true, t: "Full analytics & exports" },
  { on: true, t: "Priority support" },
];

function SectionLabel({ children }) {
  return <div className="s-sh">{children}</div>;
}

// ---- Current plan -----------------------------------------------------------
function CurrentPlanFree({ plan, onUpgrade }) {
  const reached = plan.limitReached;
  const pct = Math.min(100, (plan.dmsSent / plan.limit) * 100);
  const meterCls = reached ? "danger" : plan.nearLimit ? "warn" : "ok";
  return (
    <div className={`plan-card free${reached ? " reached" : ""}`}>
      <div className="pc-top">
        <div className="pc-name">Free plan</div>
        <span className={`pc-status ${reached ? "reached" : "limited"}`}>
          {reached ? "Limit reached" : "Limited"}
        </span>
      </div>
      <div className="pc-label">DMs left this month</div>
      <div className="pc-meter-row">
        <div className={`pc-left ${meterCls}`}>{plan.dmsLeft.toLocaleString()}</div>
        <div className="pc-count">{plan.dmsSent.toLocaleString()} / {plan.limit.toLocaleString()}</div>
      </div>
      <div className={`pc-meter ${meterCls}`}><span style={{ width: pct + "%" }} /></div>
      <div className="pc-meta">
        {reached && <><span className="pc-paused">Flows paused</span> · </>}Resets in {plan.resetsInDays} days
      </div>
      <div className="pc-upsell">
        <div className="pu-info">
          <div className="pu-h">Go Pro <span className="pu-price">₹499/mo</span></div>
          <div className="pu-s">{reached ? "Resume your paused flows instantly." : "Unlimited DMs, flat forever."}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onUpgrade}>Upgrade</button>
      </div>
    </div>
  );
}

function CurrentPlanPro() {
  return (
    <div className="plan-card pro">
      <div className="pc-badge">Pro</div>
      <div className="pc-pro-info">
        <div className="t">You’re on Pro</div>
        <div className="s">Unlimited DMs &amp; flows · renews {BILL_INFO.renews}</div>
      </div>
      <span className="pc-since">Since {BILL_INFO.proSince}</span>
    </div>
  );
}

// ---- Plan comparison --------------------------------------------------------
function FeatureList({ items }) {
  return (
    <ul className="cmp-feats">
      {items.map((f, i) => (
        <li key={i} className={f.on ? "on" : "off"}>
          <Icon name={f.on ? "check" : "minus"} weight="bold" />
          {f.t}
        </li>
      ))}
    </ul>
  );
}

function PlanCompare({ isPro, onUpgrade }) {
  return (
    <div className="plan-compare">
      <div className={`cmp-tile${!isPro ? " current" : ""}`}>
        <div className="cmp-top">
          <div className="cmp-name">Free</div>
          {!isPro && <span className="cmp-current">Current</span>}
        </div>
        <div className="cmp-price"><b>₹0</b><span>/mo</span></div>
        <div className="cmp-note">For getting started</div>
        <FeatureList items={FREE_FEATURES} />
      </div>

      <div className={`cmp-tile pro${isPro ? " current" : ""}`}>
        <div className="cmp-top">
          <div className="cmp-name">Pro</div>
          {isPro ? <span className="cmp-current on-accent">Current</span> : <span className="cmp-best">Best value</span>}
        </div>
        <div className="cmp-price"><b>₹499</b><span>/mo</span></div>
        <div className="cmp-note">Flat forever · cancel anytime</div>
        <FeatureList items={PRO_FEATURES} />
        {!isPro && <button className="btn btn-primary btn-block" onClick={onUpgrade}><Icon name="lightning" weight="fill" /> Upgrade to Pro</button>}
      </div>
    </div>
  );
}

// ---- Payment method ---------------------------------------------------------
function CardMark({ brand }) {
  return (
    <span className="card-mark" aria-hidden="true">
      <span className="cm-dot a" /><span className="cm-dot b" />
    </span>
  );
}

function PaymentMethod({ isPro }) {
  if (!isPro) {
    return (
      <div className="card pay-empty">
        <span className="pe-ico"><Icon name="credit-card" weight="bold" /></span>
        <div className="pe-txt">
          <div className="t">No payment method yet</div>
          <div className="s">Add a card when you upgrade — nothing’s charged on Free.</div>
        </div>
      </div>
    );
  }
  const c = BILL_INFO.card;
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="pay-row">
        <CardMark brand={c.brand} />
        <div className="pay-info">
          <div className="h">{c.brand} ending {c.last4}</div>
          <div className="s">Expires {c.exp} · {BILL_INFO.holder}</div>
        </div>
        <span className="live-pill"><span className="dot" />Default</span>
        <button className="btn btn-secondary btn-sm">Update</button>
      </div>
    </div>
  );
}

// ---- Next payment -----------------------------------------------------------
function NextPayment() {
  return (
    <div className="card next-pay">
      <div className="np-left">
        <div className="np-label">Next payment</div>
        <div className="np-amt">₹499.00</div>
        <div className="np-when">on {BILL_INFO.renews}</div>
      </div>
      <div className="np-right">
        <div className="np-line"><span className="l">Plan</span><span className="r">Pro · monthly</span></div>
        <div className="np-line"><span className="l">Billing</span><span className="r">₹499 / month</span></div>
        <div className="np-line"><span className="l">Next billing date</span><span className="r">{BILL_INFO.renews}</span></div>
        <button className="btn btn-ghost btn-sm np-cancel">Cancel plan</button>
      </div>
    </div>
  );
}

// ---- Billing history --------------------------------------------------------
function BillingHistory({ isPro }) {
  if (!isPro) {
    return (
      <div className="card inv-empty">
        <span className="ie-ico"><Icon name="receipt" weight="bold" /></span>
        <div className="ie-txt">
          <div className="t">No payments yet</div>
          <div className="s">Your invoices will show up here once you go Pro.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="card inv-table">
      <div className="inv-head">
        <span>Invoice</span>
        <span>Date</span>
        <span className="inv-amt">Amount</span>
        <span className="inv-act"></span>
      </div>
      {INVOICES.map((v, i) => (
        <div className="inv-row" key={v.id}>
          <div className="inv-cell inv-id">
            <span className="iv-no">{v.id}</span>
            <span className="iv-desc">{v.desc}</span>
          </div>
          <div className="inv-cell inv-date">
            {v.date}
            {i === 0 && <span className="iv-last">Last purchase</span>}
          </div>
          <div className="inv-cell inv-amt">
            {v.amount}
            <span className="iv-paid">Paid</span>
          </div>
          <div className="inv-cell inv-act">
            <button className="iv-dl" title="Download invoice"><Icon name="download-simple" weight="bold" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Billing details --------------------------------------------------------
const BILL_FIELDS = [
  { key: "holder",  label: "Billing name",   type: "text",     hint: null,                          placeholder: "Full name" },
  { key: "email",   label: "Billing email",  type: "email",    hint: "receipts sent here",            placeholder: "you@example.com" },
  { key: "address", label: "Billing address", type: "textarea", hint: null,                          placeholder: "Street, city, state, ZIP, country" },
  { key: "gstin",   label: "GSTIN / tax ID", type: "text",     hint: "shown on your invoices",        placeholder: "e.g. 29ABCDE1234F1Z5" },
];

function EditFieldModal({ field, value, onSave, onClose }) {
  const { useState, useEffect, useRef } = React;
  const [val, setVal] = useState(value || "");
  const ref = useRef(null);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    if (ref.current) { ref.current.focus(); ref.current.select && ref.current.select(); }
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const isArea = field.type === "textarea";
  return (
    <Portal>
      <div className="modal-overlay" style={{ zIndex: 70 }} onClick={onClose}>
        <div className="modal bill-edit" onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div className="mh-txt">
              <h2>Edit {field.label.toLowerCase()}</h2>
              <div className="mh-sub">This appears on your receipts and invoices.</div>
            </div>
            <button className="mh-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
          </div>
          <div className="modal-body">
            <label className="be-field">
              <span className="be-label">{field.label}</span>
              <div className="input input-surface">
                {isArea
                  ? <textarea ref={ref} rows={3} value={val} placeholder={field.placeholder} onChange={e => setVal(e.target.value)} />
                  : <input ref={ref} type={field.type} value={val} placeholder={field.placeholder} onChange={e => setVal(e.target.value)} />}
              </div>
              {field.hint && <span className="be-hint">{field.hint}</span>}
            </label>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(val.trim())}><Icon name="check" weight="bold" /> Save changes</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function BillingDetails() {
  const { useState } = React;
  const [info, setInfo] = useState({
    holder: BILL_INFO.holder,
    email: BILL_INFO.email,
    address: BILL_INFO.address,
    gstin: "",
  });
  const [editing, setEditing] = useState(null); // field key being edited
  const field = BILL_FIELDS.find(f => f.key === editing);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {BILL_FIELDS.map(f => {
        const v = info[f.key];
        const empty = !v;
        return (
          <div className="settings-row" key={f.key}>
            <div className="sr-label">
              <div className="t">{f.label}</div>
              <div className={`s${empty ? " muted" : ""}`} style={f.type === "textarea" ? { whiteSpace: "pre-line" } : undefined}>
                {empty
                  ? (f.key === "gstin" ? "Add one to show it on your invoices" : `Add your ${f.label.toLowerCase()}`)
                  : (f.key === "email" ? <>{v} · {f.hint}</> : v)}
              </div>
            </div>
            <button className={`btn btn-sm ${empty ? "btn-ghost" : "btn-secondary"}`} onClick={() => setEditing(f.key)}>
              {empty ? "Add" : "Edit"}
            </button>
          </div>
        );
      })}

      {field && (
        <EditFieldModal
          field={field}
          value={info[field.key]}
          onClose={() => setEditing(null)}
          onSave={v => { setInfo(prev => ({ ...prev, [field.key]: v })); setEditing(null); }}
        />
      )}
    </div>
  );
}

function BillingScreen({ plan, onUpgrade }) {
  const isPro = plan.isPro;
  return (
    <div className="settings-body billing-body">
      <div className="settings-inner billing-inner">

        <div className="settings-section">
          <SectionLabel>Current plan</SectionLabel>
          {isPro ? <CurrentPlanPro /> : <CurrentPlanFree plan={plan} onUpgrade={onUpgrade} />}
        </div>

        {isPro && (
          <div className="settings-section">
            <SectionLabel>Next payment</SectionLabel>
            <NextPayment />
          </div>
        )}

        <div className="settings-section">
          <SectionLabel>{isPro ? "Your plan vs Free" : "Compare plans"}</SectionLabel>
          <PlanCompare isPro={isPro} onUpgrade={onUpgrade} />
        </div>

        <div className="settings-section">
          <SectionLabel>Billing history</SectionLabel>
          <BillingHistory isPro={isPro} />
        </div>

        <div className="settings-section">
          <SectionLabel>Billing details</SectionLabel>
          <BillingDetails />
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { BillingScreen });
