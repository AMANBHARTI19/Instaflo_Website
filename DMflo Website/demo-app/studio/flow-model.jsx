// Flow Studio — the shared automation model, templates, a plain-English
// interpreter (chat → flow changes), and the role-play simulator.
//
// The action part of a flow is an ordered array of STEPS (relay-style). Each
// step is one node: public reply, condition, delay, send DM, or AI reply.

const TRIGGER_META = {
  comment: { verb: "comments",           surface: "comment", label: "comment",     icon: "chat-teardrop-text", node: "When someone comments" },
  story:   { verb: "replies to a story", surface: "story",   label: "story reply", icon: "image-square",       node: "When someone replies to a story" },
  dm:      { verb: "sends a DM",         surface: "dm",      label: "DM",          icon: "chat-circle-dots",   node: "When someone DMs you" },
};

const RULE_DEFS = [
  { id: "followers",  icon: "user-check",   label: "Only followers",     short: "followers only",   desc: "Skip anyone who doesn't follow you yet" },
  { id: "firsttime",  icon: "sparkle",      label: "First-timers only",  short: "first-timers",     desc: "Only the first time each person triggers it" },
  { id: "hours",      icon: "clock",        label: "Business hours only",short: "business hours",   desc: "Only fire between 9am–6pm, hold the rest" },
  { id: "nolinkspam", icon: "shield-check", label: "Skip spam & links",  short: "skip spam",        desc: "Ignore obvious spam and link-drop comments" },
];

// ---- steps -----------------------------------------------------------------
const STEP_META = {
  public:    { icon: "chats",           title: "Reply under their comment", tag: "Public",    kind: "action" },
  condition: { icon: "git-branch",      title: "Only continue if…",         tag: "Condition", kind: "cond" },
  delay:     { icon: "clock-countdown", title: "Wait",                      tag: "Delay",     kind: "cond" },
  dm:        { icon: "paper-plane-tilt",title: "Send a DM",                 tag: "Action",    kind: "action" },
  ai:        { icon: "sparkle",         title: "Let AI reply",              tag: "Action",    kind: "action" },
};

// which node types you can drop in from the "+" menu
const NODE_ADDS = [
  { type: "condition", icon: "git-branch",      label: "Condition",   desc: "Only continue if a check passes" },
  { type: "delay",     icon: "clock-countdown", label: "Delay",       desc: "Wait before the next step" },
  { type: "public",    icon: "chats",           label: "Public reply",desc: "Comment back under their comment", commentOnly: true },
  { type: "dm",        icon: "paper-plane-tilt",label: "Send a DM",   desc: "Send a fixed message with links" },
  { type: "ai",        icon: "sparkle",         label: "AI reply",    desc: "Let AI answer from your knowledge" },
];

let _sid = 0;
function uid(p) { return (p || "s") + Date.now().toString(36).slice(-4) + (_sid++); }

function makeStep(type) {
  const id = uid(type);
  switch (type) {
    case "public":    return { id, type, replies: ["Sent you a DM! 💌", "Check your inbox 👀", "Just slid into your DMs 🚀"] };
    case "condition": return { id, type, rule: "followers" };
    case "delay":     return { id, type, minutes: 60 };
    case "ai":        return { id, type };
    case "dm":
    default:          return { id, type: "dm", msg: "hey! 👋 here's the link you asked for → ", links: [{ label: "Open the link", url: "https://shop.dmflo.co/maya" }] };
  }
}

const KB_ICON = { doc: "file-text", url: "link", text: "note-pencil" };

const IG_CONTENT = (typeof IG_POSTS !== "undefined" && IG_POSTS) || [
  { id: "p1", kind: "Reel", cap: "5 tips for faster launches", emoji: "🚀", likes: "12.4k" },
  { id: "p2", kind: "Post", cap: "New drop is live",           emoji: "🛍️", likes: "8.1k" },
];

