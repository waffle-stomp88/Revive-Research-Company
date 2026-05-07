import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, ChevronRight, FileCheck, BookOpen, Layers, Archive, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { EmailCapture } from "@/components/email-capture";
import type { BodySystemHub } from "@/data/body-system-hubs";

interface FAQItem {
  question: string;
  answer: string;
}

interface CTALink {
  label: string;
  href: string;
  icon?: typeof FileCheck;
  description?: string;
}

interface EntryArticleLayoutProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  badgeText: string;
  badgeColor: string;
  introText: ReactNode;
  children: ReactNode;
  faqs: FAQItem[];
  ctaLinks: CTALink[];
  publishDate?: string;
  modifiedDate?: string;
  systemHub?: BodySystemHub;
  qualityTrustHub?: boolean;
}

export function EntryArticleLayout({
  title,
  metaTitle,
  metaDescription,
  canonicalPath,
  badgeText,
  badgeColor,
  introText,
  children,
  faqs,
  ctaLinks,
  publishDate = "2026-02-05",
  modifiedDate = "2026-02-05",
  systemHub,
  qualityTrustHub,
}: EntryArticleLayoutProps) {
  useEffect(() => {
    if (!systemHub && !qualityTrustHub) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-json-ld-entry";
    if (systemHub) {
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Education Center",
            "item": "https://reviveresearch.co/guides/peptide-education-center"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": systemHub.name,
            "item": `https://reviveresearch.co/systems/${systemHub.slug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": title,
            "item": `https://reviveresearch.co${canonicalPath}`
          }
        ]
      });
    } else if (qualityTrustHub) {
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Education Center",
            "item": "https://reviveresearch.co/guides/peptide-education-center"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Quality & Trust",
            "item": "https://reviveresearch.co/guides/peptide-education-center?tab=trust"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": title,
            "item": `https://reviveresearch.co${canonicalPath}`
          }
        ]
      });
    }
    document.getElementById("breadcrumb-json-ld-entry")?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById("breadcrumb-json-ld-entry")?.remove();
    };
  }, [systemHub, qualityTrustHub, title, canonicalPath]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": metaTitle,
    "description": metaDescription,
    "author": {
      "@type": "Organization",
      "name": "Revive Research"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Revive Research",
      "url": "https://reviveresearch.co"
    },
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://reviveresearch.co${canonicalPath}`
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead 
        title={metaTitle} 
        description={metaDescription} 
        canonicalPath={canonicalPath} 
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <article className="max-w-4xl mx-auto px-4 md:px-8">
        {systemHub ? (
          <Link href="/guides/peptide-education-center">
            <Button variant="ghost" size="sm" className="mb-3 gap-2 text-muted-foreground" data-testid="button-back-to-education">
              <ArrowLeft className="h-4 w-4" />
              Back to Education Center
            </Button>
          </Link>
        ) : (
          <Link href="/guides/peptide-education-center?tab=trust">
            <Button variant="ghost" size="sm" className="mb-3 gap-2 text-muted-foreground" data-testid="button-back-to-education">
              <ArrowLeft className="h-4 w-4" />
              Back to Quality & Trust
            </Button>
          </Link>
        )}

        {systemHub && (
          <nav aria-label="Breadcrumb" className="mb-6" data-testid="nav-breadcrumb">
            <ol className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              <li>
                <Link href="/guides/peptide-education-center" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-education">
                  Education Center
                </Link>
              </li>
              <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
              <li>
                <Link
                  href={`/systems/${systemHub.slug}`}
                  className="hover:opacity-80 transition-opacity font-medium"
                  style={{ color: systemHub.color }}
                  data-testid="link-breadcrumb-system"
                >
                  {systemHub.name}
                </Link>
              </li>
              <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
              <li className="text-foreground font-medium" data-testid="text-breadcrumb-current">{title}</li>
            </ol>
          </nav>
        )}

        {qualityTrustHub && (
          <nav aria-label="Breadcrumb" className="mb-6" data-testid="nav-breadcrumb-trust">
            <ol className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              <li>
                <Link href="/guides/peptide-education-center" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-education">
                  Education Center
                </Link>
              </li>
              <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
              <li>
                <Link
                  href="/guides/peptide-education-center?tab=trust"
                  className="hover:text-foreground transition-colors font-medium"
                  style={{ color: "#21d8ff" }}
                  data-testid="link-breadcrumb-trust"
                >
                  Quality &amp; Trust
                </Link>
              </li>
              <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
              <li className="text-foreground font-medium" data-testid="text-breadcrumb-current">{title}</li>
            </ol>
          </nav>
        )}

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 sm:mb-6"
            style={{ 
              backgroundColor: `${badgeColor}1a`,
              border: `1px solid ${badgeColor}4d`
            }}
          >
            <BookOpen className="h-4 w-4" style={{ color: badgeColor }} />
            <span className="text-sm font-medium" style={{ color: badgeColor }}>
              {badgeText}
            </span>
          </motion.div>
          
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            {title}
          </h1>
          
          <div className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {introText}
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert max-w-none mb-10 sm:mb-16 sm:prose-lg"
        >
          {children}
        </motion.div>

        {faqs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 sm:mb-16"
          >
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="multiple" className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-md px-4 sm:px-5" data-testid={`faq-item-${index}`}>
                  <AccordionTrigger className="text-sm sm:text-base font-semibold text-left py-3 sm:py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 sm:pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-border pt-8 sm:pt-12"
        >
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">
            Next Steps
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Continue exploring with confidence. No pressure, no sales tactics — just information.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {ctaLinks.map((cta, index) => {
              const Icon = cta.icon || ArrowRight;
              return (
                <Link key={index} href={cta.href}>
                  <Card className="p-4 sm:p-5 hover:border-[#21d8ff]/50 transition-colors cursor-pointer group h-full">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#21d8ff]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold group-hover:text-[#21d8ff] transition-colors flex items-center gap-2">
                          {cta.label}
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {cta.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {cta.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </motion.section>

        {systemHub && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-8 mb-10"
            data-testid="section-explore-system"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
            <Link href={`/systems/${systemHub.slug}`} data-testid="link-explore-system">
              <div
                className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderColor: `${systemHub.color}33`, background: `${systemHub.color}08` }}
              >
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-0.5">Part of the</p>
                  <p className="font-display font-semibold text-base" style={{ color: systemHub.color }} data-testid="text-system-name">
                    {systemHub.name} system
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Explore more compounds, stacks, and research in this category
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: systemHub.color }} />
              </div>
            </Link>
          </motion.div>
        )}

        {qualityTrustHub && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-8 mb-10"
            data-testid="section-explore-trust"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
            <Link href="/guides/peptide-education-center?tab=trust" data-testid="link-explore-trust">
              <div
                className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderColor: "#21d8ff33", background: "#21d8ff08" }}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#21d8ff" }} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-0.5">Explore trust content</p>
                    <p className="font-display font-semibold text-base" style={{ color: "#21d8ff" }}>
                      Quality &amp; Trust hub
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Browse all guides on COAs, batch testing, purity, and verification
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: "#21d8ff" }} />
              </div>
            </Link>
          </motion.div>
        )}

        <EmailCapture
          heading="Join our research community"
          description="Get new guides, product launches, and research insights delivered to your inbox. No pressure, no spam — just knowledge."
          source="article_footer"
          className="mt-12"
        />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground text-center">
            This article is part of the{" "}
            <Link href="/guides/peptide-education-center" className="text-[#21d8ff] hover:underline">
              Revive Education Library
            </Link>
            . We believe informed researchers make better decisions.
          </p>
        </motion.section>
      </article>
    </main>
  );
}

