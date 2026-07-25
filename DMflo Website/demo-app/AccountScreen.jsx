// DMflo — Account / Billing page (standalone, no sidebar)
// Opened from the mobile app when a Free user taps "Upgrade".
const { useState: useAcctState } = React;

const ACCT_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "plan": "free",
  "dmsSent": 342
}/*EDITMODE-END*/;

const PRO_PERKS = [
  { icon: "infinity",     h: "Unlimited DMs",          s: "No monthly cap — flows never pause" },
  { icon: "stack",        h: "Unlimited active flows", s: "Build as many automations as you need" },
  { icon: "chart-line-up", h: "Full analytics",        s: "Every metric, no 7-day window" },
  { icon: "headset",      h: "Priority support",       s: "Jump the queue when you need a hand" },
];

function AcctHeader() {
  return (
    <header className="acct-top">
      <a className="acct-back" href="index.html">
        <Icon name="arrow-left" />
        <span>Dashboard</span>
      </a>
      <div className="acct-brand">
        <img src="../assets/mark.svg" width="24" height="24" alt="" />
        <span className="sys">Account</span>
      </div>
    </header>
  );
}

// The plan the user is currently on ------------------------------------------
function CurrentPlanCard({ plan }) {
  const reached = plan.limitReached;
  const pct = Math.min(100, (plan.dmsSent / plan.limit) * 100);
  const meterCls = reached ? "danger" : plan.nearLimit ? "warn" : "ok";
  return (
    <section className="acct-current">
      <div className="acct-section-label sys">Current plan</div>
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
      </div>
    </section>
  );
}

// The upgrade offer ----------------------------------------------------------
function UpgradeCard({ onUpgrade, busy }) {
  return (
    <section className="acct-upgrade">
      <div className="au-head">
        <span className="au-badge">Pro</span>
        <div className="au-price">
          <b>₹499</b><span>/mo</span>
        </div>
        <div className="au-flat sys">Flat, forever</div>
      </div>
      <h2 className="au-title">Go unlimited.</h2>
      <p className="au-sub">Everything DMflo can do, no caps — cancel anytime.</p>

      <ul className="au-perks">
        {PRO_PERKS.map((p, i) => (
          <li key={i} className="au-perk">
            <span className="au-pi"><Icon name={p.icon} weight="fill" /></span>
            <span className="au-pt">
              <span className="h">{p.h}</span>
              <span className="s">{p.s}</span>
            </span>
          </li>
        ))}
      </ul>

      <button className="btn btn-primary acct-cta" onClick={onUpgrade} disabled={busy}>
        {busy
          ? <><span className="acct-spin" /> Opening secure checkout…</>
          : <><Icon name="lightning" weight="fill" /> Upgrade to Pro</>}
      </button>
      <div className="acct-trust">
        <Icon name="lock-simple" weight="fill" style={{ fontSize: 13 }} />
        Secure payment · Cancel anytime · Instant activation
      </div>
    </section>
  );
}

// Success state after checkout completes -------------------------------------
function ProActive({ fresh }) {
  return (
    <section className="acct-pro-active">
      {fresh && (
        <div className="acct-celebrate">
          <span className="acct-check"><Icon name="check" weight="bold" /></span>
          <div className="acct-cel-txt">
            <div className="h">You’re on Pro. 🎉</div>
            <div className="s">Unlimited DMs are live and any paused flows just resumed.</div>
          </div>
        </div>
      )}
      <div className="plan-card acct-pro">
        <div className="pc-badge">Pro</div>
        <div className="acct-pro-info">
          <div className="t">DMflo Pro</div>
          <div className="s">Unlimited DMs &amp; flows · renews Aug 7, 2026</div>
        </div>
      </div>
      <div className="acct-pro-rows">
        <div className="acct-pro-row">
          <span className="l">Billing</span>
          <span className="r">₹499 / month</span>
        </div>
        <div className="acct-pro-row">
          <span className="l">Payment method</span>
          <span className="r"><Icon name="credit-card" style={{ fontSize: 14 }} /> UPI · maya@okhdfc</span>
        </div>
        <div className="acct-pro-row">
          <span className="l">Next charge</span>
          <span className="r">Aug 7, 2026</span>
        </div>
      </div>
      <div className="acct-pro-actions">
        <button className="btn btn-secondary">Manage billing</button>
        <a className="btn btn-primary" href="index.html"><Icon name="arrow-left" /> Back to dashboard</a>
      </div>
    </section>
  );
}

function AccountScreen() {
  const [t, setTweak] = useTweaks(ACCT_TWEAK_DEFAULTS);
  const [busy, setBusy] = useAcctState(false);
  const [justUpgraded, setJustUpgraded] = useAcctState(false);

  const DM_LIMIT = 1000;
  const isPro = t.plan === "pro" || justUpgraded;
  const dmsSent = Math.min(t.dmsSent, DM_LIMIT);
  const dmsLeft = Math.max(0, DM_LIMIT - dmsSent);
  const plan = {
    limit: DM_LIMIT, dmsSent, dmsLeft,
    limitReached: dmsLeft <= 0,
    nearLimit: dmsLeft > 0 && dmsLeft <= 100,
    resetsInDays: 8,
  };

  // Real payment gateway is wired up elsewhere; here we simulate the
  // redirect-to-checkout → success round trip.
  const handleUpgrade = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setJustUpgraded(true);
      window.scrollTo({ top: 0 });
    }, 1500);
  };

  return (
    <div className="acct-page">
      <AcctHeader />
      <main className="acct-main">
        <div className="acct-intro">
          <div className="sys">Billing</div>
          <h1 className="acct-h1">{isPro ? "Your subscription" : "Choose your plan"}</h1>
          <p className="acct-lede">
            {isPro
              ? "You’re all set. Manage your Pro subscription below."
              : "You’re on the Free plan. Upgrade to Pro for unlimited DMs and flows."}
          </p>
        </div>

        {isPro ? (
          <ProActive fresh={justUpgraded} />
        ) : (
          <>
            <CurrentPlanCard plan={plan} />
            <UpgradeCard onUpgrade={handleUpgrade} busy={busy} />
            <div className="acct-foot sys">DMflo · Billed in INR · GST invoice emailed</div>
          </>
        )}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Preview state" />
        <TweakRadio label="Plan" value={t.plan} options={["free", "pro"]} onChange={v => { setJustUpgraded(false); setTweak("plan", v); }} />
        {t.plan === "free" && (
          <TweakSlider label="DMs sent" value={t.dmsSent} min={0} max={1000} step={1} onChange={v => setTweak("dmsSent", v)} />
        )}
      </TweaksPanel>
    </div>
  );
}

Object.assign(window, { AccountScreen });
