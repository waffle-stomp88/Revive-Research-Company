import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogIn, LogOut, Shield, ShoppingCart, ChevronDown, ChevronRight, FileCheck, GraduationCap, BookOpen, Package, FlaskConical, Building2, Calculator, Layers, Search, Trash2, Mail, Sparkles, HelpCircle } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
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
  { href: "/wholesale", label: "Wholesale Program", icon: Building2, description: "Clinics & resellers", color: "#22c55e" },
];

const coaLinks = [
  { href: "/coa/verify-certificate-of-analysis", label: "COA Verification", icon: FileCheck, description: "Verify product analysis", color: "#21d8ff" },
  { href: "/coa-library", label: "COA Library", icon: FileCheck, description: "Browse verified certifications", color: "#21d8ff" },
];

const resourceLinks = [
  { href: "/guides/peptide-education-center", label: "Education Center", icon: BookOpen, description: "Learn about peptides & research", color: "#ec4899" },
  { href: "/academy", label: "Research Academy", icon: GraduationCap, description: "Guided learning for researchers", color: "#E7FB10" },
  { href: "/tools/peptide-reconstitution-calculator", label: "Dosage Calculator", icon: Calculator, description: "Calculate peptide dosing volumes", color: "#21d8ff" },
  { href: "/peptide-research-faq", label: "FAQ", icon: BookOpen, description: "Common questions answered", color: "#a855f7" },
  { href: "/contact", label: "Support & Contact", icon: Mail, description: "Reach out for research support", color: "#9d4edd" },
];


