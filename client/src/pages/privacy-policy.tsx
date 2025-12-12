import { motion } from "framer-motion";
import { SEOHead, SEO_CONFIG } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";

const LAST_UPDATED = "November 28, 2024";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead {...SEO_CONFIG.privacy} canonicalPath="/privacy" />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-privacy-title">
            Privacy Policy
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
          <Card className="p-6 mb-8 border-primary/50 bg-primary/5">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Your Privacy Matters</h3>
                <p className="text-muted-foreground">
                  Revive Research is committed to protecting your privacy. This policy explains 
                  how we collect, use, and safeguard your personal information when you use 
                  our website and services.
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
          <Card className="p-6 md:p-8" data-testid="card-privacy-content">
            <div className="space-y-8 text-foreground/90">
              <section>
                <h2 className="font-display text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><span className="font-semibold">Account Information:</span> Name, email address, and password when you create an account</li>
                  <li><span className="font-semibold">Order Information:</span> Billing address, shipping address, phone number, and payment details</li>
                  <li><span className="font-semibold">Communication Data:</span> Information you provide when contacting customer support or submitting forms</li>
                  <li><span className="font-semibold">Usage Data:</span> Information about how you interact with our website, including browsing history and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about your orders and account</li>
                  <li>Send transactional emails (order confirmations, shipping updates)</li>
                  <li>Provide customer support</li>
                  <li>Improve our website and services</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><span className="font-semibold">Service Providers:</span> Third parties who help us operate our business (payment processors, shipping carriers)</li>
                  <li><span className="font-semibold">Legal Requirements:</span> When required by law or to protect our rights</li>
                  <li><span className="font-semibold">Business Transfers:</span> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">4. Payment Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All payment transactions are encrypted using SSL technology. We do not store 
                  your complete credit card information on our servers. Payment processing is 
                  handled by PCI-DSS compliant payment processors who specialize in secure 
                  online transactions.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">5. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the 
                  purposes outlined in this policy, unless a longer retention period is required 
                  by law. Order records are retained for a minimum of 7 years for tax and 
                  legal compliance purposes.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our website</li>
                  <li>Improve your browsing experience</li>
                  <li>Provide personalized content</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can manage cookie preferences through your browser settings. Disabling 
                  cookies may affect website functionality.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, please contact us at privacy@reviveresearch.com.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">8. Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible 
                  for the privacy practices of these websites. We encourage you to review their 
                  privacy policies before providing any personal information.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website is not intended for individuals under 21 years of age. We do not 
                  knowingly collect personal information from anyone under 21. If we learn that 
                  we have collected information from a minor, we will delete it immediately.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">10. Security Measures</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational security measures to 
                  protect your personal information against unauthorized access, alteration, 
                  disclosure, or destruction. However, no method of transmission over the 
                  internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of 
                  any material changes by posting the new policy on this page and updating the 
                  "Last Updated" date. Your continued use of our website after changes 
                  constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions or concerns about this Privacy Policy or our data 
                  practices, please contact us at:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-foreground font-semibold">Revive Research</p>
                  <p className="text-muted-foreground">Email: privacy@reviveresearch.com</p>
                </div>
              </section>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
