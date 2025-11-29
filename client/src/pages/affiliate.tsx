import { useState } from "react";
import { motion } from "framer-motion";
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

const HERO_CONTENT = {
  eyebrow: "PARTNER PROGRAM",
  headline: "Grow With Us",
  subheadline: "Join an exclusive network of researchers, educators, and wellness professionals. Earn premium commissions while representing the gold standard in peptide research compounds.",
};

const VALUE_PROPS = [
  {
    icon: Crown,
    title: "Premium Products",
    description: "Lab-verified research compounds trusted by serious researchers worldwide. Quality you can stand behind.",
  },
  {
    icon: Shield,
    title: "Your Reputation Matters",
    description: "We protect your credibility with transparent testing, verified purity, and ethical business practices.",
  },
  {
    icon: TrendingUp,
    title: "Built for Success",
    description: "Marketing assets, dedicated support, and competitive commissions. Everything you need to thrive.",
  },
];

const IDEAL_PARTNER = {
  heading: "Who We're Looking For",
  subheading: "We partner with passionate individuals who share our commitment to quality and education.",
  qualifications: [
    {
      icon: FlaskConical,
      title: "Research Enthusiasts",
      description: "Coaches, clinicians, educators, or content creators in the peptide and wellness space.",
    },
    {
      icon: Users,
      title: "Community Leaders",
      description: "You've built trust with an engaged audience who values your recommendations.",
    },
    {
      icon: Target,
      title: "Driven Individuals",
      description: "People who take action and are ready to grow alongside our brand.",
    },
  ],
};

const NOT_FOR = {
  heading: "Not a Fit For",
  items: [
    "Coupon sites focused only on discounts",
    "Anyone making unapproved health claims",
    "Those unfamiliar with our product category",
    "Quick-flip promoters without genuine interest",
  ],
};

const PROGRAM_BENEFITS = {
  heading: "Partner Benefits",
  benefits: [
    {
      icon: DollarSign,
      title: "20% Commission",
      description: "On every qualified sale. No caps.",
    },
    {
      icon: Zap,
      title: "Priority Support",
      description: "Dedicated partner success team.",
    },
    {
      icon: Gift,
      title: "Marketing Assets",
      description: "Professional content library.",
    },
    {
      icon: Lock,
      title: "Exclusive Access",
      description: "Early products & partner promos.",
    },
  ],
  stats: [
    { value: "20%", label: "Commission" },
    { value: "30", label: "Day Cookie" },
    { value: "$100", label: "Min Payout" },
    { value: "Monthly", label: "Payouts" },
  ],
};

