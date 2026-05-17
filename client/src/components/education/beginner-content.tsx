import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  Lightbulb, 
  Beaker,
  ThermometerSnowflake,
  FileCheck,
  FlaskConical,
  AlertTriangle,
  Zap,
  Heart,
  Brain,
  Sparkles,
  Flame,
  Activity,
  Clock,
  Target,
  Dna,
  Droplets,
  Moon,
  Shield,
  ArrowRight,
  Timer
} from "lucide-react";
import { 
  COASimplified, 
  StorageBasics,
  WhatIsPeptideVisual
} from "./beginner-infographics";

interface BeginnerContentProps {
  slug: string;
  title: string;
}

interface ArticleStat {
  icon: typeof Target;
  value: string;
  label: string;
}

interface ArticleMetadata {
  category: string;
  facts: ArticleStat[];
}

interface FlowStep {
  label: string;
  sublabel: string;
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
  // ==========================================
  // PEPTIDE PROFILE ARTICLES - Beginner Versions
  // ==========================================

  "what-is-bpc-157-peptide": {
    icon: Heart,
    iconColor: "#22c55e",
    intro: `BPC-157 is one of the most popular peptides in research today. The name stands for "Body Protection Compound," and it comes from a protein naturally found in your stomach's digestive juices. Scientists created a synthetic version with just 15 amino acids so they could study its fascinating effects on tissue repair.`,
    sections: [
      {
        title: "What Makes BPC-157 Special",
        content: `Your body is constantly repairing itself - healing cuts, mending strained muscles, fixing damaged tissue. BPC-157 is interesting to researchers because it seems to be involved in how your body coordinates these repair processes.

Think of your body's healing system like a construction crew. BPC-157 acts like a project manager that helps organize the workers, bring in the right materials, and make sure everything happens in the right order. It doesn't do the building itself - it helps coordinate the process.

What's particularly interesting is that this peptide is naturally present in your digestive system, where the environment is pretty harsh (acid, enzymes, constant movement). The fact that it survives there suggests it's quite stable compared to other peptides.`
      },
      {
        title: "How It Works (Simply Explained)",
        content: `BPC-157 appears to work through several pathways that scientists are still mapping out:

**Blood Vessel Formation** - When tissue needs repair, it needs blood supply. BPC-157 seems to help with the formation of new blood vessels, which brings nutrients and oxygen to damaged areas.

**Growth Factor Activity** - Your body uses chemical messengers called growth factors to signal cells to grow and repair. BPC-157 appears to influence how these growth factors work.

**Nitric Oxide System** - This is a signaling system in your body that affects blood flow and healing. BPC-157 interacts with this system in ways that researchers find significant.

The key point is that BPC-157 doesn't force anything to happen - it seems to support and enhance your body's natural repair mechanisms.`
      },
      {
        title: "What Researchers Study It For",
        content: `Scientists investigate BPC-157 in various contexts:

**Connective Tissue** - Tendons, ligaments, and muscle tissue are all subjects of BPC-157 research. These tissues often heal slowly, making them interesting targets.

**Gut Health** - Given that BPC-157 originates from gastric juice, there's natural interest in how it might affect digestive system tissue.

**Protective Effects** - Some research examines whether BPC-157 has protective properties when tissues are stressed or damaged.

Most of this research is still in early stages, primarily involving cell cultures and animal studies. Scientists are working to understand the mechanisms before drawing broader conclusions.`
      }
    ],
    takeaway: "BPC-157 is a 15-amino-acid peptide derived from a stomach protein. Researchers study it for its potential role in supporting tissue repair processes through effects on blood vessel formation, growth factors, and the nitric oxide system."
  },

  "what-is-tb-500-peptide": {
    icon: Activity,
    iconColor: "#21d8ff",
    intro: `TB-500 is the synthetic version of a peptide called Thymosin Beta-4, which is found naturally in almost every cell of your body. With 43 amino acids, it's a medium-sized peptide that researchers study for its apparent role in how cells move, heal, and regenerate.`,
    sections: [
      {
        title: "What TB-500 Actually Is",
        content: `Thymosin Beta-4 (the natural version of TB-500) is one of the most abundant peptides in your body. It's found in virtually every cell type except red blood cells. This widespread presence hints at its fundamental importance.

What makes TB-500 interesting to researchers is its role in something called "actin regulation." Actin is a protein that forms the internal scaffolding of your cells - think of it like the skeleton that gives cells their shape and lets them move.

When TB-500 interacts with actin, it affects how cells can migrate to where they're needed. This is crucial during healing, when cells need to move to a wound site to do their repair work.`
      },
      {
        title: "The Science in Plain Terms",
        content: `Here's how TB-500 seems to work:

**Cell Movement** - By interacting with actin (the cell's internal framework), TB-500 helps cells become more mobile. Imagine cells as workers who need to travel to a construction site - TB-500 helps them pack up and move.

**Blood Vessel Development** - Like BPC-157, TB-500 also appears to support the formation of new blood vessels. Damaged tissue needs blood supply to heal.

**Inflammation Modulation** - TB-500 may influence the inflammatory response. Inflammation is necessary for healing, but too much can be problematic. TB-500 seems to help regulate this balance.

**Small Size Advantage** - Despite being 43 amino acids, TB-500 is still small enough to travel easily through tissue, potentially reaching areas that larger molecules can't.`
      },
      {
        title: "Research Focus Areas",
        content: `Scientists study TB-500 in several contexts:

**Tissue Repair** - Given its role in cell movement and blood vessel formation, tissue repair is a primary research interest.

**Heart Research** - The heart's limited regenerative capacity makes it an interesting subject for TB-500 research.

**Hair and Skin** - Thymosin Beta-4 is naturally present in hair follicle cells, leading to research in this area.

**Comparative Studies** - Researchers often compare TB-500 with BPC-157 since both are studied for regenerative properties, though they work through different mechanisms.

Understanding exactly how TB-500 works is still an active area of research, with scientists mapping out its various pathways and effects.`
      }
    ],
    takeaway: "TB-500 is a synthetic version of Thymosin Beta-4, a naturally occurring peptide found in nearly all your cells. It works by regulating actin (cell structure), which affects how cells move and migrate during healing processes."
  },

  "what-is-rr-a1-peptide": {
    icon: Target,
    iconColor: "#E7FB10",
    intro: `RR-A1 is a GLP-1 receptor agonist - a peptide that mimics a hormone your body naturally produces after eating. The natural hormone (GLP-1) breaks down in just minutes, but scientists modified RR-A1 to last much longer, making it valuable for metabolic research.`,
    sections: [
      {
        title: "Understanding GLP-1",
        content: `When you eat a meal, your gut releases a hormone called GLP-1 (glucagon-like peptide-1). This hormone does several things:

**Tells your pancreas to release insulin** - Insulin helps your cells absorb sugar from your bloodstream.

**Signals fullness to your brain** - GLP-1 communicates with appetite centers, helping you feel satisfied after eating.

**Slows stomach emptying** - Food stays in your stomach longer, contributing to that "full" feeling.

The problem for researchers was that natural GLP-1 breaks down in just 1-2 minutes. That's too fast to study effectively. RR-A1 was designed to resist this breakdown, lasting about a week instead of minutes.`
      },
      {
        title: "How RR-A1 Was Designed",
        content: `Scientists made specific modifications to create RR-A1:

**Amino Acid Changes** - They swapped out certain amino acids that the body's enzymes typically target for breakdown.

**Fatty Acid Addition** - They attached a fatty acid chain to the peptide. This fatty acid binds to a protein in your blood called albumin, which acts like a protective taxi, shielding the peptide from breakdown.

**The Result** - These modifications extended the half-life from minutes to about a week, allowing once-weekly research protocols.

This is a great example of how understanding a molecule's structure lets scientists engineer improved versions for research purposes.`
      },
      {
        title: "What Researchers Investigate",
        content: `RR-A1 has become one of the most-studied peptides in metabolic research:

**Glucose Regulation** - How GLP-1 receptor activation affects blood sugar control is a major research focus.

**Appetite and Satiety** - Scientists study how activation of brain GLP-1 receptors influences eating behavior and feelings of fullness.

**Cardiovascular Effects** - There's research into how GLP-1 agonists might affect heart and blood vessel function.

**Comparative Studies** - Researchers compare RR-A1 with newer dual and triple agonists (like RR-A2 and RR-A3) to understand how targeting additional receptors changes the response.

The extensive research on RR-A1 has made it a foundational peptide for understanding incretin-based metabolic pathways.`
      }
    ],
    takeaway: "RR-A1 mimics GLP-1, a natural gut hormone that affects insulin release, appetite, and digestion. It's been engineered to last about a week instead of minutes, making it valuable for metabolic research."
  },

  "what-is-rr-a2-peptide": {
    icon: Zap,
    iconColor: "#9d4edd",
    intro: `RR-A2 takes the GLP-1 concept a step further - it's a dual agonist that activates both GLP-1 and GIP receptors. GIP is another gut hormone that works alongside GLP-1 in regulating metabolism. By targeting both, researchers can study what happens when you activate two complementary pathways simultaneously.`,
    sections: [
      {
        title: "Why Two Receptors?",
        content: `Your gut produces multiple hormones after you eat, and they work together like a team:

**GLP-1** (which RR-A1 targets) - Promotes insulin release, slows digestion, signals fullness to the brain.

**GIP** (glucose-dependent insulinotropic polypeptide) - Also promotes insulin release, and has effects on fat tissue and bone health.

For years, researchers focused mainly on GLP-1. But GIP was actually discovered first, and scientists wondered: what if you could activate both systems at once? Would the effects be additive? Synergistic? That's what RR-A2 was designed to explore.`
      },
      {
        title: "How RR-A2 Works",
        content: `RR-A2 is sometimes called a "twincretin" because it activates two incretin receptors:

**Unbalanced Agonism** - Interestingly, RR-A2 doesn't activate both receptors equally. It has stronger GIP activity relative to its GLP-1 activity. Researchers study how this ratio affects outcomes.

**Long-Acting Design** - Like RR-A1, RR-A2 has a fatty acid attached that extends its duration in the body to about 5 days, allowing once-weekly dosing in research settings.

**Complementary Pathways** - By activating both GIP and GLP-1 receptors, RR-A2 engages two related but distinct signaling pathways. Researchers study whether this dual activation produces effects different from single-receptor activation.`
      },
      {
        title: "Research Directions",
        content: `RR-A2 has opened new avenues for metabolic research:

**Comparative Studies** - How do results differ between single GLP-1 agonists and dual GLP-1/GIP agonists? This is a key research question.

**Mechanism Exploration** - Scientists work to understand how GIP and GLP-1 signals interact at the cellular level.

**Fat Tissue Effects** - GIP has specific effects on adipose (fat) tissue that pure GLP-1 agonists lack. Researchers explore these differences.

**Dosing Optimization** - Finding optimal ratios of GIP to GLP-1 activity is an ongoing research interest.

RR-A2 represents a shift from single-target to multi-target approaches in metabolic peptide research.`
      }
    ],
    takeaway: "RR-A2 activates two gut hormone receptors (GLP-1 and GIP) instead of just one. This dual approach lets researchers study how these complementary metabolic pathways work together."
  },

  "what-is-rr-a3-peptide": {
    icon: Flame,
    iconColor: "#f97316",
    intro: `RR-A3 is the newest generation of metabolic peptides - a triple agonist that activates GLP-1, GIP, AND glucagon receptors. While RR-A1 targets one receptor and RR-A2 targets two, RR-A3 targets three, representing the cutting edge of incretin research.`,
    sections: [
      {
        title: "Why Add Glucagon?",
        content: `You might know glucagon as insulin's "opposite" - it raises blood sugar when it gets too low. So why would you want to activate glucagon receptors in metabolic research?

It turns out glucagon does more than just raise blood sugar:

**Energy Expenditure** - Glucagon appears to increase how many calories your body burns at rest.

**Fat Breakdown** - It promotes the breakdown of stored fat for energy.

**Appetite Effects** - Glucagon may also affect satiety and food intake.

By adding controlled glucagon receptor activation to GLP-1 and GIP activation, researchers can study a more complete picture of metabolic regulation.`
      },
      {
        title: "The Triple Agonist Approach",
        content: `RR-A3 activates three receptors with carefully balanced activity:

**GLP-1** - The familiar pathway affecting insulin, appetite, and digestion.

**GIP** - The additional incretin pathway with effects on fat tissue.

**Glucagon** - The energy expenditure and fat breakdown pathway.

The challenge for scientists was designing a single molecule that could engage all three receptors appropriately. Too much glucagon activity could cause problems; too little would negate the benefits of adding it.

RR-A3 represents years of molecular engineering to achieve a specific activity profile across all three targets.`
      },
      {
        title: "Current Research Focus",
        content: `As the newest of the incretin agonists, RR-A3 research is actively expanding:

**Comparative Studies** - How do triple agonist effects compare to dual and single agonists? Early research suggests potentially additive benefits.

**Safety Research** - With three receptor targets, understanding the full effect profile is crucial.

**Mechanism Studies** - Scientists work to understand how the three pathways interact at cellular and systemic levels.

**Optimization** - Finding the right balance of activity at each receptor remains an active area of investigation.

RR-A3 represents where the field of incretin research is heading - toward multi-target approaches that address metabolism from multiple angles simultaneously.`
      }
    ],
    takeaway: "RR-A3 is a triple agonist targeting GLP-1, GIP, and glucagon receptors. Adding glucagon brings energy expenditure and fat breakdown pathways into the research picture, creating a more comprehensive metabolic research tool."
  },

  "what-is-cjc-1295-peptide": {
    icon: Activity,
    iconColor: "#21d8ff",
    intro: `CJC-1295 is a synthetic version of GHRH (growth hormone-releasing hormone) - the signal your brain uses to tell your pituitary gland to release growth hormone. The natural signal is very short-lived, but CJC-1295 was engineered to last much longer, making it valuable for growth hormone axis research.`,
    sections: [
      {
        title: "The Growth Hormone System",
        content: `Your body's growth hormone system works like a chain of command:

**Step 1:** Your hypothalamus (a part of your brain) releases GHRH.
**Step 2:** GHRH travels to your pituitary gland (a pea-sized gland at the base of your brain).
**Step 3:** The pituitary releases growth hormone into your bloodstream.
**Step 4:** Growth hormone affects tissues throughout your body.

Natural GHRH only lasts a few minutes before it's broken down. This makes it hard to study. CJC-1295 was designed to mimic GHRH but resist breakdown, allowing researchers to study growth hormone release over longer periods.`
      },
      {
        title: "How CJC-1295 Works",
        content: `CJC-1295 includes several modifications to extend its lifespan:

**Amino Acid Substitutions** - Four amino acids were changed at key positions to resist enzymes that normally break down GHRH.

**DAC Technology (optional)** - Some versions include a "Drug Affinity Complex" - a modification that binds to albumin in blood, dramatically extending duration to over a week.

**Without DAC** - Versions without DAC last several hours instead of minutes, which is still much longer than natural GHRH.

Both versions allow researchers to study sustained GHRH receptor activation, which produces a different pattern of growth hormone release than natural, pulsatile GHRH.`
      },
      {
        title: "Research Applications",
        content: `Scientists study CJC-1295 to understand growth hormone physiology:

**Sustained vs. Pulsatile Release** - Natural growth hormone comes in pulses. CJC-1295 produces more sustained release. Researchers compare these patterns.

**Combination Studies** - CJC-1295 is often studied alongside GHRPs (growth hormone-releasing peptides like ipamorelin) to examine synergistic effects.

**Age-Related Changes** - Growth hormone production naturally declines with age. CJC-1295 helps researchers study this axis at different life stages.

**IGF-1 Effects** - Growth hormone triggers the liver to produce IGF-1. Researchers use CJC-1295 to study this downstream pathway.

CJC-1295 has become a standard research tool for anyone studying the GHRH/GH/IGF-1 axis.`
      }
    ],
    takeaway: "CJC-1295 is a long-lasting version of GHRH, the hormone that tells your pituitary to release growth hormone. It's used to study the growth hormone axis because it lasts hours or days instead of minutes."
  },

