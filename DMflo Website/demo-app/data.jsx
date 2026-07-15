// Instaflo Calm — seed data
// Trigger types: comment · story · dm · mention  (each has an icon + short label)
const TRIGGER_TYPES = {
  comment: { label: "Comment", icon: "chat-circle-dots" },
  story:   { label: "Story reply", icon: "image" },
  dm:      { label: "DM", icon: "paper-plane-tilt" },
  mention: { label: "Mention", icon: "at" },
};

const AUTOMATIONS = [
  { id: "a0", name: "Launch day reminder", icon: "megaphone-simple", trigger: "REMIND", triggerType: "comment", status: "live", sent: "0", ctr: "—", contacts: "0", lastTriggered: "never", created: 2005, desc: "Reminds commenters the moment your launch goes live", reply: "you're in! 🚀 I'll DM you the second we're live" },
  { id: "a1", name: "Comment → DM the link", icon: "link", trigger: "PRICE, COST, HOWMUCH", triggerType: "comment", status: "live", sent: "8.2k", ctr: "6.4%", contacts: "312", lastTriggered: "2m ago", created: 2004, desc: "Replies with your shop link when someone comments a keyword", reply: "hey! 👋 here's the link you asked for → shop.dmflo.co/maya 💚" },
  { id: "a2", name: "Story reply welcome", icon: "image", trigger: "any reply", triggerType: "story", status: "live", sent: "3.1k", ctr: "4.1%", contacts: "188", lastTriggered: "11m ago", created: 2003, desc: "Sends a warm hello to new story repliers", reply: "ahh thanks for replying! so glad you're here 🫶" },
  { id: "a3", name: "Waitlist collector", icon: "user-plus", trigger: "JOIN", triggerType: "comment", status: "live", sent: "1.4k", ctr: "9.2%", contacts: "318", lastTriggered: "1h ago", created: 2002, desc: "Captures emails into your launch waitlist", reply: "you're on the list! 🎉 drop your email so we can ping you at launch" },
  { id: "a4", name: "Out-of-office auto-reply", icon: "moon", trigger: "any DM", triggerType: "dm", status: "paused", sent: "642", ctr: "—", contacts: "0", lastTriggered: "3d ago", created: 2001, desc: "Lets followers know when you're away", reply: "away till Monday — I'll get back to you then! 🌙" },
];

