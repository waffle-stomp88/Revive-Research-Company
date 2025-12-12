import { motion } from "framer-motion";
import { SEOHead, SEO_CONFIG } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ShieldX,
  Ban,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FlaskConical,
  Building2,
  FileCheck,
  Scale,
  MessageCircle,
} from "lucide-react";

const thingsWeDontDo = [
  {
    title: "No Human Claims",
    description:
      "We never make claims about human use, medical benefits, or therapeutic effects. Our products are strictly for laboratory research purposes.",
    icon: Ban,
  },
  {
    title: "No Medical Advice",
    description:
      "We don't provide dosing recommendations, administration guidance, or any form of medical consultation. That's between researchers and their protocols.",
    icon: MessageCircle,
  },
  {
    title: "No Untested Products",
    description:
      "Every single batch goes through third-party testing. We never ship without a verified COA - no exceptions, no shortcuts.",
    icon: FlaskConical,
  },
  {
    title: "No Hidden Sources",
    description:
      "We don't hide where our peptides come from. We work only with cGMP-certified synthesis facilities that meet our rigorous standards.",
    icon: Building2,
  },
  {
    title: "No Exaggerated Purity",
    description:
      "We report actual tested purity, not theoretical or claimed values. If it tests at 98.7%, that's what we report - not rounded to 99%.",
    icon: FileCheck,
  },
  {
    title: "No Legal Gray Areas",
    description:
      "We follow all applicable regulations strictly. We verify researcher credentials and maintain comprehensive documentation for compliance.",
    icon: Scale,
  },
];

const whatWeDoInstead = [
  {
    title: "Third-Party COAs",
    description: "Every batch tested by independent ISO-certified laboratories",
  },
  {
    title: "Transparent Sourcing",
    description: "Clear documentation of synthesis facilities and methods",
  },
  {
    title: "Research Focus",
    description: "Educational content for legitimate scientific inquiry",
  },
  {
    title: "Legal Compliance",
    description: "Strict adherence to all applicable regulations",
  },
];

export default function WhatWeDontDo() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead {...SEO_CONFIG.whatWeDontDo} canonicalPath="/what-we-dont-do" />
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#9d4edd]/20 mb-6">
            <ShieldX className="h-10 w-10 text-[#9d4edd]" />
          </div>
          <h1
            className="font-display text-4xl md:text-6xl font-bold mb-4"
            data-testid="text-what-we-dont-do-title"
          >
            What We Don't Do
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparency starts with being honest about our boundaries. Here's what separates
            legitimate research suppliers from the rest.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <Card className="p-8 border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[#9d4edd]" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">
                  Our Commitment to Integrity
                </h2>
                <p className="text-muted-foreground">
                  The research peptide industry unfortunately has vendors who cut corners, make
                  unsupported claims, or operate in legal gray areas. We believe researchers
                  deserve better. This page outlines the practices we specifically avoid - and why
                  it matters for your research.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {thingsWeDontDo.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <Card
                  className="h-full p-6 border-red-500/20 hover:border-red-500/40 transition-colors"
                  data-testid={`card-dont-${index}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                          <Ban className="h-3 w-3 mr-1" />
                          We Don't Do This
                        </Badge>
                      </div>
                      <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              What We Do Instead
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to avoiding these practices means we focus on what actually matters
              for legitimate research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {whatWeDoInstead.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
              >
                <Card className="h-full p-5 border-green-500/20 hover:border-green-500/40 transition-colors bg-green-500/5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-8 border-[#9d4edd]/30 bg-[#9d4edd]/5">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-2xl font-bold mb-4">
                Questions About Our Standards?
              </h2>
              <p className="text-muted-foreground mb-6">
                We're happy to discuss our quality control processes, testing protocols, and
                compliance practices with legitimate researchers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/coa-library">
                  <Button
                    className="bg-[#9d4edd] hover:bg-[#9d4edd]/90"
                    data-testid="button-view-coas"
                  >
                    View Our COA Library
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-[#9d4edd]/30 hover:border-[#9d4edd]"
                    data-testid="button-contact-us"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <Card className="inline-block p-6 border-primary/30 bg-primary/5">
            <p className="text-sm text-muted-foreground max-w-2xl">
              <strong className="text-foreground">Disclaimer:</strong> All products are sold
              strictly for laboratory research use only. Not for human consumption, veterinary use,
              or any therapeutic applications. Purchasers must be qualified researchers at
              accredited institutions.
            </p>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
