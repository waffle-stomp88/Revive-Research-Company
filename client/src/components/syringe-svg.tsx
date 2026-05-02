import { motion } from "framer-motion";

interface SyringeSVGProps {
  fillUnits: number;
  maxUnits: number;
  className?: string;
  highlightColor?: string;
  liquidColor?: string;
}

export function SyringeSVG({
  fillUnits,
  maxUnits,
  className = "",
  highlightColor = "#E7FB10",
  liquidColor = "#21d8ff",
}: SyringeSVGProps) {
  const clampedUnits = Math.max(0, Math.min(fillUnits, maxUnits));
  const fillPct = clampedUnits / maxUnits;

  const barrelX = 80;
  const barrelY = 60;
  const barrelW = 540;
  const barrelH = 60;

  const tickStep = barrelW / maxUnits;
  const ticks: { x: number; major: boolean; label?: number }[] = [];
  for (let i = 0; i <= maxUnits; i++) {
    const major = i % 10 === 0;
    const semi = i % 5 === 0;
    if (major || semi) {
      ticks.push({
        x: barrelX + i * tickStep,
        major,
        label: major ? i : undefined,
      });
    }
  }

  const fillW = barrelW * fillPct;
  const plungerX = barrelX + barrelW + 6;
  const plungerOffset = (1 - fillPct) * (barrelW * 0.55);

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox="0 0 800 200"
        className="w-full h-auto"
        role="img"
        aria-label={`Insulin syringe drawn to ${fillUnits.toFixed(1)} units of ${maxUnits} maximum`}
        data-testid="svg-syringe"
      >
        <defs>
          <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.95" />
            <stop offset="50%" stopColor={liquidColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="barrelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1f1f25" />
            <stop offset="50%" stopColor="#0d0d10" />
            <stop offset="100%" stopColor="#1f1f25" />
          </linearGradient>
          <radialGradient id="markGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={highlightColor} stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Needle */}
        <line x1="20" y1="90" x2="80" y2="90" stroke="#9ca3af" strokeWidth="2" />
        <polygon points="20,88 8,90 20,92" fill="#9ca3af" />
        {/* Needle hub */}
        <rect x="68" y="78" width="14" height="24" rx="3" fill="#3a3a42" stroke="#52525b" strokeWidth="0.8" />

        {/* Barrel outline */}
        <rect
          x={barrelX}
          y={barrelY}
          width={barrelW}
          height={barrelH}
          rx="6"
          fill="url(#barrelGrad)"
          stroke="#3a3a42"
          strokeWidth="1.5"
        />

        {/* Animated liquid fill */}
        <motion.rect
          x={barrelX}
          y={barrelY + 1}
          height={barrelH - 2}
          rx="5"
          fill="url(#liquidGrad)"
          initial={{ width: 0 }}
          animate={{ width: fillW }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={t.x}
              y1={barrelY}
              x2={t.x}
              y2={barrelY + (t.major ? 14 : 9)}
              stroke="#9ca3af"
              strokeWidth={t.major ? 1.4 : 0.8}
              opacity={t.major ? 0.95 : 0.65}
            />
            <line
              x1={t.x}
              y1={barrelY + barrelH - (t.major ? 14 : 9)}
              x2={t.x}
              y2={barrelY + barrelH}
              stroke="#9ca3af"
              strokeWidth={t.major ? 1.4 : 0.8}
              opacity={t.major ? 0.95 : 0.65}
            />
            {t.label !== undefined && (
              <text
                x={t.x}
                y={barrelY - 8}
                fontSize="11"
                fill="#a1a1aa"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {t.label}
              </text>
            )}
          </g>
        ))}

        {/* Glow at fill mark */}
        {clampedUnits > 0 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          >
            <circle
              cx={barrelX + fillW}
              cy={barrelY + barrelH / 2}
              r="40"
              fill="url(#markGlow)"
            />
            <line
              x1={barrelX + fillW}
              y1={barrelY - 18}
              x2={barrelX + fillW}
              y2={barrelY + barrelH + 18}
              stroke={highlightColor}
              strokeWidth="2"
              filter="url(#softGlow)"
            />
            <text
              x={barrelX + fillW}
              y={barrelY + barrelH + 36}
              fontSize="14"
              fill={highlightColor}
              textAnchor="middle"
              fontFamily="monospace"
              fontWeight="bold"
            >
              DRAW HERE
            </text>
          </motion.g>
        )}

        {/* Plunger rod (animated) */}
        <motion.g
          initial={{ x: barrelW * 0.55 }}
          animate={{ x: plungerOffset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <rect
            x={plungerX - 4}
            y={barrelY + 18}
            width={4}
            height={24}
            fill="#52525b"
          />
          <rect
            x={plungerX}
            y={barrelY + 8}
            width={120}
            height={44}
            rx="3"
            fill="#1f1f25"
            stroke="#3a3a42"
            strokeWidth="1"
          />
          <rect
            x={plungerX + 110}
            y={barrelY - 4}
            width={14}
            height={68}
            rx="3"
            fill="#3a3a42"
          />
        </motion.g>

        {/* Top label scale (mL) */}
        <text
          x={barrelX + barrelW / 2}
          y={barrelY + barrelH + 56}
          fontSize="10"
          fill="#71717a"
          textAnchor="middle"
          fontFamily="monospace"
        >
          UNITS · 1 unit = 0.01 mL · {maxUnits}u syringe
        </text>
      </svg>
    </div>
  );
}
