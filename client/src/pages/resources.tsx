import { motion } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { FileCheck, GraduationCap, Scale, BookOpen, ArrowRight, Shield, FlaskConical, Search, DollarSign, HelpCircle } from "lucide-react";

const guides = [
  {
    title: "Are Peptide COAs Trustworthy?",
    description: "What COAs prove, their limitations, and how to evaluate quality claims.",
    href: "/guides/coa-trust",
    icon: FileCheck,
    color: "#21d8ff",
  },
  {
    title: "How Batch Testing Works",
    description: "Why no one tests every vial and what this means for quality.",
    href: "/guides/batch-testing",
    icon: FlaskConical,
    color: "#9d4edd",
  },
  {
    title: "What 'Research Use Only' Means",
    description: "Clear explanation of RUO labeling and compliance.",
    href: "/guides/research-use-only",
    icon: Scale,
    color: "#22c55e",
  },
  {
    title: "How to Verify Peptide Quality",
    description: "Independent verification without trusting the seller.",
    href: "/guides/verify-quality",
    icon: Search,
    color: "#E7FB10",
  },
  {
    title: "What Purity Percentages Mean",
    description: "Understanding HPLC results and why higher isn't always better.",
    href: "/guides/purity-explained",
    icon: HelpCircle,
    color: "#a855f7",
  },
  {
    title: "Why Cheap Peptides Are Cheap",
    description: "Where low-price vendors cut corners and when price matters.",
    href: "/guides/cheap-peptides",
    icon: DollarSign,
    color: "#ec4899",
  },
];

const resources = [
  {
    title: "COA Library",
    description: "Browse and verify Certificates of Analysis for all our peptide batches. Find detailed testing results, purity data, and analysis verification.",
    href: "/coa-library",
    icon: FileCheck,
    color: "#E7FB10",
  },
  {
    title: "Education Center",
    description: "Comprehensive learning resources covering peptide research, storage best practices, reading COAs, batch numbers, and research expectations.",
    href: "/education",
    icon: GraduationCap,
    color: "#21d8ff",
  },
  {
    title: "Legal & Compliance",
    description: "Important regulatory information, FDA compliance statements, researcher responsibilities, and legal disclaimers for research use.",
    href: "/legal",
    icon: Scale,
    color: "#9d4edd",
  },
  {
    title: "What We Don't Do",
    description: "Our ethical commitments and what we explicitly do not support. Transparency about our business practices and values.",
    href: "/what-we-dont-do",
    icon: BookOpen,
    color: "#ec4899",
  },
  {
    title: "FAQ",
    description: "Frequently asked questions about ordering, shipping, product analysis, storage, and general support.",
    href: "/faq",
    icon: BookOpen,
    color: "#f97316",
  },
];

export default function ResourcesHub() {
  return (
    <main className="min-h-screen pt-32">
      <SEOHead title="Research Resources" description="Tools and guides for peptide researchers. Calculators, protocols, and educational materials." canonicalPath="/resources" />
      {/* Hero Section */}
      <section className="relative pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9d4edd]/8 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(157,78,221,0.12),transparent_60%)]" />

        <div className="container max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            data-testid="text-resources-headline"
          >
            Resource <span className="text-[#9d4edd]">Central</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-resources-subheadline"
          >
            Everything you need to understand peptide research, verify analysis, and make informed decisions. Explore our comprehensive library of resources.
          </motion.p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="pb-20 relative">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <motion.div
                  key={resource.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 10, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link href={resource.href} onClick={() => window.scrollTo(0, 0)}>
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="h-full group"
                    >
                      <Card 
                        className="h-full p-6 hover-elevate cursor-pointer border-l-4 relative overflow-hidden"
                        style={{ borderLeftColor: resource.color }}
                      >
                        <div
                          className="absolute inset-0 rounded-md pointer-events-none group-hover:wipe-animation"
                          style={{ 
                            backgroundColor: `${resource.color}15`,
                            transform: "translateX(100%)"
                          }}
                        />
                        <div className="relative z-10 flex items-start gap-4 mb-3">
                          <motion.div 
                            className="p-3 rounded-lg"
                            whileHover={{ scale: 1.25 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            style={{ backgroundColor: `${resource.color}20` }}
                          >
                            <Icon className="h-6 w-6" style={{ color: resource.color }} />
                          </motion.div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2 relative z-10" data-testid={`text-resource-${resource.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 relative z-10">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm font-medium transition-all duration-300 relative z-10"
                          style={{ color: resource.color }}
                        >
                          Explore
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Verification Guides */}
      <section className="pb-20 relative">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Trust & <span className="text-[#21d8ff]">Verification Guides</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Honest, no-hype guides to help you evaluate any peptide supplier — including us. Skepticism is healthy.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <motion.div
                  key={guide.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={guide.href}>
                    <Card className="p-4 hover:border-[#21d8ff]/50 transition-colors cursor-pointer group h-full">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${guide.color}20` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: guide.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 group-hover:text-[#21d8ff] transition-colors flex items-center gap-2">
                            {guide.title}
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {guide.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