  "what-is-ipamorelin-peptide": {
    icon: Target,
    iconColor: "#22c55e",
    intro: `Ipamorelin is a growth hormone secretagogue - it triggers growth hormone release, but through a different pathway than CJC-1295. While CJC-1295 mimics GHRH, ipamorelin mimics ghrelin (the "hunger hormone"). This different approach gives researchers another tool for studying growth hormone regulation.`,
    sections: [
      {
        title: "A Different Trigger for Growth Hormone",
        content: `Your body has multiple ways to trigger growth hormone release:

**GHRH Pathway** - The hypothalamus releases GHRH, which tells the pituitary to release growth hormone. CJC-1295 works here.

**Ghrelin Pathway** - Ghrelin (produced mainly in the stomach) can also trigger growth hormone release. Ipamorelin works here.

**Why Does This Matter?** - These pathways can work together synergistically. By having research tools for both pathways, scientists can study them separately or in combination.

Ipamorelin is particularly interesting because it's highly selective - it triggers growth hormone release without significantly affecting other hormones like cortisol or prolactin.`
      },
      {
        title: "What Makes Ipamorelin Selective",
        content: `Earlier ghrelin-mimicking peptides (called GHRPs) had a problem: they also affected cortisol and prolactin levels, which complicated research.

Ipamorelin was designed to be cleaner:

**Targets Ghrelin Receptors** - It binds to the same receptors as ghrelin (also called GHS-R or growth hormone secretagogue receptors).

**Minimal Cortisol Effect** - Unlike earlier GHRPs, ipamorelin produces little to no increase in cortisol.

**Minimal Prolactin Effect** - Similarly, it doesn't significantly raise prolactin levels.

**Clean Data** - This selectivity makes research results easier to interpret. When you see effects, you can be more confident they're from growth hormone, not confounding hormone changes.`
      },
      {
        title: "How Researchers Use It",
        content: `Ipamorelin serves several research purposes:

**Growth Hormone Studies** - Its selectivity makes it ideal for studying pure growth hormone effects.

**Synergy Research** - Scientists often combine ipamorelin with CJC-1295 to study how the GHRH and ghrelin pathways interact.

**Pulsatile Release** - Ipamorelin produces growth hormone pulses similar to natural patterns, unlike the more sustained release from CJC-1295 with DAC.

**Comparative Studies** - Researchers compare ipamorelin's effects to other secretagogues to understand structure-activity relationships.

The selectivity and predictable response make ipamorelin a clean research tool for growth hormone axis studies.`
      }
    ],
    takeaway: "Ipamorelin triggers growth hormone release by mimicking ghrelin (the hunger hormone), not GHRH. It's valued for being selective - it affects growth hormone without significantly changing cortisol or prolactin levels."
  },

  "what-is-tesamorelin-peptide": {
    icon: Zap,
    iconColor: "#E7FB10",
    intro: `Tesamorelin is another GHRH analog like CJC-1295, but with a different modification strategy. It uses a unique chemical group attached to its structure that helps it resist breakdown. Researchers study tesamorelin particularly for its effects on body composition.`,
    sections: [
      {
        title: "Tesamorelin's Design",
        content: `Natural GHRH is a 44-amino-acid peptide that your hypothalamus releases to trigger growth hormone. Like natural GHRH, tesamorelin has 44 amino acids, but with a key modification:

**The Modification** - A chemical group called trans-3-hexenoic acid is attached to the front of the peptide. This helps protect it from enzymes that would normally break it down.

**Extended Duration** - This modification dramatically increases how long tesamorelin lasts in the body compared to natural GHRH.

**Receptor Binding** - Despite the modification, tesamorelin still binds well to GHRH receptors, maintaining its ability to trigger growth hormone release.`
      },
      {
        title: "How It Differs from CJC-1295",
        content: `Both tesamorelin and CJC-1295 are GHRH analogs, but they use different strategies:

**CJC-1295** - Uses multiple amino acid substitutions and optionally albumin binding (DAC) for extended duration.

**Tesamorelin** - Uses a single chemical modification at the front of the peptide.

**Research Implications** - Different modification strategies can produce different pharmacokinetic profiles (how the peptide is absorbed, distributed, and eliminated). Researchers compare these to understand which approaches work best for different applications.`
      },
      {
        title: "Research Focus",
        content: `Tesamorelin research has focused on several areas:

**Body Composition** - How GHRH analog administration affects the distribution of fat tissue, particularly visceral (deep belly) fat.

**Growth Hormone Pulsatility** - Studying the pattern of growth hormone release - does it more closely mimic natural pulsatile release?

**Lipodystrophy Research** - Scientists have studied tesamorelin in the context of fat distribution abnormalities.

**IGF-1 Response** - Like all GHRH analogs, tesamorelin's downstream effects on IGF-1 are of research interest.

Tesamorelin provides researchers with another tool for studying the growth hormone axis, with its own unique characteristics.`
      }
    ],
    takeaway: "Tesamorelin is a 44-amino-acid GHRH analog with a chemical modification that helps it resist breakdown. It's studied for growth hormone axis research with particular interest in body composition effects."
  },

  "what-is-epithalon-peptide": {
    icon: Clock,
    iconColor: "#9d4edd",
    intro: `Epithalon is a small tetrapeptide (just 4 amino acids: Ala-Glu-Asp-Gly) that emerged from Russian research on the pineal gland. It's studied for its potential effects on telomerase, an enzyme involved in cellular aging. This makes it one of the most interesting peptides in longevity research.`,
    sections: [
      {
        title: "Understanding Telomeres and Aging",
        content: `To understand epithalon, you first need to understand telomeres:

**Telomeres are protective caps** at the ends of your chromosomes, like the plastic tips on shoelaces. They prevent your DNA from fraying or sticking to other chromosomes.

**Every time a cell divides, telomeres get shorter.** After many divisions, telomeres become too short, and the cell can no longer divide properly. This is one mechanism of cellular aging.

**Telomerase is an enzyme** that can rebuild telomeres. Most adult cells don't produce much telomerase, so their telomeres gradually shorten over time.

This is where epithalon comes in - researchers study whether it might affect telomerase activity.`
      },
      {
        title: "What Research Shows",
        content: `Studies on epithalon have explored several areas:

**Telomerase Activation** - Cell culture studies have examined whether epithalon can activate telomerase in cells that normally don't produce much of it.

**Telomere Length** - Some research has measured whether telomere length changes with epithalon exposure.

**Pineal Gland Connection** - Epithalon was originally derived from pineal gland extracts. Researchers explore connections between pineal function, melatonin, and epithalon's effects.

**Cellular Lifespan** - Scientists have studied whether epithalon affects how many times cells can divide before reaching their limit (the Hayflick limit).

This research is still evolving, and scientists continue to investigate the mechanisms involved.`
      },
      {
        title: "Why It's Interesting for Longevity Research",
        content: `Epithalon attracts attention in aging research for several reasons:

**Small and Stable** - At just 4 amino acids, epithalon is very small and relatively stable compared to larger peptides.

**Specific Target** - If epithalon truly affects telomerase, it targets one of the fundamental mechanisms of cellular aging.

**Research History** - Decades of research, particularly from Russian scientists, provide a foundation for ongoing investigation.

**Comparatively Safe Profile** - The peptide's small size and specificity are characteristics researchers value.

While much research remains to be done, epithalon represents an approach to aging research focused on one of the most fundamental cellular processes.`
      }
    ],
    takeaway: "Epithalon is a tiny 4-amino-acid peptide studied for its potential effects on telomerase, an enzyme that helps maintain telomeres (the protective caps on your chromosomes that shorten with age)."
  },

  "what-is-semax-peptide": {
    icon: Brain,
    iconColor: "#21d8ff",
    intro: `Semax is a synthetic peptide derived from ACTH, a hormone your pituitary gland produces. Scientists took a small fragment of ACTH (amino acids 4-7) and added a stabilizing tail to create semax. The result is a peptide that researchers study for cognitive and neuroprotective effects - without the hormonal effects of full ACTH.`,
    sections: [
      {
        title: "From Hormone Fragment to Research Peptide",
        content: `ACTH (adrenocorticotropic hormone) is a 39-amino-acid hormone that primarily tells your adrenal glands to produce cortisol. But researchers noticed that just a small piece of ACTH - amino acids 4 through 7 - seemed to have interesting effects on the brain without affecting cortisol.

The problem was that this fragment broke down too quickly to study effectively. So scientists added a stabilizing "tail" (Pro-Gly-Pro) to protect it from enzymes.

The result is semax: a 7-amino-acid peptide that:
- Lasts 20-24 hours instead of minutes
- Has no hormonal effects on cortisol
- Can be studied for its effects on brain function`
      },
      {
        title: "What Researchers Study",
        content: `Semax research focuses on several brain-related areas:

**BDNF Effects** - BDNF (brain-derived neurotrophic factor) is a protein that supports neuron health and growth. Research examines whether semax affects BDNF levels.

**Cognitive Function** - Scientists study semax in relation to memory, learning, and attention processes.

**Neuroprotection** - Research explores whether semax might have protective effects on neurons under stress conditions.

**Neurotransmitter Systems** - Studies examine how semax interacts with dopamine, serotonin, and other brain signaling systems.

Because it can be administered intranasally (through the nose), semax offers a convenient route of administration for brain-related research.`
      },
      {
        title: "Why It's Unique",
        content: `Several characteristics make semax interesting for neuroscience research:

**No Hormonal Effects** - Unlike full ACTH, semax doesn't stimulate cortisol production. This "clean" profile makes it easier to study brain effects in isolation.

**Long Half-Life** - The stabilizing tail extends duration to about a day, allowing sustained research protocols.

**CNS Access** - Intranasal administration may allow direct access to the brain, bypassing the blood-brain barrier to some degree.

**Melanocortin Connection** - Semax interacts with melanocortin receptors, which are involved in various brain functions beyond just pigmentation.

Semax represents a creative approach: taking a small piece of a larger hormone and engineering it for specific research applications.`
      }
    ],
    takeaway: "Semax is a modified fragment of ACTH (a pituitary hormone) engineered for brain research. It has effects on BDNF and other neurological factors without affecting cortisol, making it useful for cognitive research."
  },

  "what-is-ghk-cu-peptide": {
    icon: Sparkles,
    iconColor: "#ec4899",
    intro: `GHK-Cu is one of the simplest and most studied peptides - just three amino acids (Glycine-Histidine-Lysine) bound to a copper ion. Despite its tiny size, it's remarkably bioactive. Your body naturally produces GHK, and levels decrease significantly as you age. Researchers study it for its effects on skin, wound healing, and tissue remodeling.`,
    sections: [
      {
        title: "Why Copper Matters",
        content: `GHK is a tripeptide that naturally binds copper ions very strongly. This copper binding isn't just a coincidence - it's central to how GHK-Cu works:

**Copper Transport** - GHK-Cu may help deliver copper to cells and tissues. Copper is essential for many enzymes involved in tissue repair and maintenance.

**Enzyme Activation** - Many copper-dependent enzymes are involved in collagen production, antioxidant defense, and wound healing.

**Age-Related Decline** - GHK levels in your blood drop dramatically with age:
  - Age 20: About 200 ng/mL
  - Age 60: About 80 ng/mL

This decline correlates with reduced skin elasticity, slower wound healing, and other age-related changes, making GHK-Cu interesting for aging research.`
      },
      {
        title: "What Research Has Explored",
        content: `GHK-Cu has been studied for decades across multiple areas:

**Skin Research** - Studies examine effects on collagen, elastin, and overall skin structure. GHK-Cu is one of the few peptides with extensive skin research.

**Wound Healing** - Research explores whether GHK-Cu accelerates the wound healing process and improves healing quality.

**Gene Expression** - Interestingly, GHK-Cu appears to influence the expression of many genes. Studies have identified over 4,000 genes that respond to GHK-Cu exposure.

**Anti-Inflammatory Effects** - Research suggests GHK-Cu may help modulate inflammatory responses.

The small size of GHK-Cu (just 3 amino acids plus copper) makes it easy to work with and relatively stable compared to larger peptides.`
      },
      {
        title: "Delivery Methods",
        content: `GHK-Cu research uses various delivery approaches:

**Topical Application** - Because of interest in skin effects, topical formulations are commonly studied. The small molecular size may allow penetration into skin layers.

**Injectable** - For systemic research, GHK-Cu can be administered by injection.

**Stability Considerations** - The copper binding adds stability, but formulation still matters for maintaining activity.

GHK-Cu represents one of the more accessible peptides for research - it's small, relatively stable, well-characterized, and has decades of published research to build upon.`
      }
    ],
    takeaway: "GHK-Cu is a copper-binding tripeptide that decreases with age. Researchers study it for tissue remodeling, skin health, and wound healing, with the copper ion being essential to its biological activity."
  },

  "what-is-glow-peptide-complex": {
    icon: Sparkles,
    iconColor: "#E7FB10",
    intro: `GLOW Peptide Complex represents a multi-peptide approach to skin research. Rather than using a single peptide, it combines several bioactive peptides that work through different pathways. The idea is that targeting multiple mechanisms simultaneously might produce more comprehensive effects than any single peptide alone.`,
    sections: [
      {
        title: "The Multi-Peptide Approach",
        content: `Single peptides typically work through one or two main mechanisms. A peptide complex combines several peptides to address multiple pathways:

**Signal Peptides** - These tell cells to produce more structural proteins like collagen. They're like messengers carrying "build more" instructions.

**Carrier Peptides** - These deliver essential elements (like copper in GHK-Cu) to cells where they're needed for enzymatic processes.

**Enzyme-Inhibiting Peptides** - These may slow down processes that break down collagen and elastin.

**Matrikines** - These are fragments of matrix proteins that signal cells to remodel and repair.

By combining peptides from different categories, researchers can study how multiple mechanisms work together.`
      },
      {
        title: "Why Combinations Matter",
        content: `Skin health involves many processes happening simultaneously:

**Collagen Production** - New collagen must be made to maintain skin structure.
**Collagen Protection** - Existing collagen shouldn't be broken down too fast.
**Cell Renewal** - Old cells need to be replaced with new ones.
**Antioxidant Defense** - Free radicals must be neutralized.
**Hydration** - Skin needs to maintain moisture.

No single peptide addresses all of these. By combining complementary peptides, researchers can study:
- Whether effects are additive (1+1=2)
- Whether effects are synergistic (1+1=3)
- Whether any interactions are negative
- What ratios produce optimal results`
      },
      {
        title: "Research Considerations",
        content: `Working with peptide complexes adds complexity to research:

**Attribution Challenges** - When you see an effect, which peptide (or combination) caused it?

**Concentration Balancing** - Each peptide may have a different optimal concentration.

**Stability Issues** - Different peptides may have different stability requirements.

**Quality Control** - Each component needs verification.

Despite these challenges, multi-peptide research reflects how the body actually works - through coordinated systems rather than single molecules.`
      }
    ],
    takeaway: "GLOW Peptide Complex combines multiple peptides (signal, carrier, enzyme-inhibiting) to target different skin health pathways simultaneously, allowing research into synergistic effects."
  },

  "what-is-klow-peptide-complex": {
    icon: Shield,
    iconColor: "#21d8ff",
    intro: `KLOW Peptide Complex takes the tissue repair concept further by adding a powerful anti-inflammatory component. It combines four peptides: TB-500, BPC-157, GHK-Cu, and KPV. The special ingredient is KPV, a tripeptide that specifically targets inflammation - which often gets in the way of healing.`,
    sections: [
      {
        title: "The Four Peptides in KLOW",
        content: `KLOW brings together four peptides that each do something different:

**TB-500 (Tissue Repair)** - This is like your body's repair signal. It helps cells move to damaged areas and reorganize the protein scaffolding inside cells. Think of it as the "first responder" that starts the repair process.

**BPC-157 (Blood Flow)** - Damaged tissue needs nutrients and oxygen to heal. BPC-157 helps your body grow new blood vessels to supply those repair sites - like building new roads to a construction zone.

**GHK-Cu (Collagen Building)** - Once repair is happening, you need building materials. This copper-containing peptide signals cells to make collagen, the structural protein that holds tissue together.

**KPV (Anti-Inflammatory)** - This is what makes KLOW special. Inflammation is supposed to protect you, but too much of it actually slows healing. KPV calms inflammation so the other peptides can work better.`
      },
      {
        title: "Why KPV Makes a Difference",
        content: `KPV is a tiny tripeptide (just three amino acids: Lysine-Proline-Valine) derived from a hormone called alpha-MSH. Despite its small size, it packs a punch:

**How It Works Simply:**
Your cells have a master "inflammation switch" called NF-κB. When this switch is ON, cells produce lots of inflammatory chemicals. KPV can get inside cells and help keep this switch in the OFF position.

**The Smart Delivery System:**
Your body has a transporter called PepT1 that normally helps absorb nutrients. Interestingly, when tissue is inflamed, PepT1 becomes more active in that area. This means KPV gets delivered preferentially to exactly where it's needed most - inflamed tissue.

**What Gets Reduced:**
With NF-κB calmed down, cells make fewer inflammatory chemicals like TNF-α, IL-6, and IL-8. These are the molecules that cause swelling, redness, and pain.`
      },
      {
        title: "How the Four Work Together",
        content: `Think of tissue repair like renovating a house while it's on fire:

**Step 1 (TB-500):** The emergency crew arrives to assess damage and start basic repairs.

**Step 2 (BPC-157):** Supply trucks start delivering materials (by building better roads to the site).

**Step 3 (GHK-Cu):** Builders start reconstructing with proper structural materials.

**Step 4 (KPV):** The fire department puts out the flames so construction can proceed without interference.

The key insight is that inflammation (the "fire") can actually slow down or interfere with all the other repair processes. By addressing inflammation specifically, KLOW creates an environment where healing can happen more efficiently.`
      },
      {
        title: "Research Applications",
        content: `Scientists study KLOW-style combinations for several reasons:

**Tissue Repair Research:**
- How do different repair mechanisms interact?
- Can you speed up healing by addressing multiple pathways?
- What role does inflammation play in slowing repair?

**Gut Health Studies:**
KPV is particularly interesting for gut research because:
- The gut has lots of PepT1 transporters
- Inflammatory bowel conditions involve chronic inflammation
- The gut barrier needs constant repair

**Understanding Synergy:**
Do four peptides together work better than four peptides separately? This is a fundamental question in combination therapy research.`
      }
    ],
    takeaway: "KLOW Peptide Complex combines tissue repair peptides (TB-500, BPC-157, GHK-Cu) with the anti-inflammatory KPV, which blocks the NF-κB inflammation pathway. The key insight: controlling inflammation creates a better environment for healing."
  },

