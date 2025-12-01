import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Thermometer, 
  Snowflake, 
  Sun, 
  AlertTriangle,
  Clock,
  Droplets,
  Package,
  Info
} from "lucide-react";

interface TemperatureZone {
  id: string;
  label: string;
  range: string;
  color: string;
  position: number;
  icon: typeof Snowflake;
  recommendation: string;
  shelfLife: string;
}

const temperatureZones: TemperatureZone[] = [
  {
    id: "freezer",
    label: "Freezer",
    range: "-20°C",
    color: "#21d8ff",
    position: 10,
    icon: Snowflake,
    recommendation: "Optimal for lyophilized powder",
    shelfLife: "2+ years"
  },
  {
    id: "fridge",
    label: "Refrigerator",
    range: "2-8°C",
    color: "#22c55e",
    position: 35,
    icon: Thermometer,
    recommendation: "Required for reconstituted peptides",
    shelfLife: "2-4 weeks"
  },
  {
    id: "room",
    label: "Room Temp",
    range: "15-25°C",
    color: "#f97316",
    position: 60,
    icon: Sun,
    recommendation: "Short-term only (during use)",
    shelfLife: "Hours"
  },
  {
    id: "danger",
    label: "Danger Zone",
    range: ">30°C",
    color: "#ef4444",
    position: 85,
    icon: AlertTriangle,
    recommendation: "Avoid - causes degradation",
    shelfLife: "N/A"
  }
];

const storageStates = [
  {
    id: "lyophilized",
    title: "Lyophilized (Powder)",
    icon: Package,
    color: "#21d8ff",
    conditions: [
      { label: "Temperature", value: "-20°C (freezer)" },
      { label: "Protection", value: "Keep sealed" },
      { label: "Light", value: "Store in dark" },
      { label: "Stability", value: "2+ years" }
    ]
  },
  {
    id: "reconstituted",
    title: "Reconstituted (Solution)",
    icon: Droplets,
    color: "#9d4edd",
    conditions: [
      { label: "Temperature", value: "2-8°C (fridge)" },
      { label: "Solvent", value: "Bacteriostatic water" },
      { label: "Duration", value: "2-4 weeks max" },
      { label: "Best practice", value: "Aliquot & freeze" }
    ]
  }
];

export function StorageTemperatureGuide() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeZone, setActiveZone] = useState<string | null>(null);

  return (
    <div ref={ref} className="py-8" data-testid="storage-temperature-guide">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          Peptide Storage Temperature Guide
        </h3>
        <p className="text-sm text-muted-foreground">
          Proper temperature is critical for maintaining peptide integrity
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-card border rounded-xl p-6"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="relative h-16 mb-8">
            <div 
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: "linear-gradient(90deg, #21d8ff 0%, #22c55e 30%, #f97316 60%, #ef4444 100%)"
              }}
            />
            
            {temperatureZones.map((zone, i) => {
              const Icon = zone.icon;
              const isActive = activeZone === zone.id;
              
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${zone.position}%` }}
                  onMouseEnter={() => setActiveZone(zone.id)}
                  onMouseLeave={() => setActiveZone(null)}
                  data-testid={`temp-zone-${zone.id}`}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.2, y: -5 } : { scale: 1, y: 0 }}
                    className="relative"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 transition-all"
                      style={{ 
                        borderColor: zone.color,
                        boxShadow: isActive ? `0 0 20px ${zone.color}60` : "none"
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: zone.color }} />
                    </div>

                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                      <div className="text-xs font-bold" style={{ color: zone.color }}>
                        {zone.range}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {zone.label}
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 z-20 w-48"
                      >
                        <div 
                          className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-xl"
                          style={{ borderColor: `${zone.color}40` }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: zone.color }}>
                            {zone.recommendation}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Shelf life: {zone.shelfLife}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-4 mt-12">
            <span>← Colder (Better for storage)</span>
            <span>Warmer (Risk of degradation) →</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 gap-4 mt-6"
        >
          {storageStates.map((state, i) => {
            const Icon = state.icon;
            return (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1 + i * 0.15 }}
                className="p-4 rounded-lg bg-card/50 border"
                style={{ borderColor: `${state.color}30` }}
                data-testid={`storage-state-${state.id}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${state.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: state.color }} />
                  </div>
                  <h4 className="font-semibold text-sm" style={{ color: state.color }}>
                    {state.title}
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {state.conditions.map((condition) => (
                    <div key={condition.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{condition.label}:</span>
                      <span className="text-foreground font-medium">{condition.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4 }}
          className="mt-6 p-4 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-[#f97316] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Pro tip:</strong> For reconstituted peptides 
              you'll use over time, divide into smaller aliquots and freeze. This prevents 
              repeated freeze-thaw cycles that degrade the peptide.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function StorageQuickReference() {
  return (
    <div className="grid grid-cols-2 gap-3 py-4" data-testid="storage-quick-reference">
      <div className="p-3 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/30">
        <div className="flex items-center gap-2 mb-2">
          <Snowflake className="h-4 w-4 text-[#21d8ff]" />
          <span className="text-sm font-medium text-[#21d8ff]">Powder Form</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Store at -20°C for 2+ years stability
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/30">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="h-4 w-4 text-[#9d4edd]" />
          <span className="text-sm font-medium text-[#9d4edd]">Reconstituted</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Refrigerate at 2-8°C, use within 4 weeks
        </div>
      </div>
    </div>
  );
}
