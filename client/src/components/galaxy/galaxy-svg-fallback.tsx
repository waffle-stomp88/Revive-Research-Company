import { useMemo } from "react";
import { Link } from "wouter";
import { buildGalaxyLayout } from "@/lib/galaxy-layout";
import { BODY_SYSTEMS } from "@/data/body-systems";
import { KNOWN_STACKS } from "@/data/known-stacks";

export function GalaxySvgFallback() {
  const { nodes } = useMemo(() => buildGalaxyLayout(), []);

  // Project nodes to 2D using a simple isometric-like projection of (x, y)
  const SIZE = 800;
  const VIEW = 50;

  const project = (p: [number, number, number]): { x: number; y: number } => {
    const x = SIZE / 2 + (p[0] / VIEW) * (SIZE / 2);
    const y = SIZE / 2 + (p[1] / VIEW) * (SIZE / 2) - (p[2] / VIEW) * 30;
    return { x, y };
  };

  // Group nodes by system for the screen-reader list
  const grouped = useMemo(() => {
    const map: Record<string, typeof nodes> = {};
    for (const n of nodes) {
      if (!map[n.systemId]) map[n.systemId] = [];
      map[n.systemId].push(n);
    }
    return map;
  }, [nodes]);

  return (
    <div data-testid="galaxy-svg-fallback" className="w-full">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <h2 className="font-display text-2xl font-bold mb-2">
          Synergy Constellation Map
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          A static 2D version of the Synergy Galaxy. Each dot is a peptide,
          colored by its primary body system. Lines connect peptides that
          appear together in researched stacks.
        </p>

        <svg
          role="img"
          aria-label="Static 2D constellation map of peptides grouped by body system"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-auto rounded-lg border border-border bg-[#0d0d10]"
        >
          {/* edges first */}
          <g opacity="0.55">
            {(() => {
              const layout = buildGalaxyLayout();
              return layout.edges.map((e, i) => {
                const a = project(layout.nodes[e.fromIndex].position);
                const b = project(layout.nodes[e.toIndex].position);
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={e.fromColor}
                    strokeOpacity={Math.min(1, 0.3 + e.weight)}
                    strokeWidth={1}
                  />
                );
              });
            })()}
          </g>
          {/* nodes */}
          <g>
            {nodes.map((n) => {
              const p = project(n.position);
              const r = 4 + n.size * 4;
              return (
                <g key={n.id}>
                  <circle cx={p.x} cy={p.y} r={r} fill={n.color} opacity={0.95}>
                    <title>
                      {n.name} — {n.systemName}
                    </title>
                  </circle>
                  <text
                    x={p.x}
                    y={p.y - r - 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    opacity="0.85"
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Accessible list */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {BODY_SYSTEMS.map((sys) => {
            const list = grouped[sys.id];
            if (!list || list.length === 0) return null;
            return (
              <section
                key={sys.id}
                className="rounded-lg border border-border p-4 bg-card"
                data-testid={`fallback-system-${sys.id}`}
              >
                <h3
                  className="font-display text-lg font-semibold mb-2"
                  style={{ color: sys.color }}
                >
                  {sys.name}
                </h3>
                <ul className="space-y-2">
                  {list.map((n) => {
                    const stacks = KNOWN_STACKS.filter((s) =>
                      s.peptides.some(
                        (p) =>
                          p.toLowerCase().replace(/[^a-z0-9]/g, "") ===
                          n.id.toLowerCase().replace(/[^a-z0-9]/g, "")
                      )
                    );
                    return (
                      <li key={n.id} className="text-sm">
                        <Link
                          href={`/peptides/${n.slug}`}
                          className="font-medium hover:underline"
                          style={{ color: n.color }}
                        >
                          {n.name}
                        </Link>
                        {stacks.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {" — appears in "}
                            {stacks.map((s, i) => (
                              <span key={s.name}>
                                {s.detailPageId ? (
                                  <Link
                                    href={`/research-stacks/${s.detailPageId}`}
                                    className="hover:underline"
                                  >
                                    {s.name}
                                  </Link>
                                ) : (
                                  s.name
                                )}
                                {i < stacks.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