function blankSpec() {
  return {
    name: "Untitled automation",
    icon: "link",
    triggerType: "comment",
    postSrc: "specific",
    postId: "p1",
    anyComment: false,
    keywords: ["PRICE"],
    rules: [],
    steps: [
      { id: uid("public"), type: "public", replies: ["Sent you a DM! 💌", "Check your inbox 👀", "Just slid into your DMs 🚀"] },
      { id: uid("dm"), type: "dm", msg: "hey! 👋 here's the link you asked for → ", links: [{ label: "Open the link", url: "https://shop.dmflo.co/maya" }] },
    ],
    knowledge: [],
  };
}

// step-array helpers (all return a NEW array)
function firstStep(spec, type) { return spec.steps.find(s => s.type === type); }
function hasStep(spec, type) { return spec.steps.some(s => s.type === type); }

const TEMPLATES = [
  {
    id: "link", icon: "link", popular: true,
    title: "Comment → DM a link",
    desc: "Someone comments a keyword, they get your link in the DMs",
    patch: { name: "Comment → DM a link", icon: "link", triggerType: "comment", keywords: ["LINK"],
             steps: [makeStep("public"), { id: uid("dm"), type: "dm", msg: "hey! 👋 here's the link you asked for → ", links: [{ label: "Open the link", url: "https://shop.dmflo.co/maya" }] }] },
  },
  {
    id: "faq", icon: "chats", ai: true,
    title: "Answer questions with AI",
    desc: "AI replies to DMs using your files — pricing, shipping, FAQs",
    patch: { name: "AI answers my DMs", icon: "chats", triggerType: "dm",
             steps: [makeStep("ai")], knowledge: [] },
  },
  {
    id: "guide", icon: "book-open",
    title: "Reels → free guide",
    desc: "Drop your lead magnet when people comment for it",
    patch: { name: "Reels → free guide", icon: "book-open", triggerType: "comment", keywords: ["GUIDE"],
             steps: [makeStep("public"), { id: uid("dm"), type: "dm", msg: "yay! 📚 here's your free guide, hope it helps → ", links: [{ label: "Download the guide", url: "https://dmflo.co/guide" }] }] },
  },
  {
    id: "waitlist", icon: "user-plus",
    title: "Waitlist collector",
    desc: "Capture emails from people who comment to join",
    patch: { name: "Waitlist collector", icon: "user-plus", triggerType: "comment", keywords: ["JOIN"],
             steps: [{ id: uid("dm"), type: "dm", msg: "you're on the list! 🎉 tap below and I'll ping you the second we launch → ", links: [{ label: "Join the waitlist", url: "https://dmflo.co/waitlist" }] }] },
  },
  {
    id: "story", icon: "image-square",
    title: "Story reply welcome",
    desc: "Warmly reply when someone reacts to your story",
    patch: { name: "Story reply welcome", icon: "image-square", triggerType: "story", anyComment: true,
             steps: [{ id: uid("dm"), type: "dm", msg: "ahh thanks for replying! 🫶 here's a lil something for you → ", links: [{ label: "Open the link", url: "https://dmflo.co/hi" }] }] },
  },
];

// ---- plain-English interpreter --------------------------------------------
const STOP_KW = new Set(["DM", "AI", "URL", "OK", "FAQ", "USA", "UK", "A", "I"]);

