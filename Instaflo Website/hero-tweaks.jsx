// Instaflo — Tweaks bridge for the home page.
// Mounts ONLY the Tweaks panel; writes choices to <html> data-attributes that
// the static page's CSS reacts to. Keeps the marketing site plain HTML.
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hero": "a",
  "accent": "lime",
  "dotgrid": true,
  "stickers": true
}/*EDITMODE-END*/;

function HeroTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const root = document.documentElement;

  useEffect(() => { root.setAttribute("data-hero", t.hero); }, [t.hero]);
  useEffect(() => { root.setAttribute("data-accent", t.accent); }, [t.accent]);
  useEffect(() => { root.setAttribute("data-dotgrid", t.dotgrid ? "on" : "off"); }, [t.dotgrid]);
  useEffect(() => { root.setAttribute("data-stickers", t.stickers ? "on" : "off"); }, [t.stickers]);

  return (
    <TweaksPanel>
      <TweakSection label="Hero" />
      <TweakRadio
        label="Layout"
        value={t.hero}
        options={[{ value: "a", label: "Split demo" }, { value: "b", label: "Big statement" }]}
        onChange={(v) => setTweak("hero", v)}
      />
      <TweakColor
        label="Highlight accent"
        value={t.accent === "lime" ? "#D6F84A" : "#6D4AE0"}
        options={["#D6F84A", "#6D4AE0"]}
        onChange={(v) => setTweak("accent", v === "#D6F84A" ? "lime" : "violet")}
      />
      <TweakSection label="Detailing" />
      <TweakToggle label="Dotted backdrop" value={t.dotgrid} onChange={(v) => setTweak("dotgrid", v)} />
      <TweakToggle label="Sticker badges" value={t.stickers} onChange={(v) => setTweak("stickers", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<HeroTweaks />);
