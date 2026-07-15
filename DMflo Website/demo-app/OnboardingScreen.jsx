// Instaflo Calm — Onboarding (3-step, captivating)
function OnboardingScreen({ onDone }) {
  const { useState, useEffect, useRef } = React;
  const [step, setStep] = useState(0);
  const [connectState, setConnectState] = useState("idle"); // idle | connecting | done
  const [role, setRole] = useState(null);
  const [goals, setGoals] = useState([]); // multiselect

  const roles = [
    { id: "creator", icon: "sparkle",     t: "Creator", s: "I post content & grow my own audience" },
    { id: "brand",   icon: "storefront",  t: "Brand",   s: "We sell products & run campaigns" },
    { id: "agency",  icon: "users-three", t: "Agency",  s: "We manage accounts for clients" },
  ];
  const goalOpts = [
    { id: "link",  icon: "link",       t: "Auto-DM my link",        s: "A comment fires an instant DM with your link" },
    { id: "reply", icon: "tray",       t: "Auto-reply to my DMs",   s: "Auto-respond when someone DMs you first" },
    { id: "leads", icon: "user-plus",  t: "Capture leads & emails", s: "Turn conversations into a contact list" },
  ];

  const connected = connectState === "done";
  const canNext =
    (step === 0 && connected) ||
    (step === 1 && role) ||
    (step === 2 && goals.length > 0);

  function connect() {
    if (connectState !== "idle") return;
    setConnectState("connecting");
    setTimeout(() => setConnectState("done"), 1400);
  }
  function toggleGoal(id) {
    setGoals(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id]);
  }

  return (
    <div className="onb">
      {/* ---- left: form ---- */}
      <div className="onb-left">
        <div style={{ marginBottom: 36 }}><Logo /></div>

        <div className="onb-steps">
          {[0, 1, 2].map(i => (
            <span key={i} className={`os${i < step ? " done" : i === step ? " cur" : ""}`} />
          ))}
        </div>

        <div className="sys" style={{ marginBottom: 12 }}>Setup · 0{step + 1} / 03</div>

        {step === 0 && (
          <div className="fade-in" key="s0">
            <h1 className="onb-q">Connect your Instagram.</h1>
            <p className="onb-sub">Works with Business and Creator accounts. We never post without your say-so.</p>
            <button
              className={`onb-connect ${connectState}`}
              onClick={connect}
              disabled={connectState !== "idle"}
            >
              {connectState === "idle" && (<><Icon name="instagram-logo" weight="fill" /> Connect Instagram</>)}
              {connectState === "connecting" && (<><span className="onb-spin" /> Connecting…</>)}
              {connected && (<><Icon name="check-circle" weight="fill" /> @mayamakes connected</>)}
            </button>
            {connected && (
              <div className="onb-account pop-in">
                <Avatar name="Maya Makes" size={40} />
                <div className="oa-body">
                  <div className="oa-name">@mayamakes</div>
                  <div className="oa-meta">Creator account · 48.2k followers</div>
                </div>
                <span className="oa-badge"><Icon name="shield-check" weight="fill" /> Secure</span>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="fade-in" key="s1">
            <h1 className="onb-q">What's your vibe?</h1>
            <p className="onb-sub">So we can speak your language and suggest the right flows.</p>
            {roles.map((r, i) => (
              <div
                key={r.id}
                className={`onb-choice rise${role === r.id ? " sel" : ""}`}
                style={{ animationDelay: `${i * 70}ms` }}
                onClick={() => setRole(r.id)}
              >
                <span className="oc-ci"><Icon name={r.icon} /></span>
                <div className="oc-body">
                  <div className="ct">{r.t}</div>
                  <div className="cs">{r.s}</div>
                </div>
                <Icon name="check-circle" weight="fill" className="oc-chk" />
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="fade-in" key="s2">
            <h1 className="onb-q">What are your goals?</h1>
            <p className="onb-sub">Pick all that fit and we'll pre-build each one for you.</p>
            {goalOpts.map((g, i) => (
              <div
                key={g.id}
                className={`onb-choice rise multi${goals.includes(g.id) ? " sel" : ""}`}
                style={{ animationDelay: `${i * 70}ms` }}
                onClick={() => toggleGoal(g.id)}
              >
                <span className="oc-ci"><Icon name={g.icon} /></span>
                <div className="oc-body">
                  <div className="ct">{g.t}</div>
                  <div className="cs">{g.s}</div>
                </div>
                <span className="oc-box"><Icon name="check" weight="bold" /></span>
              </div>
            ))}
          </div>
        )}

        <div className="onb-actions">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              <Icon name="arrow-left" /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            className="btn btn-primary"
            style={{ fontSize: 15, padding: "11px 22px" }}
            disabled={!canNext}
            onClick={() => step < 2 ? setStep(step + 1) : onDone()}
          >
            {step === 2 ? "Get started" : "Continue"}
            <Icon name="arrow-right" />
          </button>
        </div>
      </div>

      {/* ---- right: power-of-platform visual ---- */}
      <div className="onb-right">
        <RightVisual step={step} role={role} goals={goals} goalOpts={goalOpts} />
      </div>
    </div>
  );
}

function RightVisual({ step, role, goals, goalOpts }) {
  if (step === 0) {
    return (
      <div className="ov-stage fade-in" key="v0">
        <div className="dm-mock pop-in">
          <div className="dm-row their">
            <span className="dm-av" />
            <div className="dm-bubble">🔥 wait how do I get this??</div>
          </div>
          <div className="dm-row mine">
            <div className="dm-bubble lime">Sent you the link, check your DMs 💚</div>
          </div>
          <div className="dm-typing"><span /><span /><span /></div>
        </div>
        <div className="ov-cap">
          <div className="ov-big" style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <Icon name="shield-check" weight="fill" style={{ fontSize: 52, color: "var(--accent)" }} />
            Safe
          </div>
          <div className="ov-label">Official Instagram API.<br />We handle the compliance and permissions, so you never touch a setting.</div>
          <div className="ov-sys">Secure · compliant · zero hassle</div>
        </div>
      </div>
    );
  }
  if (step === 1) {
    const lines = {
      creator: ["“Heyy 👋 just dropped the link below”", "Casual, warm, on-brand for you."],
      brand:   ["“Thanks for shopping with us, here's 10% off”", "Polished and conversion-ready."],
      agency:  ["“Routing you to the right account now”", "Scales across every client you run."],
      _:       ["“Pick a vibe and watch the tone shift”", "Every reply matches how you talk."],
    };
    const l = lines[role] || lines._;
    return (
      <div className="ov-stage fade-in" key="v1">
        <div className="voice-card pop-in" key={role || "none"}>
          <div className="vc-label">Tuned reply</div>
          <div className="vc-quote">{l[0]}</div>
          <div className="vc-sub">{l[1]}</div>
        </div>
        <div className="ov-cap">
          <div className="ov-big">1 voice</div>
          <div className="ov-label">Every flow speaks in your tone, not a robot's.</div>
          <div className="ov-sys">Your language, automated</div>
        </div>
      </div>
    );
  }
  // step 2 — flows being pre-built from selected goals
  const selected = goalOpts.filter(g => goals.includes(g.id));
  return (
    <div className="ov-stage fade-in" key="v2">
      <div className="build-card pop-in">
        <div className="bc-head">
          <span className="bc-dot beat" />
          {selected.length ? `${selected.length} goal${selected.length > 1 ? "s" : ""} noted` : "What should DMflo work on?"}
        </div>
        <div className="bc-list">
          {selected.length === 0 && <div className="bc-empty">Tap the goals that matter to you →</div>}
          {selected.map((g, i) => (
            <div className="bc-item pop-in" style={{ animationDelay: `${i * 90}ms` }} key={g.id}>
              <span className="bc-ic"><Icon name="check" weight="bold" /></span>
              <span className="bc-t">{g.t}</span>
              <span className="bc-tag">on it</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ov-cap">
        <div className="ov-big">{goals.length || "0"}</div>
        <div className="ov-label">We'll shape DMflo around exactly what you want to achieve.</div>
        <div className="ov-sys">Built around your goals</div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, RightVisual });
