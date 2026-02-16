import { motion } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FileCheck, BookOpen, Layers, Archive, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { EmailCapture } from "@/components/email-capture";

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
}: EntryArticleLayoutProps) {
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
        <Link href="/guides/peptide-education-center?tab=trust">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground" data-testid="button-back-to-education">
            <ArrowLeft className="h-4 w-4" />
            Back to Trust & Verification
          </Button>
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
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
          
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          
          <div className="text-lg text-muted-foreground leading-relaxed">
            {introText}
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-lg prose-invert max-w-none mb-16"
        >
          {children}
        </motion.div>

        {faqs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-4 sm:p-6">
                  <h3 className="font-semibold text-base sm:text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-border pt-12"
        >
          <h2 className="font-display text-2xl font-bold mb-2">
            Next Steps
          </h2>
          <p className="text-muted-foreground mb-8">
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
          className="mt-16 pt-8 border-t border-border"
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
    <section className="mb-10">
      <h2 
        className="font-display text-xl md:text-2xl font-bold mb-4"
        style={{ color: variant !== "default" ? style.accent : undefined }}
      >
        {title}
      </h2>
      {variant !== "default" ? (
        <Card className={`p-4 sm:p-6 ${style.border} ${style.bg}`}>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            {children}
          </div>
        </Card>
      ) : (
        <div className="text-muted-foreground leading-relaxed space-y-4">
          {children}
        </div>
      )}
    </section>
  );
}

export function BulletList({ items, color = "#21d8ff" }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
