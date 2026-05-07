import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Zap, TrendingUp, AlertCircle } from "lucide-react";

interface ApproachData {
  id: string;
  title: string;
  description: string;
  color: string;
  characteristics: string[];
  concerns: string[];
}

const approaches: ApproachData[] = [
  {
    id: "tesamorelin",
    title: "Tesamorelin (GHRH Analog)",
    description: "Stimulates natural pituitary GH release through GHRH pathway",
    color: "#ec4899",
    characteristics: [
      "Physiological pulsatile GH release",
      "Preserves feedback mechanisms",
      "Lower insulin resistance risk",
      "Reduced fluid retention"
    ],
    concerns: [
      "May have antibody formation over time"
    ]
  },
  {
    id: "direct-gh",
    title: "Direct Recombinant GH",
    description: "Exogenous GH administration bypasses pituitary control",
    color: "#f97316",
    characteristics: [
      "Supraphysiologic constant levels",
      "Rapid effects on body composition",
      "IGF-1 feedback overridden"
    ],
    concerns: [
      "Increased insulin resistance",
      "Carpal tunnel syndrome",
      "Joint/fluid retention",
      "Thyroid suppression risk"
    ]
  }
];

export function TesomorellinComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeTab, setActiveTab] = useState<string>("tesamorelin");

  return (
    <div ref={ref} className="py-8" data-testid="tesamorelin-comparison">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          Tesamorelin vs Direct GH Administration
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Understanding the differences between physiological and supraphysiologic GH approaches
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card border rounded-xl overflow-hidden"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <div className="grid grid-cols-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
            {approaches.map((approach) => (
              <motion.button
                key={approach.id}
                onClick={() => setActiveTab(approach.id)}
                className="p-4 transition-all font-semibold text-sm"
                style={{
                  backgroundColor: activeTab === approach.id ? `${approach.color}20` : "transparent",
                  color: activeTab === approach.id ? approach.color : "rgb(107, 114, 128)",
                  borderBottom: activeTab === approach.id ? `2px solid ${approach.color}` : "none"
                }}
              >
                {approach.title.split(" ")[0]}
              </motion.button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {approaches.map((approach) => (
                activeTab === approach.id && (
                  <motion.div
                    key={approach.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-muted-foreground mb-6">
                      {approach.description}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="h-4 w-4" style={{ color: approach.color }} />
                          <h4 className="font-semibold text-sm text-foreground">
                            Key Characteristics
                          </h4>
                        </div>
                        <div className="space-y-2 ml-6">
                          {approach.characteristics.map((char, idx) => (
                            <motion.p
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className="text-xs text-muted-foreground flex items-center gap-2"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: approach.color }}
                              />
                              {char}
                            </motion.p>
                          ))}
                        </div>
                      </div>

                      {approach.concerns.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="h-4 w-4" style={{ color: approach.color }} />
                            <h4 className="font-semibold text-sm text-foreground">
                              Considerations
                            </h4>
                          </div>
                          <div className="space-y-2 ml-6">
                            {approach.concerns.map((concern, idx) => (
                              <motion.p
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="text-xs text-muted-foreground flex items-center gap-2"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: approach.color, opacity: 0.6 }}
                                />
                                {concern}
                              </motion.p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";
