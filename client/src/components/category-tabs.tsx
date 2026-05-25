import { useLocation } from "wouter";
import { Link } from "wouter";
import { FlaskConical, Layers, Building2 } from "lucide-react";

interface CategoryTab {
  label: string;
  href: string;
  icon: typeof FlaskConical;
  matchPaths: string[];
  color: string;
  glowColor: string;
}

const categories: CategoryTab[] = [
  {
    label: "Peptides",
    href: "/peptides",
    icon: FlaskConical,
    matchPaths: ["/peptides", "/products"],
    color: "#D4FF1F",
    glowColor: "rgba(231,251,16,0.3)"
  },
  {
    label: "Stacks",
    href: "/research-stacks",
    icon: Layers,
    matchPaths: ["/research-stacks"],
    color: "#9d4edd",
    glowColor: "rgba(157,78,221,0.3)"
  },
  {
    label: "Wholesale",
    href: "/wholesale",
    icon: Building2,
    matchPaths: ["/wholesale"],
    color: "#10b981",
    glowColor: "rgba(16,185,129,0.3)"
  },
];

export function CategoryTabs() {
  const [location] = useLocation();

  const isActive = (tab: CategoryTab) => {
    return tab.matchPaths.some(path => location.startsWith(path));
  };

  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {categories.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center justify-center gap-2 p-3 md:px-4 md:py-2 rounded-full text-sm font-medium transition-all ${
              active
                ? "text-black"
                : "bg-card border border-border/50 text-muted-foreground hover-elevate"
            }`}
            style={active ? {
              backgroundColor: tab.color,
              boxShadow: `0 0 20px ${tab.glowColor}`
            } : undefined}
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
