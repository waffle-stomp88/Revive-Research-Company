import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  insertResearchNoteSchema,
  DOSE_UNITS,
  ROUTES,
  CYCLE_MARKERS,
  type ResearchNote,
  type Product,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookMarked,
  Plus,
  Trash2,
  Edit3,
  Download,
  Filter,
  X,
  ShieldAlert,
  Activity,
  Syringe,
  Calendar as CalendarIcon,
  Repeat,
  Check,
  ChevronsUpDown,
  Sparkles,
} from "lucide-react";

const ROUTE_LABELS: Record<(typeof ROUTES)[number], string> = {
  subq: "Subcutaneous",
  im: "Intramuscular",
  oral: "Oral",
  intranasal: "Intranasal",
  topical: "Topical",
};

const CYCLE_LABELS: Record<(typeof CYCLE_MARKERS)[number], string> = {
  start: "Cycle start",
  end: "Cycle end",
  continue: "Continue (no marker)",
};

const NONE_PRODUCT = "__none__";
const COMPOUND_TAG_PREFIX = "compound:";
// Tag prefixes the logbook owns internally — never displayed as user-visible
// chips (the source:logbook discriminator is added by the server on every
// POST/PATCH and used to scope list/wipe operations).
const RESERVED_TAG_PREFIXES = ["compound:", "source:"] as const;

// Form schema: base on insert schema but coerce numeric fields from strings
// (HTML inputs always emit strings) and require a title.
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().max(5000).optional().default(""),
  productId: z.string().optional().default(""),
  customCompound: z.string().max(120).optional().default(""),
  batchNumber: z.string().max(100).optional().default(""),
  tagsRaw: z.string().max(500).optional().default(""),
  dose: z.string().optional().default(""),
  doseUnit: z.enum(DOSE_UNITS).optional(),
  route: z.enum(ROUTES).optional(),
  administeredAt: z.string().optional().default(""),
  bodyWeightKg: z.string().optional().default(""),
  sleepScore: z.string().optional().default(""),
  energyScore: z.string().optional().default(""),
  moodScore: z.string().optional().default(""),
  cycleMarker: z.enum(CYCLE_MARKERS).default("continue"),
});

type FormValues = z.infer<typeof formSchema>;

function nowAsLocalIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function makeEmptyForm(): FormValues {
  return {
    title: "",
    content: "",
    productId: "",
    customCompound: "",
    batchNumber: "",
    tagsRaw: "",
    dose: "",
    doseUnit: undefined,
    route: undefined,
    // Default the administered-at timestamp to NOW so quick-logging is one less step.
    administeredAt: nowAsLocalIso(),
    bodyWeightKg: "",
    sleepScore: "",
    energyScore: "",
    moodScore: "",
    cycleMarker: "continue",
  };
}

