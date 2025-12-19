import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ChevronDown,
  FlaskConical,
} from "lucide-react";
import heroBackground from "@assets/69bf34cc-d177-46c6-af24-c51da5ee10fa_1764382400961.png";
import { trackEvent } from "@/lib/analytics";
import { SEOHead } from "@/components/seo-head";
import { MolecularDNAVisual } from "@/components/home/molecular-dna-visual";
import { TestingPipelineVisual } from "@/components/home/testing-pipeline-visual";
import { WhyResearchersChooseUs } from "@/components/home/why-researchers-choose-us";

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const imageOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const overlayY = useTransform(scrollY, [0, 600], [0, -80]);

  const handleScrollClick = () => {
    const nextSection = document.getElementById('why-researchers');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ y, scale, opacity: imageOpacity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroBackground} 
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </motion.div>
      {/* Animated overlays - hidden on mobile for performance */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none hidden md:block">
        <motion.div
          className="absolute -left-1/4 bottom-0 w-[150%] h-[60%] opacity-40"
          style={{
            background: "radial-gradient(ellipse at center, rgba(100,100,120,0.4) 0%, transparent 70%)",
            filter: "blur(40px)",
            y: overlayY,
          }}
          animate={{
            x: ["-10%", "10%", "-10%"],
            y: ["0%", "-5%", "0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-0 w-[150%] h-[50%] opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(80,90,110,0.5) 0%, transparent 65%)",
            filter: "blur(50px)",
            y: overlayY,
          }}
          animate={{
            x: ["10%", "-15%", "10%"],
            y: ["0%", "-8%", "0%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
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
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-[#E7FB10]/30 text-sm font-medium tracking-wide text-[#e7fb10]">
            <FlaskConical className="h-4 w-4" />
            Research Grade Compounds
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1 
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl leading-tight"
            data-testid="text-hero-headline"
          >
            The Future of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7FB10] via-white to-[#21d8ff] animate-pulse">Research Compounds</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg"
          data-testid="text-hero-subheadline"
        >
          Third-party tested. QR-verifiable. Built for researchers who demand transparency.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/peptides" onClick={() => trackEvent('hero_cta_click', 'engagement', 'shop_peptides')}>
            <Button size="lg" className="font-display text-base sm:text-lg px-6 sm:px-10 gap-2 bg-[#E7FB10] text-black border-2 border-[#E7FB10] shadow-[0_0_30px_rgba(231,251,16,0.4)] hover:shadow-[0_0_50px_rgba(231,251,16,0.6)] transition-all duration-300" data-testid="button-hero-shop">
              Shop Peptides
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/coa">
            <Button size="lg" variant="outline" className="font-display text-base sm:text-lg px-6 sm:px-10 bg-black/30 backdrop-blur-sm border-white/30 text-white transition-all duration-300 hover:bg-[#21d8ff] hover:text-black hover:border-[#21d8ff]" data-testid="button-hero-coa">
              Verify COA
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8"
        >
          <Link href="/education" onClick={() => trackEvent('hero_cta_click', 'engagement', 'learn_peptides')}>
            <Button size="lg" variant="outline" className="font-display text-base sm:text-lg px-6 sm:px-10 bg-transparent border-[#ec4899]/50 text-[#ec4899] hover:bg-[#ec4899]/10 hover:border-[#ec4899] transition-all duration-300" data-testid="button-hero-learn">
              New to Peptides? Start Here
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

function CTASection() {
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="font-display text-base px-8 gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(33,216,255,0.4)]"
                >
                  Browse Peptides
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/affiliate">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  className="font-display text-base px-8 bg-[#21d8ff] text-black font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(33,216,255,0.6)] hover:bg-[#21d8ff]/90"
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
      <SEOHead title="Premium Peptide Research Compounds" description="Shop third-party tested peptides for scientific research. GMP-certified compounds with Certificates of Analysis. Free shipping over $175." canonicalPath="/" />
      <HeroSection />
      {/* MolecularDNAVisual - hidden on mobile for performance */}
      <div className="hidden md:block">
        <MolecularDNAVisual />
      </div>
      {/* TestingPipelineVisual - hidden on mobile (too complex) */}
      <div className="hidden md:block">
        <TestingPipelineVisual />
      </div>
      <div id="why-researchers">
        <WhyResearchersChooseUs />
      </div>
      <CTASection />
    </main>
  );
}
