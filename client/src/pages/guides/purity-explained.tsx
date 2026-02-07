import { Link } from "wouter";
import { FileCheck, BookOpen, FlaskConical, Beaker, HelpCircle } from "lucide-react";
import { 
  EntryArticleLayout, 
  ArticleSection, 
  BulletList 
} from "@/components/entry-article-layout";
import { Card } from "@/components/ui/card";
import { HPLCChromatogram, PurityComparisonBars } from "@/components/article-graphics";

export default function PurityExplained() {
  const faqs = [
    {
      question: "Is 99% purity always better than 98%?",
      answer: "Not necessarily. The reliability of the testing matters more than small percentage differences. A 98% result from a verified, accredited lab is more trustworthy than a 99.9% claim from an unverified source."
    },
    {
      question: "What's an acceptable purity for research peptides?",
      answer: "Generally, 95%+ is considered acceptable for most research, with 98%+ being high-quality research-grade. The specific requirements depend on your research application and sensitivity needs."
    },
    {
      question: "What makes up the impurity percentage?",
      answer: "Impurities can include truncated sequences (incomplete peptide chains), deletion sequences, oxidation products, residual solvents, salts, and other synthesis byproducts. Not all impurities are equally concerning."
    },
    {
      question: "Do different peptides have different purity expectations?",
      answer: "Yes. Longer, more complex peptides are harder to synthesize at high purity. A 96% purity for a 40+ amino acid peptide may be excellent, while the same purity for a short 5 amino acid peptide would be below expectations."
    },
    {
      question: "How is purity actually measured?",
      answer: "HPLC (High-Performance Liquid Chromatography) is the standard method. It separates compounds and measures the proportion that is the target peptide versus impurities. Results are expressed as a percentage of the main peak."
    },
    {
      question: "Why do some companies claim 99.9% purity?",
      answer: "Some may be exaggerating, some may be using different measurement methods, and some may genuinely achieve very high purity for simple peptides. Be skeptical of very high claims without verified third-party documentation."
    }
  ];

  const ctaLinks = [
    {
      label: "View COA Library",
      href: "/coa-library",
      icon: FileCheck,
      description: "See actual purity results for our compounds"
    },
    {
      label: "How to Read a COA",
      href: "/guides/how-to-read-coas",
      icon: BookOpen,
      description: "Interpret purity reports yourself"
    },
    {
      label: "Browse Compound Information",
      href: "/guides/peptide-education-center",
      icon: FlaskConical,
      description: "Research context for specific peptides"
    },
    {
      label: "Understanding COA Trust",
      href: "/guides/are-peptide-coas-trustworthy",
      icon: HelpCircle,
      description: "What COAs prove and don't prove"
    }
  ];

  return (
    <EntryArticleLayout
      title="What Peptide Purity Percentages Actually Mean"
      metaTitle="What Peptide Purity Percentages Mean - Understanding HPLC Results"
      metaDescription="Learn what purity percentages actually measure, why higher isn't always better, and how to interpret peptide quality beyond a single number."
      canonicalPath="/guides/peptide-purity-explained"
      badgeText="Quality Understanding"
      badgeColor="#a855f7"
      introText={
        <>
          <p className="mb-4">
            "98% purity." "99.5% pure." "Pharmaceutical grade." You've seen these 
            claims everywhere. But what do purity percentages actually measure? 
            And is higher always better?
          </p>
          <p>
            This guide cuts through the marketing noise to explain what purity 
            numbers mean, their limitations, and how to evaluate quality beyond 
            a single percentage.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <ArticleSection title="What Purity Percentage Measures">
        <p>
          Purity percentage represents how much of a sample is the intended 
          compound versus impurities. For peptides, this is typically measured 
          using HPLC (High-Performance Liquid Chromatography).
        </p>
        <p>
          In simple terms: if a peptide tests at 98% purity, approximately 98% 
          of the sample mass is the target peptide, and 2% is other stuff.
        </p>
        <BulletList 
          items={[
            "HPLC separates components by how they interact with a column",
            "Each component produces a 'peak' on a chromatogram",
            "Purity is calculated as the main peak's area divided by total peak area",
            "Results are expressed as a percentage (e.g., 98.2%)"
          ]}
        />
      </ArticleSection>

      <HPLCChromatogram />

      <ArticleSection title="What That 2% Impurity Might Be">
        <p>
          Not all impurities are created equal. The non-target portion can include:
        </p>
        <BulletList 
          items={[
            "Truncated sequences — incomplete peptide chains from synthesis",
            "Deletion sequences — peptides missing one or more amino acids",
            "Oxidation products — from exposure to air or reactive conditions",
            "Salt counterions — often TFA (trifluoroacetic acid) from purification",
            "Residual solvents — from manufacturing and purification",
            "Aggregates — peptide molecules stuck together"
          ]}
        />
        <p className="mt-4">
          Some impurities are relatively benign (like salt counterions). Others 
          could potentially affect research results. This is why knowing what's 
          in the impurity fraction can matter more than the percentage itself.
        </p>
      </ArticleSection>

      <ArticleSection title="Why Higher Isn't Always Better" variant="limitation">
        <p className="font-medium mb-3">Several factors complicate the "higher is better" assumption:</p>
        <BulletList 
          color="#f59e0b"
          items={[
            "Different labs use different methods and settings — numbers aren't always comparable",
            "Peptide complexity affects achievable purity — longer peptides are harder to purify",
            "A 98% from a verified lab beats a claimed 99.9% from an unverified source",
            "Purity at synthesis may differ from purity at your bench after shipping/storage",
            "Very high claims (99.5%+) should be viewed with healthy skepticism"
          ]}
        />
        <p className="mt-4 text-sm">
          A trustworthy 97% is more valuable than a questionable 99.9%. The 
          credibility of the measurement matters as much as the number.
        </p>
      </ArticleSection>

      <PurityComparisonBars />

      <ArticleSection title="Peptide Length Affects Expectations">
        <p>
          Synthesis difficulty scales with peptide length:
        </p>
        <Card className="p-6 mt-4 border-[#a855f7]/20 bg-[#a855f7]/5">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-[#a855f7] mb-2">Short Peptides (5-15 aa)</h4>
              <p className="text-muted-foreground">
                Relatively easy to synthesize. Expect 98%+ purity. Lower purity 
                suggests quality issues.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#a855f7] mb-2">Medium Peptides (15-30 aa)</h4>
              <p className="text-muted-foreground">
                Moderate difficulty. 95-98% is typical and acceptable for research.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#a855f7] mb-2">Long Peptides (30+ aa)</h4>
              <p className="text-muted-foreground">
                Challenging synthesis. 90-95% may be excellent depending on the 
                specific sequence.
              </p>
            </div>
          </div>
        </Card>
        <p className="mt-4">
          A 96% purity BPC-157 (15 amino acids) and a 96% purity longer peptide 
          represent very different achievement levels. Context matters.
        </p>
      </ArticleSection>

      <ArticleSection title="What Purity Doesn't Tell You" variant="limitation">
        <p className="font-medium mb-3">Purity percentage has important limitations:</p>
        <BulletList 
          color="#f59e0b"
          items={[
            "It doesn't confirm molecular identity — a pure sample of the wrong compound is useless",
            "It doesn't indicate biological activity or stability",
            "It doesn't reflect storage or handling after testing",
            "It doesn't reveal what specific impurities are present",
            "It doesn't guarantee the testing method was appropriate"
          ]}
        />
        <p className="mt-4 text-sm">
          This is why comprehensive testing includes both HPLC (purity) and 
          mass spectrometry (identity). Purity alone is incomplete information.
        </p>
      </ArticleSection>

      <ArticleSection title="How to Evaluate Purity Claims" variant="proof">
        <p className="mb-3">
          When assessing purity claims, ask:
        </p>
        <BulletList 
          color="#22c55e"
          items={[
            "Was the testing done by an independent third-party lab?",
            "Is the specific methodology disclosed (e.g., HPLC column, conditions)?",
            "Does the batch number match your product?",
            "Was identity confirmed via mass spectrometry as well?",
            "Is the purity claim reasonable for this peptide's complexity?",
            "Can you verify the lab that performed the testing?"
          ]}
        />
      </ArticleSection>

      <ArticleSection title="Our Approach to Purity" variant="revive">
        <p className="mb-3">
          At Revive, we aim for transparency over marketing numbers:
        </p>
        <BulletList 
          color="#21d8ff"
          items={[
            "We publish actual tested purity, not idealized claims",
            "Third-party labs perform all testing independently",
            "COAs include methodology details for informed evaluation",
            "We pair HPLC purity with MS identity confirmation",
            "Batch archives maintain historical purity records",
            "We set realistic expectations based on peptide complexity"
          ]}
        />
        <p className="mt-4 text-sm">
          We'd rather report an honest 97.5% than claim an unverifiable 99.9%. 
          The credibility of the number matters more than the number itself.
        </p>
      </ArticleSection>

      <ArticleSection title="The Bottom Line">
        <p>
          Purity percentages are useful data points, but they're not the complete 
          picture. A number on a page only means something if you can trust how 
          it was measured, who measured it, and whether it applies to your specific 
          product.
        </p>
        <p>
          Focus less on chasing the highest percentage and more on verifying that 
          the testing is credible, the documentation is legitimate, and the 
          supplier is transparent about methodology.
        </p>
        <p>
          An honest, verified 97% beats a suspicious 99.9% every time.
        </p>
      </ArticleSection>
    </EntryArticleLayout>
  );
}
