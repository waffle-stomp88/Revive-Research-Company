import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, Phone, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SupportStatusProps {
  variant?: "inline" | "card";
  showAll?: boolean;
}

function getResponseTimeByTimeZone(): string {
  const now = new Date();
  
  // Convert to Central Time
  const ctTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const ctHour = ctTime.getHours();
  
  // Between 5pm (17) and 9am (9): show 12 hours
  // Otherwise: show 2-4 hours
  const isOffHours = ctHour >= 17 || ctHour < 9;
  return isOffHours ? "12 hours" : "2-4 hours";
}

export function SupportStatus({ variant = "inline", showAll = false }: SupportStatusProps) {
  const [responseTime, setResponseTime] = useState("2-4 hours");
  
  useEffect(() => {
    setResponseTime(getResponseTimeByTimeZone());
    
    // Update every minute to catch time changes
    const interval = setInterval(() => {
      setResponseTime(getResponseTimeByTimeZone());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

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
      value: responseTime,
      color: "#D4FF1F",
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
        <span>Response: {responseTime}</span>
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
