import { useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StackCard } from "@/components/stack-card";
import { detectPathwayOverlaps } from "@/lib/pathway-overlaps";
import { PEPTIDE_PATHWAYS, KNOWN_STACKS, normalizePeptideName } from "@/lib/synergy-data";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import {
  Download,
  Link,
  Share2,
  ShoppingCart,
  Bookmark,
  ArrowLeft,
  AlertCircle,
  Lock,
  Check,
} from "lucide-react";

interface SharedStackData {
  name: string;
  peptideIds: string[];
  peptideNames: string[];
  saveCount: number;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function nameToSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPeptidePathway(productName: string) {
  const normalized = productName.toLowerCase().replace(/\s*\([^)]*\)/g, "").replace(/[^a-z0-9]/g, "");
  for (const [key, data] of Object.entries(PEPTIDE_PATHWAYS)) {
    if (normalized.includes(key.replace(/[^a-z0-9]/g, ""))) {
      return data;
    }
  }
  return null;
}

function calculateSynergyScore(peptideNames: string[]): number {
  if (peptideNames.length < 2) return 0;
  const normalized = peptideNames.map(normalizePeptideName);

  for (const stack of KNOWN_STACKS) {
    const hasAll = stack.peptides.every(p =>
      normalized.some(s => s.includes(p.replace(/[^a-z0-9]/g, "")))
    );
    const isExact = stack.peptides.length === normalized.length;
    if (hasAll && isExact) return stack.synergyBonus;
  }

  for (const stack of KNOWN_STACKS) {
    const hasAll = stack.peptides.every(p =>
      normalized.some(s => s.includes(p.replace(/[^a-z0-9]/g, "")))
    );
    const hasExtra = normalized.length > stack.peptides.length;
    if (hasAll && hasExtra) {
      const sharedPaths = findSharedPathways(peptideNames);
      return Math.min(Math.round(stack.synergyBonus * 0.75) + Math.min(sharedPaths.length * 3, 10), 90);
    }
  }

  const sharedPathways = findSharedPathways(peptideNames);
  return Math.min(50 + sharedPathways.length * 10, 85);
}

function findSharedPathways(peptideNames: string[]): string[] {
  const allPathways: string[][] = [];
  for (const name of peptideNames) {
    const p = getPeptidePathway(name);
    if (p) allPathways.push(p.pathways);
  }
  if (allPathways.length < 2) return [];
  const counts = new Map<string, number>();
  for (const paths of allPathways) {
    for (const p of paths) counts.set(p, (counts.get(p) || 0) + 1);
  }
  return Array.from(counts.entries()).filter(([, c]) => c >= 2).map(([p]) => p);
}

function getActiveSystems(peptideNames: string[]): string[] {
  const systems = new Set<string>();
  for (const name of peptideNames) {
    const p = getPeptidePathway(name);
    if (p) p.systems.forEach(s => systems.add(s.toLowerCase()));
  }
  return Array.from(systems);
}

