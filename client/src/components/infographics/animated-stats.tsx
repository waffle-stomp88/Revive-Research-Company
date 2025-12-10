import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Shield, 
  Beaker, 
  Award, 
  Truck,
  FlaskConical,
  Users,
  Package,
  CheckCircle2
} from "lucide-react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function AnimatedCounter({ value, suffix = "", prefix = "", duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(easeProgress * value));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
}

function CircularProgress({ percentage, size = 120, strokeWidth = 8, color, delay = 0 }: CircularProgressProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg ref={ref} width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-muted/20"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
        animate={isInView ? { strokeDashoffset } : {}}
        transition={{ duration: 1.5, delay, ease: "easeOut" }}
        style={{
          filter: `drop-shadow(0 0 8px ${color}50)`,
        }}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius + 4}
        stroke={color}
        strokeWidth={1}
        fill="none"
        opacity={0.3}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 0.3 } : {}}
        transition={{ duration: 0.8, delay: delay + 0.5 }}
      />
    </svg>
  );
}

const trustStats = [
  {
    icon: Shield,
    value: 99.9,
    suffix: "%",
    label: "Purity Verified",
    description: "Every batch exceeds 98% purity threshold",
    color: "#E7FB10",
    showProgress: true,
  },
  {
    icon: Beaker,
    value: 100,
    suffix: "%",
    label: "Third-Party Tested",
    description: "Independent lab verification on every batch",
    color: "#21d8ff",
    showProgress: true,
  },
  {
    icon: Award,
    value: 100,
    suffix: "%",
    label: "COA Included",
    description: "Certificate of Analysis with every order",
    color: "#9d4edd",
    showProgress: true,
  },
  {
    icon: Truck,
    value: 24,
    suffix: "hr",
    label: "Fast Shipping",
    description: "Same-day processing before 12:00 CT",
    color: "#22c55e",
    showProgress: false,
  },
];

export function AnimatedTrustStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {trustStats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative group"
            data-testid={`stat-card-${index}`}
          >
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              style={{ backgroundColor: `${stat.color}20` }}
            />
            
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center h-full flex flex-col items-center">
              <div className="relative mb-4">
                {stat.showProgress ? (
                  <div className="relative">
                    <CircularProgress 
                      percentage={stat.value} 
                      size={100} 
                      strokeWidth={6}
                      color={stat.color}
                      delay={index * 0.15}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-8 w-8" style={{ color: stat.color }} />
                    </div>
                  </div>
                ) : (
                  <motion.div
                    className="w-[100px] h-[100px] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <Icon className="h-10 w-10" style={{ color: stat.color }} />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${stat.color}` }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    />
                  </motion.div>
                )}
              </div>
              
              <div 
                className="font-display text-3xl md:text-4xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix}
                  duration={1.5}
                />
              </div>
              
              <h4 className="font-display text-base font-semibold mb-2">
                {stat.label}
              </h4>
              
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

const companyStats = [
  { value: 50000, suffix: "+", label: "Orders Shipped", icon: Package, color: "#E7FB10" },
  { value: 10000, suffix: "+", label: "Happy Researchers", icon: Users, color: "#21d8ff" },
  { value: 500, suffix: "+", label: "Batches Tested", icon: FlaskConical, color: "#9d4edd" },
  { value: 99, suffix: "%", label: "Satisfaction Rate", icon: CheckCircle2, color: "#22c55e" },
];

export function CompanyStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {companyStats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <motion.div
              className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Icon className="h-7 w-7" style={{ color: stat.color }} />
            </motion.div>
            
            <div 
              className="font-display text-4xl md:text-5xl font-bold mb-2"
              style={{ color: stat.color }}
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            
            <p className="text-sm text-muted-foreground">
              {stat.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
