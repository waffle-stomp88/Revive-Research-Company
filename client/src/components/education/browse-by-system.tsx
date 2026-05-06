import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { BODY_SYSTEM_HUBS } from "@/data/body-system-hubs";
import { PEPTIDE_PATHWAYS } from "@/data/peptide-pathways";
import { resolvePrimarySystem } from "@/lib/peptide-systems";

// Compute counts once at module load — not inside the component
const SYSTEM_PEPTIDE_COUNTS: Record<string, number> = {};
for (const data of Object.values(PEPTIDE_PATHWAYS)) {
  const sys = resolvePrimarySystem(data.systems);
  SYSTEM_PEPTIDE_COUNTS[sys] = (SYSTEM_PEPTIDE_COUNTS[sys] ?? 0) + 1;
}

// Sanity check: sum should equal total peptide entries
if (import.meta.env.DEV) {
  const total = Object.values(SYSTEM_PEPTIDE_COUNTS).reduce((a, b) => a + b, 0);
  const expected = Object.keys(PEPTIDE_PATHWAYS).length;
  if (total !== expected) {
    console.warn(
      `[BrowseBySystem] SYSTEM_PEPTIDE_COUNTS sum (${total}) ≠ PEPTIDE_PATHWAYS count (${expected}). ` +
        "Some peptides may have an unrecognized system ID in resolvePrimarySystem()."
    );
  }
}

export const TOTAL_PEPTIDE_COUNT = Object.keys(PEPTIDE_PATHWAYS).length;

export function BrowseBySystem() {
  const visibleHubs = BODY_SYSTEM_HUBS.filter(
    (h) => (SYSTEM_PEPTIDE_COUNTS[h.slug] ?? 0) > 0
  );

  return (
    <section className="mb-10" data-testid="section-browse-by-system">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Browse by Body System</h2>
        <p className="text-sm text-muted-foreground">
          Explore all {TOTAL_PEPTIDE_COUNT} compounds organized by research application
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleHubs.map((hub) => {
          const Icon = hub.icon;
          const count = SYSTEM_PEPTIDE_COUNTS[hub.slug] ?? 0;

          return (
            <Link key={hub.slug} href={`/systems/${hub.slug}`}>
              <div
                className="hover-elevate rounded-lg border border-border bg-card p-5 cursor-pointer h-full flex flex-col gap-3"
                data-testid={`card-system-${hub.slug}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${hub.color}18` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: hub.color }} />
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs shrink-0 mt-0.5"
                    data-testid={`badge-count-${hub.slug}`}
                  >
                    {count} compound{count !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <span className="font-semibold text-sm leading-snug">
                    {hub.name}
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                    {hub.tagline}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
