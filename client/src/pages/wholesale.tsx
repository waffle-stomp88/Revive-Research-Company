import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Building2, CheckCircle2, FileText, Users, Truck, Shield, HeadphonesIcon, 
  Package, Send, Loader2, Calculator, ArrowRight, Sparkles, Award, 
  BadgeCheck, Lock, FlaskConical, Minus, Plus, TrendingUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

const wholesaleFormSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  businessType: z.string().min(1, "Please select your business type"),
  estimatedMonthlyVolume: z.string().min(1, "Please select estimated volume"),
  website: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type WholesaleFormData = z.infer<typeof wholesaleFormSchema>;

const pricingTiers = [
  { 
    range: "100–249 vials", 
    discount: "Up to 20% off", 
    savings: "Thousands per order",
    details: "MOQ: 100 | Ships in 3–5 days",
    mixMatch: true,
    color: "#21d8ff" 
  },
  { 
    range: "250–499 vials", 
    discount: "Up to 25% off", 
    savings: "Significant reduction for labs",
    details: "MOQ: 250 | Priority allocation",
    mixMatch: true,
    color: "#E7FB10" 
  },
  { 
    range: "500–999 vials", 
    discount: "Up to 30% off", 
    savings: "Major cost efficiency",
    details: "MOQ: 500 | Free domestic shipping",
    mixMatch: true,
    color: "#a855f7" 
  },
  { 
    range: "1000+ vials", 
    discount: "Custom Pricing", 
    savings: "Enterprise-level discounts available",
    details: "MOQ: 1000 | Custom labeling available",
    mixMatch: true,
    color: "#22c55e" 
  },
];

const benefits = [
  { icon: Package, title: "Minimum Order: 100 Vials", description: "Flexible ordering across multiple products" },
  { icon: FileText, title: "Full COA Access", description: "Batch-specific certificates for every order" },
  { icon: Truck, title: "Priority Shipping", description: "Expedited fulfillment for all wholesale orders" },
  { icon: Users, title: "Dedicated Account Manager", description: "Direct line to your personal rep" },
  { icon: Shield, title: "Quality Guarantee", description: "99%+ purity on every batch" },
  { icon: HeadphonesIcon, title: "B2B Support", description: "Extended support hours for business accounts" },
];

const businessTypes = [
  "Wellness Clinic",
  "Weight Loss Clinic",
  "Research Facility",
  "Compounding Pharmacy",
  "Medical Practice",
  "Reseller",
  "Other",
];

const volumeOptions = [
  "100-249 vials/month",
  "250-499 vials/month",
  "500-999 vials/month",
  "1000+ vials/month",
];

const processSteps = [
  { 
    step: 1, 
    title: "Apply", 
    description: "Complete our quick application form with your business details",
    icon: FileText,
    color: "#21d8ff"
  },
  { 
    step: 2, 
    title: "Get Approved", 
    description: "Our team reviews and approves within 24-48 hours",
    icon: BadgeCheck,
    color: "#E7FB10"
  },
  { 
    step: 3, 
    title: "Start Ordering", 
    description: "Access wholesale pricing and place your first bulk order",
    icon: Package,
    color: "#22c55e"
  },
];

const trustBadges = [
  { icon: Shield, label: "99%+ Purity Verified", color: "#22c55e" },
  { icon: Award, label: "Third-Party Lab Tested", color: "#E7FB10" },
  { icon: Lock, label: "Secure B2B Portal", color: "#21d8ff" },
  { icon: BadgeCheck, label: "GMP Compliant", color: "#a855f7" },
];

