import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Building2, CheckCircle2, FileText, Users, Truck, Shield, HeadphonesIcon, Package, Send, Loader2 } from "lucide-react";
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
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  businessType: z.string().min(1, "Please select your business type"),
  estimatedMonthlyVolume: z.string().min(1, "Please select estimated volume"),
  website: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type WholesaleFormData = z.infer<typeof wholesaleFormSchema>;

const pricingTiers = [
  { range: "100-249 vials", discount: "20% OFF", color: "border-[#21d8ff]" },
  { range: "250-499 vials", discount: "25% OFF", color: "border-[#E7FB10]" },
  { range: "500-999 vials", discount: "30% OFF", color: "border-purple-500" },
  { range: "1000+ vials", discount: "35% Custom", color: "border-green-500" },
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#21d8ff]/10 border border-[#21d8ff]/30 mb-4">
            <Building2 className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-sm font-medium text-[#21d8ff]">B2B Supply</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Wholesale Program
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Premium peptide supply for clinics, research facilities, and resellers. 
            Tiered pricing, dedicated support, and full documentation for every order.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4 mb-12"
        >
          {pricingTiers.map((tier, index) => (
            <Card
              key={tier.range}
              className={`p-5 text-center border-2 ${tier.color}`}
              data-testid={`card-tier-${index}`}
            >
              <p className="text-sm text-muted-foreground mb-1">{tier.range}</p>
              <p className="font-display text-2xl font-bold text-[#E7FB10]">{tier.discount}</p>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="p-5 border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#21d8ff]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-[#21d8ff]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
