import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { Brain, Utensils, Activity, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── POST DATA CONFIG ──────────────────────────────────────────────────────────
// Swap this object to produce a new post — no layout changes required.
const POST_DATA = {
  seriesLabel: "THE BASICS // 001",
  fileName: "revive-basics-001-glp1.png",
  headline: "WHAT IS\nA GLP-1?",
  backgroundImage: "", // set to e.g. "/assets/glp1-silhouette.png" when available
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
      icon: "stomach",
      label: "Stomach",
      description: "Slows gastric emptying,\nprolonging satiety signals",
      yPercent: 44,
    },
    {
      id: "pancreas",
      icon: "pancreas",
      label: "Pancreas",
      description: "Stimulates insulin release\n& suppresses glucagon",
      yPercent: 68,
    },
  ],
};

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const CANVAS_SIZE = 1080;
const CYAN = "#00D4FF";
const NEAR_BLACK = "#0A0A0A";

// ─── CALLOUT ICON COMPONENT ────────────────────────────────────────────────────
// icon values: "brain" | "stomach" | "pancreas" | "activity" | "utensils"
function CalloutIcon({ icon }: { icon: string }) {
  const iconProps = { size: 18, color: "white", strokeWidth: 1.5 };
  if (icon === "brain") return <Brain {...iconProps} />;
  if (icon === "stomach" || icon === "utensils") return <Utensils {...iconProps} />;
  return <Activity {...iconProps} />;
}

// ─── NOISE OVERLAY ─────────────────────────────────────────────────────────────
// SVG-based pseudo-noise at very low opacity
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
function InfographicCanvas({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement> }) {
  const { seriesLabel, headline, backgroundImage, callouts, bodyText } = POST_DATA;

  // Right column starts at 52% of canvas width
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
      {/* ── Noise texture overlay ── */}
      <NoiseOverlay />

      {/* ── Subtle ambient gradient (top-left warm glow) ── */}
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

      {/* ── Body silhouette image (centered-left, behind callouts) ── */}
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
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0.87,
            }}
          />
        ) : (
          // Placeholder when no image is set
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

      {/* ── Logo (top-left) ── */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 56,
          zIndex: 20,
        }}
      >
        <img
          src="/assets/logo.png"
          alt="Revive Research"
          style={{ height: 34, objectFit: "contain" }}
          crossOrigin="anonymous"
        />
      </div>

      {/* ── Series label ── */}
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

      {/* ── Headline ── */}
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

      {/* ── Right column: organ callouts ── */}
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
            {/* Horizontal connector line */}
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

            {/* Icon circle */}
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

            {/* Label */}
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

            {/* Description */}
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

      {/* ── Body text block (lower third) ── */}
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
        {/* Cyan divider */}
        <div
          style={{
            width: 200,
            height: 1,
            background: `rgba(0,212,255,0.30)`,
          }}
        />

        {/* Body text */}
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

      {/* ── Footer ── */}
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

// ─── PAGE COMPONENT ────────────────────────────────────────────────────────────
export default function InfographicBuilder() {
  const canvasRef = useRef<HTMLDivElement>(null!);
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(0.5);

  // Load JetBrains Mono font
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

  // Compute scale so the 1080×1080 canvas fits inside the viewport with padding
  useEffect(() => {
    const compute = () => {
      const available = Math.min(window.innerWidth - 64, window.innerHeight - 180);
      setScale(Math.min(available / CANVAS_SIZE, 1));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    // Let the loading state paint before the synchronous html2canvas work begins
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
      link.download = POST_DATA.fileName;
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
        alignItems: "center",
        padding: "32px 24px",
        gap: 28,
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center" }}>
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
            margin: "6px 0 0",
          }}
        >
          "THE BASICS" series — 1080 × 1080 px Instagram post
        </p>
      </div>

      {/* ── Export button ── */}
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

      {/* ── Canvas preview (scaled to viewport) ── */}
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
          <InfographicCanvas canvasRef={canvasRef} />
        </div>
      </div>

      {/* ── Dimension label ── */}
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

      {/* Spin keyframe for loader */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
