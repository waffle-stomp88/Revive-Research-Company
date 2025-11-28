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
  FileCheck
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

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
  { icon: Truck, value: "48hr", label: "Shipping" },
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <motion.div 
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-b from-background via-background to-card"
      />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm font-medium tracking-wide text-[#e7fb10]">
            <FlaskConical className="h-4 w-4" />
            Research Grade Compounds
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
          data-testid="text-hero-headline"
        >
          Something New
          <br />
          <span className="text-muted-foreground">Is Forming</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          data-testid="text-hero-subheadline"
        >
          Engineered with intention.
          <br />
          Built for those who don't wait for permission.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/products">
            <Button size="lg" className="font-display text-base px-8 gap-2 bg-[#e7fb10] text-primary-foreground border border-primary-border hover:shadow-glow-md hover:animate-product-glow" data-testid="button-hero-shop">
              Shop Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/coa">
            <Button size="lg" variant="outline" className="font-display text-base px-8" data-testid="button-hero-coa">
              Verify COA
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-24 md:py-32 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {trustMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              variants={fadeInUp}
              className="text-center"
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E7FB10]/10 border-2 border-[#E7FB10]/30 mb-6 shadow-glow-sm"
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 40px 0px rgba(231, 251, 16, 0.60)" }}
                animate={{ 
                  boxShadow: [
                    "0px 0px 15px 0px rgba(231, 251, 16, 0.20)",
                    "0px 0px 25px 0px rgba(231, 251, 16, 0.40)",
                    "0px 0px 15px 0px rgba(231, 251, 16, 0.20)"
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  <metric.icon className="h-8 w-8 text-[#E7FB10]" />
                </motion.div>
              </motion.div>
              <div className="font-display text-4xl md:text-5xl font-bold mb-3 text-[#E7FB10]" data-testid={`text-metric-${index}`}>
                {metric.value}
              </div>
              <div className="text-base md:text-lg text-muted-foreground uppercase tracking-wider font-medium">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProductShowcase() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.filter(p => p.featured).slice(0, 3) || [];

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
              >
                <Link href={`/products/${product.id}`}>
                  <Card className={`group p-8 hover-elevate cursor-pointer transition-all duration-300 border-2 ${
                    !product.inStock
                      ? "border-red-500/30 hover:border-red-500 hover:shadow-glow-red-lg hover:animate-product-glow-red"
                      : "border-cyan-400/30 hover:border-cyan-400 hover:shadow-glow-blue-lg hover:animate-product-glow-blue"
                  }`} data-testid={`card-product-${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-md mb-6 flex items-center justify-center overflow-hidden">
                      <FlaskConical className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors text-[#E7FB10]">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
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
          >
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
              <Microscope className="h-32 w-32 text-muted-foreground/30" />
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
              <Button className="font-display gap-2 bg-[#E7FB10]" data-testid="button-verify-coa">
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

function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground">
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
                className="font-display text-base px-8 gap-2"
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
      <TrustSection />
      <ProductShowcase />
      <ScienceSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
