import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  Package,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import heroBackground from "@assets/69bf34cc-d177-46c6-af24-c51da5ee10fa_1764382400961.png";
import researchLabImage from "@assets/generated_images/neon_peptide_research_lab.png";
import bottleImage from "@assets/reta_bottle_1764702933066.jpg";
import { AnimatedTrustStats } from "@/components/infographics/animated-stats";
import { VerificationJourney } from "@/components/infographics/verification-journey";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { BUNDLES } from "@/lib/bundles";

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

  const handleScrollClick = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

// Countdown timer hook - counts down to end of week
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      
      const difference = Math.max(0, endOfWeek.getTime() - now.getTime());
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return timeLeft;
}

// Product categories for quick links
const categories = [
  { name: "Tissue Repair", icon: Zap, color: "cyan", href: "/products?category=tissue" },
  { name: "Metabolic", icon: Flame, color: "yellow", href: "/products?category=metabolic" },
  { name: "Anti-Aging", icon: Sparkles, color: "purple", href: "/products?category=aging" },
  { name: "Growth Hormone", icon: TrendingUp, color: "cyan", href: "/products?category=gh" },
];

function ProductShowcase() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  const timeLeft = useCountdown();

  const weeklyDeal = products?.find(p => p.isWeeklyDeal && p.inStock);
  const bestSellers = products?.filter(p => p.inStock).slice(0, 4) || [];
  const featuredBundles = BUNDLES.slice(0, 3);

  return (
    <section className="py-8 md:py-12" id="products">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Sale of the Week - Compact */}
        {weeklyDeal && (
          <Link href={`/products/${weeklyDeal.id}`} data-testid={`link-weekly-deal-${weeklyDeal.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 cursor-pointer"
            >
              <div className="sale-glow-pulse rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]">
                <Card className="border-2 border-red-500 bg-gradient-to-r from-red-500/10 via-background to-background overflow-hidden transition-colors duration-300 hover:border-red-400">
                  <div className="flex flex-col md:flex-row items-center gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="h-8 w-8 text-red-500/50" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#E7FB10] text-black font-bold text-[10px] px-2 py-0.5">HOT DEAL</Badge>
                          <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                            <Flame className="h-3 w-3 animate-pulse" />
                            Sale of the Week
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#E7FB10]">{weeklyDeal.name}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:ml-auto">
                      <div className="flex gap-2">
                        {[
                          { value: timeLeft.days, label: "D" },
                          { value: timeLeft.hours, label: "H" },
                          { value: timeLeft.minutes, label: "M" },
                          { value: timeLeft.seconds, label: "S" },
                        ].map((item, i) => (
                          <div key={i} className="text-center">
                            <div className="bg-red-500/20 border border-red-500/40 rounded px-2 py-1 min-w-[36px]">
                              <span className="font-display text-sm font-bold text-red-400">
                                {String(item.value).padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <span className="font-display text-xl font-bold text-[#E7FB10]">
                        ${Number(weeklyDeal.price).toFixed(2)}
                      </span>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white font-display gap-1 pointer-events-none" data-testid="button-weekly-deal">
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Category Quick Links - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const colorClass = category.color === "cyan" 
                ? "border-[#21d8ff]/30 hover:border-[#21d8ff] hover:bg-[#21d8ff]/10 text-[#21d8ff]"
                : category.color === "yellow"
                ? "border-[#E7FB10]/30 hover:border-[#E7FB10] hover:bg-[#E7FB10]/10 text-[#E7FB10]"
                : "border-[#9d4edd]/30 hover:border-[#9d4edd] hover:bg-[#9d4edd]/10 text-[#9d4edd]";
              
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={category.href}>
                    <Card className={`p-3 cursor-pointer transition-all duration-300 border ${colorClass} group`} data-testid={`link-category-${category.name.toLowerCase().replace(' ', '-')}`}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Best Sellers Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl md:text-2xl font-bold">Best Sellers</h2>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground" data-testid="button-view-all-products">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse p-3">
                  <div className="aspect-square bg-muted rounded-md mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bestSellers.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link href={`/products/${product.id}`} onClick={() => trackEvent('product_click', 'best_sellers', product.name)}>
                    <Card 
                      className="group cursor-pointer transition-all duration-300 border border-[#21d8ff]/30 hover:border-[#21d8ff] hover:scale-105 hover:shadow-[0_0_25px_rgba(33,216,255,0.6)] overflow-hidden"
                      data-testid={`card-bestseller-${product.id}`}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={bottleImage} 
                          alt={product.name}
                          className="h-4/5 w-4/5 object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.isWeeklyDeal && (
                          <Badge className="absolute top-1 right-1 bg-[#E7FB10] text-black text-[8px] px-1.5 py-0">DEAL</Badge>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-display text-sm font-semibold text-[#E7FB10] truncate group-hover:text-[#21d8ff] transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-display text-base font-bold">${Number(product.price).toFixed(2)}</span>
                          <Badge variant="outline" className="text-[8px] px-1 py-0 border-[#21d8ff]/50 text-[#21d8ff]">99%+</Badge>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Research Stacks - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#21d8ff]" />
              <h2 className="font-display text-xl md:text-2xl font-bold">Research Stacks</h2>
            </div>
            <Link href="/bundles">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground" data-testid="button-view-all-bundles">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-3">
            {featuredBundles.map((bundle, index) => {
              const Icon = bundle.icon;
              const isCyan = bundle.color === "cyan";
              
              return (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/bundles/${bundle.id}`} data-testid={`link-bundle-${bundle.id}`}>
                    <Card 
                      className={`group cursor-pointer transition-all duration-300 border overflow-hidden h-full ${
                        isCyan 
                          ? "border-[#21d8ff]/30 hover:border-[#21d8ff]" 
                          : "border-[#E7FB10]/30 hover:border-[#E7FB10]"
                      }`}
                      data-testid={`card-bundle-${bundle.id}`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={isCyan ? "h-4 w-4 text-[#21d8ff]" : "h-4 w-4 text-[#E7FB10]"} />
                            <h3 className={`font-display text-sm font-bold ${isCyan ? "text-[#21d8ff]" : "text-[#E7FB10]"}`}>
                              {bundle.name}
                            </h3>
                          </div>
                          <Badge className={`text-[10px] ${isCyan ? "bg-[#21d8ff] text-black" : "bg-[#E7FB10] text-black"}`}>
                            -{bundle.savings}%
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {bundle.products.map((product, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                              {product}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground line-through">${bundle.originalPrice.toFixed(2)}</span>
                            <span className={`font-display text-base font-bold ${isCyan ? "text-[#21d8ff]" : "text-[#E7FB10]"}`}>
                              ${bundle.bundlePrice.toFixed(2)}
                            </span>
                          </div>
                          <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${isCyan ? "text-[#21d8ff]" : "text-[#E7FB10]"}`} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Wanna See More CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 flex justify-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E7FB10]/20 via-[#21d8ff]/20 to-[#E7FB10]/20 rounded-lg blur-lg" />
          <Link href="/products">
            <Button 
              size="lg" 
              className="relative font-display text-lg gap-2 border-2 border-[#E7FB10] bg-transparent hover:bg-[#E7FB10]/10 text-[#E7FB10]"
              data-testid="button-wanna-see-more"
            >
              Wanna See More?
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
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
