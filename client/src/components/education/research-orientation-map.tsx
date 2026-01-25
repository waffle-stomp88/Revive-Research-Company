import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Shield, 
  FileCheck, 
  Hash, 
  Thermometer, 
  Truck,
  CheckCircle2
} from "lucide-react";

const RESEARCH_DOMAINS = [
  {
    id: "regulatory",
    title: "Regulatory Boundaries",
    subtitle: "Understanding the research-only context and scope",
    icon: Shield,
    color: "#21d8ff",
    slug: "lab-safety-guidelines",
  },
  {
    id: "quality",
    title: "Quality Verification",
    subtitle: "COAs, third-party testing, and what to look for",
    icon: FileCheck,
    color: "#ec4899",
    slug: "how-to-read-coas",
  },
  {
    id: "traceability",
    title: "Traceability",
    subtitle: "Batch numbers, lot control, and quality tracking",
    icon: Hash,
    color: "#9d4edd",
    slug: "understanding-batches",
  },
  {
    id: "storage",
    title: "Storage & Stability",
    subtitle: "Handling fundamentals and stability factors",
    icon: Thermometer,
    color: "#f97316",
    slug: "storage-101",
  },
  {
    id: "supply-chain",
    title: "Supply Chain Flow",
    subtitle: "From sourcing to delivery—what to expect",
    icon: Truck,
    color: "#E7FB10",
    slug: "ordering-expectations",
  },
];

export function ResearchOrientationMap() {
  const [, navigate] = useLocation();
  
  return (
    <div className="hidden md:block w-full py-12">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          Explore any topic in any order—no prerequisites required.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5 relative z-10">
          {RESEARCH_DOMAINS.map((domain, index) => {
            const Icon = domain.icon;

            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative h-full"
              >
                <div
                    className="group cursor-pointer h-full transform transition-all duration-300 hover:scale-[1.03] active:scale-[1.03] hover:-translate-y-1 active:-translate-y-1"
                    data-testid={`domain-card-${domain.id}`}
                    onClick={() => navigate(`/education/${domain.slug}`)}
                  >
                    <div
                      className="relative p-5 rounded-xl transition-all duration-300 overflow-hidden h-full flex flex-col group-hover:border-2"
                      style={{
                        background: `linear-gradient(135deg, ${domain.color}12 0%, transparent 100%)`,
                        border: `1px solid ${domain.color}35`,
                        boxShadow: `0 0 20px ${domain.color}10`,
                        // @ts-ignore - dynamic hover styles applied via CSS
                        '--hover-border-color': domain.color,
                        '--hover-shadow': `0 0 35px ${domain.color}50, 0 10px 40px ${domain.color}30`,
                      } as any}
                    >
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle at center, ${domain.color}30 0%, transparent 70%)`,
                        }}
                      />
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          boxShadow: `0 0 35px ${domain.color}40, 0 8px 30px ${domain.color}25, inset 0 0 20px ${domain.color}10`,
                          border: `2px solid ${domain.color}`,
                        }}
                      />

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-110"
                            style={{
                              backgroundColor: `${domain.color}20`,
                              boxShadow: `0 0 15px ${domain.color}25`,
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color: domain.color }} />
                          </div>
                        </div>

                        <h3
                          className="font-display text-base font-bold uppercase tracking-wide mb-1.5"
                          style={{ color: domain.color }}
                        >
                          {domain.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 flex-1 leading-relaxed">{domain.subtitle}</p>

                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all"
                          style={{ color: domain.color }}
                        >
                          Explore
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </span>
                      </div>
                    </div>
                  </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-10"
      >
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border"
          style={{
            background: "rgba(34, 197, 94, 0.05)",
            borderColor: "#22c55e",
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span className="text-sm text-[#22c55e]">
            Master these five areas to become a confident researcher.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
