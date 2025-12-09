import { motion } from "framer-motion";
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
        >
          <Card className="p-8 border-2 border-[#9d4edd]/30 bg-gradient-to-br from-[#9d4edd]/5 to-background text-center mb-8">
            <AlertCircle className="h-12 w-12 text-[#9d4edd] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Supplies Section Coming Soon</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              We're adding research supplies to make Revive Research your one-stop shop. 
              Sign up for updates to be notified when supplies become available.
            </p>
            <Button variant="outline" className="border-[#9d4edd] text-[#9d4edd] hover:bg-[#9d4edd]/10">
              Notify Me When Available
            </Button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="font-display text-xl font-semibold mb-4 text-center">What's Coming</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {comingSoonItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="p-5 border-border/50 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <Badge variant="secondary" className="text-[10px]">Soon</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex gap-1">
                        {item.sizes.map((size) => (
                          <Badge key={size} variant="outline" className="text-[10px]">{size}</Badge>
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
