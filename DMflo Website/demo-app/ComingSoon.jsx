// Instaflo Calm — reusable "Coming soon" screen
// Rendered in place of a real tab when its switch is flipped off in Tweaks.

const COMING_SOON_COPY = {
  agents: {
    icon: "robot",
    eyebrow: "In the lab",
    title: "AI agents are almost ready",
    blurb: "Autonomous teammates that read your DMs and comments, answer from your docs, and hand off to you when it matters — trained in plain English.",
    features: [
      { icon: "sparkle",           t: "Describe it, we build it",  s: "Spin up an agent from a sentence" },
      { icon: "books",             t: "Grounded in your docs",     s: "Answers from your files & links" },
      { icon: "arrows-split",      t: "Smart handoff",             s: "Escalates the tricky ones to you" },
    ],
  },
  inbox: {
    icon: "tray",
    eyebrow: "In the lab",
    title: "A unified inbox is on the way",
    blurb: "Every DM, comment, and story reply your flows touch — in one calm thread view, so nothing slips and every conversation stays in context.",
    features: [
      { icon: "chats-circle",      t: "One thread per person",     s: "DMs & comments, merged" },
      { icon: "lightning",         t: "Flow-aware",                s: "See which automation replied" },
      { icon: "check-circle",      t: "Zero-inbox tools",          s: "Snooze, assign, mark done" },
    ],
  },
  analytics: {
    icon: "chart-line-up",
    eyebrow: "In the lab",
    title: "Deeper analytics are coming",
    blurb: "Go beyond sent counts — funnel breakdowns, per-flow conversion, and cohort retention so you can see exactly what your automations earn you.",
    features: [
      { icon: "funnel",            t: "Full funnels",              s: "Comment → DM → click → convert" },
      { icon: "trend-up",          t: "Per-flow ROI",              s: "Revenue attributed to each flow" },
      { icon: "users-three",       t: "Cohort retention",          s: "Who comes back, and when" },
    ],
  },
};

function ComingSoon({ tab }) {
  const { useState } = React;
  const [notified, setNotified] = useState(false);
  const c = COMING_SOON_COPY[tab] || COMING_SOON_COPY.agents;

  return (
    <div className="content cs-content">
      <div className="cs-card card">
        <span className="cs-glow" aria-hidden="true" />
        <div className="cs-ico"><Icon name={c.icon} weight="fill" /></div>
        <div className="cs-eyebrow sys">
          <span className="cs-pulse" />{c.eyebrow}
        </div>
        <h2 className="cs-title">{c.title}</h2>
        <p className="cs-blurb">{c.blurb}</p>

        <div className="cs-features">
          {c.features.map((f, i) => (
            <div key={i} className="cs-feat">
              <span className="cs-feat-ico"><Icon name={f.icon} /></span>
              <div className="cs-feat-txt">
                <div className="cs-feat-t">{f.t}</div>
                <div className="cs-feat-s">{f.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="cs-actions">
          <button
            className={`btn ${notified ? "btn-secondary" : "btn-primary"}`}
            onClick={() => setNotified(v => !v)}
          >
            <Icon name={notified ? "check" : "bell"} weight={notified ? "bold" : "regular"} />
            {notified ? "We’ll let you know" : "Notify me when it’s live"}
          </button>
          <span className="cs-eta sys">Shipping this quarter</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ComingSoon, COMING_SOON_COPY });
