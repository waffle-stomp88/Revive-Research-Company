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
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Lock,
  FlaskConical,
  Star,
  Terminal,
  DollarSign,
  Gift,
  CircuitBoard,
} from "lucide-react";

const HERO_CONTENT = {
  eyebrow: "// PARTNER_PROTOCOL",
  headline: "SYNC WITH US",
  subheadline: "Join an elite network of researchers, educators, and wellness professionals. Earn premium commissions while representing the gold standard in peptide research compounds.",
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
  heading: "TARGET_PROFILE",
  subheading: "We partner with driven individuals who share our commitment to quality and education.",
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
  heading: "ACCESS_DENIED",
  items: [
    "Coupon sites focused only on discounts",
    "Anyone making unapproved health claims",
    "Those unfamiliar with our product category",
    "Quick-flip promoters without genuine interest",
  ],
};

const PROGRAM_BENEFITS = {
  heading: "PARTNER_PERKS",
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
  heading: "INITIATE_CONNECTION",
  subheading: "Submit your credentials. We review every application personally.",
  note: "Applications processed within 48-72 hours. We'll establish contact if there's a match.",
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

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div 
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(#21d8ff 1px, transparent 1px),
          linear-gradient(90deg, #21d8ff 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    />
    <div 
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(#21d8ff 1px, transparent 1px),
          linear-gradient(90deg, #21d8ff 1px, transparent 1px)
        `,
        backgroundSize: "10px 10px",
      }}
    />
  </div>
);

const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#21d8ff]/30 to-transparent pointer-events-none"
    animate={{
      top: ["0%", "100%"],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const GlitchText = ({ children, className }: { children: string; className?: string }) => (
  <motion.span
    className={`relative inline-block ${className}`}
    whileHover={{
      textShadow: [
        "0 0 0 transparent",
        "-2px 0 #21d8ff, 2px 0 #E7FB10",
        "0 0 0 transparent",
      ],
    }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.span>
);

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
      const res = await apiRequest("POST", "/api/affiliate-apply", applicationData);
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
    <main className="min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <GridBackground />
        <ScanLine />
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#21d8ff]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#21d8ff]/3 rounded-full blur-[80px] pointer-events-none" />

        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge 
              className="mb-6 bg-transparent border border-[#21d8ff]/50 text-[#21d8ff] font-mono text-xs tracking-wider"
            >
              <Terminal className="h-3 w-3 mr-2" />
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
            <GlitchText className="text-[#21d8ff] drop-shadow-[0_0_30px_rgba(33,216,255,0.5)]">
              {HERO_CONTENT.headline}
            </GlitchText>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
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
              className="gap-2 bg-[#21d8ff] text-black font-bold hover:bg-[#21d8ff]/90 shadow-[0_0_30px_rgba(33,216,255,0.4)] hover:shadow-[0_0_50px_rgba(33,216,255,0.6)] transition-all duration-300 border-0"
              data-testid="button-apply-now"
            >
              <CircuitBoard className="h-4 w-4" />
              INITIALIZE
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("benefits")}
              className="gap-2 border-[#21d8ff]/30 text-[#21d8ff] hover:bg-[#21d8ff]/10 hover:border-[#21d8ff]/50 bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              VIEW_PERKS
            </Button>
          </motion.div>
        </div>

        {/* Bottom border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#21d8ff]/20" />
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #21d8ff, transparent)" }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </section>

      {/* Value Props Section */}
      <section className="py-20 md:py-28 relative bg-[#0d0d12]">
        <GridBackground />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#21d8ff] font-mono text-sm mb-4 tracking-widest">// WHY_PARTNER</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              BUILT FOR <span className="text-[#21d8ff]">SUCCESS</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
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
                  className="p-6 h-full bg-[#12121a] border-[#21d8ff]/10 hover:border-[#21d8ff]/40 transition-all duration-500 group"
                  data-testid={`card-value-${index + 1}`}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20 flex items-center justify-center mb-5 group-hover:shadow-[0_0_20px_rgba(33,216,255,0.2)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <item.icon className="h-7 w-7 text-[#21d8ff]" />
                  </motion.div>
                  <h3 className="font-display text-xl font-semibold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section id="benefits" className="py-16 relative overflow-hidden bg-[#0a0a0f] border-y border-[#21d8ff]/10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#21d8ff]/5 via-transparent to-[#21d8ff]/5" />
        
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {PROGRAM_BENEFITS.stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <motion.p 
                  className="font-display text-4xl md:text-5xl font-bold mb-2 text-[#21d8ff] drop-shadow-[0_0_10px_rgba(33,216,255,0.3)]"
                  whileHover={{ scale: 1.05 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-gray-600 uppercase tracking-widest font-mono">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 md:py-28 relative bg-[#0d0d12]">
        <GridBackground />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#21d8ff] font-mono text-sm mb-4 tracking-widest">// {PROGRAM_BENEFITS.heading}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              What You Get
            </h2>
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
                  className="p-6 h-full text-center bg-[#12121a] border-[#21d8ff]/10 hover:border-[#21d8ff]/30 transition-all duration-300 group"
                  data-testid={`card-benefit-${index + 1}`}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20 flex items-center justify-center mx-auto mb-4 group-hover:shadow-[0_0_25px_rgba(33,216,255,0.2)] transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <item.icon className="h-8 w-8 text-[#21d8ff]" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who We're Looking For */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-[#0a0a0f]">
        <GridBackground />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#21d8ff] font-mono text-sm mb-4 tracking-widest">// {IDEAL_PARTNER.heading}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              Ideal Partners
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
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
                  className="p-6 h-full bg-[#12121a] border-[#21d8ff]/20 hover:border-[#21d8ff]/40 hover:shadow-[0_0_30px_rgba(33,216,255,0.1)] transition-all duration-300" 
                  data-testid={`card-qual-${index + 1}`}
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className="w-12 h-12 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/30 flex items-center justify-center flex-shrink-0"
                      whileHover={{ rotate: 5 }}
                    >
                      <item.icon className="h-6 w-6 text-[#21d8ff]" />
                    </motion.div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2 text-white">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
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
            <Card className="p-6 md:p-8 bg-[#12121a] border-red-500/20" data-testid="card-not-for">
              <h3 className="font-mono text-sm font-semibold mb-4 flex items-center gap-3 text-red-400">
                <XCircle className="h-4 w-4" />
                {NOT_FOR.heading}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {NOT_FOR.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-red-500/50 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 md:py-28 relative overflow-hidden bg-[#0d0d12]">
        <GridBackground />
        
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#21d8ff]/20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#21d8ff]/20 pointer-events-none" />
        
        <div className="container max-w-2xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(33,216,255,0.2)",
                  "0 0 40px rgba(33,216,255,0.4)",
                  "0 0 20px rgba(33,216,255,0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block rounded mb-6"
            >
              <Badge className="bg-[#21d8ff]/10 text-[#21d8ff] border border-[#21d8ff]/30 font-mono text-xs">
                <Star className="h-3 w-3 mr-2" />
                LIMITED_SLOTS
              </Badge>
            </motion.div>
            <p className="text-[#21d8ff] font-mono text-sm mb-4 tracking-widest">// {APPLICATION_CONTENT.heading}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Connect?
            </h2>
            <p className="text-gray-500">
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
              className="p-6 md:p-8 bg-[#12121a] border-[#21d8ff]/20 shadow-[0_0_60px_rgba(33,216,255,0.05)]"
            >
              {submitted ? (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div 
                    className="w-20 h-20 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/30 flex items-center justify-center mx-auto mb-6"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(33,216,255,0.2)",
                        "0 0 40px rgba(33,216,255,0.4)",
                        "0 0 20px rgba(33,216,255,0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="h-10 w-10 text-[#21d8ff]" />
                  </motion.div>
                  <h3 className="font-display text-2xl font-semibold mb-3 text-white">CONNECTION_ESTABLISHED</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
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
                            <FormLabel className="text-gray-300">Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                className="bg-[#0a0a0f] border-[#21d8ff]/20 focus:border-[#21d8ff]/50 text-white placeholder:text-gray-600 transition-colors"
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
                            <FormLabel className="text-gray-300">Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="bg-[#0a0a0f] border-[#21d8ff]/20 focus:border-[#21d8ff]/50 text-white placeholder:text-gray-600 transition-colors"
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
                          <FormLabel className="text-gray-300">Your Platform / Website *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://instagram.com/yourhandle or your website"
                              className="bg-[#0a0a0f] border-[#21d8ff]/20 focus:border-[#21d8ff]/50 text-white placeholder:text-gray-600 transition-colors"
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
                          <FormLabel className="text-gray-300">Audience Size & Type *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 15K Instagram followers, mostly fitness enthusiasts"
                              className="bg-[#0a0a0f] border-[#21d8ff]/20 focus:border-[#21d8ff]/50 text-white placeholder:text-gray-600 transition-colors"
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
                          <FormLabel className="text-gray-300">Your Experience with Peptide Research *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Describe your background or experience with peptides"
                              className="bg-[#0a0a0f] border-[#21d8ff]/20 focus:border-[#21d8ff]/50 text-white placeholder:text-gray-600 transition-colors"
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
                          <FormLabel className="text-gray-300">Why Do You Want to Partner With Us? *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What makes you a good fit? How would you represent our brand?"
                              className="min-h-[120px] bg-[#0a0a0f] border-[#21d8ff]/20 focus:border-[#21d8ff]/50 text-white placeholder:text-gray-600 transition-colors"
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
                              className="border-[#21d8ff]/50 data-[state=checked]:bg-[#21d8ff] data-[state=checked]:border-[#21d8ff]"
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal cursor-pointer text-sm text-gray-400">
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
                      className="w-full bg-[#21d8ff] hover:bg-[#21d8ff]/90 text-black font-bold shadow-[0_0_30px_rgba(33,216,255,0.3)] hover:shadow-[0_0_50px_rgba(33,216,255,0.5)] transition-all duration-300"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-application"
                    >
                      {submitMutation.isPending ? (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="font-mono"
                        >
                          PROCESSING...
                        </motion.span>
                      ) : (
                        <>
                          <Terminal className="h-4 w-4 mr-2" />
                          SUBMIT_APPLICATION
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-600 font-mono">
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
      <section className="py-12 relative overflow-hidden bg-[#0a0a0f] border-t border-[#21d8ff]/10">
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-600 font-mono text-sm"
          >
            Questions? Contact{" "}
            <a href="mailto:partners@reviveresearch.com" className="text-[#21d8ff] hover:underline">
              partners@reviveresearch.com
            </a>
          </motion.p>
        </div>
      </section>
    </main>
  );
}
