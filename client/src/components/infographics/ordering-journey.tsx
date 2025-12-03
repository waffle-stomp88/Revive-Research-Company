import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Package,
  Truck,
  Home,
  ChevronRight
} from "lucide-react";

const journeySteps = [
  {
    id: 1,
    title: "Browse & Select",
    icon: ShoppingCart,
    color: "#E7FB10",
    shortDesc: "Explore products",
    details: ["View product details", "Check availability", "Read COAs & specs"],
    timeline: "Instant"
  },
  {
    id: 2,
    title: "Add to Cart",
    icon: ShoppingCart,
    color: "#21d8ff",
    shortDesc: "Customize order",
    details: ["Choose dosage", "Select quantity", "Add accessories (BAC water)"],
    timeline: "Minutes"
  },
  {
    id: 3,
    title: "Checkout",
    icon: CreditCard,
    color: "#9d4edd",
    shortDesc: "Secure payment",
    details: ["Review order", "Verify 21+ age", "Confirm RUO", "Accept no-refund policy"],
    timeline: "5 mins"
  },
  {
    id: 4,
    title: "Order Confirmed",
    icon: CheckCircle2,
    color: "#22c55e",
    shortDesc: "Verification sent",
    details: ["Email confirmation", "Tracking number generated", "QR code activated"],
    timeline: "Instantly"
  },
  {
    id: 5,
    title: "Prepared & Packed",
    icon: Package,
    color: "#f97316",
    shortDesc: "Quality checked",
    details: ["Products verified", "Cold packs added", "Tamper seals applied", "QR label attached"],
    timeline: "24 hours"
  },
  {
    id: 6,
    title: "Shipped",
    icon: Truck,
    color: "#ec4899",
    shortDesc: "On the way",
    details: ["Same-day or next-day shipping", "Full cold chain maintained", "Real-time tracking"],
    timeline: "24-48 hrs"
  },
  {
    id: 7,
    title: "Delivered",
    icon: Home,
    color: "#06b6d4",
    shortDesc: "At your door",
    details: ["Signature may be required", "Verify packaging integrity", "Scan QR to verify authenticity"],
    timeline: "1-2 days"
  }
];

export function OrderingJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div ref={containerRef} className="relative py-12 px-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-[#E7FB10]">
          Your Research Supply Journey
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From browsing to your door in 7 simple steps. Track your order every step of the way with our transparent fulfillment process.
        </p>
      </motion.div>

      {/* Timeline visualization */}
      <div className="hidden lg:block absolute top-32 left-0 right-0 h-1">
        <div className="relative h-full mx-16">
          <div className="absolute inset-0 bg-border/30 rounded-full" />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #E7FB10, #21d8ff, #9d4edd, #22c55e, #f97316, #ec4899, #06b6d4)",
            }}
            initial={{ width: "0%" }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
          />
          
          {/* Animated dots along the timeline */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40"
              style={{ left: `${(i + 1) * 3.3}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { 
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0.5]
              } : {}}
              transition={{ 
                delay: 0.3 + (i * 0.05),
                duration: 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 relative z-10 mt-8">
        {journeySteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="relative h-full"
              onMouseEnter={() => setActiveStep(step.id)}
              onMouseLeave={() => setActiveStep(null)}
              data-testid={`ordering-journey-step-${step.id}`}
            >
              {/* Step card */}
              <motion.div
                className="relative bg-card border-2 rounded-xl p-4 cursor-pointer overflow-hidden h-full flex flex-col transition-all duration-300"
                style={{ 
                  borderColor: isActive ? step.color : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 0 30px ${step.color}40, inset 0 0 20px ${step.color}10` : 'none'
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Background glow */}
                <motion.div
                  className="absolute inset-0 opacity-0"
                  style={{ 
                    background: `radial-gradient(circle at center, ${step.color}25 0%, transparent 70%)`
                  }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative flex-1 flex flex-col">
                  {/* Step number and icon */}
                  <div className="flex items-center justify-between mb-3">
                    <motion.div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${step.color}20` }}
                      animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-5 w-5" style={{ color: step.color }} />
                    </motion.div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-1"
                      style={{ 
                        backgroundColor: `${step.color}20`,
                        color: step.color
                      }}
                    >
                      {step.id}/7
                    </span>
                  </div>
                  
                  {/* Title and description */}
                  <h4 className="font-display font-bold text-sm mb-1 line-clamp-2" style={{ color: step.color }}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {step.shortDesc}
                  </p>
                  
                  {/* Timeline indicator */}
                  <div className="text-[10px] text-muted-foreground/60 mb-3 font-medium">
                    {step.timeline}
                  </div>
                  
                  {/* Expandable details */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: isActive ? "auto" : 0,
                      opacity: isActive ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden flex-1"
                  >
                    <ul className="space-y-1 pt-2 border-t border-border/30 mt-auto">
                      {step.details.map((detail, i) => (
                        <motion.li
                          key={i}
                          className="text-[11px] text-muted-foreground flex items-start gap-1.5"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: step.color }} />
                          <span>{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-12 p-6 rounded-lg border border-[#21d8ff]/30 bg-[#21d8ff]/5 text-center max-w-2xl mx-auto"
      >
        <h3 className="font-display font-semibold text-[#21d8ff] mb-2">Total Delivery Time</h3>
        <p className="text-sm text-muted-foreground mb-3">
          <span className="text-[#E7FB10] font-bold">24-48 hours</span> from checkout to your door with same-day processing and optional next-day shipping
        </p>
        <p className="text-xs text-muted-foreground">
          All orders include cold packs, QR-verified authenticity, and full tracking. Your package integrity is guaranteed.
        </p>
      </motion.div>
    </div>
  );
}
