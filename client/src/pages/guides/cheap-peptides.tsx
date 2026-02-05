import { Link } from "wouter";
import { FileCheck, BookOpen, DollarSign, Shield, Scale, AlertTriangle } from "lucide-react";
import { 
  EntryArticleLayout, 
  ArticleSection, 
  BulletList 
} from "@/components/entry-article-layout";
import { Card } from "@/components/ui/card";

export default function CheapPeptides() {
  const faqs = [
    {
      question: "Why are some peptides so much cheaper than others?",
      answer: "Price differences come from sourcing quality, testing thoroughness, manufacturing standards, documentation, storage/handling, and business overhead. Lower prices usually mean cuts somewhere in that chain."
    },
    {
      question: "Are expensive peptides always better?",
      answer: "Not automatically. Price alone doesn't guarantee quality. The question is whether the price reflects real investments in quality control, testing, and documentation — or just higher margins."
    },
    {
      question: "What should I expect to pay for quality research peptides?",
      answer: "This varies by compound, but be skeptical of prices dramatically below market average. If everyone else charges $50-70 and someone charges $20, ask what they're skipping to hit that price."
    },
    {
      question: "Is it ever okay to buy cheaper peptides?",
      answer: "It depends on your use case and risk tolerance. If you're doing preliminary screening where absolute quality isn't critical, budget options might be acceptable. For serious research, documentation and verification matter more."
    },
    {
      question: "How can I tell if a low price is a red flag?",
      answer: "Ask about testing — who does it, how often, can you see documentation? Cheap peptides with full third-party COAs are rare because testing is expensive. If they can't provide documentation, the price is probably cutting corners on quality verification."
    },
    {
      question: "Do premium peptides guarantee better results?",
      answer: "Premium pricing should correlate with better documentation, verified testing, and consistent quality control. But 'premium' is meaningless without evidence. Always verify claims regardless of price point."
    }
  ];

  const ctaLinks = [
    {
      label: "Our Ethical Pricing Philosophy",
      href: "/ethical-pricing",
      icon: Scale,
      description: "How we think about fair pricing"
    },
    {
      label: "View Our COA Library",
      href: "/coa-library",
      icon: FileCheck,
      description: "See what testing verification looks like"
    },
    {
      label: "Quality Process Explained",
      href: "/quality-process",
      icon: Shield,
      description: "What goes into our products"
    },
    {
      label: "How to Verify Quality",
      href: "/guides/how-to-verify-peptide-quality",
      icon: BookOpen,
      description: "Evaluate any supplier yourself"
    }
  ];

  return (
    <EntryArticleLayout
      title="Why Cheap Peptides Are Cheap (and When Price Actually Matters)"
      metaTitle="Why Cheap Peptides Are Cheap - Understanding Peptide Pricing"
      metaDescription="Honest analysis of peptide pricing: what drives costs, where cheap vendors cut corners, and how to evaluate whether price reflects quality."
      canonicalPath="/guides/why-cheap-peptides-are-cheap"
      badgeText="Pricing & Value"
      badgeColor="#ec4899"
      introText={
        <>
          <p className="mb-4">
            You've probably noticed massive price differences for the same peptide 
            across different vendors. One charges $30, another $70, and someone 
            else $150. What's actually going on?
          </p>
          <p>
            This isn't a sales pitch for expensive products. It's an honest breakdown 
            of what drives peptide pricing and where cheap vendors typically cut 
            corners — so you can make informed decisions.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <ArticleSection title="What Goes Into Peptide Pricing">
        <p>
          The price of a peptide reflects costs across the entire supply chain:
        </p>
        <BulletList 
          items={[
            "Raw material sourcing and synthesis quality",
            "Third-party testing and documentation",
            "Purification to achieve target purity levels",
            "Proper storage and cold-chain handling",
            "Packaging, labeling, and compliance",
            "Business overhead (staff, facilities, customer support)",
            "Profit margin"
          ]}
        />
        <p className="mt-4">
          When a peptide is significantly cheaper than competitors, something in 
          that chain is being reduced or eliminated. The question is: what?
        </p>
      </ArticleSection>

      <ArticleSection title="Where Cheap Vendors Cut Corners" variant="limitation">
        <p className="font-medium mb-3">
          Common cost-cutting measures that affect what you receive:
        </p>
        <BulletList 
          color="#f59e0b"
          items={[
            "Sourcing from lower-quality synthesis facilities",
            "Skipping third-party testing (or testing only some batches)",
            "In-house testing only, with no independent verification",
            "Lower purity standards or less rigorous purification",
            "Poor storage conditions (no cold chain, improper handling)",
            "Generic or recycled COAs that don't match specific batches",
            "Minimal or no customer support infrastructure"
          ]}
        />
        <p className="mt-4 text-sm">
          None of these are visible in a product listing. The peptide looks the 
          same on screen. The difference only becomes apparent when you look at 
          the documentation — or when research results are inconsistent.
        </p>
      </ArticleSection>

      <ArticleSection title="The Testing Cost Reality">
        <p>
          Third-party testing is one of the biggest cost differentiators:
        </p>
        <Card className="p-6 mt-4 border-[#ec4899]/20 bg-[#ec4899]/5">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">HPLC purity analysis (per sample)</span>
              <span className="font-semibold">$150-300</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mass spectrometry confirmation</span>
              <span className="font-semibold">$100-200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Endotoxin testing</span>
              <span className="font-semibold">$50-150</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sterility testing</span>
              <span className="font-semibold">$100-200</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Comprehensive testing per batch</span>
              <span className="font-bold text-[#ec4899]">$400-850+</span>
            </div>
          </div>
        </Card>
        <p className="mt-4">
          If a company sells vials for $25 each and claims comprehensive third-party 
          testing, the math doesn't work unless they're selling massive volumes or 
          losing money. More likely: they're not testing what they claim.
        </p>
      </ArticleSection>

      <ArticleSection title="When Price Matters (and When It Doesn't)">
        <p>
          Price isn't automatically an indicator of quality in either direction:
        </p>
        
        <h3 className="font-semibold mt-6 mb-2 text-[#22c55e]">Price matters when:</h3>
        <BulletList 
          color="#22c55e"
          items={[
            "The higher price reflects real investments in testing and documentation",
            "You need consistent, verified quality for serious research",
            "You value having recourse if something goes wrong",
            "Batch-to-batch consistency is important to your work"
          ]}
        />

        <h3 className="font-semibold mt-6 mb-2 text-[#f59e0b]">Price matters less when:</h3>
        <BulletList 
          color="#f59e0b"
          items={[
            "You're doing preliminary screening where absolute purity isn't critical",
            "You have the capability to verify quality yourself",
            "You're comparing vendors with similar documentation standards",
            "Higher price is just higher margin, not higher quality"
          ]}
        />
      </ArticleSection>

      <ArticleSection title="How to Evaluate Price vs. Value" variant="proof">
        <p className="mb-3">
          Instead of choosing the cheapest or most expensive, evaluate:
        </p>
        <BulletList 
          color="#22c55e"
          items={[
            "Does the price support comprehensive third-party testing?",
            "Can you verify testing documentation for your specific batch?",
            "Is there a batch archive and traceability system?",
            "What's the vendor's reputation over time?",
            "Is there responsive customer support?",
            "Do they handle shipping and storage properly?"
          ]}
        />
        <p className="mt-4 text-sm">
          A $60 peptide with verified documentation beats a $30 peptide with 
          nothing — and might beat a $120 peptide that's just charging premium 
          prices without additional value.
        </p>
      </ArticleSection>

      <ArticleSection title="Our Pricing Philosophy" variant="revive">
        <p className="mb-3">
          We're not the cheapest option, and we're not trying to be:
        </p>
        <BulletList 
          color="#21d8ff"
          items={[
            "Our prices reflect genuine investments in third-party testing",
            "Every batch gets independent laboratory verification",
            "We maintain proper cold-chain storage and handling",
            "We provide real documentation, not recycled COAs",
            "We offer actual customer support from people who can help",
            "We believe fair pricing includes the cost of doing things right"
          ]}
        />
        <p className="mt-4 text-sm">
          We'd rather charge what quality actually costs than cut corners to 
          win on price. If price is your primary criterion, we may not be 
          the right fit — and that's okay.
        </p>
      </ArticleSection>

      <Card className="p-6 border-[#21d8ff]/30 bg-[#21d8ff]/5 my-8">
        <div className="flex items-start gap-4">
          <Scale className="h-6 w-6 text-[#21d8ff] flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-[#21d8ff] mb-2">The Value Equation</h3>
            <p className="text-muted-foreground text-sm">
              The real question isn't "what's cheapest?" — it's "what provides the 
              best value for my needs?" Value = quality × reliability × documentation, 
              divided by price. Cheap peptides with poor documentation and inconsistent 
              quality aren't actually cheap when research results suffer.
            </p>
          </div>
        </div>
      </Card>

      <ArticleSection title="Red Flags in Pricing" variant="limitation">
        <p className="font-medium mb-3">
          Be cautious when you see:
        </p>
        <BulletList 
          color="#f59e0b"
          items={[
            "Prices dramatically below market average with quality claims",
            "Claims of pharmaceutical-grade quality at budget prices",
            "Inability to provide batch-specific documentation",
            "Pressure tactics emphasizing limited-time deals",
            "No clear explanation of what's included in the price"
          ]}
        />
      </ArticleSection>

      <ArticleSection title="The Bottom Line">
        <p>
          Cheap peptides are cheap because something is reduced — sourcing, 
          testing, handling, documentation, or support. Sometimes that tradeoff 
          is acceptable for your purposes. Sometimes it isn't.
        </p>
        <p>
          Don't automatically buy the cheapest. Don't automatically assume 
          expensive means quality. Look at what the price actually includes, 
          verify the documentation exists, and make an informed decision based 
          on your specific research needs.
        </p>
        <p>
          Quality costs money. But "expensive" without evidence is just expensive.
        </p>
      </ArticleSection>
    </EntryArticleLayout>
  );
}
