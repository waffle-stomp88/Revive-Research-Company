import { motion, useInView } from "framer-motion";
import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";
import { useRef } from "react";
import { 
  Shield, 
  FlaskConical, 
  Truck,
  HeadphonesIcon,
  Award,
  FileCheck,
} from "lucide-react";
import { useHoverCapable } from "@/hooks/use-hover-capable";

const reasons = [
  {
    icon: FlaskConical,
    title: "Rigorous Testing Standards",
    description: "Every batch undergoes HPLC purity analysis and mass spectrometry confirmation.",
    color: "#E7FB10",
  },
  {
    icon: Shield,
    title: "Complete Transparency",
    description: "Full COA documentation and QR-verifiable authenticity for every product.",
    color: "#21d8ff",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: `3–5 business day delivery via UPS Ground with same-day dispatch options. Free shipping over $${FREE_SHIPPING_THRESHOLD}.`,
    color: "#22c55e",
  },
  {
    icon: HeadphonesIcon,
    title: "Expert Support",
    description: "Dedicated support team with deep knowledge of research compounds.",
    color: "#9d4edd",
  },
  {
    icon: Award,
    title: "Research-Grade Quality",
    description: "Premium compounds meeting the highest standards for scientific research.",
    color: "#ec4899",
  },
  {
    icon: FileCheck,
    title: "COA on Every Product",
    description: "Third-party verified Certificates of Analysis included with every order.",
    color: "#21d8ff",
  },
];

function ReasonCard({ reason, index }: { reason: typeof reasons[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const Icon = reason.icon;
  const hoverCapable = useHoverCapable();

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div 
        className="absolute inset-0 rounded-xl opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${reason.color}10 0%, transparent 70%)`,
        }}
      />
      
      <div 
        className="relative p-6 rounded-xl border transition-all duration-300 group-hover:border-opacity-60 h-full"
        style={{
          borderColor: `${reason.color}30`,
          background: 'linear-gradient(135deg, rgba(26, 26, 31, 0.8) 0%, rgba(26, 26, 31, 0.4) 100%)',
        }}
      >
        <motion.div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{
            background: `${reason.color}15`,
            border: `1px solid ${reason.color}30`,
          }}
          whileHover={hoverCapable ? { scale: 1.1, rotate: 5 } : {}}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon 
            className="h-6 w-6" 
            style={{ 
              color: reason.color,
              filter: `drop-shadow(0 0 8px ${reason.color}60)`
            }} 
          />
        </motion.div>
        
        <h3 
          className="font-display text-lg font-bold mb-2"
          style={{ color: reason.color }}
        >
          {reason.title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {reason.description}
        </p>
        
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl opacity-0 md:group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${reason.color}, transparent)` }}
          initial={{ scaleX: 0 }}
          whileHover={hoverCapable ? { scaleX: 1 } : {}}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

export function WhyResearchersChooseUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const hoverCapable = useHoverCapable();

  return (
    <section ref={containerRef} className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#21d8ff]/5 to-background" />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#21d8ff]/10 rounded-full blur-[120px]"
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#9d4edd]/10 rounded-full blur-[100px]"
          animate={{ 
            opacity: [0.1, 0.25, 0.1],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.1) 0%, rgba(157, 78, 221, 0.05) 100%)',
              borderColor: 'rgba(33, 216, 255, 0.4)',
              boxShadow: '0 0 25px rgba(33, 216, 255, 0.2)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Award className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
            <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] bg-clip-text text-transparent">
              Trusted by Researchers
            </span>
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#21d8ff] via-[#E7FB10] to-[#9d4edd]">
              Why Researchers Choose Us
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing the highest quality research compounds with 
            complete transparency and exceptional service.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div key={reason.title} className={index >= 3 ? "hidden md:block" : ""}>
              <ReasonCard reason={reason} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
