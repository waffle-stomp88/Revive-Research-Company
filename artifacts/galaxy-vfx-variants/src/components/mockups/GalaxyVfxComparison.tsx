import { useEffect, useState } from "react";

const VARIANTS = [
  {
    key: "cinematic",
    label: "Cinematic — bloom-heavy",
    blurb:
      "Strong bloom, large halos, vivid pulses — feels alive and movie-like.",
  },
  {
    key: "minimal",
    label: "Minimal — data-viz pure",
    blurb:
      "Restrained glow, smaller halos, gentle pulses — keeps the focus on data.",
  },
];

export default function GalaxyVfxComparison() {
  const [appOrigin, setAppOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("galaxy-vfx-host");
    if (stored) {
      setAppOrigin(stored);
      return;
    }
    const guessed = window.location.origin.replace(/:\d+$/, ":5000");
    setAppOrigin(guessed);
  }, []);

  const apply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = String(fd.get("origin") ?? "").trim();
    if (v) {
      window.localStorage.setItem("galaxy-vfx-host", v);
      setAppOrigin(v);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">
          Synergy Galaxy — Tier 1 visual variants
        </h1>
        <p className="text-sm text-white/60 max-w-3xl">
          Two on-canvas variations of the bloom + halo + animated-edge
          treatment. Pick whichever feels right; we can dial individual knobs
          (bloom strength, halo size, pulse speed) afterwards.
        </p>
        <form
          onSubmit={apply}
          className="flex items-center gap-2 text-xs pt-2"
        >
          <label className="opacity-60">App origin (where /galaxy lives):</label>
          <input
            name="origin"
            defaultValue={appOrigin}
            placeholder="https://your-repl.replit.dev"
            className="bg-white/5 border border-white/10 rounded px-2 py-1 w-80"
          />
          <button
            type="submit"
            className="bg-[#E7FB10] text-black rounded px-2 py-1 font-medium"
          >
            Apply
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {VARIANTS.map((v) => (
          <section
            key={v.key}
            className="rounded-md border border-white/10 overflow-hidden bg-black/40"
          >
            <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-white/10">
              <div>
                <div className="text-sm font-semibold">{v.label}</div>
                <div className="text-[11px] text-white/50">{v.blurb}</div>
              </div>
              <code className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded">
                ?vfx={v.key}
              </code>
            </div>
            <div className="aspect-[16/10] w-full bg-[#0d0d10]">
              {appOrigin ? (
                <iframe
                  title={v.label}
                  src={`${appOrigin}/galaxy?vfx=${v.key}`}
                  className="w-full h-full block"
                  style={{ border: 0 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-white/40">
                  Set the app origin above to load the live galaxy.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <footer className="text-[11px] text-white/40 max-w-3xl">
        Tip: hover a star in either iframe to see how the connected synergy
        threads pulse and how the rest of the field dims back. Both variants
        share identical data, camera, and interaction — only the visual
        treatment differs.
      </footer>
    </div>
  );
}
