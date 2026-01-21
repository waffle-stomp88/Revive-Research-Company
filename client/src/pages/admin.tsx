import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, Pencil, Trash2, Package, Check, X, 
  ChevronLeft, ChevronRight, Upload, Loader2, 
  FileCheck, Star, Tag, Inbox, Mail, Search,
  TrendingDown, TrendingUp, Minus, Users,
  BarChart, Bell, Settings, LogOut, LayoutDashboard
} from "lucide-react";
import { 
  Product, insertProductSchema, 
  Order, 
  Coa, insertCoaSchema, 
  Contact, 
  Affiliate, 
  AffiliateApplication, 
  PriceHistory, 
  User 
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { PriceTrendBadge } from "@/components/price-trend-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ProductFormValues = typeof insertProductSchema._type;
type CoaFormValues = typeof insertCoaSchema._type;

interface DosageStockItem {
  dosage: string;
  stockAmount: number;
  inStock: boolean;
  price: string | null;
  originalPrice: string | null;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      setLocation("/");
    },
  });

  if (userLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !user.isAdmin) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-[#21d8ff]" />
            <h1 className="text-2xl font-display font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Logged in as {user.firstName || user.email || 'Admin'}</span>
            <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="coas" className="flex items-center gap-2 ml-2">
              <FileCheck className="h-4 w-4" />
              COAs
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 ml-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2 ml-2">
              <Inbox className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-2 ml-2">
              <Users className="h-4 w-4" />
              Affiliates
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2 ml-2">
              <BarChart className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2 ml-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </div>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="coas">
            <CoasTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="contacts">
            <ContactsTab />
          </TabsContent>
          <TabsContent value="affiliates">
            <AffiliatesTab />
          </TabsContent>
          <TabsContent value="pricing">
            <PricingTab />
          </TabsContent>
          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ProductsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dosageStocks, setDosageStocks] = useState<DosageStockItem[]>([]);
  const [newDosage, setNewDosage] = useState("");
  const itemsPerPage = 10;
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: productsWithStock } = useQuery<any[]>({
    queryKey: ["/api/admin/products-with-stock"],
  });

  // Calculate landing page status
  const landingPageProductCount = products?.filter(p => p.showOnLandingPage).length || 0;
  const isLandingPageFull = landingPageProductCount >= 3;

  const totalPages = products ? Math.ceil(products.length / itemsPerPage) : 0;
  const productsToDisplay = products?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    const tableElement = document.getElementById('products-table-top');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const form = useForm({
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: "0",
      originalPrice: "",
      category: "",
      benefits: "",
      usage: "",
      imageUrl: "",
      featured: false,
      inStock: true,
      stockAmount: 0,
      showOnLandingPage: false,
      isWeeklyDeal: false,
      weeklyDealEndDate: null,
      dosageOptions: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
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
      const response = await apiRequest("PATCH", `/api/products/${id}`, data);
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

  const syncDosageStocksMutation = useMutation({
    mutationFn: async ({ productId, dosageStocks }: { productId: string; dosageStocks: DosageStockItem[] }) => {
      const response = await apiRequest("POST", `/api/admin/products/${productId}/sync-dosage-stocks`, { dosageStocks });
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
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
      setProductImageUrl(product.imageUrl || null);
      
      const dosageInfo = productsWithStock?.find(p => p.id === product.id);
      if (dosageInfo?.dosageStocks) {
        setDosageStocks(dosageInfo.dosageStocks);
      } else {
        setDosageStocks(product.dosageOptions?.map(d => ({
          dosage: d,
          stockAmount: product.stockAmount || 0,
          inStock: product.inStock || false,
          price: product.price,
          originalPrice: product.originalPrice
        })) || []);
      }

      form.reset({
        name: product.name,
        shortDescription: product.shortDescription || "",
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || "",
        category: product.category,
        benefits: product.benefits?.join(", ") || "",
        usage: product.usage || "",
        imageUrl: product.imageUrl || "",
        stockAmount: product.stockAmount || 0,
        dosageOptions: product.dosageOptions?.join(", ") || "",
        featured: product.featured || false,
        inStock: product.inStock || false,
        showOnLandingPage: product.showOnLandingPage || false,
        isWeeklyDeal: product.isWeeklyDeal || false,
        weeklyDealEndDate: product.weeklyDealEndDate || null,
      });
    } else {
      setEditingProduct(null);
      setProductImageUrl(null);
      setDosageStocks([{ dosage: "10mg", stockAmount: 0, inStock: true, price: null, originalPrice: null }]);
      form.reset({
        name: "",
        shortDescription: "",
        description: "",
        price: "0",
        originalPrice: "",
        category: "",
        benefits: "",
        usage: "",
        imageUrl: "",
        featured: false,
        inStock: true,
        stockAmount: 0,
        showOnLandingPage: false,
        isWeeklyDeal: false,
        weeklyDealEndDate: null,
        dosageOptions: "",
      });
    }
    setNewDosage("");
    setIsDialogOpen(true);
  };

  const updateDosageStock = (index: number, field: keyof DosageStockItem, value: any) => {
    setDosageStocks(prev => prev.map((ds, i) => {
      if (i === index) {
        const updated = { ...ds, [field]: value };
        if (field === 'inStock' && value === false) {
          updated.stockAmount = 0;
        }
        return updated;
      }
      return ds;
    }));
  };

  const addDosage = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    const trimmedDosage = newDosage.trim().toUpperCase();
    if (!trimmedDosage) return;
    if (dosageStocks.some(ds => ds.dosage.toUpperCase() === trimmedDosage)) return;
    setDosageStocks(prev => [...prev, { dosage: trimmedDosage, stockAmount: 0, inStock: true, price: null, originalPrice: null }]);
    setNewDosage("");
  };

  const removeDosage = (index: number) => {
    if (dosageStocks.length > 1) {
      setDosageStocks(prev => prev.filter((_, i) => i !== index));
    }
  };

  const markAllInStock = () => {
    setDosageStocks(prev => prev.map(ds => ({ ...ds, inStock: true })));
  };

  const markAllOutOfStock = () => {
    setDosageStocks(prev => prev.map(ds => ({ ...ds, inStock: false, stockAmount: 0 })));
  };

  const handleProductImageUpload = useCallback(async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await response.json();
      return { method: "PUT" as const, url: uploadURL };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
    }
  }, []);

  const handleProductImageComplete = async (result: any) => {
    try {
      setIsUploadingImage(true);
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        const response = await apiRequest("PUT", "/api/objects/finalize", { uploadURL });
        const { objectPath } = await response.json();
        setProductImageUrl(objectPath);
        form.setValue("imageUrl", objectPath);
        toast({ title: "Image uploaded successfully" });
      }
    } catch (error) {
      console.error("Failed to finalize upload:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProductImage = async () => {
    if (productImageUrl) {
      try {
        await apiRequest("DELETE", "/api/objects/delete", { objectPath: productImageUrl });
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
    setProductImageUrl(null);
    form.setValue("imageUrl", "");
  };

  const onSubmit = async (values: any) => {
    const totalStock = dosageStocks.reduce((sum, ds) => sum + ds.stockAmount, 0);
    const anyInStock = dosageStocks.some(ds => ds.inStock);
    
    const data = {
      ...values,
      benefits: values.benefits ? (values.benefits as string).split(",").map((b) => b.trim()).filter(Boolean) : [],
      dosageOptions: dosageStocks.map(ds => ds.dosage),
      originalPrice: values.originalPrice || null,
      imageUrl: values.imageUrl || null,
      stockAmount: totalStock,
      inStock: anyInStock,
    };

    const handleSaveComplete = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-stock"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data }, {
        onSuccess: () => {
          syncDosageStocksMutation.mutate({ productId: editingProduct.id, dosageStocks }, {
            onSuccess: () => {
              toast({ title: "Product and inventory updated" });
              handleSaveComplete();
            }
          });
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: (newProduct: Product) => {
          syncDosageStocksMutation.mutate({ productId: newProduct.id, dosageStocks }, {
            onSuccess: () => {
              toast({ title: "Product created with inventory" });
              handleSaveComplete();
            }
          });
        }
      });
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
      <div id="products-table-top" className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products ({products?.length || 0})</h2>
        <div className="flex items-center gap-4">
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Dosage Inventory</h4>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={markAllInStock}>All In Stock</Button>
                        <Button type="button" variant="outline" size="sm" onClick={markAllOutOfStock}>All Out</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {dosageStocks.map((ds, index) => (
                        <div key={index} className="flex items-center gap-4 p-2 border rounded bg-background">
                          <span className="font-bold min-w-[60px]">{ds.dosage}</span>
                          <Input 
                            type="number" 
                            className="w-24" 
                            placeholder="Price" 
                            value={ds.price || ""} 
                            onChange={(e) => updateDosageStock(index, 'price', e.target.value)}
                          />
                          <Input 
                            type="number" 
                            className="w-20" 
                            placeholder="Stock" 
                            value={ds.stockAmount} 
                            onChange={(e) => updateDosageStock(index, 'stockAmount', parseInt(e.target.value) || 0)}
                          />
                          <Button 
                            type="button" 
                            variant={ds.inStock ? "default" : "outline"} 
                            size="sm"
                            onClick={() => updateDosageStock(index, 'inStock', !ds.inStock)}
                          >
                            {ds.inStock ? "In Stock" : "Out"}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeDosage(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="New dosage" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} />
                      <Button type="button" onClick={() => addDosage()}>Add</Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Product</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsToDisplay?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrl ? <img src={product.imageUrl} className="w-10 h-10 object-cover" /> : <Package className="h-10 w-10 text-muted" />}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stockAmount} units</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
  const [coaImageUrl, setCoaImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: allCoas, isLoading } = useQuery<Coa[]>({
    queryKey: ["/api/admin/coas"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm({
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
      toast({ title: "COA created" });
      setIsDialogOpen(false);
      form.reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/coas/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA updated" });
      setIsDialogOpen(false);
      setEditingCoa(null);
      form.reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/coas/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA deleted" });
    }
  });

  const handleOpenDialog = (coa?: Coa) => {
    if (coa) {
      setEditingCoa(coa);
      setCoaImageUrl(coa.imageUrl || null);
      form.reset({
        batchNumber: coa.batchNumber,
        productId: coa.productId,
        productName: coa.productName,
        testDate: coa.testDate,
        expirationDate: coa.expirationDate,
        purity: coa.purity,
        labName: coa.labName,
        verified: coa.verified || true,
        results: coa.results?.join(", ") || "",
      });
    } else {
      setEditingCoa(null);
      setCoaImageUrl(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (values: any) => {
    const data = {
      ...values,
      results: values.results ? (values.results as string).split(",").map((r) => r.trim()).filter(Boolean) : [],
      imageUrl: coaImageUrl || null,
    };
    if (editingCoa) {
      updateMutation.mutate({ id: editingCoa.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Certificates of Analysis</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add COA
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>COA Details</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save COA</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCoas?.map((coa) => (
              <TableRow key={coa.id}>
                <TableCell>{coa.batchNumber}</TableCell>
                <TableCell>{coa.productName}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coa)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(coa.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
  const { data: orders, isLoading } = useQuery<Order[]>({ queryKey: ["/api/admin/orders"] });
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Orders</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map(order => (
            <TableRow key={order.id}>
              <TableCell>{order.id.slice(0, 8)}</TableCell>
              <TableCell>{order.firstName} {order.lastName}</TableCell>
              <TableCell>${Number(order.totalAmount).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ContactsTab() {
  const { data: contacts, isLoading } = useQuery<Contact[]>({ queryKey: ["/api/admin/contacts"] });
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Messages</h2>
      <div className="grid gap-4">
        {contacts?.map(contact => (
          <Card key={contact.id}>
            <CardHeader><CardTitle>{contact.name}</CardTitle></CardHeader>
            <CardContent><p>{contact.message}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AffiliatesTab() {
  const { data: affiliates, isLoading } = useQuery<Affiliate[]>({ queryKey: ["/api/admin/affiliates"] });
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Affiliates</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates?.map(a => (
            <TableRow key={a.id}>
              <TableCell>{a.fullName}</TableCell>
              <TableCell>{a.referralCode}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PricingTab() {
  return <div>Pricing optimization coming soon</div>;
}

function ReviewsTab() {
  const { data: reviews, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/reviews"] });
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reviews</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews?.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.productName}</TableCell>
              <TableCell>{r.rating}/5</TableCell>
              <TableCell>{r.isApproved ? "Approved" : "Pending"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
