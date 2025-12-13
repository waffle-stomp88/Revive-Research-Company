import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ChevronDown,
  FlaskConical,
  Flame,
  Sparkles,
  TrendingUp,
  Package,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import heroBackground from "@assets/69bf34cc-d177-46c6-af24-c51da5ee10fa_1764382400961.png";
import bottleImage from "@assets/reta_bottle_1764702933066.jpg";
import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { BUNDLES } from "@/lib/bundles";
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
          <Link href="/peptides" onClick={() => trackEvent('hero_cta_click', 'engagement', 'shop_peptides')}>
            <Button size="lg" className="font-display text-lg px-10 gap-2 bg-[#E7FB10] text-black border-2 border-[#E7FB10] shadow-[0_0_30px_rgba(231,251,16,0.4)] hover:shadow-[0_0_50px_rgba(231,251,16,0.6)] transition-all duration-300" data-testid="button-hero-shop">
              Shop Peptides
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/coa">
            <Button size="lg" variant="outline" className="font-display text-lg px-10 bg-black/30 backdrop-blur-sm border-white/30 text-white transition-all duration-300 hover:bg-[#21d8ff] hover:text-black hover:border-[#21d8ff]" data-testid="button-hero-coa">
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
            <Button size="lg" variant="outline" className="font-display text-lg px-10 bg-transparent border-[#ec4899]/50 text-[#ec4899] hover:bg-[#ec4899]/10 hover:border-[#ec4899] transition-all duration-300" data-testid="button-hero-learn">
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
  { name: "Tissue Repair", icon: Zap, color: "cyan", href: "/peptides?category=tissue" },
  { name: "Metabolic", icon: Flame, color: "yellow", href: "/peptides?category=metabolic" },
  { name: "Anti-Aging", icon: Sparkles, color: "purple", href: "/peptides?category=aging" },
  { name: "Growth Hormone", icon: TrendingUp, color: "cyan", href: "/peptides?category=gh" },
];

