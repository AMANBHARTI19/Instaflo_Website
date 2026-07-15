// Instaflo Calm — shared primitives
const { useState, useEffect, useRef } = React;

function Icon({ name, weight = "bold", style, className }) {
  const cls = `ph-${weight} ph-${name}${className ? " " + className : ""}`;
  return <i className={cls} style={style} />;
}

function Logo({ onClick }) {
  return (
    <div className="brand" onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
      <img src="../assets/mark.svg" width="30" height="30" alt="" />
      <span className="word">DMflo</span>
    </div>
  );
}

function Avatar({ name, size = 38 }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}>
      {initials}
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button className={`toggle${on ? " on" : ""}`} onClick={onClick} aria-pressed={on}>
      <span className="knob" />
    </button>
  );
}

function LivePill({ count }) {
  return (
    <span className="live-pill">
      <span className="dot beat" />
      {count} live
    </span>
  );
}

function Tag({ children }) {
  return <span className="tag">{children}</span>;
}

function DraftTag() {
  return <span className="draft-tag">Draft</span>;
}

function PausedTag() {
  return <span className="paused-tag">Paused</span>;
}

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setM(true), 80);
    return () => clearTimeout(t);
  }, []);
  return m;
}

function Portal({ children }) {
  const { useEffect, useRef } = React;
  const el = useRef(document.createElement("div"));
  useEffect(() => {
    document.body.appendChild(el.current);
    return () => document.body.removeChild(el.current);
  }, []);
  return ReactDOM.createPortal(children, el.current);
}

function UpgradeModal({ feature, onClose, onUpgrade }) {
  const perks = [
    { icon: "infinity",        h: "Unlimited DMs",            s: "No monthly cap, so flows never pause" },
    { icon: "stack",           h: "Run across all content",   s: "Trigger on any post or reel at once" },
    { icon: "users-three",     h: "Unlimited active flows",   s: "Build as many automations as you need" },
    { icon: "headset",         h: "Priority support",         s: "Jump the queue when you need a hand" },
  ];
  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal upgrade-modal" onClick={e => e.stopPropagation()}>
          <button className="mh-close upm-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
          <div className="upm-hero">
            <span className="upm-badge">Pro</span>
            <h2>{feature ? `${feature} is a Pro feature` : "Upgrade to Pro"}</h2>
            <p>Go unlimited and unlock everything DMflo can do.</p>
          </div>
          <div className="upm-perks">
            {perks.map((p, i) => (
              <div key={i} className="upm-perk">
                <span className="upm-pi"><Icon name={p.icon} weight="fill" /></span>
                <div className="upm-pt">
                  <div className="h">{p.h}</div>
                  <div className="s">{p.s}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="upm-foot">
            <div className="upm-price"><b>₹499</b><span>/mo</span><em>flat, forever</em></div>
            <div className="upm-actions">
              <button className="btn btn-ghost" onClick={onClose}>Not now</button>
              <button className="btn btn-primary" onClick={onUpgrade}><Icon name="lightning" weight="fill" /> Upgrade to Pro</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

Object.assign(window, { Icon, Logo, Avatar, Toggle, LivePill, Tag, DraftTag, PausedTag, useMounted, Portal, UpgradeModal });
