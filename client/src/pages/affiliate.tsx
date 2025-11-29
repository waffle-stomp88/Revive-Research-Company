import { useState, useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Crown,
  Shield,
  Users,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Lock,
  FlaskConical,
  Star,
  DollarSign,
  Gift,
} from "lucide-react";

function AnimatedCounter({ 
  value, 
  prefix = "", 
  suffix = "",
  duration = 2 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.floor(easeOutQuart * value));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

const affiliateFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  socialUrl: z.string().min(1, "Please provide a link to your platform or website"),
  audienceSize: z.string().min(1, "Please tell us about your audience"),
  whyPartner: z.string().min(50, "Please provide at least 50 characters explaining why you want to partner"),
  productExperience: z.string().min(20, "Please describe your experience with peptide research"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type AffiliateFormData = z.infer<typeof affiliateFormSchema>;

export default function AffiliatePage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      socialUrl: "",
      audienceSize: "",
      whyPartner: "",
      productExperience: "",
      agreeToTerms: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AffiliateFormData) => {
      const { agreeToTerms, ...applicationData } = data;
      const urlParams = new URLSearchParams(window.location.search);
      const referrerCode = urlParams.get('ref') || localStorage.getItem('affiliateCode');
      
      const payload = {
        ...applicationData,
        referrerCode: referrerCode || undefined,
      };
      
      const res = await apiRequest("POST", "/api/affiliate-apply", payload);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Received",
        description: "We'll review your application and be in touch if there's a fit.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AffiliateFormData) => {
    submitMutation.mutate(data);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-10 md:pt-36 md:pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9d4edd]/8 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(157,78,221,0.12),transparent_60%)]" />

        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Badge className="mb-4 bg-[#9d4edd]/15 text-[#9d4edd] border-[#9d4edd]/30 px-3 py-1">
              <Award className="h-3 w-3 mr-1.5" />
              PARTNER PROGRAM
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            data-testid="text-affiliate-headline"
          >
            <span className="text-[#9d4edd]">Grow With Us</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6"
            data-testid="text-affiliate-subheadline"
          >
            Join an exclusive network of researchers and wellness professionals. Earn premium commissions representing the gold standard in peptide research.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("apply")}
              className="gap-2 bg-[#E7FB10] text-black font-semibold hover:bg-[#E7FB10]/90 border-2 border-[#E7FB10] shadow-[0_0_20px_rgba(231,251,16,0.3)]"
              data-testid="button-apply-now"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner with Animated Counters */}
      <section id="benefits" className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#9d4edd]/5" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-5 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="text-center"
            >
              <p className="font-display text-2xl md:text-3xl font-bold text-[#E7FB10]">
                <AnimatedCounter value={10} suffix="%" duration={1.5} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tier 1</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <p className="font-display text-2xl md:text-3xl font-bold text-[#21d8ff]">
                <AnimatedCounter value={10} suffix="%" duration={1.5} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tier 2</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="font-display text-2xl md:text-3xl font-bold text-[#9d4edd]">
                <AnimatedCounter value={20} suffix="%" duration={1.5} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Personal</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="font-display text-2xl md:text-3xl font-bold text-[#9d4edd]">
                <AnimatedCounter value={30} duration={1.5} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Day Cookie</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className="font-display text-2xl md:text-3xl font-bold text-[#9d4edd]">
                <AnimatedCounter value={100} prefix="$" duration={1.5} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Min Payout</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Two-Tier Commission Infographics */}
      <section className="py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#9d4edd]/5 to-background" />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              Two-Tier <span className="text-[#9d4edd]">Commission Structure</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Earn from your own sales AND from partners you bring to the program.
            </p>
          </motion.div>

          {/* Tier Infographic Cards */}
          <div className="grid lg:grid-cols-2 gap-5 mb-8">
            {/* Tier 1 Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-5 h-full border-2 border-[#E7FB10]/60 bg-gradient-to-br from-[#E7FB10]/10 to-transparent relative overflow-hidden animate-[pulse-glow-yellow_3s_ease-in-out_infinite]" style={{ boxShadow: '0 0 20px rgba(231, 251, 16, 0.3), inset 0 0 20px rgba(231, 251, 16, 0.05)' }}>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-[#E7FB10] text-black font-bold text-xs">TIER 1</Badge>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E7FB10]/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#E7FB10]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Direct Sales</p>
                    <p className="font-display text-3xl font-bold text-[#E7FB10]">10%</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  When someone uses your public affiliate link or discount code, they receive <span className="text-[#E7FB10] font-semibold">10% off</span> and you earn <span className="text-[#E7FB10] font-semibold">10% commission</span>.
                </p>

                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#E7FB10]" />
                  No caps, no limits, no monthly sales requirement
                </p>

                {/* Visual Flow */}
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[#9d4edd]/20 flex items-center justify-center mx-auto mb-1">
                      <Users className="h-5 w-5 text-[#9d4edd]" />
                    </div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="text-[10px] text-[#E7FB10]">Gets 10% off</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1">
                    <ArrowRight className="h-4 w-4 text-[#E7FB10]" />
                    <span className="text-xs text-muted-foreground hidden sm:inline">your link</span>
                    <ArrowRight className="h-4 w-4 text-[#E7FB10]" />
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[#E7FB10]/20 flex items-center justify-center mx-auto mb-1">
                      <DollarSign className="h-5 w-5 text-[#E7FB10]" />
                    </div>
                    <p className="text-xs text-muted-foreground">You Earn 10%</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tier 2 Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-5 h-full border-2 border-[#21d8ff]/60 bg-gradient-to-br from-[#21d8ff]/10 to-transparent relative overflow-hidden animate-[pulse-glow-cyan_3s_ease-in-out_infinite]" style={{ boxShadow: '0 0 20px rgba(33, 216, 255, 0.3), inset 0 0 20px rgba(33, 216, 255, 0.05)' }}>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-[#21d8ff] text-black font-bold text-xs">TIER 2</Badge>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#21d8ff]/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#21d8ff]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Team Override</p>
                    <p className="font-display text-3xl font-bold text-[#21d8ff]">10%</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  When you recruit someone to join as an affiliate, you earn a <span className="text-[#21d8ff] font-semibold">10% override</span> on all their sales — passive recurring income.
                </p>

                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#21d8ff]" />
                  Your total payout never exceeds 20% per order
                </p>

                {/* Visual Flow */}
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[#9d4edd]/20 flex items-center justify-center mx-auto mb-1">
                      <Users className="h-5 w-5 text-[#9d4edd]" />
                    </div>
                    <p className="text-xs text-muted-foreground">Your Affiliate</p>
                    <p className="text-[10px] text-[#21d8ff]">Earns 10%</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1">
                    <ArrowRight className="h-4 w-4 text-[#21d8ff]" />
                    <span className="text-xs text-muted-foreground hidden sm:inline">makes a sale</span>
                    <ArrowRight className="h-4 w-4 text-[#21d8ff]" />
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[#21d8ff]/20 flex items-center justify-center mx-auto mb-1">
                      <DollarSign className="h-5 w-5 text-[#21d8ff]" />
                    </div>
                    <p className="text-xs text-muted-foreground">You Earn 10%</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Compact Earnings Example + Benefits Row */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Earnings Example */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 border-[#9d4edd]/20 h-full">
                <h4 className="font-semibold text-lg md:text-xl mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#9d4edd]" />
                  Example Monthly Earnings
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">10 sales × $150 × 10%</span>
                    <span className="text-[#E7FB10] font-semibold">$150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team: 15 sales × $120 × 10%</span>
                    <span className="text-[#21d8ff] font-semibold">$180</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between font-semibold">
                    <span>Monthly Total</span>
                    <span className="text-[#9d4edd]">$330</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Why Partner Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 border-[#9d4edd]/20 h-full">
                <h4 className="font-semibold text-xl md:text-2xl mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#9d4edd]" />
                  Partner Benefits
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Crown, text: "Your Premium Products" },
                    { icon: Shield, text: "Your Reputation Protected" },
                    { icon: Zap, text: "Your Priority Support" },
                    { icon: Gift, text: "Your Marketing Assets" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-sm">
                      <item.icon className="h-3 w-3 text-[#9d4edd]" />
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personal Use Discount + Customer Discount */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#9d4edd]/5" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Personal Use Code */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-5 h-full border-2 border-[#9d4edd]/40 bg-gradient-to-br from-[#9d4edd]/10 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#9d4edd]/20 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Private Code</p>
                    <p className="font-display text-2xl font-bold text-[#9d4edd]">20% Off</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Every affiliate receives a <span className="text-[#9d4edd] font-semibold">private 20% personal-use discount</span> code for your own purchases.
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-400" />
                    <span>Not shareable with others</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-400" />
                    <span>Does not generate commissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#9d4edd]" />
                    <span>For your personal use only</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Customer Discount */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-5 h-full border-2 border-[#E7FB10]/40 bg-gradient-to-br from-[#E7FB10]/10 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E7FB10]/20 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-[#E7FB10]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Customer Gets</p>
                    <p className="font-display text-2xl font-bold text-[#E7FB10]">10% Off</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  When customers use your public affiliate link or discount code, they automatically receive <span className="text-[#E7FB10] font-semibold">10% off</span> their purchase.
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#E7FB10]" />
                    <span>Ensures value for your audience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#E7FB10]" />
                    <span>Increases conversion rates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#E7FB10]" />
                    <span>You still earn 10% commission</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who We're Looking For - Compact Horizontal */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
              Who We're <span className="text-[#9d4edd]">Looking For</span>
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: FlaskConical, title: "Research Enthusiasts", desc: "Coaches, clinicians, educators in the peptide space" },
              { icon: Users, title: "Community Leaders", desc: "Built trust with an engaged audience" },
              { icon: Target, title: "Driven Individuals", desc: "Ready to take action and grow" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 h-full border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#9d4edd]/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-[#9d4edd]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Not For Section - Inline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-4 border border-red-500/30 bg-red-950/10">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="font-semibold text-red-400 text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Not a fit for:
                </span>
                {[
                  "Coupon sites",
                  "Unapproved health claims",
                  "Unfamiliar with peptides",
                  "Quick-flip promoters",
                ].map((item) => (
                  <span key={item} className="text-xs text-muted-foreground">
                    • {item}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Application Form - Compact */}
      <section id="apply" className="py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(157,78,221,0.06),transparent_70%)]" />
        
        <div className="container max-w-2xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <Badge className="mb-3 bg-[#9d4edd]/15 text-[#9d4edd] border-[#9d4edd]/30 px-3 py-1">
              <Star className="h-3 w-3 mr-1.5" />
              LIMITED SPOTS
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              Ready to Partner?
            </h2>
            <p className="text-sm text-muted-foreground">
              Tell us about yourself. We review every application personally.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 md:p-6 border-[#9d4edd]/60">
              {submitted ? (
                <motion.div 
                  className="text-center py-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#9d4edd]/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-[#9d4edd]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Application Submitted!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you for your interest. We'll review your application and reach out if there's a fit.
                  </p>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} data-testid="input-full-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Website/Social *</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} data-testid="input-social-url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="audienceSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Audience Size *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 10k followers" {...field} data-testid="input-audience-size" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="productExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Peptide Experience *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your experience with peptide research..."
                              className="resize-none h-16"
                              {...field}
                              data-testid="input-product-experience"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whyPartner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Why Partner With Us? *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us why you want to partner (min 50 chars)..."
                              className="resize-none h-20"
                              {...field}
                              data-testid="input-why-partner"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-agree-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs text-muted-foreground">
                              I agree to the partner program terms and conditions *
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-[#9d4edd] hover:bg-[#9d4edd]/90 text-white font-semibold border-2 border-[#9d4edd] animate-pulse-glow-purple"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-application"
                    >
                      {submitMutation.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Applications reviewed within 48-72 hours
                    </p>
                  </form>
                </Form>
              )}
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Non-MLM Disclaimer */}
      <section className="py-8 relative overflow-hidden border-t border-muted/30">
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-5 border border-muted/30 bg-muted/5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#9d4edd]/10 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-[#9d4edd]" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg md:text-xl mb-1">Official Non-MLM Disclaimer</h4>
                  <p className="text-sm text-muted-foreground">
                    Revive's Affiliate Program is <span className="font-semibold text-foreground">not</span> an MLM or network marketing structure.
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium mb-2">Affiliates earn commissions only on:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-[#9d4edd]" />
                      <span>Their own direct referral sales (10%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-[#9d4edd]" />
                      <span>Sales made by affiliates they personally refer (10%)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Commission payouts stop at one level. There are:</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {["No ranks", "No forced monthly purchases", "No recruitment requirements", "No autoship commitments", "No bonuses for signing people up"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground border-t border-muted/20 pt-3">
                All income is generated solely from product sales, not from recruiting participants. Affiliates can earn without referring anyone to the program. Revive operates strictly as a two-tier affiliate program, similar to standard e-commerce partner programs used by reputable brands worldwide.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA - Minimal */}
      <section className="py-6 relative overflow-hidden border-t border-[#9d4edd]/10">
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-sm text-muted-foreground">
            Questions about the partner program?{" "}
            <a href="mailto:partners@reviveresearch.com" className="text-[#9d4edd] hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
