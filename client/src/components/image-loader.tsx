import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const ImageLoader = memo(function ImageLoader({ 
  src, 
  alt, 
  className = "w-full h-full object-cover", 
  containerClassName = "relative w-full h-full bg-muted overflow-hidden rounded-lg",
  priority = false
}: ImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className={containerClassName}>
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 backdrop-blur-sm"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-[#E7FB10]" />
          </motion.div>
        </motion.div>
      )}
      
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={className}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoadingComplete}
          onError={handleError}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
});
