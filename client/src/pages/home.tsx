import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  ChevronDown, 
  Shield, 
  Beaker, 
  Award, 
  Truck,
  CheckCircle,
  FlaskConical,
  Microscope,
  FileCheck,
  Eye,
  Target,
  BookOpen,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import heroBackground from "@assets/69bf34cc-d177-46c6-af24-c51da5ee10fa_1764382400961.png";
import researchLabImage from "@assets/generated_images/neon_peptide_research_lab.png";
import { AnimatedTrustStats } from "@/components/infographics/animated-stats";
import { VerificationJourney } from "@/components/infographics/verification-journey";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const trustMetrics = [
  { icon: Shield, value: "99.9%", label: "Purity Verified" },
  { icon: Beaker, value: "3rd Party", label: "Lab Tested" },
  { icon: Award, value: "GMP", label: "Certified" },
  { icon: Truck, value: "24hr", label: "Shipping" },
];

const howItWorks = [
  {
    step: "01",
    icon: Beaker,
    title: "Premium Synthesis",
    description: "Our compounds are synthesized using industry-leading methods and quality raw materials."
  },
  {
    step: "02",
    icon: Microscope,
    title: "Rigorous Testing",
    description: "Every batch undergoes comprehensive third-party testing for purity and potency verification."
  },
  {
    step: "03",
    icon: FileCheck,
    title: "COA Verified",
    description: "Each product ships with a Certificate of Authenticity you can verify on our platform."
  },
];

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const imageOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
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
      {/* Animated Smoke Effects */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {/* Smoke Layer 1 - Slow drift left to right */}
        <motion.div
          className="absolute -left-1/4 bottom-0 w-[150%] h-[60%] opacity-40"
          style={{
            background: "radial-gradient(ellipse at center, rgba(100,100,120,0.4) 0%, transparent 70%)",
            filter: "blur(40px)",
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
        
        {/* Smoke Layer 2 - Slower drift right to left */}
        <motion.div
          className="absolute -right-1/4 bottom-0 w-[150%] h-[50%] opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(80,90,110,0.5) 0%, transparent 65%)",
            filter: "blur(50px)",
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
        
        {/* Smoke Layer 3 - Rising wisps */}
        <motion.div
          className="absolute left-1/4 bottom-0 w-[80%] h-[70%] opacity-25"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(60,70,90,0.6) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
          animate={{
            y: ["0%", "-15%", "0%"],
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Smoke Layer 4 - Subtle top haze */}
        <motion.div
          className="absolute top-0 left-0 w-full h-[40%] opacity-20"
          style={{
            background: "linear-gradient(to bottom, rgba(50,60,80,0.4) 0%, transparent 100%)",
            filter: "blur(30px)",
          }}
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Smoke Layer 5 - Side wisps left */}
        <motion.div
          className="absolute -left-20 bottom-1/4 w-[400px] h-[400px] opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(70,80,100,0.5) 0%, transparent 70%)",
            filter: "blur(45px)",
          }}
          animate={{
            x: ["-20%", "30%", "-20%"],
            y: ["-10%", "10%", "-10%"],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        
        {/* Smoke Layer 6 - Side wisps right */}
        <motion.div
          className="absolute -right-20 bottom-1/3 w-[350px] h-[350px] opacity-25"
          style={{
            background: "radial-gradient(ellipse at center, rgba(90,100,120,0.4) 0%, transparent 65%)",
            filter: "blur(50px)",
          }}
          animate={{
            x: ["20%", "-25%", "20%"],
            y: ["5%", "-15%", "5%"],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </div>
      {/* Dark overlay gradient - subtle to preserve vial logo */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background z-[2]" />
      {/* Neon glow effects */}
      <div className="absolute inset-0 overflow-hidden z-[3] pointer-events-none">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#21d8ff]/10 rounded-full blur-[150px]"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#E7FB10]/10 rounded-full blur-[120px]"
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      {/* Content - Positioned below vial */}
      <motion.div
        style={{ opacity }}
        className="relative z-[10] max-w-6xl mx-auto px-4 md:px-8 text-center flex flex-col items-center justify-center h-full"
      >
        {/* Badge at top */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-16 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-[#E7FB10]/30 text-sm font-medium tracking-wide text-[#e7fb10]">
            <FlaskConical className="h-4 w-4" />
            Research Grade Compounds
          </span>
        </motion.div>

        {/* Main Headline with premium entrance */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1 
            className="font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl leading-tight"
            data-testid="text-hero-headline"
          >
            The Future of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7FB10] via-white to-[#21d8ff] animate-pulse">Research Compounds</span>
          </h1>
        </motion.div>

        {/* Subheadline with staggered animation */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg"
          data-testid="text-hero-subheadline"
        >
          Engineered with intention.
          <br />
          Built for those who don't wait for permission.
        </motion.p>

        {/* CTA Buttons with premium animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/products">
            <Button size="lg" className="font-display text-base px-8 gap-2 bg-[#E7FB10] text-black border-2 border-[#E7FB10] shadow-[0_0_30px_rgba(231,251,16,0.4)] hover:shadow-[0_0_50px_rgba(231,251,16,0.6)] transition-all duration-300" data-testid="button-hero-shop">
              Shop Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/coa">
            <Button size="lg" variant="outline" className="font-display text-base px-8 bg-black/30 backdrop-blur-sm border-white/30 text-white transition-all duration-300 hover:bg-[#21d8ff] hover:text-black hover:border-[#21d8ff]" data-testid="button-hero-coa">
              Verify COA
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20"
        >
          <ChevronDown className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-24 md:py-32 bg-card border-y border-border relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#E7FB10]/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#21d8ff]/10 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#21d8ff]/10 border border-[#21d8ff]/30 mb-6"
          >
            <Sparkles className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-sm font-medium text-[#21d8ff]">Verified Quality</span>
          </motion.div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our Commitment to Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every product meets the highest standards of purity, testing, and verification.
          </p>
        </motion.div>
        
        <AnimatedTrustStats />
      </div>
    </section>
  );
}

function ProductShowcase() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.filter(p => p.showOnLandingPage && p.inStock).slice(0, 3) || [];

  return (
    <section className="py-24 md:py-32" id="products">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" data-testid="text-products-heading">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium research compounds, rigorously tested and verified for quality and purity.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-8 animate-pulse">
                <div className="aspect-square bg-muted rounded-md mb-6" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="h-full"
              >
                <Link href={`/products/${product.id}`} className="h-full block">
                  <Card className={`group p-8 cursor-pointer transition-all duration-300 border-2 h-full flex flex-col relative overflow-hidden ${
                    !product.inStock
                      ? "border-red-500/50 shadow-glow-red-sm hover:border-red-500 hover:shadow-glow-red-lg hover:animate-product-glow-red backlit-red"
                      : "border-cyan-400/60 shadow-glow-blue-sm hover:border-cyan-400 hover:shadow-glow-blue-lg hover:animate-product-glow-blue backlit-blue"
                  }`} data-testid={`card-product-${product.id}`}>
                    {/* Diagonal red line for out of stock */}
                    {!product.inStock && (
                      <div 
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{
                          background: "linear-gradient(to bottom right, transparent calc(50% - 2px), rgba(239, 68, 68, 0.7) calc(50% - 1px), rgba(239, 68, 68, 0.9) 50%, rgba(239, 68, 68, 0.7) calc(50% + 1px), transparent calc(50% + 2px))",
                        }}
                      />
                    )}
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-md mb-6 flex items-center justify-center overflow-hidden relative">
                      <FlaskConical className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                      {!product.inStock && (
                        <span className="absolute bottom-2 left-2 z-20 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-destructive text-destructive-foreground">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors text-[#E7FB10]">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-display text-2xl font-bold">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/products">
            <Button variant="outline" size="lg" className="font-display gap-2" data-testid="button-view-all-products">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ScienceSection() {
  return (
    <section className="py-24 md:py-32 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="aspect-square rounded-lg overflow-hidden relative">
              <img 
                src={researchLabImage} 
                alt="Advanced peptide research laboratory" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#21d8ff]/20 via-transparent to-[#E7FB10]/10 opacity-60" />
              <div className="absolute inset-0 rounded-lg border border-[#21d8ff]/30 shadow-[0_0_30px_rgba(33,216,255,0.2)]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4 block">
              Quality Assurance
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" data-testid="text-science-heading">
              Rigorous Testing Standards
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Every batch of our research compounds undergoes comprehensive third-party 
              laboratory testing. We maintain the highest standards of purity, potency, 
              and quality control to ensure researchers receive exactly what they need.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Third-party laboratory verification",
                "HPLC purity analysis",
                "Mass spectrometry confirmation",
                "Certificate of Authenticity included"
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/coa">
              <Button className="font-display gap-2 bg-[#E7FB10] border-2 border-[#E7FB10] shadow-glow-sm hover:shadow-glow-lg transition-shadow duration-300" data-testid="button-verify-coa">
                Verify Your COA
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function VerificationSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#21d8ff]/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#9d4edd]/5 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9d4edd]/10 border border-[#9d4edd]/30 mb-6"
          >
            <FileCheck className="h-4 w-4 text-[#9d4edd]" />
            <span className="text-sm font-medium text-[#9d4edd]">Complete Traceability</span>
          </motion.div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-verification-heading">
            Verify Every Product
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From QR code to verified COA — trace every product back to its lab-tested origins in seconds.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <VerificationJourney />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/coa">
            <Button size="lg" className="font-display gap-2 bg-[#21d8ff] text-black border-2 border-[#21d8ff]" data-testid="button-try-verification">
              Try It Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" data-testid="text-how-it-works-heading">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From synthesis to delivery, every step is designed with precision and care.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {howItWorks.map((item, index) => (
            <motion.div
              key={item.step}
              variants={fadeInUp}
              className="relative text-center"
            >
              <span className="font-display text-8xl font-bold text-muted/50 absolute -top-4 left-1/2 -translate-x-1/2">
                {item.step}
              </span>
              <div className="relative pt-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <item.icon className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const transparencyLinks = [
  {
    icon: Eye,
    title: "Our Transparency",
    description: "Company values and our commitment to openness",
    href: "/transparency",
    color: "#9d4edd"
  },
  {
    icon: Target,
    title: "Quality Process",
    description: "See our 6-step production and testing flow",
    href: "/quality-process",
    color: "#21d8ff"
  },
  {
    icon: BookOpen,
    title: "Education Center",
    description: "Learn about peptides with our research guides",
    href: "/education",
    color: "#ec4899"
  },
  {
    icon: ClipboardCheck,
    title: "Buyer Checklist",
    description: "Know what to look for in a peptide vendor",
    href: "/buyer-checklist",
    color: "#E7FB10"
  }
];

function TransparencyHub() {
  return (
    <section className="py-24 md:py-32 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" data-testid="text-transparency-heading">
            Full Transparency
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe you deserve to know exactly who you're buying from and how we operate.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {transparencyLinks.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
            >
              <Link href={item.href}>
                <Card 
                  className="p-6 h-full cursor-pointer transition-all duration-300 hover:border-opacity-100 group"
                  style={{ borderColor: `${item.color}30` }}
                  data-testid={`link-transparency-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-[var(--accent)]" style={{ '--accent': item.color } as React.CSSProperties}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform" style={{ color: item.color }}>
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 md:py-32 text-primary-foreground bg-[#e7fb10]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6" data-testid="text-cta-heading">
            Ready to Begin Your Research?
          </h2>
          <p className="text-lg opacity-80 mb-10 max-w-2xl mx-auto">
            Join researchers worldwide who trust Revive for premium quality compounds 
            backed by rigorous testing and verification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button 
                size="lg" 
                variant="secondary"
                className="font-display text-base px-8 gap-2 shadow-glow-sm hover:shadow-glow-lg transition-shadow duration-300"
                data-testid="button-cta-shop"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/coa">
              <Button 
                size="lg" 
                variant="outline"
                className="font-display text-base px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-cta-contact"
              >
                Verify COA
              </Button>
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
      <HeroSection />
      <ProductShowcase />
      <TrustSection />
      <VerificationSection />
      <ScienceSection />
      <TransparencyHub />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
