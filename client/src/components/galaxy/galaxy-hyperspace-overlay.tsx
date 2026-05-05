import { useLayoutEffect, useRef } from "react";

interface Props {
  isActive: boolean;
  totalDurationMs: number;
}

const N = 520; // dense starfield

interface Star {
  angle: number;
  /** where this star sits before the jump — tail stays anchored here */
  originFrac: number;
  speed: number;
  width: number;
  /** very slight blue tint on ~30% of stars */
  blue: boolean;
  phase: number;
}

function buildStars(): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < N; i++) {
    out.push({
      angle: Math.random() * Math.PI * 2,
      // bias toward center — stars in the field of view cluster there
      originFrac: Math.pow(Math.random(), 0.55) * 0.30,
      speed: 0.6 + Math.random() * 0.8,
      width: 0.3 + Math.random() * 1.4,
      blue: Math.random() < 0.28,
      phase: Math.random() * 0.10,
    });
  }
  return out;
}

export function GalaxyHyperspaceOverlay({ isActive, totalDurationMs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const startRef  = useRef<number>(0);
  const starsRef  = useRef<Star[]>(buildStars());

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!isActive) {
      cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    startRef.current = performance.now();

    const render = (now: number) => {
      // NOTE: render is also called synchronously below (frame 0) to ensure the
      // white flash paints before the first rAF tick, closing the one-frame gap
      // where the canvas is transparent and the 3D galaxy bleeds through.
      const p = Math.min(1, (now - startRef.current) / totalDurationMs);

      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy) * 1.08;

      // ── Phase envelope ───────────────────────────────────────────────────
      // 0–5%   : white jump-flash (the "snap to hyperspace" moment)
      // 5–15%  : flash fades, dark tunnel + long streaks appear
      // 15–65% : sustained hyperspace — full bright streaks
      // 65–100%: decelerate, fade out, galaxy materialises

      const flashAmt  = p < 0.05 ? 1 - p / 0.05 : 0;            // 1→0 in first 5%
      const rampIn    = p < 0.15 ? (p - 0.05) / 0.10 : 1.0;     // 0→1 between 5–15%
      const fadeOut   = p > 0.65 ? 1 - (p - 0.65) / 0.35 : 1.0; // 1→0 between 65–100%
      const intensity = Math.max(0, Math.min(1, rampIn * fadeOut));

      ctx.clearRect(0, 0, w, h);

      // ── 1. Jump flash — bright white snap ─────────────────────────────────
      if (flashAmt > 0.001) {
        ctx.fillStyle = `rgba(255,255,255,${flashAmt.toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }

      // ── 2. Dark space — hides static 3-D starfield ────────────────────────
      // We ARE in the tunnel; the scene behind us disappears.
      if (intensity > 0.005) {
        ctx.fillStyle = `rgba(0,0,4,${Math.min(1, intensity * 1.06).toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }

      // ── 3. Star streaks — the core Star-Wars effect ───────────────────────
      // TAIL is anchored at the star's original position (where it was a dot).
      // HEAD rockets outward toward the screen edge.
      // The growing gap between tail and head IS the stretch.
      if (intensity > 0.005) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const dpr   = window.devicePixelRatio;
        const stars = starsRef.current;

        for (let i = 0; i < stars.length; i++) {
          const s  = stars[i];
          const lp = Math.max(0, Math.min(1, (p - s.phase) / (1 - s.phase)));
          if (lp <= 0) continue;

          const warpLp = Math.pow(lp * s.speed, 0.40); // fast initial acceleration

          // HEAD rushes from origin toward screen edge
          const headFrac = s.originFrac + (1 - s.originFrac) * warpLp;
          // TAIL stays at origin — this anchors the "dot before jump"
          // Tiny drift so very short streaks don't look static
          const tailFrac = s.originFrac * (1 - warpLp * 0.25);

          const headR = Math.min(maxR, headFrac * maxR);
          const tailR = tailFrac * maxR;

          if (headR - tailR < 0.5) continue; // skip degenerate

          const cosA = Math.cos(s.angle);
          const sinA = Math.sin(s.angle);

          const x1 = cx + cosA * tailR;
          const y1 = cy + sinA * tailR;
          const x2 = cx + cosA * headR;
          const y2 = cy + sinA * headR;

          // Colour: white with optional faint blue shimmer (Star Wars look)
          const r = s.blue ? 200 : 255;
          const g = s.blue ? 220 : 255;
          const b = 255;

          // Brightness ramps with intensity and how stretched the streak is
          const stretchFrac = Math.min(1, (headFrac - tailFrac) / 0.25);
          const alpha = intensity * Math.min(1, 0.55 + 0.55 * stretchFrac);

          const sg = ctx.createLinearGradient(x1, y1, x2, y2);
          sg.addColorStop(0,    `rgba(${r},${g},${b},0)`);
          sg.addColorStop(0.3,  `rgba(${r},${g},${b},${(alpha * 0.20).toFixed(3)})`);
          sg.addColorStop(1,    `rgba(${r},${g},${b},${alpha.toFixed(3)})`);

          ctx.lineWidth   = s.width * dpr;
          ctx.lineCap     = "round";
          ctx.strokeStyle = sg;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();

        // ── 4. Vanishing-point glow — bright core of the tunnel ─────────────
        // The star you're hurtling toward, contracting as you arrive.
        const dotR = Math.min(w, h) * 0.04 * (0.3 + 0.7 * fadeOut);
        if (dotR > 0.5) {
          const dot = ctx.createRadialGradient(cx, cy, 0, cx, cy, dotR);
          dot.addColorStop(0,   `rgba(255,255,255,${(0.90 * intensity).toFixed(3)})`);
          dot.addColorStop(0.5, `rgba(200,225,255,${(0.40 * intensity).toFixed(3)})`);
          dot.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = dot;
          ctx.beginPath();
          ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
          ctx.fill();
        }

        // ── 5. Subtle edge vignette ──────────────────────────────────────────
        const vig = ctx.createRadialGradient(cx, cy, maxR * 0.6, cx, cy, maxR);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, `rgba(0,0,8,${(0.55 * intensity).toFixed(3)})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Paint frame 0 synchronously so the white flash covers the canvas before
    // the browser composites the next frame — prevents one-frame galaxy bleed.
    // render() already self-schedules via requestAnimationFrame(render) when p < 1,
    // so no separate rAF call is needed here; the loop starts inside render itself.
    render(performance.now());
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [isActive, totalDurationMs]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 15,
      }}
    />
  );
}
