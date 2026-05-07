import { Link } from "wouter";
import { FileCheck, Archive, BookOpen, Shield, AlertTriangle } from "lucide-react";
import { 
  EntryArticleLayout, 
  ArticleSection, 
  BulletList 
} from "@/components/entry-article-layout";
import { TrustScaleGraphic, COAAnatomyDiagram } from "@/components/article-graphics";

export default function CoaTrust() {
  const faqs = [
    {
      question: "Can a COA be faked?",
      answer: "Yes. A COA is only as trustworthy as the lab and company behind it. That's why independent third-party testing from accredited laboratories matters more than in-house testing claims."
    },
    {
      question: "What should I look for on a COA?",
      answer: "Look for the lab name and accreditation, the batch number matching your product, test date, methodology used (HPLC, MS), purity percentage, and any impurity breakdowns."
    },
    {
      question: "Does a high purity percentage mean a product is good?",
      answer: "Not necessarily on its own. Purity is one data point. You also need to consider the testing methodology, the lab's reputation, and whether the molecular identity was confirmed via mass spectrometry."
    },
    {
      question: "Why don't all companies provide COAs?",
      answer: "Third-party testing adds significant cost. Some companies skip it to maintain lower prices. Others test in-house, which creates conflicts of interest."
    },
    {
      question: "How do I verify a COA is real?",
      answer: "Cross-reference the batch number with the company's records, check if the lab name appears on the document, and ideally contact the lab directly for verification if you have concerns."
    }
  ];

  const ctaLinks = [
    {
      label: "View Our COA Library",
      href: "/coa-library",
      icon: FileCheck,
      description: "Browse verified certificates for all our compounds"
    },
    {
      label: "Browse Batch Archive",
      href: "/coa/batch-testing-archive",
      icon: Archive,
      description: "Historical testing records by batch number"
    },
    {
      label: "Learn How to Read a COA",
      href: "/guides/how-to-read-coas",
      icon: BookOpen,
      description: "Educational guide to interpreting test results"
    },
    {
      label: "Our Quality Process",
      href: "/guides/peptide-quality-assurance-process",
      icon: Shield,
      description: "See how we handle testing and verification"
    }
  ];

  return (
    <EntryArticleLayout
      title="Are Peptide COAs Trustworthy? What They Prove (and What They Don't)"
      metaTitle="Are Peptide COAs Trustworthy? What They Prove and What They Don't"
      metaDescription="Not all COAs are equal. Learn what a Certificate of Analysis actually proves, its limitations, and how to evaluate peptide quality beyond the document."
      canonicalPath="/guides/are-peptide-coas-trustworthy"
      badgeText="Trust & Verification"
      badgeColor="#21d8ff"
      introText={
        <>
          <p className="mb-4">
            If you've researched peptides, you've probably seen companies wave around 
            COAs (Certificates of Analysis) as proof of quality. But here's the uncomfortable 
            truth that most vendors won't tell you: <strong>a COA is only as trustworthy 
            as the company and lab behind it.</strong>
          </p>
          <p>
            This guide breaks down what COAs actually prove, what they don't, and how 
            to evaluate peptide quality with appropriate skepticism — even toward us.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
      qualityTrustHub
    >
      <TrustScaleGraphic />

      <ArticleSection title="What Is a Certificate of Analysis?">
        <p>
          A Certificate of Analysis (COA) is a document issued after laboratory testing 
          that reports the results of quality control tests performed on a specific batch 
          of product. For peptides, this typically includes:
        </p>
        <BulletList 
          items={[
            "Purity percentage (usually via HPLC testing)",
            "Molecular identity confirmation (via mass spectrometry)",
            "Appearance and physical characteristics",
            "Batch/lot number and test date",
            "Laboratory name and methodology"
          ]}
        />
        <p className="mt-4">
          In theory, a COA provides independent verification that a product meets 
          quality standards. In practice, the value depends entirely on who performed 
          the test and how.
        </p>
      </ArticleSection>

      <ArticleSection title="What a COA Actually Proves" variant="proof">
        <p className="font-medium mb-3">When a COA comes from a legitimate third-party lab:</p>
        <BulletList 
          color="#22c55e"
          items={[
            "The tested sample met the stated purity at the time of testing",
            "The molecular structure matches the expected compound (if MS was performed)",
            "The specific batch tested passed the lab's quality thresholds",
            "An independent party with proper equipment verified the results"
          ]}
        />
        <p className="mt-4 text-sm">
          This is valuable. It means someone other than the seller checked the product 
          and documented the findings.
        </p>
      </ArticleSection>

      <ArticleSection title="What a COA Does NOT Prove" variant="limitation">
        <p className="font-medium mb-3">Here's where healthy skepticism is warranted:</p>
        <BulletList 
          color="#f59e0b"
          items={[
            "It doesn't prove every vial from that batch is identical to the tested sample",
            "It doesn't guarantee the product wasn't contaminated after testing",
            "It doesn't verify proper storage and handling during shipping",
            "It doesn't prove the COA wasn't fabricated or doctored",
            "It doesn't guarantee the lab itself is reputable or properly calibrated"
          ]}
        />
        <p className="mt-4 text-sm">
          A COA is a snapshot — a single moment in time, from a single sample, under 
          specific conditions. It's an important data point, not absolute proof.
        </p>
      </ArticleSection>

      <ArticleSection title="The Problem with In-House Testing">
        <p>
          Some companies perform their own testing and issue their own COAs. This creates 
          an obvious conflict of interest: the seller is also the verifier.
        </p>
        <p>
          In-house testing isn't inherently dishonest — some companies have legitimate 
          QC labs. But it requires you to trust the company's integrity completely, 
          with no independent check.
        </p>
        <p>
          <strong>Third-party testing from accredited laboratories</strong> removes 
          this conflict. The lab has no financial stake in whether the product passes 
          or fails. Their reputation depends on accurate, unbiased results.
        </p>
      </ArticleSection>

      <ArticleSection title="How Revive Handles This Responsibly" variant="revive">
        <p>
          We're not going to claim we're perfect or that you should blindly trust us. 
          Instead, here's what we actually do:
        </p>
        <BulletList 
          color="#21d8ff"
          items={[
            "Every batch is tested by independent third-party laboratories",
            "We publish COAs with batch numbers that match what ships to you",
            "Our batch archive maintains historical records for transparency",
            "We use accredited labs with established reputations in the industry",
            "QR codes on products link directly to batch-specific test results"
          ]}
        />
        <p className="mt-4 text-sm">
          We encourage you to verify. Check the batch numbers. Contact labs if you 
          have concerns. Skepticism is healthy in this industry.
        </p>
      </ArticleSection>

      <COAAnatomyDiagram />

      <ArticleSection title="How to Evaluate COAs Like a Skeptic">
        <p>
          Whether you're evaluating us or any other supplier, here's how to approach 
          COAs with appropriate rigor:
        </p>
        <BulletList 
          items={[
            "Check if the lab name appears on the document — research the lab",
            "Verify the batch number matches what you received",
            "Look for both HPLC (purity) and MS (identity) testing",
            "Be wary of unusually high purity claims (99.9%+ is rare and often exaggerated)",
            "Ask how you can independently verify the results"
          ]}
        />
        <p className="mt-4">
          The best suppliers welcome scrutiny. The worst ones discourage questions.
        </p>
      </ArticleSection>

      <ArticleSection title="The Bottom Line">
        <p>
          COAs are valuable tools for evaluating peptide quality — but they're not 
          magic certificates of absolute truth. They're one piece of a larger trust 
          equation that includes the supplier's track record, the lab's reputation, 
          proper handling, and your own verification efforts.
        </p>
        <p>
          Don't dismiss COAs. Don't worship them either. Use them as the quality 
          indicator they are: useful, imperfect, and best combined with other 
          verification methods.
        </p>
      </ArticleSection>
    </EntryArticleLayout>
  );
}
