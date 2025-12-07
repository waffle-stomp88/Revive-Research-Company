import { motion } from "framer-motion";
import { 
  Lightbulb, 
  BookOpen,
  Beaker,
  ThermometerSnowflake,
  FileCheck,
  FlaskConical,
  Shield,
  BookMarked,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { 
  WhatIsPeptideVisual, 
  SimplePurityMeter, 
  COASimplified, 
  StorageBasics,
  ResearchOnlyExplainer,
  OrderingJourneySimple
} from "./beginner-infographics";

interface BeginnerContentProps {
  slug: string;
  title: string;
}

interface BeginnerArticle {
  icon: typeof Lightbulb;
  iconColor: string;
  intro: string;
  sections: {
    title: string;
    content: string;
    visual?: () => JSX.Element;
  }[];
  takeaway: string;
}

const beginnerArticles: Record<string, BeginnerArticle> = {
  "understanding-peptide-purity": {
    icon: Beaker,
    iconColor: "#21d8ff",
    intro: `When you're new to peptide research, one of the first terms you'll encounter is "purity." It sounds technical, but it's actually a straightforward concept that's essential to understand. Think of it like buying gold jewelry - you want to know if it's 24 karat (pure) or mixed with other metals. The same principle applies to research peptides.`,
    sections: [
      {
        title: "What Purity Actually Means",
        content: `Purity is simply a percentage that tells you how much of your vial is the actual peptide you ordered, versus other stuff that came along during manufacturing. If a peptide is 99% pure, that means 99% of what's in the vial is the exact molecule you wanted, and only 1% is anything else.

That "other stuff" isn't necessarily harmful - it's usually just leftover materials from the manufacturing process, like salts or incomplete peptide chains. But for research purposes, you want as little of it as possible so your experiments produce clear, reliable results.`,
        visual: () => <SimplePurityMeter />
      },
      {
        title: "How Purity Gets Measured",
        content: `Scientists measure purity using a technique called HPLC (High-Performance Liquid Chromatography). Don't let the fancy name intimidate you - here's what it does in simple terms:

The machine pushes your peptide sample through a special tube. Different molecules travel through at different speeds based on their size and properties. The machine then counts how much of each type comes out the other end. If 99% of what comes out is your target peptide, that's your purity percentage.

Every legitimate peptide vendor should provide an HPLC test result on the Certificate of Analysis (COA) that comes with your order. This is your proof that the product was actually tested.`
      },
      {
        title: "What Purity Level Do You Need?",
        content: `Here's a simple guide to help you understand the different purity grades:

**99%+ (Ultra Pure)** - The highest grade available. Best for sensitive research where even tiny impurities could affect results. Premium price, but maximum reliability.

**98%+ (High Purity)** - Excellent quality suitable for most research applications. This is the sweet spot for many researchers - high quality without the ultra-premium cost.

**95-97% (Research Grade)** - Good for general research and initial studies. More affordable, but may have slightly more variability in results.

For most researchers just starting out, 98%+ purity is an excellent choice. It provides great quality without breaking the bank.`
      },
      {
        title: "Why This Matters for Your Research",
        content: `Imagine you're trying to study how a specific peptide affects cells in a lab dish. If your peptide is only 90% pure, you don't really know if the effects you're seeing are from the peptide itself, or from that other 10% of mystery compounds.

Higher purity means cleaner data. When something interesting happens in your research, you can be confident it's because of the peptide - not contamination. This makes your work more reproducible and your conclusions more trustworthy.

It's like cooking with fresh ingredients versus canned - both might work, but one gives you cleaner, more predictable results.`
      }
    ],
    takeaway: "Always check the purity percentage on your COA before starting any research. For most applications, look for 98% or higher purity to ensure reliable, reproducible results."
  },

  "reconstitution-101": {
    icon: FlaskConical,
    iconColor: "#22c55e",
    intro: `When your peptide order arrives, you'll notice it's a dry powder - not a liquid. This is intentional! Peptides stay stable much longer as a freeze-dried powder than as a liquid. "Reconstitution" is just a fancy word for mixing that powder with water to create a usable solution. It's easier than it sounds, and this guide will walk you through everything you need to know.`,
    sections: [
      {
        title: "Why Peptides Come as Powder",
        content: `Peptides are delicate molecules. When they're dissolved in water, they start to slowly break down over time - especially if they get warm or are exposed to light. But when they're freeze-dried (the scientific term is "lyophilized"), they can stay stable for months or even years.

Think of it like instant coffee versus brewed coffee. Instant coffee (the powder) can sit in your pantry for ages. But once you add water, you've got a limited window to enjoy it before it goes stale. Peptides work the same way.

This is actually a good thing for researchers! It means your peptides arrive in peak condition, and you control exactly when to activate them by adding water.`,
        visual: () => <WhatIsPeptideVisual />
      },
      {
        title: "What You'll Need",
        content: `Before you start, gather these supplies:

**Bacteriostatic Water** - This is sterile water with a tiny amount of benzyl alcohol (0.9%) added as a preservative. The preservative helps prevent bacteria from growing in your solution, extending its usable life. This is what most researchers use.

**Sterile Syringes** - You'll need these to measure and transfer the water. Use a new, sterile syringe each time.

**Alcohol Wipes** - For cleaning the rubber stopper on your vials before puncturing them. This prevents contamination.

**A Clean Workspace** - Work on a clean, sanitized surface. The cleaner your environment, the better your results will be.`
      },
      {
        title: "The Reconstitution Process",
        content: `Here's the step-by-step process in plain language:

**Step 1:** Clean the rubber stopper on your peptide vial with an alcohol wipe. Let it dry for a moment.

**Step 2:** Draw your bacteriostatic water into a sterile syringe. The amount depends on your research protocol - common amounts are 1-2 mL.

**Step 3:** Insert the needle through the rubber stopper at an angle. Here's the crucial part: aim the needle at the inside wall of the vial, not directly at the powder.

**Step 4:** Push the water out SLOWLY. Let it trickle down the glass wall and gently flow over the powder. Don't blast the powder directly - this can damage the peptide molecules.

**Step 5:** Once all the water is in, gently swirl the vial. Don't shake it vigorously! Just rotate it slowly until the powder is fully dissolved. This might take a minute or two.

**Step 6:** Your peptide is now ready for research use. Store it in the refrigerator and note the date you reconstituted it.`
      },
      {
        title: "Common Mistakes to Avoid",
        content: `**Don't shake the vial** - Vigorous shaking can damage peptide bonds. Gentle swirling is all you need.

**Don't inject water directly onto the powder** - The force can break apart the peptide molecules. Always aim for the vial wall.

**Don't use regular water** - Tap water or even distilled water lacks the preservative that keeps bacteria from growing. Always use bacteriostatic water.

**Don't leave reconstituted peptides at room temperature** - Once mixed, peptides need refrigeration. Get them into the fridge as soon as you're done.

**Don't freeze reconstituted peptides** - Freezing and thawing can damage the peptide structure. Only freeze the original powder form.`
      }
    ],
    takeaway: "Reconstitution is simple once you understand the basics: use bacteriostatic water, inject slowly along the vial wall, swirl gently, and refrigerate immediately. Take your time and work cleanly for the best results."
  },

  "proper-peptide-storage": {
    icon: ThermometerSnowflake,
    iconColor: "#9d4edd",
    intro: `Proper storage is one of the most important factors in maintaining peptide quality - yet it's often overlooked. The good news? It's not complicated. Understanding a few key principles will help you keep your research materials in optimal condition for as long as possible.`,
    sections: [
      {
        title: "The Two Storage States",
        content: `Peptides exist in two different states, and each requires different storage:

**Lyophilized (Powder Form)** - This is how your peptides arrive. In this freeze-dried state, they're very stable. Store these in your freezer at -20°C (-4°F) or colder. At this temperature, most peptides remain stable for 1-2 years or even longer.

**Reconstituted (Mixed with Water)** - Once you've added bacteriostatic water, the clock starts ticking. Store these in your refrigerator at 2-8°C (36-46°F). Most reconstituted peptides remain stable for 4-6 weeks under proper refrigeration.

The key difference is that water accelerates degradation. That's why powder lasts so much longer than liquid.`,
        visual: () => <StorageBasics />
      },
      {
        title: "The Three Enemies of Peptides",
        content: `Peptides are sensitive molecules, and three things in particular can damage them:

**Heat** - Warmth speeds up chemical reactions, including the ones that break down peptides. This is why refrigeration is essential. Even a few hours at room temperature can reduce potency.

**Light** - UV light from the sun (and some indoor lighting) can break chemical bonds in peptide molecules. This is why many peptides come in amber or opaque vials. If yours doesn't, consider storing it in a dark container or wrapping it in foil.

**Moisture** - For lyophilized peptides, humidity is the enemy. Moisture can start the degradation process even before you officially reconstitute. Keep sealed vials in airtight containers with desiccant packets if possible.`
      },
      {
        title: "Practical Storage Tips",
        content: `**When your order arrives:** Immediately place lyophilized vials in the freezer. Don't leave them sitting in a mailbox or on a counter.

**Only reconstitute what you need:** If you have multiple vials, keep most of them frozen and only mix one at a time. This maximizes the overall shelf life of your supply.

**Label everything:** Write the reconstitution date on each vial. It's easy to lose track, and you don't want to use a peptide that's been sitting for months.

**Minimize freeze-thaw cycles:** Each time you freeze and thaw a reconstituted peptide, you risk damaging it. If you need small amounts over time, consider dividing your reconstituted solution into smaller aliquots.

**Keep a dedicated fridge section:** Store peptides away from frequently accessed areas. Every time the fridge door opens, temperature fluctuates. A spot in the back or a dedicated research fridge is ideal.`
      },
      {
        title: "Signs of Degraded Peptides",
        content: `How do you know if storage conditions have compromised your peptide? Here are some warning signs:

**Color changes** - Most peptides are white or off-white. Yellowing or browning can indicate degradation.

**Clumping or unusual texture** - Lyophilized peptides should be a fine, fluffy powder. Clumps or wet-looking areas suggest moisture exposure.

**Cloudiness after reconstitution** - A properly reconstituted peptide should produce a clear solution. Cloudiness might indicate contamination or aggregation.

**Reduced effectiveness** - If your research results suddenly become inconsistent when using an older vial, degradation could be the cause.

When in doubt, it's better to use a fresh vial than risk compromised results.`
      }
    ],
    takeaway: "Store powder in the freezer, store reconstituted solutions in the fridge, and protect everything from light and moisture. Label your vials with dates and use the oldest ones first."
  },

  "reading-coa-documents": {
    icon: FileCheck,
    iconColor: "#E7FB10",
    intro: `A Certificate of Analysis (COA) is essentially a report card for your peptide. It's third-party proof that what's in the vial is actually what the label says, and that it meets quality standards. Learning to read a COA is an essential skill for any researcher - and it's not as complicated as it might look at first glance.`,
    sections: [
      {
        title: "Why COAs Matter",
        content: `In the peptide research world, you can't just take a vendor's word that their products are high-quality. Anyone can put a label on a vial. The COA is what separates legitimate research suppliers from questionable ones.

A proper COA comes from an independent, third-party laboratory - not the company selling the peptide. This independence is crucial. It means an unbiased lab has actually tested the product and is putting their reputation on the line by certifying the results.

Think of it like getting your car inspected by an independent mechanic rather than the dealership trying to sell it to you. Both might be honest, but the independent opinion carries more weight.`,
        visual: () => <COASimplified />
      },
      {
        title: "Key Sections of a COA",
        content: `Every COA should contain several essential pieces of information:

**Product Identity** - This confirms the peptide is what it claims to be. Methods like mass spectrometry verify that the molecular structure matches the expected peptide sequence. If you ordered BPC-157, this section confirms you got BPC-157.

**Purity Analysis** - Usually shown as a percentage from HPLC testing. This tells you how much of the sample is your target peptide versus impurities. Look for 95% or higher for research-grade quality.

**Batch/Lot Number** - This unique identifier links your specific vial to this specific test. If you ever have questions about your product, this number is how you trace it.

**Test Date** - When was this batch actually tested? You want to see a relatively recent date. A COA from years ago might not reflect the current product's condition.

**Appearance** - A simple but important check. The document should note that the peptide looks correct (typically "white lyophilized powder").`
      },
      {
        title: "How to Verify a COA",
        content: `Not all COAs are created equal. Here's how to spot a trustworthy one:

**Check for a third-party lab name** - The COA should clearly identify which independent laboratory performed the testing. You should be able to look up that lab and verify they exist.

**Look for actual data, not just claims** - A good COA includes the actual HPLC chromatogram (the graph showing the peaks), not just a number. The raw data is harder to fake.

**Match the batch number** - The batch number on your COA should match the batch number on your product vial. If they don't match, the COA might be from a different batch.

**Verify the testing date makes sense** - The test date should be recent relative to when the product was manufactured. A COA dated three years before your purchase is suspicious.

**Be wary of perfect numbers** - Ironically, a COA showing exactly 100.00% purity should raise eyebrows. Real lab tests have minor variations. Something like 99.2% is more believable than a suspiciously round 100%.`
      },
      {
        title: "Red Flags to Watch For",
        content: `Some warning signs that a COA might not be legitimate:

**No lab identification** - If the document doesn't name a specific testing laboratory, it could be self-generated.

**Missing or blurry data** - Legitimate labs produce clear, professional documentation. Fuzzy images or missing sections are concerning.

**No batch number** - Without a batch number, you can't verify the COA matches your specific product.

**Generic templates** - If every product from a vendor has identical-looking COAs with just the product name changed, they might be using a template rather than actual testing.

**Vendor won't provide COA** - If a company can't or won't provide a COA for their products, that's a major red flag. Walk away.

A legitimate research supplier will happily provide COAs and answer questions about their testing procedures. Transparency is a sign of quality.`
      }
    ],
    takeaway: "Always request and review the COA before using any research peptide. Check for third-party lab verification, matching batch numbers, and recent test dates. A quality vendor will provide this documentation readily."
  },

  "peptide-research-applications": {
    icon: Sparkles,
    iconColor: "#ec4899",
    intro: `Peptides are fascinating molecules that serve as messengers throughout biological systems. They're essentially short chains of amino acids - the same building blocks that make up proteins, just in smaller packages. Scientists study peptides to understand how cells communicate, how the body regulates itself, and how these processes might be influenced. This guide introduces you to the world of peptide research in accessible terms.`,
    sections: [
      {
        title: "What Exactly Are Peptides?",
        content: `To understand peptides, let's start with the basics. Your body is made of proteins, and proteins are made of amino acids. Think of amino acids as individual LEGO bricks. When you connect just a few bricks together (2-50 or so), you have a peptide. When you connect hundreds or thousands, you have a protein.

Peptides are like the body's text messages - short, specific signals that tell cells what to do. Some peptides tell your body to release growth hormone. Others signal cells to start repairing tissue. Some influence appetite and metabolism. The variety is enormous.

Scientists study synthetic versions of these peptides to understand how these signaling systems work. By observing what happens when a specific peptide is introduced in a controlled laboratory setting, researchers can learn about the underlying biology.`,
        visual: () => <WhatIsPeptideVisual />
      },
      {
        title: "Major Categories of Research Peptides",
        content: `Research peptides are often grouped by what systems they interact with:

**Growth Hormone Research** - Peptides like CJC-1295, Ipamorelin, and Tesamorelin are studied for their interactions with the growth hormone axis. Researchers examine how they influence the release of growth hormone and related factors.

**Metabolic Research** - GLP-1 agonists like Semaglutide and dual/triple agonists like Tirzepatide and Retatrutide are studied for their effects on metabolic pathways, appetite signaling, and glucose regulation.

**Tissue Repair Research** - Peptides like BPC-157 and TB-500 are investigated for their potential roles in tissue healing and regeneration pathways.

**Neuropeptides** - Compounds like Semax and Selank are studied for their interactions with brain chemistry and cognitive processes.

**Longevity Research** - Peptides like Epithalon are examined for potential effects on cellular aging markers like telomere length.

Each category represents an active area of scientific inquiry, with researchers working to understand the mechanisms involved.`
      },
      {
        title: "How Peptide Research Works",
        content: `Laboratory peptide research typically follows a structured approach:

**In Vitro Studies** - Scientists first study peptides in controlled environments like cell cultures. They can observe direct effects on cells without the complexity of a whole organism.

**Mechanism Investigation** - Researchers work to understand exactly how a peptide produces its effects. Which receptors does it bind to? What cellular pathways does it activate?

**Dosage Studies** - Finding optimal concentrations is crucial. Too little might show no effect; too much might trigger unintended responses.

**Comparative Analysis** - Scientists often compare similar peptides to understand structure-function relationships. Why does changing one amino acid dramatically alter a peptide's behavior?

All of this work builds the scientific foundation for understanding how these molecules work in biological systems.`
      },
      {
        title: "The Importance of Quality in Research",
        content: `Why does peptide purity and quality matter so much in research? Because conclusions are only as good as the materials used to reach them.

If a researcher is studying how a specific peptide affects cells, but their peptide sample is contaminated with other compounds, they can't be certain what's actually causing the observed effects. Was it the peptide? Was it a contaminant? This uncertainty undermines the entire study.

This is why reputable research relies on high-purity peptides with verified COAs. It's also why storage and handling matter - a degraded peptide might not produce the same results as a fresh one.

For meaningful research, you need to know exactly what you're working with. There's no shortcut around quality.`
      }
    ],
    takeaway: "Peptides are small signaling molecules that researchers study to understand biological processes. Different peptide categories interact with different body systems. Quality materials and proper handling are essential for producing reliable research results."
  },

  "lab-safety-guidelines": {
    icon: Shield,
    iconColor: "#f97316",
    intro: `Working with research peptides requires following basic laboratory safety practices. These guidelines aren't just bureaucratic rules - they protect both you and your research materials. A contaminated sample or an accidental exposure can ruin weeks of work. Taking a few simple precautions makes everything run more smoothly.`,
    sections: [
      {
        title: "Setting Up Your Workspace",
        content: `Before handling any research materials, prepare your workspace:

**Clean and sanitize your work surface.** Wipe down with appropriate disinfectant and let it dry completely. Dust, bacteria, and other contaminants can compromise your materials.

**Gather all supplies before you start.** Having to hunt for a syringe or alcohol wipe mid-procedure increases the risk of contamination or mistakes.

**Ensure good lighting.** You need to clearly see what you're doing, especially when working with small vials and precise measurements.

**Minimize distractions.** Turn off your phone notifications. Ask others not to interrupt. Focused work is safer work.

**Work away from food and drink.** This should go without saying, but never eat or drink in the same area where you're handling research materials.`,
        visual: () => <ResearchOnlyExplainer />
      },
      {
        title: "Personal Protective Equipment",
        content: `The basics of personal protection when handling peptides:

**Gloves** - Always wear nitrile or latex gloves when handling vials or syringes. Change them if they become contaminated or torn. Never touch your face while wearing gloves.

**Lab coat or dedicated clothing** - While not always necessary for basic peptide handling, it's good practice to have clothes you don't mind getting chemicals on.

**Eye protection** - If you're working with larger quantities or doing any procedures that could splash, safety glasses are wise.

**Closed-toe shoes** - If you drop a vial or needle, you don't want exposed feet.

The goal is simple: create a barrier between the research materials and yourself.`
      },
      {
        title: "Handling Sharps Safely",
        content: `Syringes and needles require special attention:

**Use each needle only once.** Reusing needles increases contamination risk and can damage the rubber stoppers on your vials.

**Never recap needles by hand.** If you must recap, use a one-handed "scoop" technique or a needle recapping device. Two-handed recapping is how needlestick injuries happen.

**Dispose of sharps properly.** Use a designated sharps container - never throw needles in regular trash. If you don't have a sharps container, a thick plastic bottle with a secure lid (like a laundry detergent bottle) works in a pinch.

**Keep sharps containers accessible.** Place them close to where you're working so you're not carrying exposed needles across the room.

**Know what to do if stuck.** If you accidentally stick yourself, wash the area immediately with soap and water. Consider seeking medical advice depending on what you were working with.`
      },
      {
        title: "Contamination Prevention",
        content: `Keeping your materials pure requires consistent practices:

**Always wipe vial stoppers with alcohol before puncturing.** This is one of the most important steps. It takes three seconds and prevents countless contamination issues.

**Use aseptic technique.** This means working in a way that minimizes exposure to environmental contaminants - keeping vials covered when not in use, not touching sterile surfaces, etc.

**Store reconstituted peptides properly.** Get them into the refrigerator promptly. Label them with the date.

**Don't combine old and new batches.** Using up one vial before opening another prevents cross-contamination and confusion.

**If something seems wrong, don't use it.** Cloudy solution? Unusual color? Compromised seal? When in doubt, throw it out.`
      }
    ],
    takeaway: "Good lab safety is about creating habits: clean workspace, proper gloves, careful sharps handling, and consistent contamination prevention. These practices protect both you and the integrity of your research."
  },

  "peptide-research-glossary": {
    icon: BookMarked,
    iconColor: "#21d8ff",
    intro: `Every field has its jargon, and peptide research is no exception. When you're just starting out, the terminology can feel overwhelming. This glossary covers the essential terms you'll encounter, explained in plain language. Bookmark this page - you'll probably find yourself coming back to it.`,
    sections: [
      {
        title: "Basic Terms",
        content: `**Amino Acid** - The basic building blocks of peptides and proteins. There are 20 standard amino acids that combine in different sequences to create different peptides.

**Peptide** - A chain of amino acids, typically containing 2-50 amino acids linked together. Larger chains are usually called proteins.

**Protein** - A larger molecule made of one or more long chains of amino acids. Proteins are essentially very long peptides.

**Sequence** - The specific order of amino acids in a peptide. The sequence determines the peptide's structure and function. Even a single amino acid change can dramatically alter behavior.

**Synthetic Peptide** - A peptide made in a laboratory rather than extracted from natural sources. Most research peptides are synthetic.`
      },
      {
        title: "Preparation Terms",
        content: `**Lyophilized** (lie-OFF-ill-ized) - Freeze-dried. This is the powder form that peptides are shipped in. The water is removed through a process that helps preserve the peptide's structure.

**Reconstitute** - To add water (usually bacteriostatic water) to lyophilized powder to create a usable solution.

**Bacteriostatic Water** - Sterile water containing 0.9% benzyl alcohol as a preservative. The alcohol inhibits bacterial growth, extending the usable life of reconstituted peptides.

**Aliquot** - A portion of a solution divided out for separate use. Researchers often divide reconstituted peptides into smaller aliquots to avoid repeatedly accessing the main vial.

**Vial** - The small glass container peptides come in. Usually sealed with a rubber stopper that allows needle access while maintaining sterility.`
      },
      {
        title: "Quality Terms",
        content: `**Purity** - The percentage of your sample that is actually the target peptide, versus impurities or other compounds.

**HPLC** (High-Performance Liquid Chromatography) - The standard method for measuring peptide purity. It separates molecules by size and counts them.

**Mass Spectrometry (MS)** - A technique that identifies molecules by their mass. Used to confirm peptide identity and structure.

**COA** (Certificate of Analysis) - A document from a testing laboratory verifying a peptide's identity, purity, and other quality metrics.

**Batch/Lot Number** - A unique identifier for a specific production run. Links your vial to specific test results.

**Third-Party Testing** - Testing performed by an independent laboratory, not the company selling the product. Considered more reliable than in-house testing.`
      },
      {
        title: "Research Terms",
        content: `**In Vitro** - "In glass" - research conducted in a controlled environment outside a living organism, like cell cultures in a lab dish.

**In Vivo** - "In life" - research conducted in living organisms.

**Receptor** - A protein on cell surfaces that peptides can bind to, triggering specific cellular responses.

**Agonist** - A compound that activates a receptor. Many research peptides are agonists for specific receptors.

**Half-Life** - How long it takes for half of a substance to be eliminated or degraded. Peptides with longer half-lives remain active longer.

**Bioavailability** - The proportion of a substance that enters circulation when introduced to the body and can have an active effect.

**Protocol** - A detailed plan for conducting research, including concentrations, timing, and procedures.`
      }
    ],
    takeaway: "Don't be intimidated by the terminology. Most terms describe straightforward concepts - it's just a matter of learning the vocabulary. Refer back to this glossary whenever you encounter unfamiliar jargon."
  }
};

const defaultBeginnerArticle: BeginnerArticle = {
  icon: BookOpen,
  iconColor: "#9d4edd",
  intro: `Welcome to this education article. We've written this guide specifically for those who are new to peptide research and want to understand the fundamentals without getting lost in technical jargon. Whether you're just curious or starting your research journey, we're here to help you build a solid foundation.`,
  sections: [
    {
      title: "Understanding the Basics",
      content: `Peptide research can seem intimidating at first - there's a lot of specialized vocabulary and technical concepts. But at its core, it's about understanding how these small signaling molecules work in biological systems.

Peptides are essentially short chains of amino acids, the same building blocks that make up proteins. They act as messengers in the body, telling cells what to do. Scientists study synthetic versions of these peptides to understand the underlying biology and explore potential applications.

The key to getting started is not trying to learn everything at once. Focus on understanding the fundamentals - what peptides are, how to handle them properly, and how to verify quality - and build from there.`
    },
    {
      title: "Quality and Safety First",
      content: `Two principles should guide all peptide research: quality and safety.

Quality means using verified, high-purity research materials from reputable sources. Always check the Certificate of Analysis (COA) that should come with every peptide. This document proves the product was tested by an independent lab and meets quality standards.

Safety means following basic laboratory practices - clean workspace, proper protective equipment, careful handling of sharps, and correct storage procedures. These habits protect both you and the integrity of your research.

Neither of these areas is complicated, but they both require attention and consistency.`
    },
    {
      title: "Keep Learning",
      content: `The best researchers are always learning. Don't hesitate to:

• Switch to "Deep Dive" mode for the full technical version of any article
• Explore other articles in our Education Center
• Reach out with questions - there's no such thing as a dumb question when you're learning
• Take your time - understanding comes with patience and practice

Every expert was once a beginner. The fact that you're here, reading and learning, means you're on the right track.`
    }
  ],
  takeaway: "For the complete technical breakdown of this topic, switch to Deep Dive mode using the toggle above. We're here to support your learning journey at whatever level you need."
};

export function BeginnerArticleContent({ slug, title }: BeginnerContentProps) {
  const article = beginnerArticles[slug] || defaultBeginnerArticle;
  const IconComponent = article.icon;

  return (
    <div className="space-y-8" data-testid="beginner-article-content">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${article.iconColor}20` }}
        >
          <IconComponent className="h-6 w-6" style={{ color: article.iconColor }} />
        </div>
        <div>
          <p className="text-muted-foreground leading-relaxed text-base">
            {article.intro}
          </p>
        </div>
      </motion.div>

      {article.sections.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span 
              className="w-1.5 h-6 rounded-full"
              style={{ backgroundColor: article.iconColor }}
            />
            {section.title}
          </h2>
          
          {section.visual && (
            <div className="p-4 rounded-xl bg-card border border-border">
              <section.visual />
            </div>
          )}
          
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
            {section.content.split('\n\n').map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-4 last:mb-0">
                {paragraph.split('**').map((part, partIndex) => 
                  partIndex % 2 === 1 ? (
                    <strong key={partIndex} className="text-foreground font-semibold">{part}</strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-5 rounded-xl border-2"
        style={{ 
          backgroundColor: `${article.iconColor}10`,
          borderColor: `${article.iconColor}40`
        }}
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: article.iconColor }} />
          <div>
            <h3 className="font-bold text-foreground mb-2">Key Takeaway</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{article.takeaway}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-pulse-subtle"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-200/90">
            <strong className="text-red-400">Research Use Only:</strong> All products and information 
            are intended solely for laboratory and research purposes. Not for human consumption.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function WhatIsPeptideSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card border border-[#ec4899]/30 mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-[#ec4899]" />
        <h3 className="font-bold text-foreground">New to Peptides?</h3>
      </div>
      <WhatIsPeptideVisual />
    </motion.div>
  );
}