function toIsoOrEmpty(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getCustomCompound(entry: ResearchNote): string {
  const tag = (entry.tags ?? []).find((t) => t.startsWith(COMPOUND_TAG_PREFIX));
  return tag ? tag.slice(COMPOUND_TAG_PREFIX.length) : "";
}

function getOtherTags(entry: ResearchNote): string[] {
  return (entry.tags ?? []).filter(
    (t) => !RESERVED_TAG_PREFIXES.some((prefix) => t.startsWith(prefix)),
  );
}

function entryToFormValues(entry: ResearchNote): FormValues {
  return {
    title: entry.title ?? "",
    content: entry.content ?? "",
    productId: entry.productId ?? "",
    customCompound: getCustomCompound(entry),
    batchNumber: entry.batchNumber ?? "",
    tagsRaw: getOtherTags(entry).join(", "),
    dose: entry.dose ?? "",
    doseUnit: (entry.doseUnit as (typeof DOSE_UNITS)[number] | undefined) ?? undefined,
    route: (entry.route as (typeof ROUTES)[number] | undefined) ?? undefined,
    administeredAt: toIsoOrEmpty(entry.administeredAt as unknown as string | null),
    bodyWeightKg: entry.bodyWeightKg ?? "",
    sleepScore: entry.sleepScore != null ? String(entry.sleepScore) : "",
    energyScore: entry.energyScore != null ? String(entry.energyScore) : "",
    moodScore: entry.moodScore != null ? String(entry.moodScore) : "",
    cycleMarker: (entry.cycleMarker as (typeof CYCLE_MARKERS)[number] | null) ?? "continue",
  };
}

function buildPayload(values: FormValues): Record<string, unknown> {
  const userTags = (values.tagsRaw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !t.startsWith(COMPOUND_TAG_PREFIX));
  // If the user typed a custom compound (and didn't select a catalog product),
  // persist it as a reserved compound:<name> tag so we can render it in the
  // timeline without changing the schema.
  const compoundTag =
    !values.productId && values.customCompound?.trim()
      ? [`${COMPOUND_TAG_PREFIX}${values.customCompound.trim()}`]
      : [];
  const tags = [...compoundTag, ...userTags];
  const parseInt10 = (v: string) => {
    if (!v) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  return {
    title: values.title,
    content: values.content || "",
    productId: values.productId || null,
    batchNumber: values.batchNumber || null,
    tags: tags.length > 0 ? tags : null,
    dose: values.dose || null,
    doseUnit: values.doseUnit ?? null,
    route: values.route ?? null,
    administeredAt: values.administeredAt
      ? new Date(values.administeredAt).toISOString()
      : null,
    bodyWeightKg: values.bodyWeightKg || null,
    sleepScore: parseInt10(values.sleepScore),
    energyScore: parseInt10(values.energyScore),
    moodScore: parseInt10(values.moodScore),
    cycleMarker: values.cycleMarker,
  };
}

function formatDateTime(value: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeOnly(value: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayHeader(d: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function dayKey(value: string | Date | null | undefined): string {
  if (!value) return "0000-00-00";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "0000-00-00";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface CompoundComboboxProps {
  value: string;
  onValueChange: (productId: string) => void;
  customCompound: string;
  onCustomCompoundChange: (name: string) => void;
  products: Product[];
}

function CompoundCombobox({
  value,
  onValueChange,
  customCompound,
  onCustomCompoundChange,
  products,
}: CompoundComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === value) ?? null,
    [products, value],
  );

  const triggerLabel = selectedProduct
    ? selectedProduct.name
    : customCompound
    ? `${customCompound} (custom)`
    : "Select compound or type a custom name";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          data-testid="combobox-logbook-compound"
        >
          <span className="truncate text-left">{triggerLabel}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search products or type custom..."
            value={search}
            onValueChange={setSearch}
            data-testid="input-logbook-compound-search"
          />
          <CommandList>
            <CommandEmpty>
              {search.trim() ? (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover-elevate active-elevate-2 rounded-md"
                  onClick={() => {
                    onValueChange("");
                    onCustomCompoundChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                  data-testid="button-logbook-use-custom-compound"
                >
                  Use &ldquo;{search.trim()}&rdquo; as custom compound
                </button>
              ) : (
                <span className="block px-3 py-2 text-sm text-muted-foreground">
                  No products found.
                </span>
              )}
            </CommandEmpty>
            {(value || customCompound) && (
              <CommandGroup heading="Current">
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onValueChange("");
                    onCustomCompoundChange("");
                    setOpen(false);
                    setSearch("");
                  }}
                  data-testid="button-logbook-clear-compound"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear selection
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Catalog">
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => {
                    onValueChange(p.id);
                    onCustomCompoundChange("");
                    setOpen(false);
                    setSearch("");
                  }}
                  data-testid={`option-logbook-compound-${p.id}`}
                >
                  <Check
                    className={`h-4 w-4 mr-2 ${value === p.id ? "opacity-100" : "opacity-0"}`}
                  />
                  {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {search.trim() &&
              !products.some(
                (p) => p.name.toLowerCase() === search.trim().toLowerCase(),
              ) && (
                <CommandGroup heading="Custom">
                  <CommandItem
                    value={`__use_custom_${search.trim()}`}
                    onSelect={() => {
                      onValueChange("");
                      onCustomCompoundChange(search.trim());
                      setOpen(false);
                      setSearch("");
                    }}
                    data-testid="button-logbook-use-custom-compound-suggest"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use &ldquo;{search.trim()}&rdquo;
                  </CommandItem>
                </CommandGroup>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function LogbookTab() {
  const { toast } = useToast();
  // Quick-log form is visible at the top by default to encourage one-tap
  // logging; users can collapse it via the Cancel button.
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterProductId, setFilterProductId] = useState<string>("");
  const [filterCustomCompound, setFilterCustomCompound] = useState("");
  const [filterHasObservation, setFilterHasObservation] = useState(false);
  const [filterMinSleep, setFilterMinSleep] = useState("");
  const [filterMinEnergy, setFilterMinEnergy] = useState("");
  const [filterMinMood, setFilterMinMood] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: makeEmptyForm(),
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const queryParams = useMemo(() => {
    const sp = new URLSearchParams();
    // <input type="date"> emits YYYY-MM-DD. Treat "from" as the very start
    // of that day in the user's local TZ and "to" as the very end of that
    // day so the range is inclusive on both ends.
    if (filterFrom) {
      sp.set("from", new Date(`${filterFrom}T00:00:00`).toISOString());
    }
    if (filterTo) {
      sp.set("to", new Date(`${filterTo}T23:59:59.999`).toISOString());
    }
    if (filterProductId) sp.set("productId", filterProductId);
    if (filterCustomCompound.trim())
      sp.set("customCompound", filterCustomCompound.trim());
    if (filterHasObservation) sp.set("hasObservation", "true");
    if (filterMinSleep) sp.set("minSleep", filterMinSleep);
    if (filterMinEnergy) sp.set("minEnergy", filterMinEnergy);
    if (filterMinMood) sp.set("minMood", filterMinMood);
    return sp.toString();
  }, [
    filterFrom,
    filterTo,
    filterProductId,
    filterCustomCompound,
    filterHasObservation,
    filterMinSleep,
    filterMinEnergy,
    filterMinMood,
  ]);

  const logbookQueryKey = useMemo(
    () => (queryParams ? ["/api/logbook?" + queryParams] : ["/api/logbook"]),
    [queryParams],
  );

  const { data: entries, isLoading } = useQuery<ResearchNote[]>({
    queryKey: logbookQueryKey,
  });

  const invalidateLogbook = () =>
    queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) &&
        typeof q.queryKey[0] === "string" &&
        (q.queryKey[0] as string).startsWith("/api/logbook") &&
        (q.queryKey[0] as string) !== "/api/logbook/export.csv",
    });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/logbook", buildPayload(values));
      return res.json();
    },
    onSuccess: () => {
      invalidateLogbook();
      queryClient.invalidateQueries({ queryKey: ["/api/research-notes"] });
      toast({ title: "Logged", description: "Your logbook entry has been saved." });
      form.reset(makeEmptyForm());
      setShowForm(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not save entry",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      const res = await apiRequest("PATCH", `/api/logbook/${id}`, buildPayload(values));
      return res.json();
    },
    onSuccess: () => {
      invalidateLogbook();
      queryClient.invalidateQueries({ queryKey: ["/api/research-notes"] });
      toast({ title: "Updated", description: "Logbook entry updated." });
      form.reset(makeEmptyForm());
      setEditingId(null);
      setShowForm(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not update entry",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/logbook/${id}`);
    },
    onSuccess: () => {
      invalidateLogbook();
      queryClient.invalidateQueries({ queryKey: ["/api/research-notes"] });
      toast({ title: "Deleted", description: "Logbook entry removed." });
      setConfirmDeleteId(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not delete entry",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const startEdit = (entry: ResearchNote) => {
    setEditingId(entry.id);
    form.reset(entryToFormValues(entry));
    setShowForm(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openNewEntryForm = () => {
    setEditingId(null);
    // Re-seed with a fresh now-timestamp every time the form opens.
    form.reset(makeEmptyForm());
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    form.reset(makeEmptyForm());
    setShowForm(false);
  };

  // Whenever the form is opened (not editing), refresh the timestamp to "now".
  useEffect(() => {
    if (showForm && !editingId) {
      form.setValue("administeredAt", nowAsLocalIso());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editingId]);

  const clearFilters = () => {
    setFilterFrom("");
    setFilterTo("");
    setFilterProductId("");
    setFilterCustomCompound("");
    setFilterHasObservation(false);
    setFilterMinSleep("");
    setFilterMinEnergy("");
    setFilterMinMood("");
  };

  const exportCsv = () => {
    const url = queryParams
      ? `/api/logbook/export.csv?${queryParams}`
      : "/api/logbook/export.csv";
    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Export failed (${res.status})`);
        const blob = await res.blob();
        const a = document.createElement("a");
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = `logbook-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      })
      .catch((err: Error) => {
        toast({
          title: "Export failed",
          description: err.message,
          variant: "destructive",
        });
      });
  };

  const productMap = useMemo(() => {
    const m = new Map<string, Product>();
    (products ?? []).forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const hasEntries = (entries?.length ?? 0) > 0;
  const hasFilters = !!(
    filterFrom ||
    filterTo ||
    filterProductId ||
    filterCustomCompound.trim() ||
    filterHasObservation ||
    filterMinSleep ||
    filterMinEnergy ||
    filterMinMood
  );

  // Group entries by day (descending), preserving the within-day order
  // already returned by the server (most recent first).
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, { date: Date; items: ResearchNote[] }>();
    (entries ?? []).forEach((entry) => {
      const when = (entry.administeredAt ?? entry.createdAt) as unknown as
        | string
        | Date
        | null;
      const key = dayKey(when);
      let bucket = groups.get(key);
      if (!bucket) {
        const d =
          when == null
            ? new Date(0)
            : typeof when === "string"
            ? new Date(when)
            : when;
        bucket = { date: d, items: [] };
        groups.set(key, bucket);
      }
      bucket.items.push(entry);
    });
    // Sort by day desc.
    return Array.from(groups.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, value]) => ({ key, ...value }));
  }, [entries]);

  const productOptions = products ?? [];

  return (
    <div className="space-y-6">
      {/* RUO Privacy Banner */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-200" data-testid="text-logbook-ruo-banner">
              Research-use only · Private to you
            </p>
            <p className="text-amber-100/70 mt-1">
              Your logbook is for laboratory research record-keeping. Entries are
              private to your account, never shared, and can be wiped at any time
              from Settings. Notes do not constitute medical advice and are not
              a medical record.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Header + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#21d8ff]/15">
            <BookMarked className="h-5 w-5 text-[#21d8ff]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Research Logbook</h2>
            <p className="text-sm text-muted-foreground">
              Quick-log doses, metrics and observations.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={!hasEntries}
            data-testid="button-logbook-export-csv"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {showForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={cancelForm}
              data-testid="button-logbook-cancel"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={openNewEntryForm}
              data-testid="button-logbook-add"
            >
              <Plus className="h-4 w-4 mr-2" />
              New entry
            </Button>
          )}
        </div>
      </div>

      {/* Quick-log Form */}
      {showForm && (
        <Card className="border-[#21d8ff]/30">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? "Edit logbook entry" : "Log a new entry"}
            </CardTitle>
            <CardDescription>
              All fields except title are optional. Use whatever you find useful.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                data-testid="form-logbook-entry"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Morning BPC-157 dose"
                            data-testid="input-logbook-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Searchable compound combobox with free-text fallback */}
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Compound</FormLabel>
                        <FormControl>
                          <CompoundCombobox
                            value={field.value || ""}
                            onValueChange={(v) => field.onChange(v)}
                            customCompound={form.watch("customCompound") || ""}
                            onCustomCompoundChange={(name) =>
                              form.setValue("customCompound", name, {
                                shouldDirty: true,
                              })
                            }
                            products={productOptions}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="batchNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional"
                            data-testid="input-logbook-batch"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="administeredAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Administered at</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            data-testid="input-logbook-administered-at"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dose</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="e.g. 250"
                            data-testid="input-logbook-dose"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doseUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dose unit</FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(v) =>
                            field.onChange(v as (typeof DOSE_UNITS)[number])
                          }
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-logbook-dose-unit">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DOSE_UNITS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="route"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route</FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(v) =>
                            field.onChange(v as (typeof ROUTES)[number])
                          }
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-logbook-route">
                              <SelectValue placeholder="Route" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ROUTES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROUTE_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bodyWeightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Optional"
                            data-testid="input-logbook-body-weight"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sleepScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep score (1–10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            step="1"
                            data-testid="input-logbook-sleep"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="energyScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Energy score (1–10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            step="1"
                            data-testid="input-logbook-energy"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moodScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mood score (1–10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            step="1"
                            data-testid="input-logbook-mood"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cycleMarker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cycle marker</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(v) =>
                            field.onChange(v as (typeof CYCLE_MARKERS)[number])
                          }
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-logbook-cycle-marker">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CYCLE_MARKERS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {CYCLE_LABELS[c]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagsRaw"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Comma-separated, e.g. cycle1, morning"
                            data-testid="input-logbook-tags"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Observation</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Subjective notes, side effects, anything noteworthy."
                            data-testid="input-logbook-observation"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelForm}
                    data-testid="button-logbook-form-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-logbook-submit"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving…"
                      : editingId
                      ? "Save changes"
                      : "Save entry"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <Input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                data-testid="input-logbook-filter-from"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <Input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                data-testid="input-logbook-filter-to"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Product</label>
              <Select
                value={filterProductId || NONE_PRODUCT}
                onValueChange={(v) =>
                  setFilterProductId(v === NONE_PRODUCT ? "" : v)
                }
              >
                <SelectTrigger data-testid="select-logbook-filter-product">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PRODUCT}>All products</SelectItem>
                  {productOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Custom compound
              </label>
              <Input
                type="text"
                value={filterCustomCompound}
                onChange={(e) => setFilterCustomCompound(e.target.value)}
                placeholder="Free-text contains…"
                maxLength={120}
                data-testid="input-logbook-filter-custom-compound"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasFilters}
                data-testid="button-logbook-clear-filters"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3 md:col-span-1">
              <div className="text-sm">
                <p className="font-medium leading-none">Has observation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Only entries with notes
                </p>
              </div>
              <Switch
                checked={filterHasObservation}
                onCheckedChange={setFilterHasObservation}
                data-testid="switch-logbook-filter-has-observation"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Min sleep (1–10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                step="1"
                value={filterMinSleep}
                onChange={(e) => setFilterMinSleep(e.target.value)}
                placeholder="Any"
                data-testid="input-logbook-filter-min-sleep"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Min energy (1–10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                step="1"
                value={filterMinEnergy}
                onChange={(e) => setFilterMinEnergy(e.target.value)}
                placeholder="Any"
                data-testid="input-logbook-filter-min-energy"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Min mood (1–10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                step="1"
                value={filterMinMood}
                onChange={(e) => setFilterMinMood(e.target.value)}
                placeholder="Any"
                data-testid="input-logbook-filter-min-mood"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-6" data-testid="logbook-timeline">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !hasEntries ? (
          <div className="space-y-4">
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <BookMarked className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <h3 className="font-medium mb-1" data-testid="text-logbook-empty">
                  {hasFilters ? "No entries match these filters" : "No logbook entries yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasFilters
                    ? "Try clearing filters or expanding the date range."
                    : "Track doses, metrics and observations over time. Your first entry only takes a few seconds."}
                </p>
                {!hasFilters && (
                  <Button
                    size="sm"
                    onClick={openNewEntryForm}
                    data-testid="button-logbook-add-empty"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log your first entry
                  </Button>
                )}
              </CardContent>
            </Card>

            {!hasFilters && (
              <Card
                className="border-[#21d8ff]/30 bg-[#21d8ff]/5"
                data-testid="card-logbook-wizard-tutorial"
              >
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#21d8ff]/15 shrink-0">
                      <Sparkles className="h-5 w-5 text-[#21d8ff]" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Just finished the Reconstitution Wizard?
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Log your first dose below to start your timeline — type
                        in the dose and units the wizard calculated for you.
                      </p>
                    </div>
                  </div>
                  <Link href="/reconstitution-wizard">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="link-logbook-wizard"
                    >
                      Open Reconstitution Wizard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          groupedEntries.map((group) => (
            <div
              key={group.key}
              className="space-y-3"
              data-testid={`logbook-day-group-${group.key}`}
            >
              <div className="flex items-center gap-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <h3
                  className="text-sm font-semibold text-muted-foreground"
                  data-testid={`text-logbook-day-header-${group.key}`}
                >
                  {formatDayHeader(group.date)}
                </h3>
                <span className="text-xs text-muted-foreground/70">
                  {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              {group.items.map((entry) => {
                const product = entry.productId
                  ? productMap.get(entry.productId)
                  : null;
                const customCompound = getCustomCompound(entry);
                const compoundLabel = product?.name ?? customCompound ?? "";
                const otherTags = getOtherTags(entry);
                const when = entry.administeredAt ?? entry.createdAt;
                return (
                  <Card key={entry.id} data-testid={`card-logbook-entry-${entry.id}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3
                              className="font-semibold truncate"
                              data-testid={`text-logbook-title-${entry.id}`}
                            >
                              {entry.title}
                            </h3>
                            {compoundLabel && (
                              <Badge
                                className="bg-[#21d8ff]/15 text-[#21d8ff] border-[#21d8ff]/30"
                                data-testid={`text-logbook-compound-${entry.id}`}
                              >
                                <Activity className="h-3 w-3 mr-1" />
                                {compoundLabel}
                                {!product && customCompound ? " (custom)" : ""}
                              </Badge>
                            )}
                            {entry.cycleMarker === "start" && (
                              <Badge className="bg-green-500/15 text-green-400 border-green-500/30">
                                <Repeat className="h-3 w-3 mr-1" />
                                Cycle start
                              </Badge>
                            )}
                            {entry.cycleMarker === "end" && (
                              <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30">
                                <Repeat className="h-3 w-3 mr-1" />
                                Cycle end
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {entry.administeredAt
                                ? formatTimeOnly(when as unknown as string)
                                : formatDateTime(when as unknown as string)}
                            </span>
                            {entry.batchNumber && (
                              <span>Batch {entry.batchNumber}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(entry)}
                            data-testid={`button-logbook-edit-${entry.id}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(entry.id)}
                            data-testid={`button-logbook-delete-${entry.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>

                      {(entry.dose || entry.route || entry.bodyWeightKg) && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {entry.dose && (
                            <Badge variant="outline" className="border-[#21d8ff]/40">
                              <Syringe className="h-3 w-3 mr-1" />
                              {entry.dose}
                              {entry.doseUnit ? ` ${entry.doseUnit}` : ""}
                            </Badge>
                          )}
                          {entry.route && (
                            <Badge variant="outline">
                              {ROUTE_LABELS[entry.route as (typeof ROUTES)[number]] ?? entry.route}
                            </Badge>
                          )}
                          {entry.bodyWeightKg && (
                            <Badge variant="outline">{entry.bodyWeightKg} kg</Badge>
                          )}
                        </div>
                      )}

                      {(entry.sleepScore != null ||
                        entry.energyScore != null ||
                        entry.moodScore != null) && (
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                          {entry.sleepScore != null && (
                            <span data-testid={`text-logbook-sleep-${entry.id}`}>
                              Sleep <span className="text-foreground font-medium">{entry.sleepScore}/10</span>
                            </span>
                          )}
                          {entry.energyScore != null && (
                            <span data-testid={`text-logbook-energy-${entry.id}`}>
                              Energy <span className="text-foreground font-medium">{entry.energyScore}/10</span>
                            </span>
                          )}
                          {entry.moodScore != null && (
                            <span data-testid={`text-logbook-mood-${entry.id}`}>
                              Mood <span className="text-foreground font-medium">{entry.moodScore}/10</span>
                            </span>
                          )}
                        </div>
                      )}

                      {entry.content && (
                        <p
                          className="text-sm text-muted-foreground/90 mt-3 whitespace-pre-wrap"
                          data-testid={`text-logbook-observation-${entry.id}`}
                        >
                          {entry.content}
                        </p>
                      )}

                      {otherTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {otherTags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Per-entry delete confirm */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this logbook entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the entry. You can&apos;t undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-logbook-delete-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-500/90 text-white"
              data-testid="button-logbook-delete-confirm"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function LogbookWipeCard() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [phrase, setPhrase] = useState("");

  const wipeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/logbook", {
        method: "DELETE",
        credentials: "include",
        headers: { "X-Confirm-Wipe": "true" },
      });
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      return res.json();
    },
    onSuccess: (data: { deleted: number }) => {
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          typeof q.queryKey[0] === "string" &&
          ((q.queryKey[0] as string).startsWith("/api/logbook") ||
            q.queryKey[0] === "/api/research-notes"),
      });
      toast({
        title: "Logbook wiped",
        description: `Removed ${data.deleted} entr${data.deleted === 1 ? "y" : "ies"}.`,
      });
      setConfirmOpen(false);
      setPhrase("");
    },
    onError: (err: Error) => {
      toast({
        title: "Could not wipe logbook",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5 mb-4">
        <div className="flex items-start gap-3">
          <BookMarked className="h-4 w-4 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium" data-testid="text-logbook-wipe-title">
              Wipe research logbook
            </p>
            <p className="text-xs text-muted-foreground">
              Deletes every logbook entry tied to your account. Cannot be undone.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-400"
          onClick={() => setConfirmOpen(true)}
          data-testid="button-logbook-wipe"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Wipe logbook
        </Button>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPhrase("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wipe entire research logbook?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes every logbook entry on your account. To
              confirm, type <span className="font-mono text-foreground">WIPE</span> below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Type WIPE to confirm"
            data-testid="input-logbook-wipe-confirm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-logbook-wipe-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => wipeMutation.mutate()}
              disabled={phrase !== "WIPE" || wipeMutation.isPending}
              className="bg-red-500 hover:bg-red-500/90 text-white"
              data-testid="button-logbook-wipe-confirm"
            >
              {wipeMutation.isPending ? "Wiping…" : "Wipe everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
