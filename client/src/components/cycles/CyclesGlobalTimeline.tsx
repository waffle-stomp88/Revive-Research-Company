import { useMemo, useState, useRef } from "react";
import type { ResearchNote } from "@shared/schema";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface GlobalTimelineCycle {
  compoundKey: string;
  startEntryId: string;
  compoundLabel: string;
  displayName: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed";
  totalDoses: number;
  averageDose: number | null;
  averageDoseUnit: string | null;
  dosesPerWeek: number | null;
  entries: ResearchNote[];
}

interface CyclesGlobalTimelineProps {
  cycles: GlobalTimelineCycle[];
  activeColor: string;
  onSelect: (cycle: GlobalTimelineCycle) => void;
}

const COMPOUND_PALETTE = [
  "#21d8ff",
  "#9d4edd",
  "#f97316",
  "#22c55e",
  "#ec4899",
  "#facc15",
  "#06b6d4",
  "#a78bfa",
  "#f43f5e",
  "#10b981",
];

function colorForCompound(compoundKey: string): string {
  let hash = 0;
  for (let i = 0; i < compoundKey.length; i++) {
    hash = (hash * 31 + compoundKey.charCodeAt(i)) | 0;
  }
  return COMPOUND_PALETTE[Math.abs(hash) % COMPOUND_PALETTE.length];
}

interface HoverState {
  cycle: GlobalTimelineCycle;
  x: number;
  y: number;
}

