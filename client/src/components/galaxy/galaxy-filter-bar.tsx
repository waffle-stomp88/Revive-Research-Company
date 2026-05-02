import { Search, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BODY_SYSTEMS } from "@/data/body-systems";

interface GalaxyFilterBarProps {
  visibleSystems: Set<string>;
  toggleSystem: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onReset: () => void;
}

export function GalaxyFilterBar({
  visibleSystems,
  toggleSystem,
  searchTerm,
  setSearchTerm,
  onReset,
}: GalaxyFilterBarProps) {
  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[min(calc(100%-1rem),52rem)]"
      data-testid="galaxy-filter-bar"
    >
      <div className="rounded-xl bg-background/75 backdrop-blur-xl border border-border shadow-lg px-3 py-2.5 md:px-4 md:py-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search peptide, pathway, or system..."
              className="h-9 pl-8 pr-8 text-sm"
              data-testid="galaxy-search-input"
              aria-label="Search the synergy galaxy"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
                data-testid="galaxy-search-clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* System toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {BODY_SYSTEMS.map((sys) => {
              const isOn = visibleSystems.has(sys.id);
              return (
                <button
                  key={sys.id}
                  onClick={() => toggleSystem(sys.id)}
                  className={`px-2.5 h-8 rounded-md text-xs font-medium border transition-all hover-elevate ${
                    isOn ? "" : "opacity-40"
                  }`}
                  style={{
                    backgroundColor: isOn ? `${sys.color}1f` : "transparent",
                    borderColor: isOn ? `${sys.color}66` : "hsl(var(--border))",
                    color: isOn ? sys.color : undefined,
                  }}
                  data-testid={`galaxy-filter-${sys.id}`}
                  aria-pressed={isOn}
                >
                  {sys.name}
                </button>
              );
            })}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="h-9 gap-1.5"
            data-testid="galaxy-reset-view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
