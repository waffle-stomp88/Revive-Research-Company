import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

interface ModelViewer3DProps {
  modelUrl?: string;
  productName: string;
  className?: string;
}

export function ModelViewer3D({ modelUrl, productName, className = "" }: ModelViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the model-viewer web component library
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.type = "module";
    script.async = true;
    
    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      setError("Failed to load 3D viewer library");
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  if (!modelUrl) {
    return (
      <Card className={`w-full h-96 flex items-center justify-center bg-muted/30 border-2 border-dashed ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No 3D model available</p>
          <p className="text-xs text-muted-foreground/70">Check back soon for interactive 3D views</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full h-96 flex items-center justify-center bg-destructive/5 border-2 border-destructive/30 ${className}`}>
        <div className="text-center">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-96 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      )}
      
      <model-viewer
        src={modelUrl}
        alt={productName}
        auto-rotate="true"
        camera-controls="true"
        ar="true"
        shadow-intensity="1"
        exposure="1"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "var(--radius)",
          backgroundColor: "var(--muted)",
        } as React.CSSProperties}
      >
      </model-viewer>
    </div>
  );
}
