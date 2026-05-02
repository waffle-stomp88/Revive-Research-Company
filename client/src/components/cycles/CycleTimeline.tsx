import { useMemo } from "react";
import type { ResearchNote } from "@shared/schema";

interface CycleTimelineProps {
  entries: ResearchNote[];
  startDate: Date;
  endDate: Date;
  accentColor: string;
}

export function CycleTimeline({
  entries,
  startDate,
  endDate,
  accentColor,
}: CycleTimelineProps) {
  const width = 600;
  const height = 60;
  const padX = 12;
  const padY = 16;

  const span = Math.max(1, endDate.getTime() - startDate.getTime());
  const usableW = width - padX * 2;
  const trackY = height / 2;

  const ticks = useMemo(() => {
    return entries
      .map((entry) => {
        const when = (entry.administeredAt ?? entry.createdAt) as unknown as
          | string
          | Date
          | null;
        if (!when) return null;
        const t = (typeof when === "string" ? new Date(when) : when).getTime();
        const ratio = (t - startDate.getTime()) / span;
        const clamped = Math.min(1, Math.max(0, ratio));
        return {
          id: entry.id,
          x: padX + clamped * usableW,
          marker: entry.cycleMarker,
        };
      })
      .filter((t): t is { id: string; x: number; marker: string | null } => t != null);
  }, [entries, startDate, endDate, span, usableW]);

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div
      className="w-full"
      data-testid="cycle-timeline"
      role="img"
      aria-label={`Timeline from ${fmt(startDate)} to ${fmt(endDate)} with ${entries.length} entries`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <rect
          x={padX}
          y={trackY - 6}
          width={usableW}
          height={12}
          rx={3}
          fill={accentColor}
          opacity={0.18}
        />
        <text x={padX} y={padY - 4} fill="currentColor" fontSize={10} opacity={0.7}>
          {fmt(startDate)}
        </text>
        <text
          x={width - padX}
          y={padY - 4}
          fill="currentColor"
          fontSize={10}
          opacity={0.7}
          textAnchor="end"
        >
          {fmt(endDate)}
        </text>
        {ticks.map((tick) => (
          <circle
            key={tick.id}
            cx={tick.x}
            cy={trackY}
            r={tick.marker ? 5 : 3.5}
            fill={accentColor}
            stroke={tick.marker ? "currentColor" : "none"}
            strokeWidth={tick.marker ? 1 : 0}
            data-testid={`tick-cycle-entry-${tick.id}`}
          />
        ))}
      </svg>
    </div>
  );
}
