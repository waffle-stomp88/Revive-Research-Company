import { motion } from "framer-motion";
import { SEOHead, SEO_CONFIG } from "@/components/seo-head";
import { Droplets, Syringe, Package, AlertCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const comingSoonItems = [
  {
    name: "Bacteriostatic Water",
    description: "USP-grade sterile water with 0.9% benzyl alcohol for safe reconstitution",
    icon: Droplets,
    sizes: ["10mL", "30mL"],
  },
  {
    name: "Insulin Syringes",
    description: "Precision 29G and 31G syringes for accurate dosing",
    icon: Syringe,
    sizes: ["0.5mL", "1mL"],
  },
  {
    name: "Alcohol Swabs",
    description: "70% isopropyl alcohol prep pads for proper sterilization",
    icon: Package,
    sizes: ["Box of 100", "Box of 200"],
  },
];

export default function Supplies() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <SEOHead {...SEO_CONFIG.supplies} canonicalPath="/supplies" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9d4edd]/10 border border-[#9d4edd]/30 mb-4">
            <Clock className="h-4 w-4 text-[#9d4edd]" />
            <span className="text-sm font-medium text-[#9d4edd]">Coming Soon</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Research Supplies
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Essential supplies for peptide research. Bacteriostatic water, syringes, and more 
            to complement your research compounds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="font-display text-2xl font-semibold mb-6 text-center">Essential Research Supplies</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {comingSoonItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="p-6 border-border/50 hover:border-[#9d4edd]/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#9d4edd]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-[#9d4edd]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex gap-1">
                        {item.sizes.map((size) => (
                          <Badge key={size} variant="outline" className="text-[10px] border-[#9d4edd]/30 text-[#9d4edd]">{size}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-12 p-4 border border-red-500/30 rounded-lg bg-red-500/5">
          <p className="text-xs text-red-400/80 text-center animate-pulse-subtle">
            <strong>Research Use Only:</strong> All supplies are intended for legitimate research purposes only. 
            Not for human consumption.
          </p>
        </div>
      </div>
    </main>
  );
}
