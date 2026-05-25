import { motion, AnimatePresence } from "framer-motion";
import type { GalaxyNode } from "@/lib/galaxy-layout";

interface GalaxyHoverHUDProps {
  hoveredNode: GalaxyNode | null;
  hoveredScreenPos: { x: number; y: number } | null;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Targeting brackets drawn as SVG paths at the star's projected screen position.
 */
function TargetingBrackets({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  const gap = 14; // half-gap from center
  const arm = 8;
  const stroke = 1.5;

  return (
    <svg
      style={{
        position: "absolute",
        left: x - gap - arm - 2,
        top: y - gap - arm - 2,
        width: (gap + arm + 2) * 2,
        height: (gap + arm + 2) * 2,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {/* Top-left */}
      <path
        d={`M ${arm} ${gap + arm} L ${arm} ${arm} L ${gap + arm} ${arm}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="square"
      />
      {/* Top-right */}
      <path
        d={`M ${gap + arm} ${arm} L ${gap * 2 + arm} ${arm} L ${gap * 2 + arm} ${gap + arm}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="square"
      />
      {/* Bottom-left */}
      <path
        d={`M ${arm} ${gap + arm} L ${arm} ${gap * 2 + arm} L ${gap + arm} ${gap * 2 + arm}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="square"
      />
      {/* Bottom-right */}
      <path
        d={`M ${gap + arm} ${gap * 2 + arm} L ${gap * 2 + arm} ${gap * 2 + arm} L ${gap * 2 + arm} ${gap + arm}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="square"
      />
    </svg>
  );
}

export function GalaxyHoverHUD({
  hoveredNode,
  hoveredScreenPos,
  canvasWidth,
  canvasHeight,
}: GalaxyHoverHUDProps) {
  const hasPos = hoveredNode && hoveredScreenPos;
  const sx = hasPos ? hoveredScreenPos!.x : 0;
  const sy = hasPos ? hoveredScreenPos!.y : 0;

  // On portrait mobile (< 640px wide), move the telemetry panel to bottom-left
  // to avoid overlapping with the filter bar at the top
  const isPortraitMobile = canvasWidth > 0 && canvasWidth < 640;
  const telemetryStyle = isPortraitMobile
    ? {
        bottom: 90,
        left: 16,
        top: "auto",
        right: "auto",
      }
    : {
        top: 80,
        right: 16,
        bottom: "auto",
        left: "auto",
      };

  return (
    <>
      {/* Targeting brackets + floating tooltip at star screen position */}
      <AnimatePresence>
        {hoveredNode && hoveredScreenPos && (
          <motion.div
            key={hoveredNode.id + "-brackets"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 25,
            }}
          >
            <TargetingBrackets
              x={sx}
              y={sy}
              color={hoveredNode.color}
            />

            {/* Floating tooltip above brackets — hidden on portrait mobile to avoid clutter */}
            {!isPortraitMobile && (
              <div
                style={{
                  position: "absolute",
                  left: sx,
                  top: sy - 40,
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                  fontFamily: "monospace",
                  fontSize: "10px",
                  lineHeight: 1.4,
                  color: hoveredNode.color,
                  background: "rgba(0,0,0,0.7)",
                  border: `0.5px solid ${hoveredNode.color}66`,
                  padding: "3px 7px",
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  {hoveredNode.name}
                </span>
                <span style={{ color: "rgba(255,255,255,0.45)", margin: "0 4px" }}>·</span>
                <span>{hoveredNode.systemName}</span>
                {hoveredNode.synergyCount > 0 && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.45)", margin: "0 4px" }}>·</span>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      {hoveredNode.synergyCount} link{hoveredNode.synergyCount === 1 ? "" : "s"}
                    </span>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed telemetry panel — repositioned on portrait mobile */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            key={hoveredNode.id + "-telemetry"}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              zIndex: 30,
              pointerEvents: "none",
              fontFamily: "monospace",
              fontSize: "9px",
              lineHeight: 1.7,
              color: "#D4FF1F",
              background: "rgba(0,0,0,0.5)",
              border: "0.5px solid #D4FF1F",
              padding: "7px 10px",
              borderRadius: "2px",
              letterSpacing: "0.05em",
              minWidth: 130,
              ...telemetryStyle,
            }}
            data-testid="galaxy-hud-telemetry"
          >
            <div style={{ color: "#D4FF1F", fontWeight: 700 }}>▸ TARGETING</div>
            <div style={{ color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
              {hoveredNode.name.length > 16 ? hoveredNode.name.slice(0, 14) + "…" : hoveredNode.name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>
              SYS
              <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 4px" }}>·</span>
              <span style={{ color: hoveredNode.color }}>
                {hoveredNode.systemName.toUpperCase()}
              </span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>
              LINKS
              <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 4px" }}>·</span>
              <span style={{ color: "#fff" }}>{hoveredNode.synergyCount}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
