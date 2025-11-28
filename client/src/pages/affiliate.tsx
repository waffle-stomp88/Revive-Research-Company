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
} from "lucide-react";

const HERO_CONTENT = {
  eyebrow: "BY INVITATION ONLY",
  headline: "We Don't Need Partners.\nWe Choose Them.",
  subheadline: "Revive Research provides the value. We're selective about who represents our brand. If you're here looking for quick money, this isn't for you. If you're committed to excellence—let's talk.",
};

const VALUE_PROPS = [
  {
    icon: Crown,
    title: "Premium Products, Premium Partners",
    description: "Our research compounds are lab-verified and trusted by serious researchers. We partner with people who share that standard.",
  },
  {
    icon: Shield,
    title: "Your Reputation Is Our Priority",
    description: "When you partner with us, you're associating with quality. We won't damage your credibility with subpar products or shady practices.",
  },
  {
    icon: TrendingUp,
    title: "We Invest in Your Success",
    description: "Selected partners receive marketing assets, priority support, and competitive commissions. We make it easy for you to succeed.",
  },
];

const IDEAL_PARTNER = {
  heading: "Who We're Looking For",
  subheading: "This program is exclusive. We're not looking for just anyone—we're looking for the right fit.",
  qualifications: [
    {
      icon: FlaskConical,
      title: "Research-Focused Professionals",
      description: "Coaches, clinicians, wellness practitioners, or educators in the peptide research space who understand the science.",
    },
    {
      icon: Users,
      title: "Engaged, Quality Audiences",
      description: "You've built trust with your community. They come to you for guidance—not just deals.",
    },
    {
      icon: Target,
      title: "Action-Takers Only",
      description: "People who execute. No tire-kickers. No 'maybe laters.' If you apply, you're ready to commit.",
    },
  ],
};

const NOT_FOR = {
  heading: "This Program Is NOT For",
  items: [
    "Coupon/discount sites looking to spam codes",
    "Anyone promising overnight results or making health claims",
    "People who haven't tried or don't understand our products",
    "Those primarily motivated by quick commissions over quality",
    "Anyone unwilling to follow our brand and compliance guidelines",
  ],
};

const PROGRAM_BENEFITS = {
  heading: "What We Provide",
  benefits: [
    {
      icon: Award,
      title: "20% Commission",
      description: "On every qualified sale. No caps, no limits.",
    },
    {
      icon: Zap,
      title: "Priority Support",
      description: "Dedicated partner success manager for top performers.",
    },
    {
      icon: Sparkles,
      title: "Marketing Assets",
      description: "Professional product images, copy, and educational content.",
    },
    {
      icon: Lock,
      title: "Exclusive Access",
      description: "Early access to new products and partner-only promotions.",
    },
  ],
  stats: [
    { value: "20%", label: "Commission Rate" },
    { value: "30 Day", label: "Cookie Window" },
    { value: "$100", label: "Min Payout" },
    { value: "Monthly", label: "Payouts via PayPal" },
  ],
};

const APPLICATION_CONTENT = {
  heading: "Apply for Partnership",
  subheading: "Tell us about yourself. We review every application personally.",
  note: "Applications typically reviewed within 48-72 hours. We'll reach out if there's a fit.",
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <main className="min-h-screen">
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(231,251,16,0.05),transparent_50%)]" />
        <div className="container max-w-4xl mx-auto px-4 text-center relative">
          <motion.div {...fadeInUp}>
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              <Crown className="h-3 w-3 mr-2" />
              {HERO_CONTENT.eyebrow}
            </Badge>
          </motion.div>
          <motion.h1
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 whitespace-pre-line"
            data-testid="text-affiliate-headline"
          >
            {HERO_CONTENT.headline}
          </motion.h1>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            data-testid="text-affiliate-subheadline"
          >
            {HERO_CONTENT.subheadline}
          </motion.p>
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("apply")}
              className="gap-2"
              data-testid="button-apply-now"
            >
              Apply for Partnership
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              We Provide the Value
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our products, quality, and reputation speak for themselves. Partners benefit from what we've already built.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_PROPS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover-elevate" data-testid={`card-value-${index + 1}`}>
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

      <section className="py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {IDEAL_PARTNER.heading}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {IDEAL_PARTNER.subheading}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {IDEAL_PARTNER.qualifications.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full border-primary/30 bg-primary/5" data-testid={`card-qual-${index + 1}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 md:p-8 border-destructive/30 bg-destructive/5" data-testid="card-not-for">
              <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3">
                <XCircle className="h-6 w-6 text-destructive" />
                {NOT_FOR.heading}
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {NOT_FOR.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/30">
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
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {PROGRAM_BENEFITS.benefits.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center hover-elevate" data-testid={`card-benefit-${index + 1}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 md:p-8" data-testid="card-program-stats">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {PROGRAM_BENEFITS.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="font-display text-3xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="apply" className="py-20 md:py-28">
        <div className="container max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <Star className="h-3 w-3 mr-2" />
              LIMITED SPOTS
            </Badge>
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
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Application Submitted</h3>
                  <p className="text-muted-foreground">
                    We'll review your application and reach out if there's a fit. 
                    Thank you for your interest in partnering with Revive Research.
                  </p>
                </div>
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
                              className="min-h-[120px]"
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
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal cursor-pointer">
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
                      className="w-full"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-application"
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit Application"}
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
    </main>
  );
}