/* ---- Generated flows (fills out the list so the 'many flows' case is real) - */
(function expandAutomations() {
  const specs = [
    ["Reels → free guide", "book-open", "GUIDE", "comment", "Sends your lead magnet when someone comments a keyword"],
    ["Black Friday drop", "tag", "BFCM", "comment", "Fires the sale link during launch week"],
    ["New follower hello", "hand-waving", "any DM", "dm", "Greets brand-new followers automatically"],
    ["Restock alert", "bell", "NOTIFY", "comment", "Pings people back in stock when they asked"],
    ["Giveaway entry", "gift", "ENTER", "comment", "Confirms entries and collects emails"],
    ["Link in bio helper", "link-simple", "LINK", "dm", "Auto-sends your bio link on request"],
    ["Course enrollment", "graduation-cap", "LEARN", "comment", "Shares the course checkout link"],
    ["Podcast episode drop", "microphone", "LISTEN", "comment", "Sends the latest episode link"],
    ["Booking requests", "calendar-check", "BOOK", "dm", "Routes booking questions to your calendar"],
    ["Mention → thank you", "at", "any mention", "mention", "Thanks anyone who tags you in a story"],
    ["Discount for repliers", "percent", "SAVE10", "story", "Rewards story replies with a code"],
    ["Newsletter signup", "envelope-simple", "SUB", "comment", "Adds commenters to your email list"],
    ["Product FAQ auto-reply", "question", "any DM", "dm", "Answers common product questions instantly"],
    ["Event RSVP", "ticket", "RSVP", "comment", "Confirms live-event RSVPs"],
    ["UGC collector", "camera", "FEATURE", "mention", "DMs a form when people tag your product"],
    ["Abandoned cart nudge", "shopping-cart", "any DM", "dm", "Follows up on unfinished checkouts"],
    ["Beta invite", "flask", "BETA", "comment", "Sends invite links to interested testers"],
    ["Referral program", "users-three", "REFER", "comment", "Shares each person's referral link"],
    ["Story poll follow-up", "chart-bar", "any reply", "story", "Replies based on poll answers"],
    ["Welcome DM series", "sparkle", "any DM", "dm", "Kicks off a 3-message welcome for new DMs"],
    ["Comment moderation", "shield-check", "any comment", "comment", "Hides spam under your posts"],
    ["VIP early access", "crown", "VIP", "comment", "Gives loyal fans a head start"],
    ["Feedback request", "star", "any DM", "dm", "Asks happy buyers for a review"],
    ["Local pickup info", "map-pin", "PICKUP", "comment", "Shares store hours and address"],
  ];
  const sents = ["4.7k", "2.9k", "1.1k", "980", "760", "540", "430", "2.1k", "1.8k", "320", "210", "88", "1.3k", "670", "150", "3.4k", "45", "590", "1.6k", "290"];
  const ctrs  = ["7.1%", "5.8%", "3.2%", "8.4%", "2.6%", "6.0%", "4.9%", "9.7%", "1.9%", "5.1%"];
  const conts = ["241", "96", "412", "58", "173", "27", "88", "509", "12", "134", "62", "205", "0", "77", "319"];
  const seens = ["just now", "4m ago", "18m ago", "40m ago", "1h ago", "2h ago", "5h ago", "9h ago", "1d ago", "2d ago", "4d ago", "1w ago"];
  const statuses = ["live", "live", "live", "paused", "live", "paused", "live", "paused", "live", "live"];
  const rnd = (a, i) => a[i % a.length];
  const extra = specs.map((s, i) => {
    const [name, icon, trigger, triggerType, desc] = s;
    const status = rnd(statuses, i * 3 + 1);
    return {
      id: "gen" + i, name, icon, trigger, triggerType, status,
      created: 1000 + i,
      sent: status === "draft" ? "0" : rnd(sents, i * 2 + 1),
      ctr: status === "draft" ? "—" : rnd(ctrs, i * 3),
      contacts: status === "draft" ? "0" : rnd(conts, i * 2),
      lastTriggered: status === "draft" ? "never" : rnd(seens, i + 1),
      desc,
      reply: "auto-reply ready — open the builder to customize the message.",
    };
  });
  AUTOMATIONS.push(...extra);
})();

const CONVERSATIONS = [
  { id: "c1", name: "jordan.creates", handle: "@jordan.creates", time: "now", unread: true, snippet: "ooh yes send me the link!", auto: true },
  { id: "c2", name: "thesarahb", handle: "@thesarahb", time: "2m", unread: true, snippet: "PRICE", auto: true },
  { id: "c3", name: "leo.studio", handle: "@leo.studio", time: "14m", unread: false, snippet: "thanks, that's super helpful 🙏", auto: false },
  { id: "c4", name: "minha.k", handle: "@minha.k", time: "1h", unread: false, snippet: "JOIN", auto: true },
  { id: "c5", name: "the.daily.brew", handle: "@the.daily.brew", time: "3h", unread: false, snippet: "do you ship to canada?", auto: false },
];

const THREAD = [
  { from: "them", text: "PRICE", t: "9:41 AM" },
  { from: "auto", text: "hey! 👋 here's everything you asked for, the full price list plus a lil welcome gift inside 💚", t: "9:41 AM" },
  { from: "auto", text: "→ shop.dmflo.co/maya", t: "9:41 AM" },
  { from: "them", text: "ooh yes send me the link!", t: "9:42 AM" },
];

const CHART = [
  { d: "M", v: 420 }, { d: "T", v: 580 }, { d: "W", v: 500 }, { d: "T", v: 710 },
  { d: "F", v: 950, peak: true }, { d: "S", v: 640 }, { d: "S", v: 480 },
];

/* ---- Contacts / Leads -------------------------------------------------- */
const CONTACT_LISTS = [
  { id: "all", name: "All contacts", system: true, count: 4218 },
  { id: "l1", icon: "play-circle", name: "Engaged · 5 tips reel", type: "filter",
    rule: "Commented on “5 tips for faster launches”", count: 842, growth: "+38 this week", new: true },
  { id: "l2", icon: "link", name: "Clicked the shop link", type: "filter",
    rule: "Clicked any link sent in a DM", count: 1203, growth: "+126 this week" },
  { id: "l3", icon: "user-plus", name: "Launch waitlist", type: "filter",
    rule: "Replied “JOIN” to the waitlist story", count: 318, growth: "+42 this week" },
  { id: "l4", icon: "upload-simple", name: "VIP customers", type: "upload",
    rule: "Uploaded CSV · 96 rows · Mar 2025", count: 96, growth: "Static list" },
];

