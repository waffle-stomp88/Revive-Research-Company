import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  COMBO_STACK_CONSTITUENTS,
  looksLikeUnregisteredBlend,
  BLEND_SLUG_PATTERNS,
  getHalfLifeByName,
  resolveComboSlugKey,
} from "@/data/pharmacokinetics";
import { AlertTriangle, CheckCircle2, Search, ExternalLink, ArrowLeft, FlaskConical } from "lucide-react";
import type { Product } from "@shared/schema";

type RowStatus = "registered" | "unregistered" | "partial";

interface AuditRow {
  product: Product;
  status: RowStatus;
  constituents: string[];
  missingConstituents: string[];
}

function StatusBadge({ status }: { status: RowStatus }) {
  if (status === "registered") {
    return (
      <Badge
        data-testid="badge-blend-status-registered"
        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1"
      >
        <CheckCircle2 className="w-3 h-3" />
        Registered
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <Badge
        data-testid="badge-blend-status-partial"
        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1"
      >
        <AlertTriangle className="w-3 h-3" />
        Missing PK data
      </Badge>
    );
  }
  return (
    <Badge
      data-testid="badge-blend-status-unregistered"
      className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 gap-1"
    >
      <AlertTriangle className="w-3 h-3" />
      Not registered
    </Badge>
  );
}


export default function BlendAudit() {
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const registeredSlugs = Object.keys(COMBO_STACK_CONSTITUENTS);

  const auditRows = useMemo<AuditRow[]>(() => {
    const rows: AuditRow[] = [];

    for (const product of products) {
      const slug = resolveComboSlugKey(product) ?? "";
      const constituents = COMBO_STACK_CONSTITUENTS[slug];

      if (constituents) {
        const missingConstituents = constituents.filter((n) => !getHalfLifeByName(n));
        rows.push({
          product,
          status: missingConstituents.length === 0 ? "registered" : "partial",
          constituents,
          missingConstituents,
        });
      } else if (looksLikeUnregisteredBlend(slug)) {
        rows.push({
          product,
          status: "unregistered",
          constituents: [],
          missingConstituents: [],
        });
      }
    }

    rows.sort((a, b) => {
      const order: Record<RowStatus, number> = { unregistered: 0, partial: 1, registered: 2 };
      return order[a.status] - order[b.status];
    });

    return rows;
  }, [products]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return auditRows;
    const q = search.toLowerCase();
    return auditRows.filter(
      (r) =>
        (r.product.slug ?? "").toLowerCase().includes(q) ||
        r.product.name.toLowerCase().includes(q)
    );
  }, [auditRows, search]);

  const warningCount = auditRows.filter((r) => r.status !== "registered").length;

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Blend Audit | Admin"
        description="Admin tool to verify all combo blend products are registered in COMBO_STACK_CONSTITUENTS for multi-curve PK chart support."
      />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="/admin"
            data-testid="link-back-admin"
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Panel
          </a>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1
                className="font-display text-xl font-bold"
                data-testid="text-blend-audit-title"
              >
                Blend PK Audit
              </h1>
              <p className="text-sm text-muted-foreground">
                Products whose slugs match blend patterns but are missing from{" "}
                <code className="text-xs bg-muted px-1 rounded">COMBO_STACK_CONSTITUENTS</code>
              </p>
            </div>
          </div>

          {warningCount > 0 && (
            <Badge
              data-testid="badge-warning-count"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              {warningCount} issue{warningCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registered blends</CardTitle>
            <CardDescription>
              These {registeredSlugs.length} slugs are currently in{" "}
              <code className="text-xs bg-muted px-1 rounded">COMBO_STACK_CONSTITUENTS</code> and
              will render multi-curve PK charts on their product detail pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-wrap gap-2"
              data-testid="list-registered-slugs"
            >
              {registeredSlugs.map((slug) => {
                const constituents = COMBO_STACK_CONSTITUENTS[slug];
                const allHavePkData = constituents.every((n) => !!getHalfLifeByName(n));
                return (
                  <Tooltip key={slug}>
                    <TooltipTrigger asChild>
                      <Badge
                        data-testid={`badge-slug-${slug}`}
                        className={
                          allHavePkData
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }
                      >
                        {slug}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">Constituents:</p>
                        {constituents.map((n) => (
                          <p key={n} className={getHalfLifeByName(n) ? "text-green-400" : "text-red-400"}>
                            {getHalfLifeByName(n) ? "✓" : "✗"} {n}
                          </p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detected blend patterns</CardTitle>
            <CardDescription>
              Slugs are scanned for these suffixes:{" "}
              {BLEND_SLUG_PATTERNS.map((p) => (
                <code key={p} className="text-xs bg-muted px-1 rounded mr-1">
                  {p}
                </code>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                data-testid="input-blend-search"
                placeholder="Filter by slug or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading products…</p>
            ) : filteredRows.length === 0 ? (
              <p
                className="text-sm text-muted-foreground py-4 text-center"
                data-testid="text-no-blend-matches"
              >
                {search ? "No matching products." : "No blend-pattern products found."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Constituents</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => {
                    const slug = resolveComboSlugKey(row.product) ?? "";
                    return (
                      <TableRow
                        key={row.product.id}
                        data-testid={`row-blend-${row.product.id}`}
                      >
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {row.product.name}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          {row.status === "unregistered" ? (
                            <span className="text-xs text-muted-foreground italic">
                              Add to COMBO_STACK_CONSTITUENTS
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.constituents.map((n) => {
                                const hasPk = !!getHalfLifeByName(n);
                                return (
                                  <Tooltip key={n}>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        data-testid={`badge-constituent-${n.replace(/\s+/g, "-")}`}
                                        className={
                                          hasPk
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs"
                                        }
                                      >
                                        {n}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">
                                        {hasPk ? "PK data found" : "No PK data — add a HalfLifeEntry"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`/products/${row.product.id}`}
                            target="_blank"
                            rel="noreferrer"
                            data-testid={`link-product-${row.product.id}`}
                          >
                            <Button size="icon" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to register a new blend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Open{" "}
                <code className="text-xs bg-muted px-1 rounded">client/src/data/pharmacokinetics.ts</code>
                {" "}and find <code className="text-xs bg-muted px-1 rounded">COMBO_STACK_CONSTITUENTS</code>.
              </li>
              <li>
                Add a new entry using the product's DB slug as the key and an array of constituent
                display-name strings as the value — for example:
                <pre className="mt-1 mb-1 bg-muted rounded px-3 py-2 text-xs font-mono overflow-x-auto">
                  {`"my-new-blend-stack": ["CompoundA", "CompoundB"],`}
                </pre>
              </li>
              <li>
                Each constituent name must match a{" "}
                <code className="text-xs bg-muted px-1 rounded">name</code> field in the{" "}
                <code className="text-xs bg-muted px-1 rounded">halfLifeData</code> array (resolved
                via <code className="text-xs bg-muted px-1 rounded">getHalfLifeByName</code>). If no
                entry exists for a compound, add one to the dataset first.
              </li>
              <li>
                Use compliance-safe identifiers where needed:{" "}
                <code className="text-xs bg-muted px-1 rounded">RR-A1</code> (GLP-1 RA),{" "}
                <code className="text-xs bg-muted px-1 rounded">RR-A2</code> (dual GIP/GLP-1),{" "}
                <code className="text-xs bg-muted px-1 rounded">RR-A3</code> (triple-incretin).
              </li>
              <li>Restart the dev server and verify the product detail page shows multiple curves.</li>
              <li>Return to this page to confirm the slug no longer appears as a warning.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