  "what-is-igf-1-lr3-peptide": {
    icon: Dna,
    iconColor: "#22c55e",
    intro: `IGF-1 LR3 is a modified version of IGF-1 (Insulin-like Growth Factor 1), an important signaling molecule your liver produces in response to growth hormone. The "LR3" modifications make it more potent and longer-lasting than natural IGF-1, making it valuable for growth factor research.`,
    sections: [
      {
        title: "Understanding IGF-1",
        content: `IGF-1 sits at a crucial point in your body's growth hormone system:

**The Chain of Command:**
1. Pituitary releases growth hormone
2. Growth hormone signals the liver
3. Liver produces IGF-1
4. IGF-1 circulates and affects tissues

IGF-1 is actually responsible for many of the effects people attribute to growth hormone itself. It promotes cell growth, protein synthesis, and various metabolic effects.

**The Challenge:** Natural IGF-1 binds tightly to carrier proteins in your blood (called IGFBPs). Only a small fraction is "free" to interact with receptors at any given time.`
      },
      {
        title: "What the LR3 Modifications Do",
        content: `IGF-1 LR3 includes two key modifications:

**13 Extra Amino Acids** - Added to the front of the molecule, extending it from 70 to 83 amino acids.

**Arginine Substitution** - Glutamic acid at position 3 is replaced with arginine.

**The Result:** These changes dramatically reduce binding to IGFBPs. More of the peptide stays "free" and active.

**Research Implications:**
- Higher potency (more free IGF-1 available)
- Longer half-life (not sequestered by binding proteins)
- Different tissue distribution (not held in blood by proteins)

This makes IGF-1 LR3 a powerful research tool for studying IGF-1 receptor activation.`
      },
      {
        title: "Research Applications",
        content: `Scientists use IGF-1 LR3 to study growth factor biology:

**Cell Growth Studies** - IGF-1 promotes cell proliferation. LR3's enhanced potency makes effects easier to observe.

**Muscle Research** - IGF-1 plays important roles in muscle development and maintenance.

**Metabolic Studies** - IGF-1 has insulin-like effects on glucose metabolism.

**Cancer Research** - Understanding IGF-1's growth-promoting effects is relevant to cancer biology.

**Comparative Studies** - Researchers compare IGF-1 LR3 with natural IGF-1 to understand how binding protein interactions affect biology.

The enhanced properties of IGF-1 LR3 make it particularly useful when researchers need sustained, potent IGF-1 receptor activation.`
      }
    ],
    takeaway: "IGF-1 LR3 is a modified version of IGF-1 (a growth factor your liver makes in response to growth hormone). The modifications prevent it from binding to carrier proteins, making more available to interact with receptors."
  },

  "what-is-igf-des-peptide": {
    icon: Dna,
    iconColor: "#22c55e",
    intro: `IGF-DES — short for Des(1-3)-IGF-1 — is a naturally occurring truncated form of IGF-1 (Insulin-like Growth Factor 1). Its three N-terminal amino acids are missing, and this small structural change has a big effect: IGF-DES binds to the IGF-1 receptor more tightly than regular IGF-1, while largely avoiding the carrier proteins that normally limit IGF-1's activity.`,
    sections: [
      {
        title: "What 'Des(1-3)' Means",
        content: `The name tells you exactly what's different about this molecule:

**Des(1-3)** means the first three amino acids (positions 1, 2, and 3) have been removed from the native IGF-1 sequence.

**The Impact of Truncation:**
- The removed amino acids happen to be part of the region that binds to IGF binding proteins (IGFBPs)
- Without this region, the molecule is far less "captured" by IGFBPs in the bloodstream
- More of the peptide remains free to interact directly with the IGF-1 receptor (IGF-1R)

**A Naturally Occurring Variant:** Unlike many synthetic peptide analogs, IGF-DES has been found in human tissues, particularly in the brain and gut, where it may serve local signaling roles.`
      },
      {
        title: "How It Differs from IGF-1 LR3",
        content: `Both IGF-DES and IGF-1 LR3 reduce IGFBP binding, but through different mechanisms:

**IGF-1 LR3 Approach:**
- Adds 13 extra amino acids + changes one amino acid (arginine at position 3)
- Results in very long half-life (~20-30 hours) — stays active much longer
- Good for studying sustained, systemic IGF-1 signaling

**IGF-DES Approach:**
- Removes 3 amino acids from the front of the molecule
- Results in shorter half-life (clears faster, similar to native IGF-1)
- Binds the IGF-1 receptor with higher affinity than native IGF-1

**Research Pairing:** Together, IGF-DES and IGF-1 LR3 create a useful comparison model — one compound that stays active longer (LR3) and one that binds the receptor more tightly but clears faster (DES).`
      },
      {
        title: "Research Applications",
        content: `Scientists use IGF-DES to study several aspects of IGF-1 biology:

**Receptor Binding Studies** - Its high IGF-1R affinity makes it valuable for understanding receptor occupancy and activation kinetics.

**IGFBP Independence Research** - IGF-DES helps researchers study what happens when IGF-1 signaling is freed from binding protein regulation.

**Anabolic Pathway Modeling** - IGF-DES activates the PI3K/Akt/mTOR signaling cascade, a central driver of protein synthesis and cellular growth, making it useful for studying anabolic signaling in muscle biology research.

**Comparative Kinetics** - Pairing IGF-DES (fast-acting, high affinity) with IGF-1 LR3 (slow-acting, prolonged) lets researchers study how timing and duration of receptor activation affect downstream biological responses.`
      }
    ],
    takeaway: "IGF-DES is a naturally occurring truncated form of IGF-1 that binds its receptor more tightly than regular IGF-1 while bypassing the carrier proteins that normally limit IGF-1's activity. Its short half-life and high receptor affinity make it a useful research tool for studying fast-acting IGF-1 receptor activation."
  },

  "what-is-mots-c-peptide": {
    icon: Flame,
    iconColor: "#f97316",
    intro: `MOTS-c is a unique peptide - it's encoded by your mitochondria, not your regular DNA. Discovered in 2015, this 16-amino-acid peptide is sometimes called an "exercise mimetic" because it seems to produce some effects similar to exercise. It's at the forefront of mitochondrial and metabolic research.`,
    sections: [
      {
        title: "What Makes MOTS-c Unique",
        content: `Most peptides come from genes in your cell's nucleus. MOTS-c is different:

**Mitochondrial Origin** - It's encoded by a gene in your mitochondria (the energy-producing organelles in your cells). This makes it a "mitochondrial-derived peptide" or MDP.

**Mitokine Function** - MOTS-c acts as a "mitokine" - a hormone that mitochondria use to communicate with the rest of the cell and even other organs.

**Evolutionary Conservation** - MOTS-c is found across many species, suggesting it serves important functions.

This mitochondrial origin connects MOTS-c to energy metabolism in a fundamental way, since mitochondria are the cell's power plants.`
      },
      {
        title: "How MOTS-c Relates to Exercise",
        content: `Researchers call MOTS-c an "exercise mimetic" because it activates similar pathways:

**AMPK Activation** - MOTS-c activates AMPK (AMP-activated protein kinase), the same energy-sensing pathway that exercise activates. AMPK is sometimes called the "metabolic master switch."

**Metabolic Effects** - Through AMPK and other pathways, MOTS-c influences how cells handle glucose and produce energy.

**Muscle Connection** - MOTS-c levels increase in muscle tissue after exercise, suggesting it plays a role in exercise adaptation.

**Mitochondrial Biogenesis** - MOTS-c may promote the creation of new mitochondria, similar to how regular exercise does.

This doesn't mean MOTS-c replaces exercise, but it might work through some overlapping mechanisms.`
      },
      {
        title: "Research Directions",
        content: `MOTS-c research is expanding rapidly:

**Aging Research** - Mitochondrial function declines with age. MOTS-c offers a way to study mitochondrial signaling in aging contexts.

**Metabolic Syndrome** - Scientists study MOTS-c's effects on glucose handling and metabolic health markers.

**Exercise Science** - Understanding how MOTS-c relates to exercise adaptation is an active research area.

**Mitochondrial Communication** - MOTS-c is helping scientists understand how mitochondria communicate with the rest of the cell.

As a relatively new discovery, MOTS-c represents an exciting frontier in understanding the connection between mitochondria, metabolism, and exercise.`
      }
    ],
    takeaway: "MOTS-c is a mitochondria-encoded peptide that activates AMPK, the same energy-sensing pathway triggered by exercise. It's studied for metabolic effects and its role in mitochondrial communication."
  },

  "what-is-nad-precursor": {
    icon: Zap,
    iconColor: "#9d4edd",
    intro: `NAD+ (Nicotinamide Adenine Dinucleotide) isn't a peptide - it's a coenzyme found in every cell of your body. It's essential for energy production, DNA repair, and many other processes. NAD+ precursors are compounds your body converts into NAD+, and they're central to aging and metabolic research.`,
    sections: [
      {
        title: "Why NAD+ Matters",
        content: `NAD+ is involved in hundreds of processes in your cells:

**Energy Production** - NAD+ shuttles electrons in your mitochondria during energy production. Without it, you couldn't convert food into usable energy.

**DNA Repair** - Enzymes called PARPs use NAD+ to fix DNA damage. This is crucial for preventing mutations.

**Sirtuin Activation** - Sirtuins are proteins linked to longevity and metabolism. They require NAD+ to function.

**Cell Signaling** - NAD+ is consumed by various signaling processes in cells.

**The Problem:** NAD+ levels decline significantly with age - by some estimates, 50% between youth and middle age. This decline is associated with many age-related changes.`
      },
      {
        title: "How NAD+ Precursors Work",
        content: `Your body can make NAD+ from several different starting materials (precursors):

**NMN (Nicotinamide Mononucleotide)** - A direct precursor that's just one step away from NAD+.

**NR (Nicotinamide Riboside)** - Another precursor that converts to NMN, then to NAD+.

**Niacin (Vitamin B3)** - An older pathway that's less efficient but well-established.

**Tryptophan** - Your body can make NAD+ from this amino acid, but it's a longer pathway.

Research examines which precursors most effectively raise NAD+ levels in different tissues and conditions.`
      },
      {
        title: "Current Research Focus",
        content: `NAD+ precursor research is one of the most active areas in aging science:

**Aging and Longevity** - Scientists study whether raising NAD+ levels can address aspects of aging.

**Metabolic Health** - NAD+ is crucial for metabolism. Research examines effects on glucose handling and energy regulation.

**Neurological Research** - Brain cells are particularly energy-dependent, making NAD+ relevant to neuroscience.

**Comparative Studies** - Which precursor works best? This depends on tissue, age, and other factors that researchers are sorting out.

**Safety Research** - Understanding the full effects of chronically elevated NAD+ levels is ongoing.

NAD+ precursor research bridges chemistry, metabolism, and aging science in ways that attract significant research attention.`
      }
    ],
    takeaway: "NAD+ is a coenzyme essential for energy production, DNA repair, and sirtuin function. NAD+ precursors (like NMN and NR) are studied because NAD+ levels decline significantly with age."
  },

  "what-is-hcg-peptide": {
    icon: Droplets,
    iconColor: "#21d8ff",
    intro: `HCG (Human Chorionic Gonadotropin) is a glycoprotein hormone composed of 237 amino acids. It's best known as the "pregnancy hormone" because it's produced during pregnancy, but researchers study it for its effects on the reproductive system and hormonal regulation.`,
    sections: [
      {
        title: "What HCG Is",
        content: `HCG is made of two subunits:

**Alpha Subunit** - 92 amino acids. This part is identical to the alpha subunit of several other hormones (LH, FSH, TSH).

**Beta Subunit** - 145 amino acids. This part is unique to HCG and gives it its specific properties.

In pregnancy, the placenta produces HCG to maintain the corpus luteum, which produces progesterone needed to sustain early pregnancy. The beta subunit is what pregnancy tests detect.

Because HCG shares structural similarities with LH (luteinizing hormone), it can activate LH receptors, which is why researchers study it beyond pregnancy contexts.`
      },
      {
        title: "LH Receptor Activation",
        content: `The key to understanding HCG research is its relationship to LH:

**LH's Normal Role:** In males, LH signals the testes to produce testosterone. In females, LH triggers ovulation and progesterone production.

**HCG Mimics LH:** Because of structural similarities, HCG activates the same receptors that LH does.

**Why This Matters:** This allows researchers to study LH receptor activation using HCG, which is more readily available and more stable than LH itself.

**Duration:** HCG has a longer half-life than LH, providing more sustained receptor activation for research purposes.`
      },
      {
        title: "Research Applications",
        content: `Scientists study HCG across several areas:

**Reproductive Research** - Understanding how hormones regulate reproduction is a core application.

**Testosterone Production** - In male research subjects, HCG stimulates the same cells that LH normally stimulates, making it useful for studying testosterone regulation.

**Fertility Science** - HCG plays important roles in fertility research for both sexes.

**Leydig Cell Studies** - These testosterone-producing cells in the testes have LH/HCG receptors and are a focus of endocrine research.

**Comparative Studies** - Researchers compare HCG with LH to understand receptor activation kinetics and downstream effects.

HCG is a well-characterized hormone with decades of research, making it a valuable tool for reproductive endocrinology studies.`
      }
    ],
    takeaway: "HCG is a pregnancy hormone that activates the same receptors as LH (luteinizing hormone). Researchers use it to study reproductive biology, hormonal regulation, and testosterone production."
  },

  // ==========================================
  // NON-PEPTIDE ARTICLES - Keep the existing ones
  // ==========================================

  "reconstitution-101": {
    icon: FlaskConical,
    iconColor: "#22c55e",
    intro: `When your peptide order arrives, you'll notice it's a dry powder - not a liquid. This is intentional! Peptides stay stable much longer as a freeze-dried powder than as a liquid. "Reconstitution" is just a fancy word for mixing that powder with water to create a usable solution.`,
    sections: [
      {
        title: "Why Peptides Come as Powder",
        content: `Peptides are delicate molecules. When they're dissolved in water, they start to slowly break down over time - especially if they get warm or are exposed to light. But when they're freeze-dried (the scientific term is "lyophilized"), they can stay stable for months or even years.

Think of it like instant coffee versus brewed coffee. Instant coffee (the powder) can sit in your pantry for ages. But once you add water, you've got a limited window to enjoy it before it goes stale. Peptides work the same way.`,
        visual: () => <WhatIsPeptideVisual />
      },
      {
        title: "The Basic Process",
        content: `Here's the step-by-step process in plain language:

**Step 1:** Clean the rubber stopper on your peptide vial with an alcohol wipe. Let it dry for a moment.

**Step 2:** Draw your bacteriostatic water into a sterile syringe. The amount depends on your research protocol - common amounts are 1-2 mL.

**Step 3:** Insert the needle through the rubber stopper at an angle. Here's the crucial part: aim the needle at the inside wall of the vial, not directly at the powder.

**Step 4:** Push the water out SLOWLY. Let it trickle down the glass wall and gently flow over the powder. Don't blast the powder directly - this can damage the peptide molecules.

**Step 5:** Once all the water is in, gently swirl the vial. Don't shake it vigorously! Just rotate it slowly until the powder is fully dissolved.`
      }
    ],
    takeaway: "Reconstitution is simple: use bacteriostatic water, inject slowly along the vial wall, swirl gently, and refrigerate immediately."
  },