const CONTACTS = [
  {
    id: "p1", name: "Jordan Cole", handle: "@jordan.creates", role: "Creator", follows: true,
    status: "lead", followers: "12.4k", location: "Austin, TX",
    email: "jordan@jordancreates.co", phone: "+1 (512) 555-0148",
    source: "Comment → DM the link", score: 86, lastSeen: "2m ago",
    lists: ["l1", "l2"], tags: ["Hot lead", "Clicked link"],
    activity: [
      { type: "click",   icon: "link",              t: "2m ago",   title: "Clicked your shop link", detail: "shop.dmflo.co/maya · from DM" },
      { type: "dm",      icon: "paper-plane-tilt",  t: "3m ago",   title: "Got an auto-DM", detail: "Comment → DM the link" },
      { type: "comment", icon: "chat-circle-dots",  t: "3m ago",   title: "Commented “PRICE”", detail: "on “5 tips for faster launches”" },
      { type: "follow",  icon: "user-plus",         t: "1d ago",   title: "Started following you", detail: "via Reels" },
    ],
  },
  {
    id: "p2", name: "Sarah Briggs", handle: "@thesarahb", role: "Brand", follows: true,
    status: "subscriber", followers: "48.9k", location: "Brooklyn, NY",
    email: "sarah@thesarahb.com", phone: null,
    source: "Waitlist collector", score: 74, lastSeen: "2m ago",
    lists: ["l3"], tags: ["Waitlist", "Engaged"],
    activity: [
      { type: "list",    icon: "user-plus",        t: "2m ago",  title: "Joined the launch waitlist", detail: "Replied “JOIN” to your story" },
      { type: "email",   icon: "envelope-simple",  t: "2m ago",  title: "Shared her email", detail: "sarah@thesarahb.com" },
      { type: "story",   icon: "image",            t: "2m ago",  title: "Replied to your story", detail: "Launch teaser · day 2" },
      { type: "comment", icon: "chat-circle-dots", t: "5d ago",  title: "Commented “🔥🔥”", detail: "on “Behind the build”" },
    ],
  },
  {
    id: "p3", name: "Leo Marín", handle: "@leo.studio", role: "Agency", follows: false,
    status: "customer", followers: "5.2k", location: "Lisbon, PT",
    email: "leo@leostudio.io", phone: "+351 912 555 027",
    source: "Comment → DM the link", score: 91, lastSeen: "14m ago",
    lists: ["l1", "l2", "l4"], tags: ["Customer", "VIP"],
    activity: [
      { type: "purchase", icon: "shopping-bag",     t: "14m ago", title: "Bought the Launch Kit", detail: "$48 · via shop link" },
      { type: "click",    icon: "link",             t: "20m ago", title: "Clicked your shop link", detail: "shop.dmflo.co/maya" },
      { type: "dm",       icon: "paper-plane-tilt", t: "22m ago", title: "Asked a question in DMs", detail: "“does this cover Reels too?”" },
      { type: "comment",  icon: "chat-circle-dots", t: "22m ago", title: "Commented “COST”", detail: "on “5 tips for faster launches”" },
    ],
  },
  {
    id: "p4", name: "Minha Kang", handle: "@minha.k", role: "Creator", follows: true,
    status: "lead", followers: "2.1k", location: "Seoul, KR",
    email: null, phone: null,
    source: "Waitlist collector", score: 58, lastSeen: "1h ago",
    lists: ["l3"], tags: ["Waitlist"],
    activity: [
      { type: "list",    icon: "user-plus",        t: "1h ago",  title: "Joined the launch waitlist", detail: "Replied “JOIN”" },
      { type: "story",   icon: "image",            t: "1h ago",  title: "Replied to your story", detail: "“ahh can’t wait 😭”" },
      { type: "follow",  icon: "user-plus",        t: "2d ago",  title: "Started following you", detail: "via Explore" },
    ],
  },
  {
    id: "p5", name: "The Daily Brew", handle: "@the.daily.brew", role: "Brand", follows: false,
    status: "lead", followers: "31.7k", location: "Portland, OR",
    email: "hello@thedailybrew.co", phone: null,
    source: "Comment → DM the link", score: 67, lastSeen: "3h ago",
    lists: ["l1"], tags: ["Engaged"],
    activity: [
      { type: "dm",      icon: "paper-plane-tilt", t: "3h ago",  title: "Asked about shipping", detail: "“do you ship to canada?”" },
      { type: "click",   icon: "link",             t: "3h ago",  title: "Clicked your shop link", detail: "shop.dmflo.co/maya" },
      { type: "comment", icon: "chat-circle-dots", t: "3h ago",  title: "Commented “LINK”", detail: "on “5 tips for faster launches”" },
    ],
  },
  {
    id: "p6", name: "Tomás Reyes", handle: "@tomasreyes", role: "Creator", follows: true,
    status: "subscriber", followers: "9.8k", location: "Mexico City, MX",
    email: "tomas@reyes.mx", phone: "+52 55 5555 0193",
    source: "VIP customers (import)", score: 79, lastSeen: "1d ago",
    lists: ["l2", "l4"], tags: ["Imported", "Clicked link"],
    activity: [
      { type: "click",    icon: "link",             t: "1d ago",  title: "Clicked your shop link", detail: "shop.dmflo.co/maya" },
      { type: "import",   icon: "upload-simple",    t: "Mar 2025",title: "Added via CSV upload", detail: "VIP customers list" },
    ],
  },
];

