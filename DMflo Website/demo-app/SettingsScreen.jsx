// DMflo Calm — Settings screen
function SettingsScreen({ plan, onUpgrade }) {
  const { useState } = React;
  const [notifEmail,  setNotifEmail]  = useState(true);
  const [notifLeads,  setNotifLeads]  = useState(true);
  const [notifErrors, setNotifErrors] = useState(false);

  return (
    <div className="settings-body">
      <div className="settings-inner">

        {/* Connected account */}
        <div className="settings-section">
          <div className="s-sh">Connected account</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="conn-account">
              <Avatar name="Maya Rin" size={46} />
              <div className="ca-info">
                <div className="h">@mayamakes</div>
                <div className="s">Instagram Creator · 48.2k followers</div>
              </div>
              <span className="live-pill"><span className="dot" />Connected</span>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="settings-section">
          <div className="s-sh">Plan</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="settings-row">
              <div className="sr-label">
                <div className="t">{plan.isPro ? "Pro plan" : "Free plan"}</div>
                <div className="s">{plan.isPro ? "Unlimited DMs · renews Aug 1, 2026" : `${plan.dmsLeft.toLocaleString()} DMs left this month`}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => window.__nav("billing")}>
                Plans &amp; billing <Icon name="arrow-right" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="s-sh">Notifications</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="settings-row">
              <div className="sr-label">
                <div className="t">Weekly email summary</div>
                <div className="s">Automation stats delivered every Monday</div>
              </div>
              <Toggle on={notifEmail} onClick={() => setNotifEmail(!notifEmail)} />
            </div>
            <div className="settings-row">
              <div className="sr-label">
                <div className="t">New lead alerts</div>
                <div className="s">Ping me when someone joins the waitlist</div>
              </div>
              <Toggle on={notifLeads} onClick={() => setNotifLeads(!notifLeads)} />
            </div>
            <div className="settings-row">
              <div className="sr-label">
                <div className="t">Flow error alerts</div>
                <div className="s">Get notified if an automation fails to deliver</div>
              </div>
              <Toggle on={notifErrors} onClick={() => setNotifErrors(!notifErrors)} />
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="settings-section">
          <div className="s-sh">Danger zone</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="settings-row">
              <div className="sr-label">
                <div className="t">Sign out of all devices</div>
                <div className="s">Revoke all active sessions immediately</div>
              </div>
              <button className="btn btn-secondary btn-sm">Sign out</button>
            </div>
            <div className="settings-row">
              <div className="sr-label">
                <div className="t" style={{ color: "var(--dn)" }}>Delete account</div>
                <div className="s">Permanently delete your workspace and all data</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--dn)" }}>Delete</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