function SavingsCalculator() {
  const [quantity, setQuantity] = useState(100);
  const basePrice = 89;
  
  const getDiscount = (qty: number) => {
    if (qty >= 1000) return 0.35;
    if (qty >= 500) return 0.30;
    if (qty >= 250) return 0.25;
    if (qty >= 100) return 0.20;
    return 0;
  };
  
  const getTierLabel = (qty: number) => {
    if (qty >= 1000) return "Elite Partner";
    if (qty >= 500) return "Gold Tier";
    if (qty >= 250) return "Silver Tier";
    if (qty >= 100) return "Bronze Tier";
    return "Retail";
  };
  
  const discount = getDiscount(quantity);
  const retailTotal = quantity * basePrice;
  const wholesaleTotal = retailTotal * (1 - discount);
  const savings = retailTotal - wholesaleTotal;
  const tierLabel = getTierLabel(quantity);
  
  return (
    <Card className="p-6 md:p-8 border-2 border-[#E7FB10]/30 bg-gradient-to-br from-[#E7FB10]/5 to-transparent">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#E7FB10]/20 flex items-center justify-center">
          <Calculator className="h-6 w-6 text-[#E7FB10]" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold">Savings Calculator</h3>
          <p className="text-sm text-muted-foreground">Estimate your wholesale savings</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Monthly Volume (vials)</label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(50, quantity - 50))}
              className="border-[#2a2a32]"
              data-testid="button-decrease-qty"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-center text-2xl font-bold h-14"
                data-testid="input-calculator-qty"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 50)}
              className="border-[#2a2a32]"
              data-testid="button-increase-qty"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between mt-2">
            {[100, 250, 500, 1000].map((preset) => (
              <Button
                key={preset}
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(preset)}
                className={quantity >= preset ? "text-[#E7FB10]" : "text-muted-foreground"}
                data-testid={`button-preset-${preset}`}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[#1a1a1f] border border-[#2a2a32]">
            <p className="text-xs text-muted-foreground mb-1">Retail Price</p>
            <p className="text-xl font-bold line-through text-red-400">${retailTotal.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30">
            <p className="text-xs text-muted-foreground mb-1">Wholesale Price</p>
            <p className="text-xl font-bold text-[#22c55e]">${wholesaleTotal.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#E7FB10]/20 to-[#22c55e]/20 border border-[#E7FB10]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Savings</p>
              <p className="text-3xl font-bold text-[#E7FB10]">${savings.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-[#E7FB10] text-black mb-1">{tierLabel}</Badge>
              <p className="text-lg font-bold text-[#22c55e]">{(discount * 100).toFixed(0)}% OFF</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PopularWholesaleProducts() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const popularProducts = products?.slice(0, 4) || [];
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge className="bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30 mb-3">
          <TrendingUp className="h-3 w-3 mr-1" />
          Top Sellers
        </Badge>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Popular for Wholesale</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Our most requested compounds for bulk orders
        </p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        {popularProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/products/${product.id}`}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "tween", duration: 0.15 }}
              >
                <Card className="p-4 border-[#2a2a32] hover:border-[#a855f7]/50 transition-colors cursor-pointer group">
                  <div className="h-24 bg-gradient-to-br from-[#a855f7]/10 to-transparent rounded-lg flex items-center justify-center mb-3">
                    <FlaskConical className="h-10 w-10 text-[#a855f7] group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                    <Badge variant="outline" className="text-[10px] border-[#22c55e]/50 text-[#22c55e]">
                      Bulk Ready
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center">
        <Link href="/shop">
          <Button variant="outline" className="border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10">
            View All Products
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Wholesale() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<WholesaleFormData>({
    resolver: zodResolver(wholesaleFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      businessType: "",
      estimatedMonthlyVolume: "",
      website: "",
      additionalInfo: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: WholesaleFormData) => {
      return apiRequest("POST", "/api/contact", {
        name: `${data.contactName} (${data.businessName})`,
        email: data.email,
        message: `[WHOLESALE INQUIRY]

Business Name: ${data.businessName}
Business Type: ${data.businessType}
Contact: ${data.contactName}
Phone: ${data.phone}
Website: ${data.website || "N/A"}
Estimated Monthly Volume: ${data.estimatedMonthlyVolume}

Additional Information:
${data.additionalInfo || "None provided"}`.trim(),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "We'll review your wholesale application and get back to you within 24-48 hours.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WholesaleFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Hero Section with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center mb-16 py-12 rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#21d8ff]/20 via-[#a855f7]/10 to-[#E7FB10]/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(33,216,255,0.3),_transparent_50%)]" />
          <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, #21d8ff 0%, transparent 70%)" }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#21d8ff]/20 border border-[#21d8ff]/40 mb-6"
            >
              <Sparkles className="h-4 w-4 text-[#21d8ff]" />
              <span className="text-sm font-semibold text-[#21d8ff]">B2B Supply Partner</span>
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              Wholesale Program
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
              Premium peptide supply for clinics, research facilities, and resellers. 
              Tiered pricing up to <span className="text-[#E7FB10] font-semibold">35% OFF</span> with dedicated support.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button 
                size="lg" 
                className="bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
                onClick={() => document.getElementById('application')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-apply-hero"
              >
                Apply Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-calculator-hero"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Calculate Savings
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{ 
                    borderColor: `${badge.color}40`,
                    backgroundColor: `${badge.color}10`
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 0 ${badge.color}00`,
                      `0 0 15px ${badge.color}30`,
                      `0 0 0 ${badge.color}00`
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.7,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: badge.color }} />
                  <span className="text-sm font-medium">{badge.label}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Animated Pricing Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Volume Pricing Tiers</h2>
            <p className="text-muted-foreground">The more you order, the more you save</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.range}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div
                  className="border-2 rounded-xl"
                  style={{ borderColor: tier.color }}
                >
                  <Card
                    className="p-6 text-center h-full"
                    data-testid={`card-tier-${index}`}
                  >
                      <motion.div 
                        className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${tier.color}20` }}
                        animate={{ 
                          y: [0, -5, 0],
                          boxShadow: [
                            `0 0 0 ${tier.color}00`,
                            `0 0 20px ${tier.color}40`,
                            `0 0 0 ${tier.color}00`
                          ]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        <Package className="h-7 w-7" style={{ color: tier.color }} />
                      </motion.div>
                      <p className="text-sm text-muted-foreground mb-2">{tier.range}</p>
                      <p 
                        className="font-display text-2xl font-bold mb-3"
                        style={{ color: tier.color }}
                      >
                        {tier.discount}
                      </p>
                      <div className="space-y-2 text-left">
                        <p className="text-xs text-muted-foreground">
                          <span className="text-white/80">Est. savings:</span> {tier.savings}
                        </p>
                        <p className="text-xs text-muted-foreground">{tier.details}</p>
                        {tier.mixMatch && (
                          <Badge variant="outline" className="text-[10px] border-[#22c55e]/50 text-[#22c55e]">
                            Mix & match allowed
                          </Badge>
                        )}
                      </div>
                    </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30 mb-3">
              Simple Process
            </Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">Get started in three easy steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#21d8ff] via-[#E7FB10] to-[#22c55e]" />
            
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative"
                >
                  <Card className="p-6 text-center border-[#2a2a32] h-full">
                    <motion.div 
                      className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center relative z-10"
                      style={{ 
                        backgroundColor: `${step.color}20`,
                        border: `2px solid ${step.color}`
                      }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          `0 0 0 0 ${step.color}00`,
                          `0 0 0 8px ${step.color}20`,
                          `0 0 0 0 ${step.color}00`
                        ]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.6,
                        ease: "easeInOut"
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: step.color }} />
                    </motion.div>
                    <Badge 
                      className="mb-3"
                      style={{ 
                        backgroundColor: `${step.color}20`,
                        color: step.color,
                        borderColor: `${step.color}30`
                      }}
                    >
                      Step {step.step}
                    </Badge>
                    <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Savings Calculator */}
        <motion.div
          id="calculator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <SavingsCalculator />
            
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold mb-4">Why Go Wholesale?</h3>
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Card className="p-4 border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-[#21d8ff]" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-0.5">{benefit.title}</h4>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Popular Wholesale Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-16"
        >
          <PopularWholesaleProducts />
        </motion.div>

        {/* Application Form */}
        <motion.div
          id="application"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 md:p-8 max-w-2xl mx-auto border-2 border-[#21d8ff]/30">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold mb-2">Apply for Wholesale Account</h2>
              <p className="text-muted-foreground">
                Complete the form below and we'll review your application within 24-48 hours.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Application Received!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thank you for your interest. Our wholesale team will review your application 
                  and reach out within 24-48 business hours.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company LLC" {...field} data-testid="input-business-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} data-testid="input-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@company.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-business-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estimatedMonthlyVolume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Monthly Volume *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-volume">
                                <SelectValue placeholder="Select volume" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {volumeOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourcompany.com" {...field} data-testid="input-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your research needs, specific products of interest, or any questions..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-additional"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-wholesale"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </Card>
        </motion.div>

        <div className="mt-12 p-4 border border-red-500/30 rounded-lg bg-red-500/5">
          <p className="text-xs text-red-400/80 text-center animate-pulse-subtle">
            <strong>Research Use Only:</strong> All wholesale orders are subject to verification. 
            Products are sold exclusively for legitimate research purposes. Not for human consumption.
          </p>
        </div>
      </div>
    </main>
  );
}
