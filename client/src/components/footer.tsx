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

        {/* Research Use Disclaimer */}
        <div className="mt-16 p-6 rounded-lg bg-muted/30 border border-border" data-testid="section-research-disclaimer">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            This material is sold for laboratory research use only. Terms of sale apply. <span className="font-semibold text-foreground">Not for human consumption</span>, 
            nor medical, veterinary, or household uses. Please familiarize yourself with our{" "}
            <Link href="/terms"><span className="text-[#E7FB10] hover:underline cursor-pointer">Terms of Service</span></Link>{" "}
            prior to ordering. By using our website and/or by purchasing our products, you are agreeing to our Terms of Service.
          </p>
        </div>

        {/* FDA Disclaimer Section */}
        <div className="mt-6 p-6 rounded-lg bg-red-950/30 border-2 border-red-500/50 shadow-glow-red-sm" data-testid="section-fda-disclaimer">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-sm mb-3">
                FDA Disclaimer
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The statements made within this website have not been evaluated by the US Food and Drug Administration. 
                The statements and the products of this company are <span className="text-red-400 font-semibold">not intended to diagnose, treat, cure or prevent any disease</span>. 
                All products are for laboratory developmental research <span className="font-semibold text-foreground">USE ONLY</span>. Products are not for human consumption.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Revive Research is not a compounding pharmacy or chemical compounding facility as defined under 503A of the Federal Food, Drug, and Cosmetic Act. 
                Revive Research is not an outsourcing facility as defined under 503B of the Federal Food, Drug, and Cosmetic Act. 
                All products are sold for research, laboratory, or analytical purposes only, and are not for human consumption.
              </p>
            </div>
          </div>
        </div>

        {/* Research Purpose Notice */}
        <div className="mt-6 p-6 rounded-lg bg-muted/50 border border-border" data-testid="section-research-purpose">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Revive Research's products are intended strictly for research purposes only. These products are not approved by the U.S. Food and Drug Administration (FDA) 
            for human consumption or medical use. <span className="font-semibold text-foreground">Under no circumstances should these peptides be used for any purpose other than research.</span>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By purchasing or using our peptides, you acknowledge and agree that you will use them solely in accordance with applicable laws and regulations 
            and that you accept full responsibility for their use. Statements made on this website have not been evaluated by the USA Food and Drug Administration.
          </p>
        </div>

        {/* Educational Disclaimer */}
        <div className="mt-6 p-4 rounded-lg border border-[#E7FB10]/30 bg-[#E7FB10]/5" data-testid="section-educational-disclaimer">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#E7FB10] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-[#E7FB10]">Disclaimer:</span> Any mention of research chemicals or related compounds on ReviveResearch.com is for{" "}
                <span className="font-semibold">educational and informational purposes only</span>. These materials are{" "}
                <span className="font-semibold">not intended for human or veterinary use</span>, and are{" "}
                <span className="font-semibold">not classified as drugs, supplements, or food products</span> under applicable law. 
                By engaging with this content, you acknowledge that it is your responsibility to understand and comply with all relevant laws and regulations in your jurisdiction. 
                Nothing on this site should be interpreted as medical advice or a recommendation for use.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Icons */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
            <Scale className="h-5 w-5 text-[#21d8ff]" />
            <span className="text-sm text-muted-foreground">Compliant with federal and state laws</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
            <FileCheck className="h-5 w-5 text-[#21d8ff]" />
            <span className="text-sm text-muted-foreground">Third-party tested & verified</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
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
