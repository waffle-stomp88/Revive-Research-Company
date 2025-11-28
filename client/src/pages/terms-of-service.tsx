import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FileText, AlertTriangle } from "lucide-react";

const LAST_UPDATED = "November 28, 2024";

export default function TermsOfService() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-terms-title">
            Terms of Service
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
          <Card className="p-6 mb-8 border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Research Use Only</h3>
                <p className="text-muted-foreground">
                  All products sold by Revive Research are intended for research purposes only. 
                  By using this website and purchasing products, you acknowledge and agree to 
                  these terms in their entirety.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="prose prose-invert max-w-none"
        >
          <Card className="p-6 md:p-8" data-testid="card-terms-content">
            <div className="space-y-8 text-foreground/90">
              <section>
                <h2 className="font-display text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using the Revive Research website (the "Site") and purchasing 
                  any products, you ("Customer," "you," or "your") accept and agree to be bound 
                  by these Terms of Service ("Terms"). If you do not agree to these Terms, you 
                  must not access or use this Site or purchase any products.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">2. Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To use this Site and purchase products, you must:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Be at least 21 years of age</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be prohibited from purchasing research chemicals under applicable law</li>
                  <li>Agree to use all products solely for lawful research purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">3. Product Use Restrictions</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All products sold on this Site are intended for research use only. By purchasing 
                  products from Revive Research, you agree and warrant that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Products will NOT be used for human or animal consumption</li>
                  <li>Products will NOT be used for diagnostic or therapeutic purposes</li>
                  <li>Products will NOT be resold or redistributed</li>
                  <li>Products will be handled, stored, and disposed of in accordance with all applicable laws and regulations</li>
                  <li>You will comply with all federal, state, and local laws regarding research chemicals</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">4. No Refund Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Due to the sensitive nature of our products and strict quality control requirements:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-destructive">
                  <p className="text-foreground font-semibold">
                    ALL SALES ARE FINAL. NO REFUNDS OR RETURNS ARE ACCEPTED.
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This policy exists to maintain the integrity of our research compounds. Once a 
                  product leaves our facility, we cannot guarantee that it has been stored properly 
                  and therefore cannot accept it back into our inventory.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">5. Shipping and Delivery</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Orders are processed and shipped within 24 hours of placement. Same-day shipping 
                  is available for orders placed before 12:00 PM Central Time on business days. 
                  Risk of loss and title for products passes to you upon delivery to the carrier. 
                  We are not responsible for delays caused by the shipping carrier.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">6. Pricing and Payment</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All prices are listed in U.S. dollars. We reserve the right to change prices at 
                  any time without notice. Payment is due at the time of purchase. We accept major 
                  credit cards and other payment methods as displayed at checkout.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">7. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this Site, including text, graphics, logos, images, and software, 
                  is the property of Revive Research or its licensors and is protected by 
                  intellectual property laws. You may not reproduce, distribute, modify, or create 
                  derivative works without our express written consent.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Products are provided "AS IS" without warranties of any kind, either express or 
                  implied. We do not warrant that products will meet your specific research 
                  requirements or that results obtained will be accurate or reliable. We make no 
                  claims regarding the suitability of products for any particular purpose.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, Revive Research shall not be liable for 
                  any indirect, incidental, special, consequential, or punitive damages, including 
                  loss of profits, data, or other intangible losses, resulting from your use of 
                  the Site or products, regardless of the cause of action.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">10. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Revive Research, its officers, 
                  directors, employees, and agents from any claims, damages, losses, liabilities, 
                  and expenses (including reasonable attorneys' fees) arising from your use of 
                  products, violation of these Terms, or violation of any rights of a third party.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">11. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of 
                  the United States, without regard to conflict of law principles. Any disputes 
                  arising under these Terms shall be resolved in the courts of competent 
                  jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">12. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. Changes will be effective 
                  immediately upon posting on this Site. Your continued use of the Site after 
                  changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">13. Severability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If any provision of these Terms is found to be invalid or unenforceable, the 
                  remaining provisions shall continue in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">14. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us at 
                  support@reviveresearch.com.
                </p>
              </section>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
