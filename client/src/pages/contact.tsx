import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Mail, 
  MessageSquare, 
  User, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  HelpCircle,
  Wrench,
  BookOpen,
  ArrowRight,
  Truck,
  Tag,
} from "lucide-react";

const CONTACT_TOPICS = [
  { value: "order_issue", label: "Order Issue", placeholder: "Please include your order number and describe the issue..." },
  { value: "product_question", label: "Product Question", placeholder: "What would you like to know about our products?" },
  { value: "shipping", label: "Shipping & Delivery", placeholder: "Include your order number if applicable. Describe your shipping question..." },
  { value: "wholesale", label: "Wholesale Inquiry", placeholder: "Tell us about your organization and estimated order volume..." },
  { value: "website_feedback", label: "Website Feedback", placeholder: "Let us know what's not working or what could be better..." },
  { value: "other", label: "Other", placeholder: "How can we help you?" },
] as const;

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  topic: z.string().min(1, "Please select a topic"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getResponseTimeByTimeZone(): string {
  const now = new Date();
  const ctTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const ctHour = ctTime.getHours();
  const isOffHours = ctHour >= 17 || ctHour < 9;
  return isOffHours ? "12 hours" : "2-4 hours";
}

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [responseTime, setResponseTime] = useState("2-4 hours");

  useEffect(() => {
    setResponseTime(getResponseTimeByTimeZone());
    const interval = setInterval(() => {
      setResponseTime(getResponseTimeByTimeZone());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: "",
      message: "",
    },
  });

  const selectedTopic = form.watch("topic");
  const messagePlaceholder = CONTACT_TOPICS.find(t => t.value === selectedTopic)?.placeholder || "How can we help you?";

  const mutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
      toast({
        title: "Message Sent",
        description: "We'll get back to you as soon as possible.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    mutation.mutate(data);
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Contact" description="Get in touch with our research support team. Fast response times for order inquiries and product questions." canonicalPath="/contact" />
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            <motion.div variants={itemVariants} className="text-center mb-12 relative">
              <div className="absolute inset-0 -top-24 -z-10 bg-gradient-to-b from-[#9d4edd]/20 via-[#21d8ff]/5 to-transparent blur-[80px] rounded-full h-[400px] w-[400px] mx-auto opacity-70" />
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[#9d4edd]/30 to-[#21d8ff]/20 mb-6 border border-[#9d4edd]/40 relative shadow-[0_0_20px_rgba(157,78,221,0.2)]">
                <div className="absolute inset-0 rounded-full bg-[#9d4edd]/30 animate-ping opacity-40" />
                <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[#9d4edd]/20 to-[#21d8ff]/10 blur-sm" />
                <Mail className="h-10 w-10 text-[#9d4edd] relative z-10" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight" data-testid="text-contact-title">
                Get In Touch
              </h1>
              <div className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                <p>Expert research support for those who don't wait for permission.</p>
                <p>Our team typically responds within <span className="text-[#21d8ff] font-medium">{responseTime}</span>.</p>
              </div>
            </motion.div>

          {/* Self-Service Resources - Before You Reach Out */}
          <motion.div variants={itemVariants} className="mb-10">
            <Card className="p-6 border-[#21d8ff]/20 bg-gradient-to-r from-[#21d8ff]/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#21d8ff]/10 flex-shrink-0">
                  <HelpCircle className="h-6 w-6 text-[#21d8ff]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold mb-2">Before You Reach Out</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Many questions can be answered instantly! Check out these helpful resources:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link href="/troubleshooting">
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[#21d8ff]/40 hover:bg-[#21d8ff]/5 transition-colors cursor-pointer" data-testid="link-troubleshooting">
                        <Wrench className="h-4 w-4 text-[#21d8ff]" />
                        <span className="text-sm font-medium">Troubleshooting</span>
                        <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                      </div>
                    </Link>
                    <Link href="/faq">
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[#E7FB10]/40 hover:bg-[#E7FB10]/5 transition-colors cursor-pointer" data-testid="link-faq">
                        <HelpCircle className="h-4 w-4 text-[#E7FB10]" />
                        <span className="text-sm font-medium">FAQ</span>
                        <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                      </div>
                    </Link>
                    <Link href="/education">
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[#ec4899]/40 hover:bg-[#ec4899]/5 transition-colors cursor-pointer" data-testid="link-education">
                        <BookOpen className="h-4 w-4 text-[#ec4899]" />
                        <span className="text-sm font-medium">Education</span>
                        <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="border-[#9d4edd]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#9d4edd]" />
                    Send a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="font-display text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We'll respond to your inquiry shortly.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSubmitted(false)}
                        data-testid="btn-send-another"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Your Name
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  {...field}
                                  data-testid="input-contact-name"
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
                              <FormLabel className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="john@example.com" 
                                  {...field}
                                  data-testid="input-contact-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="topic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Topic
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-contact-topic">
                                    <SelectValue placeholder="What can we help you with?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CONTACT_TOPICS.map((topic) => (
                                    <SelectItem key={topic.value} value={topic.value} data-testid={`option-topic-${topic.value}`}>
                                      {topic.label}
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
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Message
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={messagePlaceholder}
                                  className="min-h-[150px] resize-none"
                                  {...field}
                                  data-testid="input-contact-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-[#9d4edd] text-white hover:bg-black hover:text-[#9d4edd] border border-[#9d4edd] hover:border-[#9d4edd] transition-all duration-300"
                          disabled={mutation.isPending}
                          data-testid="btn-submit-contact"
                        >
                          {mutation.isPending ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <Card className="border-[#21d8ff]/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#21d8ff]/20 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-[#21d8ff]" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Response Time</h3>
                      <p className="text-sm text-muted-foreground">
                        Current expected response: <span className="text-[#21d8ff] font-medium">{responseTime}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2 leading-tight">
                        Our team is available 9 AM - 5 PM CT, Mon - Fri.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30">
                <h4 className="font-medium text-[#E7FB10] mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Status
                </h4>
                <p className="text-sm text-muted-foreground">
                  Orders placed before 12 PM CT ship same-day. 
                  <Link href="/dashboard" className="text-[#E7FB10] hover:underline ml-1">Track my order →</Link>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/30">
                <h4 className="font-medium text-[#9d4edd] mb-2">Order Issues?</h4>
                <p className="text-sm text-muted-foreground">
                  Please include your order number in your message for faster assistance with order-related inquiries.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RUO Disclaimer - Full width below the form */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="p-4 rounded-lg border-2 border-red-500/40 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse-subtle">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-400 text-sm">Research Use Only</h3>
                  <p className="text-sm text-muted-foreground">
                    All products are intended for laboratory research purposes only. Not for human consumption.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
