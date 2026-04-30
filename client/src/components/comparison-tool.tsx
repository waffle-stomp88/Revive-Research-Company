import { useState, useEffect } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  X, Scale, Plus, Check, ArrowRight, ShoppingCart, 
  Shield, FileCheck, Truck, FlaskConical, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

const STORAGE_KEY = "revive_compare_products";
const MAX_COMPARE = 3;

interface CompareState {
  productIds: string[];
}

export function getCompareIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function addToCompare(productId: string): boolean {
  try {
    const ids = getCompareIds();
    if (ids.includes(productId)) return false;
    if (ids.length >= MAX_COMPARE) return false;
    
    ids.push(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("compare-updated"));
    return true;
  } catch (e) {
    return false;
  }
}

export function removeFromCompare(productId: string) {
  try {
    const ids = getCompareIds().filter(id => id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("compare-updated"));
  } catch (e) {}
}

export function clearCompare() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent("compare-updated"));
}

export function isInCompare(productId: string): boolean {
  return getCompareIds().includes(productId);
}

interface CompareButtonProps {
  productId: string;
  size?: "sm" | "default";
}

export function CompareButton({ productId, size = "default" }: CompareButtonProps) {
  const [inCompare, setInCompare] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setInCompare(isInCompare(productId));
    
    const handler = () => setInCompare(isInCompare(productId));
    window.addEventListener("compare-updated", handler);
    return () => window.removeEventListener("compare-updated", handler);
  }, [productId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(productId);
      toast({
        title: "Removed from comparison",
        description: "Product removed from comparison list.",
      });
    } else {
      const added = addToCompare(productId);
      if (added) {
        toast({
          title: "Added to comparison",
          description: "Click the compare button to view side-by-side.",
        });
      } else {
        toast({
          title: "Comparison limit reached",
          description: "Remove a product to add another (max 3).",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant={inCompare ? "default" : "outline"}
      size={size === "sm" ? "sm" : "default"}
      className={`gap-1.5 ${inCompare ? "bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90" : "border-[#21d8ff]/50 hover:border-[#21d8ff]"}`}
      onClick={handleClick}
      data-testid={`button-compare-${productId}`}
    >
      {inCompare ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
      <span className="text-xs">{inCompare ? "Comparing" : "Compare"}</span>
    </Button>
  );
}

interface CompareBarProps {
  products: Product[];
}

export function CompareBar({ products }: CompareBarProps) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setCompareIds(getCompareIds());
    
    const handler = () => setCompareIds(getCompareIds());
    window.addEventListener("compare-updated", handler);
    return () => window.removeEventListener("compare-updated", handler);
  }, []);

  const compareProducts = products?.filter(p => compareIds.includes(p.id)) || [];

  if (compareIds.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden md:block"
        data-testid="bar-compare"
      >
        <Card className="flex items-center gap-4 px-4 py-3 bg-[#1a1a1f]/95 backdrop-blur-sm border-[#21d8ff]/50 shadow-xl">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#21d8ff]" />
            <span className="text-sm font-medium">{compareIds.length} products</span>
          </div>
          
          <div className="flex items-center gap-2">
            {compareProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="relative group">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                  <img 
                    src={product.imageUrl || productImage} 
                    alt={`${product.name} research peptide`}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <button
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromCompare(product.id)}
                  data-testid={`button-remove-compare-${product.id}`}
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              </div>
            ))}
            {compareIds.length < MAX_COMPARE && (
              <div className="w-10 h-10 rounded-md border-2 border-dashed border-[#2a2a32] flex items-center justify-center">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearCompare()}
              data-testid="button-clear-compare"
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90 gap-1.5"
              onClick={() => setIsModalOpen(true)}
              disabled={compareIds.length < 2}
              data-testid="button-open-compare"
            >
              Compare <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      </motion.div>

      <CompareModal 
        products={compareProducts}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

interface CompareModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

function CompareModal({ products, isOpen, onClose }: CompareModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      quantity: 1,
      dosage: "Default",
      image: product.imageUrl || productImage,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const comparisonFields: { key: string; label: string; format?: (v: any) => string }[] = [
    { key: "category", label: "Category" },
    { key: "price", label: "Price", format: (v: string) => `$${Number(v).toFixed(2)}` },
    { key: "inStock", label: "In Stock", format: (v: boolean | null) => v ? "Yes" : "No" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#1a1a1f] border-[#2a2a32]">
        <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
          <Scale className="h-5 w-5 text-[#21d8ff]" />
          Compare Products
        </DialogTitle>

        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
          {products.map((product) => (
            <div key={product.id} className="text-center">
              <div className="relative mb-4">
                <button
                  className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
                  onClick={() => removeFromCompare(product.id)}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden">
                  <img 
                    src={product.imageUrl || productImage} 
                    alt={`${product.name} research peptide - lab tested`}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>
              
              <h3 className="font-display text-lg font-bold mb-1" data-testid={`compare-name-${product.id}`}>
                {product.name}
              </h3>
              <p className="text-2xl font-bold text-[#E7FB10] mb-2">
                ${Number(product.price).toFixed(2)}
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  data-testid={`button-compare-add-${product.id}`}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add
                </Button>
                <Link href={`/peptides/${product.slug || product.id}`} onClick={onClose}>
                  <Button size="sm" variant="outline" data-testid={`button-compare-view-${product.id}`}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[#2a2a32] pt-6">
          <table className="w-full text-sm">
            <tbody>
              {comparisonFields.map((field) => (
                <tr key={field.key} className="border-b border-[#2a2a32] last:border-0">
                  <td className="py-3 text-muted-foreground font-medium w-32">
                    {field.label}
                  </td>
                  {products.map((product) => {
                    const value = (product as any)[field.key];
                    return (
                      <td key={product.id} className="py-3 text-center">
                        {field.format ? field.format(value) : value || "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-b border-[#2a2a32]">
                <td className="py-3 text-muted-foreground font-medium">Description</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 text-xs text-muted-foreground">
                    {product.shortDescription || "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-[#21d8ff]/10 rounded-lg border border-[#21d8ff]/30">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-[#21d8ff] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              All products include a Certificate of Analysis with third-party lab verification. 
              {`Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}.`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
