import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Product, ResearchNote } from "@shared/schema";
import { computeCycleStats } from "@shared/cycle-detection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Activity,
  Check,
  Download,
  Pencil,
  X,
  History,
  BookMarked,
  Clock,
  Repeat,
  Syringe,
} from "lucide-react";
import { CycleTimeline } from "./CycleTimeline";
import {
  CyclesGlobalTimeline,
  type GlobalTimelineCycle,
} from "./CyclesGlobalTimeline";
import { generateCyclePDF } from "@/lib/cycle-report-pdf";

const ACTIVE_COLOR = "#21d8ff";
const COMPLETED_COLOR = "#9d4edd";
const COMPOUND_TAG_PREFIX = "compound:";

interface ApiCycle {
  compoundKey: string;
  compoundLabel: string | null;
  startEntryId: string;
  endEntryId: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
  entryIds: string[];
  totalDoses: number;
  tagId: string | null;
  name: string | null;
}

interface ApiCyclesResponse {
  cycles: ApiCycle[];
  totalLogbookEntries: number;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function entryTimestamp(entry: ResearchNote): Date {
  const raw = (entry.administeredAt ?? entry.createdAt) as
    | string
    | Date
    | null;
  return raw ? new Date(raw as string | Date) : new Date(0);
}

function sortEntriesAsc(list: ResearchNote[]): ResearchNote[] {
  return [...list].sort(
    (a, b) => entryTimestamp(a).getTime() - entryTimestamp(b).getTime(),
  );
}

function fmtDateTime(d: Date): string {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtRelative(d: Date, now: Date = new Date()): string {
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function getEntryCompoundLabel(entry: ResearchNote, productMap: Map<string, Product>): string {
  if (entry.productId && productMap.has(entry.productId)) {
    return productMap.get(entry.productId)!.name;
  }
  const tag = (entry.tags ?? []).find((t) =>
    typeof t === "string" && t.toLowerCase().startsWith(COMPOUND_TAG_PREFIX),
  );
  if (tag) return tag.slice(COMPOUND_TAG_PREFIX.length);
  return "Unknown compound";
}

function getEntryProduct(
  entry: ResearchNote,
  productMap: Map<string, Product>,
): Product | null {
  if (entry.productId && productMap.has(entry.productId)) {
    return productMap.get(entry.productId)!;
  }
  return null;
}

function defaultCycleName(cycle: ApiCycle, label: string): string {
  return `${label} · ${fmtDate(new Date(cycle.startDate))}`;
}

interface CycleCardProps {
  cycle: ApiCycle;
  entries: ResearchNote[];
  compoundLabel: string;
  compoundImageUrl: string | null;
  variant: "active" | "completed";
}

function CycleCard({
  cycle,
  entries,
  compoundLabel,
  compoundImageUrl,
  variant,
}: CycleCardProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(cycle.name ?? "");

  const cycleEntries = useMemo(
    () => sortEntriesAsc(entries.filter((e) => cycle.entryIds.includes(e.id))),
    [entries, cycle.entryIds],
  );

  const stats = useMemo(() => {
    const detected = {
      compoundKey: cycle.compoundKey,
      compoundLabel: cycle.compoundLabel,
      startEntryId: cycle.startEntryId,
      endEntryId: cycle.endEntryId,
      entries: cycleEntries.map((e) => ({
        ...e,
        administeredAt: e.administeredAt as unknown as Date | null,
        createdAt: e.createdAt as unknown as Date | null,
      })),
      startDate: new Date(cycle.startDate),
      endDate: new Date(cycle.endDate),
      status: cycle.status,
    } as const;
    return computeCycleStats(detected);
  }, [cycle, cycleEntries]);

  const saveTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("PATCH", "/api/cycles/tag", {
        compoundKey: cycle.compoundKey,
        cycleStartTimestamp: cycle.startDate,
        name,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cycles"] });
      toast({ title: "Saved", description: "Cycle name updated." });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not rename cycle",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const clearTagMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cycles/tag/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cycles"] });
      toast({ title: "Reset", description: "Cycle name cleared." });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not clear cycle name",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.endDate);
  const accent = variant === "active" ? ACTIVE_COLOR : COMPLETED_COLOR;
  const displayName = cycle.name ?? defaultCycleName(cycle, compoundLabel);

  const lastEntry = cycleEntries[cycleEntries.length - 1] ?? null;
  const lastDoseAt = lastEntry ? entryTimestamp(lastEntry) : null;

  const dosePresentation = (() => {
    if (stats.averageDose != null && stats.averageDoseUnit) {
      const dosePart = `${stats.averageDose.toFixed(1)} ${stats.averageDoseUnit}`;
      if (stats.dosesPerWeek != null) {
        return `${dosePart} × ${stats.dosesPerWeek.toFixed(1)}/wk`;
      }
      return dosePart;
    }
    return null;
  })();

  const onExportPdf = () => {
    try {
      const blob = generateCyclePDF({
        cycleName: displayName,
        compoundLabel,
        startDate,
        endDate,
        status: cycle.status,
        totalDoses: stats.totalDoses,
        daysRunning: stats.daysRunning,
        averageDose: stats.averageDose,
        averageDoseUnit: stats.averageDoseUnit,
        dosesPerWeek: stats.dosesPerWeek,
        entries: cycleEntries,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cycle-${displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: "PDF export failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = () => {
    setDraftName(cycle.name ?? defaultCycleName(cycle, compoundLabel));
    setEditing(true);
  };

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    saveTagMutation.mutate(trimmed);
  };

  const handleClearName = () => {
    if (cycle.tagId) {
      clearTagMutation.mutate(cycle.tagId);
    } else {
      setEditing(false);
    }
  };

  return (
    <Card data-testid={`card-cycle-${cycle.compoundKey}-${cycle.startEntryId}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center"
              data-testid={`img-compound-${cycle.compoundKey}-${cycle.startEntryId}`}
            >
              {compoundImageUrl ? (
                <img
                  src={compoundImageUrl}
                  alt={compoundLabel}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Syringe className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="max-w-sm"
                    placeholder="Name this cycle"
                    data-testid={`input-cycle-name-${cycle.compoundKey}-${cycle.startEntryId}`}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={saveTagMutation.isPending || !draftName.trim()}
                    data-testid={`button-save-cycle-name-${cycle.compoundKey}-${cycle.startEntryId}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    data-testid={`button-cancel-cycle-name-${cycle.compoundKey}-${cycle.startEntryId}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {cycle.tagId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearName}
                      disabled={clearTagMutation.isPending}
                      data-testid={`button-clear-cycle-name-${cycle.compoundKey}-${cycle.startEntryId}`}
                    >
                      Reset to default
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle
                    className="text-lg"
                    data-testid={`text-cycle-name-${cycle.compoundKey}-${cycle.startEntryId}`}
                  >
                    {displayName}
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleStartEdit}
                    data-testid={`button-edit-cycle-name-${cycle.compoundKey}-${cycle.startEntryId}`}
                    aria-label="Rename cycle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <CardDescription className="mt-1">
                {compoundLabel} · {fmtDate(startDate)} — {fmtDate(endDate)}
                {variant === "completed" && (
                  <>
                    {" "}· {stats.daysRunning}{" "}
                    {stats.daysRunning === 1 ? "day total" : "days total"}
                  </>
                )}
              </CardDescription>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {lastDoseAt && (
                  <span
                    className="inline-flex items-center gap-1"
                    data-testid={`text-last-dose-${cycle.startEntryId}`}
                  >
                    <Clock className="h-3 w-3" />
                    Last dose {fmtRelative(lastDoseAt)} · {fmtDateTime(lastDoseAt)}
                  </span>
                )}
                {dosePresentation && (
                  <span
                    className="inline-flex items-center gap-1"
                    data-testid={`text-dose-frequency-${cycle.startEntryId}`}
                  >
                    <Repeat className="h-3 w-3" />
                    {dosePresentation}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={variant === "active" ? "default" : "secondary"}
              data-testid={`badge-cycle-status-${cycle.compoundKey}-${cycle.startEntryId}`}
            >
              {variant === "active" ? "Active" : "Completed"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={onExportPdf}
              className="gap-1.5"
              data-testid={`button-export-cycle-${cycle.compoundKey}-${cycle.startEntryId}`}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Doses" value={String(stats.totalDoses)} testId={`stat-doses-${cycle.startEntryId}`} />
          <Stat label="Days running" value={String(stats.daysRunning)} testId={`stat-days-${cycle.startEntryId}`} />
          <Stat
            label="Avg dose"
            value={
              stats.averageDose != null && stats.averageDoseUnit
                ? `${stats.averageDose.toFixed(1)} ${stats.averageDoseUnit}`
                : "—"
            }
            testId={`stat-avg-${cycle.startEntryId}`}
          />
          <Stat
            label="Doses/week"
            value={stats.dosesPerWeek != null ? stats.dosesPerWeek.toFixed(1) : "—"}
            testId={`stat-frequency-${cycle.startEntryId}`}
          />
        </div>
        <div className="text-foreground">
          <CycleTimeline
            entries={cycleEntries}
            startDate={startDate}
            endDate={endDate}
            accentColor={accent}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-base font-semibold mt-0.5" data-testid={testId}>
        {value}
      </p>
    </div>
  );
}

interface CycleEntriesPanelProps {
  cycle: GlobalTimelineCycle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productMap: Map<string, Product>;
}

function CycleEntriesPanel({ cycle, open, onOpenChange, productMap }: CycleEntriesPanelProps) {
  const sortedEntries = useMemo(() => {
    if (!cycle) return [];
    return sortEntriesAsc(cycle.entries).reverse();
  }, [cycle]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-lg w-full overflow-y-auto"
        data-testid="sheet-cycle-entries"
      >
        {cycle && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle data-testid="text-panel-cycle-name">
                  {cycle.displayName}
                </SheetTitle>
                <Badge variant={cycle.status === "active" ? "default" : "secondary"}>
                  {cycle.status === "active" ? "Active" : "Completed"}
                </Badge>
              </div>
              <SheetDescription>
                {cycle.compoundLabel} · {fmtDate(cycle.startDate)} — {fmtDate(cycle.endDate)}
                {" "}· {cycle.totalDoses} {cycle.totalDoses === 1 ? "dose" : "doses"}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold">All entries</h4>
              <ol
                className="space-y-2"
                data-testid="list-panel-entries"
              >
                {sortedEntries.map((entry) => {
                  const product = getEntryProduct(entry, productMap);
                  const when = entryTimestamp(entry);
                  return (
                    <li
                      key={entry.id}
                      className="rounded-md border p-3"
                      data-testid={`panel-entry-${entry.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {entry.title || product?.name || "Logbook entry"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {fmtDateTime(when)}
                          </p>
                          {(entry.dose || entry.route) && (
                            <p className="text-xs mt-1">
                              {entry.dose && (
                                <span className="font-medium">
                                  {entry.dose}
                                  {entry.doseUnit ? ` ${entry.doseUnit}` : ""}
                                </span>
                              )}
                              {entry.route && (
                                <span className="text-muted-foreground">
                                  {entry.dose ? " · " : ""}
                                  {entry.route}
                                </span>
                              )}
                            </p>
                          )}
                          {entry.content && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {entry.content}
                            </p>
                          )}
                        </div>
                        {entry.cycleMarker && (
                          <Badge variant="outline" className="shrink-0">
                            {entry.cycleMarker}
                          </Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CyclesTab() {
  const cyclesQuery = useQuery<ApiCyclesResponse>({
    queryKey: ["/api/cycles"],
  });
  const entriesQuery = useQuery<ResearchNote[]>({
    queryKey: ["/api/logbook"],
  });
  const productsQuery = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const productMap = useMemo(() => {
    const m = new Map<string, Product>();
    (productsQuery.data ?? []).forEach((p) => m.set(p.id, p));
    return m;
  }, [productsQuery.data]);

  const [selectedCycle, setSelectedCycle] = useState<GlobalTimelineCycle | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const isLoading = cyclesQuery.isLoading || entriesQuery.isLoading;
  const isError = cyclesQuery.isError || entriesQuery.isError;

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="cycles-loading">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card data-testid="cycles-error-state">
        <CardContent className="py-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Couldn't load cycles</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We hit an error fetching your logbook data. Try refreshing the page.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void cyclesQuery.refetch();
              void entriesQuery.refetch();
            }}
            data-testid="button-retry-cycles"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalEntries = cyclesQuery.data?.totalLogbookEntries ?? 0;
  const cycles = cyclesQuery.data?.cycles ?? [];
  const entries = entriesQuery.data ?? [];

  if (totalEntries < 3) {
    return (
      <Card data-testid="cycles-empty-state">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#21d8ff]/10 flex items-center justify-center">
            <Activity className="h-7 w-7 text-[#21d8ff]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Cycles unlock at 3 logbook entries</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Cycles are detected automatically from your logbook entries. Once you've
              logged at least 3 doses, we'll group them into named cycles you can review,
              rename, and export.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <a href="/dashboard#section-logbook" data-testid="link-cycles-go-to-logbook">
              <BookMarked className="h-4 w-4" />
              Open the logbook
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeCycles = cycles.filter((c) => c.status === "active");
  const pastCycles = cycles.filter((c) => c.status === "completed");

  const labelFor = (cycle: ApiCycle): string => {
    if (cycle.compoundLabel) return cycle.compoundLabel;
    const first = entries.find((e) => e.id === cycle.startEntryId);
    if (first) return getEntryCompoundLabel(first, productMap);
    return "Unknown compound";
  };

  const imageFor = (cycle: ApiCycle): string | null => {
    const first = entries.find((e) => e.id === cycle.startEntryId);
    if (!first) return null;
    const product = getEntryProduct(first, productMap);
    return product?.imageUrl ?? null;
  };

  const buildGlobalCycle = (cycle: ApiCycle): GlobalTimelineCycle => {
    const cycleEntries = sortEntriesAsc(
      entries.filter((e) => cycle.entryIds.includes(e.id)),
    );
    const stats = computeCycleStats({
      compoundKey: cycle.compoundKey,
      compoundLabel: cycle.compoundLabel,
      startEntryId: cycle.startEntryId,
      endEntryId: cycle.endEntryId,
      entries: cycleEntries.map((e) => ({
        ...e,
        administeredAt: e.administeredAt as unknown as Date | null,
        createdAt: e.createdAt as unknown as Date | null,
      })),
      startDate: new Date(cycle.startDate),
      endDate: new Date(cycle.endDate),
      status: cycle.status,
    });
    const label = labelFor(cycle);
    return {
      compoundKey: cycle.compoundKey,
      startEntryId: cycle.startEntryId,
      compoundLabel: label,
      displayName: cycle.name ?? defaultCycleName(cycle, label),
      startDate: new Date(cycle.startDate),
      endDate: new Date(cycle.endDate),
      status: cycle.status,
      totalDoses: stats.totalDoses,
      averageDose: stats.averageDose,
      averageDoseUnit: stats.averageDoseUnit,
      dosesPerWeek: stats.dosesPerWeek,
      entries: cycleEntries,
    };
  };

  const globalCycles = cycles.map(buildGlobalCycle);

  const onSelectCycle = (cycle: GlobalTimelineCycle) => {
    setSelectedCycle(cycle);
    setPanelOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
        <CardContent className="p-4 flex items-start gap-3">
          <Activity className="h-5 w-5 text-[#21d8ff] shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium" data-testid="text-cycles-intro">
              Auto-detected from your logbook
            </p>
            <p className="text-muted-foreground mt-1">
              We group entries into cycles by compound. A new cycle starts whenever
              you mark "Cycle start", a previous entry was tagged "Cycle end", or
              there's been a gap of more than 14 days. Active cycles had a dose in
              the last 14 days.
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold" data-testid="heading-active-cycles">
            Active cycles
          </h2>
          <Badge variant="secondary" data-testid="badge-active-cycle-count">
            {activeCycles.length}
          </Badge>
        </div>
        {activeCycles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground" data-testid="text-no-active-cycles">
              No active cycles. Log a dose to start a new cycle, or check the
              completed cycles below.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="list-active-cycles">
            {activeCycles.map((cycle) => (
              <CycleCard
                key={`${cycle.compoundKey}-${cycle.startEntryId}`}
                cycle={cycle}
                entries={entries}
                compoundLabel={labelFor(cycle)}
                compoundImageUrl={imageFor(cycle)}
                variant="active"
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="heading-past-cycles">
            Past cycles
          </h2>
          <Badge variant="secondary" data-testid="badge-past-cycle-count">
            {pastCycles.length}
          </Badge>
        </div>
        {pastCycles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground" data-testid="text-no-past-cycles">
              No completed cycles yet.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-2" data-testid="accordion-past-cycles">
            {pastCycles.map((cycle) => {
              const id = `${cycle.compoundKey}-${cycle.startEntryId}`;
              const label = labelFor(cycle);
              const displayName = cycle.name ?? defaultCycleName(cycle, label);
              return (
                <AccordionItem
                  key={id}
                  value={id}
                  className="border rounded-md overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-4 hover:no-underline"
                    data-testid={`trigger-past-cycle-${id}`}
                  >
                    <div className="flex items-center justify-between gap-3 flex-1 min-w-0 pr-3">
                      <div className="text-left min-w-0">
                        <p className="font-medium truncate" data-testid={`text-past-cycle-name-${id}`}>
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {label} · {fmtDate(new Date(cycle.startDate))} — {fmtDate(new Date(cycle.endDate))}
                        </p>
                      </div>
                      <Badge variant="secondary">{cycle.totalDoses} doses</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <CycleCard
                      cycle={cycle}
                      entries={entries}
                      compoundLabel={label}
                      compoundImageUrl={imageFor(cycle)}
                      variant="completed"
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold" data-testid="heading-global-timeline">
            All cycles timeline
          </h2>
          <Badge variant="secondary" data-testid="badge-global-cycle-count">
            {globalCycles.length}
          </Badge>
        </div>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Each row is one cycle. Hover to see stats; click any bar to inspect every entry.
            </p>
            <CyclesGlobalTimeline
              cycles={globalCycles}
              activeColor={ACTIVE_COLOR}
              onSelect={onSelectCycle}
            />
          </CardContent>
        </Card>
      </section>

      <CycleEntriesPanel
        cycle={selectedCycle}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        productMap={productMap}
      />
    </div>
  );
}
