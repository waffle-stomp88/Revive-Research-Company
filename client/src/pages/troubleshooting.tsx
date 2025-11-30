import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  HelpCircle,
  Thermometer,
  Droplets,
  Package,
  FileX,
  Eye,
  Stamp,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const issues = [
  {
    id: "warm-package",
    icon: Thermometer,
    title: "Package Arrived Warm",
    color: "#f97316",
    summary: "Cold pack is thawed or package feels warm",
    content: {
      normalReasons: [
        "Transit time exceeded cold pack duration (24-48 hours)",
        "Hot weather during summer months",
        "Package sat in delivery vehicle",
      ],
      whenFine: [
        "Lyophilized (powder) peptides tolerate brief temperature excursions",
        "Package was in transit less than 72 hours",
        "Powder appears normal with no moisture",
        "Vial seals are intact",
      ],
      action: "Transfer to proper storage immediately (-20°C for powder, 2-8°C after reconstitution). If you have concerns about a specific shipment, contact us with photos.",
      learnMore: "/package-warm",
    },
  },
  {
    id: "clumpy-vial",
    icon: Droplets,
    title: "Powder Looks Clumpy or Uneven",
    color: "#21d8ff",
    summary: "The powder inside appears clumped or has unusual texture",
    content: {
      normalReasons: [
        "Lyophilization naturally creates varied powder textures",
        "Some peptides form loose cake vs fine powder",
        "Settling during shipping can create uneven appearance",
      ],
      whenFine: [
        "Powder is dry with no visible moisture",
        "No unusual discoloration",
        "Vial seal is intact",
        "Dissolves normally when reconstituted",
      ],
      action: "Gently tap the vial before opening. The powder should reconstitute normally with bacteriostatic water. If it doesn't dissolve or appears wet, contact us.",
    },
  },
  {
    id: "flat-powder",
    icon: Package,
    title: "Powder Appears Flat or Thin",
    color: "#9d4edd",
    summary: "Less powder than expected or very thin layer",
    content: {
      normalReasons: [
        "Peptide mass is measured in milligrams (10mg = 0.01 grams)",
        "Lyophilized peptides are extremely light and fluffy",
        "Visual appearance varies significantly between peptides",
      ],
      whenFine: [
        "This is almost always normal",
        "Weight is consistent with labeled amount",
        "Powder characteristics match batch COA",
      ],
      action: "A 10mg peptide vial will contain a very small visible amount. This is expected. Trust the weight specification and COA documentation.",
    },
  },
  {
    id: "label-smudge",
    icon: Stamp,
    title: "Label is Smudged or Damaged",
    color: "#E7FB10",
    summary: "Label printing is unclear or damaged",
    content: {
      normalReasons: [
        "Condensation during cold storage can affect labels",
        "Handling during shipping",
        "Temperature changes",
      ],
      whenFine: [
        "Product inside is unaffected by label condition",
        "You can still read batch number or scan QR code",
        "Vial seal is intact",
      ],
      action: "If you can't read the batch number or scan the QR code, contact us with your order number and we'll provide the COA directly.",
    },
  },
  {
    id: "moisture",
    icon: Droplets,
    title: "Visible Moisture Inside Vial",
    color: "#ef4444",
    summary: "Water droplets or wet appearance inside the vial",
    content: {
      normalReasons: [
        "This is NOT normal for sealed lyophilized peptides",
      ],
      whenConcern: [
        "Visible water droplets on inside of vial",
        "Powder appears wet or dissolved",
        "Seal may have been compromised",
      ],
      action: "Do not use the product. Contact us immediately with photos of the vial (including batch number visible). We will assess and arrange replacement if the product was compromised.",
    },
  },
  {
    id: "coa-link",
    icon: FileX,
    title: "COA Link Doesn't Work",
    color: "#22c55e",
    summary: "QR code or verification link isn't loading",
    content: {
      normalReasons: [
        "Temporary server issue",
        "QR code scanning problem",
        "Link copied incorrectly",
      ],
      quickFixes: [
        "Try scanning QR code again with good lighting",
        "Visit our COA Library and search by batch number",
        "Check your internet connection",
      ],
      action: "If you still can't access the COA, contact us with your batch number and we'll send the certificate directly.",
      learnMore: "/coa-library",
    },
  },
];

export default function Troubleshooting() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
            Support
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-troubleshooting-title">
            What To Do If...
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quick guides for common questions about your peptide order. 
            Most issues have simple explanations.
          </p>
        </motion.div>

        <div className="space-y-4">
          {issues.map((issue, index) => {
            const Icon = issue.icon;
            const isExpanded = expandedId === issue.id;
            
            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="overflow-hidden cursor-pointer transition-all"
                  style={{ borderColor: isExpanded ? issue.color : undefined }}
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                  data-testid={`card-issue-${issue.id}`}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${issue.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: issue.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold" style={{ color: isExpanded ? issue.color : undefined }}>
                        {issue.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{issue.summary}</p>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Separator />
                        <div className="p-4 space-y-4">
                          {issue.content.normalReasons && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Common Causes</h4>
                              <ul className="space-y-1">
                                {issue.content.normalReasons.map((reason, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: issue.color }} />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {issue.content.whenFine && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Usually Fine If...
                              </h4>
                              <ul className="space-y-1">
                                {issue.content.whenFine.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {issue.content.whenConcern && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Signs of Concern
                              </h4>
                              <ul className="space-y-1">
                                {issue.content.whenConcern.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {issue.content.quickFixes && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Quick Fixes</h4>
                              <ul className="space-y-1">
                                {issue.content.quickFixes.map((fix, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="font-mono text-xs" style={{ color: issue.color }}>{i + 1}.</span>
                                    {fix}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="p-3 rounded-lg bg-muted/50">
                            <h4 className="font-semibold mb-1 text-sm">What To Do</h4>
                            <p className="text-sm text-muted-foreground">{issue.content.action}</p>
                          </div>

                          {issue.content.learnMore && (
                            <Link href={issue.content.learnMore}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                style={{ borderColor: issue.color, color: issue.color }}
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`button-learn-more-${issue.id}`}
                              >
                                Learn More
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="p-6 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="flex items-start gap-4">
              <HelpCircle className="h-8 w-8 text-[#21d8ff] flex-shrink-0" />
              <div>
                <h3 className="font-display text-xl font-bold mb-2">Still Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  If your question isn't covered here, our support team is ready to help. 
                  We typically respond within a few hours during business days.
                </p>
                <Link href="/contact">
                  <Button className="bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90 gap-2" data-testid="button-contact-support">
                    Contact Support
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