  "storage-101": {
    icon: ThermometerSnowflake,
    iconColor: "#9d4edd",
    intro: `Proper storage is one of the most important factors in maintaining peptide quality - yet it's often overlooked. The good news? It's not complicated. Understanding a few key principles will help you keep your research materials in optimal condition.`,
    sections: [
      {
        title: "The Two Storage States",
        content: `Peptides exist in two different states, and each requires different storage:

**Lyophilized (Powder Form)** - This is how your peptides arrive. In this freeze-dried state, they're very stable. Store these in your freezer at -20°C (-4°F) or colder. At this temperature, most peptides remain stable for 1-2 years or even longer.

**Reconstituted (Mixed with Water)** - Once you've added bacteriostatic water, the clock starts ticking. Store these in your refrigerator at 2-8°C (36-46°F). Most reconstituted peptides remain stable for 4-6 weeks under proper refrigeration.`,
        visual: () => <StorageBasics />
      },
      {
        title: "The Three Enemies of Peptides",
        content: `Peptides are sensitive molecules, and three things in particular can damage them:

**Heat** - Warmth speeds up chemical reactions, including the ones that break down peptides. This is why refrigeration is essential.

**Light** - UV light from the sun (and some indoor lighting) can break chemical bonds in peptide molecules. Store in dark containers or wrap in foil.

**Moisture** - For lyophilized peptides, humidity is the enemy. Keep sealed vials in airtight containers with desiccant packets if possible.`
      }
    ],
    takeaway: "Store powder in the freezer, store reconstituted solutions in the fridge, and protect everything from light and moisture."
  },

  "how-to-read-coas": {
    icon: FileCheck,
    iconColor: "#E7FB10",
    intro: `A Certificate of Analysis (COA) is essentially a report card for your peptide. It's third-party proof that what's in the vial is actually what the label says, and that it meets quality standards. Learning to read a COA is an essential skill for any researcher.`,
    sections: [
      {
        title: "Why COAs Matter",
        content: `In the peptide research world, you can't just take a vendor's word that their products are high-quality. Anyone can put a label on a vial. The COA is what separates legitimate research suppliers from questionable ones.

A proper COA comes from an independent, third-party laboratory - not the company selling the peptide. This independence is crucial. It means an unbiased lab has actually tested the product and is putting their reputation on the line by certifying the results.`,
        visual: () => <COASimplified />
      },
      {
        title: "Key Sections to Check",
        content: `Every COA should contain several essential pieces of information:

**Product Identity** - This confirms the peptide is what it claims to be. Methods like mass spectrometry verify the molecular structure.

**Purity Analysis** - Usually shown as a percentage from HPLC testing. Look for 95% or higher for research-grade quality.

**Batch/Lot Number** - This unique identifier links your specific vial to this specific test.

**Test Date** - When was this batch actually tested? You want to see a relatively recent date.

**Laboratory Name** - The COA should identify which independent lab performed the testing.`
      }
    ],
    takeaway: "Always request and review the COA before using any research peptide. Check for third-party lab verification, matching batch numbers, and recent test dates."
  },

  // ==========================================
  // EDUCATIONAL PEPTIDES - Not carried by company
  // ==========================================

  "what-is-kisspeptin-peptide": {
    icon: Heart,
    iconColor: "#ec4899",
    intro: `Kisspeptin is a neuropeptide that plays a crucial role in reproductive biology. It acts as the master switch for the body's reproductive hormone system, discovered through its role in puberty and fertility. Scientists study it to understand how the brain controls reproductive function.`,
    sections: [
      {
        title: "What Kisspeptin Does",
        content: `Kisspeptin neurons in the brain serve as the "command center" for reproduction. When they release kisspeptin, it triggers a cascade that ultimately controls sex hormone production.

**The Signaling Chain** - Kisspeptin activates GnRH (gonadotropin-releasing hormone) neurons in the hypothalamus. GnRH then tells the pituitary to release LH and FSH, which control the reproductive organs.

**Puberty Trigger** - The activation of kisspeptin neurons is what initiates puberty. Before this, the system is essentially "switched off."

**Fertility Link** - Kisspeptin levels fluctuate with the menstrual cycle and play roles in ovulation timing.`
      },
      {
        title: "How Researchers Study It",
        content: `Scientists investigate kisspeptin to understand reproductive biology:

**Hypothalamic Regulation** - How does the brain know when to start puberty or time ovulation? Kisspeptin research helps answer these questions.

**Hormone Axis Studies** - Kisspeptin provides a research tool for studying the hypothalamic-pituitary-gonadal (HPG) axis.

**Receptor Interactions** - Kisspeptin binds to the GPR54 receptor (also called KISS1R), and understanding this interaction reveals how biological switches work.`
      },
      {
        title: "Scientific Significance",
        content: `Kisspeptin research has transformed our understanding of reproductive endocrinology:

**Discovery Story** - Kisspeptin was initially discovered in cancer research before scientists realized its crucial role in reproduction.

**Multiple Forms** - There are different fragments of kisspeptin (kisspeptin-54, -14, -13, -10), each with research applications.

**Cross-Species Presence** - Kisspeptin is highly conserved across species, indicating its fundamental biological importance.`
      }
    ],
    takeaway: "Kisspeptin is a neuropeptide that controls the reproductive hormone cascade. It's the master switch that initiates puberty and regulates fertility, making it fundamental to reproductive biology research."
  },

  "what-is-kisspeptin-54-peptide": {
    icon: Heart,
    iconColor: "#ec4899",
    intro: `Kisspeptin-54 is the full-length version of a natural brain signal called kisspeptin. Your body actually makes several "sizes" of this signal — think of it like the same message written at different lengths. Kisspeptin-54 is the longest version, with 54 amino acids. Researchers study it to understand how the brain controls the body's reproductive hormone system, using it as a precise research tool that lets them trace the exact sequence of events from brain signal to hormone release.`,
    sections: [
      {
        title: "The Kisspeptin Family — Different Lengths, Same Lock",
        content: `Your body produces kisspeptin from a single gene, but enzymes in the body can clip it into shorter pieces. The result is a family of related signals:

**Kisspeptin-54** — the full-length, intact version. It's the longest and has the slowest breakdown.

**Kisspeptin-10** — a 10-amino-acid fragment clipped from the end of kisspeptin-54. It's the shortest active form and breaks down faster.

**Kisspeptin-13 and -14** — intermediate lengths with properties between the two.

Here's the key insight: all of these fragments share the same "business end" — the final 10 amino acids that fit into kisspeptin's receptor (called KISS1R). They all trigger the same receptor, like different-sized keys that all open the same lock. But because kisspeptin-54 is bigger, enzymes need longer to cut it apart, so it stays active in the body longer. This difference in how long each version lasts is one of the main reasons researchers study them separately.`
      },
      {
        title: "How Kisspeptin-54 Fits Into the Hormonal Relay Race",
        content: `Think of your reproductive hormone system like a relay race with several runners:

**Runner 1 — Kisspeptin-54 neurons** - Kisspeptin-54 is released by specialized brain cells and acts as the very first signal in the chain. It fires a chemical message that says "reproductive system, wake up."

**Runner 2 — GnRH neurons** - Kisspeptin-54 directly activates neurons that release GnRH (gonadotropin-releasing hormone). These neurons carry the baton to the next runner.

**Runner 3 — The Pituitary** - GnRH tells the pituitary gland to release LH (luteinizing hormone) and FSH (follicle-stimulating hormone). These travel through the bloodstream.

**Runner 4 — The Gonads** - LH and FSH reach the reproductive organs and trigger testosterone or estrogen production.

Kisspeptin-54 is unique because it sits at the very beginning of this race. By giving researchers a tool to fire that first signal in a controlled way, it lets them observe everything that happens downstream — without needing to interfere at any other point in the chain.`
      },
      {
        title: "Why Researchers Use Kisspeptin-54 Instead of Kisspeptin-10",
        content: `Both kisspeptin-54 and kisspeptin-10 activate the same receptor, so why does the length matter to researchers?

**Duration of Signal** - Kisspeptin-54 lasts about 28–35 minutes in the bloodstream (half-life). Kisspeptin-10 only lasts around 15–30 minutes. These aren't huge differences, but they change the shape of the downstream hormone response. Kisspeptin-54 produces a more prolonged, sustained rise in LH and FSH.

**Studying Pulse Patterns** - The reproductive system normally works in pulses — brief waves of hormone release, not a steady stream. Because kisspeptin-54 lasts longer, it produces larger LH pulses with a higher total area under the curve. Researchers use this to study how pulse size and duration affect the system differently from pulse frequency.

**Building Cascade Models** - Scientists often combine kisspeptin-54 with other compounds — like Gonadorelin (which works one step downstream) or Enclomiphene (which works on the feedback loop) — to map out each separate step in the hormonal relay race. Because each compound targets a different runner, combining them lets researchers isolate cause and effect at each point.`
      }
    ],
    takeaway: "Kisspeptin-54 is the full-length version of the brain's reproductive hormone trigger signal. Researchers use it to study the very first step in the hormonal relay race — the signal that starts the chain leading to LH, FSH, and sex hormone production. Its longer duration compared to kisspeptin-10 makes it valuable for studying pulse dynamics and multi-step hormone cascade models."
  },

  "what-is-pt-141-bremelanotide-peptide": {
    icon: Brain,
    iconColor: "#9d4edd",
    intro: `PT-141, also known as bremelanotide, is a synthetic peptide derived from melanotan II. Unlike hormones that work through the circulatory system, PT-141 works directly through the central nervous system by activating melanocortin receptors in the brain. This makes it unique among peptides studied for sexual function.`,
    sections: [
      {
        title: "How PT-141 Works",
        content: `PT-141 activates melanocortin receptors, particularly MC3R and MC4R, which are found in areas of the brain involved in sexual arousal:

**Central Nervous System Action** - Unlike vascular-based approaches, PT-141 works through neural pathways. It activates brain regions associated with desire and arousal.

**Melanocortin System** - The melanocortin system affects many functions including appetite, energy, and yes, sexual behavior. PT-141 specifically targets the pathways related to sexual response.

**Receptor Binding** - By binding to MC3R and MC4R receptors in the hypothalamus, PT-141 initiates a cascade that affects sexual arousal circuits.`
      },
      {
        title: "Origin from Melanotan II",
        content: `PT-141 was derived from melanotan II, but researchers modified it specifically for research purposes:

**Selectivity Improvement** - Scientists removed the tanning-related effects while retaining the central nervous system activity.

**Cyclic Structure** - Like its parent compound, PT-141 has a cyclic structure that provides stability and receptor binding properties.

**Research Evolution** - The development from melanotan II to PT-141 represents how peptide research iterates to find more targeted compounds.`
      },
      {
        title: "Research Applications",
        content: `Scientists study PT-141 in various contexts:

**Neuroscience** - How does the brain regulate sexual function? PT-141 helps researchers probe these circuits.

**Receptor Studies** - Understanding how melanocortin receptors affect behavior beyond their known roles in pigmentation and appetite.

**Comparative Studies** - Researchers compare PT-141's mechanism to other approaches that work through different pathways.`
      }
    ],
    takeaway: "PT-141 (bremelanotide) works through brain melanocortin receptors rather than vascular pathways. It's studied to understand how the central nervous system regulates sexual arousal and response."
  },

  "what-is-thymosin-alpha-1-peptide": {
    icon: Shield,
    iconColor: "#22c55e",
    intro: `Thymosin Alpha-1 (Tα1) is a 28-amino-acid peptide originally isolated from the thymus gland. The thymus is a specialized organ that trains immune cells during development. Thymosin Alpha-1 appears to be one of the key signaling molecules involved in this process, making it a significant subject for immunology research.`,
    sections: [
      {
        title: "The Thymus Connection",
        content: `The thymus gland is crucial for immune system development:

**T-Cell Training Ground** - Immature immune cells migrate to the thymus, where they "learn" to distinguish self from non-self. Thymosin Alpha-1 participates in this education process.

**Age-Related Decline** - The thymus shrinks with age (a process called thymic involution), and thymosin production decreases accordingly. This natural decline interests aging researchers.

**Endocrine Function** - The thymus isn't just an immune organ - it functions somewhat like an endocrine gland, releasing peptides like Thymosin Alpha-1 that affect the whole body.`
      },
      {
        title: "Immune System Effects",
        content: `Thymosin Alpha-1 influences multiple aspects of immune function:

**T-Cell Development** - It appears to promote the maturation and differentiation of T-lymphocytes, the immune cells that coordinate adaptive immunity.

**Dendritic Cell Effects** - Thymosin Alpha-1 may also affect dendritic cells, which are responsible for presenting antigens to T-cells.

**Cytokine Modulation** - Research suggests it influences the balance of pro-inflammatory and anti-inflammatory cytokines.`
      },
      {
        title: "Research Significance",
        content: `Scientists study Thymosin Alpha-1 in various contexts:

**Immunomodulation** - Understanding how to support immune function through thymic pathways.

**Aging Research** - Investigating whether declining thymic peptides contribute to age-related immune weakness (immunosenescence).

**Toll-Like Receptor Activation** - Thymosin Alpha-1 appears to signal through TLR9, connecting it to innate immunity as well as adaptive responses.`
      }
    ],
    takeaway: "Thymosin Alpha-1 is a thymus-derived peptide that influences T-cell development and immune regulation. It's studied to understand how thymic signaling affects immune competence, especially in the context of aging."
  },

  "what-is-dsip-peptide": {
    icon: Moon,
    iconColor: "#6366f1",
    intro: `DSIP (Delta Sleep-Inducing Peptide) is a small nonapeptide (9 amino acids) originally isolated from the blood of rabbits during slow-wave sleep. Despite its name, DSIP's relationship with sleep is complex, and researchers now study it for a variety of effects beyond just sleep induction.`,
    sections: [
      {
        title: "What DSIP Actually Does",
        content: `DSIP has effects across multiple systems:

**Sleep Architecture** - Rather than simply inducing sleep, DSIP appears to influence the pattern and quality of sleep, particularly delta wave (slow-wave) activity.

**Stress Response** - DSIP may modulate the body's response to stress by affecting the hypothalamic-pituitary-adrenal (HPA) axis.

**Circadian Rhythms** - Research suggests DSIP interacts with the body's internal clock mechanisms, which may explain its sleep-related effects.

**Neuroprotective Interest** - Some studies investigate whether DSIP has protective effects on neural tissue.`
      },
      {
        title: "Discovery and Structure",
        content: `DSIP has an interesting scientific history:

**How It Was Found** - Scientists discovered DSIP by looking for substances in the blood of sleeping animals that might induce sleep in awake animals.

**Small Size** - At just 9 amino acids (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu), DSIP is among the smaller bioactive peptides.

**Crossing Barriers** - Despite being a peptide, DSIP appears able to cross the blood-brain barrier, which is unusual and makes it interesting for neuroscience research.`
      },
      {
        title: "Current Research Focus",
        content: `Scientists study DSIP in several areas:

**Sleep Physiology** - Understanding how the brain regulates different phases of sleep.

**Stress and Anxiety** - Investigating DSIP's apparent calming effects and their mechanisms.

**Pain Research** - Some studies suggest DSIP may affect pain perception pathways.

**Opioid System Interactions** - DSIP appears to interact with endorphin systems, opening research into pain and stress modulation.`
      }
    ],
    takeaway: "DSIP is a 9-amino-acid peptide that affects sleep architecture, stress response, and potentially pain pathways. It's studied to understand how peptide signals regulate states of rest and stress."
  },

  "what-is-selank-peptide": {
    icon: Brain,
    iconColor: "#21d8ff",
    intro: `Selank is a synthetic peptide developed in Russia that combines a sequence from the natural immune peptide tuftsin with additional amino acids. This design was intended to create a compound that affects both immune and neurological function, making it interesting for research on the connection between these systems.`,
    sections: [
      {
        title: "The Tuftsin Connection",
        content: `Selank is built upon tuftsin, a naturally occurring immune peptide:

**Tuftsin Base** - Tuftsin (Thr-Lys-Pro-Arg) is a tetrapeptide that naturally stimulates phagocytosis - the process where immune cells engulf pathogens.

**Extended Sequence** - Selank adds Pro-Gly-Pro to the tuftsin sequence, changing its properties and potentially how it affects the nervous system.

**Dual System Effects** - By building on an immune peptide, selank was designed to potentially affect both immune and neurological function.`
      },
      {
        title: "Neurological Research Interest",
        content: `Scientists study selank for potential effects on the nervous system:

**GABA System** - Research suggests selank may influence GABAergic signaling, the brain's primary inhibitory system that relates to calmness and anxiety.

**BDNF Expression** - Some studies indicate selank might affect brain-derived neurotrophic factor, a protein important for neuron health and plasticity.

**Gene Expression** - Selank appears to influence the expression of various genes related to neural function.`
      },
      {
        title: "Research Applications",
        content: `Selank is studied in various contexts:

**Anxiety Models** - Scientists use selank in animal models to study anxiety-related behaviors and their biological basis.

**Cognitive Research** - Some studies examine selank's effects on memory and learning processes.

**Psychoneuroimmunology** - Selank helps researchers explore the connection between the immune system and brain function - how immune signals affect mood and cognition.`
      }
    ],
    takeaway: "Selank is a synthetic peptide based on the immune peptide tuftsin. It's studied for potential effects on both immune function and the nervous system, particularly GABAergic signaling and anxiety-related pathways."
  },

