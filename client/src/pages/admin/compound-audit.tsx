import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { compoundProfiles, type CompoundProfile } from "@/data/compound-profiles";
import { CheckCircle2, XCircle, AlertCircle, Search, ExternalLink, ArrowUpDown } from "lucide-react";
import type { Product } from "@shared/schema";

type AuditStatus = "complete" | "partial" | "missing";
type SortField = "slug" | "name" | "status" | "category";

interface FieldAudit {
  formula: boolean;
  molecularWeight: boolean;
  casNumber: boolean;
  pubchemUrl: boolean;
}

function isPlaceholder(val: string | undefined): boolean {
  if (!val || val.trim() === "") return true;
  const lower = val.toLowerCase().trim();
  return (
    lower.startsWith("n/a") ||
    lower.startsWith("proprietary") ||
    lower.startsWith("variable") ||
    lower === "na"
  );
}

function auditProfile(profile: CompoundProfile | undefined): { status: AuditStatus; fields: FieldAudit } {
  if (!profile) {
    return {
      status: "missing",
      fields: { formula: false, molecularWeight: false, casNumber: false, pubchemUrl: false },
    };
  }

  const fields: FieldAudit = {
    formula: !isPlaceholder(profile.formula),
    molecularWeight: !isPlaceholder(profile.molecularWeight),
    casNumber: !isPlaceholder(profile.casNumber),
    pubchemUrl: !!profile.pubchemUrl && !isPlaceholder(profile.pubchemUrl),
  };

  const allPresent = fields.formula && fields.molecularWeight && fields.casNumber && fields.pubchemUrl;
  const status: AuditStatus = allPresent ? "complete" : "partial";

  return { status, fields };
}

function StatusBadge({ status }: { status: AuditStatus }) {
  if (status === "complete") {
    return (
      <Badge
        data-testid="badge-status-complete"
        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1"
      >
        <CheckCircle2 className="w-3 h-3" />
        Complete
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <Badge
        data-testid="badge-status-partial"
        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1"
      >
        <AlertCircle className="w-3 h-3" />
        Partial
      </Badge>
    );
  }
  return (
    <Badge
      data-testid="badge-status-missing"
      className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 gap-1"
    >
      <XCircle className="w-3 h-3" />
      No Profile
    </Badge>
  );
}

