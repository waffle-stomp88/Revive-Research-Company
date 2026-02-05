import { Link } from "wouter";
import { FileCheck, BookOpen, Shield, Scale, AlertTriangle } from "lucide-react";
import { 
  EntryArticleLayout, 
  ArticleSection, 
  BulletList 
} from "@/components/entry-article-layout";
import { Card } from "@/components/ui/card";

export default function ResearchUseOnly() {
  const faqs = [
    {
      question: "What does 'Research Use Only' legally mean?",
      answer: "RUO designation means a product is sold for laboratory research purposes and has not been approved for human or veterinary use by regulatory agencies. It's a compliance and liability framework, not a quality designation."
    },
    {
      question: "Are RUO products lower quality than pharmaceutical products?",
      answer: "Not necessarily. The RUO label refers to regulatory status, not quality. Many research-grade compounds undergo rigorous testing and meet or exceed pharmaceutical purity standards. The difference is regulatory approval, not inherent quality."
    },
    {
      question: "Why do companies sell research compounds instead of pharmaceuticals?",
      answer: "Pharmaceutical approval requires extensive clinical trials, FDA review, and ongoing compliance — costing hundreds of millions of dollars and years of time. Research compounds serve legitimate research markets without this regulatory burden."
    },
    {
      question: "Can I use RUO products for personal use?",
      answer: "RUO products are sold exclusively for research purposes. Any other use is outside the intended scope and is the sole responsibility of the purchaser. Suppliers cannot advise on, condone, or support non-research applications."
    },
    {
      question: "What's the difference between RUO and 'not for human consumption'?",
      answer: "These terms are functionally similar in intent: both indicate the product is not approved for therapeutic use in humans. RUO specifically emphasizes the research/laboratory context."
    }
  ];

  const ctaLinks = [
    {
      label: "View Our Legal Disclaimers",
      href: "/disclaimer",
      icon: Scale,
      description: "Full legal terms and compliance information"
    },
    {
      label: "Education Center",
      href: "/education",
      icon: BookOpen,
      description: "Research-focused educational resources"
    },
    {
      label: "Our Quality Process",
      href: "/quality-process",
      icon: Shield,
      description: "How we ensure research-grade quality"
    },
    {
      label: "COA Library",
      href: "/coa-library",
      icon: FileCheck,
      description: "Verification documents for research compounds"
    }
  ];

  return (
    <EntryArticleLayout
      title="What 'Research Use Only' Actually Means"
      metaTitle="What Research Use Only Means - RUO Peptides Explained"
      metaDescription="Clear explanation of Research Use Only (RUO) labeling: what it means legally, why it exists, and what it says (and doesn't say) about product quality."
      canonicalPath="/guides/what-research-use-only-means"
      badgeText="Compliance & Ethics"
      badgeColor="#22c55e"
      introText={
        <>
          <p className="mb-4">
            Almost every peptide you'll find online is labeled "Research Use Only" (RUO) 
            or "Not for Human Consumption." If you're new to this space, that labeling 
            might seem confusing or even suspicious.
          </p>
          <p>
            This page explains exactly what RUO means, why it exists, and what it does 
            (and doesn't) tell you about the product itself.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <ArticleSection title="What RUO Actually Means">
        <p>
          "Research Use Only" is a regulatory and compliance designation. It means:
        </p>
        <BulletList 
          items={[
            "The product is sold for laboratory research purposes",
            "It has not been approved by the FDA (or equivalent agencies) for therapeutic use",
            "It is not marketed, sold, or intended for human or veterinary medical applications",
            "The purchaser assumes responsibility for appropriate use"
          ]}
        />
        <p className="mt-4">
          RUO is a legal framework that defines the scope of the product's intended 
          market. It's not a statement about quality, purity, or safety — those are 
          separate considerations addressed by testing and quality control.
        </p>
      </ArticleSection>

      <ArticleSection title="Why RUO Exists" variant="proof">
        <p className="mb-3">
          The RUO designation exists for several legitimate reasons:
        </p>
        <BulletList 
          color="#22c55e"
          items={[
            "Pharmaceutical approval is extremely expensive (often $1B+) and time-consuming (10+ years)",
            "Many peptides have legitimate research applications without FDA approval",
            "Academic institutions, private labs, and researchers need access to compounds",
            "The regulatory framework protects consumers by requiring clear labeling",
            "It allows research to continue on compounds that may eventually seek approval"
          ]}
        />
        <p className="mt-4 text-sm">
          RUO isn't a loophole — it's a legitimate market category that serves 
          the research community while maintaining regulatory clarity.
        </p>
      </ArticleSection>

      <ArticleSection title="What RUO Does NOT Tell You" variant="limitation">
        <p className="font-medium mb-3">RUO labeling doesn't address:</p>
        <BulletList 
          color="#f59e0b"
          items={[
            "Product purity or quality (that's what COAs and testing address)",
            "Manufacturing standards or consistency",
            "Whether the compound is effective for any purpose",
            "Safety profile or risk factors",
            "Proper handling or storage requirements"
          ]}
        />
        <p className="mt-4 text-sm">
          Don't confuse regulatory status with quality. A high-purity, well-tested 
          RUO compound can exceed the quality of poorly manufactured products in 
          other categories.
        </p>
      </ArticleSection>

      <Card className="p-6 border-[#f59e0b]/30 bg-[#f59e0b]/5 my-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-[#f59e0b] flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-[#f59e0b] mb-2">Important Boundary</h3>
            <p className="text-muted-foreground text-sm">
              Revive Research sells products exclusively for research purposes. We cannot 
              and will not provide advice, guidance, or support for any non-research 
              applications. This is not a legal technicality — it's a genuine ethical 
              and business boundary we maintain.
            </p>
          </div>
        </div>
      </Card>

      <ArticleSection title="Research Use in Practice">
        <p>
          Legitimate research applications for peptides include:
        </p>
        <BulletList 
          items={[
            "In-vitro (cell culture) studies in academic and private laboratories",
            "Biochemical mechanism research",
            "Analytical chemistry method development",
            "Comparative analysis and reference standard development",
            "Educational demonstrations and training"
          ]}
        />
        <p className="mt-4">
          Researchers in these contexts need access to quality compounds with 
          verifiable specifications — which is exactly what COA-backed products provide.
        </p>
      </ArticleSection>

      <ArticleSection title="Why We Take This Seriously" variant="revive">
        <p className="mb-3">
          Maintaining the RUO framework isn't just legal compliance — it reflects 
          how we think about our business:
        </p>
        <BulletList 
          color="#21d8ff"
          items={[
            "Clear boundaries protect both us and our customers",
            "We focus on what we can verify: quality, purity, documentation",
            "We don't make claims about applications we can't ethically support",
            "Transparency about limitations builds more trust than vague promises",
            "We believe ethical business practices are compatible with serving researchers"
          ]}
        />
        <p className="mt-4 text-sm">
          We're not here to judge what researchers do with verified compounds. 
          We're here to provide quality products with honest documentation and 
          clear boundaries about what we can and cannot advise on.
        </p>
      </ArticleSection>

      <ArticleSection title="How to Think About RUO Products">
        <p>
          When evaluating RUO products, focus on what actually matters for research:
        </p>
        <BulletList 
          items={[
            "Purity and identity verification through third-party COAs",
            "Supplier transparency and documentation practices",
            "Proper handling and storage to maintain quality",
            "Batch traceability and consistency",
            "Clear communication about what's being sold"
          ]}
        />
        <p className="mt-4">
          The RUO label tells you about regulatory status. Everything else — 
          quality, reliability, trustworthiness — depends on the supplier and 
          their verification practices.
        </p>
      </ArticleSection>

      <ArticleSection title="The Bottom Line">
        <p>
          "Research Use Only" is exactly what it says: a product sold for research 
          purposes, outside the pharmaceutical approval framework. It's neither a 
          red flag nor a quality indicator — it's simply the regulatory context.
        </p>
        <p>
          What matters more than the RUO label is everything around it: testing, 
          documentation, supplier practices, and whether you can verify the claims 
          being made. Focus your evaluation there.
        </p>
      </ArticleSection>
    </EntryArticleLayout>
  );
}
