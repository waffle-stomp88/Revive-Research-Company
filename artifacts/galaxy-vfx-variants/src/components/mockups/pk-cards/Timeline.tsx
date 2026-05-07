
const ROUTE_COLOR: Record<string, string> = {
  SC:    "#21d8ff",
  IV:    "#a78bfa",
  IN:    "#34d399",
  Oral:  "#fbbf24",
  Topical: "#f472b6",
};

interface Compound {
  name: string;
  route: string;
  halfLife: string;
  halfLifeMidMin: number; // minutes, for bar calculation
  indirect?: boolean;
  context: string;
  altRoute?: string;
  altHalfLife?: string;
  altMidMin?: number;
}

const COMPOUNDS: Compound[] = [
  { name: "BPC-157",     route: "SC",   halfLife: "1.5–4 h",   halfLifeMidMin: 165,   context: "Direct plasma studies show rapid distribution and renal elimination." },
  { name: "TB-500",      route: "SC",   halfLife: "87–96 h",   halfLifeMidMin: 5490,  context: "Depot-forming properties significantly extend half-life." },
  { name: "Semax",       route: "IN",   halfLife: "1–2 h",     halfLifeMidMin: 90,    context: "Nasal delivery achieves CNS bioavailability; cleared within 2 h." },
  { name: "Ipamorelin",  route: "SC",   halfLife: "2 h",       halfLifeMidMin: 120,   context: "Short elimination; requires 2–3× daily dosing in research.", altRoute: "IV", altHalfLife: "2 h", altMidMin: 120 },
  { name: "Epithalon",   route: "SC",   halfLife: "~30 min",   halfLifeMidMin: 30,    indirect: true, context: "Estimated from tetrapeptide analogue class data." },
  { name: "GHK-Cu",      route: "SC",   halfLife: "0.5–1 h",   halfLifeMidMin: 45,    context: "Rapid enzymatic degradation in systemic circulation." },
  { name: "Selank",      route: "IN",   halfLife: "1–2 h",     halfLifeMidMin: 90,    context: "Comparable CNS kinetics to Semax after intranasal administration." },
  { name: "5-Amino-1MQ", route: "Oral", halfLife: "3–5 h",     halfLifeMidMin: 240,   context: "Hepatic first-pass metabolism moderates oral bioavailability." },
  { name: "CJC-1295",    route: "SC",   halfLife: "6–8 d",     halfLifeMidMin: 10080, context: "DAC modification extends half-life via albumin binding." },
];

const MAX_MIN = Math.max(...COMPOUNDS.map(c => Math.max(c.halfLifeMidMin, c.altMidMin ?? 0)));

function DurationBar({ midMin, route, label, altMidMin, altRoute }: {
  midMin: number; route: string; label: string;
  altMidMin?: number; altRoute?: string;
}) {
  const color = ROUTE_COLOR[route] ?? "#888";
  const altColor = altRoute ? ROUTE_COLOR[altRoute] ?? "#888" : null;
  const pct = Math.max(2, (midMin / MAX_MIN) * 100);
  const altPct = altMidMin ? Math.max(2, (altMidMin / MAX_MIN) * 100) : 0;

  if (altMidMin && altRoute) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Primary */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>{route}</span>
            <span style={{ fontSize: 10, color, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}cc, ${color})`,
              borderRadius: 3,
              boxShadow: `0 0 8px ${color}66`,
            }} />
          </div>
        </div>
        {/* Alt */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>{altRoute}</span>
            <span style={{ fontSize: 10, color: altColor!, fontWeight: 700 }}>{label}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${altPct}%`,
              background: `linear-gradient(90deg, ${altColor!}cc, ${altColor!})`,
              borderRadius: 3,
              boxShadow: `0 0 8px ${altColor!}66`,
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {route} · t½
        </span>
        <span style={{ fontSize: 11, color, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
      </div>
      <div style={{ height: 7, borderRadius: 3.5, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 3.5,
          boxShadow: `0 0 10px ${color}55`,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

function CompoundCard({ c }: { c: Compound }) {
  const rc = ROUTE_COLOR[c.route] ?? "#888";

  return (
    <div style={{
      background: "#07070b",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 8,
      padding: "13px 14px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>
          {c.name}
        </span>
        <div style={{ display: "flex", gap: 3 }}>
          {c.indirect && (
            <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
              ⚠
            </span>
          )}
          {c.altRoute && (
            <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(231,251,16,0.08)", color: "#E7FB10", border: "1px solid rgba(231,251,16,0.2)" }}>
              ⇄
            </span>
          )}
          <span style={{
            fontSize: 9, padding: "2px 6px", borderRadius: 4,
            background: rc + "18", color: rc,
            border: `1px solid ${rc}35`, fontWeight: 700, letterSpacing: "0.05em",
          }}>{c.route}</span>
        </div>
      </div>

      {/* Duration bar */}
      <DurationBar
        midMin={c.halfLifeMidMin}
        route={c.route}
        label={c.halfLife}
        altMidMin={c.altMidMin}
        altRoute={c.altRoute}
      />

      {/* Context */}
      <p style={{
        fontSize: 10.5,
        color: "rgba(255,255,255,0.28)",
        lineHeight: 1.5,
        margin: "10px 0 8px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{c.context}</p>

      {/* Footer */}
      <div style={{
        paddingTop: 7,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 9.5, color: rc + "55" }}>Read article →</span>
        {c.altRoute && (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
            {c.route} vs {c.altRoute}
          </span>
        )}
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      padding: "32px 28px",
      fontFamily: "'DM Sans', sans-serif",
      boxSizing: "border-box",
    }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ color: "#21d8ff", fontSize: 16 }}>⚡</span>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, color: "#fff", margin: 0, letterSpacing: "0.04em",
          }}>
            Peptide Half-Life Catalog
          </h1>
        </div>
        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", margin: 0 }}>
          Bar width = relative duration · 9 research compounds
        </p>
      </div>

      {/* Filter bar (static) */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {["All Routes", "SC", "IV", "IN", "Oral"].map((f, i) => (
          <span key={f} style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 5,
            border: `1px solid ${i === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
            color: i === 0 ? "#fff" : "rgba(255,255,255,0.35)",
            background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent",
          }}>{f}</span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>9 compounds</span>
      </div>

      {/* Card grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
      }}>
        {COMPOUNDS.map(c => <CompoundCard key={c.name} c={c} />)}
      </div>

      {/* Scale legend */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)" }} />
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
          SCALE ANCHOR: CJC-1295 @ 6–8 d
        </span>
      </div>

      {/* Variant label */}
      <div style={{ marginTop: 12, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
        VARIANT C — TIMELINE: duration bars normalize to catalog max
      </div>
    </div>
  );
}