  "what-is-aod-9604-peptide": {
    icon: Zap,
    iconColor: "#f97316",
    intro: `AOD-9604 is a modified fragment of human growth hormone (HGH). Specifically, it's amino acids 177-191 from the C-terminal end of HGH, with an added tyrosine at the beginning. This fragment was designed to capture some of growth hormone's metabolic effects without the growth-promoting activities.`,
    sections: [
      {
        title: "How AOD-9604 Was Designed",
        content: `Growth hormone has many effects, and scientists sought to isolate specific ones:

**Fragment Approach** - Rather than using the full 191-amino-acid growth hormone, researchers isolated just 15 amino acids (177-191) believed responsible for certain metabolic effects.

**Tyrosine Addition** - Adding tyrosine to the beginning of this fragment helped stabilize it and may affect its binding properties.

**Targeted Activity** - The goal was to maintain fat metabolism effects without the insulin-resistant or growth-promoting effects of full HGH.`
      },
      {
        title: "Research Focus Areas",
        content: `Scientists study AOD-9604 for various reasons:

**Fat Metabolism** - The primary research interest is how this fragment affects lipolysis (fat breakdown) and lipogenesis (fat creation).

**Structure-Function Studies** - AOD-9604 helps researchers understand which parts of the GH molecule are responsible for which effects.

**No IGF-1 Increase** - Unlike full HGH, AOD-9604 reportedly doesn't raise IGF-1 levels significantly, which helps isolate its specific mechanisms.`
      },
      {
        title: "Mechanism of Action",
        content: `How AOD-9604 appears to work:

**Fat Cell Signaling** - AOD-9604 may affect signaling pathways within adipocytes (fat cells) that regulate the storage and release of fatty acids.

**Beta-3 Adrenergic Activity** - Some research suggests it may act through or alongside beta-3 adrenergic receptor pathways.

**Cartilage Research** - Beyond fat metabolism, there's also research interest in AOD-9604's potential effects on cartilage cells.`
      }
    ],
    takeaway: "AOD-9604 is a fragment of growth hormone (amino acids 177-191 plus tyrosine) studied for its effects on fat metabolism. It was designed to capture specific metabolic effects without the growth-promoting activities of full HGH."
  },

  "what-is-thymulin-peptide": {
    icon: Shield,
    iconColor: "#22c55e",
    intro: `Thymulin (also called facteur thymique sérique or FTS) is a small nonapeptide hormone produced exclusively by the thymus gland. Unlike Thymosin Alpha-1, thymulin requires zinc to be biologically active, making it a unique metallopeptide. It's studied for its role in T-cell maturation and immune regulation.`,
    sections: [
      {
        title: "The Zinc-Dependent Hormone",
        content: `Thymulin has unique properties among thymic hormones:

**Metal Requirement** - Thymulin only functions when bound to zinc. Without zinc, it's called FTS-like peptide and lacks biological activity.

**Thymus Exclusive** - Only the thymus produces thymulin, making it a true marker of thymic function.

**Small Size** - At just 9 amino acids (Glu-Ala-Lys-Ser-Gln-Gly-Gly-Ser-Asn), it's one of the smaller bioactive peptides, yet it has potent effects.`
      },
      {
        title: "Immune System Role",
        content: `Thymulin affects T-cell development and function:

**T-Cell Maturation** - Thymulin promotes the differentiation of immature T-cells into functional subsets (CD4+ and CD8+ cells).

**Cytokine Influence** - It appears to modulate cytokine production, affecting the overall immune response.

**Neuroendocrine Connection** - Thymulin levels are influenced by hormones like growth hormone and prolactin, showing the immune system's connection to the endocrine system.`
      },
      {
        title: "Research Significance",
        content: `Scientists study thymulin in various contexts:

**Aging Research** - Thymulin levels decline with age parallel to thymic involution. Researchers study whether this contributes to age-related immune decline.

**Zinc Status Indicator** - Because thymulin requires zinc, it's sometimes studied as an indirect marker of zinc status.

**Inflammatory Research** - Some studies investigate thymulin's potential anti-inflammatory properties and how they relate to its immune-modulating effects.

**Thymic Function Assessment** - Thymulin can be measured in blood as an indicator of thymic activity.`
      }
    ],
    takeaway: "Thymulin is a zinc-dependent thymic hormone essential for T-cell maturation. It's unique in requiring zinc for activity and serves as a marker of thymic function, making it valuable for immune and aging research."
  },

  "what-is-5-amino-1mq-peptide": {
    icon: Zap,
    iconColor: "#E7FB10",
    intro: `5-Amino-1MQ is a small molecule that inhibits an enzyme called NNMT (nicotinamide N-methyltransferase). This enzyme plays a role in how your body processes NAD+, a crucial molecule for cellular energy. By blocking NNMT, researchers study how cells might have more NAD+ available for energy production.`,
    sections: [
      {
        title: "The NAD+ Connection",
        content: `NAD+ (nicotinamide adenine dinucleotide) is essential for cellular energy:

**Energy Currency** - NAD+ is involved in converting food into cellular energy. Every cell needs it to function.

**NNMT's Role** - The enzyme NNMT breaks down NAD+ precursors, effectively reducing the amount of NAD+ your cells can make.

**5-Amino-1MQ's Effect** - By inhibiting NNMT, 5-Amino-1MQ may help preserve more NAD+ precursors, potentially supporting cellular energy levels.

Think of it like a drain stopper - it helps keep more NAD+ in the system rather than letting it "drain away" through NNMT.`
      },
      {
        title: "How It Works (Simply Explained)",
        content: `Here's the basic mechanism:

**NNMT Enzyme** - This enzyme normally methylates (adds a chemical group to) nicotinamide, removing it from the NAD+ salvage pathway.

**Blocking NNMT** - When 5-Amino-1MQ inhibits NNMT, more nicotinamide stays available to be recycled back into NAD+.

**Cellular Impact** - With more NAD+ available, cells may have better energy metabolism and mitochondrial function.

**Research Interest** - Scientists study this for understanding metabolic health, aging, and cellular energy dynamics.`
      },
      {
        title: "Research Applications",
        content: `Scientists investigate 5-Amino-1MQ in several contexts:

**Metabolic Research** - Understanding how NNMT inhibition affects overall metabolism and energy expenditure.

**Fat Tissue Studies** - NNMT is highly expressed in fat tissue, making it interesting for adipose metabolism research.

**Aging Research** - NAD+ levels decline with age, so NNMT inhibition is studied as a potential way to support NAD+ in aging cells.

**Muscle Research** - Studies examine effects on muscle cell energy and regeneration.`
      }
    ],
    takeaway: "5-Amino-1MQ inhibits the NNMT enzyme, which normally depletes NAD+ precursors. By blocking NNMT, it may help maintain higher cellular NAD+ levels, supporting energy metabolism and cellular function."
  },

  "what-is-dihexa-peptide": {
    icon: Brain,
    iconColor: "#9d4edd",
    intro: `Dihexa is a peptide derivative that researchers study for its effects on cognitive function. It works through the HGF/c-Met system - a signaling pathway involved in nerve cell connections. What makes Dihexa remarkable is its reported potency: it appears to be about 7 times more powerful than BDNF (brain-derived neurotrophic factor) at promoting synapse formation.`,
    sections: [
      {
        title: "The HGF/c-Met Connection",
        content: `Dihexa works through a specific growth factor system:

**HGF (Hepatocyte Growth Factor)** - Despite its name, HGF also affects the brain, particularly in forming new connections between nerve cells.

**c-Met Receptor** - This is the receptor that HGF activates. When triggered, it promotes processes that help nerve cells grow and connect.

**Synaptogenesis** - The formation of new synapses (connections between neurons) is crucial for learning and memory. Dihexa appears to strongly promote this process.

Think of it like a fertilizer specifically designed to help brain cells form new connections with each other.`
      },
      {
        title: "Why It's So Potent",
        content: `Dihexa has remarkable characteristics:

**Angiotensin IV Derivative** - Dihexa was developed from a brain peptide called angiotensin IV, modified to be more stable and potent.

**7x BDNF Potency** - In research settings, Dihexa promotes synapse formation about 7 times more effectively than BDNF, a well-known neurotrophic factor.

**Oral Availability** - Unlike many peptides, Dihexa can be absorbed orally, making it easier to study in research settings.

**Low Doses Needed** - Its high potency means very small amounts can produce observable effects in research.`
      },
      {
        title: "Research Focus Areas",
        content: `Scientists study Dihexa for several reasons:

**Cognitive Function** - Understanding how enhanced synapse formation affects learning and memory.

**Neuroplasticity** - Studying how the brain forms new connections and adapts.

**Neurodegenerative Research** - Exploring whether enhanced synaptogenesis might help in conditions where neurons lose connections.

**Structure-Function Studies** - Understanding how modifications to the angiotensin IV structure create such potent effects.`
      }
    ],
    takeaway: "Dihexa is a peptide derivative that works through the HGF/c-Met pathway to promote synapse formation. It's studied for being approximately 7 times more potent than BDNF at stimulating new neuronal connections."
  },

  "what-is-glutathione": {
    icon: Shield,
    iconColor: "#22c55e",
    intro: `Glutathione is often called the "master antioxidant" because it's the most abundant antioxidant your body makes. It's a tripeptide (just three amino acids: glutamate, cysteine, and glycine) found in virtually every cell. Unlike most antioxidants you eat, glutathione is made inside your cells where it's needed most.`,
    sections: [
      {
        title: "Why Glutathione Is Special",
        content: `Your body produces many antioxidants, but glutathione stands out:

**Made Internally** - While you get vitamins C and E from food, your cells manufacture glutathione themselves.

**Found Everywhere** - Every cell in your body contains glutathione, with especially high concentrations in the liver.

**Recycling Ability** - Glutathione can be regenerated after it neutralizes free radicals. It goes from GSH (reduced) to GSSG (oxidized) and back again.

**Multi-Tasker** - Beyond antioxidant duties, glutathione helps with detoxification, protein repair, and immune function.`
      },
      {
        title: "The Redox Cycle",
        content: `Glutathione works through an elegant recycling system:

**GSH (Reduced Form)** - This is the active form that can neutralize harmful reactive oxygen species.

**GSSG (Oxidized Form)** - After donating electrons to neutralize threats, glutathione becomes oxidized.

**Recycling Enzymes** - Enzymes like glutathione reductase convert GSSG back to GSH, using NADPH as energy.

**The Ratio Matters** - The GSH:GSSG ratio is a key indicator of cellular oxidative stress. Healthy cells maintain high GSH levels.`
      },
      {
        title: "Research Applications",
        content: `Scientists study glutathione in many contexts:

**Liver Health** - The liver has the highest glutathione concentrations and uses it extensively for detoxification.

**Aging Research** - Glutathione levels decline with age, making it interesting for longevity studies.

**Immune Function** - Immune cells require glutathione to function properly, especially during infections.

**Cellular Stress** - Researchers use glutathione levels as markers of how well cells handle oxidative stress.`
      }
    ],
    takeaway: "Glutathione is a tripeptide antioxidant made by every cell in your body. It protects cells from oxidative damage through a regenerating cycle (GSH↔GSSG) and supports detoxification, making it central to cellular health research."
  },

  "what-is-vitamin-b12": {
    icon: Dna,
    iconColor: "#ec4899",
    intro: `Vitamin B12 (cobalamin) is an essential nutrient that contains cobalt at its center - the only vitamin with a metal atom. Despite needing only tiny amounts, B12 is crucial for DNA synthesis, nerve function, and energy metabolism. It's unique among vitamins because it requires a special protein (intrinsic factor) for absorption.`,
    sections: [
      {
        title: "What Makes B12 Unique",
        content: `B12 has several distinctive characteristics:

**Contains Cobalt** - The "cobal" in cobalamin refers to the cobalt atom at its center, making it the only vitamin with a metal.

**Multiple Forms** - B12 comes in several forms: cyanocobalamin (synthetic), methylcobalamin, hydroxocobalamin, and adenosylcobalamin.

**Special Absorption** - Your stomach produces intrinsic factor, a protein that binds B12 and enables absorption in the small intestine.

**Long Storage** - The liver stores years' worth of B12, which is why deficiency can take a long time to develop.`
      },
      {
        title: "The Methylation Connection",
        content: `B12's most important role involves methylation:

**Methyl Donor** - Methylcobalamin provides methyl groups for countless biochemical reactions.

**Homocysteine Conversion** - B12 helps convert homocysteine to methionine. High homocysteine is associated with health concerns.

**DNA Synthesis** - Methylation reactions involving B12 are essential for making new DNA, explaining why deficiency affects rapidly dividing cells.

**Neural Function** - The nervous system particularly depends on B12-dependent methylation for myelin (nerve coating) maintenance.`
      },
      {
        title: "Research Applications",
        content: `Scientists study B12 in various contexts:

**Neurological Research** - B12 deficiency can cause serious nerve damage, making it important for nervous system studies.

**Energy Metabolism** - Understanding B12's role in converting food to cellular energy.

**Methylation Studies** - B12 is central to one-carbon metabolism research.

**Deficiency Research** - Studying absorption issues, especially in aging populations where intrinsic factor production may decline.`
      }
    ],
    takeaway: "Vitamin B12 is the only vitamin containing a metal (cobalt). It's essential for methylation reactions that affect DNA synthesis, nerve function, and energy metabolism. Its unique absorption mechanism involving intrinsic factor makes it a subject of ongoing research."
  },

  "what-is-melanotan-peptide": {
    icon: Sparkles,
    iconColor: "#f97316",
    intro: `Melanotan I and Melanotan II are synthetic peptides that mimic alpha-melanocyte stimulating hormone (α-MSH), which naturally regulates skin pigmentation. Developed at the University of Arizona, these peptides activate melanocortin receptors, with MT-I being more selective for MC1R (skin pigmentation) and MT-II affecting multiple receptor subtypes.`,
    sections: [
      {
        title: "Understanding the Melanocortin System",
        content: `These peptides work through melanocortin receptors:

**MC1R (Skin)** - When activated, this receptor triggers melanocytes to produce melanin, the pigment that darkens skin.

**MC3R and MC4R** - These receptors in the brain affect appetite, sexual function, and energy balance. MT-II activates these more than MT-I.

**MC5R (Glands)** - Affects secretory glands, relevant to some side effect profiles.

**Natural α-MSH** - Your body produces this hormone to stimulate tanning. Melanotan peptides are more potent and longer-lasting.`
      },
      {
        title: "MT-I vs MT-II Comparison",
        content: `The two peptides have different selectivity profiles:

**Melanotan I (Afamelanotide)** - More selective for MC1R, primarily affecting skin pigmentation with fewer other effects.

**Melanotan II** - Activates multiple melanocortin receptors (MC1R, MC3R, MC4R, MC5R), leading to broader effects beyond pigmentation.

**Potency Differences** - MT-II is generally more potent at lower doses due to its multi-receptor activity.

**Research Status** - MT-I has been developed as a pharmaceutical product (afamelanotide) for specific conditions, while MT-II remains primarily a research compound.`
      },
      {
        title: "Research Focus Areas",
        content: `Scientists study these peptides for various reasons:

**Photoprotection Research** - Understanding how increased melanin might protect skin from UV damage.

**Melanocortin System Studies** - Using these peptides to understand how melanocortin receptors affect different body systems.

**Receptor Selectivity** - Comparing MT-I and MT-II helps researchers understand how slight structural differences change receptor binding.

**Pigmentation Disorders** - Research into conditions where natural melanin production is impaired.`
      }
    ],
    takeaway: "Melanotan I and II are synthetic melanocortin receptor agonists that stimulate melanin production. MT-I is selective for MC1R (skin), while MT-II activates multiple receptors affecting pigmentation, appetite, and other systems."
  },