/* ---- Generated contacts (fills out the table for realistic volume) ----- */
(function expandContacts() {
  const firsts = ["Ava", "Noah", "Mia", "Eli", "Zoe", "Kai", "Luca", "Nina", "Omar", "Ivy", "Theo", "Lola", "Finn", "Maya", "Ravi", "Cleo", "Aria", "Jude", "Remy", "Sana", "Beck", "Yara", "Otto", "Pia", "Dane", "Esme", "Hugo", "Wren"];
  const lasts = ["Park", "Vasquez", "Okafor", "Lindqvist", "Tran", "Bauer", "Rossi", "Singh", "Mendez", "Cole", "Haddad", "Novak", "Ito", "Fischer", "Costa", "Abadi", "Walsh", "Kim", "Moreau", "Diaz"];
  const handlesfx = ["creates", "studio", "makes", "shop", "daily", "co", "official", "world", "hq", "labs"];
  const roles = ["Creator", "Brand", "Agency", "Shop"];
  const locations = ["Berlin, DE", "Toronto, CA", "Madrid, ES", "Tokyo, JP", "Lagos, NG", "Bogotá, CO", "Paris, FR", "Sydney, AU", "Dublin, IE", "Austin, TX", "Oslo, NO", "Pune, IN"];
  const sources = ["Comment → DM the link", "Waitlist collector", "Story reply welcome", "VIP customers (import)"];
  const statuses = ["lead", "lead", "subscriber", "subscriber", "customer"];
  const tagPool = ["Hot lead", "Clicked link", "Engaged", "Waitlist", "Imported", "VIP", "Customer", "New"];
  const seens = ["6m ago", "22m ago", "1h ago", "3h ago", "8h ago", "1d ago", "2d ago", "5d ago"];

  function rnd(a, i) { return a[i % a.length]; }
  const extra = [];
  for (let i = 0; i < 30; i++) {
    const f = firsts[i % firsts.length];
    const l = lasts[(i * 3) % lasts.length];
    const name = `${f} ${l}`;
    const handle = `@${f.toLowerCase()}.${rnd(handlesfx, i * 2)}`;
    const status = rnd(statuses, i * 7);
    const hasEmail = i % 4 !== 0;
    const hasPhone = i % 3 === 0;
    const t1 = rnd(tagPool, i);
    const t2 = rnd(tagPool, i + 3);
    extra.push({
      id: "g" + i,
      name, handle, role: rnd(roles, i),
      status,
      follows: i % 3 !== 1,
      followers: (((i * 137) % 480) / 10 + 0.8).toFixed(1) + "k",
      location: rnd(locations, i * 5),
      email: hasEmail ? `${f.toLowerCase()}@${f.toLowerCase()}${rnd(handlesfx, i)}.co` : null,
      phone: hasPhone ? "+1 (415) 555-0" + (100 + i) : null,
      source: rnd(sources, i * 2),
      score: 35 + ((i * 17) % 60),
      lastSeen: rnd(seens, i * 3),
      lists: [],
      tags: t1 === t2 ? [t1] : [t1, t2],
      activity: [
        { type: "comment", icon: "chat-circle-dots", t: rnd(seens, i * 3), title: "Commented on a post", detail: "via Reels" },
        { type: "follow",  icon: "user-plus",        t: "2d ago", title: "Started following you", detail: "via Explore" },
      ],
    });
  }
  CONTACTS.push(...extra);
})();

