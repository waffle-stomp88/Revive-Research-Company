import { FlaskConical, FileCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: FlaskConical,
    label: "Independent Testing",
    color: "#9d4edd",
  },
  {
    icon: FileCheck,
    label: "Certificate of Analysis",
    color: "#ec4899",
  },
  {
    icon: CheckCircle2,
    label: "Verified Purity",
    color: "#22c55e",
  },
];

export function MobilePipelineStrip() {
  return (
    <div className="flex items-center justify-between gap-2 px-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            <motion.div
              className="flex flex-col items-center gap-2 flex-1"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.4 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${step.color}18`,
                  border: `2px solid ${step.color}50`,
                  boxShadow: `0 0 14px ${step.color}30`,
                }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: step.color, filter: `drop-shadow(0 0 5px ${step.color})` }}
                />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight text-muted-foreground" style={{ color: step.color }}>
                {step.label}
              </span>
            </motion.div>

            {index < steps.length - 1 && (
              <ArrowRight
                className="h-4 w-4 flex-shrink-0 opacity-40"
                style={{ color: steps[index].color }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
