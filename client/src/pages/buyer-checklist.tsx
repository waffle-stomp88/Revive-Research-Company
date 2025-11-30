import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  FileCheck,
  Truck,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const checklistItems = [
  {
    category: "Testing & Verification",
    color: "#21d8ff",
    items: [
      { question: "Does the vendor provide batch-specific COAs?", critical: true, explanation: "Each batch should have its own unique certificate, not a recycled generic one." },
      { question: "Is testing performed by third-party labs?", critical: true, explanation: "In-house testing alone is insufficient. Look for independent lab verification." },
      { question: "Can you verify the COA is current (within 6 months)?", critical: true, explanation: "Older COAs may not reflect the actual product you're receiving." },
      { question: "Does the COA include HPLC purity results?", critical: true, explanation: "High-Performance Liquid Chromatography is the standard for purity testing." },
      { question: "Is mass spectrometry verification included?", critical: false, explanation: "MS confirms molecular identity and helps ensure you're getting the right compound." },
    ],
  },
  {
    category: "Product Information",
    color: "#E7FB10",
    items: [
      { question: "Is there a batch/lot number on every vial?", critical: true, explanation: "This allows traceability back to specific testing results." },
      { question: "Are storage recommendations clearly provided?", critical: false, explanation: "Proper handling info shows the vendor understands product stability." },
      { question: "Is the product clearly labeled 'Research Use Only'?", critical: true, explanation: "This is a legal requirement for research compounds." },
      { question: "Are product descriptions accurate and non-medical?", critical: true, explanation: "Vendors making health claims are operating illegally and unethically." },
    ],
  },
  {
    category: "Business Practices",
    color: "#9d4edd",
    items: [
      { question: "Is pricing transparent with no hidden fees?", critical: false, explanation: "You should know the total cost before checkout." },
      { question: "Are shipping and return policies clearly stated?", critical: false, explanation: "Legitimate businesses don't hide their policies." },
      { question: "Is customer support accessible and responsive?", critical: false, explanation: "Can you actually reach someone if there's an issue?" },
      { question: "Does the website look professional and maintained?", critical: false, explanation: "While not definitive, quality vendors invest in their presence." },
    ],
  },
  {
    category: "Red Flags to Avoid",
    color: "#ef4444",
    isWarning: true,
    items: [
      { question: "Health claims or dosing recommendations?", critical: true, explanation: "This is illegal and indicates an unethical operation." },
      { question: "No COAs available or generic/recycled COAs?", critical: true, explanation: "Major red flag for quality and authenticity issues." },
      { question: "Pressure tactics or fake urgency?", critical: false, explanation: "Legitimate vendors don't need these tactics." },
      { question: "Prices that seem too good to be true?", critical: true, explanation: "Quality testing and synthesis has real costs." },
    ],
  },
];

export default function BuyerChecklist() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
            Researcher Resource
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-checklist-title">
            Peptide Vendor Checklist
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use this checklist to evaluate any peptide vendor—including us. 
            These are the standards every legitimate research supplier should meet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 to-transparent">
            <div className="flex items-start gap-4">
              <ClipboardCheck className="h-8 w-8 text-[#E7FB10] flex-shrink-0" />
              <div>
                <h2 className="font-display text-xl font-bold mb-2">Why This Matters</h2>
                <p className="text-muted-foreground">
                  The research peptide market has no shortage of questionable vendors. 
                  This checklist helps you identify companies that operate with integrity 
                  versus those cutting corners. Your research depends on quality compounds—
                  don't compromise.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-8">
          {checklistItems.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + sectionIndex * 0.1 }}
            >
              <Card className="overflow-hidden" style={{ borderColor: `${section.color}30` }}>
                <div 
                  className="p-4 flex items-center gap-3"
                  style={{ backgroundColor: `${section.color}10` }}
                >
                  {section.isWarning ? (
                    <AlertTriangle className="h-5 w-5" style={{ color: section.color }} />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" style={{ color: section.color }} />
                  )}
                  <h2 className="font-display text-lg font-bold" style={{ color: section.color }}>
                    {section.category}
                  </h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {section.isWarning ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <div 
                            className="w-5 h-5 rounded border-2 flex items-center justify-center"
                            style={{ borderColor: section.color }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <span className="font-medium">{item.question}</span>
                          {item.critical && !section.isWarning && (
                            <Badge variant="outline" className="text-xs bg-red-500/10 border-red-500/30 text-red-400">
                              Critical
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Separator className="my-12" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="p-8 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <div className="text-center">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-4">How We Measure Up</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                We designed Revive Research to meet or exceed every standard on this checklist. 
                Batch-specific COAs, third-party testing, transparent pricing, clear policies—
                it's all part of how we operate.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/coa-library">
                  <Button variant="outline" className="gap-2 border-[#21d8ff]/30 text-[#21d8ff] hover:bg-[#21d8ff]/10" data-testid="button-view-coa-library">
                    <FileCheck className="h-4 w-4" />
                    View Our COA Library
                  </Button>
                </Link>
                <Link href="/quality-process">
                  <Button variant="outline" className="gap-2 border-[#E7FB10]/30 text-[#E7FB10] hover:bg-[#E7FB10]/10" data-testid="button-see-process">
                    <Shield className="h-4 w-4" />
                    See Our Process
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 border-[#9d4edd]/20">
            <div className="flex items-start gap-4">
              <HelpCircle className="h-6 w-6 text-[#9d4edd] flex-shrink-0" />
              <div>
                <h3 className="font-display text-lg font-bold mb-2">Have Questions?</h3>
                <p className="text-muted-foreground mb-4">
                  If you're unsure about anything on this checklist or want to verify our 
                  practices, we're happy to answer. Transparency is what we're about.
                </p>
                <Link href="/contact">
                  <Button className="bg-[#9d4edd] text-white gap-2" data-testid="button-contact-us">
                    Contact Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
