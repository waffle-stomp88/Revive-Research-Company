import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, X } from "lucide-react";

interface ComparisonItem {
  label: string;
  ipamorelin: boolean;
  other: boolean;
}

const comparisonData: ComparisonItem[] = [
  { label: "GH Stimulation", ipamorelin: true, other: true },
  { label: "Cortisol Effect", ipamorelin: false, other: true },
  { label: "Prolactin Effect", ipamorelin: false, other: true },
  { label: "ACTH Effect", ipamorelin: false, other: true },
  { label: "Minimal Side Effects", ipamorelin: true, other: false },
  { label: "Selective Action", ipamorelin: true, other: false },
];

export function IpamorelinComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div ref={ref} className="py-8" data-testid="ipamorelin-comparison">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          Ipamorelin: Selective Effects
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Ipamorelin's unique selectivity compared to other GH secretagogues
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-card border rounded-xl p-6 overflow-hidden"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <div className="space-y-0">
            {comparisonData.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + idx * 0.1 }}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
                className="p-4 cursor-pointer transition-all"
                style={{
                  backgroundColor: hoveredRow === idx ? "rgba(232, 251, 16, 0.1)" : "transparent",
                  borderRadius: "0.5rem",
                }}
              >
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-sm font-medium text-foreground">
                    {item.label}
                  </div>

                  <motion.div
                    animate={hoveredRow === idx ? { scale: 1.05 } : { scale: 1 }}
                    className="flex items-center justify-center p-2 rounded-lg"
                    style={{
                      backgroundColor: "rgba(232, 251, 16, 0.1)",
                      border: "1px solid rgba(232, 251, 16, 0.3)"
                    }}
                  >
                    {item.ipamorelin ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        <Check className="h-5 w-5 text-[#E7FB10]" />
                      </motion.div>
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </motion.div>

                  <motion.div
                    animate={hoveredRow === idx ? { scale: 1.05 } : { scale: 1 }}
                    className="flex items-center justify-center p-2 rounded-lg"
                    style={{
                      backgroundColor: "rgba(157, 78, 221, 0.1)",
                      border: "1px solid rgba(157, 78, 221, 0.3)"
                    }}
                  >
                    {item.other ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        <Check className="h-5 w-5 text-[#9d4edd]" />
                      </motion.div>
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div></div>
            <div className="text-center">
              <p className="text-xs font-bold text-[#E7FB10]">Ipamorelin</p>
              <p className="text-xs text-muted-foreground">Selective</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[#9d4edd]">Other GH Agents</p>
              <p className="text-xs text-muted-foreground">Non-selective</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