const APPLICATION_CONTENT = {
  heading: "Ready to Partner?",
  subheading: "Tell us about yourself. We review every application personally.",
  note: "Applications reviewed within 48-72 hours. We'll reach out if there's a fit.",
};

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#9d4edd]/8 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(157,78,221,0.12),transparent_60%)]" />

        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge 
              className="mb-6 bg-[#9d4edd]/15 text-[#9d4edd] border-[#9d4edd]/30 px-4 py-1.5 text-sm"
            >
              <Award className="h-3.5 w-3.5 mr-2" />
              {HERO_CONTENT.eyebrow}
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            data-testid="text-affiliate-headline"
          >
            <span className="text-[#9d4edd]">
              {HERO_CONTENT.headline}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            data-testid="text-affiliate-subheadline"
          >
            {HERO_CONTENT.subheadline}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("apply")}
              className="gap-2 bg-[#9d4edd] text-white font-semibold hover:bg-[#9d4edd]/90 shadow-[0_0_20px_rgba(157,78,221,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] transition-all duration-300"
              data-testid="button-apply-now"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("benefits")}
              className="gap-2 border-[#9d4edd]/40 hover:border-[#9d4edd] hover:bg-[#9d4edd]/10"
            >
              Learn More
            </Button>
          </motion.div>
        </div>

        {/* Subtle bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9d4edd]/30 to-transparent" />
      </section>

      {/* Value Props Section */}
      <section className="py-20 md:py-28 relative">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[#9d4edd]/10 text-[#9d4edd] border-[#9d4edd]/30">
              <Star className="h-3 w-3 mr-2" />
              WHY PARTNER WITH US
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="text-[#9d4edd]">Your Success</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our products and reputation speak for themselves. As a partner, you benefit from everything we've built.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {VALUE_PROPS.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
              >
                <Card 
                  className="p-6 h-full border-[#9d4edd]/20 transition-all duration-300 hover:border-[#9d4edd]/40 hover:shadow-[0_0_20px_rgba(157,78,221,0.1)]"
                  data-testid={`card-value-${index + 1}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-[#9d4edd]/10"
                  >
                    <item.icon className="h-7 w-7 text-[#9d4edd]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section id="benefits" className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#9d4edd]/5" />
        
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PROGRAM_BENEFITS.stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-4xl md:text-5xl font-bold mb-2 text-[#9d4edd]">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-Tier Commission Explanation */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#9d4edd]/5 to-background" />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[#9d4edd]/10 text-[#9d4edd] border-[#9d4edd]/30">
              <DollarSign className="h-3 w-3 mr-2" />
              HOW YOU EARN
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Two-Tier <span className="text-[#9d4edd]">Commission Structure</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Earn from your own sales AND from partners you bring to the program. Build a team, multiply your income.
            </p>
          </motion.div>

          {/* Visual Infographic */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Tier 1 Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 h-full border-2 border-[#E7FB10]/40 bg-gradient-to-br from-[#E7FB10]/10 to-transparent relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#E7FB10] text-black font-bold">TIER 1</Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#E7FB10]/20 flex items-center justify-center">
                    <Users className="h-8 w-8 text-[#E7FB10]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Direct Sales</p>
                    <p className="font-display text-4xl font-bold text-[#E7FB10]">20%</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Every time someone uses your unique referral link to make a purchase, you earn <span className="text-[#E7FB10] font-semibold">20% of the order total</span>. No caps, no limits.
                </p>

                {/* Visual Flow */}
                <div className="flex items-center justify-between bg-black/30 rounded-xl p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#9d4edd]/20 flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-[#9d4edd]" />
                    </div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-[#E7FB10]" />
                    <span className="mx-2 text-xs text-muted-foreground">buys via your link</span>
                    <ArrowRight className="h-5 w-5 text-[#E7FB10]" />
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#E7FB10]/20 flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="h-6 w-6 text-[#E7FB10]" />
                    </div>
                    <p className="text-xs text-muted-foreground">You Earn 20%</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tier 2 Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 h-full border-2 border-[#21d8ff]/40 bg-gradient-to-br from-[#21d8ff]/10 to-transparent relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#21d8ff] text-black font-bold">TIER 2</Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#21d8ff]/20 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-[#21d8ff]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Team Sales</p>
                    <p className="font-display text-4xl font-bold text-[#21d8ff]">10%</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  When you refer someone to become an affiliate, you earn <span className="text-[#21d8ff] font-semibold">10% of every sale they make</span>. Build a team, earn passively.
                </p>

                {/* Visual Flow */}
                <div className="flex items-center justify-between bg-black/30 rounded-xl p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#9d4edd]/20 flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-[#9d4edd]" />
                    </div>
                    <p className="text-xs text-muted-foreground">Your Affiliate</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-[#21d8ff]" />
                    <span className="mx-2 text-xs text-muted-foreground">makes a sale</span>
                    <ArrowRight className="h-5 w-5 text-[#21d8ff]" />
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#21d8ff]/20 flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="h-6 w-6 text-[#21d8ff]" />
                    </div>
                    <p className="text-xs text-muted-foreground">You Earn 10%</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Example Earnings Scenario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 border-[#9d4edd]/30 bg-gradient-to-r from-[#9d4edd]/5 via-transparent to-[#9d4edd]/5">
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl font-bold mb-2">
                  See Your Earning Potential
                </h3>
                <p className="text-muted-foreground">Real example of how commissions add up</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Scenario Setup */}
                <div className="text-center p-6 bg-black/20 rounded-xl">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Monthly Scenario</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-[#E7FB10]">10</span> customers buy via your link</p>
                    <p>Average order: <span className="text-[#E7FB10]">$150</span></p>
                    <p><span className="text-[#21d8ff]">3</span> affiliates on your team</p>
                    <p>Each makes <span className="text-[#21d8ff]">5 sales</span> averaging $120</p>
                  </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="text-center p-6 bg-black/20 rounded-xl">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Your Earnings</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tier 1 (10 x $150 x 20%)</span>
                      <span className="font-semibold text-[#E7FB10]">$300</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tier 2 (15 x $120 x 10%)</span>
                      <span className="font-semibold text-[#21d8ff]">$180</span>
                    </div>
                    <div className="h-px bg-white/20 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Monthly Total</span>
                      <span className="font-display text-2xl font-bold text-[#9d4edd]">$480</span>
                    </div>
                  </div>
                </div>

                {/* Scale Message */}
                <div className="text-center p-6 bg-gradient-to-br from-[#9d4edd]/20 to-transparent rounded-xl border border-[#9d4edd]/30">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Scale It Up</p>
                  <p className="font-display text-3xl font-bold text-[#9d4edd] mb-2">$5,760/yr</p>
                  <p className="text-sm text-muted-foreground mb-4">from this example alone</p>
                  <p className="text-xs text-muted-foreground">
                    Grow your audience and team to multiply these numbers. Top partners earn <span className="text-[#E7FB10] font-semibold">$2,000+/month</span>.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid md:grid-cols-3 gap-6 text-center"
          >
            <div className="p-4">
              <CheckCircle className="h-8 w-8 text-[#9d4edd] mx-auto mb-3" />
              <h4 className="font-semibold mb-1">No Earning Caps</h4>
              <p className="text-sm text-muted-foreground">There's no limit to how much you can earn each month</p>
            </div>
            <div className="p-4">
              <CheckCircle className="h-8 w-8 text-[#9d4edd] mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Lifetime Attribution</h4>
              <p className="text-sm text-muted-foreground">30-day cookie ensures you get credit for referred sales</p>
            </div>
            <div className="p-4">
              <CheckCircle className="h-8 w-8 text-[#9d4edd] mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Monthly Payouts</h4>
              <p className="text-sm text-muted-foreground">Get paid reliably every month with $100 minimum</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {PROGRAM_BENEFITS.heading}
            </h2>
            <p className="text-muted-foreground">Everything you need to succeed as a partner</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {PROGRAM_BENEFITS.benefits.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
              >
                <Card 
                  className="p-6 h-full text-center border-[#9d4edd]/20 transition-all duration-300 hover:border-[#9d4edd]/40"
                  data-testid={`card-benefit-${index + 1}`}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#9d4edd]/10"
                  >
                    <item.icon className="h-8 w-8 text-[#9d4edd]" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who We're Looking For */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[#9d4edd]/10 text-[#9d4edd] border-[#9d4edd]/30">
              <Users className="h-3 w-3 mr-2" />
              IDEAL PARTNERS
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {IDEAL_PARTNER.heading}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {IDEAL_PARTNER.subheading}
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {IDEAL_PARTNER.qualifications.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
              >
                <Card 
                  className="p-6 h-full border-[#9d4edd]/20 transition-all duration-300 hover:border-[#9d4edd]/40" 
                  data-testid={`card-qual-${index + 1}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#9d4edd]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-[#9d4edd]" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card 
              className="p-6 md:p-8 border-2 border-red-500/40 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]" 
              data-testid="card-not-for"
            >
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-3 text-red-400">
                <XCircle className="h-5 w-5" />
                {NOT_FOR.heading}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {NOT_FOR.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-red-400/70 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-200/80">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 md:py-28 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(157,78,221,0.08),transparent_70%)]" />
        
        <div className="container max-w-2xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 bg-[#9d4edd]/15 text-[#9d4edd] border-[#9d4edd]/30 px-4 py-1.5">
              <Star className="h-3.5 w-3.5 mr-2" />
              LIMITED SPOTS AVAILABLE
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {APPLICATION_CONTENT.heading}
            </h2>
            <p className="text-muted-foreground">
              {APPLICATION_CONTENT.subheading}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="p-6 md:p-8 border-[#9d4edd]/30"
            >
              {submitted ? (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 rounded-full bg-[#9d4edd]/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-[#9d4edd]" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-3">Application Submitted!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Thank you for your interest in partnering with Revive Research. 
                    We'll review your application and reach out if there's a fit.
                  </p>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                className="border-muted-foreground/20 focus:border-[#9d4edd] transition-colors"
                                {...field}
                                data-testid="input-full-name"
                              />
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
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="border-muted-foreground/20 focus:border-[#9d4edd] transition-colors"
                                {...field}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="socialUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Platform / Website *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://instagram.com/yourhandle or your website"
                              className="border-muted-foreground/20 focus:border-[#9d4edd] transition-colors"
                              {...field}
                              data-testid="input-social-url"
                            />
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
                          <FormLabel>Audience Size & Type *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 15K Instagram followers, mostly fitness enthusiasts"
                              className="border-muted-foreground/20 focus:border-[#9d4edd] transition-colors"
                              {...field}
                              data-testid="input-audience-size"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Experience with Peptide Research *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Describe your background or experience with peptides"
                              className="border-muted-foreground/20 focus:border-[#9d4edd] transition-colors"
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
                          <FormLabel>Why Do You Want to Partner With Us? *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What makes you a good fit? How would you represent our brand?"
                              className="min-h-[120px] border-muted-foreground/20 focus:border-[#9d4edd] transition-colors"
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
                              className="border-[#9d4edd]/50 data-[state=checked]:bg-[#9d4edd] data-[state=checked]:border-[#9d4edd]"
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              I understand this is a selective program and agree to follow Revive Research's brand guidelines and compliance standards *
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#9d4edd] hover:bg-[#9d4edd]/90 text-white font-semibold shadow-[0_0_20px_rgba(157,78,221,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.4)] transition-all duration-300"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-application"
                    >
                      {submitMutation.isPending ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      {APPLICATION_CONTENT.note}
                    </p>
                  </form>
                </Form>
              )}
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#9d4edd]/3" />
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-muted-foreground">
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
