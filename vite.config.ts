import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Three.js / React Three Fiber — very large, only used on /galaxy
          if (
            id.includes("node_modules/three") ||
            id.includes("node_modules/@react-three") ||
            id.includes("node_modules/troika-") ||
            id.includes("node_modules/meshline")
          ) {
            return "vendor-three";
          }
          // PDF + QR code generation — only used in reconstitution wizard
          if (
            id.includes("node_modules/jspdf") ||
            id.includes("node_modules/qrcode")
          ) {
            return "vendor-pdf";
          }
          // Charting library — only used in admin / pk-catalog
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "vendor-charts";
          }
          // Framer Motion — used across many pages but not on initial load
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-framer-motion";
          }
          // Radix UI primitives (large collection)
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-radix";
          }
          // React core — keep small and stable for long-term caching
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "framer-motion",
      "jspdf",
      "qrcode",
      "recharts",
      "lucide-react",
    ],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
