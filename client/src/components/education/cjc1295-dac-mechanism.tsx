import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Zap, Clock } from "lucide-react";

interface DACAspect {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const dacAspects: DACAspect[] = [
  {
    id: "standard",
    title: "Native GHRH",
    description: "Rapidly degraded by enzymes, very short half-life (10 minutes)",
    color: "#21d8ff",
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: "dac",
    title: "CJC-1295 with DAC",
    description: "Drug Affinity Complex extends duration through albumin binding",
    color: "#E7FB10",
    icon: <Zap className="h-5 w-5" />
  }
];

export function CJC1295DACMechanism() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div ref={ref} className="py-8" data-testid="cjc1295-dac-mechanism">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          CJC-1295: Drug Affinity Complex Technology
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          How the DAC modification extends half-life and improves sustained GH release
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {dacAspects.map((aspect, idx) => (
          <motion.div
            key={aspect.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 + idx * 0.2 }}
            onMouseEnter={() => setActiveCard(aspect.id)}
            onMouseLeave={() => setActiveCard(null)}
            className="relative cursor-pointer transition-all"
          >
            <motion.div
              className="bg-card border rounded-xl p-6 h-full"
              animate={activeCard === aspect.id ? { scale: 1.05, y: -10 } : { scale: 1, y: 0 }}
              style={{
                borderColor: `${aspect.color}40`,
                backgroundColor: `${aspect.color}08`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${aspect.color}20`
                  }}
                >
                  <motion.div
                    animate={activeCard === aspect.id ? { scale: 1.2 } : { scale: 1 }}
                    style={{ color: aspect.color }}
                  >
                    {aspect.icon}
                  </motion.div>
                </div>
                <h4 className="font-bold text-foreground">{aspect.title}</h4>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {aspect.description}
              </p>

              {aspect.id === "standard" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={activeCard === aspect.id ? { opacity: 1 } : { opacity: 0.5 }}
                  className="space-y-2 text-xs"
                >
                  <p className="font-semibold text-red-400">Limitations:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Rapid enzymatic breakdown</li>
                    <li>• Frequent dosing required</li>
                    <li>• Less stable GH stimulation</li>
                  </ul>
                </motion.div>
              )}

              {aspect.id === "dac" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={activeCard === aspect.id ? { opacity: 1 } : { opacity: 0.5 }}
                  className="space-y-2 text-xs"
                >
                  <p className="font-semibold text-[#E7FB10]">Advantages:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Albumin binding protects from breakdown</li>
                    <li>• Extended half-life (~120 hours)</li>
                    <li>• Sustained, physiological GH release</li>
                  </ul>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 rounded-lg border"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-semibold text-[#E7FB10]">Result:</span> CJC-1295 with DAC allows for less frequent dosing (typically 1-2x weekly) while maintaining steady GH stimulation
        </p>
      </motion.div>
    </div>
  );
}
