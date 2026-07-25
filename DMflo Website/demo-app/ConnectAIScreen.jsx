// DMflo Calm — Connect AI (run DMflo from Claude or ChatGPT)
// A connector you enable, plus a showcase of what you can then ask your AI.

const AI_PROVIDERS = {
  claude:  { name: "Claude",  mono: "C", logo: "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/claude.svg", tint: "oklch(0.72 0.13 47)",  soft: "oklch(0.95 0.045 55)",  app: "Claude Desktop" },
  chatgpt: { name: "ChatGPT", mono: "G", logo: "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/openai.svg", tint: "oklch(0.62 0.10 165)", soft: "oklch(0.95 0.04 165)", app: "ChatGPT" },
};

const AI_CAPS = [
  { icon: "lightning",       t: "Create & edit automations", s: "Spin up or tweak a flow by asking",       ex: "Set up a flow that DMs my discount code when someone comments SAVE" },
  { icon: "paper-plane-tilt",t: "Draft & send DMs",          s: "Message people or whole segments",         ex: "DM everyone on my launch waitlist a thank-you note" },
  { icon: "chat-text",       t: "Reply & moderate comments", s: "Engage real ones, hide the junk",          ex: "Hide any spam comments on my latest reel and like the genuine ones" },
  { icon: "chart-bar",       t: "Pull analytics",            s: "Ask how anything is performing",           ex: "How did my Comment → DM flow do this week vs last?" },
  { icon: "address-book",    t: "Look up & tag contacts",    s: "Find leads, tag and organize them",        ex: "Tag everyone who clicked my shop link this week as a hot lead" },
  { icon: "robot",           t: "Build agents",              s: "Stand up an AI teammate from a sentence",  ex: "Build an agent that answers pricing questions from my FAQ doc" },
];

const AI_EXAMPLE = {
  claude:  { user: "Set up a flow that DMs my linktree when someone comments LINK on my newest reel — and reply publicly too.", reply: "Done ✅ I created **“Comment → DM the link”** and it's live now. It watches your newest reel for **LINK**, replies publicly with a shuffled note, then DMs **linktr.ee/maya**." },
  chatgpt: { user: "How's my launch waitlist automation doing, and DM everyone who joined a thank-you?", reply: "Your **Waitlist collector** has **318 signups** (+42 this week). I've queued a thank-you DM to all 318 — want me to send now or schedule for 9am?" },
};

