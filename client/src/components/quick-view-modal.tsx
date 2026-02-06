import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { X, Minus, Plus, ShoppingCart, ArrowRight, Shield, Truck, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useLocation } from "wouter";
import { ImageLoader } from "@/components/image-loader";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (!product) return null;

  const isOutOfStock = !product.inStock || (product.stockAmount !== null && product.stockAmount <= 0);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      quantity,
      dosage: "Default",
      image: product.imageUrl || productImage,
    });
    
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to your cart.`,
      action: (
        <ToastAction altText="View Cart" onClick={() => setLocation('/cart')} className="bg-[#E7FB10] text-black border-[#E7FB10] hover:bg-[#E7FB10]/90 font-semibold">
          View Cart
        </ToastAction>
      ),
    });
    
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-[#1a1a1f] border-[#2a2a32]">
        <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
            <ImageLoader
              src={product.imageUrl || productImage}
              alt={`${product.name} research peptide - lab verified compound`}
              className="w-full h-full object-contain p-8"
              containerClassName="relative w-full h-full"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col">
            <div className="flex-1">
              <Badge variant="outline" className="text-xs mb-2 border-[#21d8ff]/50 text-[#21d8ff]">
                {product.category}
              </Badge>
              
              <h2 className="font-display text-2xl font-bold mb-2 text-white" data-testid="text-quickview-name">
                {product.name}
              </h2>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {product.shortDescription}
              </p>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-3xl font-bold text-[#E7FB10]" data-testid="text-quickview-price">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-[#21d8ff]" />
                  <span>99%+ Purity Verified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileCheck className="h-3.5 w-3.5 text-[#21d8ff]" />
                  <span>Certificate of Analysis Included</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-[#21d8ff]" />
                  <span>Free shipping on orders over $200</span>
                </div>
              </div>

              {product.category && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Category:</p>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-[#2a2a32]">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#2a2a32] rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    data-testid="button-quickview-minus"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium" data-testid="text-quickview-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10 || isOutOfStock}
                    data-testid="button-quickview-plus"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  data-testid="button-quickview-add-to-cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>

              <Link href={`/peptides/${product.id}`} onClick={onClose}>
                <Button variant="outline" className="w-full gap-2" data-testid="button-quickview-view-details">
                  View Full Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
