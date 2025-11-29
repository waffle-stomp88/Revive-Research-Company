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
      {/* Compact Hero Section */}
      <section className="relative pt-24 pb-8 md:pt-28 md:pb-12 overflow-hidden">
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
              className="gap-2 bg-[#9d4edd] text-white font-semibold hover:bg-[#9d4edd]/90 shadow-[0_0_20px_rgba(157,78,221,0.3)]"
              data-testid="button-apply-now"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner - Compact */}
      <section id="benefits" className="py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#9d4edd]/5" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-4 gap-4">
            {[
              { value: "20%", label: "Commission" },
              { value: "30", label: "Day Cookie" },
              { value: "$100", label: "Min Payout" },
              { value: "10%", label: "Tier 2" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-center"
              >
                <p className="font-display text-2xl md:text-3xl font-bold text-[#9d4edd]">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-Column: Commission + Why Partner */}
      <section className="py-10 md:py-14 relative">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Commission Structure - Compact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-5 h-full border-[#9d4edd]/30">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-[#9d4edd]" />
                  <h3 className="font-display text-lg font-bold">Two-Tier Commissions</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Tier 1 */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-[#E7FB10]/5 border border-[#E7FB10]/20">
                    <div className="w-12 h-12 rounded-xl bg-[#E7FB10]/10 flex items-center justify-center shrink-0">
                      <span className="font-display text-xl font-bold text-[#E7FB10]">20%</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Direct Sales</p>
                      <p className="text-xs text-muted-foreground">Earn on every customer you refer</p>
                    </div>
                    <Badge className="ml-auto bg-[#E7FB10] text-black text-xs">TIER 1</Badge>
                  </div>
                  
                  {/* Tier 2 */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20">
                    <div className="w-12 h-12 rounded-xl bg-[#21d8ff]/10 flex items-center justify-center shrink-0">
                      <span className="font-display text-xl font-bold text-[#21d8ff]">10%</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Team Sales</p>
                      <p className="text-xs text-muted-foreground">Earn when affiliates you recruit sell</p>
                    </div>
                    <Badge className="ml-auto bg-[#21d8ff] text-black text-xs">TIER 2</Badge>
                  </div>
                </div>

                {/* Quick Example */}
                <div className="mt-4 p-3 bg-black/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Example Monthly Earnings:</p>
                  <div className="flex justify-between text-sm">
                    <span>10 sales × $150 × 20%</span>
                    <span className="text-[#E7FB10] font-semibold">$300</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Team makes 15 sales × $120 × 10%</span>
                    <span className="text-[#21d8ff] font-semibold">$180</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Monthly Total</span>
                    <span className="text-[#9d4edd]">$480</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Why Partner - Compact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-5 h-full border-[#9d4edd]/30">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-[#9d4edd]" />
                  <h3 className="font-display text-lg font-bold">Why Partner With Us</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { icon: Crown, title: "Premium Products", desc: "Lab-verified compounds trusted by serious researchers" },
                    { icon: Shield, title: "Your Reputation Matters", desc: "Transparent testing and ethical practices" },
                    { icon: Zap, title: "Priority Support", desc: "Dedicated partner success team" },
                    { icon: Gift, title: "Marketing Assets", desc: "Professional content library provided" },
                    { icon: Lock, title: "Exclusive Access", desc: "Early products & partner promos" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#9d4edd]/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-[#9d4edd]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
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
            <h2 className="font-display text-2xl font-bold">
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
                      <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
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
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
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
            <Card className="p-5 md:p-6 border-[#9d4edd]/30">
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
                      className="w-full bg-[#9d4edd] hover:bg-[#9d4edd]/90 text-white font-semibold shadow-[0_0_20px_rgba(157,78,221,0.3)]"
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
