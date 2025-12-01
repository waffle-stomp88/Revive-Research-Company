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
  FileCheck,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import heroBackground from "@assets/69bf34cc-d177-46c6-af24-c51da5ee10fa_1764382400961.png";
import researchLabImage from "@assets/generated_images/neon_peptide_research_lab.png";
import { AnimatedTrustStats } from "@/components/infographics/animated-stats";
import { VerificationJourney } from "@/components/infographics/verification-journey";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

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

const faqItems = [
  {
    question: "What does 'Research Use Only' mean?",
    answer: "Research compounds are intended exclusively for scientific research, laboratory testing, and educational purposes. They are not approved for human consumption or medical use."
  },
  {
    question: "How do I verify the authenticity of my product?",
    answer: "Every product includes a QR code that links directly to its Certificate of Authenticity (COA). Scan it to view lab-verified purity, batch information, and testing results instantly."
  },
  {
    question: "What's your shipping policy?",
    answer: "Free shipping on orders over $175. Otherwise flat $20 shipping. We offer 24-hour standard shipping and same-day shipping for orders placed before 12:00 CT."
  },
  {
    question: "Can I get a refund?",
    answer: "No refunds—all sales are final due to the nature of research compounds. However, if there's a quality issue, contact our support team and we'll work with you on a solution."
  },
  {
    question: "How should I store my compounds?",
    answer: "Storage depends on the specific compound. Check the product page for detailed storage instructions. Generally, lyophilized peptides are stable at room temp or refrigerated (2-8°C). Reconstituted solutions should be refrigerated."
  },
  {
    question: "Do you offer subscriptions?",
    answer: "Yes! We offer weekly (15% off), bi-weekly (12% off), and monthly (10% off) subscriptions for automatic reorders. You can cancel anytime."
  }
];

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const imageOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
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
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background z-[2]" />
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
      <motion.div
        style={{ opacity }}
        className="relative z-[10] max-w-6xl mx-auto px-4 md:px-8 text-center flex flex-col items-center justify-center h-full"
      >
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

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg"
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
          <Link href="/products" onClick={() => trackEvent('hero_cta_click', 'engagement', 'shop_products')}>
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

function ProductShowcase() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const weeklyDeal = products?.find(p => p.isWeeklyDeal && p.inStock);
  const featuredProducts = products?.filter(p => p.showOnLandingPage && p.inStock && !p.isWeeklyDeal).slice(0, 2) || [];
  
  const carouselItems = weeklyDeal ? [weeklyDeal, ...featuredProducts] : featuredProducts;
  const duplicatedItems = [...carouselItems, ...carouselItems];

  return (
    <section className="py-8 md:py-10" id="products">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6 px-4 md:px-8"
      >
        <h2 className="font-display md:text-3xl font-bold mb-2 text-[45px]">
          Featured & Sale Items
        </h2>
      </motion.div>

      {isLoading ? (
        <div className="flex gap-4 px-4 md:px-8 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex-shrink-0 w-48 h-64 animate-pulse p-4">
              <div className="w-full h-32 bg-muted rounded-md mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden w-screen relative -ml-[calc((100vw-100%)/2)]">
          <motion.div
            className="flex gap-4 px-4 md:px-8"
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 40, repeat: Infinity, repeatType: "loop", ease: "linear" }}
          >
            {duplicatedItems.map((product, idx) => (
              <Link key={`${product.id}-${idx}`} href={`/products/${product.id}`} onClick={() => trackEvent('product_click', 'carousel', product.name)} className="flex-shrink-0">
                <Card className={`group w-48 h-auto cursor-pointer transition-all duration-300 border-2 flex flex-col relative overflow-hidden ${
                  product.isWeeklyDeal
                    ? "border-[#E7FB10]/80 shadow-[0_0_20px_rgba(231,251,16,0.3)] hover:shadow-[0_0_30px_rgba(231,251,16,0.5)]"
                    : "border-cyan-400/60 shadow-glow-blue-sm hover:shadow-glow-blue-lg"
                }`} data-testid={`card-product-${product.id}`}>
                  {product.isWeeklyDeal && (
                    <div className="absolute top-2 right-2 z-20 px-3 py-1 text-xs font-bold rounded-full bg-[#E7FB10] text-black">
                      HOT DEAL
                    </div>
                  )}
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-md m-3 flex items-center justify-center overflow-hidden relative">
                    <FlaskConical className="h-12 w-12 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="px-3 pb-3 flex flex-col flex-1">
                    <h3 className="font-display text-sm font-semibold mb-1 group-hover:text-primary transition-colors text-[#E7FB10] line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-bold">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-6"
      >
        <Link href="/products">
          <Button variant="outline" size="lg" className="font-display gap-2" data-testid="button-view-all-products">
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}

function QualityAndTrustSection() {
  return (
    <section className="py-12 md:py-16 bg-card border-y border-border relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#E7FB10]/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#21d8ff]/10 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="font-display md:text-4xl font-bold mb-4 text-[45px]">
            Verified Quality & Transparency
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            Every compound undergoes rigorous third-party lab testing. View metrics and testing details below.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
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
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Rigorous Testing Standards
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              Every batch undergoes comprehensive third-party laboratory testing with HPLC purity analysis and mass spectrometry confirmation.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Third-party laboratory verification",
                "HPLC purity analysis",
                "Mass spectrometry confirmation",
                "Certificate of Authenticity included"
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#E7FB10] flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/coa">
              <Button className="font-display gap-2 bg-[#E7FB10] text-black border-2 border-[#E7FB10]" data-testid="button-verify-coa">
                Verify Your COA
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <AnimatedTrustStats />
      </div>
    </section>
  );
}

function VerificationSection() {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#21d8ff]/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#9d4edd]/5 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9d4edd]/10 border border-[#9d4edd]/30 mb-4"
          >
            <FileCheck className="h-4 w-4 text-[#9d4edd]" />
            <span className="text-sm font-medium text-[#9d4edd]">Complete Traceability</span>
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Verify Every Product
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
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
          className="text-center mt-8"
        >
          <Link href="/coa">
            <Button size="lg" className="font-display gap-2 bg-[#21d8ff] text-black border-2 border-[#21d8ff]">
              Try It Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-muted-foreground">
            Find answers to common questions about our products and policies.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-3"
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
                data-testid={`button-faq-${index}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{item.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </div>
              </button>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: openIndex === index ? 1 : 0,
                  height: openIndex === index ? "auto" : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground px-4 py-3">
                  {item.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link href="/faq">
            <Button size="lg" variant="outline" className="font-display gap-2" data-testid="button-view-full-faq">
              Explore Full FAQ
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
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
            <Link href="/products">
              <Button 
                size="lg" 
                variant="secondary"
                className="font-display text-base px-8 gap-2"
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

function NewsletterSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-background to-background/50 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl md:text-3xl font-bold mb-3">
            Stay Updated on New Research
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            Get early access to new compound releases, lab research updates, and exclusive subscriber content. Join 500+ researchers in our community.
          </p>
          <NewsletterSignup />
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
      <QualityAndTrustSection />
      <VerificationSection />
      <FAQSection />
      <CTASection />
      <NewsletterSection />
    </main>
  );
}