  "what-is-gonadorelin-peptide": {
    icon: Activity,
    iconColor: "#e11d48",
    intro: `Gonadorelin is a tiny synthetic peptide that is an exact copy of a signal your brain naturally produces. Your hypothalamus — a small region at the base of your brain — releases this signal to kick off a chain reaction that ultimately controls sex hormone production. Think of it as the starting pistol in a relay race. Gonadorelin gives researchers a way to fire that starting pistol in the lab, under controlled conditions, whenever they need to.`,
    sections: [
      {
        title: "The Hormonal Relay Race",
        content: `Your reproductive hormone system works like a relay race with three runners:

**Runner 1 — the Hypothalamus** - This part of the brain fires the starting pistol by releasing a small chemical signal called GnRH (gonadotropin-releasing hormone). Gonadorelin is a lab-made, exact copy of that signal.

**Runner 2 — the Pituitary Gland** - When it receives the GnRH signal, the pituitary gland reacts by releasing two hormones of its own: LH (luteinizing hormone) and FSH (follicle-stimulating hormone). These are the "second runner" passing the baton.

**Runner 3 — the Gonads** - LH and FSH travel through the bloodstream to the gonads (testes in males, ovaries in females), where they trigger testosterone or estrogen production and control reproductive function. That's the finish line.

Gonadorelin lets researchers control exactly when that starting pistol goes off — and observe what happens next.`
      },
      {
        title: "Why It Has to Be Pulsed, Not Constant",
        content: `One of the most fascinating things about this system is that timing matters enormously. Your hypothalamus doesn't release GnRH in a steady stream — it fires in brief pulses, like a heartbeat.

Think of it like a doorbell. A quick press signals "someone's at the door." But if you held the button down all day, eventually the occupant would stop responding altogether.

The same thing happens with GnRH receptors. A pulse gets a response. Constant stimulation causes the receiving cells to shut themselves down and stop listening — a process called desensitization.

This is why researchers pay close attention to pulse timing when studying Gonadorelin. The frequency and spacing of the signal determines the outcome just as much as the dose itself.`
      },
      {
        title: "How It Compares to Other Research Compounds",
        content: `Gonadorelin is the "original" — the unmodified natural sequence. Other research compounds in this hormonal family, like Triptorelin, are modified versions designed to last longer or bind more powerfully.

**The Key Trade-Off** - Because Gonadorelin is the natural, unmodified signal, it breaks down quickly in the body (within minutes). That short lifespan is actually useful in research — it means the signal stops cleanly when you stop giving it, with no prolonged activity to account for.

**Modified vs. Natural** - Modified analogs last much longer but behave differently at higher exposures. Gonadorelin's quick clearance makes it ideal for studies that need a clean "on/off" signal rather than prolonged receptor activation.

**A Starting Point** - Many researchers begin with Gonadorelin to establish how the system behaves normally before introducing modified compounds to see what changes.`
      }
    ],
    takeaway: "Gonadorelin is a lab-made copy of the brain's natural reproductive hormone trigger. Researchers use it to study how the body's hormonal relay race gets started — and what happens at each step along the way."
  },

  "what-is-triptorelin-peptide": {
    icon: Dna,
    iconColor: "#e11d48",
    intro: `Triptorelin is a close cousin of Gonadorelin — both are based on the same natural hormone signal that triggers the body's reproductive hormone system. But Triptorelin has one small chemical tweak that makes it dramatically more powerful and longer-lasting. Think of it like a regular key versus a master key: they open the same lock, but the master key grips more firmly and stays in the lock much longer.`,
    sections: [
      {
        title: "One Small Change, Big Difference",
        content: `The body's natural GnRH signal is a short chain of ten amino acids — the building blocks that make up proteins and peptides. Triptorelin is almost identical, with one critical difference: a single amino acid at position 6 has been swapped for a mirror-image version.

This sounds minor, but it has a huge effect. Your body's natural enzymes — the "scissors" that cut and break down proteins — are shaped to work on normal amino acids. The mirror-image version in Triptorelin doesn't fit those scissors properly, so they can't cut it as efficiently.

**The result?** Triptorelin survives in the body much longer than the natural signal. Where natural GnRH breaks down in minutes, Triptorelin can remain active for hours. It also grips its target receptors about 100 times more tightly than the original — so a much smaller amount produces a much stronger effect.`
      },
      {
        title: "The Surprising Paradox",
        content: `Here's one of the most counterintuitive things in all of hormone research: Triptorelin is so good at stimulating the hormonal system that it can actually switch the system off.

It works like this. Imagine a smoke alarm that won't stop beeping. Eventually you might pull out the battery just to make it stop. Your body does something similar when a receptor is constantly activated — it removes the receptors from the cell surface so they stop responding to the signal. This is called receptor downregulation.

With a brief, pulsed signal, Triptorelin strongly activates the system — you get a surge of hormones. But with prolonged, continuous exposure, the system gets overwhelmed and shuts itself down.

This paradox is valuable to researchers. It means Triptorelin can be used to study both the "on" state and the "off" state of the same hormonal pathway.`
      },
      {
        title: "What Makes It Useful for Research",
        content: `Triptorelin's unique properties make it a versatile research tool:

**Studying the "On" State** - In short-term or pulsed studies, Triptorelin strongly activates the reproductive hormone system. Researchers can measure exactly how quickly and powerfully the pituitary responds to a strong GnRH signal.

**Studying the "Off" State** - With prolonged exposure, researchers can observe how cells protect themselves from constant stimulation — removing receptors, reducing sensitivity, and returning the system toward balance.

**Comparing to Natural GnRH** - By studying both Gonadorelin (the natural signal) and Triptorelin (the modified version) side by side, researchers can understand which aspects of the hormone's behavior depend on its potency versus its timing.`
      }
    ],
    takeaway: "Triptorelin is a chemically modified version of the brain's natural reproductive hormone signal — about 100 times more potent and much longer-lasting. Researchers use it to study both how the hormonal system gets switched on and, paradoxically, how it gets switched off when overstimulated."
  },

  "what-is-enclomiphene-peptide": {
    icon: Shield,
    iconColor: "#e11d48",
    intro: `Enclomiphene is a research compound that works by lifting a natural brake on your body's hormonal system. Your body is constantly monitoring its own hormone levels and using those readings to decide how much more to produce. Enclomiphene interferes with one specific part of that monitoring system — the part that reads estrogen levels in the brain — which makes it a precise and useful tool for understanding how hormonal feedback loops work.`,
    sections: [
      {
        title: "The Thermostat Analogy",
        content: `The easiest way to understand Enclomiphene is through an analogy: think of your hormonal system as a home heating system.

Your thermostat constantly reads the temperature (estrogen levels in this case). When the temperature gets high enough, it sends a signal to the furnace to stop producing heat. That's negative feedback — the system slowing itself down to prevent overheating.

Now imagine covering the thermostat's temperature sensor. It can't "feel" the heat anymore, so it never sends the "stop" signal. The furnace keeps running.

That's what Enclomiphene does. It sits in estrogen-sensing spots in the brain and blocks the estrogen signal from being "read." The brain thinks estrogen is low, so it keeps sending signals to ramp up hormone production.

**The key insight:** Enclomiphene doesn't add hormones — it removes a brake that was holding production back.`
      },
      {
        title: "Why Researchers Find This Useful",
        content: `This "brake removal" effect gives scientists a way to study the hormonal feedback system by selectively disabling one of its control inputs:

**Isolating the Feedback Loop** - By removing the estrogen-sensing brake, researchers can observe how the system behaves without that specific input. What does the pituitary do when it's no longer receiving the "estrogen is high, slow down" signal? Enclomiphene helps answer this.

**Measuring Baseline Capacity** - Without the brake, you can see how much hormone production the system is actually capable of. This establishes a ceiling that's otherwise hidden when the normal brake is in place.

**Paired Research Models** - Scientists often combine Enclomiphene with other compounds to study the hormonal system from multiple angles at once — one compound stimulating production directly, another removing the feedback check. This gives a more complete picture of how the whole system interacts.`
      },
      {
        title: "What Makes It Selective",
        content: `Enclomiphene belongs to a class of compounds called SERMs — "selective estrogen receptor modulators." The word "selective" is key.

Estrogen receptors exist throughout your entire body — in the brain, in bones, in the heart, in reproductive organs. A compound that blocked all of them everywhere would cause widespread effects. SERMs are designed to be selective: blocking estrogen receptors in some places while leaving others alone (or even activating them).

Enclomiphene specifically targets estrogen receptors in the hypothalamus and pituitary — the brain areas involved in hormone regulation. It's like a targeted mute button for just that one conversation, while letting all the other conversations in the body continue normally.

It's also worth knowing that Enclomiphene is the purified, active form of a compound called clomiphene. Clomiphene is a mixture; Enclomiphene is just the portion that does the relevant hormonal work, isolated for research precision.`
      }
    ],
    takeaway: "Enclomiphene acts like a targeted brake-remover for your hormonal system. By blocking estrogen sensors in the brain, it prevents the 'slow down' signal from reaching the pituitary — letting researchers observe the hormonal system operating without one of its normal feedback checks."
  },

  "what-is-oxytocin-peptide": {
    icon: Heart,
    iconColor: "#f43f5e",
    intro: `Oxytocin is a small, natural peptide that your brain produces and uses as a social signal. Popular science often calls it the "love hormone" or "bonding molecule" — and while those labels capture something real, the full story is more interesting. Oxytocin is woven into some of your brain's most fundamental circuits: the ones that make social connection feel rewarding, help you decide who to trust, and link positive experiences to the people you share them with.`,
    sections: [
      {
        title: "Two Jobs, One Molecule",
        content: `Oxytocin does double duty in your body — it works in two completely separate systems at the same time:

**The Body System** - Your brain releases oxytocin into the bloodstream through the pituitary gland. This affects physical processes throughout your body. It's the same oxytocin involved in childbirth contractions and breastfeeding — physical, peripheral effects.

**The Brain System** - Separately, oxytocin-producing neurons release it directly within the brain itself, where it acts as a signaling molecule between nerve cells. This is the system that affects behavior, emotions, trust, and social feelings.

Think of it like a radio station that broadcasts on two frequencies at once — one frequency reaches your body's tissues, and a different frequency carries messages within the brain's own internal networks. Researchers study these two systems separately because they serve very different purposes.`
      },
      {
        title: "How It Shapes Social Experience",
        content: `Within the brain, oxytocin primarily influences two things: how rewarding social experiences feel, and how you interpret social situations.

**Making Connection Feel Good** - The brain has reward circuits that generate feelings of pleasure — the same ones activated by food, music, or other enjoyable experiences. Oxytocin enhances how these circuits respond to positive social interactions. It essentially turns up the volume on the "this feels good" signal specifically in social contexts.

**Shaping Trust and Safety** - One region of the brain (the amygdala) is constantly scanning for threats — it's your built-in danger detector. Oxytocin can quiet this region during social situations, which is thought to shift how you interpret the people around you. Less alarm response, more openness.

**Social Memory** - Oxytocin also plays a role in remembering social experiences. It helps the brain attach emotional significance to specific interactions and encode them as meaningful.`
      },
      {
        title: "Why Researchers Study It",
        content: `Oxytocin is a valuable research tool precisely because social behavior is so complex and hard to study directly:

**A Window Into Social Circuits** - Oxytocin gives researchers a way to probe the brain circuits involved in social bonding. By observing what happens when these circuits are activated or blocked, scientists can map out how the brain builds and maintains social relationships.

**The Complexity Beneath the Label** - One thing researchers have learned is that oxytocin doesn't simply cause "bonding." Its effects depend on context, on who else is involved, and on which brain circuits are already active. Research is uncovering why the same molecule can have different — even opposite — effects depending on the situation.

**Connections to Other Systems** - Oxytocin's circuits overlap with other neurochemical systems in the brain. For example, studying how oxytocin interacts with dopamine reward pathways helps researchers understand why social connection can feel as rewarding as other pleasurable experiences. These intersection points are where some of the most interesting neuroscience happens.`
      }
    ],
    takeaway: "Oxytocin is a natural brain peptide that acts as a social signal. Researchers study it to understand how the brain makes social connection feel rewarding, how it shapes trust and threat perception, and how it interacts with other neurochemical systems that drive human behavior."
  },

  "what-is-slu-pp-332-peptide": {
    icon: Zap,
    iconColor: "#E7FB10",
    intro: `SLU-PP-332 is a first-in-class research compound known as an "exercise mimetic." While most peptides work like traditional hormones, SLU-PP-332 works like a "fitness switch" for your cells. It tells your body to act as if it's undergoing intense endurance training, triggering metabolic pathways usually reserved for high-intensity physical exertion even when the subject is at rest.`,
    sections: [
      {
        title: "The Exercise Mimetic Mechanism",
        content: `SLU-PP-332 works by activating Estrogen-Related Receptors (ERRs), specifically ERRα, ERRβ, and ERRγ. These receptors are like metabolic master switches that coordinate how your cells produce and use energy.

**Mitochondrial Biogenesis** - Activation triggers the creation of new mitochondria, the "power plants" of your cells. More mitochondria mean a higher capacity for energy production and oxygen utilization.

**Fat Oxidation** - It tells the body to prioritize burning fat for fuel. This mimics the "fat-adapted" metabolic state seen in elite endurance athletes who can sustain performance by tapping into lipid stores efficiently.

**Metabolic Efficiency** - By activating these pathways, SLU-PP-332 helps the body become more efficient at managing energy resources, which is a primary focus of metabolic research.`
      },
      {
        title: "Impact on Physical Capacity",
        content: `In research settings, SLU-PP-332 has shown remarkable effects on physical capacity and muscle architecture:

**Endurance Capacity** - Studies in sedentary models found that those treated with the compound could run significantly further and longer than untreated controls. In some treadmill tests, endurance increased by up to 70%.

**Muscle Fiber Shift** - One of its most fascinating effects is promoting a shift toward "slow-twitch" oxidative (Type I) muscle fibers. These are the red muscle fibers used for endurance that are naturally resistant to fatigue and high in mitochondrial density.

**Fatigue Resistance** - By increasing mitochondrial density and optimizing fat burning, the compound appears to delay the onset of exhaustion during physical exertion, effectively expanding the "aerobic window."`
      },
      {
        title: "Metabolic Health Research",
        content: `Beyond physical performance, scientists are investigating SLU-PP-332 for its systemic metabolic effects:

**Weight Management** - Research indicates it can reduce body fat mass even without changes in food intake, likely by increasing the body's baseline metabolic rate and thermogenic activity.

**Glucose Management** - Activation of ERR receptors is associated with improved insulin sensitivity and better blood sugar control, making it a subject of interest for metabolic syndrome and insulin resistance research.

**Cellular Protection** - Some studies examine whether the enhanced mitochondrial function provides protective effects against cellular stress and age-related metabolic decline.`
      },
      {
        title: "Why This Matters for Science",
        content: `The discovery of SLU-PP-332 represents a significant leap in understanding how we can chemically signal the body to adapt to exercise-like stress.

**Research Versatility** - It allows scientists to study the benefits of exercise in models that may not be able to perform physical activity, providing insights into muscle wasting and metabolic stagnation.

**Future Directions** - Current research is focused on long-term safety, the durability of metabolic shifts, and how ERR agonism compares to other metabolic pathways like GLP-1 or AMPK activation.`
      }
    ],
    takeaway: "SLU-PP-332 is a breakthrough exercise mimetic that activates ERR receptors to 'switch on' the benefits of endurance training at a cellular level—boosting mitochondria, enhancing fat burning, and significantly increasing physical endurance capacity."
  }
};

// ─── Per-article metadata (stats + category) ─────────────────────────────────