function interpret(text, spec) {
  const t = text.toLowerCase();
  const patch = {};
  const notes = [];
  let ask = null;

  // work on a clone of steps
  let steps = spec.steps.map(s => ({ ...s }));
  let stepsChanged = false;
  const findFirst = ty => steps.find(s => s.type === ty);

  // trigger switch
  if (/\bstor(y|ies)\b/.test(t)) { patch.triggerType = "story"; notes.push("watching story replies"); }
  else if (/\bdm(s)?\b|direct message|inbox|message(s)? me/.test(t) && !/dm them|dm the|send.*dm/.test(t)) {
    patch.triggerType = "dm"; notes.push("watching your DMs");
  } else if (/\bcomment|\breel|\bpost\b/.test(t) && !/reply publicly|public/.test(t)) {
    if (spec.triggerType !== "comment") { patch.triggerType = "comment"; notes.push("watching comments"); }
  }

  if (/every ?(one|body)|any comment|all comments|no keyword|without keyword/.test(t)) {
    patch.anyComment = true; notes.push("firing on every message — no keyword needed");
  }

  const quoted = [...text.matchAll(/["'‘’“”]\s*([A-Za-z0-9]{2,})\s*["'‘’“”]/g)].map(m => m[1].toUpperCase());
  const caps = [...text.matchAll(/\b([A-Z][A-Z0-9]{1,})\b/g)].map(m => m[1]).filter(w => !STOP_KW.has(w));
  let kws = [...new Set([...quoted, ...caps])];
  if (/add keyword|keyword|watch for|trigger on the word/.test(t) && !kws.length) {
    const m = t.match(/(?:keyword|word|for)\s+([a-z0-9]{2,})/);
    if (m) kws = [m[1].toUpperCase()];
  }
  if (kws.length) {
    const merged = [...new Set([...(patch.anyComment ? [] : spec.keywords || []), ...kws])].slice(0, 6);
    patch.keywords = merged; patch.anyComment = false;
    notes.push(`keywords: ${kws.map(k => `“${k}”`).join(", ")}`);
  }

  // trigger-level rules
  RULE_DEFS.forEach(r => {
    const hit = {
      followers:  /follower|only.*follow|must follow|who follow/,
      firsttime:  /first[- ]?time|new people|never triggered|once per/,
      hours:      /business hour|working hour|9 ?(am|-)|office hour|during the day/,
      nolinkspam: /spam|junk|ignore link|no bots?/,
    }[r.id];
    if (hit && hit.test(t)) {
      const cur = patch.rules || spec.rules || [];
      if (/(remove|without|stop|no longer|don'?t).{0,18}/.test(t) && cur.includes(r.id)) {
        patch.rules = cur.filter(x => x !== r.id); notes.push(`dropped “${r.short}”`);
      } else if (!cur.includes(r.id)) {
        patch.rules = [...cur, r.id]; notes.push(`added rule: ${r.short}`);
      }
    }
  });

  // public reply step
  if (/reply publicly|public reply|comment back|reply under/.test(t) && !findFirst("public")) {
    steps.unshift(makeStep("public")); stepsChanged = true; notes.push("added a public reply");
  }
  if (/(don'?t|no|stop|skip).{0,14}(public|comment back)|just dm/.test(t) && findFirst("public")) {
    steps = steps.filter(s => s.type !== "public"); stepsChanged = true; notes.push("removed the public reply");
  }

  // delay step
  const delayM = t.match(/(?:wait|delay|after)\s+(\d+)\s*(min|minute|hour|hr|day)/);
  if (delayM) {
    const n = parseInt(delayM[1], 10);
    const mins = /hour|hr/.test(delayM[2]) ? n * 60 : /day/.test(delayM[2]) ? n * 1440 : n;
    if (!findFirst("delay")) steps.push(makeStep("delay"));
    steps.find(s => s.type === "delay").minutes = mins;
    stepsChanged = true; notes.push(`added a ${fmtDelay(mins)} delay`);
  }

  // AI vs fixed
  if (/\b(ai|smart|answer|respond to questions|conversational|chatgpt|claude)\b/.test(t) && /(answer|reply|respond|question|handle)/.test(t)) {
    const dm = findFirst("dm");
    if (dm) { const i = steps.indexOf(dm); steps[i] = { id: dm.id, type: "ai" }; stepsChanged = true; }
    else if (!findFirst("ai")) { steps.push(makeStep("ai")); stepsChanged = true; }
    notes.push("AI will answer in your voice");
  }
  if (/fixed (message|reply)|use a set message|don'?t use ai|plain message/.test(t)) {
    const ai = findFirst("ai");
    if (ai) { const i = steps.indexOf(ai); steps[i] = makeStep("dm"); steps[i].id = ai.id; stepsChanged = true; notes.push("switched back to a fixed message"); }
  }
  if (/upload|attach|add (a )?(file|doc|pdf|knowledge)|from my (docs|files)|price list|catalog|faq (doc|file|sheet)/.test(t)) {
    if (!findFirst("ai")) {
      const dm = findFirst("dm");
      if (dm) { const i = steps.indexOf(dm); steps[i] = { id: dm.id, type: "ai" }; }
      else steps.push(makeStep("ai"));
      stepsChanged = true;
    }
    ask = "upload"; notes.push("let's add what it should know");
  }

  // link + message edits target the first DM step
  const url = (text.match(/https?:\/\/[^\s]+/) || [])[0];
  const dmForEdit = findFirst("dm");
  if (url && dmForEdit) {
    dmForEdit.links = [{ label: (dmForEdit.links && dmForEdit.links[0] && dmForEdit.links[0].label) || "Open the link", url }];
    stepsChanged = true; notes.push("updated the link");
  }
  const sayM = text.match(/(?:say|message[:,]?|dm[:,]? )\s*[“"']?(.{6,})$/i);
  if (sayM && dmForEdit) { dmForEdit.msg = sayM[1].replace(/[”"']$/, "").trim() + " "; stepsChanged = true; notes.push("rewrote the DM"); }
  if (/friendl|warm|casual|nicer|softer/.test(t) && dmForEdit && !sayM) {
    dmForEdit.msg = "heyy! 🫶 so glad you reached out — here's what you asked for → "; stepsChanged = true; notes.push("warmed up the wording");
  }
  if (/shorter|concise|brief|less/.test(t) && dmForEdit && !sayM) {
    dmForEdit.msg = "here you go 👇 → "; stepsChanged = true; notes.push("made it shorter");
  }

  if (stepsChanged) patch.steps = steps;

  const nameM = text.match(/(?:name it|call it|title[:,]?)\s+["'“]?([^"'”]{2,42})/i);
  if (nameM) { patch.name = nameM[1].trim(); notes.push(`named it “${patch.name}”`); }

  let reply;
  if (ask === "upload") reply = "Great — I'll have the AI answer using your own material. Drop in a file, paste text, or add a link and I'll teach it.";
  else if (notes.length) reply = "Done — " + joinNotes(notes) + ". Take a look on the right, and tell me anything else to change.";
  else reply = fallbackReply(t);
  return { patch, reply, ask };
}

function fmtDelay(mins) {
  if (mins >= 1440) { const d = Math.round(mins / 1440); return d + (d === 1 ? " day" : " days"); }
  if (mins >= 60) { const h = Math.round(mins / 60); return h + (h === 1 ? " hour" : " hours"); }
  return mins + " min";
}
function joinNotes(n) { return n.length === 1 ? n[0] : n.slice(0, -1).join(", ") + " and " + n[n.length - 1]; }
function fallbackReply(t) {
  if (/help|what can|how do|not sure|idea/.test(t))
    return "Tell me the essentials in plain words — what should set it off (a comment, a DM, a story reply), any keyword, and what people should get back. For example: “when someone comments PRICE, DM them my shop link.”";
  return "Got it. I kept the flow as-is — try things like “only reply to followers”, “add keyword SALE”, “use AI to answer from my files”, “wait 30 minutes”, or “make the message friendlier”.";
}

function firstReadFromPrompt(text) {
  const spec = blankSpec();
  const r = interpret(text, spec);
  const next = applyPatch(spec, r.patch);
  if (next.name === "Untitled automation") {
    next.name = hasStep(next, "ai") ? "AI answers my messages"
      : next.triggerType === "story" ? "Story reply welcome"
      : "Comment → DM a link";
  }
  return { spec: next, reply: r.reply, ask: r.ask };
}

function applyPatch(spec, patch) { return { ...spec, ...patch }; }

// ---- role-play simulator ---------------------------------------------------
function simulate(spec, text) {
  const t = (text || "").toLowerCase();
  const trace = [];
  const events = [];
  const isSpam = /(free followers|follow back|check my page|earn \$|click here|👉👉|bit\.ly|promo code)/i.test(text) || /(.)\1{6,}/.test(text);

  // trigger-level gates
  if (spec.rules.includes("nolinkspam") && isSpam) {
    trace.push({ ok: false, text: "Looks like spam — ignored it" });
    return { events, trace };
  }
  let matched = true, why = "";
  if (spec.triggerType !== "dm") {
    if (spec.anyComment) why = "fires on every " + TRIGGER_META[spec.triggerType].label;
    else {
      const hitKw = (spec.keywords || []).find(k => t.includes(k.toLowerCase()));
      matched = !!hitKw;
      why = matched ? `matched keyword “${hitKw}”` : "no keyword matched — stayed quiet";
    }
  } else why = "incoming DM";
  trace.push({ ok: matched, text: why });
  if (!matched) return { events, trace };

  if (spec.rules.includes("followers")) trace.push({ ok: true, text: "Follower check passed" });
  if (spec.rules.includes("firsttime")) trace.push({ ok: true, text: "First time for this person" });
  if (spec.rules.includes("hours")) trace.push({ ok: true, text: "Within business hours" });

  // walk the steps in order
  for (const st of spec.steps) {
    if (st.type === "condition") {
      let ok = true, txt = "";
      if (st.rule === "nolinkspam") { ok = !isSpam; txt = ok ? "Not spam — continued" : "Looks like spam — stopped here"; }
      else { const d = RULE_DEFS.find(x => x.id === st.rule); txt = (d ? d.label : "Condition") + " passed"; }
      trace.push({ ok, text: txt });
      if (!ok) return { events, trace };
    } else if (st.type === "delay") {
      trace.push({ ok: true, text: `Waits ${fmtDelay(st.minutes)} · skipped for the test` });
    } else if (st.type === "public") {
      if (spec.triggerType !== "dm") {
        const r = (st.replies || []).filter(x => x.trim());
        events.push({ kind: "public", text: r.length ? r[Math.abs(hash(t)) % r.length] : "Just DMed you! 💌" });
        trace.push({ ok: true, text: "Replied publicly under the comment" });
      }
    } else if (st.type === "dm") {
      const url = st.links && st.links[0] ? st.links[0].url : "";
      events.push({ kind: "dm", text: (st.msg || "").trim(), links: st.links || [] });
      trace.push({ ok: true, text: "Sent the DM" + (url ? " with your link" : "") });
    } else if (st.type === "ai") {
      const ans = aiAnswer(spec, t);
      events.push({ kind: "dm-ai", text: ans.text, cite: ans.cite });
      trace.push({ ok: true, text: ans.cite ? `AI answered using “${ans.cite}”` : "AI answered from its instructions" });
    }
  }
  return { events, trace };
}

function aiAnswer(spec, t) {
  const k = spec.knowledge || [];
  const src = k.find(x => /pric|faq|catalog|product/i.test(x.label)) || k[0];
  const cite = src ? src.label : null;
  if (/ship|deliver|arrive|international|canada/.test(t)) return { text: "yes! we ship worldwide 🌍 most orders land in 3–5 days ✨", cite };
  if (/pric|cost|how much|\$/.test(t))                    return { text: "the launch kit is $48 and ships worldwide 💚 want me to send the link?", cite };
  if (/refund|return|exchange/.test(t))                   return { text: "totally — 30-day no-questions returns 🙌 just reply here and I'll sort it", cite };
  if (/\bbuy\b|want|purchase|interested|cop\b/.test(t))   return { text: "yesss 🙌 here's the link → shop.dmflo.co/maya — lmk if you have any qs!", cite };
  return { text: "hey hey 👋 happy to help! ask me anything about pricing, shipping or the products 💚", cite: null };
}

function hash(s) { let h = 0; for (const c of (s || "x")) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

Object.assign(window, {
  TRIGGER_META, RULE_DEFS, STEP_META, NODE_ADDS, KB_ICON, IG_CONTENT, TEMPLATES,
  blankSpec, makeStep, firstStep, hasStep, fmtDelay,
  interpret, applyPatch, firstReadFromPrompt, simulate, aiAnswer,
});
