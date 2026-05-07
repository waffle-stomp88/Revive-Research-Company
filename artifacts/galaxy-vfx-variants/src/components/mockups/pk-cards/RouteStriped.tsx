
const ROUTE_COLOR: Record<string, { hex: string; dim: string }> = {
  SC:    { hex: "#21d8ff", dim: "#21d8ff22" },
  IV:    { hex: "#a78bfa", dim: "#a78bfa22" },
  IN:    { hex: "#34d399", dim: "#34d39922" },
  Oral:  { hex: "#fbbf24", dim: "#fbbf2422" },
  Topical: { hex: "#f472b6", dim: "#f472b622" },
};

interface Compound {
  name: string;
  route: string;
  halfLife: string;
  indirect?: boolean;
  context: string;
  altRoute?: string;
  altHalfLife?: string;
}

const COMPOUNDS: Compound[] = [
  { name: "BPC-157",     route: "SC",   halfLife: "1.5–4 h",   context: "Direct plasma studies show rapid distribution and renal elimination." },
  { name: "TB-500",      route: "SC",   halfLife: "87–96 h",   context: "Depot-forming properties extend half-life significantly." },
  { name: "Semax",       route: "IN",   halfLife: "1–2 h",     context: "Nasal delivery achieves CNS bioavailability; cleared within 2 h." },
  { name: "Ipamorelin",  route: "SC",   halfLife: "2 h",       context: "Short elimination; requires 2–3× daily dosing in research.", altRoute: "IV", altHalfLife: "2 h" },
  { name: "Epithalon",   route: "SC",   halfLife: "~30 min",   indirect: true, context: "Estimated from tetrapeptide analogue class data." },
  { name: "GHK-Cu",      route: "SC",   halfLife: "0.5–1 h",   context: "Rapid enzymatic degradation in systemic circulation." },
  { name: "Selank",      route: "IN",   halfLife: "1–2 h",     context: "Comparable CNS kinetics to Semax after intranasal use." },
  { name: "5-Amino-1MQ", route: "Oral", halfLife: "3–5 h",     context: "Hepatic first-pass metabolism moderates oral bioavailability." },
  { name: "CJC-1295",    route: "SC",   halfLife: "6–8 d",     context: "DAC modification extends half-life via albumin binding." },
];

function CompoundCard({ c }: { c: Compound }) {
  const rc = ROUTE_COLOR[c.route] ?? { hex: "#888", dim: "#88882" };
  const altRc = c.altRoute ? ROUTE_COLOR[c.altRoute] : null;

  return (
    <div style={{
      background: "#07070b",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 8,
      display: "flex",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Left route stripe */}
      <div style={{
        width: 4,
        background: rc.hex,
        flexShrink: 0,
        opacity: 0.85,
      }} />

      {/* Card body */}
      <div style={{ flex: 1, padding: "13px 14px 12px", position: "relative", overflow: "hidden" }}>
        {/* Route watermark */}
        <div style={{
          position: "absolute",
          right: -4,
          top: -2,
          fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
          fontSize: 64,
          color: rc.hex,
          opacity: 0.05,
          letterSpacing: "0.02em",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}>
          {c.route}
        </div>

        {/* Top row: name + badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4, marginBottom: 8 }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.01em",
          }}>
            {c.name}
          </span>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {c.indirect && (
              <span style={{
                fontSize: 9, padding: "2px 5px", borderRadius: 4,
                background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.25)",
              }}>⚠ Indirect</span>
            )}
            {c.altRoute && (
              <span style={{
                fontSize: 9, padding: "2px 5px", borderRadius: 4,
                background: "rgba(231,251,16,0.08)", color: "#E7FB10",
                border: "1px solid rgba(231,251,16,0.2)",
              }}>⇄ Dual</span>
            )}
          </div>
        </div>

        {/* Half-life section */}
        {!c.altRoute ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{
              fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
              fontSize: 26,
              color: rc.hex,
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}>{c.halfLife}</span>
            <span style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>t½ · {c.route}</span>
          </div>
        ) : (
          /* Dual route: two pill-style boxes */
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <div style={{
              flex: 1, padding: "6px 8px", borderRadius: 5,
              background: rc.hex + "12", border: `1px solid ${rc.hex}35`,
            }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 2 }}>{c.route}</div>
              <div style={{
                fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
                fontSize: 20, color: rc.hex, letterSpacing: "0.02em",
              }}>{c.halfLife}</div>
            </div>
            <div style={{
              flex: 1, padding: "6px 8px", borderRadius: 5,
              background: (altRc?.hex ?? "#a78bfa") + "12",
              border: `1px solid ${altRc?.hex ?? "#a78bfa"}35`,
            }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 2 }}>{c.altRoute}</div>
              <div style={{
                fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
                fontSize: 20, color: altRc?.hex ?? "#a78bfa", letterSpacing: "0.02em",
              }}>{c.altHalfLife}</div>
            </div>
          </div>
        )}

        {/* Context */}
        <p style={{
          fontSize: 10.5,
          color: "rgba(255,255,255,0.3)",
          lineHeight: 1.5,
          margin: "0 0 8px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{c.context}</p>

        {/* Footer */}
        <div style={{
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 9.5, color: `${rc.hex}55` }}>Read article →</span>
          <span style={{
            fontSize: 9, padding: "2px 6px", borderRadius: 4,
            background: rc.hex + "14", color: rc.hex + "cc",
            border: `1px solid ${rc.hex}30`, letterSpacing: "0.05em",
          }}>{c.route}</span>
        </div>
      </div>
    </div>
  );
}

export function RouteStriped() {
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
          9 research compounds · 3 with dual-route kinetics
        </p>
      </div>

      {/* Route legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {Object.entries(ROUTE_COLOR).map(([label, { hex }]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 3, height: 14, borderRadius: 2, background: hex }} />
            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{label}</span>
          </div>
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

      {/* Variant label */}
      <div style={{ marginTop: 20, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
        VARIANT B — ROUTE-STRIPED: colored stripe + watermark per route
      </div>
    </div>
  );
}