const ARTICLE_METADATA: Record<string, ArticleMetadata> = {
  "what-is-bpc-157-peptide": {
    category: "Tissue Repair",
    facts: [
      { icon: Dna, value: "15", label: "Amino acids" },
      { icon: FlaskConical, value: "Gastric juice", label: "Natural source" },
      { icon: Zap, value: "VEGF / NO", label: "Pathways studied" },
      { icon: Target, value: "Tissue repair", label: "Research area" },
    ],
  },
  "what-is-tb-500-peptide": {
    category: "Tissue Repair",
    facts: [
      { icon: Dna, value: "43", label: "Amino acids" },
      { icon: Activity, value: "Every cell", label: "Found in" },
      { icon: Zap, value: "Actin protein", label: "Main target" },
      { icon: Target, value: "Cell migration", label: "Key mechanism" },
    ],
  },
  "what-is-rr-a1-peptide": {
    category: "Metabolic",
    facts: [
      { icon: Target, value: "GLP-1R", label: "Receptor" },
      { icon: Clock, value: "~1 week", label: "Half-life" },
      { icon: Activity, value: "Weekly", label: "Research dosing" },
      { icon: Zap, value: "Insulin + satiety", label: "Key effects" },
    ],
  },
  "what-is-rr-a2-peptide": {
    category: "Metabolic",
    facts: [
      { icon: Target, value: "GLP-1R + GIPR", label: "Receptors" },
      { icon: Clock, value: "~5 days", label: "Half-life" },
      { icon: Zap, value: "Dual agonist", label: "Type" },
      { icon: Activity, value: "Twincretin", label: "Also called" },
    ],
  },
  "what-is-rr-a3-peptide": {
    category: "Metabolic",
    facts: [
      { icon: Target, value: "3 receptors", label: "Targets" },
      { icon: Zap, value: "Triple agonist", label: "Type" },
      { icon: Flame, value: "Glucagon added", label: "3rd pathway" },
      { icon: Activity, value: "Newest gen.", label: "Generation" },
    ],
  },
  "what-is-cjc-1295-peptide": {
    category: "Growth Hormone",
    facts: [
      { icon: Dna, value: "GHRH analog", label: "Type" },
      { icon: Clock, value: "Natural: 2 min", label: "GHRH half-life" },
      { icon: Activity, value: "Hours–weeks", label: "CJC-1295 duration" },
      { icon: Target, value: "GH → IGF-1", label: "Axis" },
    ],
  },
  "what-is-ipamorelin-peptide": {
    category: "Growth Hormone",
    facts: [
      { icon: Dna, value: "5", label: "Amino acids" },
      { icon: Target, value: "GHS-R", label: "Receptor" },
      { icon: Zap, value: "Ghrelin mimic", label: "Mechanism" },
      { icon: Activity, value: "High", label: "Selectivity" },
    ],
  },
  "what-is-tesamorelin-peptide": {
    category: "Growth Hormone",
    facts: [
      { icon: Dna, value: "44", label: "Amino acids" },
      { icon: Target, value: "GHRH analog", label: "Type" },
      { icon: Zap, value: "Trans-3-hexenoic", label: "Modification" },
      { icon: Activity, value: "Body composition", label: "Research focus" },
    ],
  },
  "what-is-epithalon-peptide": {
    category: "Longevity",
    facts: [
      { icon: Dna, value: "4", label: "Amino acids" },
      { icon: Target, value: "Pineal gland", label: "Origin" },
      { icon: Zap, value: "Telomerase", label: "Target enzyme" },
      { icon: Clock, value: "Longevity", label: "Research field" },
    ],
  },
  "what-is-semax-peptide": {
    category: "Cognitive",
    facts: [
      { icon: Dna, value: "7", label: "Amino acids" },
      { icon: Target, value: "ACTH (4–7)", label: "Derived from" },
      { icon: Clock, value: "~24 hours", label: "Half-life" },
      { icon: Zap, value: "Intranasal", label: "Administration" },
    ],
  },
  "what-is-ghk-cu-peptide": {
    category: "Skin & Repair",
    facts: [
      { icon: Dna, value: "3 AA + Cu²⁺", label: "Structure" },
      { icon: Activity, value: "200→80 ng/mL", label: "Age 20→60 levels" },
      { icon: Zap, value: ">4,000 genes", label: "Gene responses" },
      { icon: Target, value: "Skin & wound", label: "Research focus" },
    ],
  },
  "what-is-glow-peptide-complex": {
    category: "Skin & Repair",
    facts: [
      { icon: Dna, value: "Multi-peptide", label: "Type" },
      { icon: Target, value: "4 peptide classes", label: "Components" },
      { icon: Zap, value: "Synergistic", label: "Approach" },
      { icon: Activity, value: "Skin health", label: "Research focus" },
    ],
  },
  "what-is-klow-peptide-complex": {
    category: "Tissue Repair",
    facts: [
      { icon: Dna, value: "4 peptides", label: "Combined" },
      { icon: Target, value: "NF-κB", label: "Key pathway" },
      { icon: Zap, value: "KPV", label: "Anti-inflam. agent" },
      { icon: Activity, value: "PepT1", label: "Smart delivery" },
    ],
  },
  "what-is-igf-1-lr3-peptide": {
    category: "Growth Factor",
    facts: [
      { icon: Dna, value: "83", label: "Amino acids" },
      { icon: Zap, value: "+13 AA added", label: "Modification" },
      { icon: Clock, value: "~20–30 hrs", label: "Half-life" },
      { icon: Target, value: "↓ IGFBP binding", label: "Key effect" },
    ],
  },
  "what-is-igf-des-peptide": {
    category: "Growth Factor",
    facts: [
      { icon: Dna, value: "67", label: "Amino acids" },
      { icon: Zap, value: "−3 AA (N-term)", label: "Truncation" },
      { icon: Target, value: "Higher IGF-1R", label: "Receptor affinity" },
      { icon: Activity, value: "Brain & gut", label: "Naturally found" },
    ],
  },
  "what-is-mots-c-peptide": {
    category: "Metabolic",
    facts: [
      { icon: Dna, value: "16", label: "Amino acids" },
      { icon: Target, value: "Mitochondrial DNA", label: "Encoded by" },
      { icon: Zap, value: "AMPK", label: "Key target" },
      { icon: Activity, value: "Exercise mimic", label: "Effect type" },
    ],
  },
  "what-is-nad-precursor": {
    category: "Longevity",
    facts: [
      { icon: Activity, value: "Every cell", label: "Found in" },
      { icon: Zap, value: "~50% decline", label: "With age" },
      { icon: Target, value: "Sirtuins + PARPs", label: "Activates" },
      { icon: Dna, value: "NMN / NR", label: "Key precursors" },
    ],
  },
  "what-is-hcg-peptide": {
    category: "Reproductive",
    facts: [
      { icon: Dna, value: "237", label: "Amino acids" },
      { icon: Activity, value: "α + β subunits", label: "Structure" },
      { icon: Zap, value: "LH receptor", label: "Target" },
      { icon: Target, value: "LH mimic", label: "Mechanism" },
    ],
  },
  "reconstitution-101": {
    category: "Research Guide",
    facts: [
      { icon: FlaskConical, value: "BAC water", label: "Diluent used" },
      { icon: Zap, value: "Slow drip", label: "Key technique" },
      { icon: Activity, value: "4–6 weeks", label: "Once reconstituted" },
      { icon: Target, value: "Refrigerate", label: "After mixing" },
    ],
  },
  "storage-101": {
    category: "Research Guide",
    facts: [
      { icon: Target, value: "−20°C", label: "Powder storage" },
      { icon: Activity, value: "2–8°C", label: "Reconstituted" },
      { icon: Clock, value: "4–6 weeks", label: "Reconstituted life" },
      { icon: Zap, value: "Dark + dry", label: "Key conditions" },
    ],
  },
  "how-to-read-coas": {
    category: "Research Guide",
    facts: [
      { icon: Target, value: "≥95%", label: "Purity threshold" },
      { icon: Zap, value: "HPLC", label: "Purity test method" },
      { icon: Activity, value: "Mass spectrometry", label: "Identity test" },
      { icon: FlaskConical, value: "3rd-party lab", label: "Required source" },
    ],
  },
  "what-is-kisspeptin-peptide": {
    category: "Reproductive",
    facts: [
      { icon: Target, value: "KISS1R", label: "Receptor" },
      { icon: Zap, value: "GnRH trigger", label: "Effect" },
      { icon: Activity, value: "Puberty trigger", label: "Key role" },
      { icon: Dna, value: "Kp-10/13/14/54", label: "Multiple forms" },
    ],
  },
  "what-is-kisspeptin-54-peptide": {
    category: "Reproductive",
    facts: [
      { icon: Dna, value: "54", label: "Amino acids" },
      { icon: Clock, value: "28–35 min", label: "Half-life" },
      { icon: Target, value: "KISS1R", label: "Receptor" },
      { icon: Zap, value: "Larger LH pulse", label: "vs Kp-10" },
    ],
  },
  "what-is-pt-141-bremelanotide-peptide": {
    category: "Cognitive",
    facts: [
      { icon: Target, value: "MC3R + MC4R", label: "Receptors" },
      { icon: Zap, value: "CNS pathway", label: "Mechanism" },
      { icon: Activity, value: "Melanotan II", label: "Derived from" },
      { icon: Dna, value: "Cyclic structure", label: "Molecular form" },
    ],
  },
  "what-is-thymosin-alpha-1-peptide": {
    category: "Immune",
    facts: [
      { icon: Dna, value: "28", label: "Amino acids" },
      { icon: Target, value: "Thymus gland", label: "Origin" },
      { icon: Zap, value: "TLR9", label: "Signaling path" },
      { icon: Activity, value: "T-cell maturation", label: "Key role" },
    ],
  },
  "what-is-dsip-peptide": {
    category: "Cognitive",
    facts: [
      { icon: Dna, value: "9", label: "Amino acids" },
      { icon: Target, value: "Delta-wave sleep", label: "Named effect" },
      { icon: Zap, value: "HPA axis", label: "Stress pathway" },
      { icon: Activity, value: "Crosses BBB", label: "Notable property" },
    ],
  },
  "what-is-selank-peptide": {
    category: "Cognitive",
    facts: [
      { icon: Dna, value: "Tuftsin base", label: "Foundation" },
      { icon: Target, value: "GABA system", label: "CNS pathway" },
      { icon: Zap, value: "BDNF", label: "Growth factor effect" },
      { icon: Activity, value: "Intranasal", label: "Administration" },
    ],
  },
  "what-is-aod-9604-peptide": {
    category: "Metabolic",
    facts: [
      { icon: Dna, value: "AA 177–191 + Tyr", label: "HGH fragment" },
      { icon: Target, value: "Lipolysis", label: "Research focus" },
      { icon: Zap, value: "No IGF-1 rise", label: "Key difference vs GH" },
      { icon: Activity, value: "Fat metabolism", label: "Primary interest" },
    ],
  },
  "what-is-thymulin-peptide": {
    category: "Immune",
    facts: [
      { icon: Dna, value: "9", label: "Amino acids" },
      { icon: Target, value: "Requires zinc", label: "Activation" },
      { icon: Zap, value: "Thymus only", label: "Produced by" },
      { icon: Activity, value: "T-cell maturation", label: "Key role" },
    ],
  },
  "what-is-5-amino-1mq-peptide": {
    category: "Metabolic",
    facts: [
      { icon: Target, value: "NNMT enzyme", label: "Inhibits" },
      { icon: Zap, value: "NAD+ support", label: "Effect" },
      { icon: Activity, value: "Adipose tissue", label: "High NNMT expr." },
      { icon: Dna, value: "Small molecule", label: "Type" },
    ],
  },
  "what-is-dihexa-peptide": {
    category: "Cognitive",
    facts: [
      { icon: Target, value: "HGF/c-Met", label: "Pathway" },
      { icon: Zap, value: "7× BDNF", label: "Synapse potency" },
      { icon: Activity, value: "Oral", label: "Bioavailability" },
      { icon: Dna, value: "Angiotensin IV", label: "Derived from" },
    ],
  },
  "what-is-glutathione": {
    category: "Longevity",
    facts: [
      { icon: Dna, value: "3 AA", label: "Size" },
      { icon: Target, value: "Every cell", label: "Found in" },
      { icon: Zap, value: "GSH ↔ GSSG", label: "Redox cycle" },
      { icon: Activity, value: "Master antioxidant", label: "Role" },
    ],
  },
  "what-is-vitamin-b12": {
    category: "Research Guide",
    facts: [
      { icon: Target, value: "Cobalt atom", label: "Contains metal" },
      { icon: Zap, value: "Methylation", label: "Key role" },
      { icon: Activity, value: "Intrinsic factor", label: "Required for abs." },
      { icon: Clock, value: "Years stored", label: "Liver storage" },
    ],
  },
  "what-is-melanotan-peptide": {
    category: "Skin & Repair",
    facts: [
      { icon: Target, value: "MC1R (+ more)", label: "Receptors" },
      { icon: Zap, value: "α-MSH mimic", label: "Mimics" },
      { icon: Activity, value: "MT-I / MT-II", label: "Two variants" },
      { icon: Dna, value: "Melanin pigment", label: "Production target" },
    ],
  },
  "what-is-gonadorelin-peptide": {
    category: "Reproductive",
    facts: [
      { icon: Dna, value: "10", label: "Amino acids" },
      { icon: Target, value: "Exact GnRH copy", label: "Type" },
      { icon: Zap, value: "Pulsatile only", label: "Required pattern" },
      { icon: Activity, value: "HPG axis", label: "Controls" },
    ],
  },
  "what-is-slu-pp-332": {
    category: "Metabolic",
    facts: [
      { icon: Target, value: "ERRα / ERRβ / ERRγ", label: "Receptors" },
      { icon: Zap, value: "Endurance mimic", label: "Effect type" },
      { icon: Activity, value: "Mitochondria", label: "Key organelle" },
      { icon: Flame, value: "Fat oxidation", label: "Metabolic effect" },
    ],
  },
};

// ─── Peptide size scale data (amino acid counts) ──────────────────────────────

const ARTICLE_SIZE_AA: Record<string, number> = {
  "what-is-glutathione": 3,
  "what-is-epithalon-peptide": 4,
  "what-is-ipamorelin-peptide": 5,
  "what-is-semax-peptide": 7,
  "what-is-dsip-peptide": 9,
  "what-is-thymulin-peptide": 9,
  "what-is-gonadorelin-peptide": 10,
  "what-is-bpc-157-peptide": 15,
  "what-is-mots-c-peptide": 16,
  "what-is-thymosin-alpha-1-peptide": 28,
  "what-is-tb-500-peptide": 43,
  "what-is-tesamorelin-peptide": 44,
  "what-is-kisspeptin-54-peptide": 54,
  "what-is-igf-des-peptide": 67,
  "what-is-igf-1-lr3-peptide": 83,
  "what-is-hcg-peptide": 237,
};

// ─── Mechanism flow data ──────────────────────────────────────────────────────

const ARTICLE_FLOW: Record<string, FlowStep[]> = {
  "what-is-gonadorelin-peptide": [
    { label: "Hypothalamus", sublabel: "GnRH signal sent" },
    { label: "Pituitary Gland", sublabel: "LH & FSH released" },
    { label: "Gonads", sublabel: "Sex hormones made" },
  ],
  "what-is-kisspeptin-peptide": [
    { label: "Kisspeptin", sublabel: "Binds KISS1R" },
    { label: "GnRH neurons", sublabel: "Fire in hypothalamus" },
    { label: "Pituitary", sublabel: "LH & FSH surge" },
    { label: "Sex hormones", sublabel: "Produced in gonads" },
  ],
  "what-is-kisspeptin-54-peptide": [
    { label: "Kisspeptin-54", sublabel: "Binds KISS1R" },
    { label: "GnRH pulse", sublabel: "Triggered" },
    { label: "LH surge", sublabel: "Larger than Kp-10" },
    { label: "Sex hormones", sublabel: "Downstream effect" },
  ],
  "what-is-cjc-1295-peptide": [
    { label: "CJC-1295", sublabel: "GHRH analog signal" },
    { label: "Pituitary", sublabel: "GHRH-R activated" },
    { label: "Growth Hormone", sublabel: "GH pulse released" },
    { label: "IGF-1", sublabel: "Liver converts GH" },
  ],
  "what-is-ipamorelin-peptide": [
    { label: "Ipamorelin", sublabel: "Ghrelin mimic" },
    { label: "GHS-R", sublabel: "Receptor activated" },
    { label: "Pituitary", sublabel: "GH released selectively" },
    { label: "IGF-1", sublabel: "Downstream effect" },
  ],
  "what-is-epithalon-peptide": [
    { label: "Epithalon", sublabel: "4-amino acid signal" },
    { label: "Telomerase", sublabel: "Enzyme activated" },
    { label: "Telomeres", sublabel: "Protected / maintained" },
    { label: "Cell longevity", sublabel: "Research interest" },
  ],
  "what-is-mots-c-peptide": [
    { label: "MOTS-c", sublabel: "From mitochondrial DNA" },
    { label: "AMPK", sublabel: "Key sensor activated" },
    { label: "Mitochondria", sublabel: "Biogenesis increases" },
    { label: "Energy output", sublabel: "Enhanced capacity" },
  ],
  "what-is-nad-precursor": [
    { label: "NMN / NR", sublabel: "NAD+ precursor" },
    { label: "NAD+", sublabel: "Coenzyme produced" },
    { label: "Sirtuins / PARPs", sublabel: "Repair enzymes fire" },
    { label: "DNA repair", sublabel: "Cellular health restored" },
  ],
  "what-is-bpc-157-peptide": [
    { label: "BPC-157", sublabel: "From gastric juice" },
    { label: "VEGF pathway", sublabel: "Blood vessel growth" },
    { label: "Fibroblasts", sublabel: "Migrate to wound" },
    { label: "Tissue healed", sublabel: "Repair complete" },
  ],
  "what-is-5-amino-1mq-peptide": [
    { label: "5-Amino-1MQ", sublabel: "Blocks NNMT enzyme" },
    { label: "Nicotinamide", sublabel: "Not depleted" },
    { label: "NAD+ salvage", sublabel: "Pathway preserved" },
    { label: "NAD+ levels", sublabel: "Maintained in cells" },
  ],
  "what-is-ghk-cu-peptide": [
    { label: "GHK-Cu", sublabel: "Wound signal detected" },
    { label: ">4,000 genes", sublabel: "Respond" },
    { label: "Collagen / elastin", sublabel: "Synthesized" },
    { label: "Tissue renewal", sublabel: "Research outcome" },
  ],
  "what-is-igf-1-lr3-peptide": [
    { label: "IGF-1 LR3", sublabel: "83-amino acid signal" },
    { label: "IGFBP bypass", sublabel: "Binds less to carrier" },
    { label: "IGF-1R activated", sublabel: "Longer duration" },
    { label: "Anabolic signal", sublabel: "Cell response" },
  ],
  "what-is-semax-peptide": [
    { label: "Semax", sublabel: "7-amino acid peptide" },
    { label: "BDNF increase", sublabel: "Growth factor rises" },
    { label: "Neural signaling", sublabel: "Enhanced" },
    { label: "Plasticity", sublabel: "Research interest" },
  ],
  "what-is-dihexa-peptide": [
    { label: "Dihexa", sublabel: "HGF/c-Met agonist" },
    { label: "c-Met receptor", sublabel: "Activated" },
    { label: "Synaptogenesis", sublabel: "7× BDNF potency" },
    { label: "New connections", sublabel: "Neurons linked" },
  ],
  "what-is-tb-500-peptide": [
    { label: "TB-500", sublabel: "Binds actin protein" },
    { label: "Actin sequestered", sublabel: "Available for movement" },
    { label: "Cell migration", sublabel: "Cells move to site" },
    { label: "Tissue repair", sublabel: "Healing response" },
  ],
  "what-is-glutathione": [
    { label: "GSH (active)", sublabel: "Neutralizes free radicals" },
    { label: "GSSG (oxidized)", sublabel: "After donating electrons" },
    { label: "Glutathione reductase", sublabel: "Recycles GSSG → GSH" },
    { label: "GSH restored", sublabel: "Ready to protect again" },
  ],
};