export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPeptidesOpen, setIsPeptidesOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hoveredCartItem, setHoveredCartItem] = useState<string | null>(null);
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { items, getItemCount, getSubtotal, removeFromCart, removeBundleFromCart } = useCart();
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      const onPeptidePage =
        location === "/peptides" ||
        location.startsWith("/peptides/") ||
        location === "/research-stacks" ||
        location.startsWith("/research-stacks/");
      setIsPeptidesOpen(onPeptidePage);
    }
  }, [isMobileMenuOpen, location]);

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
        className={`fixed left-0 right-0 z-[70] transition-all duration-300`}
        style={{ 
          top: 'var(--banner-height, 36px)',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}
      >
        <div className={`transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-lg border-b border-border/50"
            : "bg-background/80 backdrop-blur-sm"
        }`}>
          <nav className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-14 md:h-16 min-w-0">
              <Link href="/" data-testid="link-home-logo" className="flex-shrink-0" onClick={() => window.scrollTo(0, 0)}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3"
                >
                  <img
                    src={logoImage}
                    alt="Revive Research"
                    className="h-8 md:h-10 w-auto mr-4"
                  />
                </motion.div>
              </Link>

              <div className="hidden md:flex items-center gap-1 flex-shrink-0">
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
                        const isActive = location === "/peptide-research-resources" || resourceLinks.some(r => location === r.href || location.startsWith(r.href));
                        
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
                        const isActive = location === link.href || location.startsWith(link.href);
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
                    const isActive = location === "/peptide-research-resources" || resourceLinks.some(r => location === r.href || location.startsWith(r.href));
                    
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
                      aria-label="View shopping cart"
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
                          {regularItems.slice(0, 3).map((item) => {
                            const itemKey = `${item.productId}-${item.dosage}${item.packSize ? `-pack${item.packSize}` : ''}`;
                            return (
                            <div 
                              key={itemKey} 
                              className="flex items-center gap-3 p-3 border-b border-border/50 last:border-0"
                              onMouseEnter={() => setHoveredCartItem(itemKey)}
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
                                <p className="text-sm font-medium truncate">
                                  {item.name}
                                  {item.packSize && <span className="text-[#E7FB10] ml-1 text-xs">({item.packSize}-Pack)</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.dosage} × {item.quantity}
                                </p>
                              </div>
                              {hoveredCartItem === itemKey ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10 h-auto"
                                  onClick={() => removeFromCart(item.productId, item.dosage, item.packSize)}
                                  data-testid={`button-remove-cart-item-${item.productId}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <p className="text-sm font-semibold text-[#E7FB10]">
                                  ${Math.round(item.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          );
                          })}
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
                                    onClick={() => removeBundleFromCart(bundle.bundleId || "")}
                                    data-testid={`button-remove-cart-bundle-${bundle.bundleId}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <p className="text-sm font-semibold text-[#21d8ff]">
                                    ${Math.round(bundle.price * bundle.quantity)}
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
                            <span className="font-semibold text-[#E7FB10]">${Math.round(getSubtotal())}</span>
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
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="hidden md:inline-flex border-[#E7FB10]/50 text-[#E7FB10] hover:bg-[#E7FB10]/10 hover:border-[#E7FB10] transition-all duration-300"
                      data-testid="button-sign-in"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
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
                    className="hidden md:inline-flex font-display bg-[#E7FB10] text-black border-2 border-[#E7FB10] shadow-[0_0_15px_rgba(231,251,16,0.3)] md:hover:shadow-[0_0_25px_rgba(231,251,16,0.5)] md:hover:bg-[#E7FB10] transition-all duration-300"
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
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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

      {/* Mobile Side Panel Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="right"
          className="md:hidden p-0 w-[85vw] max-w-[340px] bg-[#1a1a1f] border-l border-white/10 flex flex-col overflow-hidden [&>button.absolute]:hidden"
          data-testid="mobile-nav-sheet"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} data-testid="link-mobile-logo">
              <img
                src={logoImage}
                alt="Revive Research"
                className="h-8 w-auto"
              />
            </Link>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                data-testid="button-mobile-menu-close"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-6">
            {/* Search Bar */}
            <div className="px-4 pt-4 pb-3">
              <SearchAutocomplete className="w-full" />
            </div>

            {/* Primary Nav Cards */}
            <div className="px-4 space-y-2 pb-4">

              {/* Peptides — expandable parent card */}
              {(() => {
                const peptidesActive = location === "/peptides" || location.startsWith("/peptides/");
                const stacksActive = location === "/research-stacks" || location.startsWith("/research-stacks/");
                const anyActive = peptidesActive || stacksActive;
                const color = "#a855f7";
                const open = isPeptidesOpen;
                return (
                  <div
                    className="rounded-lg border overflow-hidden"
                    style={{
                      background: anyActive ? `${color}10` : "#22222a",
                      borderColor: open ? `${color}55` : "#333340",
                    }}
                  >
                    {/* Toggle row — whole row opens/closes dropdown */}
                    <button
                      type="button"
                      className="w-full flex items-center gap-4 px-4 py-4 text-left"
                      onClick={() => setIsPeptidesOpen(o => !o)}
                      data-testid="link-mobile-panel-peptides"
                    >
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}22` }}
                      >
                        <FlaskConical className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-display text-lg font-bold tracking-wide block leading-tight"
                          style={{ color: anyActive ? color : "white", fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          Peptides
                        </span>
                        <span className="text-xs text-gray-400 block">Individual vials &amp; all compounds</span>
                      </div>
                      <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5" style={{ color: anyActive ? color : "#6b7280" }} />
                      </motion.div>
                    </button>

                    {/* Collapsible sub-links */}
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          key="peptides-sub"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          {/* All Peptides link */}
                          <div className="border-t border-white/[0.06] mx-4" />
                          <Link href="/peptides" onClick={() => setIsMobileMenuOpen(false)}>
                            <div className="flex items-center gap-3 px-4 py-3" data-testid="link-mobile-panel-all-peptides">
                              <div
                                className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{ background: peptidesActive ? "#a855f722" : "#ffffff0a" }}
                              >
                                <FlaskConical className="h-4 w-4" style={{ color: peptidesActive ? "#a855f7" : "#9ca3af" }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold block" style={{ color: peptidesActive ? "#a855f7" : "#d1d5db" }}>
                                  All Peptides
                                </span>
                                <span className="text-xs text-gray-500 block">Browse individual vials</span>
                              </div>
                            </div>
                          </Link>
                          <div className="border-t border-white/[0.06] mx-4" />
                          <Link href="/research-stacks" onClick={() => setIsMobileMenuOpen(false)}>
                            <div className="flex items-center gap-3 px-4 py-3" data-testid="link-mobile-panel-stacks">
                              <div
                                className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{ background: stacksActive ? "#21d8ff22" : "#ffffff0a" }}
                              >
                                <Layers className="h-4 w-4" style={{ color: stacksActive ? "#21d8ff" : "#9ca3af" }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold block" style={{ color: stacksActive ? "#21d8ff" : "#d1d5db" }}>
                                  Research Stacks
                                </span>
                                <span className="text-xs text-gray-500 block">Curated multi-compound bundles</span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}

              {/* Education */}
              {(() => {
                const color = "#ec4899";
                const isActive = location.startsWith("/guides") || location.startsWith("/education") || location.startsWith("/academy");
                return (
                  <Link href="/guides/peptide-education-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                      className="flex items-center gap-4 px-4 py-4 rounded-lg border transition-colors"
                      style={{
                        background: isActive ? `${color}18` : "#22222a",
                        borderColor: isActive ? `${color}55` : "#333340",
                      }}
                      data-testid="link-mobile-panel-education"
                    >
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}22` }}
                      >
                        <BookOpen className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-display text-lg font-bold tracking-wide block leading-tight"
                          style={{ color: isActive ? color : "white", fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          Education
                        </span>
                        <span className="text-xs text-gray-400 block">Guides, articles &amp; learning hub</span>
                      </div>
                    </div>
                  </Link>
                );
              })()}

              {/* COA Library */}
              {(() => {
                const color = "#E7FB10";
                const isActive = location.startsWith("/coa");
                return (
                  <Link href="/coa-library" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                      className="flex items-center gap-4 px-4 py-4 rounded-lg border transition-colors"
                      style={{
                        background: isActive ? `${color}18` : "#22222a",
                        borderColor: isActive ? `${color}55` : "#333340",
                      }}
                      data-testid="link-mobile-panel-coa"
                    >
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}22` }}
                      >
                        <FileCheck className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-display text-lg font-bold tracking-wide block leading-tight"
                          style={{ color: isActive ? color : "white", fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          COA Library
                        </span>
                        <span className="text-xs text-gray-400 block">Third-party lab results &amp; verification</span>
                      </div>
                    </div>
                  </Link>
                );
              })()}

            </div>

            {/* Section Divider */}
            <div className="px-4 pb-3">
              <div className="border-t border-white/8" />
            </div>

            {/* 2×2 Quick-Link Grid */}
            <div className="px-4 pb-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Links</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    href: "/reconstitution-wizard",
                    label: "Dosage Wizard",
                    Icon: Calculator,
                    color: "#21d8ff",
                    isActive: location.startsWith("/reconstitution-wizard") || location.startsWith("/tools/peptide-reconstitution"),
                    testId: "link-mobile-panel-calculator",
                  },
                  {
                    href: "/peptide-research-faq",
                    label: "FAQ",
                    Icon: HelpCircle,
                    color: "#a855f7",
                    isActive: location === "/peptide-research-faq",
                    testId: "link-mobile-panel-faq",
                  },
                  {
                    href: "/contact",
                    label: "Contact",
                    Icon: Mail,
                    color: "#22c55e",
                    isActive: location === "/contact",
                    testId: "link-mobile-panel-contact",
                  },
                  {
                    href: "/affiliate",
                    label: "Affiliates",
                    Icon: Sparkles,
                    color: "#E7FB10",
                    isActive: location === "/affiliate" || location.startsWith("/affiliate/"),
                    testId: "link-mobile-panel-affiliates-grid",
                  },
                ].map(({ href, label, Icon, color, isActive, testId }) => (
                  <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                      className="flex flex-col items-center justify-center gap-2 py-4 rounded-lg border transition-colors text-center"
                      style={{
                        background: isActive ? `${color}18` : "#22222a",
                        borderColor: isActive ? `${color}55` : "#333340",
                      }}
                      data-testid={testId}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${color}22` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <span
                        className="text-xs font-semibold leading-tight"
                        style={{ color: isActive ? color : "white" }}
                      >
                        {label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section Divider */}
            <div className="px-4 pb-3">
              <div className="border-t border-white/8" />
            </div>

            {/* Utility Rows */}
            <div className="px-4 space-y-1">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">More</p>

              {/* My Account / Sign In */}
              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors"
                    style={{
                      background: location.startsWith("/dashboard") ? "#21d8ff18" : "transparent",
                    }}
                    data-testid="link-mobile-panel-account"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#21d8ff]/15 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-[#21d8ff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-sm font-medium block"
                        style={{ color: location.startsWith("/dashboard") ? "#21d8ff" : "white" }}
                      >
                        My Account
                      </span>
                      {user?.firstName && (
                        <span className="text-xs text-gray-400">{user.firstName}</span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </div>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left"
                  data-testid="button-mobile-panel-sign-in"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#21d8ff]/15 flex items-center justify-center flex-shrink-0">
                    <LogIn className="h-4 w-4 text-[#21d8ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white block">My Account</span>
                    <span className="text-xs text-[#21d8ff]">Sign In</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
                </Link>
              )}

              {/* Research Academy */}
              <Link href="/academy" onClick={() => setIsMobileMenuOpen(false)}>
                <div
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors"
                  style={{
                    background: location === "/academy" || location.startsWith("/academy/") ? "#a855f718" : "transparent",
                  }}
                  data-testid="link-mobile-panel-academy"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#a855f7]/15 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-4 w-4 text-[#a855f7]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-medium block"
                      style={{ color: location === "/academy" || location.startsWith("/academy/") ? "#a855f7" : "white" }}
                    >
                      Research Academy
                    </span>
                    <span className="text-xs text-gray-500">Learn &amp; earn XP</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </div>
              </Link>

              {/* Sign Out — only shown when authenticated */}
              {isAuthenticated && (
                <button
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left"
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  data-testid="button-mobile-panel-sign-out"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <LogOut className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-red-400">Sign Out</span>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
