import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  FlaskConical,
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  CheckCircle,
} from "lucide-react";
import type { Product, InsertOrder } from "@shared/schema";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Please enter a valid ZIP code"),
  country: z.string().min(2, "Country is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("productId");
  const quantity = parseInt(searchParams.get("quantity") || "1", 10);

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      if (!product) throw new Error("No product selected");
      
      const orderData: InsertOrder = {
        ...data,
        productId: product.id,
        quantity,
        totalAmount: (Number(product.price) * quantity).toFixed(2),
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();
      return order;
    },
    onSuccess: (data: { id: string }) => {
      setOrderId(data.id || "");
      setOrderComplete(true);
      toast({
        title: "Order Placed Successfully!",
        description: "You will receive a confirmation email shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    orderMutation.mutate(data);
  };

  if (!productId) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">No Product Selected</h2>
          <p className="text-muted-foreground mb-6">
            Please select a product to purchase.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (orderComplete) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center max-w-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-foreground" />
              </div>
            </motion.div>
            <h2 className="font-display text-2xl font-bold mb-2" data-testid="text-order-success">
              Order Confirmed!
            </h2>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. Your order ID is:
            </p>
            <p className="font-mono text-lg font-semibold mb-6" data-testid="text-order-id">
              {orderId.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              A confirmation email has been sent to your email address with order details and tracking information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              <Link href="/coa">
                <Button>Verify COA</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </main>
    );
  }

  if (productLoading) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-2">
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're trying to purchase doesn't exist.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const subtotal = Number(product.price) * quantity;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href={`/products/${product.id}`}>
            <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-product">
              <ArrowLeft className="h-4 w-4" />
              Back to Product
            </Button>
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl md:text-4xl font-bold mb-8"
          data-testid="text-checkout-title"
        >
          Checkout
        </motion.h1>

        <div className="grid lg:grid-cols-5 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">
                    Contact Information
                  </h2>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your@email.com"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              {...field}
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              {...field}
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Research Lane"
                              {...field}
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="San Francisco"
                              {...field}
                              data-testid="input-city"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-state">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
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
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="94102"
                              {...field}
                              data-testid="input-zip"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment
                  </h2>
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-2">
                      Secure payment processing
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payment will be collected securely upon order submission.
                    </p>
                  </div>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-display text-lg gap-2"
                  disabled={orderMutation.isPending}
                  data-testid="button-place-order"
                >
                  {orderMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      Place Order - ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 sticky top-32">
              <h2 className="font-display text-xl font-semibold mb-6">
                Order Summary
              </h2>
              
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold truncate" data-testid="text-order-product-name">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                  <p className="font-semibold mt-1">${Number(product.price).toFixed(2)}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">Free</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-display text-lg font-semibold">Total</span>
                <span className="font-display text-2xl font-bold" data-testid="text-order-total">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>COA included with shipment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
