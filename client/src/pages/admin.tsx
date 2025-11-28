import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import {
  Package,
  FileCheck,
  ShoppingBag,
  Mail,
  Plus,
  Pencil,
  Trash2,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertCoaSchema, type Product, type Coa, type Order, type Contact } from "@shared/schema";
import { z } from "zod";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  benefits: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const coaFormSchema = insertCoaSchema.extend({
  results: z.string().optional(),
});

type CoaFormValues = z.infer<typeof coaFormSchema>;

function ProductsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      originalPrice: "",
      category: "Peptides",
      inStock: true,
      featured: false,
      benefits: "",
      usage: "",
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        originalPrice: product.originalPrice || "",
        category: product.category,
        inStock: product.inStock ?? true,
        featured: product.featured ?? false,
        benefits: product.benefits?.join(", ") || "",
        usage: product.usage || "",
        imageUrl: product.imageUrl || "",
      });
    } else {
      setEditingProduct(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (values: ProductFormValues) => {
    const data = {
      ...values,
      benefits: values.benefits ? values.benefits.split(",").map((b) => b.trim()).filter(Boolean) : [],
      originalPrice: values.originalPrice || null,
      imageUrl: values.imageUrl || null,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products ({products?.length || 0})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the product details below." : "Fill in the details for the new product."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-short-desc" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} data-testid="input-product-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" data-testid="input-product-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" data-testid="input-product-original-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Benefit 1, Benefit 2, Benefit 3" data-testid="input-product-benefits" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Instructions</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-product-usage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-in-stock"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">In Stock</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-featured"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Featured</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-product">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Product"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {product.inStock ? (
                      <Badge variant="secondary">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                    {product.featured && <Badge className="bg-[#21d8ff]">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)} data-testid={`button-edit-product-${product.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(product.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CoasTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoa, setEditingCoa] = useState<Coa | null>(null);
  const { toast } = useToast();

  const { data: allCoas, isLoading } = useQuery<Coa[]>({
    queryKey: ["/api/admin/coas"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<CoaFormValues>({
    resolver: zodResolver(coaFormSchema),
    defaultValues: {
      batchNumber: "",
      productId: "",
      productName: "",
      testDate: "",
      expirationDate: "",
      purity: "",
      labName: "",
      verified: true,
      results: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/coas", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create COA", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/coas/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA updated successfully" });
      setIsDialogOpen(false);
      setEditingCoa(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update COA", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/coas/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete COA", variant: "destructive" });
    },
  });

  const handleOpenDialog = (coa?: Coa) => {
    if (coa) {
      setEditingCoa(coa);
      form.reset({
        batchNumber: coa.batchNumber,
        productId: coa.productId,
        productName: coa.productName,
        testDate: coa.testDate,
        expirationDate: coa.expirationDate,
        purity: coa.purity,
        labName: coa.labName,
        verified: coa.verified ?? true,
        results: coa.results?.join(", ") || "",
      });
    } else {
      setEditingCoa(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (values: CoaFormValues) => {
    const data = {
      ...values,
      results: values.results ? values.results.split(",").map((r) => r.trim()).filter(Boolean) : [],
    };

    if (editingCoa) {
      updateMutation.mutate({ id: editingCoa.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Certificates of Authenticity ({allCoas?.length || 0})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-coa">
              <Plus className="h-4 w-4 mr-2" />
              Add COA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoa ? "Edit COA" : "Add New COA"}</DialogTitle>
              <DialogDescription>
                {editingCoa ? "Update the COA details below." : "Fill in the certificate of authenticity details."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., BPC-2024-001" data-testid="input-coa-batch" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          const product = products?.find(p => p.id === value);
                          if (product) {
                            form.setValue("productName", product.name);
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-coa-product">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
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
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-coa-product-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="testDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-coa-test-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-coa-expiration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purity</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 99.2%" data-testid="input-coa-purity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lab Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Analytical Labs Inc." data-testid="input-coa-lab" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="results"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Results (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="HPLC Analysis: Pass, Mass Spectrometry: Confirmed, Sterility: Pass" data-testid="input-coa-results" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verified"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-coa-verified"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Verified</FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-coa">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save COA"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Purity</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCoas?.map((coa) => (
              <TableRow key={coa.id} data-testid={`row-coa-${coa.id}`}>
                <TableCell className="font-mono">{coa.batchNumber}</TableCell>
                <TableCell>{coa.productName}</TableCell>
                <TableCell>{coa.purity}</TableCell>
                <TableCell>{coa.labName}</TableCell>
                <TableCell>
                  {coa.verified ? (
                    <Badge variant="secondary">Verified</Badge>
                  ) : (
                    <Badge variant="destructive">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coa)} data-testid={`button-edit-coa-${coa.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(coa.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-coa-${coa.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { toast } = useToast();

  const { data: allOrders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  const getProductName = (productId: string) => {
    return products?.find((p) => p.id === productId)?.name || "Unknown Product";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Orders ({allOrders?.length || 0})</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOrders?.map((order) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.firstName} {order.lastName}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                  </div>
                </TableCell>
                <TableCell>{getProductName(order.productId)}</TableCell>
                <TableCell>${Number(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={order.status || "pending"}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {order.city}, {order.state}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ContactsTab() {
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Contact Submissions ({contacts?.length || 0})</h2>

      {contacts && contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact.id} data-testid={`card-contact-${contact.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <CardDescription>{contact.email}</CardDescription>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(contact.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{contact.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">No Contact Submissions</h3>
          <p className="text-sm text-muted-foreground">
            Contact form submissions will appear here.
          </p>
        </Card>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user?.isAdmin) {
    return (
      <main className="min-h-screen pt-24 md:pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12">
              <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-6" />
              <h1 className="font-display text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access the admin panel. 
                Please contact an administrator if you believe this is an error.
              </p>
              <Button onClick={() => window.location.href = "/dashboard"} data-testid="button-back-to-dashboard">
                Back to Dashboard
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold" data-testid="text-admin-title">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">Manage products, orders, and site content</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full max-w-lg grid-cols-4">
                <TabsTrigger value="products" className="flex items-center gap-2" data-testid="tab-products">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
                <TabsTrigger value="coas" className="flex items-center gap-2" data-testid="tab-coas">
                  <FileCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">COAs</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-2" data-testid="tab-contacts">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Contacts</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card className="p-6">
                  <ProductsTab />
                </Card>
              </TabsContent>

              <TabsContent value="coas">
                <Card className="p-6">
                  <CoasTab />
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card className="p-6">
                  <OrdersTab />
                </Card>
              </TabsContent>

              <TabsContent value="contacts">
                <Card className="p-6">
                  <ContactsTab />
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
