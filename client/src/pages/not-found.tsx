import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-4"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="font-display text-8xl md:text-9xl font-bold text-muted-foreground/20 block mb-4"
        >
          404
        </motion.span>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-4" data-testid="text-404-title">
          Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="font-display gap-2" data-testid="button-go-home">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="font-display gap-2" data-testid="button-browse-products">
              Browse Products
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
