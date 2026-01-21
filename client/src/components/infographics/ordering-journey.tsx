import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Package,
  Truck,
  Home,
  ChevronRight,
  Clock
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
    details: ["Products verified", "Optional cold packs added if selected", "Tamper seals applied", "QR label attached"],
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
    details: ["Signature may be required", "Verify packaging integrity", "Scan QR to verify analysis"],
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

      {/* Vertical Timeline */}
      <div className="max-w-2xl mx-auto">
        <div className="relative pb-12">
          {/* Vertical line with gradient - ends at last step */}
          <div className="absolute left-6 top-0 h-[calc(100%-3rem)] w-1 bg-border/30">
            <motion.div
              className="absolute inset-x-0 top-0 w-full rounded-full"
              style={{
                background: "linear-gradient(180deg, #E7FB10, #21d8ff, #9d4edd, #22c55e, #f97316, #ec4899, #06b6d4)",
              }}
              initial={{ height: "0%" }}
              animate={isInView ? { height: "100%" } : {}}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-5 relative z-10">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="relative"
                  onMouseEnter={() => setActiveStep(step.id)}
                  onMouseLeave={() => setActiveStep(null)}
                  data-testid={`ordering-journey-step-${step.id}`}
                >
                  {/* Timeline dot */}
                  <motion.div
                    className="absolute left-0 top-2 w-12 h-12 flex items-center justify-center"
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center border-2 bg-background"
                      style={{
                        borderColor: step.color,
                        boxShadow: isActive ? `0 0 20px ${step.color}60` : `0 0 10px ${step.color}40`
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: step.color }} />
                    </div>
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    className="ml-24 bg-card border-2 rounded-xl p-3 cursor-pointer overflow-hidden transition-all duration-300"
                    style={{ 
                      borderColor: isActive ? step.color : 'rgba(255,255,255,0.1)',
                      boxShadow: isActive ? `0 0 30px ${step.color}40, inset 0 0 20px ${step.color}10` : 'none'
                    }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Background glow */}
                    <motion.div
                      className="absolute inset-0 opacity-0 -z-10"
                      style={{ 
                        background: `radial-gradient(circle at center, ${step.color}25 0%, transparent 70%)`
                      }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="relative">
                      {/* Header with title and step number */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-display font-bold text-base" style={{ color: step.color }}>
                            {step.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {step.shortDesc}
                          </p>
                        </div>
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                          style={{ 
                            backgroundColor: `${step.color}20`,
                            color: step.color
                          }}
                        >
                          Step {step.id}/7
                        </span>
                      </div>
                      
                      {/* Timeline indicator */}
                      <div className="text-[11px] text-muted-foreground/70 mb-2 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
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
                        className="overflow-hidden"
                      >
                        <ul className="space-y-1 pt-2 border-t border-border/30">
                          {step.details.map((detail, i) => (
                            <motion.li
                              key={i}
                              className="text-xs text-muted-foreground flex items-start gap-1.5"
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
        </div>
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-16 p-6 rounded-lg border border-[#21d8ff]/30 bg-[#21d8ff]/5 text-center max-w-2xl mx-auto"
      >
        <h3 className="font-display font-semibold text-[#21d8ff] mb-2">Total Delivery Time</h3>
        <p className="text-sm text-muted-foreground mb-3">
          <span className="text-[#E7FB10] font-bold">2-5 business days</span> from checkout to your door with free shipping on orders over <span className="text-[#21d8ff] font-bold">$175</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Every order includes QR-verified analysis and full tracking. Cold packs available as an optional add-on. Your package integrity is guaranteed.
        </p>
      </motion.div>
    </div>
  );
}
