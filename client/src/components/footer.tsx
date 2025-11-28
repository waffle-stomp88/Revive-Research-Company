import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, MapPin, AlertTriangle, Shield, Scale, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/REVIVE-11_1764290805698.png";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Research", href: "/research" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "COA Verification", href: "/coa" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/">
              <img
                src={logoImage}
                alt="Revive Research"
                className="h-10 w-auto mb-6"
                data-testid="img-footer-logo"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-8">
              Engineered with intention. Built for those who don't wait for permission. 
              Premium research compounds backed by third-party testing and rigorous quality standards.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>research@reviveresearch.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>United States</span>
              </div>
            </div>
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
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
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

        {/* RUO Compliance Section */}
        <div className="mt-16 p-6 rounded-lg bg-red-950/30 border-2 border-red-500/50 shadow-glow-red-sm" data-testid="section-ruo-compliance">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-sm mb-3">
                Research Use Only - Legal Compliance Notice
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                All products sold by Revive Research are intended strictly for laboratory research and scientific 
                investigation purposes. These products are <span className="text-red-400 font-semibold">NOT intended for human consumption</span>, 
                veterinary use, or any other purpose not specifically authorized for research.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scale className="h-4 w-4 text-red-400/70" />
                  <span>Compliant with federal and state laws</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileCheck className="h-4 w-4 text-red-400/70" />
                  <span>Third-party tested & verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-red-400/70" />
                  <span>Qualified researchers only</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-4 leading-relaxed">
                By purchasing from Revive Research, you confirm that you are a qualified researcher and agree to use 
                all products in accordance with applicable federal, state, and local laws and regulations. Revive Research 
                assumes no liability for any misuse of products purchased from our platform.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} Revive Research. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              For research purposes only. Not for human consumption.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
