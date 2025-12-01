import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { FileCheck, GraduationCap, Scale, BookOpen, ArrowRight } from "lucide-react";

const resources = [
  {
    title: "COA Library",
    description: "Browse and verify Certificates of Analysis for all our peptide batches. Find detailed testing results, purity data, and authenticity verification.",
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
    description: "Frequently asked questions about ordering, shipping, product authenticity, storage, and general support.",
    href: "/faq",
    icon: BookOpen,
    color: "#f97316",
  },
];

export default function ResourcesHub() {
  return (
    <main className="min-h-screen pt-32">
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
            Everything you need to understand peptide research, verify authenticity, and make informed decisions. Explore our comprehensive library of resources.
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
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10, delay: index * 0.1 }}
                >
                  <Link href={resource.href} onClick={() => window.scrollTo(0, 0)}>
                    <Card className="h-full p-6 hover-elevate cursor-pointer border-l-4 group relative overflow-hidden"
                      style={{ borderLeftColor: resource.color }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-md"
                        initial={{ x: "100%" }}
                        whileHover={{ x: "-100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        style={{ backgroundColor: `${resource.color}15` }}
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
