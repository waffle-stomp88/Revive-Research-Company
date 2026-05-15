import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Zap, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { GalaxyNode } from "@/lib/galaxy-layout";

interface GalaxyMobileSearchProps {
  nodes: GalaxyNode[];
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
  recentIds?: string[];
}

export function GalaxyMobileSearch({
  nodes,
  onSelect,
  open,
  onClose,
  recentIds = [],
}: GalaxyMobileSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const searchLower = searchTerm.trim().toLowerCase();
  const matches =
    searchLower.length === 0
      ? []
      : nodes
          .filter(
            (n) =>
              n.name.toLowerCase().includes(searchLower) ||
              n.id.toLowerCase().includes(searchLower) ||
              n.systemName.toLowerCase().includes(searchLower)
          )
          .slice(0, 8);

  // Nodes for the "Recent" section — resolve ids to full node objects
  const nodeById = (id: string) => nodes.find((n) => n.id === id);
  const recentNodes = recentIds
    .map(nodeById)
    .filter((n): n is GalaxyNode => !!n);

  const showRecent = searchLower.length === 0 && recentNodes.length > 0;

  // Focus the input when the modal opens, with a small delay to let the
  // animation settle before the keyboard pops so the layout shift is smooth.
  useEffect(() => {
    if (!open) return;
    setSearchTerm("");
    setActiveIdx(-1);
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setActiveIdx(-1);
  }, [searchTerm]);

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  function handleSelect(id: string) {
    onSelect(id);
    onClose();
    setSearchTerm("");
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && matches[activeIdx]) {
        e.preventDefault();
        handleSelect(matches[activeIdx].id);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  function handleBackdropPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only close when the user taps the dark backdrop, not the sheet itself
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="galaxy-mobile-search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onPointerDown={handleBackdropPointerDown}
          data-testid="galaxy-mobile-search-backdrop"
        >
          {/* Bottom sheet */}
          <motion.div
            key="galaxy-mobile-search-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-[#0d0d10] border-t border-white/10 shadow-2xl"
            data-testid="galaxy-mobile-search-sheet"
          >
            {/* Drag handle indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-2 pb-3">
              <span className="text-sm font-mono font-semibold text-white/80">
                Find a peptide
              </span>
              <span className="text-xs font-mono text-white/30 flex-1">
                — warp to it
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-white/50 hover:text-white flex-shrink-0"
                aria-label="Close search"
                data-testid="galaxy-mobile-search-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search input */}
            <div className="relative px-4 pb-3">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none z-10" />
              <Input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. BPC-157, TB-500, Healing…"
                className="h-12 pl-10 pr-10 text-base font-mono bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:border-[#21d8ff]/60 focus-visible:ring-0 rounded-xl"
                data-testid="galaxy-mobile-search-input"
                aria-label="Search peptides"
                aria-autocomplete="list"
                aria-expanded={matches.length > 0}
                role="combobox"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
              />
              {searchTerm && (
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setSearchTerm("");
                  }}
                  className="absolute right-7 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 z-10"
                  aria-label="Clear search"
                  data-testid="galaxy-mobile-search-clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results / Recent list */}
            <div className="pb-safe">
              {matches.length > 0 ? (
                <ul
                  ref={listRef}
                  role="listbox"
                  className="overflow-y-auto max-h-[40vh] border-t border-white/8 divide-y divide-white/5"
                  data-testid="galaxy-mobile-search-results"
                >
                  {matches.map((node, i) => (
                    <li
                      key={node.id}
                      role="option"
                      aria-selected={i === activeIdx}
                      onPointerDown={() => handleSelect(node.id)}
                      className={`flex items-center gap-4 px-4 py-4 cursor-pointer transition-colors active:bg-white/10 ${
                        i === activeIdx ? "bg-white/8" : ""
                      }`}
                      data-testid={`galaxy-mobile-search-result-${node.id}`}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/10"
                        style={{ backgroundColor: node.color }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-mono font-semibold text-white/90 truncate block">
                          {node.name}
                        </span>
                        <span className="text-xs font-mono text-white/40 truncate block">
                          {node.systemName}
                        </span>
                      </span>
                      <Zap
                        className="h-4 w-4 flex-shrink-0 opacity-50"
                        style={{ color: node.color }}
                      />
                    </li>
                  ))}
                </ul>
              ) : showRecent ? (
                <div
                  className="border-t border-white/8"
                  data-testid="galaxy-mobile-search-recent"
                >
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <Clock className="h-3 w-3 text-white/30" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/30">
                      Recent
                    </span>
                  </div>
                  <ul
                    role="listbox"
                    className="divide-y divide-white/5"
                    data-testid="galaxy-mobile-search-recent-list"
                  >
                    {recentNodes.map((node) => (
                      <li
                        key={node.id}
                        role="option"
                        onPointerDown={() => handleSelect(node.id)}
                        className="flex items-center gap-4 px-4 py-4 cursor-pointer transition-colors active:bg-white/10"
                        data-testid={`galaxy-mobile-search-recent-${node.id}`}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/10"
                          style={{ backgroundColor: node.color }}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="text-sm font-mono font-semibold text-white/90 truncate block">
                            {node.name}
                          </span>
                          <span className="text-xs font-mono text-white/40 truncate block">
                            {node.systemName}
                          </span>
                        </span>
                        <Zap
                          className="h-4 w-4 flex-shrink-0 opacity-40"
                          style={{ color: node.color }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : searchLower.length > 0 ? (
                <div className="px-4 py-6 text-center text-sm font-mono text-white/30 border-t border-white/8">
                  No peptides match "{searchTerm}"
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs font-mono text-white/20 border-t border-white/8">
                  Type to search across all peptides
                </div>
              )}

              {/* Safe-area spacer for home-indicator on iOS */}
              <div className="h-safe-bottom" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A floating search icon button shown in the bottom-right on mobile */
interface GalaxyMobileSearchTriggerProps {
  onClick: () => void;
  visible: boolean;
}

export function GalaxyMobileSearchTrigger({
  onClick,
  visible,
}: GalaxyMobileSearchTriggerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="galaxy-mobile-search-trigger"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-14 right-4 z-20"
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={onClick}
            aria-label="Search peptides"
            data-testid="button-galaxy-mobile-search"
            className="h-11 w-11 rounded-full bg-[#21d8ff]/15 border border-[#21d8ff]/30 text-[#21d8ff] hover:bg-[#21d8ff]/25 shadow-lg shadow-[#21d8ff]/10"
          >
            <Search className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
