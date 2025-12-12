import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AgeVerificationModal } from "@/components/age-verification-modal";
import { FreeShippingBanner } from "@/components/free-shipping-banner";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";

const Home = lazy(() => import("@/pages/home"));
const Products = lazy(() => import("@/pages/products"));
const BulkPacks = lazy(() => import("@/pages/bulk-packs"));
const Wholesale = lazy(() => import("@/pages/wholesale"));
const Supplies = lazy(() => import("@/pages/supplies"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const BundleDetail = lazy(() => import("@/pages/bundle-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const CheckoutSuccess = lazy(() => import("@/pages/checkout-success"));
const CoaVerification = lazy(() => import("@/pages/coa"));
const CoaLibrary = lazy(() => import("@/pages/coa-library"));
const BatchLookup = lazy(() => import("@/pages/batch-lookup"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AccountSettings = lazy(() => import("@/pages/account-settings"));
const Admin = lazy(() => import("@/pages/admin"));
const Affiliate = lazy(() => import("@/pages/affiliate"));
const AffiliateDashboard = lazy(() => import("@/pages/affiliate-dashboard"));
const FAQ = lazy(() => import("@/pages/faq"));
const Shipping = lazy(() => import("@/pages/shipping"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const Contact = lazy(() => import("@/pages/contact"));
const Legal = lazy(() => import("@/pages/legal"));
const WhatWeDontDo = lazy(() => import("@/pages/what-we-dont-do"));
const Education = lazy(() => import("@/pages/education"));
const QualityProcess = lazy(() => import("@/pages/quality-process"));
const PackageWarm = lazy(() => import("@/pages/package-warm"));
const Transparency = lazy(() => import("@/pages/transparency"));
const EthicalPricing = lazy(() => import("@/pages/ethical-pricing"));
const BuyerChecklist = lazy(() => import("@/pages/buyer-checklist"));
const Troubleshooting = lazy(() => import("@/pages/troubleshooting"));
const BatchArchive = lazy(() => import("@/pages/batch-archive"));
const LabNotes = lazy(() => import("@/pages/lab-notes"));
const ResourcesHub = lazy(() => import("@/pages/resources"));
const ProductsHub = lazy(() => import("@/pages/products-hub"));
const DosageCalculator = lazy(() => import("@/pages/dosage-calculator"));
const ResearchStacks = lazy(() => import("@/pages/research-stacks"));
const ResearchStackDetail = lazy(() => import("@/pages/research-stack-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));

const ChatBot = lazy(() => import("@/components/chatbot").then(m => ({ default: m.ChatBot })));
const BackToTopButton = lazy(() => import("@/components/back-to-top-button").then(m => ({ default: m.BackToTopButton })));

function LazyRoute({ component: Component, ...props }: { component: React.LazyExoticComponent<React.ComponentType<any>> } & Record<string, any>) {
  return (
    <Suspense fallback={null}>
      <Component {...props} />
    </Suspense>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function AnalyticsTracker() {
  useAnalytics();
  return null;
}

function AffiliateTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('affiliateCode', refCode);
      localStorage.setItem('affiliateCodeTimestamp', Date.now().toString());
    }
  }, []);
  
  return null;
}

function Router() {
  return (
    <>
      <AnalyticsTracker />
      <Switch>
        <Route path="/">{() => <LazyRoute component={Home} />}</Route>
        <Route path="/shop">{() => <LazyRoute component={ProductsHub} />}</Route>
        <Route path="/peptides">{() => <LazyRoute component={Products} />}</Route>
        <Route path="/peptides/:id">{(params) => <LazyRoute component={ProductDetail} params={params} />}</Route>
        <Route path="/products">{() => <LazyRoute component={Products} />}</Route>
        <Route path="/products/:id">{(params) => <LazyRoute component={ProductDetail} params={params} />}</Route>
        <Route path="/bulk-packs">{() => <LazyRoute component={BulkPacks} />}</Route>
        <Route path="/wholesale">{() => <LazyRoute component={Wholesale} />}</Route>
        <Route path="/supplies">{() => <LazyRoute component={Supplies} />}</Route>
        <Route path="/research-stacks">{() => <LazyRoute component={ResearchStacks} />}</Route>
        <Route path="/research-stacks/:id">{(params) => <LazyRoute component={ResearchStackDetail} params={params} />}</Route>
        <Route path="/bundles/:id">{(params) => <LazyRoute component={BundleDetail} params={params} />}</Route>
        <Route path="/cart">{() => <LazyRoute component={Cart} />}</Route>
        <Route path="/checkout">{() => <LazyRoute component={Checkout} />}</Route>
        <Route path="/checkout/success">{() => <LazyRoute component={CheckoutSuccess} />}</Route>
        <Route path="/coa">{() => <LazyRoute component={CoaVerification} />}</Route>
        <Route path="/coa-library">{() => <LazyRoute component={CoaLibrary} />}</Route>
        <Route path="/batch">{() => <LazyRoute component={BatchLookup} />}</Route>
        <Route path="/dashboard">{() => <LazyRoute component={Dashboard} />}</Route>
        <Route path="/account-settings">{() => <LazyRoute component={AccountSettings} />}</Route>
        <Route path="/admin">{() => <LazyRoute component={Admin} />}</Route>
        <Route path="/affiliate">{() => <LazyRoute component={Affiliate} />}</Route>
        <Route path="/affiliate-dashboard">{() => <LazyRoute component={AffiliateDashboard} />}</Route>
        <Route path="/faq">{() => <LazyRoute component={FAQ} />}</Route>
        <Route path="/shipping">{() => <LazyRoute component={Shipping} />}</Route>
        <Route path="/terms">{() => <LazyRoute component={TermsOfService} />}</Route>
        <Route path="/privacy">{() => <LazyRoute component={PrivacyPolicy} />}</Route>
        <Route path="/contact">{() => <LazyRoute component={Contact} />}</Route>
        <Route path="/legal">{() => <LazyRoute component={Legal} />}</Route>
        <Route path="/what-we-dont-do">{() => <LazyRoute component={WhatWeDontDo} />}</Route>
        <Route path="/education">{() => <LazyRoute component={Education} />}</Route>
        <Route path="/education/:slug">{(params) => <LazyRoute component={Education} params={params} />}</Route>
        <Route path="/quality-process">{() => <LazyRoute component={QualityProcess} />}</Route>
        <Route path="/package-warm">{() => <LazyRoute component={PackageWarm} />}</Route>
        <Route path="/transparency">{() => <LazyRoute component={Transparency} />}</Route>
        <Route path="/ethical-pricing">{() => <LazyRoute component={EthicalPricing} />}</Route>
        <Route path="/buyer-checklist">{() => <LazyRoute component={BuyerChecklist} />}</Route>
        <Route path="/troubleshooting">{() => <LazyRoute component={Troubleshooting} />}</Route>
        <Route path="/batch-archive">{() => <LazyRoute component={BatchArchive} />}</Route>
        <Route path="/lab-notes">{() => <LazyRoute component={LabNotes} />}</Route>
        <Route path="/dosage-calculator">{() => <LazyRoute component={DosageCalculator} />}</Route>
        <Route path="/resources">{() => <LazyRoute component={ResourcesHub} />}</Route>
        <Route>{() => <LazyRoute component={NotFound} />}</Route>
      </Switch>
    </>
  );
}

function PreventScrollbarHiding() {
  useEffect(() => {
    // Prevent Radix UI from hiding scrollbars when dropdowns/modals open
    const observer = new MutationObserver(() => {
      const html = document.documentElement;
      const body = document.body;
      
      if (html.style.overflow === 'hidden' || body.style.overflow === 'hidden') {
        html.style.overflow = 'auto';
        html.style.overflowY = 'auto';
        html.style.overflowX = 'auto';
        body.style.overflow = 'auto';
        body.style.overflowY = 'auto';
        body.style.overflowX = 'auto';
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <PreventScrollbarHiding />
            <AgeVerificationModal />
            <AffiliateTracker />
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-background text-foreground select-none">
              <FreeShippingBanner />
              <Navigation />
              <div className="flex-1 min-h-[60vh]">
                <Suspense fallback={null}>
                  <Router />
                </Suspense>
              </div>
              <Footer />
            </div>
            <Suspense fallback={null}>
              <ChatBot />
              <BackToTopButton />
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
