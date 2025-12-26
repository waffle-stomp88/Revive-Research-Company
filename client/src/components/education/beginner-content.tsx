import { motion } from "framer-motion";
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
  Shield
} from "lucide-react";
import { 
  SimplePurityMeter, 
  COASimplified, 
  StorageBasics,
  WhatIsPeptideVisual
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
  // ==========================================
  // PEPTIDE PROFILE ARTICLES - Beginner Versions
  // ==========================================

  "bpc-157-research-guide": {
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

  "tb-500-research-guide": {
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

  "semaglutide-research-guide": {
    icon: Target,
    iconColor: "#E7FB10",
    intro: `Semaglutide is a GLP-1 receptor agonist - a peptide that mimics a hormone your body naturally produces after eating. The natural hormone (GLP-1) breaks down in just minutes, but scientists modified semaglutide to last much longer, making it valuable for metabolic research.`,
    sections: [
      {
        title: "Understanding GLP-1",
        content: `When you eat a meal, your gut releases a hormone called GLP-1 (glucagon-like peptide-1). This hormone does several things:

**Tells your pancreas to release insulin** - Insulin helps your cells absorb sugar from your bloodstream.

**Signals fullness to your brain** - GLP-1 communicates with appetite centers, helping you feel satisfied after eating.

**Slows stomach emptying** - Food stays in your stomach longer, contributing to that "full" feeling.

The problem for researchers was that natural GLP-1 breaks down in just 1-2 minutes. That's too fast to study effectively. Semaglutide was designed to resist this breakdown, lasting about a week instead of minutes.`
      },
      {
        title: "How Semaglutide Was Designed",
        content: `Scientists made specific modifications to create semaglutide:

**Amino Acid Changes** - They swapped out certain amino acids that the body's enzymes typically target for breakdown.

**Fatty Acid Addition** - They attached a fatty acid chain to the peptide. This fatty acid binds to a protein in your blood called albumin, which acts like a protective taxi, shielding the peptide from breakdown.

**The Result** - These modifications extended the half-life from minutes to about a week, allowing once-weekly research protocols.

This is a great example of how understanding a molecule's structure lets scientists engineer improved versions for research purposes.`
      },
      {
        title: "What Researchers Investigate",
        content: `Semaglutide has become one of the most-studied peptides in metabolic research:

**Glucose Regulation** - How GLP-1 receptor activation affects blood sugar control is a major research focus.

**Appetite and Satiety** - Scientists study how activation of brain GLP-1 receptors influences eating behavior and feelings of fullness.

**Cardiovascular Effects** - There's research into how GLP-1 agonists might affect heart and blood vessel function.

**Comparative Studies** - Researchers compare semaglutide with newer dual and triple agonists (like tirzepatide and retatrutide) to understand how targeting additional receptors changes the response.

The extensive research on semaglutide has made it a foundational peptide for understanding incretin-based metabolic pathways.`
      }
    ],
    takeaway: "Semaglutide mimics GLP-1, a natural gut hormone that affects insulin release, appetite, and digestion. It's been engineered to last about a week instead of minutes, making it valuable for metabolic research."
  },

  "tirzepatide-research-guide": {
    icon: Zap,
    iconColor: "#9d4edd",
    intro: `Tirzepatide takes the GLP-1 concept a step further - it's a dual agonist that activates both GLP-1 and GIP receptors. GIP is another gut hormone that works alongside GLP-1 in regulating metabolism. By targeting both, researchers can study what happens when you activate two complementary pathways simultaneously.`,
    sections: [
      {
        title: "Why Two Receptors?",
        content: `Your gut produces multiple hormones after you eat, and they work together like a team:

**GLP-1** (which semaglutide targets) - Promotes insulin release, slows digestion, signals fullness to the brain.

**GIP** (glucose-dependent insulinotropic polypeptide) - Also promotes insulin release, and has effects on fat tissue and bone health.

For years, researchers focused mainly on GLP-1. But GIP was actually discovered first, and scientists wondered: what if you could activate both systems at once? Would the effects be additive? Synergistic? That's what tirzepatide was designed to explore.`
      },
      {
        title: "How Tirzepatide Works",
        content: `Tirzepatide is sometimes called a "twincretin" because it activates two incretin receptors:

**Unbalanced Agonism** - Interestingly, tirzepatide doesn't activate both receptors equally. It has stronger GIP activity relative to its GLP-1 activity. Researchers study how this ratio affects outcomes.

**Long-Acting Design** - Like semaglutide, tirzepatide has a fatty acid attached that extends its duration in the body to about 5 days, allowing once-weekly dosing in research settings.

**Complementary Pathways** - By activating both GIP and GLP-1 receptors, tirzepatide engages two related but distinct signaling pathways. Researchers study whether this dual activation produces effects different from single-receptor activation.`
      },
      {
        title: "Research Directions",
        content: `Tirzepatide has opened new avenues for metabolic research:

**Comparative Studies** - How do results differ between single GLP-1 agonists and dual GLP-1/GIP agonists? This is a key research question.

**Mechanism Exploration** - Scientists work to understand how GIP and GLP-1 signals interact at the cellular level.

**Fat Tissue Effects** - GIP has specific effects on adipose (fat) tissue that pure GLP-1 agonists lack. Researchers explore these differences.

**Dosing Optimization** - Finding optimal ratios of GIP to GLP-1 activity is an ongoing research interest.

Tirzepatide represents a shift from single-target to multi-target approaches in metabolic peptide research.`
      }
    ],
    takeaway: "Tirzepatide activates two gut hormone receptors (GLP-1 and GIP) instead of just one. This dual approach lets researchers study how these complementary metabolic pathways work together."
  },

  "retatrutide-research-guide": {
    icon: Flame,
    iconColor: "#f97316",
    intro: `Retatrutide is the newest generation of metabolic peptides - a triple agonist that activates GLP-1, GIP, AND glucagon receptors. While semaglutide targets one receptor and tirzepatide targets two, retatrutide targets three, representing the cutting edge of incretin research.`,
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
        content: `Retatrutide activates three receptors with carefully balanced activity:

**GLP-1** - The familiar pathway affecting insulin, appetite, and digestion.

**GIP** - The additional incretin pathway with effects on fat tissue.

**Glucagon** - The energy expenditure and fat breakdown pathway.

The challenge for scientists was designing a single molecule that could engage all three receptors appropriately. Too much glucagon activity could cause problems; too little would negate the benefits of adding it.

Retatrutide represents years of molecular engineering to achieve a specific activity profile across all three targets.`
      },
      {
        title: "Current Research Focus",
        content: `As the newest of the incretin agonists, retatrutide research is actively expanding:

**Comparative Studies** - How do triple agonist effects compare to dual and single agonists? Early research suggests potentially additive benefits.

**Safety Research** - With three receptor targets, understanding the full effect profile is crucial.

**Mechanism Studies** - Scientists work to understand how the three pathways interact at cellular and systemic levels.

**Optimization** - Finding the right balance of activity at each receptor remains an active area of investigation.

Retatrutide represents where the field of incretin research is heading - toward multi-target approaches that address metabolism from multiple angles simultaneously.`
      }
    ],
    takeaway: "Retatrutide is a triple agonist targeting GLP-1, GIP, and glucagon receptors. Adding glucagon brings energy expenditure and fat breakdown pathways into the research picture, creating a more comprehensive metabolic research tool."
  },

  "cjc-1295-research-guide": {
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

  "ipamorelin-research-guide": {
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

  "tesamorelin-research-guide": {
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

  "epithalon-research-guide": {
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

  "semax-research-guide": {
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

  "ghk-cu-research-guide": {
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

  "glow-peptide-complex-research-guide": {
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

  "klow-peptide-complex-research-guide": {
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

  "igf-1-lr3-research-guide": {
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

  "mots-c-research-guide": {
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

  "nad-precursor-research-guide": {
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

  "hcg-research-guide": {
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
      }
    ],
    takeaway: "Always check the purity percentage on your COA before starting any research. For most applications, look for 98% or higher purity to ensure reliable, reproducible results."
  },

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

  "kisspeptin-research-guide": {
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

  "pt-141-bremelanotide-research-guide": {
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

  "thymosin-alpha-1-research-guide": {
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

  "dsip-research-guide": {
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

  "selank-research-guide": {
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

  "aod-9604-research-guide": {
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

  "thymulin-research-guide": {
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

  "5-amino-1mq-research-guide": {
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

  "dihexa-research-guide": {
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

  "glutathione-research-guide": {
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

  "vitamin-b12-research-guide": {
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

  "melanotan-research-guide": {
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

  "slu-pp-332-research-guide": {
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

export const SLUGS_WITH_QUICK_BREAKDOWN = Object.keys(beginnerArticles);

export function hasQuickBreakdown(slug: string | null): boolean {
  return slug ? SLUGS_WITH_QUICK_BREAKDOWN.includes(slug) : false;
}

export function BeginnerContent({ slug, title }: BeginnerContentProps) {
  const article = beginnerArticles[slug];
  
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

  return (
    <div className="space-y-8" data-testid="beginner-article-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 items-start"
      >
        <div 
          className="p-3 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${article.iconColor}20` }}
        >
          <Icon className="h-6 w-6" style={{ color: article.iconColor }} />
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {article.intro}
        </p>
      </motion.div>

      {article.sections.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * (index + 1) }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: article.iconColor }} />
            {section.title}
          </h2>
          
          {section.visual && (
            <div className="my-6">
              {section.visual()}
            </div>
          )}
          
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {section.content.split('\n\n').map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-4">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/30"
      >
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-[#21d8ff] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-[#21d8ff] mb-1">Key Takeaway</h3>
            <p className="text-sm text-muted-foreground">{article.takeaway}</p>
          </div>
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
