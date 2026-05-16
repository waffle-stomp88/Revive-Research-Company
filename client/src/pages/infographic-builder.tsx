import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { Brain, Utensils, Activity, Download, Loader2, Zap, Shield, Flame, Wind, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
type CalloutIconName = "brain" | "stomach" | "pancreas" | "activity" | "utensils" | "shield" | "zap" | "flame" | "wind" | "heart";

interface Callout {
  id: string;
  icon: CalloutIconName;
  label: string;
  description: string;
  yPercent: number;
}

interface PostData {
  id: string;
  label: string;
  seriesLabel: string;
  fileName: string;
  headline: string;
  backgroundImage: string;
  bodyText: string;
  callouts: Callout[];
}

// ─── POST DATA CONFIGS ─────────────────────────────────────────────────────────
// Add new entries here to grow the "THE BASICS" series.
//
// Available silhouette assets (client/public/assets/):
//   • /assets/glp1-silhouette.png               — GLP-1 specific (original)
//   • /assets/infographic-silhouette-neutral.svg — gender-neutral full body (default for new posts)
//   • /assets/infographic-silhouette-male.svg    — broader shoulders, narrower hips
//   • /assets/infographic-silhouette-female.svg  — narrower shoulders, defined waist/hips
//
// Naming convention for new custom silhouettes:
//   infographic-silhouette-{descriptor}.{svg|png}
const POST_CONFIGS: PostData[] = [
  {
    id: "glp1",
    label: "GLP-1 Basics",
    seriesLabel: "THE BASICS // 001",
    fileName: "revive-basics-001-glp1.png",
    headline: "WHAT IS\nA GLP-1?",
    backgroundImage: "/assets/glp1-silhouette.png",
    bodyText:
      "GLP-1 (Glucagon-Like Peptide-1) is a naturally occurring hormone released by intestinal L-cells in response to food intake. It plays a central role in blood-sugar regulation, appetite signaling, and gastric motility — making it a key focus of modern metabolic research.",
    callouts: [
      {
        id: "brain",
        icon: "brain",
        label: "Brain",
        description: "Reduces appetite & food\ncravings via hypothalamus",
        yPercent: 18,
      },
      {
        id: "stomach",
        icon: "utensils",
        label: "Stomach",
        description: "Slows gastric emptying,\nprolonging satiety signals",
        yPercent: 44,
      },
      {
        id: "pancreas",
        icon: "activity",
        label: "Pancreas",
        description: "Stimulates insulin release\n& suppresses glucagon",
        yPercent: 68,
      },
    ],
  },
  {
    id: "bpc157",
    label: "BPC-157",
    seriesLabel: "THE BASICS // 002",
    fileName: "revive-basics-002-bpc157.png",
    headline: "WHAT IS\nBPC-157?",
    backgroundImage: "/assets/infographic-silhouette-neutral.svg",
    bodyText:
      "BPC-157 (Body Protective Compound-157) is a pentadecapeptide derived from a protective protein found in gastric juice. Researchers study its influence on tissue repair pathways, angiogenesis, and the gut-brain axis, making it one of the most widely investigated peptides in regenerative science.",
    callouts: [
      {
        id: "gut",
        icon: "shield",
        label: "Gut Lining",
        description: "Promotes mucosal repair\n& reduces intestinal damage",
        yPercent: 18,
      },
      {
        id: "tendons",
        icon: "zap",
        label: "Tendons",
        description: "Accelerates tendon-to-bone\nhealing via growth factors",
        yPercent: 44,
      },
      {
        id: "vessels",
        icon: "activity",
        label: "Vasculature",
        description: "Stimulates angiogenesis\nfor improved blood supply",
        yPercent: 68,
      },
    ],
  },
  {
    id: "tb500",
    label: "TB-500",
    seriesLabel: "THE BASICS // 003",
    fileName: "revive-basics-003-tb500.png",
    headline: "WHAT IS\nTB-500?",
    backgroundImage: "/assets/infographic-silhouette-neutral.svg",
    bodyText:
      "TB-500 is a synthetic version of Thymosin Beta-4, a naturally occurring peptide found in high concentrations in blood platelets and wound fluid. Research suggests it plays a pivotal role in cell migration, differentiation, and the remodeling of actin — the protein that gives cells their shape and motility.",
    callouts: [
      {
        id: "muscle",
        icon: "flame",
        label: "Muscle",
        description: "Supports satellite cell\nactivation & fiber repair",
        yPercent: 18,
      },
      {
        id: "actin",
        icon: "activity",
        label: "Cytoskeleton",
        description: "Regulates actin dynamics\nfor cell migration",
        yPercent: 44,
      },
      {
        id: "inflammation",
        icon: "shield",
        label: "Inflammation",
        description: "Modulates inflammatory\ncascade post-injury",
        yPercent: 68,
      },
    ],
  },
  {
    id: "ipamorelin",
    label: "Ipamorelin",
    seriesLabel: "THE BASICS // 004",
    fileName: "revive-basics-004-ipamorelin.png",
    headline: "WHAT IS\nIPAMORELIN?",
    backgroundImage: "/assets/infographic-silhouette-neutral.svg",
    bodyText:
      "Ipamorelin is a selective growth hormone secretagogue and ghrelin mimetic. Unlike broader GHRPs, it is notable for its high specificity — stimulating GH release with minimal impact on cortisol or prolactin levels, making it a subject of significant interest in longevity and body-composition research.",
    callouts: [
      {
        id: "pituitary",
        icon: "brain",
        label: "Pituitary",
        description: "Selectively stimulates GH\nrelease from somatotrophs",
        yPercent: 18,
      },
      {
        id: "liver",
        icon: "activity",
        label: "Liver",
        description: "Drives IGF-1 production\ndownstream of GH release",
        yPercent: 44,
      },
      {
        id: "tissue",
        icon: "zap",
        label: "Tissue",
        description: "Supports lean mass & recovery\nvia IGF-1 signaling",
        yPercent: 68,
      },
    ],
  },
  {
    id: "igf1-lr3",
    label: "IGF-1 LR3",
    seriesLabel: "THE BASICS // 005",
    fileName: "revive-basics-005-igf1-lr3.png",
    headline: "WHAT IS\nIGF-1 LR3?",
    backgroundImage: "",
    bodyText:
      "IGF-1 LR3 is a long-acting analogue of Insulin-Like Growth Factor-1 with a modified arginine-3 substitution that reduces binding to IGF-binding proteins. Research focuses on its role in muscle protein synthesis, cellular proliferation, and metabolic regulation.",
    callouts: [
      {
        id: "muscle",
        icon: "zap",
        label: "Muscle",
        description: "Stimulates satellite cell\nactivation & hypertrophy",
        yPercent: 18,
      },
      {
        id: "metabolism",
        icon: "activity",
        label: "Metabolism",
        description: "Enhances glucose uptake\nindependent of insulin",
        yPercent: 44,
      },
      {
        id: "recovery",
        icon: "heart",
        label: "Recovery",
        description: "Supports cellular repair\nvia IGF-1R signaling",
        yPercent: 68,
      },
    ],
  },
];

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const CANVAS_SIZE = 1080;
const CYAN = "#00D4FF";
const NEAR_BLACK = "#0A0A0A";

// ─── CALLOUT ICON COMPONENT ────────────────────────────────────────────────────
function CalloutIcon({ icon }: { icon: string }) {
  const iconProps = { size: 18, color: "white", strokeWidth: 1.5 };
  if (icon === "brain") return <Brain {...iconProps} />;
  if (icon === "utensils" || icon === "stomach") return <Utensils {...iconProps} />;
  if (icon === "shield") return <Shield {...iconProps} />;
  if (icon === "zap") return <Zap {...iconProps} />;
  if (icon === "flame") return <Flame {...iconProps} />;
  if (icon === "wind") return <Wind {...iconProps} />;
  if (icon === "heart") return <Heart {...iconProps} />;
  return <Activity {...iconProps} />;
}

// ─── NOISE OVERLAY ─────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.03,
        pointerEvents: "none",
        zIndex: 10,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-filter)" fill="white" />
    </svg>
  );
}

