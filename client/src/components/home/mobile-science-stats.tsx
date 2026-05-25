import { FlaskConical, Atom, Dna } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: FlaskConical,
    value: "99%+",
    label: "Purity",
    color: "#D4FF1F",
  },
  {
    icon: Atom,
    value: "3rd Party",
    label: "Verified",
    color: "#21d8ff",
  },
  {
    icon: Dna,
    value: "Research",
    label: "Grade",
    color: "#9d4edd",
  },
];

export function MobileScienceStats() {
  return (
    <div className="grid grid-cols-3 gap-3 px-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl text-center"
            style={{
              backgroundColor: `${stat.color}10`,
              border: `1px solid ${stat.color}30`,
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${stat.color}20`,
                boxShadow: `0 0 12px ${stat.color}30`,
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: stat.color, filter: `drop-shadow(0 0 4px ${stat.color})` }}
              />
            </div>
            <div>
              <div
                className="font-display text-base font-bold leading-none"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