export const SLUGS_WITH_QUICK_BREAKDOWN = Object.keys(beginnerArticles);

export function hasQuickBreakdown(slug: string | null): boolean {
  return slug ? SLUGS_WITH_QUICK_BREAKDOWN.includes(slug) : false;
}

export function getArticleIconColor(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return beginnerArticles[slug]?.iconColor ?? null;
}

export function getArticleIcon(slug: string | null | undefined): typeof Lightbulb | null {
  if (!slug) return null;
  return beginnerArticles[slug]?.icon ?? null;
}

// ─── Scroll progress hook ─────────────────────────────────────────────────────

function useScrollProgress(ref: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const calculate = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
    };
    window.addEventListener('scroll', calculate, { passive: true });
    calculate();
    return () => window.removeEventListener('scroll', calculate);
  }, [ref]);
  return progress;
}

// ─── Section type icon ────────────────────────────────────────────────────────

function getSectionIcon(title: string): typeof Target {
  const t = title.toLowerCase();
  if (t.includes('how') || t.includes('work') || t.includes('mechanism') || t.includes('design') || t.includes('pulsed')) return Zap;
  if (t.includes('research') || t.includes('application') || t.includes('focus') || t.includes('direction') || t.includes('use')) return Beaker;
  if (t.includes('why') || t.includes('unique') || t.includes('special') || t.includes('differ') || t.includes('matter') || t.includes('interest')) return Sparkles;
  if (t.includes('discover') || t.includes('origin') || t.includes('history') || t.includes('connection') || t.includes('tuftsin')) return Clock;
  if (t.includes('relay') || t.includes('axis') || t.includes('cascade') || t.includes('system') || t.includes('zinc')) return Activity;
  return Brain;
}

// ─── Quick stats strip ────────────────────────────────────────────────────────

function QuickStatStrip({ facts, iconColor }: { facts: ArticleStat[]; iconColor: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {facts.map((fact, i) => {
        const StatIcon = fact.icon;
        return (
          <div
            key={i}
            className="flex flex-col gap-1.5 px-4 py-3 rounded-xl"
            style={{ backgroundColor: `${iconColor}0e`, border: `1px solid ${iconColor}22` }}
          >
            <StatIcon className="h-3.5 w-3.5" style={{ color: iconColor }} />
            <span className="text-sm font-bold text-foreground leading-tight">{fact.value}</span>
            <span className="text-[11px] text-muted-foreground leading-tight">{fact.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Content parser ───────────────────────────────────────────────────────────

interface MechanismCard { term: string; description: string; }
interface ParsedBlock { type: "prose" | "cards" | "analogy"; prose?: string; cards?: MechanismCard[]; }

const ANALOGY_TRIGGERS = [
  /^think of it/i, /^think of /i, /^imagine /i,
  /^it's like /i, /^it is like /i,
  /^picture /i, /^just like /i,
];

function isAnalogyParagraph(text: string): boolean {
  return ANALOGY_TRIGGERS.some(re => re.test(text.trim()));
}

const CARD_LINE = /^\*\*([^*]+)\*\*\s*[-–]\s*(.+)/;

function parseSectionContent(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  for (const paragraph of content.split('\n\n')) {
    const lines = paragraph.split('\n').filter(l => l.trim() !== '');
    const cards: MechanismCard[] = [];
    const proseLines: string[] = [];
    for (const line of lines) {
      const m = line.trim().match(CARD_LINE);
      if (m) {
        cards.push({ term: m[1], description: m[2] });
      } else {
        proseLines.push(line);
      }
    }
    if (proseLines.length > 0) {
      const joined = proseLines.join(' ');
      blocks.push({ type: isAnalogyParagraph(joined) ? 'analogy' : 'prose', prose: joined });
    }
    if (cards.length > 0) {
      blocks.push({ type: 'cards', cards });
    }
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-foreground font-semibold">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function MechanismCardRow({
  term, description, iconColor, index,
}: {
  term: string; description: string; iconColor: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="flex items-start gap-3 px-4 py-3"
    >
      <div className="flex-shrink-0 mt-[6px]">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: iconColor, boxShadow: `0 0 0 3px ${iconColor}30` }}
        />
      </div>
      <div className="min-w-0 text-[15px]">
        <span className="font-semibold text-foreground">{term}</span>
        <span className="text-muted-foreground"> — {description}</span>
      </div>
    </motion.div>
  );
}

// ─── Analogy callout ──────────────────────────────────────────────────────────

function AnalogyCue({ text, iconColor }: { text: string; iconColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-4 px-5 rounded-xl my-2"
      style={{ backgroundColor: `${iconColor}12`, border: `1px solid ${iconColor}28` }}
    >
      <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
      <p className="text-[15px] leading-relaxed text-foreground/90 italic">
        {renderInline(text)}
      </p>
    </motion.div>
  );
}

// ─── Mechanism flow diagram ───────────────────────────────────────────────────

function FlowDiagram({ steps, iconColor }: { steps: FlowStep[]; iconColor: string }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-stretch gap-0 min-w-max">
        {steps.flatMap((step, i) => {
          const items = [
            <div
              key={`step-${i}`}
              className="flex flex-col items-center text-center px-4 py-3 rounded-xl flex-shrink-0"
              style={{
                backgroundColor: `${iconColor}12`,
                border: `1px solid ${iconColor}28`,
                minWidth: 100,
              }}
            >
              <span className="text-[12px] font-bold text-foreground leading-tight">{step.label}</span>
              <span className="text-[10px] text-muted-foreground mt-1 leading-tight">{step.sublabel}</span>
            </div>,
          ];
          if (i < steps.length - 1) {
            items.push(
              <div key={`arrow-${i}`} className="flex items-center flex-shrink-0 px-1.5">
                <ArrowRight className="h-3.5 w-3.5" style={{ color: `${iconColor}70` }} />
              </div>
            );
          }
          return items;
        })}
      </div>
    </div>
  );
}

// ─── Peptide size scale ───────────────────────────────────────────────────────

const SIZE_SCALE_MIN = 3;
const SIZE_SCALE_MAX = 237;

function PeptideSizeScale({ sizeAA, iconColor }: { sizeAA: number; iconColor: string }) {
  const pct = Math.max(0, Math.min(100, ((sizeAA - SIZE_SCALE_MIN) / (SIZE_SCALE_MAX - SIZE_SCALE_MIN)) * 100));
  return (
    <div className="px-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-muted-foreground">3 AA</span>
        <span className="text-[11px] font-semibold" style={{ color: iconColor }}>
          {sizeAA} amino acids
        </span>
        <span className="text-[10px] text-muted-foreground">237 AA</span>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ backgroundColor: `${iconColor}18` }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: `${iconColor}50` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2"
          style={{
            left: `${pct}%`,
            backgroundColor: iconColor,
            borderColor: 'hsl(var(--background))',
            boxShadow: `0 0 10px ${iconColor}90`,
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] text-muted-foreground/50">Epithalon</span>
        <span className="text-[9px] text-muted-foreground/50">← molecular size →</span>
        <span className="text-[9px] text-muted-foreground/50">HCG</span>
      </div>
    </div>
  );
}

// ─── Section dot timeline ─────────────────────────────────────────────────────

function SectionDotTimeline({
  sections,
  iconColor,
  passedSections,
}: {
  sections: { title: string }[];
  iconColor: string;
  passedSections: Set<number>;
}) {
  return (
    <div className="flex items-start gap-0">
      {sections.flatMap((section, i) => {
        const isPassed = passedSections.has(i);
        const lineIsPassed = isPassed && passedSections.has(i + 1);
        const items = [
          <div key={`dot-${i}`} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div
              className="w-3 h-3 rounded-full border-2 transition-all duration-500 flex-shrink-0"
              style={{
                backgroundColor: isPassed ? iconColor : 'transparent',
                borderColor: isPassed ? iconColor : `${iconColor}40`,
                boxShadow: isPassed ? `0 0 8px ${iconColor}70` : 'none',
              }}
            />
            <span
              className="text-[9px] text-center leading-tight line-clamp-2 px-1 transition-colors duration-500"
              style={{ color: isPassed ? iconColor : undefined }}
            >
              {section.title.split(' ').slice(0, 3).join(' ')}
            </span>
          </div>,
        ];
        if (i < sections.length - 1) {
          items.push(
            <div
              key={`line-${i}`}
              className="h-px self-start mt-1.5 flex-1 transition-all duration-500"
              style={{ backgroundColor: lineIsPassed ? `${iconColor}80` : `${iconColor}20` }}
            />
          );
        }
        return items;
      })}
    </div>
  );
}

// ─── Read time estimator ──────────────────────────────────────────────────────

function estimateReadTime(article: BeginnerArticle): number {
  const text = [
    article.intro,
    ...article.sections.map(s => s.content),
    article.takeaway,
  ].join(' ');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export function BeginnerContent({ slug, title }: BeginnerContentProps) {
  const article = beginnerArticles[slug];
  const meta = ARTICLE_METADATA[slug];
  const articleRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(articleRef);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [passedSections, setPassedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!article) return;
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setPassedSections(prev => {
              const next = new Set(prev);
              next.add(i);
              return next;
            });
          }
        },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [article?.sections.length]);

  if (!article) {
    return (
      <div className="p-6 bg-muted/30 rounded-lg border border-border">
        <p className="text-muted-foreground">
          Quick breakdown coming soon for this article.
        </p>
      </div>
    );
  }

  const Icon = article.icon;
  const { iconColor } = article;
  const facts = meta?.facts ?? [];
  const category = meta?.category ?? "";
  const sizeAA = ARTICLE_SIZE_AA[slug];
  const flow = ARTICLE_FLOW[slug];
  const readTime = estimateReadTime(article);

  const dividerRow = (label: string) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1" style={{ backgroundColor: `${iconColor}25` }} />
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: `${iconColor}90` }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: `${iconColor}25` }} />
    </div>
  );

  return (
    <div ref={articleRef} className="space-y-8" data-testid="beginner-article-content">

      {/* ── Article hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden relative"
        style={{ backgroundColor: `${iconColor}12`, border: `1px solid ${iconColor}25` }}
      >
        {/* Solid top accent stripe */}
        <div className="h-1 w-full" style={{ backgroundColor: iconColor }} />

        {/* Ambient glow behind icon */}
        <div
          className="absolute top-0 left-0 w-64 h-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 0% 50%, ${iconColor}22 0%, transparent 70%)`,
          }}
        />

        {/* Reading progress bar fills the bottom of the hero as you scroll */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5"
          style={{ backgroundColor: iconColor }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.08, ease: "linear" }}
        />

        <div className="relative p-6 flex gap-5 items-start">
          {/* Large icon in solid colored square */}
          <div
            className="flex-shrink-0 rounded-xl p-4 mt-0.5"
            style={{ backgroundColor: iconColor }}
          >
            <Icon className="h-8 w-8" style={{ color: "#0f0f12" }} />
          </div>

          <div className="min-w-0">
            {/* Category badge + read time */}
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              {category && (
                <span
                  className="inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${iconColor}22`, color: iconColor }}
                >
                  {category}
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Timer className="h-3 w-3" />
                {readTime} min read
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wide text-foreground mb-2 leading-tight">
              {title}
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {article.intro}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Quick stats strip ── */}
      {facts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {dividerRow("At a Glance")}
          <QuickStatStrip facts={facts} iconColor={iconColor} />
        </motion.div>
      )}

      {/* ── Peptide size scale ── */}
      {sizeAA !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          {dividerRow("Molecular Size")}
          <PeptideSizeScale sizeAA={sizeAA} iconColor={iconColor} />
        </motion.div>
      )}

      {/* ── Mechanism flow diagram ── */}
      {flow && flow.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {dividerRow("Mechanism")}
          <FlowDiagram steps={flow} iconColor={iconColor} />
        </motion.div>
      )}

      {/* ── Section dot timeline ── */}
      {article.sections.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          {dividerRow("Sections")}
          <SectionDotTimeline
            sections={article.sections}
            iconColor={iconColor}
            passedSections={passedSections}
          />
        </motion.div>
      )}

      {/* ── Sections ── */}
      {article.sections.map((section, index) => {
        const SectionIcon = getSectionIcon(section.title);
        return (
          <motion.div
            key={index}
            ref={el => { sectionRefs.current[index] = el; }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="space-y-4"
          >
            {/* Numbered header with section type icon */}
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 leading-none tabular-nums"
                style={{ backgroundColor: iconColor, color: "#0f0f12" }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <SectionIcon
                className="h-4 w-4 flex-shrink-0"
                style={{ color: `${iconColor}70` }}
              />
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-foreground">
                {section.title}
              </h2>
            </div>

            {/* Visual (where present) */}
            {section.visual && (
              <div className="my-6 rounded-xl overflow-hidden">
                {section.visual()}
              </div>
            )}

            {/* Content blocks */}
            <div className="space-y-3">
              {parseSectionContent(section.content).map((block, bIndex) =>
                block.type === 'analogy' ? (
                  <AnalogyCue key={bIndex} text={block.prose!} iconColor={iconColor} />
                ) : block.type === 'cards' ? (
                  <div
                    key={bIndex}
                    className="rounded-xl border divide-y divide-border/50"
                    style={{
                      borderColor: `${iconColor}30`,
                      backgroundColor: `${iconColor}0d`,
                    }}
                  >
                    {block.cards!.map((card, cIndex) => (
                      <MechanismCardRow
                        key={cIndex}
                        term={card.term}
                        description={card.description}
                        iconColor={iconColor}
                        index={cIndex}
                      />
                    ))}
                  </div>
                ) : (
                  <p key={bIndex} className="text-[15px] leading-relaxed text-muted-foreground">
                    {renderInline(block.prose!)}
                  </p>
                )
              )}
            </div>
          </motion.div>
        );
      })}

      {/* ── Key Takeaway — pull-quote ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl overflow-hidden relative"
        style={{ backgroundColor: `${iconColor}10`, border: `1px solid ${iconColor}35` }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: iconColor }}
        />
        <div className="relative pl-8 pr-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 flex-shrink-0" style={{ color: iconColor }} />
            <span
              className="text-xs tracking-widest uppercase font-bold"
              style={{ color: iconColor }}
            >
              Key Takeaway
            </span>
          </div>
          <p className="text-lg md:text-xl font-semibold text-foreground leading-snug">
            {article.takeaway}
          </p>
        </div>
      </motion.div>

    </div>
  );
}

export const BeginnerArticleContent = BeginnerContent;

export function WhatIsPeptideSection() {
  return (
    <div className="p-6 bg-gradient-to-br from-[#21d8ff]/10 to-[#9d4edd]/10 rounded-xl border border-[#21d8ff]/20">
      <h3 className="text-lg font-semibold text-foreground mb-3">What Are Peptides?</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Peptides are short chains of amino acids - the same building blocks that make up proteins, 
        just in smaller packages. Think of amino acids as individual LEGO bricks. When you connect 
        just a few bricks together (2-50 or so), you have a peptide. Scientists study synthetic 
        versions of these peptides to understand how biological signaling systems work.
      </p>
    </div>
  );
}
