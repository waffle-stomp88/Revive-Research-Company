import { useLocation, Link } from "wouter";
import { Home, ShoppingBag, ShoppingCart, GraduationCap, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  { 
    label: "Home", 
    href: "/", 
    icon: Home,
    matchPaths: ["/"]
  },
  { 
    label: "Shop", 
    href: "/peptides", 
    icon: ShoppingBag,
    matchPaths: ["/shop", "/peptides", "/products", "/research-stacks"]
  },
  { 
    label: "Cart", 
    href: "/cart", 
    icon: ShoppingCart,
    matchPaths: ["/cart", "/checkout"]
  },
  { 
    label: "Education", 
    href: "/guides/peptide-education-center", 
    icon: GraduationCap,
    matchPaths: ["/guides", "/academy", "/peptide-research-resources", "/tools"]
  },
  { 
    label: "Account", 
    href: "/dashboard", 
    icon: User,
    matchPaths: ["/dashboard", "/account-settings", "/affiliate-dashboard"]
  },
];

export function MobileBottomNav() {
  const [location] = useLocation();
  const { getItemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const itemCount = getItemCount();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => {
        if (path === "/") return location === "/";
        return location.startsWith(path);
      });
    }
    return location === item.href;
  };

  const getAccountHref = () => (isAuthenticated ? "/dashboard" : "/login");

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-[#1a1a1f] border-t border-white/10"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }}
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const isCart = item.label === "Cart";
          const isAccount = item.label === "Account";
          const href = isAccount ? getAccountHref() : item.href;
          
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
                active 
                  ? "text-[#E7FB10]" 
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                {isCart && itemCount > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-[#E7FB10] text-black rounded-full px-1"
                    data-testid="cart-badge-count"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${active ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
