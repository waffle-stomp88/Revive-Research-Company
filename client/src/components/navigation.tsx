import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogIn, LogOut, Shield, ShoppingCart, ChevronDown, FileCheck, GraduationCap, Scale, BookOpen, Package, FlaskConical, Boxes, Building2, Droplets, Calculator, Layers, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import logoImage from "@assets/Revive_PNG_1766012118069.png";

const navLinks = [
  { href: "/", label: "Home", color: "#ec4899" },
  { href: "/affiliate", label: "Affiliates", color: "#22c55e" },
];

const productLinks = [
  { href: "/peptides", label: "Peptides", icon: FlaskConical, description: "Individual vials", color: "#a855f7" },
  { href: "/research-stacks", label: "Research Stacks", icon: Layers, description: "Multi-compound combos", color: "#ec4899" },
  { href: "/bulk-packs", label: "Bulk Packs", icon: Boxes, description: "5-packs, 10-packs", color: "#21d8ff" },
  { href: "/supplies", label: "Supplies", icon: Droplets, description: "Bac water, syringes", color: "#9d4edd" },
  { href: "/wholesale", label: "Wholesale Program", icon: Building2, description: "Clinics & resellers", color: "#22c55e" },
];

const coaLinks = [
  { href: "/coa", label: "COA Verification", icon: FileCheck, description: "Verify product analysis", color: "#21d8ff" },
  { href: "/coa-library", label: "COA Library", icon: FileCheck, description: "Browse verified certifications", color: "#21d8ff" },
];

const resourceLinks = [
  { href: "/education", label: "Education Center", icon: BookOpen, description: "Learn about peptides & research", color: "#ec4899" },
  { href: "/academy", label: "Research Academy", icon: GraduationCap, description: "Guided learning for researchers", color: "#E7FB10" },
  { href: "/dosage-calculator", label: "Dosage Calculator", icon: Calculator, description: "Calculate peptide dosing volumes", color: "#21d8ff" },
  { href: "/legal", label: "Legal & Compliance", icon: Scale, description: "Regulatory information & policies", color: "#22c55e" },
  { href: "/what-we-dont-do", label: "What We Don't Do", icon: BookOpen, description: "Our ethical boundaries", color: "#EF4444" },
  { href: "/faq", label: "FAQ", icon: BookOpen, description: "Common questions answered", color: "#a855f7" },
];

