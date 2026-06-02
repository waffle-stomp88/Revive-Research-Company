import { useMemo } from "react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Heart, Bookmark, Plus, X } from "lucide-react";
import type { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function DashboardWishlist() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();

  const { data: wishlist } = useQuery<{ productId: string }[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Removed", description: "Item removed from wishlist." });
    },
  });

  const wishlistProducts = useMemo(() => {
    if (!wishlist || !products) return [];
    return products.filter(p => wishlist.some(w => w.productId === p.id));
  }, [wishlist, products]);

  const handleAddToCart = (product: Product) => {
    const dosage = product.dosageOptions?.[0];
    if (!dosage) {
      toast({ title: "Cannot Add", description: "No dosage options available.", variant: "destructive" });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      dosage,
      image: product.imageUrl || undefined,
    });
    toast({ title: "Added to Cart", description: `${product.name} added to your cart.` });
  };

  return (
    <>
      <SEOHead title="Wishlist" description="Your saved products wishlist." canonicalPath="/dashboard/wishlist" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground px-2 h-8" data-testid="button-back-to-dashboard">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground/40 select-none">/</span>
              <span className="text-sm font-medium text-foreground" aria-current="page">Wishlist</span>
            </nav>
          </div>

          <Card className="border-[#ec4899]/20 bg-gradient-to-br from-[#ec4899]/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-[#ec4899]/20">
                  <Heart className="h-4 w-4 text-[#ec4899]" />
                </div>
                Wishlist
                {wishlistProducts.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/30">{wishlistProducts.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wishlistProducts.length > 0 ? (
                <div className="space-y-2">
                  {wishlistProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#ec4899]/20 bg-[#ec4899]/5 hover-elevate transition-all" data-testid={`wishlist-item-${product.id}`}>
                      <div className="flex-1 min-w-0">
                        <Link href={`/peptides/${product.id}`}>
                          <p className="font-medium text-sm truncate hover:text-[#ec4899] transition-colors cursor-pointer">{product.name}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground">${Math.round(Number(product.price))}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => handleAddToCart(product)} className="shrink-0 min-h-[48px] min-w-[48px]" aria-label={`Add ${product.name} to cart`} data-testid={`button-add-to-cart-${product.id}`}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-muted-foreground shrink-0 min-h-[48px] min-w-[48px]" onClick={() => removeMutation.mutate(product.id)} aria-label={`Remove ${product.name} from wishlist`} data-testid={`button-remove-wishlist-${product.id}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No items saved yet</p>
                  <Link href="/peptides">
                    <Button variant="outline" size="sm" className="border-[#ec4899]/40 text-[#ec4899]" data-testid="button-browse-products-wishlist">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export default DashboardWishlist;
