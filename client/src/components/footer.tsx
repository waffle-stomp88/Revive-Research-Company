import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, MapPin, AlertTriangle, Shield, Scale, FileCheck, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/Revive_PNG_1766012118069.png";
import { useEffect, useState } from "react";
import { NewsletterSignup } from "@/components/newsletter-signup";

function getResponseTimeByTimeZone(): string {
  const now = new Date();
  const ctTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const ctHour = ctTime.getHours();
  const isOffHours = ctHour >= 17 || ctHour < 9;
  return isOffHours ? "12 hours" : "2-4 hours";
}

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Affiliate Program", href: "/affiliate" },
  ],
  resources: [
    { label: "Resource Hub", href: "/resources" },
    { label: "Quality Process", href: "/quality-process" },
    { label: "Research Archive", href: "/lab-notes" },
    { label: "COA Library", href: "/coa-library" },
    { label: "Batch Archive", href: "/batch-archive" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Troubleshooting", href: "/troubleshooting" },
    { label: "Package Arrived Warm?", href: "/package-warm" },
    { label: "Contact Us", href: "/contact" },
  ],
  company: [
    { label: "Our Standards", href: "/what-we-dont-do" },
    { label: "Legal & Compliance", href: "/legal" },
    { label: "Transparency", href: "/transparency" },
    { label: "Ethical Pricing", href: "/ethical-pricing" },
  ],
};

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const [responseTime, setResponseTime] = useState("2-4 hours");

  useEffect(() => {
    setResponseTime(getResponseTimeByTimeZone());
    const interval = setInterval(() => {
      setResponseTime(getResponseTimeByTimeZone());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={`bg-card border-t border-border ${className || ""}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-2 md:pt-4 pb-16 md:pb-24">
        {/* Newsletter Signup - Prominent at top */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#21d8ff]/10 via-[#E7FB10]/5 to-[#21d8ff]/10 border border-[#21d8ff]/40" data-testid="section-footer-newsletter">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#21d8ff]/20 border border-[#21d8ff]/30 mb-1">
                <Mail className="h-3 w-3 text-[#21d8ff]" />
                <span className="text-xs font-medium text-[#21d8ff] uppercase tracking-wider">Newsletter</span>
              </div>
              <h4 className="font-display font-bold text-lg mb-1">Stay in the Loop</h4>
              <p className="text-muted-foreground text-xs max-w-md">Get exclusive updates and educational content delivered to your inbox.</p>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[360px]">
              <NewsletterSignup compact source="footer" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          <div className="lg:col-span-2">
            <Link href="/">
              <img
                src={logoImage}
                alt="Revive Research"
                className="h-20 w-auto mb-6"
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
                <span>support@reviveresearch.co</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>Dallas, Texas, USA</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-[#E7FB10] transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-[#21d8ff] transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-[#9d4edd] transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-[#ec4899] transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div className="text-sm">
              <span className="text-muted-foreground">Support: </span>
              <span className="text-green-400 font-medium">{responseTime} response</span>
            </div>
          </div>
          <div 
            className="p-3 rounded-lg inline-flex items-center gap-2 border whitespace-nowrap"
            style={{ 
              background: "linear-gradient(135deg, rgba(30,58,138,0.15) 0%, rgba(127,29,29,0.15) 100%)",
              borderColor: "rgba(239,68,68,0.3)"
            }}
            data-testid="badge-veteran-owned"
          >
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-red-400 fill-red-400" />
              <Star className="h-4 w-4 text-white fill-white" />
              <Star className="h-4 w-4 text-blue-400 fill-blue-400" />
            </div>
            <span className="text-sm font-medium text-white">Veteran-Owned</span>
          </div>
        </div>

        {/* FDA & Regulatory Compliance */}
        <div className="mt-6 p-5 rounded-lg bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle" data-testid="section-fda-disclaimer">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-sm mb-2">
                Important Legal Disclaimer
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All products are sold for laboratory research use only. <span className="text-red-400 font-semibold">Not for human consumption.</span> Not evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease. Revive Research is not a compounding pharmacy (503A) or outsourcing facility (503B) under the Federal Food, Drug, and Cosmetic Act. By purchasing, you agree to our <Link href="/terms"><span className="text-red-400 hover:underline cursor-pointer">Terms of Service</span></Link>.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-6 pt-6">
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