// Collapsible mobile menu section component
function MobileMenuSection({ 
  title, 
  color, 
  items, 
  location 
}: { 
  title: string; 
  color: string; 
  items: typeof productLinks; 
  location: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveItem = items.some(item => location === item.href || location.startsWith(item.href + "/"));
  
  return (
    <div className="border-t border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between"
        data-testid={`button-mobile-${title.toLowerCase()}-toggle`}
      >
        <span 
          className="text-lg font-display font-semibold"
          style={{ color: hasActiveItem ? color : undefined }}
        >
          {title}
        </span>
        <ChevronDown 
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color }}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-4 py-3.5 px-4 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-muted/50" 
                          : "hover:bg-muted/30"
                      }`}
                      data-testid={`link-mobile-${item.label.toLowerCase().replace(/ /g, "-")}`}
                    >
                      <Icon 
                        className="h-5 w-5 flex-shrink-0" 
                        style={{ color: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <span 
                          className="text-base font-medium block"
                          style={{ color: isActive ? item.color : undefined }}
                        >
                          {item.label}
                        </span>
                        <span className="text-sm text-muted-foreground truncate block">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hoveredCartItem, setHoveredCartItem] = useState<string | null>(null);
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const { items, getItemCount, getSubtotal, removeFromCart } = useCart();
  const cartItemCount = getItemCount();
  const regularItems = items.filter(item => !item.isBundle);
  const bundleItems = items.filter(item => item.isBundle);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsCartOpen(false);
  }, [location]);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300`}
        style={{ top: 'var(--banner-height, 40px)' }}
      >
        <div className={`transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-lg border-b border-border/50"
            : "bg-background/80 backdrop-blur-sm"
        }`}>
          <nav className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16 md:h-20 min-w-0">
              <Link href="/" data-testid="link-home-logo" className="flex-shrink-0" onClick={() => window.scrollTo(0, 0)}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3"
                >
                  <img
                    src={logoImage}
                    alt="Revive Research"
                    className="h-12 md:h-30 w-auto"
                  />
                </motion.div>
              </Link>

              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                {navLinks.map((link) => {
                  const isActive = location === link.href;
                  const color = link.color;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => window.scrollTo(0, 0)}>
                      <motion.div
                        className="relative px-4 py-2 rounded-md group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span
                          className={`text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer relative z-10 block`}
                          style={{
                            color: isActive ? color : undefined,
                            textShadow: isActive ? `0 0 12px ${color}cc` : undefined,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = color;
                              e.currentTarget.style.textShadow = `0 0 12px ${color}80`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.textShadow = 'none';
                            }
                          }}
                          data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                        >
                          {link.label}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="nav-highlight"
                            style={{
                              backgroundColor: `${color}1a`,
                              borderColor: `${color}66`,
                              boxShadow: `0 0 16px ${color}4d`,
                            }}
                            className="absolute inset-0 rounded-md border"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none"
                          style={{
                            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                            transformOrigin: 'center',
                          }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ backgroundColor: `${color}0d` }}
                          whileHover={{ opacity: 1 }}
                        />
                      </motion.div>
                    </Link>
                  );
                })}
                
                {/* Products Dropdown */}
                <div className="relative px-4 py-2 rounded-md group cursor-pointer">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:ring-0 ${
                          productLinks.some(p => location === p.href || location.startsWith(p.href + "/"))
                            ? "text-[#E7FB10] drop-shadow-[0_0_12px_rgba(231,251,16,0.8)]"
                            : "text-white hover:text-[#E7FB10] hover:drop-shadow-[0_0_12px_rgba(231,251,16,0.5)]"
                        }`}
                        data-testid="link-nav-products"
                      >
                        Products
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64 z-[100]">
                      {productLinks.map((link, index) => {
                        const Icon = link.icon;
                        const isActive = location === link.href || location.startsWith(link.href + "/");
                        return (
                          <div key={link.href}>
                            <DropdownMenuItem asChild>
                              <Link 
                                href={link.href} 
                                className="cursor-pointer flex items-start gap-3 py-2"
                                data-testid={`link-product-${link.label.toLowerCase().replace(/ /g, "-")}`}
                                onClick={() => window.scrollTo(0, 0)}
                              >
                                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: link.color }} />
                                <div>
                                  <div className="font-medium" style={{ color: isActive ? link.color : undefined }}>{link.label}</div>
                                  <div className="text-xs text-muted-foreground">{link.description}</div>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            {index === 0 && <DropdownMenuSeparator />}
                          </div>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {productLinks.some(p => location === p.href || location.startsWith(p.href + "/")) && (
                    <motion.div
                      className="absolute inset-0 bg-[#E7FB10]/10 rounded-md border border-[#E7FB10]/40 shadow-[0_0_16px_rgba(231,251,16,0.3)] pointer-events-none"
                      layoutId="products-highlight"
                    />
                  )}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E7FB10] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none"
                  />
                </div>

                {/* COA Dropdown */}
                <div className="relative px-4 py-2 rounded-md group cursor-pointer">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:ring-0 ${
                          coaLinks.some(c => location === c.href || location.startsWith(c.href + "/"))
                            ? "text-[#21d8ff] drop-shadow-[0_0_12px_rgba(33,216,255,0.8)]"
                            : "text-white hover:text-[#21d8ff] hover:drop-shadow-[0_0_12px_rgba(33,216,255,0.5)]"
                        }`}
                        data-testid="link-nav-coa"
                      >
                        COA Verification
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64 z-[100]">
                      {coaLinks.map((link, index) => {
                        const Icon = link.icon;
                        const isActive = location === link.href || location.startsWith(link.href + "/");
                        return (
                          <div key={link.href}>
                            <DropdownMenuItem asChild>
                              <Link 
                                href={link.href} 
                                className="cursor-pointer flex items-start gap-3 py-2"
                                data-testid={`link-coa-${link.label.toLowerCase().replace(/ /g, "-")}`}
                                onClick={() => window.scrollTo(0, 0)}
                              >
                                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: link.color }} />
                                <div>
                                  <div className="font-medium" style={{ color: isActive ? link.color : undefined }}>{link.label}</div>
                                  <div className="text-xs text-muted-foreground">{link.description}</div>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            {index === 0 && <DropdownMenuSeparator />}
                          </div>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {coaLinks.some(c => location === c.href || location.startsWith(c.href + "/")) && (
                    <motion.div
                      className="absolute inset-0 bg-[#21d8ff]/10 rounded-md border border-[#21d8ff]/40 shadow-[0_0_16px_rgba(33,216,255,0.3)] pointer-events-none"
                      layoutId="coa-highlight"
                    />
                  )}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#21d8ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none"
                  />
                </div>
                
                {/* Resources Dropdown */}
                <div className="relative px-4 py-2 rounded-md group cursor-pointer">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      {(() => {
                        const resourcesColor = "#a855f7";
                        const isActive = location === "/resources" || resourceLinks.some(r => location === r.href);
                        
                        return (
                          <button
                            className="flex items-center gap-1 text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:ring-0 text-white"
                            style={{
                              color: isActive ? resourcesColor : undefined,
                              textShadow: isActive ? `0 0 12px ${resourcesColor}cc` : undefined,
                            }}
                            data-testid="link-nav-resources"
                          >
                            Resources
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        );
                      })()}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-72 z-[100]">
                      {resourceLinks.map((link, index) => {
                        const Icon = link.icon;
                        const isActive = location === link.href;
                        return (
                          <div key={link.href}>
                            <DropdownMenuItem asChild>
                              <Link 
                                href={link.href} 
                                className="cursor-pointer flex items-start gap-3 py-2"
                                data-testid={`link-resource-${link.label.toLowerCase().replace(/ /g, "-")}`}
                                onClick={() => window.scrollTo(0, 0)}
                              >
                                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: link.color }} />
                                <div>
                                  <div className="font-medium" style={{ color: isActive ? link.color : undefined }}>{link.label}</div>
                                  <div className="text-xs text-muted-foreground">{link.description}</div>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            {index === 0 && <DropdownMenuSeparator />}
                          </div>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {(() => {
                    const resourcesColor = "#a855f7";
                    const isActive = location === "/resources" || resourceLinks.some(r => location === r.href);
                    
                    return isActive ? (
                      <motion.div
                        className="absolute inset-0 rounded-md border pointer-events-none"
                        style={{
                          backgroundColor: `${resourcesColor}1a`,
                          borderColor: `${resourcesColor}66`,
                          boxShadow: `0 0 16px ${resourcesColor}4d`,
                        }}
                        layoutId="resource-highlight"
                      />
                    ) : null;
                  })()}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, transparent, #a855f7, transparent)`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                {/* Search Autocomplete - Desktop */}
                <div className="hidden lg:block w-40">
                  <SearchAutocomplete />
                </div>
                
                <DropdownMenu open={isCartOpen} onOpenChange={setIsCartOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative hover:bg-[#E7FB10]/10 hover:text-[#E7FB10] transition-all duration-300" 
                      data-testid="button-cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-[#E7FB10] text-black border-0">
                          {cartItemCount > 9 ? "9+" : cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Shopping Cart</h4>
                        <span className="text-xs text-muted-foreground">{cartItemCount} items</span>
                      </div>
                    </div>
                    
                    {cartItemCount === 0 ? (
                      <div className="p-6 text-center">
                        <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Your cart is empty</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-64 overflow-y-auto scrollbar-hide">
                          {regularItems.slice(0, 3).map((item) => (
                            <div 
                              key={`${item.productId}-${item.dosage}`} 
                              className="flex items-center gap-3 p-3 border-b border-border/50 last:border-0"
                              onMouseEnter={() => setHoveredCartItem(`${item.productId}-${item.dosage}`)}
                              onMouseLeave={() => setHoveredCartItem(null)}
                            >
                              <div className="w-10 h-10 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden border border-border/50">
                                {item.image ? (
                                  <img src={item.image} alt={`${item.name} ${item.dosage} research peptide`} className="w-full h-full object-contain p-1" />
                                ) : (
                                  <div className="flex items-center justify-center h-full bg-[#E7FB10]/10">
                                    <Package className="h-5 w-5 text-[#E7FB10]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.dosage} × {item.quantity}
                                </p>
                              </div>
                              {hoveredCartItem === `${item.productId}-${item.dosage}` ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10 h-auto"
                                  onClick={() => removeFromCart(item.productId, item.dosage)}
                                  data-testid={`button-remove-cart-item-${item.productId}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <p className="text-sm font-semibold text-[#E7FB10]">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          ))}
                          {bundleItems.slice(0, 2).map((bundle) => {
                            const bundleKey = `bundle-${bundle.bundleId}`;
                            return (
                              <div 
                                key={bundle.bundleId} 
                                className="flex items-center gap-3 p-3 border-b border-border/50 last:border-0"
                                onMouseEnter={() => setHoveredCartItem(bundleKey)}
                                onMouseLeave={() => setHoveredCartItem(null)}
                              >
                                <div className="w-10 h-10 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden border border-border/50">
                                  {bundle.image ? (
                                    <img src={bundle.image} alt={`${bundle.name} research bundle`} className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full bg-[#21d8ff]/10">
                                      <Package className="h-5 w-5 text-[#21d8ff]" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{bundle.name}</p>
                                  <p className="text-xs text-muted-foreground">Bundle × {bundle.quantity}</p>
                                </div>
                                {hoveredCartItem === bundleKey ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10 h-auto"
                                    onClick={() => removeFromCart(bundle.bundleId || "", "")}
                                    data-testid={`button-remove-cart-bundle-${bundle.bundleId}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <p className="text-sm font-semibold text-[#21d8ff]">
                                    ${(bundle.price * bundle.quantity).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                          {(regularItems.length > 3 || bundleItems.length > 2) && (
                            <div className="p-2 text-center text-xs text-muted-foreground">
                              +{Math.max(0, regularItems.length - 3) + Math.max(0, bundleItems.length - 2)} more items
                            </div>
                          )}
                        </div>
                        <div className="p-4 border-t border-border bg-muted/20">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Subtotal</span>
                            <span className="font-semibold text-[#E7FB10]">${getSubtotal().toFixed(2)}</span>
                          </div>
                          <Link href="/cart">
                            <Button className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" size="sm">
                              View Cart
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {!isLoading && !isAuthenticated && (
                  <Button 
                    variant="outline" 
                    className="hidden md:inline-flex border-[#E7FB10]/50 text-[#E7FB10] hover:bg-[#E7FB10]/10 hover:border-[#E7FB10] transition-all duration-300"
                    data-testid="button-sign-in"
                    onClick={() => login()}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
                
                {!isLoading && isAuthenticated && (
                  <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="relative flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-full hover:bg-[#21d8ff]/10 border border-[#21d8ff]/50 hover:border-[#21d8ff] transition-all duration-300 outline-none"
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.outline = 'none';
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.outline = 'none';
                        }}
                        style={{
                          boxShadow: 'none',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                        data-testid="button-user-menu"
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8 border-2 border-[#21d8ff] focus:!ring-0 focus-visible:!ring-0 [&:focus]:!ring-0 [&:focus-visible]:!ring-0">
                            {user?.profileImageUrl && (
                              <AvatarImage src={user.profileImageUrl} alt={user?.firstName || "User"} className="object-cover" />
                            )}
                            <AvatarFallback className="text-xs font-semibold bg-[#21d8ff]/20">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-background rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                        </div>
                        <div className="hidden md:flex flex-col items-start">
                          <span className="text-[10px] text-muted-foreground leading-none">Welcome back</span>
                          <span className="text-sm font-semibold text-[#21d8ff] leading-tight">{user?.firstName || "User"}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">
                          {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Account"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer" data-testid="link-dashboard">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/affiliate-dashboard" className="cursor-pointer" data-testid="link-affiliate-dashboard">
                          <User className="h-4 w-4 mr-2" />
                          Affiliate Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {user?.isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer" data-testid="link-admin">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer text-destructive" 
                        data-testid="button-logout"
                        onClick={() => logout()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                <Link href="/peptides">
                  <Button
                    className="hidden md:inline-flex font-display bg-[#E7FB10] text-black border-2 border-[#E7FB10] shadow-[0_0_15px_rgba(231,251,16,0.3)] hover:shadow-[0_0_25px_rgba(231,251,16,0.5)] hover:bg-[#E7FB10] transition-all duration-300"
                    data-testid="button-shop-products"
                  >
                    Shop Peptides
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-[#E7FB10]/10 hover:text-[#E7FB10] transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  data-testid="button-mobile-menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-lg md:hidden"
            style={{ paddingTop: 'calc(var(--banner-height, 40px) + 64px)' }}
          >
            <nav className="flex flex-col h-full overflow-y-auto pb-8">
              {/* Mobile Search Bar */}
              <div className="px-5 py-4 border-b border-border/50">
                <SearchAutocomplete className="w-full" />
              </div>
              
              {/* Main Navigation Links */}
              <div className="px-5 py-3">
                {navLinks.map((link) => {
                  const isActive = location === link.href;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={`flex items-center gap-3 py-4 border-b border-border/30 ${
                          isActive ? "text-[#E7FB10]" : "text-foreground"
                        }`}
                        data-testid={`link-mobile-${link.label.toLowerCase().replace(" ", "-")}`}
                      >
                        <span className="text-lg font-display font-semibold">{link.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Products Section - Collapsible */}
              <MobileMenuSection
                title="Products"
                color="#E7FB10"
                items={productLinks}
                location={location}
              />
              
              {/* Resources Section - Collapsible */}
              <MobileMenuSection
                title="Resources"
                color="#a855f7"
                items={resourceLinks}
                location={location}
              />
              
              {/* Account Section */}
              {isAuthenticated && (
                <div className="px-5 py-3 border-t border-border/50">
                  <Link href="/dashboard">
                    <div
                      className={`flex items-center gap-3 py-4 border-b border-border/30 ${
                        location === "/dashboard" ? "text-[#21d8ff]" : "text-foreground"
                      }`}
                      data-testid="link-mobile-dashboard"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-lg font-display font-semibold">Dashboard</span>
                    </div>
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <div
                        className={`flex items-center gap-3 py-4 border-b border-border/30 ${
                          location === "/admin" ? "text-[#21d8ff]" : "text-foreground"
                        }`}
                        data-testid="link-mobile-admin"
                      >
                        <Shield className="h-5 w-5" />
                        <span className="text-lg font-display font-semibold">Admin Panel</span>
                      </div>
                    </Link>
                  )}
                </div>
              )}
              
              {/* CTA Buttons */}
              <div className="px-5 py-6 mt-auto space-y-3">
                <Link href="/peptides" className="block">
                  <Button 
                    size="lg"
                    className="w-full font-display text-base bg-[#E7FB10] text-black border-2 border-[#E7FB10] shadow-[0_0_20px_rgba(231,251,16,0.4)]" 
                    data-testid="button-mobile-shop"
                  >
                    Shop Peptides
                  </Button>
                </Link>
                
                {!isLoading && !isAuthenticated && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full border-[#E7FB10]/50 text-[#E7FB10] text-base"
                    data-testid="button-mobile-sign-in"
                    onClick={() => login()}
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </Button>
                )}
                
                {!isLoading && isAuthenticated && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    data-testid="button-mobile-logout" 
                    className="w-full text-base"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