// ─── CANVAS COMPONENT ──────────────────────────────────────────────────────────
function InfographicCanvas({
  canvasRef,
  data,
}: {
  canvasRef: React.RefObject<HTMLDivElement>;
  data: PostData;
}) {
  const { seriesLabel, headline, backgroundImage, callouts, bodyText } = data;

  const rightColLeft = CANVAS_SIZE * 0.52;
  const rightColWidth = CANVAS_SIZE - rightColLeft - 56;

  return (
    <div
      ref={canvasRef}
      style={{
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        background: NEAR_BLACK,
        position: "relative",
        overflow: "hidden",
        fontFamily: "DM Sans, sans-serif",
        flexShrink: 0,
      }}
    >
      <NoiseOverlay />

      {/* Ambient gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 45% at 20% 15%, rgba(0,212,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Body silhouette image */}
      <div
        style={{
          position: "absolute",
          left: "5%",
          top: "8%",
          width: "46%",
          height: "84%",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt="Body silhouette"
            style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.87 }}
          />
        ) : (
          <div
            style={{
              width: "62%",
              height: "88%",
              border: `1px solid rgba(0,212,255,0.15)`,
              borderRadius: 12,
              background: "rgba(0,212,255,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "rgba(0,212,255,0.3)",
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.05em",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              SILHOUETTE
              <br />
              IMAGE
            </span>
          </div>
        )}
      </div>

      {/* Logo */}
      <div style={{ position: "absolute", top: 52, left: 56, zIndex: 20 }}>
        <img
          src="/assets/logo.png"
          alt="Revive Research"
          style={{ height: 34, objectFit: "contain" }}
          crossOrigin="anonymous"
        />
      </div>

      {/* Series label */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 56,
          zIndex: 20,
          color: CYAN,
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.12em",
          fontWeight: 400,
        }}
      >
        {seriesLabel}
      </div>

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: 126,
          left: 48,
          zIndex: 20,
          color: "#FFFFFF",
          fontSize: 78,
          fontFamily: "'Bebas Neue', sans-serif",
          lineHeight: 0.95,
          letterSpacing: "0.02em",
          whiteSpace: "pre-line",
        }}
      >
        {headline}
      </div>

      {/* Right column callouts */}
      {callouts.map((callout) => {
        const yPx = (callout.yPercent / 100) * CANVAS_SIZE;
        return (
          <div
            key={callout.id}
            style={{
              position: "absolute",
              left: rightColLeft,
              top: yPx,
              width: rightColWidth,
              zIndex: 20,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -40,
                top: 18,
                width: 32,
                height: 1,
                background: CYAN,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `1px solid ${CYAN}`,
                background: "rgba(0,212,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <CalloutIcon icon={callout.icon} />
            </div>
            <div
              style={{
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.04em",
                fontFamily: "DM Sans, sans-serif",
                marginBottom: 5,
                textTransform: "uppercase",
              }}
            >
              {callout.label}
            </div>
            <div
              style={{
                color: "#888888",
                fontSize: 13,
                lineHeight: 1.55,
                fontFamily: "DM Sans, sans-serif",
                whiteSpace: "pre-line",
              }}
            >
              {callout.description}
            </div>
          </div>
        );
      })}

      {/* Body text block */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ width: 200, height: 1, background: `rgba(0,212,255,0.30)` }} />
        <p
          style={{
            color: "#CCCCCC",
            fontSize: 15,
            lineHeight: 1.65,
            textAlign: "center",
            fontFamily: "DM Sans, sans-serif",
            margin: 0,
            fontWeight: 400,
          }}
        >
          {bodyText}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#666666",
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em",
          zIndex: 20,
        }}
      >
        REVIVERESEARCH.CO | FOR RESEARCH USE ONLY
      </div>
    </div>
  );
}

