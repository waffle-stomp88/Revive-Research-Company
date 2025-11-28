import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Package, 
  Truck, 
  CreditCard, 
  RefreshCcw, 
  Shield, 
  FileText,
  AlertTriangle,
  Clock,
  MapPin,
  FlaskConical
} from "lucide-react";

const FAQ_CATEGORIES = [
  {
    title: "Orders & Shipping",
    icon: Truck,
    questions: [
      {
        question: "How quickly will my order ship?",
        answer: "Orders placed before 12:00 PM Central Time on business days ship the same day. All other orders ship within 24 hours. We take pride in our fast fulfillment process to get your research materials to you as quickly as possible."
      },
      {
        question: "What are your shipping rates?",
        answer: "We offer FREE shipping on all orders over $150. For orders under $150, a flat rate of $15 applies regardless of package size or destination within the continental United States."
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within the United States. International shipping may be available in the future. Please check back or contact us for updates."
      },
      {
        question: "What if my package shows up damaged?",
        answer: "If your package arrives damaged, please take photos of both the external packaging and the products inside. Contact our support team within 48 hours of delivery with your order number and photos. We will work with you to resolve the issue promptly."
      },
      {
        question: "What if I accidentally ship to the wrong address?",
        answer: "If you notice an address error before your order ships, contact us immediately and we can update the shipping information. Once an order has shipped, we cannot redirect it. You will be responsible for any additional shipping costs if the package is returned to us and needs to be reshipped."
      },
      {
        question: "What if my package is missing products or contains the wrong items?",
        answer: "Please contact our support team within 48 hours of delivery with your order number, photos of what you received, and a description of the issue. We will investigate and make it right."
      }
    ]
  },
  {
    title: "Returns & Refunds",
    icon: RefreshCcw,
    questions: [
      {
        question: "Do you accept returns?",
        answer: "Due to the sensitive nature of research compounds and strict quality control protocols, we cannot accept returns on any products. Once a product leaves our facility, we cannot guarantee its integrity for reuse in research applications. All sales are final."
      },
      {
        question: "Do you issue refunds?",
        answer: "NO REFUNDS are issued due to the nature of our products. This policy exists to maintain the integrity of our research compounds and protect all researchers. Refunds are only considered on a case-by-case basis for shipping errors on our part. If you believe there was an error with your order, provide your order number and detailed issue description including photos to our customer service team."
      },
      {
        question: "What if my product arrived defective?",
        answer: "Quality is our top priority. If you believe you received a defective product, contact us within 48 hours of delivery with your order number, batch number (found on the product label), and detailed description of the issue. Our quality assurance team will investigate and determine the appropriate resolution."
      },
      {
        question: "Why don't you accept returns?",
        answer: "Research compounds require strict temperature control and chain of custody documentation. Once a product leaves our climate-controlled facility, we cannot verify that it has been stored properly. Accepting returns would compromise the integrity of our inventory and put other researchers at risk of receiving compromised materials."
      }
    ]
  },
  {
    title: "Products & Quality",
    icon: FlaskConical,
    questions: [
      {
        question: "What are Certificates of Authenticity (COAs)?",
        answer: "Every product we sell is accompanied by a Certificate of Authenticity from independent third-party laboratories. COAs verify the purity, identity, and quality of each batch. You can verify your product's COA on our website using the batch number found on your product."
      },
      {
        question: "How do I verify my product's COA?",
        answer: "Visit our COA Verification page and enter the batch number from your product label. This will display the full third-party lab analysis including purity percentage, testing date, and detailed results."
      },
      {
        question: "How should I store my products?",
        answer: "Most peptide compounds should be stored in a cool, dry place away from direct sunlight. Reconstituted peptides should be refrigerated. Always refer to the specific storage instructions provided with your product for best results."
      },
      {
        question: "What is the shelf life of your products?",
        answer: "Unreconstituted lyophilized peptides typically have a shelf life of 24-36 months when stored properly. Once reconstituted, peptides should be used within 2-4 weeks. Expiration dates are printed on each product label."
      },
      {
        question: "Are your products pharmaceutical grade?",
        answer: "Our products are research-grade compounds manufactured to the highest quality standards with verified purity levels. They are intended for research use only and are not manufactured under FDA pharmaceutical guidelines."
      }
    ]
  },
  {
    title: "Payment & Billing",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as debit cards. All transactions are processed securely through our encrypted payment system."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes. We use industry-standard SSL encryption and never store your complete credit card information on our servers. All payment processing is handled by our PCI-compliant payment partner."
      },
      {
        question: "When will I be charged?",
        answer: "Your payment method is charged immediately when you place your order. You will receive an email confirmation with your order details and receipt."
      },
      {
        question: "Can I get an invoice for my order?",
        answer: "Yes. An invoice is automatically included in your order confirmation email. You can also access your order history and invoices from your account dashboard."
      }
    ]
  },
  {
    title: "Account & Orders",
    icon: Package,
    questions: [
      {
        question: "How do I track my order?",
        answer: "Once your order ships, you will receive an email with tracking information. You can also log into your account dashboard to view real-time tracking updates for all your orders."
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Orders can only be modified or cancelled before they ship. Given our same-day shipping policy, please contact us immediately if you need to make changes. Once an order has shipped, it cannot be cancelled."
      },
      {
        question: "Do I need an account to place an order?",
        answer: "While you can check out as a guest, creating an account allows you to track orders, view order history, save shipping addresses, and access exclusive offers."
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer: "Click the 'Forgot Password' link on the login page. Enter your email address and we'll send you a password reset link. If you don't receive the email within a few minutes, check your spam folder."
      }
    ]
  },
  {
    title: "Legal & Compliance",
    icon: Shield,
    questions: [
      {
        question: "What is 'Research Use Only' (RUO)?",
        answer: "Research Use Only means our products are sold exclusively for legitimate research purposes. They are not intended for human or animal consumption, diagnostic procedures, or therapeutic use. By purchasing, you confirm that you will use these compounds in accordance with all applicable laws and regulations."
      },
      {
        question: "Who can purchase from Revive Research?",
        answer: "Our products are available to qualified researchers, laboratories, academic institutions, and individuals conducting legitimate research. All purchasers must be 21 years of age or older and agree to our terms of service."
      },
      {
        question: "Are your products FDA approved?",
        answer: "Our products are sold as research chemicals and are not FDA approved for human use. They are manufactured for research purposes only and should never be used for human or animal consumption."
      },
      {
        question: "What happens if I misuse your products?",
        answer: "Purchasers assume full responsibility for the proper use, handling, storage, and disposal of all products. Misuse violates our terms of service and may violate federal, state, or local laws. Revive Research is not responsible for any misuse of our products."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-faq-title">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about orders, shipping, products, and policies. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-6 mb-8 border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Important: No Refund Policy</h3>
                <p className="text-muted-foreground">
                  Due to the sensitive nature of research compounds and strict quality control protocols, 
                  <span className="font-semibold text-foreground"> all sales are final and no refunds are issued</span>. 
                  This policy ensures the integrity of our products for all researchers. Please review 
                  your order carefully before completing your purchase.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-8">
          {FAQ_CATEGORIES.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + categoryIndex * 0.05 }}
            >
              <Card className="overflow-hidden" data-testid={`faq-category-${categoryIndex + 1}`}>
                <div className="p-6 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-bold">{category.title}</h2>
                  </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${category.title}-${index}`}
                      className="border-b last:border-b-0"
                      data-testid={`faq-item-${categoryIndex + 1}-${index + 1}`}
                    >
                      <AccordionTrigger className="px-6 text-left font-medium hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="p-8 text-center bg-muted/30">
            <h3 className="font-display text-xl font-bold mb-3">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help with any questions not covered above.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shipping">
                <Button variant="outline" data-testid="link-shipping-info">
                  <Truck className="h-4 w-4 mr-2" />
                  Shipping Details
                </Button>
              </Link>
              <Link href="/coa">
                <Button variant="outline" data-testid="link-verify-coa">
                  <FileText className="h-4 w-4 mr-2" />
                  Verify COA
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
