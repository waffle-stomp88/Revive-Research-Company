import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogIn, LogOut, Shield, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
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
import logoImage from "@assets/REVIVE-11_1764290805698.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/coa", label: "COA Verification" },
  { href: "/affiliate", label: "Affiliates" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-lg border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" data-testid="link-home-logo">
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

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    whileHover={{ opacity: 0.7 }}
                    className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                      location === link.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-[#E7FB10] text-black">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              {!isLoading && isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        {user?.profileImageUrl && (
                          <AvatarImage src={user.profileImageUrl} alt={user?.firstName || "User"} className="object-cover" />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
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
                    {user?.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer" data-testid="link-admin">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="cursor-pointer text-destructive" data-testid="button-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Link href="/products">
                <Button
                  className="hidden md:inline-flex font-display bg-[#E7FB10] text-primary-foreground border-2 border-[#E7FB10] shadow-glow-sm hover:shadow-glow-lg transition-shadow duration-300"
                  data-testid="button-shop-products"
                >
                  Shop Products
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
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
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg md:hidden pt-20"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={link.href}>
                    <span
                      className={`text-2xl font-display font-medium tracking-wide cursor-pointer ${
                        location === link.href
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                      data-testid={`link-mobile-${link.label.toLowerCase().replace(" ", "-")}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
              
              {isAuthenticated && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link href="/dashboard">
                      <span
                        className={`text-2xl font-display font-medium tracking-wide cursor-pointer ${
                          location === "/dashboard"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                        data-testid="link-mobile-dashboard"
                      >
                        Dashboard
                      </span>
                    </Link>
                  </motion.div>
                  {user?.isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Link href="/admin">
                        <span
                          className={`text-2xl font-display font-medium tracking-wide cursor-pointer ${
                            location === "/admin"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                          data-testid="link-mobile-admin"
                        >
                          Admin Panel
                        </span>
                      </Link>
                    </motion.div>
                  )}
                </>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-4 mt-4"
              >
                <Link href="/products">
                  <Button size="lg" className="font-display bg-[#E7FB10] border-2 border-[#E7FB10] shadow-glow-sm hover:shadow-glow-lg transition-shadow duration-300" data-testid="button-mobile-shop">
                    Shop Products
                  </Button>
                </Link>
                
                {!isLoading && isAuthenticated && (
                  <a href="/api/logout">
                    <Button variant="outline" size="lg" data-testid="button-mobile-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </a>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