export default function StackShare() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: stack, isLoading, isError } = useQuery<SharedStackData>({
    queryKey: ["/api/saved-stacks/share", shareCode],
    queryFn: async () => {
      const res = await fetch(`/api/saved-stacks/share/${shareCode}`);
      if (!res.ok) throw new Error("Stack not found");
      return res.json();
    },
    retry: false,
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!stack,
  });

  const forkMutation = useMutation<{ shareCode: string; name: string; alreadyOwned?: boolean }>({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/saved-stacks/fork/${shareCode}`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-stacks"] });
      if (data.alreadyOwned) {
        toast({ title: "Already in your collection", description: "This is your own stack — view it in your dashboard." });
      } else {
        toast({ title: "Saved to your collection", description: `"${data.name}" has been added to your Stacks.` });
      }
    },
    onError: () => {
      toast({ title: "Save failed", description: "Please try again", variant: "destructive" });
    },
  });

  const sanitizeName = (n: string) => n.replace(/\s*\([^)]*\)/g, '').trim();
  const displayNames = stack ? stack.peptideNames.map(sanitizeName) : [];
  const synergyScore = stack ? calculateSynergyScore(displayNames) : 0;
  const activeSystems = stack ? getActiveSystems(displayNames) : [];
  const slugs = displayNames.map(nameToSlug);
  const pathwayOverlaps = stack ? detectPathwayOverlaps(slugs) : [];

  const stackPeptides = stack?.peptideIds.map((id, i) => {
    const product = allProducts?.find(p => p.id === id);
    const dosage = product?.dosageOptions?.[0] ?? undefined;
    return { id, name: displayNames[i] || id, dosage };
  }) ?? [];

  const shareUrl = `https://reviveresearch.co/stacks/${shareCode}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Share URL copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the URL from the address bar", variant: "destructive" });
    }
  }, [shareUrl, toast]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: stack?.name || "Research Stack",
          text: `Check out this research stack: ${stack?.name} — ${synergyScore}% synergy score`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share — no-op
      }
    } else {
      handleCopyLink();
    }
  }, [stack, synergyScore, shareUrl, handleCopyLink]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !stack) return;
    try {
      toast({ title: "Preparing image...", description: "This may take a moment" });
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        style: { borderRadius: "0" },
      });
      const link = document.createElement("a");
      link.download = `revive-stack-${slugify(stack.name)}-${shareCode}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Image downloaded" });
    } catch (err) {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  }, [stack, shareCode, toast]);

  const handleAddToCart = useCallback(() => {
    if (!stack) return;
    navigate(`/research-stacks?share=${shareCode}`);
  }, [stack, shareCode, navigate]);

  const handleSaveToCollection = useCallback(() => {
    if (!isAuthenticated) {
      login(window.location.pathname);
      return;
    }
    forkMutation.mutate();
  }, [isAuthenticated, login, forkMutation]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0f0f12] py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="w-full rounded-xl" style={{ aspectRatio: "1200/630" }} />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !stack) {
    return (
      <main className="min-h-screen bg-[#0f0f12] py-24 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Stack Not Found</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            This research stack may have been deleted or the link may be incorrect.
          </p>
          <Button variant="outline" onClick={() => navigate("/research-stacks")} className="border-[#2a2a32]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Build a Stack
          </Button>
        </div>
      </main>
    );
  }

  const ogImageUrl = `/api/stack-preview/${shareCode}.png`;

  return (
    <>
      <SEOHead
        title={`${stack.name} · Revive Research Stack`}
        description={`${stack.name} — a custom research stack with ${displayNames.length} compounds and ${synergyScore}% synergy score. View and share at Revive Research.`}
        canonicalPath={`/stacks/${shareCode}`}
        ogImage={ogImageUrl}
      />

      <main className="min-h-screen bg-[#0f0f12] py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Back nav */}
          <button
            onClick={() => navigate("/research-stacks")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            data-testid="button-back-to-builder"
          >
            <ArrowLeft className="h-4 w-4" />
            Research Stacks
          </button>

          {/* Stack Card */}
          <div data-testid="stack-card-wrapper">
            <StackCard
              ref={cardRef}
              name={stack.name}
              shareCode={shareCode}
              peptides={stackPeptides}
              synergyScore={synergyScore}
              activeSystems={activeSystems}
              pathwayOverlaps={pathwayOverlaps}
            />
          </div>

          {/* Action row */}
          <div className="flex flex-wrap gap-3 pt-1" data-testid="action-row">
            <Button
              onClick={handleAddToCart}
              className="bg-[#E7FB10] text-black font-semibold"
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveToCollection}
              disabled={forkMutation.isPending}
              className="border-[#21d8ff]/40 text-[#21d8ff]"
              data-testid="button-save-to-collection"
            >
              {!isAuthenticated && <Lock className="h-3.5 w-3.5 mr-1.5 opacity-70" />}
              {forkMutation.isSuccess ? <Check className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
              {forkMutation.isPending ? "Saving…" : forkMutation.isSuccess ? "Saved" : "Save to Collection"}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-[#2a2a32] text-muted-foreground"
              data-testid="button-download-png"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>

            <Button
              variant="outline"
              onClick={handleNativeShare}
              className="border-[#2a2a32] text-muted-foreground"
              data-testid="button-share"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="border-[#2a2a32] text-muted-foreground"
              data-testid="button-copy-link"
            >
              <Link className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>

          {/* Peptide detail list */}
          <div className="rounded-xl border border-[#2a2a32] bg-[#1a1a1f] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Research Compounds</h2>
            <div className="space-y-2">
              {displayNames.map((name, i) => {
                const product = allProducts?.find(p => p.id === stack.peptideIds[i]);
                const isUnavailable = allProducts ? (product ? !product.inStock : true) : false;
                return (
                <div
                  key={stack.peptideIds[i]}
                  className={`flex items-center justify-between gap-3 py-2 border-b border-[#2a2a32] last:border-0 ${isUnavailable ? "opacity-50" : ""}`}
                  data-testid={`row-peptide-${i}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isUnavailable ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-[#E7FB10]/10 border border-[#E7FB10]/30 text-[#E7FB10]"}`}>{i + 1}</span>
                    <span className={`text-sm font-medium ${isUnavailable ? "line-through text-muted-foreground" : "text-white"}`} data-testid={`text-peptide-name-${i}`}>{name}</span>
                  </div>
                  {isUnavailable ? (
                    <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400 no-default-hover-elevate no-default-active-elevate">
                      Unavailable
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-[#2a2a32] text-muted-foreground no-default-hover-elevate no-default-active-elevate">
                      Research Use Only
                    </Badge>
                  )}
                </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">Synergy Score</span>
              <span className="text-sm font-bold text-[#E7FB10]" data-testid="text-synergy-score">{synergyScore}%</span>
            </div>
          </div>

          {/* Share URL display */}
          <div className="rounded-xl border border-[#2a2a32] bg-[#1a1a1f] p-4 flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono flex-1 truncate" data-testid="text-share-url">{shareUrl}</span>
            <Button size="sm" variant="outline" onClick={handleCopyLink} className="border-[#2a2a32] shrink-0" data-testid="button-copy-url">
              Copy
            </Button>
          </div>

          {/* Compliance note */}
          <p className="text-[11px] text-muted-foreground/60 text-center pb-6">
            For research use only. Not intended for human consumption, therapeutic use, or self-administration.
          </p>
        </div>
      </main>
    </>
  );
}
