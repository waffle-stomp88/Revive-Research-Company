import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, MapPin, AlertTriangle, Shield, Scale, FileCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/REVIVE-11_1764290805698.png";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "COA Library", href: "/coa-library" },
    { label: "Batch Archive", href: "/batch-archive" },
    { label: "Affiliate Program", href: "/affiliate" },
  ],
  resources: [
    { label: "Education Center", href: "/education" },
    { label: "Quality Process", href: "/quality-process" },
    { label: "Lab Notes", href: "/lab-notes" },
    { label: "Buyer Checklist", href: "/buyer-checklist" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Details", href: "/shipping" },
    { label: "Package Arrived Warm?", href: "/package-warm" },
    { label: "Troubleshooting", href: "/troubleshooting" },
    { label: "Contact Us", href: "/contact" },
  ],
  company: [
    { label: "Our Standards", href: "/what-we-dont-do" },
    { label: "Transparency", href: "/transparency" },
    { label: "Ethical Pricing", href: "/ethical-pricing" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/">
              <img
                src={logoImage}
                alt="Revive Research"
                className="h-10 w-auto mb-6"
                data-testid="img-footer-logo"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
              Engineered with intention. Built for those who don't wait for permission. 
              Premium research compounds backed by third-party testing and rigorous quality standards.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>research@reviveresearch.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>United States</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 inline-flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="text-sm">
                <span className="text-muted-foreground">Support: </span>
                <span className="text-green-400 font-medium">2-4 hour response</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FDA & Regulatory Compliance */}
        <div className="mt-16 p-6 rounded-lg bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle" data-testid="section-fda-disclaimer">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-sm mb-3">
                FDA & Regulatory Compliance
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                All products are sold for laboratory research use only. <span className="text-red-400 font-semibold">Not for human consumption</span>, medical, veterinary, or household use. 
                The statements made on this website have not been evaluated by the US Food and Drug Administration. These products are{" "}
                <span className="text-red-400 font-semibold">not intended to diagnose, treat, cure, or prevent any disease</span>.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Revive Research is not a compounding pharmacy (503A) or outsourcing facility (503B) as defined under the Federal Food, Drug, and Cosmetic Act. 
                All products are sold strictly for research, laboratory, or analytical purposes only. By using our website or purchasing products, you agree to our{" "}
                <Link href="/terms"><span className="text-red-400 hover:underline cursor-pointer">Terms of Service</span></Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Researcher Responsibility */}
        <div className="mt-4 p-5 rounded-lg border border-[#E7FB10]/30 bg-[#E7FB10]/5" data-testid="section-researcher-responsibility">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#E7FB10] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-[#E7FB10]">Researcher Responsibility:</span> All content on ReviveResearch.com is for{" "}
                <span className="font-semibold">educational and informational purposes only</span>. These materials are{" "}
                <span className="font-semibold">not intended for human or veterinary use</span> and are not classified as drugs, supplements, or food products under applicable law. 
                By purchasing, you acknowledge full responsibility for use in accordance with all applicable laws and regulations. 
                Nothing on this site constitutes medical advice or a recommendation for use.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Icons */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/40 shadow-glow-blue-sm">
            <Scale className="h-5 w-5 text-[#21d8ff]" />
            <span className="text-sm text-muted-foreground">Federal & state law compliant</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/40 shadow-glow-blue-sm">
            <FileCheck className="h-5 w-5 text-[#21d8ff]" />
            <span className="text-sm text-muted-foreground">Third-party tested & verified</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/40 shadow-glow-blue-sm">
            <Shield className="h-5 w-5 text-[#21d8ff]" />
            <span className="text-sm text-muted-foreground">Qualified researchers only</span>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Revive Research. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <Link href="/privacy">
                <span className="text-muted-foreground hover:text-[#E7FB10] transition-colors cursor-pointer">Privacy Policy</span>
              </Link>
              <span className="text-muted-foreground/40">–</span>
              <Link href="/terms">
                <span className="text-muted-foreground hover:text-[#E7FB10] transition-colors cursor-pointer">Terms & Conditions</span>
              </Link>
              <span className="text-muted-foreground/40">–</span>
              <Link href="/disclaimer">
                <span className="text-muted-foreground hover:text-[#E7FB10] transition-colors cursor-pointer">Disclaimer</span>
              </Link>
              <span className="text-muted-foreground/40">–</span>
              <Link href="/coa">
                <span className="text-muted-foreground hover:text-[#E7FB10] transition-colors cursor-pointer">COA Verification</span>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/60">
              For research purposes only. Not for human consumption.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