export function ArticleSection({ 
  title, 
  children,
  variant = "default" 
}: { 
  title: string; 
  children: ReactNode;
  variant?: "default" | "proof" | "limitation" | "revive";
}) {
  const colors = {
    default: { border: "border-border", bg: "bg-transparent", accent: "#ffffff" },
    proof: { border: "border-[#22c55e]/30", bg: "bg-[#22c55e]/5", accent: "#22c55e" },
    limitation: { border: "border-[#f59e0b]/30", bg: "bg-[#f59e0b]/5", accent: "#f59e0b" },
    revive: { border: "border-[#21d8ff]/30", bg: "bg-[#21d8ff]/5", accent: "#21d8ff" },
  };

  const style = colors[variant];

  return (
    <section className="mb-6 sm:mb-10">
      <h2 
        className="font-display text-xl md:text-2xl font-bold mb-3 sm:mb-4"
        style={{ color: variant !== "default" ? style.accent : undefined }}
      >
        {title}
      </h2>
      {variant !== "default" ? (
        <Card className={`p-4 sm:p-6 ${style.border} ${style.bg}`}>
          <div className="text-muted-foreground leading-relaxed space-y-2 sm:space-y-4">
            {children}
          </div>
        </Card>
      ) : (
        <div className="text-muted-foreground leading-relaxed space-y-2 sm:space-y-4">
          {children}
        </div>
      )}
    </section>
  );
}

export function BulletList({ items, color = "#21d8ff" }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-1.5 sm:space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 sm:gap-3">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" style={{ color }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