// ─── FIELD STYLES ───────────────────────────────────────────────────────────────
const fieldLabel: React.CSSProperties = {
  display: "block",
  color: "#888",
  fontSize: 11,
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "0.08em",
  marginBottom: 5,
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6,
  color: "#e8e8e8",
  fontSize: 13,
  fontFamily: "DM Sans, sans-serif",
  padding: "7px 10px",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
};

const sectionHeading: React.CSSProperties = {
  color: CYAN,
  fontSize: 11,
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  margin: "0 0 12px",
};

// ─── COLLAPSIBLE CALLOUT EDITOR ─────────────────────────────────────────────────
function CalloutEditor({
  callout,
  index,
  onChange,
}: {
  callout: Callout;
  index: number;
  onChange: (index: number, field: "label" | "description", value: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <button
        data-testid={`button-callout-toggle-${index}`}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 12px",
          color: "#ccc",
          fontSize: 13,
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 600,
        }}
      >
        <span>Callout {index + 1}: {callout.label || "(no label)"}</span>
        {open ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
      </button>

      {open && (
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={fieldLabel}>Label</label>
            <input
              data-testid={`input-callout-label-${index}`}
              style={inputStyle}
              value={callout.label}
              onChange={(e) => onChange(index, "label", e.target.value)}
            />
          </div>
          <div>
            <label style={fieldLabel}>Description (use \n for line break)</label>
            <textarea
              data-testid={`input-callout-description-${index}`}
              style={{ ...inputStyle, minHeight: 64 }}
              value={callout.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONFIG PANEL ───────────────────────────────────────────────────────────────
function ConfigPanel({
  data,
  onChange,
  onReset,
}: {
  data: PostData;
  onChange: (updated: PostData) => void;
  onReset: () => void;
}) {
  const set = <K extends keyof PostData>(key: K, value: PostData[K]) =>
    onChange({ ...data, [key]: value });

  const handleCalloutChange = (index: number, field: "label" | "description", value: string) => {
    const updated = data.callouts.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    onChange({ ...data, callouts: updated });
  };

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        background: "#18181c",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflowY: "auto",
        maxHeight: "calc(100vh - 160px)",
      }}
    >
      {/* General */}
      <div>
        <p style={sectionHeading}>General</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={fieldLabel}>Series label</label>
            <input
              data-testid="input-series-label"
              style={inputStyle}
              value={data.seriesLabel}
              onChange={(e) => set("seriesLabel", e.target.value)}
            />
          </div>
          <div>
            <label style={fieldLabel}>Headline (use \n for line break)</label>
            <textarea
              data-testid="input-headline"
              style={{ ...inputStyle, minHeight: 64 }}
              value={data.headline}
              onChange={(e) => set("headline", e.target.value)}
            />
          </div>
          <div>
            <label style={fieldLabel}>Export filename</label>
            <input
              data-testid="input-filename"
              style={inputStyle}
              value={data.fileName}
              onChange={(e) => set("fileName", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Body text */}
      <div>
        <p style={sectionHeading}>Body text</p>
        <textarea
          data-testid="input-body-text"
          style={{ ...inputStyle, minHeight: 100 }}
          value={data.bodyText}
          onChange={(e) => set("bodyText", e.target.value)}
        />
      </div>

      {/* Callouts */}
      <div>
        <p style={sectionHeading}>Callouts</p>
        {data.callouts.map((callout, i) => (
          <CalloutEditor key={callout.id} callout={callout} index={i} onChange={handleCalloutChange} />
        ))}
      </div>

      {/* Reset */}
      <Button
        data-testid="button-reset-defaults"
        variant="outline"
        onClick={onReset}
        style={{
          fontSize: 12,
          fontFamily: "DM Sans, sans-serif",
          letterSpacing: "0.04em",
          borderColor: "rgba(255,255,255,0.15)",
          color: "#888",
          background: "transparent",
        }}
      >
        Reset to defaults
      </Button>
    </div>
  );
}

// ─── PAGE COMPONENT ────────────────────────────────────────────────────────────
export default function InfographicBuilder() {
  const canvasRef = useRef<HTMLDivElement>(null!);
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(0.45);
  const [selectedId, setSelectedId] = useState(POST_CONFIGS[0].id);
  const [postData, setPostData] = useState<PostData>(POST_CONFIGS[0]);

  // When the preset selector changes, load that preset into the editable state
  const handleSelectPost = (id: string) => {
    setSelectedId(id);
    const preset = POST_CONFIGS.find((p) => p.id === id) ?? POST_CONFIGS[0];
    setPostData(preset);
  };

  useEffect(() => {
    const id = "jetbrains-mono-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Compute scale so the canvas fits alongside the config panel
  useEffect(() => {
    const compute = () => {
      const panelWidth = 280 + 16 + 48; // panel + gap + outer padding
      const availableW = Math.max(window.innerWidth - panelWidth - 64, 200);
      const availableH = Math.max(window.innerHeight - 180, 200);
      setScale(Math.max(Math.min(availableW / CANVAS_SIZE, availableH / CANVAS_SIZE, 1), 0.1));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 80));
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: NEAR_BLACK,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      });
      const link = document.createElement("a");
      link.download = postData.fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111114",
        display: "flex",
        flexDirection: "column",
        padding: "28px 24px 40px",
        gap: 24,
      }}
    >
      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            INFOGRAPHIC BUILDER
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: 13,
              fontFamily: "DM Sans, sans-serif",
              margin: "4px 0 0",
            }}
          >
            "THE BASICS" series — 1080 × 1080 px Instagram post
          </p>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          data-testid="button-export-png"
          style={{
            background: CYAN,
            color: "#000",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {exporting ? (
            <>
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              Exporting…
            </>
          ) : (
            <>
              <Download size={15} />
              Export PNG
            </>
          )}
        </Button>
      </div>

      {/* ── Post selector ── */}
      <Select value={selectedId} onValueChange={handleSelectPost}>
        <SelectTrigger
          data-testid="select-post-config"
          style={{
            background: "#1a1a1f",
            border: "1px solid #333",
            color: "#fff",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            width: 240,
          }}
        >
          <SelectValue placeholder="Choose a post…" />
        </SelectTrigger>
        <SelectContent style={{ background: "#1a1a1f", border: "1px solid #333" }}>
          {POST_CONFIGS.map((config) => (
            <SelectItem
              key={config.id}
              value={config.id}
              data-testid={`option-post-config-${config.id}`}
              style={{
                color: "#fff",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {config.seriesLabel} — {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── Main content: panel + canvas ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Config panel */}
        <ConfigPanel
          data={postData}
          onChange={setPostData}
          onReset={() => {
            const preset = POST_CONFIGS.find((p) => p.id === selectedId) ?? POST_CONFIGS[0];
            setPostData(preset);
          }}
        />

        {/* Canvas + label */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <div
            style={{
              width: CANVAS_SIZE * scale,
              height: CANVAS_SIZE * scale,
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <InfographicCanvas canvasRef={canvasRef} data={postData} />
            </div>
          </div>

          <p
            style={{
              color: "#444",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              margin: 0,
            }}
          >
            {CANVAS_SIZE} × {CANVAS_SIZE} px · preview at {Math.round(scale * 100)}%
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