function fmtDateShort(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildAxisTicks(start: Date, end: Date): Date[] {
  const span = end.getTime() - start.getTime();
  const days = span / MS_PER_DAY;
  const targetTicks = 6;
  let stepDays = Math.max(1, Math.round(days / targetTicks));
  if (days > 180) stepDays = Math.round(days / targetTicks / 30) * 30 || 30;
  else if (days > 60) stepDays = Math.round(days / targetTicks / 7) * 7 || 7;

  const ticks: Date[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += stepDays * MS_PER_DAY) {
    ticks.push(new Date(t));
  }
  if (ticks.length === 0 || ticks[ticks.length - 1].getTime() < end.getTime()) {
    ticks.push(end);
  }
  return ticks;
}

export function CyclesGlobalTimeline({
  cycles,
  activeColor,
  onSelect,
}: CyclesGlobalTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const { domainStart, domainEnd, rows } = useMemo(() => {
    if (cycles.length === 0) {
      const now = new Date();
      return {
        domainStart: now,
        domainEnd: now,
        rows: [] as GlobalTimelineCycle[],
      };
    }
    let minT = Infinity;
    let maxT = -Infinity;
    for (const c of cycles) {
      minT = Math.min(minT, c.startDate.getTime());
      maxT = Math.max(maxT, c.endDate.getTime());
    }
    if (minT === maxT) {
      minT -= MS_PER_DAY;
      maxT += MS_PER_DAY;
    } else {
      const pad = (maxT - minT) * 0.04;
      minT -= pad;
      maxT += pad;
    }
    const sortedRows = [...cycles].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
    return {
      domainStart: new Date(minT),
      domainEnd: new Date(maxT),
      rows: sortedRows,
    };
  }, [cycles]);

  const width = 1000;
  const padL = 96;
  const padR = 24;
  const padTop = 24;
  const rowH = 32;
  const rowGap = 8;
  const axisH = 28;
  const usableW = width - padL - padR;
  const span = Math.max(1, domainEnd.getTime() - domainStart.getTime());
  const height = padTop + rows.length * (rowH + rowGap) + axisH;

  const xFor = (t: number) => padL + ((t - domainStart.getTime()) / span) * usableW;
  const axisTicks = useMemo(
    () => buildAxisTicks(domainStart, domainEnd),
    [domainStart, domainEnd],
  );

  const today = useMemo(() => new Date(), []);
  const showToday =
    today.getTime() >= domainStart.getTime() && today.getTime() <= domainEnd.getTime();

  if (cycles.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      data-testid="cycles-global-timeline"
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {axisTicks.map((tick, i) => {
          const x = xFor(tick.getTime());
          return (
            <g key={`gridline-${i}`} opacity={0.18}>
              <line
                x1={x}
                x2={x}
                y1={padTop - 4}
                y2={height - axisH + 4}
                stroke="currentColor"
                strokeDasharray="2 4"
              />
            </g>
          );
        })}

        {showToday && (
          <line
            x1={xFor(today.getTime())}
            x2={xFor(today.getTime())}
            y1={padTop - 4}
            y2={height - axisH + 4}
            stroke={activeColor}
            strokeWidth={1.5}
            opacity={0.55}
            data-testid="line-today"
          />
        )}

        {rows.map((cycle, i) => {
          const y = padTop + i * (rowH + rowGap);
          const x1 = xFor(cycle.startDate.getTime());
          const x2 = xFor(cycle.endDate.getTime());
          const w = Math.max(4, x2 - x1);
          const color = colorForCompound(cycle.compoundKey);
          const isHovered = hover?.cycle.startEntryId === cycle.startEntryId;
          const isCompleted = cycle.status === "completed";

          return (
            <g
              key={`row-${cycle.compoundKey}-${cycle.startEntryId}`}
              data-testid={`row-cycle-${cycle.compoundKey}-${cycle.startEntryId}`}
            >
              <text
                x={padL - 8}
                y={y + rowH / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fill="currentColor"
                opacity={0.85}
              >
                {cycle.compoundLabel.length > 14
                  ? cycle.compoundLabel.slice(0, 13) + "…"
                  : cycle.compoundLabel}
              </text>

              <rect
                x={padL}
                y={y + rowH / 2 - 1}
                width={usableW}
                height={2}
                fill="currentColor"
                opacity={0.06}
              />

              <rect
                x={x1}
                y={y + 4}
                width={w}
                height={rowH - 8}
                rx={4}
                fill={color}
                opacity={isCompleted ? (isHovered ? 0.7 : 0.45) : (isHovered ? 0.98 : 0.85)}
                stroke={isCompleted ? color : "none"}
                strokeWidth={isCompleted ? 1.5 : 0}
                strokeDasharray={isCompleted ? "3 2" : undefined}
                style={{ cursor: "pointer", transition: "opacity 120ms" }}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  setHover({
                    cycle,
                    x: rect ? e.clientX - rect.left : e.clientX,
                    y: rect ? e.clientY - rect.top : e.clientY,
                  });
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  setHover({
                    cycle,
                    x: rect ? e.clientX - rect.left : e.clientX,
                    y: rect ? e.clientY - rect.top : e.clientY,
                  });
                }}
                onClick={() => onSelect(cycle)}
                data-testid={`bar-cycle-${cycle.compoundKey}-${cycle.startEntryId}`}
              />

              {cycle.entries.map((entry) => {
                const when = (entry.administeredAt ?? entry.createdAt) as
                  | Date
                  | string
                  | null;
                if (!when) return null;
                const t = (typeof when === "string" ? new Date(when) : when).getTime();
                const ex = xFor(t);
                if (ex < padL || ex > width - padR) return null;
                return (
                  <circle
                    key={`tick-${entry.id}`}
                    cx={ex}
                    cy={y + rowH / 2}
                    r={2.2}
                    fill="white"
                    opacity={0.85}
                  />
                );
              })}
            </g>
          );
        })}

        <line
          x1={padL}
          x2={width - padR}
          y1={height - axisH + 6}
          y2={height - axisH + 6}
          stroke="currentColor"
          opacity={0.25}
        />
        {axisTicks.map((tick, i) => {
          const x = xFor(tick.getTime());
          return (
            <g key={`axis-${i}`}>
              <line
                x1={x}
                x2={x}
                y1={height - axisH + 6}
                y2={height - axisH + 10}
                stroke="currentColor"
                opacity={0.45}
              />
              <text
                x={x}
                y={height - axisH + 22}
                fontSize={10}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.65}
              >
                {fmtDateShort(tick)}
              </text>
            </g>
          );
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
          style={{
            left: Math.min(hover.x + 12, (containerRef.current?.clientWidth ?? 0) - 220),
            top: Math.max(0, hover.y - 70),
            minWidth: 180,
          }}
          data-testid="tooltip-cycle"
        >
          <p className="font-semibold text-sm">{hover.cycle.displayName}</p>
          <p className="text-muted-foreground mt-0.5">
            {hover.cycle.compoundLabel}
          </p>
          <p className="mt-1.5">
            {fmtDate(hover.cycle.startDate)} — {fmtDate(hover.cycle.endDate)}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-muted-foreground">Doses:</span>
            <span className="font-medium">{hover.cycle.totalDoses}</span>
            {hover.cycle.dosesPerWeek != null && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium">
                  {hover.cycle.dosesPerWeek.toFixed(1)}/wk
                </span>
              </>
            )}
          </div>
          {hover.cycle.averageDose != null && hover.cycle.averageDoseUnit && (
            <p className="mt-0.5 text-muted-foreground">
              Avg {hover.cycle.averageDose.toFixed(1)} {hover.cycle.averageDoseUnit}
            </p>
          )}
          <p className="mt-1.5 text-[10px] text-muted-foreground">Click to inspect entries</p>
        </div>
      )}
    </div>
  );
}