function ProductShowcase() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  const timeLeft = useCountdown();

  const weeklyDeal = products?.find(p => p.isWeeklyDeal && p.inStock);
  const bestSellers = products?.filter(p => p.inStock).slice(0, 3) || [];
  const featuredBundles = BUNDLES.slice(0, 3);

  return (
    <section className="py-8 md:py-12" id="products">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Sale of the Week */}
        {weeklyDeal && (
          <Link href={`/products/${weeklyDeal.id}`} data-testid={`link-weekly-deal-${weeklyDeal.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 cursor-pointer"
            >
              <div className="sale-glow-pulse rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                <Card className="border-2 border-red-500 bg-gradient-to-r from-red-500/15 via-red-500/5 to-background overflow-hidden transition-colors duration-300 hover:border-red-400">
                  <div className="p-6 md:p-8">
                    {/* Top row - Sale label */}
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-[#E7FB10] text-black font-bold text-xs px-3 py-1">HOT DEAL</Badge>
                      <span className="text-sm text-red-400 font-semibold flex items-center gap-2">
                        <Flame className="h-4 w-4 animate-pulse" />
                        Sale of the Week
                      </span>
                    </div>
                    
                    {/* Main content row */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Product info */}
                      <div className="flex items-center gap-5 flex-1">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-500/30">
                          <FlaskConical className="h-10 w-10 md:h-12 md:w-12 text-red-500/60" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl md:text-3xl font-bold text-[#E7FB10] mb-1">{weeklyDeal.name}</h3>
                          <p className="text-muted-foreground text-sm md:text-base">Limited time offer - don't miss out!</p>
                        </div>
                      </div>
                      
                      {/* Countdown + Price + CTA */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:gap-6">
                        {/* Countdown */}
                        <div className="flex gap-2">
                          {[
                            { value: timeLeft.days, label: "Days" },
                            { value: timeLeft.hours, label: "Hrs" },
                            { value: timeLeft.minutes, label: "Min" },
                            { value: timeLeft.seconds, label: "Sec" },
                          ].map((item, i) => (
                            <div key={i} className="text-center">
                              <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2 min-w-[48px]">
                                <span className="font-display text-lg md:text-xl font-bold text-red-400">
                                  {String(item.value).padStart(2, '0')}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-1 block">{item.label}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Price + Button */}
                        <div className="flex items-center gap-4">
                          <span className="font-display text-3xl md:text-4xl font-bold text-[#E7FB10]">
                            ${Number(weeklyDeal.price).toFixed(2)}
                          </span>
                          <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white font-display text-base gap-2 pointer-events-none shadow-lg shadow-red-500/30" data-testid="button-weekly-deal">
                            Shop Now <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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

        {/* Best Sellers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Best Sellers</h2>
            <Link href="/peptides">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" data-testid="button-view-all-products">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-5 bg-muted rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bestSellers.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/peptides/${product.id}`} onClick={() => trackEvent('product_click', 'best_sellers', product.name)}>
                    <Card 
                      className="group cursor-pointer transition-all duration-300 border border-[#21d8ff]/30 hover:border-[#21d8ff] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(33,216,255,0.5)] overflow-hidden"
                      data-testid={`card-bestseller-${product.id}`}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={bottleImage} 
                          alt={`${product.name} research peptide - premium quality`}
                          className="h-[90%] w-[90%] object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.isWeeklyDeal && (
                          <Badge className="absolute top-2 right-2 bg-[#E7FB10] text-black text-xs px-2 py-0.5 font-bold">DEAL</Badge>
                        )}
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-display text-lg md:text-xl font-bold text-[#E7FB10] group-hover:text-[#21d8ff] transition-colors mb-2">
                          {product.name}
                        </h3>
                        <span className="font-display text-xl font-bold">${Number(product.price).toFixed(2)}</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Research Stacks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-[#21d8ff]" />
              <h2 className="font-display text-2xl md:text-3xl font-bold">Research Stacks</h2>
            </div>
            <Link href="/bundles">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" data-testid="button-view-all-bundles">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
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
                      className={`group cursor-pointer transition-all duration-300 border overflow-hidden h-full hover:scale-[1.02] ${
                        isCyan 
                          ? "border-[#21d8ff]/30 hover:border-[#21d8ff] hover:shadow-[0_0_25px_rgba(33,216,255,0.4)]" 
                          : "border-[#E7FB10]/30 hover:border-[#E7FB10] hover:shadow-[0_0_25px_rgba(231,251,16,0.4)]"
                      }`}
                      data-testid={`card-bundle-${bundle.id}`}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Icon className={isCyan ? "h-5 w-5 text-[#21d8ff]" : "h-5 w-5 text-[#E7FB10]"} />
                            <h3 className={`font-display text-lg md:text-xl font-bold ${isCyan ? "text-[#21d8ff]" : "text-[#E7FB10]"}`}>
                              {bundle.name}
                            </h3>
                          </div>
                          <Badge className={`text-xs font-bold px-2 py-0.5 ${isCyan ? "bg-[#21d8ff] text-black" : "bg-[#E7FB10] text-black"}`}>
                            -{bundle.savings}%
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {bundle.products.map((product, i) => (
                            <Badge key={i} variant="outline" className="text-sm px-2 py-0.5">
                              {product}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground line-through">${bundle.originalPrice.toFixed(2)}</span>
                            <span className={`font-display text-xl md:text-2xl font-bold ${isCyan ? "text-[#21d8ff]" : "text-[#E7FB10]"}`}>
                              ${bundle.bundlePrice.toFixed(2)}
                            </span>
                          </div>
                          <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${isCyan ? "text-[#21d8ff]" : "text-[#E7FB10]"}`} />
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
          <Link href="/peptides">
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
      <MolecularDNAVisual />
      <ProductShowcase />
      <TestingPipelineVisual />
      <WhyResearchersChooseUs />
      <CTASection />
    </main>
  );
}