function ConnectAIScreen({ defaultProvider, embedded }) {
  const { useState } = React;
  const [provider, setProvider] = useState(defaultProvider === "chatgpt" ? "chatgpt" : "claude");
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(null);
  const p = AI_PROVIDERS[provider];

  const serverUrl = "https://mcp.dmflo.co/v1/sse";
  const token = "dmflo_sk_live_8f2c…a91d";

  function copy(key, text) {
    try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(key);
    clearTimeout(window.__cpT);
    window.__cpT = setTimeout(() => setCopied(null), 1600);
  }

  const steps = provider === "claude"
    ? ["Open Claude Desktop → Settings → Connectors", "Add a connector and paste the DMflo server URL", "Authorize with the key below — that's it"]
    : ["Open ChatGPT → Settings → Connectors (or a custom GPT)", "Add the DMflo server URL as a new connector", "Paste the key below to authorize"];

  return (
    <div className={embedded ? "connect-col" : "content connect-content"}>
      <div className="content-col">

        {/* hero */}
        <div className="connect-hero card">
          <span className="ch-glow" aria-hidden="true" />
          <div className="ch-bridge">
            <span className="ch-lockup"><img src="../assets/mark.svg" width="56" height="56" alt="DMflo" /></span>
            <span className="ch-wire"><span className="ch-pulse" /></span>
            <span className="ch-node prov" style={{ background: p.soft, borderColor: p.tint }}><img src={p.logo} width="32" height="32" alt={p.name} /></span>
          </div>
          <h2 className="ch-title">Run DMflo from {p.name}</h2>
          <p className="ch-blurb">Connect once, then manage your Instagram automations, DMs, comments and leads by just asking {p.name} — in the same chat you already work in.</p>
          <div className="ch-seg seg">
            <button className={provider === "claude" ? "on" : ""} onClick={() => setProvider("claude")}>Claude</button>
            <button className={provider === "chatgpt" ? "on" : ""} onClick={() => setProvider("chatgpt")}>ChatGPT</button>
          </div>
        </div>

        {/* setup + example, two columns */}
        <div className="connect-grid">
          {/* setup */}
          <div className="card connect-setup">
            <div className="cs-top">
              <div className="cs-titles">
                <div className="cs-h">Connect {p.name}</div>
                <div className="cs-s">Takes about a minute</div>
              </div>
              {connected
                ? <span className="live-pill"><span className="dot beat" /> Connected</span>
                : <span className="conn-off">Not connected</span>}
            </div>

            <ol className="cs-steps">
              {steps.map((s, i) => (
                <li key={i}><span className="cs-num">{i + 1}</span><span>{s}</span></li>
              ))}
            </ol>

            <div className="cs-field">
              <div className="cs-flabel sys">MCP server URL</div>
              <div className="cs-copyrow">
                <code>{serverUrl}</code>
                <button className="cs-copy" onClick={() => copy("url", serverUrl)}>
                  <Icon name={copied === "url" ? "check" : "copy"} weight="bold" /> {copied === "url" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="cs-field">
              <div className="cs-flabel sys">Authorization key</div>
              <div className="cs-copyrow">
                <code>{token}</code>
                <button className="cs-copy" onClick={() => copy("key", token)}>
                  <Icon name={copied === "key" ? "check" : "copy"} weight="bold" /> {copied === "key" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="cs-fnote"><Icon name="shield-check" weight="fill" /> Scoped to this workspace. Revoke anytime — flows keep running.</div>
            </div>

            <button
              className={`btn ${connected ? "btn-secondary" : "btn-primary"} cs-cta`}
              onClick={() => setConnected(c => !c)}
            >
              {connected
                ? <><Icon name="link-break" /> Disconnect {p.name}</>
                : <><Icon name="plugs-connected" weight="fill" /> Connect {p.name}</>}
            </button>
          </div>

          {/* live example */}
          <div className="card connect-example">
            <div className="ce-head">
              <span className="ce-av" style={{ background: p.soft }}><img src={p.logo} width="20" height="20" alt={p.name} /></span>
              <div className="ce-titles">
                <div className="ce-h">In {p.name}, you'd say…</div>
                <div className="ce-s">A real request, handled end to end</div>
              </div>
            </div>
            <div className="ce-thread">
              <div className="ce-user">{AI_EXAMPLE[provider].user}</div>
              <div className="ce-airow">
                <span className="ce-aiav" style={{ background: p.soft }}><img src={p.logo} width="18" height="18" alt={p.name} /></span>
                <div className="ce-aibubble">
                  <div className="ce-action"><span className="ce-aidot"><Icon name="lightning" weight="fill" /></span> DMflo · action taken</div>
                  <div dangerouslySetInnerHTML={{ __html: renderMd(AI_EXAMPLE[provider].reply) }} />
                </div>
              </div>
            </div>
            <div className="ce-foot sys"><Icon name="lock-key" weight="fill" style={{ fontSize: 12 }} /> Every action respects your plan limits & permissions</div>
          </div>
        </div>

        {/* capabilities */}
        <div className="section-head" style={{ marginTop: 34 }}>
          <h3>What you can ask</h3>
          <span className="sys">{AI_CAPS.length} skills unlocked</span>
        </div>
        <div className="ai-cap-grid">
          {AI_CAPS.map((c, i) => (
            <div key={i} className="ai-cap card">
              <span className="aic-ico"><Icon name={c.icon} weight="fill" /></span>
              <div className="aic-t">{c.t}</div>
              <div className="aic-s">{c.s}</div>
              <div className="aic-ex">
                <Icon name="quotes" weight="fill" />
                <span>{c.ex}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="connect-manual">
          <Icon name="info" weight="fill" />
          <span>Prefer the dashboard? Everything here still works by hand — the AI connection is a shortcut, never a replacement.</span>
        </div>

      </div>
    </div>
  );
}

// tiny **bold** markdown → <b>
function renderMd(s) {
  return s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

Object.assign(window, { ConnectAIScreen, AI_PROVIDERS, AI_CAPS });
