
const ROUTE_COLOR: Record<string, { hex: string; label: string }> = {
  SC:    { hex: "#21d8ff", label: "Subcutaneous" },
  IV:    { hex: "#a78bfa", label: "Intravenous" },
  IN:    { hex: "#34d399", label: "Intranasal" },
  Oral:  { hex: "#fbbf24", label: "Oral" },
  Topical: { hex: "#f472b6", label: "Topical" },
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
  { name: "TB-500",      route: "SC",   halfLife: "87–96 h",   context: "Extended depot-forming properties extend half-life significantly." },
  { name: "Semax",       route: "IN",   halfLife: "1–2 h",     context: "Nasal delivery achieves CNS bioavailability; cleared within 2 h." },
  { name: "Ipamorelin",  route: "SC",   halfLife: "2 h",       context: "Short elimination; requires 2–3× daily dosing in research protocols.", altRoute: "IV", altHalfLife: "2 h" },
  { name: "Epithalon",   route: "SC",   halfLife: "~30 min",   indirect: true, context: "Estimated from tetrapeptide analogue class; direct PK data limited." },
  { name: "GHK-Cu",      route: "SC",   halfLife: "0.5–1 h",   context: "Copper tripeptide undergoes rapid enzymatic degradation systemically." },
  { name: "Selank",      route: "IN",   halfLife: "1–2 h",     context: "Comparable CNS kinetics to Semax after intranasal administration." },
  { name: "5-Amino-1MQ", route: "Oral", halfLife: "3–5 h",     context: "Hepatic first-pass metabolism moderates oral bioavailability." },
  { name: "CJC-1295",    route: "SC",   halfLife: "6–8 d",     context: "DAC modification extends half-life via albumin binding." },
];

function CompoundCard({ c }: { c: Compound }) {
  const rc = ROUTE_COLOR[c.route] ?? { hex: "#888", label: c.route };
  const altRc = c.altRoute ? ROUTE_COLOR[c.altRoute] : null;

  return (
    <div
      style={{
        background: "#07070b",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
        padding: "16px 16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Subtle route color glow top-right */}
      <div style={{
        position: "absolute",
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: rc.hex,
        opacity: 0.06,
        pointerEvents: "none",
      }} />

      {/* Route badge top-right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.02em",
        }}>
          {c.name}
        </span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {c.indirect && (
            <span style={{
              fontSize: 9,
              padding: "2px 6px",
              borderRadius: 4,
              background: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.25)",
              display: "flex", alignItems: "center", gap: 3,
            }}>
              ⚠ Indirect
            </span>
          )}
          {c.altRoute && (
            <span style={{
              fontSize: 9,
              padding: "2px 6px",
              borderRadius: 4,
              background: "rgba(231,251,16,0.08)",
              color: "#E7FB10",
              border: "1px solid rgba(231,251,16,0.2)",
            }}>
              ⇄ Dual
            </span>
          )}
          <span style={{
            fontSize: 9,
            padding: "2px 7px",
            borderRadius: 4,
            background: rc.hex + "18",
            color: rc.hex,
            border: `1px solid ${rc.hex}40`,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}>
            {c.route}
          </span>
        </div>
      </div>

      {/* Hero half-life value */}
      {!c.altRoute ? (
        <div style={{
          fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
          fontSize: 42,
          lineHeight: 1.05,
          color: rc.hex,
          letterSpacing: "0.02em",
          marginBottom: 2,
          textShadow: `0 0 24px ${rc.hex}55`,
        }}>
          {c.halfLife}
        </div>
      ) : (
        /* Dual route: two large numbers side by side */
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 1 }}>{c.route}</div>
            <div style={{
              fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
              fontSize: 34,
              lineHeight: 1,
              color: rc.hex,
              textShadow: `0 0 20px ${rc.hex}44`,
            }}>{c.halfLife}</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 20, marginBottom: 4 }}>⇄</div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 1 }}>{c.altRoute}</div>
            <div style={{
              fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
              fontSize: 34,
              lineHeight: 1,
              color: altRc?.hex ?? "#a78bfa",
              textShadow: `0 0 20px ${altRc?.hex ?? "#a78bfa"}44`,
            }}>{c.altHalfLife}</div>
          </div>
        </div>
      )}

      {/* Label underneath */}
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
        elimination half-life
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 8 }} />

      {/* Context blurb */}
      <p style={{
        fontSize: 10.5,
        color: "rgba(255,255,255,0.35)",
        lineHeight: 1.5,
        margin: 0,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {c.context}
      </p>

      {/* Read article */}
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9.5, color: `${rc.hex}60`, cursor: "pointer" }}>Read article →</span>
      </div>
    </div>
  );
}

export function DataLed() {
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
            fontSize: 28,
            color: "#fff",
            margin: 0,
            letterSpacing: "0.04em",
          }}>
            Peptide Half-Life Catalog
          </h1>
        </div>
        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", margin: 0 }}>
          9 research compounds · 3 with dual-route kinetics
        </p>
      </div>

      {/* Filter bar (static mock) */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {["All Routes", "SC", "IV", "IN", "Oral"].map((f, i) => (
          <span key={f} style={{
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 5,
            border: `1px solid ${i === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
            color: i === 0 ? "#fff" : "rgba(255,255,255,0.35)",
            background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent",
            cursor: "pointer",
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

      {/* Variant label */}
      <div style={{ marginTop: 20, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
        VARIANT A — DATA-LED: half-life as the hero element
      </div>
    </div>
  );
}
