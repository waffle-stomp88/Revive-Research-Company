import { useState } from "react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { 
  Building2, CheckCircle2, FileText, Users, Truck, Shield, HeadphonesIcon, 
  Package, Send, Loader2, Calculator, ArrowRight, Sparkles, Award, 
  BadgeCheck, Lock, Minus, Plus, Check, Zap, TrendingUp
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

const wholesaleFormSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, "Phone number must contain only numbers and common formatting characters").min(10, "Phone number must be at least 10 digits"),
  businessType: z.string().min(1, "Please select your business type"),
  estimatedMonthlyVolume: z.string().min(1, "Please select estimated volume"),
  shippingCountry: z.string().min(1, "Please select your shipping country"),
  intendedUseCategory: z.string().min(1, "Please select your intended use category"),
  website: z.string().optional(),
  targetTimeline: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type WholesaleFormData = z.infer<typeof wholesaleFormSchema>;

const pricingTiers = [
  { 
    range: "100–249", 
    discount: "20%", 
    label: "Bronze",
    color: "#21d8ff" 
  },
  { 
    range: "250–499", 
    discount: "25%", 
    label: "Silver",
    color: "#E7FB10" 
  },
  { 
    range: "500–999", 
    discount: "30%", 
    label: "Gold",
    color: "#a855f7" 
  },
  { 
    range: "1000+", 
    discount: "35%", 
    label: "Elite",
    color: "#22c55e" 
  },
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

const countries = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Australia",
  "New Zealand",
  "Japan",
  "Other",
];

const intendedUseCategories = [
  "Academic / Laboratory Research",
  "Product Development / R&D",
  "Distribution / Resale",
  "Other (explain in additional information)",
];

