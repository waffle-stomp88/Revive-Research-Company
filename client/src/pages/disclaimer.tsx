import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Shield, FlaskConical, Scale, Ban } from "lucide-react";

const LAST_UPDATED = "January 23, 2026";

export default function Disclaimer() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead 
        title="Disclaimer" 
        description="Important legal disclaimer for Revive Research products. All compounds are for laboratory research use only - not for human consumption." 
        canonicalPath="/disclaimer" 
      />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-disclaimer-title">
            Disclaimer
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {LAST_UPDATED}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-6 mb-8 border-red-500/50 bg-red-950/30 animate-pulse-subtle">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-red-400">Critical Notice</h3>
                <p className="text-muted-foreground">
                  All products sold by Revive Research are strictly for laboratory and research purposes only. 
                  <span className="text-red-400 font-semibold"> Not for human or animal consumption.</span> By 
                  accessing this website or purchasing products, you acknowledge and agree to all disclaimers 
                  stated herein.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Card className="p-6 md:p-8" data-testid="card-disclaimer-content">
            <div className="space-y-8 text-foreground/90">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FlaskConical className="h-6 w-6 text-[#21d8ff]" />
                  <h2 className="font-display text-2xl font-bold">Research Use Only</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All products offered by Revive Research are intended exclusively for in-vitro research, 
                  laboratory experimentation, and scientific study. These products are chemical compounds 
                  designed for use by qualified researchers, scientists, and research institutions.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Products are NOT intended for human or veterinary use</li>
                  <li>Products are NOT drugs, supplements, or medicines</li>
                  <li>Products are NOT intended to diagnose, treat, cure, or prevent any disease</li>
                  <li>Products must be handled only by qualified personnel in appropriate laboratory settings</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-[#D4FF1F]" />
                  <h2 className="font-display text-2xl font-bold">FDA Compliance Notice</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These statements and products have not been evaluated by the Food and Drug Administration 
                  (FDA). Revive Research is not a compounding pharmacy (503A) or outsourcing facility (503B) 
                  as defined under the Federal Food, Drug, and Cosmetic Act.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Revive Research operates as a specialty distributor of research-grade compounds manufactured 
                  by third-party facilities. We do not manufacture, compound, or produce any pharmaceutical 
                  products intended for human use.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Ban className="h-6 w-6 text-red-400" />
                  <h2 className="font-display text-2xl font-bold">Prohibited Uses</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By purchasing from Revive Research, you expressly agree that you will NOT:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Administer any product to humans or animals</li>
                  <li>Use products for any therapeutic, diagnostic, or medicinal purpose</li>
                  <li>Resell products for human consumption</li>
                  <li>Market or label products as suitable for human use</li>
                  <li>Use products in any manner that violates federal, state, or local laws</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="h-6 w-6 text-[#22c55e]" />
                  <h2 className="font-display text-2xl font-bold">Limitation of Liability</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Revive Research, its officers, directors, employees, affiliates, and agents shall not be 
                  liable for any damages, injuries, or losses arising from:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Misuse or improper handling of products</li>
                  <li>Use of products for any purpose other than lawful research</li>
                  <li>Reliance on any information provided on this website</li>
                  <li>Any violation of applicable laws or regulations by the purchaser</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Under no circumstances shall our total liability exceed the purchase price of the 
                  products in question. Some jurisdictions do not allow limitations on implied warranties 
                  or liability for incidental damages; therefore, the above limitations may not apply to you.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">Accuracy of Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  While we strive to provide accurate and up-to-date information, Revive Research makes no 
                  warranties or representations regarding the accuracy, completeness, or reliability of any 
                  content on this website.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Product specifications, including but not limited to purity percentages and molecular 
                  weights, are provided based on Certificate of Analysis (COA) documentation. Actual results 
                  may vary based on storage conditions, handling, and experimental protocols used by the 
                  researcher.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">Age Restriction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 21 years of age to access this website and purchase products from 
                  Revive Research. By using this site, you confirm that you meet this age requirement and 
                  have the legal capacity to enter into binding agreements.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Revive Research and its officers, 
                  directors, employees, affiliates, and agents from and against any claims, damages, 
                  losses, liabilities, costs, or expenses (including reasonable attorneys' fees) arising 
                  from your use of products, violation of these disclaimers, or breach of any applicable 
                  laws or regulations.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This disclaimer shall be governed by and construed in accordance with the laws of the 
                  United States. Any disputes arising from or relating to this disclaimer or your use of 
                  our products shall be resolved through binding arbitration in accordance with applicable 
                  arbitration rules.
                </p>
              </section>

              <section className="pt-6 border-t border-border">
                <h2 className="font-display text-2xl font-bold mb-4">Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions regarding this disclaimer, please contact us at{" "}
                  <a href="mailto:support@reviveresearch.co" className="text-[#21d8ff] hover:underline">
                    support@reviveresearch.co
                  </a>
                </p>
              </section>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
