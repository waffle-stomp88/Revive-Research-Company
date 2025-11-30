import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Snowflake,
  CheckCircle2,
  FileCheck,
  Package,
  Truck,
  ArrowRight,
  Shield,
} from "lucide-react";

const processSteps = [
  {
    id: 1,
    title: "Synthesis",
    icon: FlaskConical,
    color: "#E7FB10",
    description: "Peptide synthesis using advanced solid-phase techniques",
    details: [
      "High-purity amino acid building blocks",
      "Automated synthesis protocols",
      "Real-time monitoring for quality control",
      "Multiple purification cycles",
    ],
  },
  {
    id: 2,
    title: "Lyophilization",
    icon: Snowflake,
    color: "#21d8ff",
    description: "Freeze-drying process for long-term stability",
    details: [
      "Controlled freezing at -80°C",
      "Vacuum sublimation of water",
      "Preserves peptide structure",
      "Creates stable powder form",
    ],
  },
  {
    id: 3,
    title: "Quality Control",
    icon: CheckCircle2,
    color: "#22c55e",
    description: "Internal QC checks before third-party testing",
    details: [
      "Visual inspection for appearance",
      "Weight verification per vial",
      "Label accuracy check",
      "Packaging integrity",
    ],
  },
  {
    id: 4,
    title: "Third-Party Testing",
    icon: FileCheck,
    color: "#9d4edd",
    description: "Independent laboratory verification",
    details: [
      "HPLC purity analysis (98%+ target)",
      "Mass spectrometry confirmation",
      "Endotoxin screening",
      "Batch-specific COA generation",
    ],
  },
  {
    id: 5,
    title: "Packaging",
    icon: Package,
    color: "#f97316",
    description: "Secure packaging with full traceability",
    details: [
      "Pharmaceutical-grade vials",
      "Batch-specific labels with QR codes",
      "Tamper-evident seals",
      "Cold pack preparation",
    ],
  },
  {
    id: 6,
    title: "Fulfillment",
    icon: Truck,
    color: "#ec4899",
    description: "Fast, temperature-controlled shipping",
    details: [
      "Same-day processing before 12:00 CT",
      "Cold chain maintenance",
      "Discreet packaging",
      "Tracking provided",
    ],
  },
];

export default function QualityProcess() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
            Transparency
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-quality-title">
            Our Quality & Production Process
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From synthesis to your laboratory — every step of our process is designed 
            for quality, consistency, and complete traceability.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-6 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#21d8ff]/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#21d8ff]" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2">Why We Show This</h2>
                <p className="text-muted-foreground">
                  Most vendors hide their process. We believe transparency builds trust. 
                  When you understand how your research compounds are made and tested, 
                  you can make informed decisions about your research.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden lg:block" />
          
          <div className="space-y-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`lg:grid lg:grid-cols-2 gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
                >
                  <div className={`${isEven ? 'lg:text-right lg:pr-12' : 'lg:order-2 lg:pl-12'}`}>
                    <Card 
                      className="p-6 relative overflow-hidden"
                      style={{ borderColor: `${step.color}30` }}
                      data-testid={`card-step-${step.id}`}
                    >
                      <div 
                        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl"
                        style={{ backgroundColor: step.color }}
                      />
                      
                      <div className={`flex items-start gap-4 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                        <div 
                          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${step.color}20` }}
                        >
                          <Icon className="h-7 w-7" style={{ color: step.color }} />
                        </div>
                        
                        <div className={`flex-1 ${isEven ? 'lg:text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ borderColor: step.color, color: step.color }}
                            >
                              Step {step.id}
                            </Badge>
                          </div>
                          <h3 className="font-display text-xl font-bold mb-2" style={{ color: step.color }}>
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {step.description}
                          </p>
                          <ul className={`space-y-2 ${isEven ? 'lg:text-right' : ''}`}>
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                {!isEven && <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: step.color }} />}
                                <span>{detail}</span>
                                {isEven && <CheckCircle2 className="h-4 w-4 flex-shrink-0 lg:order-first" style={{ color: step.color }} />}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className={`hidden lg:flex items-center justify-center ${isEven ? 'lg:order-2' : ''}`}>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center border-4 bg-background z-10"
                      style={{ borderColor: step.color }}
                    >
                      <span className="font-display font-bold" style={{ color: step.color }}>
                        {step.id}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Card className="p-8 border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 to-transparent" data-testid="card-traceability">
            <h3 className="font-display text-2xl font-bold mb-4">
              Every Vial is Traceable
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Each product you receive includes a QR code that links directly to its 
              batch-specific Certificate of Analysis. Scan it anytime to verify exactly 
              what you're working with.
            </p>
            <a href="/coa-library" className="inline-flex items-center gap-2 text-[#E7FB10] hover:underline" data-testid="link-coa-system">
              <span className="font-semibold">Learn more about our COA system</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