const timelineOptions = [
  "Immediately",
  "30–60 days",
  "60–90 days",
  "Exploring options",
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

  const getTierColor = (qty: number) => {
    if (qty >= 1000) return "#22c55e";
    if (qty >= 500) return "#a855f7";
    if (qty >= 250) return "#E7FB10";
    if (qty >= 100) return "#21d8ff";
    return "#6b7280";
  };
  
  const discount = getDiscount(quantity);
  const retailTotal = quantity * basePrice;
  const wholesaleTotal = retailTotal * (1 - discount);
  const savings = retailTotal - wholesaleTotal;
  const tierLabel = getTierLabel(quantity);
  const tierColor = getTierColor(quantity);
  
  return (
    <Card className="p-6 md:p-8 border-2 border-[#E7FB10]/50 bg-gradient-to-br from-[#E7FB10]/10 to-transparent">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#E7FB10]/30 flex items-center justify-center">
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
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Retail Price</p>
            <p className="text-xl font-bold line-through text-muted-foreground">${retailTotal.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30">
            <p className="text-xs text-muted-foreground mb-1">Wholesale Price</p>
            <p className="text-xl font-bold text-[#22c55e]">${wholesaleTotal.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#E7FB10]/30 to-[#22c55e]/30 border border-[#E7FB10]/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Savings</p>
              <p className="text-3xl font-bold text-[#E7FB10]">Up to ${savings.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <Badge style={{ backgroundColor: tierColor, color: tierColor === "#E7FB10" ? "black" : "white" }} className="mb-1">{tierLabel}</Badge>
              <p className="text-lg font-bold text-[#22c55e]">Up to {(discount * 100).toFixed(0)}% OFF</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40">
          <p className="text-xs text-center text-red-400 font-medium flex items-center justify-center gap-2">
            <span className="text-lg">⚠️</span>
            Discounts vary by compound. Final pricing confirmed after application review.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function Wholesale() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<WholesaleFormData>({
    resolver: zodResolver(wholesaleFormSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      businessType: "",
      estimatedMonthlyVolume: "",
      shippingCountry: "",
      intendedUseCategory: "",
      website: "",
      targetTimeline: "",
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
      <SEOHead title="Wholesale Program" description="Wholesale pricing for institutions and resellers. Contact us for volume discounts." canonicalPath="/wholesale" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center mb-20"
        >
          <div className="absolute inset-0 -z-10">
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
              style={{ background: "radial-gradient(circle, #21d8ff 0%, #a855f7 50%, transparent 70%)" }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#21d8ff]/20 border border-[#21d8ff]/40 mb-6"
          >
            <Building2 className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-sm font-semibold text-[#21d8ff]">B2B Supply Partner</span>
          </motion.div>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Scale Your Business with{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#21d8ff] via-[#a855f7] to-[#E7FB10] text-transparent bg-clip-text">
                Premium Supply
              </span>
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-[#21d8ff]/20 via-[#a855f7]/20 to-[#E7FB10]/20 blur-xl -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl mb-10">
            Partner with us for reliable peptide supply. Tiered discounts, dedicated support, 
            and quality you can trust.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90 px-8"
              onClick={() => document.getElementById('application')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-apply-hero"
            >
              Apply Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 px-8"
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-calculator-hero"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Calculate Savings
            </Button>
          </div>
        </motion.div>

        {/* Animated Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-20"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1a1f] via-[#22222a] to-[#1a1a1f] border border-[#2a2a32] p-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(33,216,255,0.1),_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(168,85,247,0.1),_transparent_50%)]" />
            
            <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-[#2a2a32]">
              {[
                { value: "99%+", label: "Purity Verified", icon: Shield, color: "#22c55e" },
                { value: "24-48hr", label: "Fast Shipping", icon: Truck, color: "#21d8ff" },
                { value: "100+", label: "Active Partners", icon: Users, color: "#a855f7" },
                { value: "35%", label: "Max Discount", icon: TrendingUp, color: "#E7FB10" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="p-6 md:p-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -3, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                      className="inline-block mb-2"
                    >
                      <Icon className="h-6 w-6 mx-auto" style={{ color: stat.color }} />
                    </motion.div>
                    <p className="font-display text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Volume Discount Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-10">
            <Badge className="bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30 mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              Volume Pricing
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              The More You Order, The More You Save
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Unlock deeper discounts as your volume grows. All tiers include mix & match flexibility.
            </p>
          </div>
          
          {/* Tier Progress Bar */}
          <div className="relative max-w-4xl mx-auto">
            {/* Background track */}
            <div className="h-3 rounded-full bg-[#2a2a32] mb-8 overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ 
                  background: "linear-gradient(90deg, #21d8ff 0%, #E7FB10 33%, #a855f7 66%, #22c55e 100%)" 
                }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              />
            </div>
            
            {/* Tier markers */}
            <div className="flex justify-between">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.15 }}
                >
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center relative"
                    style={{ 
                      backgroundColor: `${tier.color}15`,
                      border: `2px solid ${tier.color}40`
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      borderColor: tier.color
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 0 0 ${tier.color}00`,
                        `0 0 30px 5px ${tier.color}30`,
                        `0 0 0 0 ${tier.color}00`
                      ]
                    }}
                    transition={{
                      boxShadow: {
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5
                      }
                    }}
                  >
                    <span 
                      className="font-display text-xl md:text-2xl font-bold"
                      style={{ color: tier.color }}
                    >
                      {tier.discount}
                    </span>
                  </motion.div>
                  <p className="font-semibold text-sm md:text-base" style={{ color: tier.color }}>
                    {tier.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{tier.range} vials</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
            Discounts apply up to each compound's wholesale price floor. Final pricing provided upon approval.
          </p>
        </motion.div>

        {/* How It Works - Connected Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-20"
        >
          <div className="text-center mb-10">
            <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30 mb-3">
              Simple Process
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Get Started in 3 Steps
            </h2>
          </div>
          
          <div className="relative max-w-3xl mx-auto">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#21d8ff] via-[#E7FB10] to-[#22c55e]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-4">
              {[
                { step: 1, title: "Apply", desc: "Complete our quick form with your business details", icon: FileText, color: "#21d8ff" },
                { step: 2, title: "Get Approved", desc: "Our team reviews within 24-48 hours", icon: BadgeCheck, color: "#E7FB10" },
                { step: 3, title: "Start Ordering", desc: "Access wholesale pricing and place bulk orders", icon: Package, color: "#22c55e" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.2 }}
                    className="text-center relative"
                  >
                    <motion.div
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center relative"
                      style={{ 
                        background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                        border: `2px solid ${item.color}`
                      }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.4
                      }}
                    >
                      <Icon className="h-10 w-10" style={{ color: item.color }} />
                      <span 
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: item.color, color: item.color === "#E7FB10" ? "black" : "white" }}
                      >
                        {item.step}
                      </span>
                    </motion.div>
                    <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Savings Calculator + Benefits */}
        <motion.div
          id="calculator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <SavingsCalculator />
            
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">Why Partner With Us?</h3>
                <p className="text-muted-foreground">Everything you need to grow your business with confidence.</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { text: "Minimum order just 100 vials — mix & match any products", icon: Package },
                  { text: "Full COA access with batch-specific documentation", icon: FileText },
                  { text: "Priority shipping — most orders ship within 24-48 hours", icon: Truck },
                  { text: "Dedicated account manager for personalized support", icon: Users },
                  { text: "99%+ purity guaranteed on every batch", icon: Shield },
                  { text: "Extended B2B support hours for business accounts", icon: HeadphonesIcon },
                ].map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#21d8ff]/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#21d8ff]/20 transition-colors">
                        <Icon className="h-4 w-4 text-[#21d8ff]" />
                      </div>
                      <span className="text-sm">{benefit.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Application Form */}
        <motion.div
          id="application"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 md:p-8 max-w-2xl mx-auto border-2 border-[#21d8ff]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#21d8ff]/5 to-transparent -z-10" />
            
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold mb-2">Apply for Wholesale Account</h2>
              <p className="text-muted-foreground">
                Complete the form below and we'll review your application within 24-48 hours.
              </p>
            </div>

            {submitted ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </motion.div>
                <h3 className="font-display text-xl font-bold mb-2">Application Received!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thank you for your interest. Our wholesale team will review your application 
                  and reach out within 24-48 business hours.
                </p>
              </motion.div>
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
                            <Input 
                              placeholder="Your Company LLC" 
                              {...field} 
                              data-testid="input-business-name"
                              className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}
                            />
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
                            <Input 
                              placeholder="John Smith" 
                              {...field} 
                              data-testid="input-contact-name"
                              className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}
                            />
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
                            <Input 
                              type="email" 
                              placeholder="contact@company.com" 
                              {...field} 
                              data-testid="input-email"
                              className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}
                            />
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
                            <Input 
                              type="tel" 
                              placeholder="(555) 123-4567" 
                              {...field} 
                              data-testid="input-phone"
                              className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}
                            />
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
                              <SelectTrigger data-testid="select-business-type" className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
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
                              <SelectTrigger data-testid="select-volume" className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}>
                                <SelectValue placeholder="Select volume" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {volumeOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Shipping Country / Region *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country" className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="intendedUseCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intended Research or Distribution Context *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-use-category" className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {intendedUseCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
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
                    name="targetTimeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Start Timeline (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-timeline" className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timelineOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://yourcompany.com" 
                            {...field} 
                            data-testid="input-website"
                            className={field.value ? "bg-blue-500/20 border-blue-500/50" : ""}
                          />
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
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your business and what compounds you're interested in..."
                            className={`min-h-[100px] ${field.value ? "bg-blue-500/20 border-blue-500/50" : ""}`}
                            {...field}
                            data-testid="textarea-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center text-xs text-blue-400">
                    Wholesale access is subject to verification, minimum order requirements, and approval. Submission does not guarantee acceptance.
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-application"
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
      </div>
    </main>
  );
}
