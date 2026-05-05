import { useRef, useState, useEffect, useCallback } from "react";
import { Search, RotateCcw, X, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BODY_SYSTEMS } from "@/data/body-systems";
import type { GalaxyNode } from "@/lib/galaxy-layout";

interface GalaxyFilterBarProps {
  visibleSystems: Set<string>;
  toggleSystem: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onReset: () => void;
  nodes: GalaxyNode[];
  onWarpTo: (id: string) => void;
}

export function GalaxyFilterBar({
  visibleSystems,
  toggleSystem,
  searchTerm,
  setSearchTerm,
  onReset,
  nodes,
  onWarpTo,
}: GalaxyFilterBarProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const lower = searchTerm.trim().toLowerCase();
  const matches = lower.length === 0 ? [] : nodes
    .filter(
      (n) =>
        n.name.toLowerCase().includes(lower) ||
        n.id.toLowerCase().includes(lower) ||
        n.systemName.toLowerCase().includes(lower)
    )
    .slice(0, 8);

  const showDropdown = open && matches.length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchTerm]);

  const handleSelect = useCallback(
    (node: GalaxyNode) => {
      onWarpTo(node.id);
      setSearchTerm("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [onWarpTo, setSearchTerm]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && matches[activeIndex]) {
        e.preventDefault();
        handleSelect(matches[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[min(calc(100%-1rem),52rem)]"
      data-testid="galaxy-filter-bar"
    >
      <div className="rounded-xl bg-background/75 backdrop-blur-xl border border-border shadow-lg px-3 py-2.5 md:px-4 md:py-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search with autocomplete */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
            <Input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={handleKeyDown}
              placeholder="Search peptide — press Enter or click to warp"
              className="h-9 pl-8 pr-8 text-sm"
              data-testid="galaxy-search-input"
              aria-label="Search the synergy galaxy"
              aria-autocomplete="list"
              aria-expanded={showDropdown}
              role="combobox"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(""); setOpen(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                aria-label="Clear search"
                data-testid="galaxy-search-clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showDropdown && (
              <ul
                ref={listRef}
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+4px)] rounded-lg bg-background/95 backdrop-blur-xl border border-border shadow-xl overflow-hidden z-30"
              >
                {matches.map((node, i) => (
                  <li
                    key={node.id}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={() => handleSelect(node)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                      i === activeIndex
                        ? "bg-accent/60"
                        : "hover:bg-accent/30"
                    }`}
                    data-testid={`galaxy-search-result-${node.id}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: node.color }}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">
                        {node.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {node.systemName}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Zap className="h-3 w-3" style={{ color: node.color }} />
                      warp
                    </span>
                  </li>
                ))}
              </ul>
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
