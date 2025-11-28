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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Link2,
  Share2,
  DollarSign,
  Dumbbell,
  Video,
  Building2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// ============================================
// EDITABLE CONTENT - Modify text here
// ============================================

const HERO_CONTENT = {
  headline: "Earn More by Helping People Feel Better.",
  subheadline: "Join the Revive Research affiliate program and earn commission on every order you refer.",
  primaryButton: "Apply Now",
  secondaryLink: "View Program Details",
};

const HOW_IT_WORKS_STEPS = [
  {
    icon: FileText,
    title: "Apply",
    description: "Tell us who you are and how you promote.",
  },
  {
    icon: Link2,
    title: "Get Your Link",
    description: "Receive your unique referral link and discount code.",
  },
  {
    icon: Share2,
    title: "Share",
    description: "Share with your audience via content, email, or personal network.",
  },
  {
    icon: DollarSign,
    title: "Get Paid",
    description: "Earn 20% commission on every qualified order.",
  },
];

const PROGRAM_DETAILS = {
  heading: "Program Details",
  description: "Our affiliate program is designed for creators, coaches, and health professionals who are passionate about helping their audience access premium research compounds. We provide everything you need to succeed—from marketing materials to dedicated support.",
  stats: {
    commission: "20%",
    commissionLabel: "per sale",
    cookieWindow: "30 days",
    payouts: "Monthly via PayPal",
    payoutNote: "(after 30-day refund window)",
    minimumPayout: "$100",
  },
  disclaimer: "Terms and commission rates are subject to change. Affiliates will be notified of any updates.",
};

const WHO_THIS_IS_FOR = [
  {
    icon: Dumbbell,
    title: "Coaches & Trainers",
    description: "Help your clients achieve better recovery and performance with research-grade compounds.",
  },
  {
    icon: Video,
    title: "Content Creators & Influencers",
    description: "Monetize your health and wellness content with products your audience will love.",
  },
  {
    icon: Building2,
    title: "Clinics & Wellness Practices",
    description: "Offer your patients access to verified, lab-tested research peptides.",
  },
];

const BENEFITS_CONTENT = {
  heading: "Why Partner With Us",
  description: "We've built a program that sets you up for success. Our products speak for themselves, and our support ensures you have everything you need.",
  benefits: [
    "High-quality research products with COAs.",
    "Strong average order values and repeat customers.",
    "Ready-to-use product imagery and mockups.",
    "Dedicated support for top performers.",
  ],
};

const FAQ_ITEMS = [
  {
    question: "How do I get paid?",
    answer: "We process all affiliate payouts via PayPal. Make sure your PayPal email is up to date in your affiliate dashboard.",
  },
  {
    question: "When are payouts processed?",
    answer: "Payouts are processed on the 15th of each month for commissions earned in the previous month, after the 30-day refund window has passed.",
  },
  {
    question: "Can I use paid ads with my affiliate link?",
    answer: "Yes, paid advertising is allowed. However, you may not bid on branded keywords (e.g., 'Revive Research') or create ads that could be confused with official company advertising.",
  },
  {
    question: "Can I promote offline?",
    answer: "Absolutely! You can share your referral code with clients, patients, or anyone in your network. Just ensure they use your code at checkout.",
  },
  {
    question: "What happens if a customer refunds?",
    answer: "If a customer requests a refund within 30 days, the commission for that order will be deducted from your balance. This is why we have a 30-day hold before payouts.",
  },
];

const APPLICATION_CONTENT = {
  heading: "Apply to Become an Affiliate",
  subheading: "We review every application to keep the program high quality.",
  submitButton: "Submit Application",
  successMessage: "Thanks! Your application has been received.",
};

// ============================================
// FORM SCHEMA
// ============================================

const affiliateFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  socialUrl: z.string().optional(),
  promotionPlan: z.string().min(20, "Please tell us more about how you plan to promote (at least 20 characters)"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type AffiliateFormData = z.infer<typeof affiliateFormSchema>;

// ============================================
// COMPONENT
// ============================================

export default function AffiliatePage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      socialUrl: "",
      promotionPlan: "",
      agreeToTerms: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AffiliateFormData) => {
      const res = await apiRequest("POST", "/api/affiliate-apply", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Received",
        description: APPLICATION_CONTENT.successMessage,
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            {...fadeInUp}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            data-testid="text-affiliate-headline"
          >
            {HERO_CONTENT.headline}
          </motion.h1>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            data-testid="text-affiliate-subheadline"
          >
            {HERO_CONTENT.subheadline}
          </motion.p>
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("apply")}
              data-testid="button-apply-now"
            >
              {HERO_CONTENT.primaryButton}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => scrollToSection("how-it-works")}
              data-testid="link-program-details"
            >
              {HERO_CONTENT.secondaryLink}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center hover-elevate" data-testid={`card-step-${index + 1}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission & Program Details Section */}
      <section id="program-details" className="py-20 md:py-28 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
          >
            {PROGRAM_DETAILS.heading}
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                {PROGRAM_DETAILS.description}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 md:p-8" data-testid="card-program-stats">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Commission</span>
                    <span className="font-display text-2xl font-bold">
                      {PROGRAM_DETAILS.stats.commission}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        {PROGRAM_DETAILS.stats.commissionLabel}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Cookie Window</span>
                    <span className="font-semibold">{PROGRAM_DETAILS.stats.cookieWindow}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Payouts</span>
                    <div className="text-right">
                      <span className="font-semibold">{PROGRAM_DETAILS.stats.payouts}</span>
                      <p className="text-xs text-muted-foreground">{PROGRAM_DETAILS.stats.payoutNote}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground">Minimum Payout</span>
                    <span className="font-semibold">{PROGRAM_DETAILS.stats.minimumPayout}</span>
                  </div>
                </div>
              </Card>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                {PROGRAM_DETAILS.disclaimer}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Who This Is For
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHO_THIS_IS_FOR.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover-elevate" data-testid={`card-audience-${index + 1}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                {BENEFITS_CONTENT.heading}
              </h2>
              <p className="text-lg text-muted-foreground">
                {BENEFITS_CONTENT.description}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ul className="space-y-4">
                {BENEFITS_CONTENT.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index + 1}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="py-20 md:py-28 bg-muted/30">
        <div className="container max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {APPLICATION_CONTENT.heading}
            </h2>
            <p className="text-muted-foreground">
              {APPLICATION_CONTENT.subheading}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground">{APPLICATION_CONTENT.successMessage}</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
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
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram / TikTok / Website URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://instagram.com/yourhandle"
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
                      name="promotionPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How do you plan to promote Revive Research? *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your audience and promotion strategy..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="input-promotion-plan"
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
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal cursor-pointer">
                              I agree to the Affiliate Terms and Conditions *
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-application"
                    >
                      {submitMutation.isPending ? "Submitting..." : APPLICATION_CONTENT.submitButton}
                    </Button>
                  </form>
                </Form>
              )}
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
