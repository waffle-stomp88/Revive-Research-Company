import { useState, useMemo } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronRight,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo-head";
import { BODY_SYSTEM_HUBS, BODY_SYSTEM_HUBS_BY_SLUG } from "@/data/body-system-hubs";
import { PEPTIDE_PATHWAYS } from "@/data/peptide-pathways";
import { resolvePrimarySystem } from "@/lib/peptide-systems";
import { getStacksByPeptideNames } from "@/data/research-stacks";

function toProductSlug(id: string): string {
  return id.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Pre-compute peptides per system once at module load (not per render)
const PEPTIDES_BY_SYSTEM: Record<string, Array<{ id: string; name: string; systems: string[]; pathways: string[]; mechanisms: string[] }>> = {};
for (const [id, data] of Object.entries(PEPTIDE_PATHWAYS)) {
  const sys = resolvePrimarySystem(data.systems);
  if (!PEPTIDES_BY_SYSTEM[sys]) PEPTIDES_BY_SYSTEM[sys] = [];
  PEPTIDES_BY_SYSTEM[sys].push({ id, ...data });
}
for (const sys of Object.keys(PEPTIDES_BY_SYSTEM)) {
  PEPTIDES_BY_SYSTEM[sys].sort((a, b) => a.name.localeCompare(b.name));
}

export default function SystemHub() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const hub = BODY_SYSTEM_HUBS_BY_SLUG[slug];

  const [deepDiveOpen, setDeepDiveOpen] = useState(false);

  const peptides = PEPTIDES_BY_SYSTEM[slug] ?? [];

  const relatedStacks = useMemo(() => {
    if (!hub) return [];
    const peptideNames = peptides.map((p) => p.name);
    return getStacksByPeptideNames(peptideNames).slice(0, 3);
  }, [hub, peptides]);

  const currentIndex = BODY_SYSTEM_HUBS.findIndex((h) => h.slug === slug);
  const prevHub = currentIndex > 0 ? BODY_SYSTEM_HUBS[currentIndex - 1] : null;
  const nextHub =
    currentIndex < BODY_SYSTEM_HUBS.length - 1 ? BODY_SYSTEM_HUBS[currentIndex + 1] : null;

  if (!hub) {
    return (
      <div className="min-h-screen bg-[#1a1a1f] flex flex-col items-center justify-center px-4 text-center gap-6">
        <SEOHead
          title="System Not Found"
          description="This body system hub does not exist. Browse all peptide research systems."
          canonicalPath="/systems"
        />
        <FlaskConical className="w-12 h-12 text-[#E7FB10] opacity-60" />
        <h1 className="text-2xl font-bold text-white">System Not Found</h1>
        <p className="text-gray-400 max-w-md">
          The body system <span className="font-mono text-[#E7FB10]">{slug}</span> doesn't exist in our research hub.
        </p>
        <Link href="/guides/peptide-education-center">
          <Button variant="outline" className="border-[#E7FB10]/40 text-[#E7FB10]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Education Center
          </Button>
        </Link>
      </div>
    );
  }

  const HubIcon = hub.icon;

  return (
    <div className="min-h-screen bg-[#1a1a1f] text-white">
      <SEOHead
        title={`${hub.name} Peptides — Research Hub`}
        description={hub.description}
        canonicalPath={`/systems/${slug}`}
      />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/guides/peptide-education-center" className="hover:text-[#E7FB10] transition-colors">
            Education Center
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-gray-300">{hub.name}</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-5"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${hub.color}18`, border: `1px solid ${hub.color}35` }}
            >
              <HubIcon className="w-7 h-7" style={{ color: hub.color }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {hub.name}
              </h1>
              <p className="text-gray-400 mt-0.5">{hub.tagline}</p>
            </div>
            <Badge
              variant="outline"
              className="ml-auto border-gray-700 text-gray-400"
              data-testid="badge-peptide-count"
            >
              {peptides.length} compound{peptides.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <p className="text-gray-300 leading-relaxed max-w-3xl">{hub.description}</p>

          {/* Quick Breakdown / Deep Dive toggle */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ backgroundColor: `${hub.color}0a`, border: `1px solid ${hub.color}25` }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: hub.color }}>
                {deepDiveOpen ? "Deep Dive" : "Quick Breakdown"}
              </h2>
              <button
                onClick={() => setDeepDiveOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                data-testid="button-toggle-deep-dive"
              >
                {deepDiveOpen ? (
                  <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Read full overview <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
            {!deepDiveOpen ? (
              <p className="text-gray-300 text-sm leading-relaxed">{hub.quickBreakdown}</p>
            ) : (
              <div className="space-y-3">
                {hub.deepDive.split("\n\n").map((para, i) => (
                  <p key={i} className="text-gray-300 text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Peptides grid */}
        <section aria-labelledby="peptides-heading">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <h2 id="peptides-heading" className="text-xl font-semibold text-white">
              Peptides in this System
            </h2>
            <span className="text-sm text-gray-500">{peptides.length} compounds — sorted A–Z</span>
          </div>

          {peptides.length === 0 ? (
            <p className="text-gray-500 text-sm">No peptides mapped to this system yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {peptides.map((peptide) => {
                const slug = toProductSlug(peptide.id);
                return (
                  <motion.div
                    key={peptide.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/peptides/${slug}`}>
                      <Card
                        className="p-4 hover-elevate cursor-pointer h-full flex flex-col gap-2"
                        style={{ borderColor: `${hub.color}20` }}
                        data-testid={`card-peptide-${peptide.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-white text-sm leading-snug">
                            {peptide.name}
                          </span>
                          <ChevronRight
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: hub.color }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {peptide.systems.slice(0, 2).map((sys) => (
                            <Badge
                              key={sys}
                              variant="outline"
                              className="text-xs border-gray-700 text-gray-500"
                            >
                              {sys}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Common Research Stacks */}
        <section aria-labelledby="stacks-heading">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <h2 id="stacks-heading" className="text-xl font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#21d8ff]" />
              Common Research Stacks
            </h2>
            <Link href="/custom-stack">
              <Button
                variant="outline"
                size="sm"
                className="border-[#E7FB10]/40 text-[#E7FB10]"
                data-testid="button-build-stack"
              >
                Build your own
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          {relatedStacks.length === 0 ? (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">
                No pre-built stacks available for this system yet.
              </p>
              <Link href="/custom-stack">
                <Button variant="outline" size="sm" className="border-[#E7FB10]/40 text-[#E7FB10]">
                  Build a custom stack <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedStacks.map((stack) => (
                <Link key={stack.id} href={`/research-stacks/${stack.id}`}>
                  <Card
                    className="p-4 hover-elevate cursor-pointer h-full flex flex-col gap-3"
                    style={{ borderColor: `${stack.color}25` }}
                    data-testid={`card-stack-${stack.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white text-sm leading-snug">{stack.name}</p>
                        <p className="text-xs text-gray-500">{stack.subtitle}</p>
                      </div>
                      {stack.badge && (
                        <Badge
                          variant="outline"
                          className="text-xs flex-shrink-0"
                          style={{ borderColor: `${stack.badgeColor}50`, color: stack.badgeColor }}
                        >
                          {stack.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
                      {stack.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {stack.peptides.map((p) => (
                        <Badge
                          key={p.name}
                          variant="outline"
                          className="text-xs border-gray-700 text-gray-500"
                        >
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Related Lab Guides */}
        {hub.relatedLabGuideSlugs.length > 0 && (
          <section aria-labelledby="guides-heading">
            <h2 id="guides-heading" className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-[#a855f7]" />
              Related Lab Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hub.relatedLabGuideSlugs.map(({ slug: guideSlug, label }) => (
                <Link key={guideSlug} href={`/guides/${guideSlug}`}>
                  <Card
                    className="p-4 hover-elevate cursor-pointer flex items-center gap-3"
                    data-testid={`card-guide-${guideSlug}`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${hub.color}15`, border: `1px solid ${hub.color}30` }}
                    >
                      <BookOpen className="w-4 h-4" style={{ color: hub.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm leading-snug">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">/guides/{guideSlug}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Continue Learning nav */}
        <div className="border-t border-gray-800 pt-8 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {prevHub ? (
              <Link href={`/systems/${prevHub.slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  data-testid="button-prev-system"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  {prevHub.name}
                </Button>
              </Link>
            ) : (
              <span />
            )}

            {nextHub && (
              <Link href={`/systems/${nextHub.slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  data-testid="button-next-system"
                >
                  {nextHub.name}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            )}
          </div>

          <div className="flex justify-center">
            <Link href="/guides/peptide-education-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-white text-xs"
                data-testid="button-back-education"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Education Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
