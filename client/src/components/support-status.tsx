import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, Phone, MessageCircle } from "lucide-react";

interface SupportStatusProps {
  variant?: "inline" | "card";
  showAll?: boolean;
}

export function SupportStatus({ variant = "inline", showAll = false }: SupportStatusProps) {
  const statusItems = [
    {
      icon: MessageCircle,
      label: "Live Chat",
      value: "M-F 10am-4pm CT",
      color: "#22c55e",
    },
    {
      icon: Mail,
      label: "Email",
      value: "Within 24 hours",
      color: "#21d8ff",
    },
    {
      icon: Clock,
      label: "Typical Response",
      value: "2-4 hours",
      color: "#E7FB10",
    },
  ];

  if (variant === "card") {
    return (
      <Card className="p-4 border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Support Status</span>
        </div>
        <div className="space-y-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
                <span className="font-medium" style={{ color: item.color }}>{item.value}</span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">Support Online</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Response: 2-4 hours</span>
      </div>
      {showAll && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span>Email: 24 hours</span>
        </div>
      )}
    </div>
  );
}
