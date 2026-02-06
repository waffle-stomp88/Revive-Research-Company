import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Clock, X, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

const STORAGE_KEY = "revive_recently_viewed";
const MAX_ITEMS = 6;

export function addToRecentlyViewed(productId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: string[] = stored ? JSON.parse(stored) : [];
    
    items = items.filter(id => id !== productId);
    items.unshift(productId);
    items = items.slice(0, MAX_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Error saving to recently viewed:", e);
  }
}

export function getRecentlyViewedIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

interface RecentlyViewedProps {
  currentProductId?: string;
  variant?: "sidebar" | "section";
}

export function RecentlyViewed({ currentProductId, variant = "sidebar" }: RecentlyViewedProps) {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    const ids = getRecentlyViewedIds().filter(id => id !== currentProductId);
    setViewedIds(ids);
  }, [currentProductId]);

  const recentProducts = products?.filter(p => viewedIds.includes(p.id))
    .sort((a, b) => viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id))
    .slice(0, 4) || [];

  if (recentProducts.length === 0) return null;

  if (variant === "section") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8"
        data-testid="section-recently-viewed"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#21d8ff]" />
            <h3 className="font-display text-lg font-bold">Recently Viewed</h3>
          </div>
          <Link href="/shop">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentProducts.map((product) => (
            <Link key={product.id} href={`/peptides/${product.slug || product.id}`}>
              <Card 
                className="group p-4 cursor-pointer border-[#2a2a32] md:hover:border-[#21d8ff]/50 transition-all duration-300 md:hover:shadow-[0_0_25px_rgba(33,216,255,0.25)] flex items-center gap-5 bg-[#1a1a24]/50"
                data-testid={`card-recent-${product.id}`}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex-shrink-0 overflow-hidden">
                  <img 
                    src={product.imageUrl || productImage} 
                    alt={`${product.name} research peptide`}
                    className="w-full h-full object-contain p-2 md:group-hover:scale-110 md:group-active:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-bold truncate group-hover:text-[#E7FB10] transition-colors leading-tight">
                    {product.name}
                  </p>
                  <p className="text-base text-[#E7FB10] font-black mt-1">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:block"
      data-testid="sidebar-recently-viewed"
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-[#21d8ff]/50 bg-[#1a1a1f]/90 backdrop-blur-sm hover:border-[#21d8ff]"
              onClick={() => setIsCollapsed(false)}
              data-testid="button-expand-recent"
            >
              <Clock className="h-5 w-5 text-[#21d8ff]" />
              <span className="absolute -top-1 -right-1 bg-[#E7FB10] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {recentProducts.length}
              </span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="w-48 bg-[#1a1a1f]/95 backdrop-blur-sm border-[#2a2a32] shadow-xl">
              <div className="p-3 border-b border-[#2a2a32] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#21d8ff]" />
                  <span className="text-xs font-medium">Recently Viewed</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsCollapsed(true)}
                  data-testid="button-collapse-recent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="p-2 space-y-1">
                {recentProducts.map((product) => (
                  <Link key={product.id} href={`/peptides/${product.slug || product.id}`}>
                    <div 
                      className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#2a2a32] cursor-pointer transition-colors group"
                      data-testid={`sidebar-recent-${product.id}`}
                    >
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-muted to-muted/50 overflow-hidden flex-shrink-0">
                        <img 
                          src={product.imageUrl || productImage} 
                          alt={`${product.name} research peptide`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate group-hover:text-[#E7FB10] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-[#E7FB10]">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