/* ---- Agents ------------------------------------------------------------ */
const AGENT_CAPS = [
  { id: "reply",    icon: "chat-circle-dots", t: "Reply & triage DMs",         s: "Answer incoming DMs in your voice" },
  { id: "qualify",  icon: "user-plus",        t: "Qualify & tag leads",        s: "Spot buying intent and tag people" },
  { id: "faq",      icon: "books",            t: "Answer FAQs from knowledge",  s: "Pull answers from your sources" },
  { id: "engage",   icon: "heart",            t: "Engage in comments",          s: "Reply to comments under your posts" },
  { id: "moderate", icon: "shield-check",     t: "Moderate junk & spam",        s: "Hide spam and inappropriate comments" },
];

const AGENTS = [
  {
    id: "ag1", name: "Frontdesk", icon: "headset", status: "active",
    prompt: "You are Maya's friendly front desk. Reply to DMs warmly in a casual, lowercase tone. Answer questions about pricing, shipping and the launch using the knowledge base. If someone wants to buy, send the shop link.",
    caps: ["reply", "faq"],
    knowledge: [
      { type: "doc", label: "Pricing & FAQ.pdf", meta: "320 KB" },
      { type: "url", label: "shop.dmflo.co/faq", meta: "Website" },
    ],
    stat: "2,940", statLabel: "Replies sent", edited: "2d ago",
  },
  {
    id: "ag2", name: "Lead Catcher", icon: "magnet", status: "active",
    prompt: "Watch DMs and comments for buying intent, words like “price”, “how much”, “where to buy”, “interested”. Tag those people as Hot lead, capture their email if offered, and reply with the shop link.",
    caps: ["qualify", "reply"],
    knowledge: [{ type: "text", label: "Qualifying questions", meta: "Note · 6 lines" }],
    stat: "318", statLabel: "Leads tagged", edited: "5d ago",
  },
  {
    id: "ag3", name: "Comment Guard", icon: "shield-check", status: "draft",
    prompt: "Under every reel, like and reply to genuine comments with a short friendly note. Hide comments that are spam, contain external links, or are inappropriate.",
    caps: ["engage", "moderate"],
    knowledge: [],
    stat: "0", statLabel: "Comments", edited: "Just now",
  },
];

const AGENT_TEMPLATES = [
  { id: "t-dm",   icon: "headset",      t: "DM Concierge",      s: "Replies to DMs and answers FAQs from your docs", caps: ["reply", "faq"],
    prompt: "Reply to every DM warmly and on-brand. Answer questions about pricing, shipping and the product using the knowledge base. If someone is ready to buy, share the shop link." },
  { id: "t-lead", icon: "magnet",       t: "Lead Qualifier",    s: "Spots buying intent and tags hot leads", caps: ["qualify", "reply"],
    prompt: "Read each DM and comment for buying intent. Tag interested people as Hot lead, ask one qualifying question, and capture their email if they offer it." },
  { id: "t-mod",  icon: "shield-check", t: "Comment Moderator", s: "Engages real comments, hides spam", caps: ["engage", "moderate"],
    prompt: "Reply to genuine comments with a short friendly note and a like. Hide comments that are spam, contain external links, or are inappropriate." },
  { id: "t-blank", icon: "sparkle",     t: "Blank agent",       s: "Start from an empty prompt", caps: [],
    prompt: "" },
];

Object.assign(window, { AUTOMATIONS, TRIGGER_TYPES, CONVERSATIONS, THREAD, CHART, CONTACTS, CONTACT_LISTS, AGENT_CAPS, AGENTS, AGENT_TEMPLATES });
