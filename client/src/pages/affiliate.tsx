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
  heading: "Please Note",
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
            <Card className="p-6 md:p-8 border-muted-foreground/20 bg-muted/30" data-testid="card-not-for">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-3 text-muted-foreground">
                <XCircle className="h-5 w-5" />
                {NOT_FOR.heading}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {NOT_FOR.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
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