function FieldIndicator({ present, label }: { present: boolean; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-testid={`field-indicator-${label.toLowerCase().replace(/\s/g, "-")}`}
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold cursor-default ${
            present
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {label[0].toUpperCase()}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {label}: {present ? "present" : "missing or placeholder"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

const STATUS_ORDER: Record<AuditStatus, number> = { missing: 0, partial: 1, complete: 2 };

export default function CompoundAudit() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AuditStatus>("all");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const profileMap = useMemo(() => {
    const map = new Map<string, CompoundProfile>();
    for (const p of compoundProfiles) {
      map.set(p.slug, p);
    }
    return map;
  }, []);

  const auditRows = useMemo(() => {
    return products.map((product) => {
      const profile = profileMap.get(product.slug ?? "");
      const { status, fields } = auditProfile(profile);
      return { product, profile, status, fields };
    });
  }, [products, profileMap]);

  const filteredRows = useMemo(() => {
    let rows = auditRows;

    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.product.name?.toLowerCase().includes(q) ||
          r.product.slug?.toLowerCase().includes(q) ||
          r.product.category?.toLowerCase().includes(q) ||
          r.profile?.fullName?.toLowerCase().includes(q)
      );
    }

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortField === "status") {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      } else if (sortField === "slug") {
        cmp = (a.product.slug ?? "").localeCompare(b.product.slug ?? "");
      } else if (sortField === "name") {
        cmp = (a.product.name ?? "").localeCompare(b.product.name ?? "");
      } else if (sortField === "category") {
        cmp = (a.product.category ?? "").localeCompare(b.product.category ?? "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [auditRows, statusFilter, search, sortField, sortDir]);

  const summaryStats = useMemo(() => {
    const complete = auditRows.filter((r) => r.status === "complete").length;
    const partial = auditRows.filter((r) => r.status === "partial").length;
    const missing = auditRows.filter((r) => r.status === "missing").length;
    const totalProfiles = compoundProfiles.length;
    return { complete, partial, missing, total: auditRows.length, totalProfiles };
  }, [auditRows]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  return (
    <>
      <SEOHead
        title="Compound Profile Audit | Admin"
        description="Admin audit view for compound profile data quality."
      />

      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-audit-title">
              Compound Profile Audit
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Data-quality check — shows which catalog products have a compound profile and whether
              required fields are filled in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Catalog Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span
                  className="text-3xl font-bold"
                  data-testid="stat-total-products"
                >
                  {summaryStats.total}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                  Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span
                  className="text-3xl font-bold text-green-700 dark:text-green-400"
                  data-testid="stat-complete"
                >
                  {summaryStats.complete}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Partial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span
                  className="text-3xl font-bold text-yellow-700 dark:text-yellow-400"
                  data-testid="stat-partial"
                >
                  {summaryStats.partial}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
                  No Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span
                  className="text-3xl font-bold text-red-700 dark:text-red-400"
                  data-testid="stat-missing"
                >
                  {summaryStats.missing}
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="input-search"
                placeholder="Search by name, slug or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger
                data-testid="select-status-filter"
                className="w-40"
              >
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="missing">No Profile</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground whitespace-nowrap" data-testid="text-result-count">
              {filteredRows.length} of {summaryStats.total} products
            </span>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-0 font-semibold"
                          onClick={() => toggleSort("status")}
                          data-testid="button-sort-status"
                        >
                          Status
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-0 font-semibold"
                          onClick={() => toggleSort("slug")}
                          data-testid="button-sort-slug"
                        >
                          Slug
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-0 font-semibold"
                          onClick={() => toggleSort("name")}
                          data-testid="button-sort-name"
                        >
                          Product Name
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-0 font-semibold"
                          onClick={() => toggleSort("category")}
                          data-testid="button-sort-category"
                        >
                          Category
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">Fields</TableHead>
                      <TableHead>Profile Name</TableHead>
                      <TableHead className="text-center">PubChem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i} data-testid={`row-skeleton-${i}`}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <TableCell key={j}>
                              <div className="h-4 bg-muted rounded animate-pulse w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-12"
                          data-testid="text-no-results"
                        >
                          No products match your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map(({ product, profile, status, fields }) => (
                        <TableRow
                          key={product.id}
                          data-testid={`row-product-${product.slug}`}
                        >
                          <TableCell>
                            <StatusBadge status={status} />
                          </TableCell>

                          <TableCell>
                            <code
                              className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"
                              data-testid={`text-slug-${product.slug}`}
                            >
                              {product.slug}
                            </code>
                          </TableCell>

                          <TableCell
                            className="font-medium"
                            data-testid={`text-name-${product.slug}`}
                          >
                            {product.name}
                          </TableCell>

                          <TableCell
                            className="text-muted-foreground text-sm"
                            data-testid={`text-category-${product.slug}`}
                          >
                            {product.category}
                          </TableCell>

                          <TableCell>
                            {status === "missing" ? (
                              <span className="text-muted-foreground text-xs italic">—</span>
                            ) : (
                              <div
                                className="flex items-center gap-1"
                                data-testid={`fields-${product.slug}`}
                              >
                                <FieldIndicator present={fields.formula} label="Formula" />
                                <FieldIndicator present={fields.molecularWeight} label="MW" />
                                <FieldIndicator present={fields.casNumber} label="CAS" />
                                <FieldIndicator present={fields.pubchemUrl} label="PubChem" />
                              </div>
                            )}
                          </TableCell>

                          <TableCell
                            className="text-sm text-muted-foreground max-w-52 truncate"
                            data-testid={`text-fullname-${product.slug}`}
                            title={profile?.fullName}
                          >
                            {profile?.fullName ?? (
                              <span className="italic text-xs">No profile entry</span>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            {profile?.pubchemUrl ? (
                              <a
                                href={profile.pubchemUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`link-pubchem-${product.slug}`}
                                title={
                                  profile.pubchemUrl.includes("/substance/")
                                    ? "PubChem Substance record"
                                    : "PubChem Compound record"
                                }
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {profile.pubchemUrl.includes("/substance/") && (
                                  <span
                                    className="text-xs"
                                    data-testid={`label-pubchem-type-${product.slug}`}
                                  >
                                    Substance
                                  </span>
                                )}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground space-y-1 pb-8">
            <p>
              <strong>Field indicators:</strong> F = Formula, M = Molecular Weight, C = CAS Number, P = PubChem URL
            </p>
            <p>
              <strong>Partial</strong> = profile exists but one or more fields are absent or contain a placeholder value
              (N/A, Proprietary, Variable).{" "}
              <strong>Complete</strong> = all four fields are filled with non-placeholder values.
            </p>
            <p>
              Profile entries in <code className="bg-muted px-1 rounded">compound-profiles.ts</code>:{" "}
              <strong>{summaryStats.totalProfiles}</strong>. Products without a matching slug need a new entry added.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
