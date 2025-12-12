import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SEOHead, SEO_CONFIG } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Boxes,
  Building2,
  Droplets,
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { Product } from "@shared/schema";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const productCategories = [
  {
    href: "/peptides",
    label: "Peptides",
    icon: FlaskConical,
    color: "#E7FB10",
    description: "Individual research vials",
    details: "Our flagship catalog of premium research peptides. Each vial comes with batch-specific COA and 99%+ verified purity.",
    features: ["Individual vials", "Full COA access", "Multiple dosage options"],
  },
  {
    href: "/bulk-packs",
    label: "Bulk Packs",
    icon: Boxes,
    color: "#21d8ff",
    description: "Volume discounts for researchers",
    details: "Save 10-15% when purchasing 5-packs or 10-packs. Perfect for ongoing research protocols requiring consistent supply.",
    features: ["5-pack: 10% off", "10-pack: 15% off", "Mix any peptides"],
  },
  {
    href: "/supplies",
    label: "Supplies",
    icon: Droplets,
    color: "#9d4edd",
    description: "Research essentials",
    details: "Everything you need for proper peptide handling. Bacteriostatic water, syringes, alcohol swabs, and storage supplies.",
    features: ["Bac water", "Syringes", "Storage supplies"],
  },
  {
    href: "/wholesale",
    label: "Wholesale Program",
    icon: Building2,
    color: "#22c55e",
    description: "B2B supply for clinics & resellers",
    details: "Volume pricing starting at 100 vials. Dedicated account management, priority fulfillment, and full documentation.",
    features: ["20-35% tiered discounts", "Account manager", "Priority shipping"],
  },
];

const trustBadges = [
  { icon: Shield, label: "99%+ Purity", description: "Third-party verified" },
  { icon: CheckCircle2, label: "Full COA", description: "Every batch tested" },
  { icon: Truck, label: "Fast Shipping", description: "24hr fulfillment" },
  { icon: Clock, label: "Same-Day", description: "Before 12:00 CT" },
];

export default function ProductsHub() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const inStockCount = products?.filter(p => p.inStock).length || 0;
  const totalProducts = products?.length || 0;
  const featuredProducts = products?.filter(p => p.featured).slice(0, 4) || [];

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <SEOHead {...SEO_CONFIG.productsHub} canonicalPath="/shop" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/30 mb-4">
            <Sparkles className="h-4 w-4 text-[#E7FB10]" />
            <span className="text-sm font-medium text-[#E7FB10]">Research Compounds</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Shop All Products
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
            Premium peptide research compounds with verified purity, full COA documentation, 
            and flexible purchasing options from individual vials to wholesale supply.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">{inStockCount} products in stock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E7FB10]" />
              <span className="text-muted-foreground">{totalProducts} total compounds</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
        >
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <Card key={badge.label} className="p-4 text-center border-border/50">
                <Icon className="h-5 w-5 mx-auto mb-2 text-[#21d8ff]" />
                <p className="font-semibold text-sm">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </Card>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {productCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.a 
                key={category.href} 
                href={category.href}
                className="block p-6 cursor-pointer border-2 group rounded-lg bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: `${category.color}40` }}
                data-testid={`link-category-${category.label.toLowerCase().replace(/ /g, "-")}`}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: `0 0 30px ${category.color}40, 0 0 60px ${category.color}20, inset 0 0 20px ${category.color}10`,
                  borderColor: `${category.color}80`,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl font-bold" style={{ color: category.color }}>
                        {category.label}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.details}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.features.map((feature) => (
                        <Badge 
                          key={feature} 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: `${category.color}50`, color: category.color }}
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ArrowRight 
                    className="h-5 w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" 
                    style={{ color: category.color }}
                  />
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Featured Products</h2>
              <Link href="/peptides">
                <Button variant="ghost" className="gap-2" data-testid="button-view-all-peptides">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <a 
                  key={product.id} 
                  href={`/peptides/${product.id}`}
                  className="block p-4 cursor-pointer transition-all duration-300 border border-border/50 hover:border-[#E7FB10]/50 hover:scale-105 group rounded-lg bg-card focus:outline-none focus-visible:ring-2"
                  data-testid={`card-featured-${product.id}`}
                >
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 flex items-center justify-center">
                    <FlaskConical className="h-12 w-12 text-muted-foreground/50 group-hover:text-[#E7FB10] transition-colors" />
                  </div>
                  <h3 className="font-semibold text-sm truncate mb-1">{product.name}</h3>
                  <p className="text-lg font-display font-bold text-[#E7FB10]">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  {!product.inStock && (
                    <Badge variant="secondary" className="text-xs mt-2">Out of Stock</Badge>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="p-8 border-2 border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <h3 className="font-display text-2xl font-bold mb-3">Need Help Choosing?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our AI assistant can help you navigate our catalog, answer questions about 
              peptide research, and guide you to the right products for your protocols.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/education">
                <Button variant="outline" className="gap-2" data-testid="button-education-center">
                  Education Center <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" className="gap-2" data-testid="button-faq">
                  View FAQ <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
