import { motion, useScroll, useTransform } from "framer-motion";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";
import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ChevronDown,
  FlaskConical,
  GraduationCap,
  BookOpen,
  Award,
  Zap,
  FileCheck,
  Beaker,
  Thermometer,
} from "lucide-react";
import heroBackground from "@assets/69bf34cc-d177-46c6-af24-c51da5ee10fa_1764382400961.png";
import { trackEvent } from "@/lib/analytics";
import { SEOHead } from "@/components/seo-head";
import { MolecularDNAVisual } from "@/components/home/molecular-dna-visual";
import { TestingPipelineVisual } from "@/components/home/testing-pipeline-visual";
import { WhyResearchersChooseUs } from "@/components/home/why-researchers-choose-us";
import { StackBuilderTeaser } from "@/components/home/stack-builder-teaser";
import MistBackground from "@/components/home/mist-background";
import { MobilePipelineStrip } from "@/components/home/mobile-pipeline-strip";
import { MobileScienceStats } from "@/components/home/mobile-science-stats";

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const imageOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  const handleScrollClick = () => {
    const nextSection = document.getElementById('why-researchers');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[95vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ y, scale, opacity: imageOpacity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroBackground} 
          alt="Revive Research peptide laboratory with molecular structure visualization - premium research compounds"
          className="w-full h-full object-cover object-center"
          data-testid="img-hero-background"
        />
      </motion.div>
      {/* WebGL Mist Background - hidden on mobile for performance */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none hidden md:block">
        <MistBackground />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background z-[2]" />
      {/* Glow effects - smaller on mobile, full on desktop */}
      <div className="absolute inset-0 overflow-hidden z-[3] pointer-events-none">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-[#21d8ff]/10 rounded-full blur-[80px] md:blur-[150px]"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[150px] h-[150px] md:w-[400px] md:h-[400px] bg-[#E7FB10]/10 rounded-full blur-[60px] md:blur-[120px]"
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      <motion.div
        style={{ opacity }}
        className="relative z-[10] max-w-6xl mx-auto px-4 md:px-8 text-center flex flex-col items-center justify-center h-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl leading-tight"
            data-testid="text-hero-headline"
          >
            Everyone sells peptides.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7FB10] via-white to-[#21d8ff]">Nobody teaches them.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg"
          data-testid="text-hero-subheadline"
        >
          Know what you're researching. Know what works together. Know what's in the vial. Before you spend a dollar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <Link href="/peptides" onClick={() => trackEvent('hero_cta_click', 'engagement', 'shop_peptides')}>
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-md bg-[#E7FB10]/10 opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <Button size="lg" className="relative font-display text-base sm:text-lg px-6 sm:px-10 gap-2 bg-[#E7FB10] text-black border-2 border-[#E7FB10] shadow-[0_0_30px_rgba(231,251,16,0.4)] md:hover:shadow-[0_0_50px_rgba(231,251,16,0.6)] transition-all duration-300" data-testid="button-hero-shop">
                Shop Peptides
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Link>
          <Link href="/guides/peptide-education-center" onClick={() => trackEvent('hero_cta_click', 'engagement', 'learn_peptides')}>
            <Button size="lg" variant="outline" className="font-display text-base sm:text-lg px-6 sm:px-10 bg-transparent border-[#ec4899]/50 text-[#ec4899] hover:bg-[#ec4899]/10 hover:border-[#ec4899] transition-all duration-300" data-testid="button-hero-learn">
              Learn First
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.button
          onClick={handleScrollClick}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-colors cursor-pointer hover-elevate"
          data-testid="button-scroll-down"
          aria-label="Scroll to products"
        >
          <ChevronDown className="h-6 w-6 text-white" />
        </motion.button>
      </motion.div>
    </section>
  );
}

// Education categories for teaser - 4 items to match Academy modules
const educationCategories = [
  { name: "Peptide Profiles", description: "In-depth compound guides", icon: FlaskConical, color: "#ec4899" },
  { name: "Research Basics", description: "Foundational knowledge", icon: Beaker, color: "#21d8ff" },
  { name: "Understanding COAs", description: "Certificate interpretation", icon: FileCheck, color: "#9d4edd" },
  { name: "Storage & Handling", description: "Best practices for labs", icon: Thermometer, color: "#f97316" },
];

// Academy modules for teaser
const academyModules = [
  { name: "Orientation", description: "Peptide fundamentals & legal compliance", color: "#21d8ff" },
  { name: "Core Foundations", description: "Purity, storage & reconstitution", color: "#E7FB10" },
  { name: "Research Skills", description: "COA interpretation & lab safety", color: "#9d4edd" },
  { name: "Lab Confidence", description: "Real-world research workflows", color: "#22c55e" },
];

function EducationTeaser() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-[#21d8ff]/5 to-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9d4edd]/10 border border-[#9d4edd]/30 mb-4">
            <GraduationCap className="h-4 w-4 text-[#9d4edd]" />
            <span className="text-sm font-medium text-[#9d4edd]">Free Educational Resources</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Learn Before You <span className="text-[#21d8ff]">Research</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Access our comprehensive library of guides, interactive courses, and expert knowledge — all designed to make you a more informed researcher.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Research Academy Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 border-[#21d8ff]/50 bg-gradient-to-br from-[#21d8ff]/10 to-transparent transition-all duration-300 overflow-visible" style={{ boxShadow: '0 0 25px rgba(33, 216, 255, 0.25), inset 0 0 20px rgba(33, 216, 255, 0.05)', animation: 'pulse-glow-cyan 2.5s ease-in-out infinite' }}>
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-center">
                  <div className="p-3 sm:p-4 rounded-xl bg-[#21d8ff]/20 border border-[#21d8ff]/40">
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-[#21d8ff]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#21d8ff]">RESEARCH ACADEMY</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Gamified learning experience</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center">
                  <Badge className="text-xs bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
                    <BookOpen className="h-3 w-3 mr-1" /> 4 Modules
                  </Badge>
                  <Badge className="text-xs bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30">
                    <Zap className="h-3 w-3 mr-1" /> 17 Lessons
                  </Badge>
                  <Badge className="text-xs bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 hidden sm:inline-flex">
                    <Award className="h-3 w-3 mr-1" /> Earn XP & Badges
                  </Badge>
                </div>

                {/* Modules Preview - list on sm+, pill grid on mobile */}
                <div className="hidden sm:block space-y-3 mb-6">
                  {academyModules.map((module, index) => (
                    <motion.div
                      key={module.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: module.color }}
                      />
                      <div className="flex-1">
                        <span className="font-medium text-sm">{module.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {module.description}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Mobile module pills — 2×2 grid */}
                <div className="grid grid-cols-2 gap-2 mb-6 sm:hidden">
                  {academyModules.slice(0, 4).map((module, index) => (
                    <motion.div
                      key={module.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + index * 0.07 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: module.color }}
                      />
                      <span className="text-xs font-medium truncate">{module.name}</span>
                    </motion.div>
                  ))}
                </div>

                <Link href="/academy" onClick={() => trackEvent('education_cta_click', 'engagement', 'academy')}>
                  <Button 
                    className="w-full font-display gap-2 bg-[#21d8ff] text-black transition-all duration-300 md:hover:scale-105 md:active:scale-105 md:hover:shadow-[0_0_25px_rgba(33,216,255,0.6)]" 
                    data-testid="button-start-academy"
                  >
                    Start Learning
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Education Center Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-[#9d4edd]/50 bg-gradient-to-br from-[#9d4edd]/10 to-transparent transition-all duration-300 overflow-visible" style={{ boxShadow: '0 0 25px rgba(157, 78, 221, 0.25), inset 0 0 20px rgba(157, 78, 221, 0.05)', animation: 'pulse-glow-purple 2.5s ease-in-out infinite' }}>
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-center">
                  <div className="p-3 sm:p-4 rounded-xl bg-[#9d4edd]/20 border border-[#9d4edd]/40">
                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#9d4edd]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#9d4edd]">EDUCATION CENTER</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Comprehensive article library</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center">
                  <Badge className="text-xs bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30">
                    40+ Articles
                  </Badge>
                  <Badge className="text-xs bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
                    Interactive Visuals
                  </Badge>
                  <Badge className="text-xs bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30 hidden sm:inline-flex">
                    Expert Written
                  </Badge>
                </div>

                {/* Categories Preview - Hidden on mobile for compact view */}
                <div className="hidden sm:block space-y-3 mb-6">
                  {educationCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" style={{ color: category.color }} />
                        <div className="flex-1">
                          <span className="font-medium text-sm">{category.name}</span>
                          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">— {category.description}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <Link href="/guides/peptide-education-center" onClick={() => trackEvent('education_cta_click', 'engagement', 'education_center')}>
                  <Button 
                    className="w-full font-display gap-2 bg-[#9d4edd] text-white transition-all duration-300 md:hover:scale-105 md:active:scale-105 md:hover:shadow-[0_0_25px_rgba(157,78,221,0.6)]" 
                    data-testid="button-browse-articles"
                  >
                    Browse Articles
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground text-sm">
            New to peptide research?{" "}
            <Link href="/guides/peptide-education-center" className="text-[#ec4899] hover:underline cursor-pointer" data-testid="link-beginners-guide">
              Try our beginner-friendly Quick Breakdown mode
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const hoverCapable = useHoverCapable();
  return (
    <section className="py-16 md:py-20 text-primary-foreground bg-[#e7fb10]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Begin Your Research?
          </h2>
          <p className="text-base opacity-80 mb-8 max-w-2xl mx-auto">
            Join researchers worldwide who trust Revive for premium quality compounds backed by rigorous testing and verification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/peptides">
              <motion.div
                whileHover={hoverIf(hoverCapable, { scale: 1.05 })}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="font-display text-base px-8 gap-2 bg-[#21d8ff] text-black transition-all duration-300 md:hover:shadow-[0_0_20px_rgba(33,216,255,0.6)]"
                >
                  Browse Peptides
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/affiliate">
              <motion.div
                whileHover={hoverIf(hoverCapable, { scale: 1.05 })}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  className="font-display text-base px-8 bg-[#1a1a1f] text-white font-bold transition-all duration-300 md:hover:shadow-[0_0_30px_rgba(26,26,31,0.6)]"
                  data-testid="button-join-affiliate"
                >
                  Join Affiliate Program
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <SEOHead title="Home" description={`Shop third-party tested peptides for scientific research. GMP-certified compounds with Certificates of Analysis. Free shipping over $${FREE_SHIPPING_THRESHOLD}.`} canonicalPath="/" />
      <HeroSection />
      {/* MolecularDNAVisual - hidden on mobile; MobileScienceStats shown instead */}
      <div className="hidden md:block">
        <MolecularDNAVisual />
      </div>
      <div className="block md:hidden py-10 px-4">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">
            Precision Engineered Peptides
          </p>
          <MobileScienceStats />
        </div>
      </div>
      {/* TestingPipelineVisual - hidden on mobile; MobilePipelineStrip shown instead */}
      <div className="hidden md:block">
        <TestingPipelineVisual />
      </div>
      <div className="block md:hidden py-10 px-4">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">
            Quality Assurance Pipeline
          </p>
          <MobilePipelineStrip />
        </div>
      </div>
      <EducationTeaser />
      <StackBuilderTeaser />
      <div id="why-researchers">
        <WhyResearchersChooseUs />
      </div>
      <CTASection />
    </main>
  );
}
