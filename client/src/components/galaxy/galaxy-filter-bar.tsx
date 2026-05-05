import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BODY_SYSTEMS } from "@/data/body-systems";

interface GalaxyFilterBarProps {
  visibleSystems: Set<string>;
  toggleSystem: (id: string) => void;
  onReset: () => void;
}

export function GalaxyFilterBar({
  visibleSystems,
  toggleSystem,
  onReset,
}: GalaxyFilterBarProps) {
  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[min(calc(100%-1rem),52rem)]"
      data-testid="galaxy-filter-bar"
    >
      <div className="rounded-xl bg-background/75 backdrop-blur-xl border border-border shadow-lg px-3 py-2.5 md:px-4 md:py-3">
        <div className="flex flex-row items-center gap-3 flex-wrap">
          {/* System toggles */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
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
            className="h-9 gap-1.5 flex-shrink-0"
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
