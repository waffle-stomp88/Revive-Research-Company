import { Link } from "wouter";
import { FileCheck, Archive, BookOpen, Shield, Search, ExternalLink } from "lucide-react";
import { 
  EntryArticleLayout, 
  ArticleSection, 
  BulletList 
} from "@/components/entry-article-layout";
import { Card } from "@/components/ui/card";
import { VerificationStepper, RedGreenFlags } from "@/components/article-graphics";

export default function VerifyQuality() {
  const faqs = [
    {
      question: "Should I trust COAs from the seller?",
      answer: "COAs are more trustworthy when they come from independent third-party labs. Check if the lab name is disclosed and verifiable. In-house testing creates a conflict of interest; third-party testing removes it."
    },
    {
      question: "What if a company won't share their COAs?",
      answer: "This is a red flag. Legitimate suppliers should willingly provide COAs for the specific batch you're purchasing. Reluctance to share documentation suggests either poor testing practices or something to hide."
    },
    {
      question: "How can I tell if a COA is fake?",
      answer: "Look for specific details: lab name, batch number matching your product, test methodology, specific purity numbers (not just '99%+'), and a realistic test date. Contact the lab directly if you have concerns."
    },
    {
      question: "Is higher purity always better?",
      answer: "Not necessarily. Context matters. A 98% purity peptide from a verified, accredited lab may be more reliable than a claimed 99.9% from an unverified source. The credibility of the testing matters as much as the number."
    },
    {
      question: "What's the minimum purity I should accept?",
      answer: "For most research peptides, 95%+ is generally considered acceptable, with 98%+ being research-grade. However, the methodology and reliability of testing matters more than hitting an arbitrary threshold."
    },
    {
      question: "Can I get my own independent testing done?",
      answer: "Yes, and this is the most definitive verification. Labs that offer peptide analysis include Janoshik, Colmaric Analyticals, and others. Expect to pay $200-500+ per sample."
    }
  ];

  const ctaLinks = [
    {
      label: "View Our COA Library",
      href: "/coa-library",
      icon: FileCheck,
      description: "Browse verified certificates for all compounds"
    },
    {
      label: "Browse Batch Archive",
      href: "/coa/batch-testing-archive",
      icon: Archive,
      description: "Historical testing records by batch"
    },
    {
      label: "Our Quality Process",
      href: "/guides/peptide-quality-assurance-process",
      icon: Shield,
      description: "How we handle testing and verification"
    },
    {
      label: "Understanding COAs",
      href: "/guides/are-peptide-coas-trustworthy",
      icon: BookOpen,
      description: "What COAs prove and don't prove"
    }
  ];

  return (
    <EntryArticleLayout
      title="How to Verify Peptide Quality Without Trusting the Seller"
      metaTitle="How to Verify Peptide Quality - Independent Verification Guide"
      metaDescription="Don't take anyone's word for it. Learn how to independently verify peptide quality through COAs, third-party testing, and smart evaluation practices."
      canonicalPath="/guides/how-to-verify-peptide-quality"
      badgeText="Independent Verification"
      badgeColor="#E7FB10"
      introText={
        <>
          <p className="mb-4">
            Here's advice you won't hear from most peptide sellers: <strong>don't 
            blindly trust us.</strong> Or anyone else in this industry. Trust should 
            be earned through verifiable evidence, not marketing claims.
          </p>
          <p>
            This guide teaches you how to evaluate peptide quality independently — 
            skills that will serve you whether you buy from us, a competitor, or 
            decide to look elsewhere entirely.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
      qualityTrustHub
    >
      <ArticleSection title="Why Healthy Skepticism Matters">
        <p>
          The peptide market has a trust problem. Too many vendors:
        </p>
        <BulletList 
          items={[
            "Make quality claims without providing documentation",
            "Use in-house testing that can't be independently verified",
            "Recycle the same generic COAs across different products",
            "Exaggerate purity numbers to win sales",
            "Disappear when customers ask difficult questions"
          ]}
        />
        <p className="mt-4">
          The solution isn't to trust harder — it's to verify smarter. Here's how.
        </p>
      </ArticleSection>

      <VerificationStepper />

      <ArticleSection title="Step 1: Demand Third-Party COAs" variant="proof">
        <p className="mb-3">
          The most important question to ask any supplier:
        </p>
        <p className="font-semibold text-lg mb-4 text-[#22c55e]">
          "Can you provide a COA from an independent third-party lab for the 
          specific batch I'm purchasing?"
        </p>
        <p>
          Red flags:
        </p>
        <BulletList 
          color="#22c55e"
          items={[
            "They can't provide any COA at all",
            "COA is from 'in-house testing' only",
            "No lab name is listed on the document",
            "The same COA is used for multiple different batches",
            "They get defensive when asked for documentation"
          ]}
        />
      </ArticleSection>

      <ArticleSection title="Step 2: Verify the Lab">
        <p>
          A COA is only as good as the lab that produced it. Check:
        </p>
        <BulletList 
          items={[
            "Is the lab name actually on the COA?",
            "Does the lab have a verifiable website and contact information?",
            "What accreditations does the lab hold?",
            "Can you contact the lab to confirm they issued the report?",
            "Does the lab specialize in peptide analysis?"
          ]}
        />
        <p className="mt-4">
          Established labs that perform peptide testing include Janoshik Analytical, 
          Colmaric Analyticals, and various ISO-accredited analytical laboratories. 
          Unknown or unverifiable lab names are a warning sign.
        </p>
      </ArticleSection>

      <ArticleSection title="Step 3: Match Batch Numbers">
        <p>
          Every legitimate COA should have a batch or lot number. This should match:
        </p>
        <BulletList 
          items={[
            "The batch number on the product you receive",
            "The batch number listed in any order confirmation or documentation",
            "Records in the supplier's batch archive (if they maintain one)"
          ]}
        />
        <p className="mt-4">
          If the batch numbers don't match, you can't be sure the COA applies to 
          your specific product. This is one of the most common ways documentation 
          becomes meaningless.
        </p>
      </ArticleSection>

      <ArticleSection title="Step 4: Understand What's Being Tested">
        <p>
          Not all COAs test for the same things. Look for:
        </p>
        <BulletList 
          items={[
            "HPLC purity analysis — measures how much of the sample is the target compound",
            "Mass spectrometry (MS) — confirms molecular identity",
            "Appearance and physical properties — basic quality indicators",
            "Residual solvents or contaminants — for sensitive applications"
          ]}
        />
        <p className="mt-4">
          A COA that only shows purity without identity confirmation (MS) is 
          incomplete. You want to know both how pure the sample is AND that it's 
          actually the compound claimed.
        </p>
      </ArticleSection>

      <ArticleSection title="Step 5: Consider Independent Testing" variant="proof">
        <p className="mb-3">
          The ultimate verification is testing you commission yourself:
        </p>
        <BulletList 
          color="#22c55e"
          items={[
            "Send a sample to an independent lab you choose",
            "Get results that are completely outside the supplier's control",
            "Know with certainty what you actually received"
          ]}
        />
        <p className="mt-4 text-sm">
          This costs $200-500+ per sample and takes 1-2 weeks. It's not practical 
          for every purchase, but valuable for validating a new supplier or for 
          critical research applications.
        </p>
      </ArticleSection>

      <Card className="p-6 border-[#21d8ff]/30 bg-[#21d8ff]/5 my-8">
        <div className="flex items-start gap-4">
          <Search className="h-6 w-6 text-[#21d8ff] flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-[#21d8ff] mb-2">Apply This to Us</h3>
            <p className="text-muted-foreground text-sm">
              We encourage you to apply every verification step in this guide to 
              Revive Research. Check our COAs. Verify our labs. Match our batch 
              numbers. Commission your own testing if you want certainty. We'd 
              rather earn your trust through evidence than marketing.
            </p>
          </div>
        </div>
      </Card>

      <RedGreenFlags />

      <ArticleSection title="Red Flags to Watch For" variant="limitation">
        <p className="font-medium mb-3">Warning signs that suggest quality issues:</p>
        <BulletList 
          color="#f59e0b"
          items={[
            "Unusually low prices with high purity claims (too good to be true usually is)",
            "No COAs available, or COAs only 'upon request' with excuses",
            "In-house testing only, no independent verification",
            "Vague or missing lab information on documentation",
            "Defensive reactions when asked about quality verification",
            "No batch numbers or batch traceability system"
          ]}
        />
      </ArticleSection>

      <ArticleSection title="Green Flags That Build Confidence" variant="proof">
        <p className="font-medium mb-3">Signs of a trustworthy supplier:</p>
        <BulletList 
          color="#22c55e"
          items={[
            "Third-party COAs from named, verifiable laboratories",
            "Batch numbers that match between product and documentation",
            "Transparent batch archive with historical records",
            "Willingness to answer questions about testing and sourcing",
            "Clear communication about limitations and what testing does/doesn't prove",
            "Consistent quality reports across multiple purchases"
          ]}
        />
      </ArticleSection>

      <ArticleSection title="The Bottom Line">
        <p>
          You have the tools to verify peptide quality without taking anyone's 
          word for it. Use them. Demand documentation, verify sources, match 
          batch numbers, and consider independent testing when it matters.
        </p>
        <p>
          The best suppliers will welcome this scrutiny because they have 
          nothing to hide. The worst ones will discourage questions or make 
          verification difficult.
        </p>
        <p>
          Trust is earned through evidence. Now you know how to evaluate that evidence.
        </p>
      </ArticleSection>
    </EntryArticleLayout>
  );
}
