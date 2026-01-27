import { useLocation } from "wouter";
import { Link } from "wouter";
import { FlaskConical, Boxes, Layers, Building2 } from "lucide-react";

interface CategoryTab {
  label: string;
  href: string;
  icon: typeof FlaskConical;
  matchPaths: string[];
}

const categories: CategoryTab[] = [
  {
    label: "Peptides",
    href: "/peptides",
    icon: FlaskConical,
    matchPaths: ["/peptides", "/products"]
  },
  {
    label: "Bulk Packs",
    href: "/bulk-packs",
    icon: Boxes,
    matchPaths: ["/bulk-packs"]
  },
  {
    label: "Stacks",
    href: "/research-stacks",
    icon: Layers,
    matchPaths: ["/research-stacks"]
  },
  {
    label: "Wholesale",
    href: "/wholesale",
    icon: Building2,
    matchPaths: ["/wholesale"]
  },
];

export function CategoryTabs() {
  const [location] = useLocation();

  const isActive = (tab: CategoryTab) => {
    return tab.matchPaths.some(path => location.startsWith(path));
  };

  return (
    <div className="flex gap-2 justify-center md:justify-start">
      {categories.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center justify-center gap-2 p-3 md:px-4 md:py-2 rounded-full text-sm font-medium transition-all ${
              active
                ? "bg-[#E7FB10] text-black shadow-[0_0_20px_rgba(231,251,16,0.3)]"
                : "bg-card border border-border/50 text-muted-foreground hover-elevate"
            }`}
            data-testid={`tab-${tab.label.toLowerCase().replace(/ /g, "-")}`}
            title={tab.label}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
