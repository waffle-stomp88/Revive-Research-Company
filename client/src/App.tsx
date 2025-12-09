import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
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
import { ChatBot } from "@/components/chatbot";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import Home from "@/pages/home";
import Products from "@/pages/products";
import BulkPacks from "@/pages/bulk-packs";
import Wholesale from "@/pages/wholesale";
import Supplies from "@/pages/supplies";
import ProductDetail from "@/pages/product-detail";
import BundleDetail from "@/pages/bundle-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import CoaVerification from "@/pages/coa";
import CoaLibrary from "@/pages/coa-library";
import BatchLookup from "@/pages/batch-lookup";
import Dashboard from "@/pages/dashboard";
import AccountSettings from "@/pages/account-settings";
import Admin from "@/pages/admin";
import Affiliate from "@/pages/affiliate";
import AffiliateDashboard from "@/pages/affiliate-dashboard";
import FAQ from "@/pages/faq";
import Shipping from "@/pages/shipping";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import Contact from "@/pages/contact";
import Legal from "@/pages/legal";
import WhatWeDontDo from "@/pages/what-we-dont-do";
import Education from "@/pages/education";
import QualityProcess from "@/pages/quality-process";
import PackageWarm from "@/pages/package-warm";
import Transparency from "@/pages/transparency";
import EthicalPricing from "@/pages/ethical-pricing";
import BuyerChecklist from "@/pages/buyer-checklist";
import Troubleshooting from "@/pages/troubleshooting";
import BatchArchive from "@/pages/batch-archive";
import LabNotes from "@/pages/lab-notes";
import ResourcesHub from "@/pages/resources";
import ProductsHub from "@/pages/products-hub";
import NotFound from "@/pages/not-found";

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
        <Route path="/" component={Home} />
      <Route path="/shop" component={ProductsHub} />
      <Route path="/peptides" component={Products} />
      <Route path="/peptides/:id" component={ProductDetail} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/bulk-packs" component={BulkPacks} />
      <Route path="/wholesale" component={Wholesale} />
      <Route path="/supplies" component={Supplies} />
      <Route path="/bundles/:id" component={BundleDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/coa" component={CoaVerification} />
      <Route path="/coa-library" component={CoaLibrary} />
      <Route path="/batch" component={BatchLookup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/account-settings" component={AccountSettings} />
      <Route path="/admin" component={Admin} />
      <Route path="/affiliate" component={Affiliate} />
      <Route path="/affiliate-dashboard" component={AffiliateDashboard} />
      <Route path="/faq" component={FAQ} />
      <Route path="/shipping" component={Shipping} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/contact" component={Contact} />
      <Route path="/legal" component={Legal} />
      <Route path="/what-we-dont-do" component={WhatWeDontDo} />
      <Route path="/education" component={Education} />
      <Route path="/education/:slug" component={Education} />
      <Route path="/quality-process" component={QualityProcess} />
      <Route path="/package-warm" component={PackageWarm} />
      <Route path="/transparency" component={Transparency} />
      <Route path="/ethical-pricing" component={EthicalPricing} />
      <Route path="/buyer-checklist" component={BuyerChecklist} />
      <Route path="/troubleshooting" component={Troubleshooting} />
      <Route path="/batch-archive" component={BatchArchive} />
      <Route path="/lab-notes" component={LabNotes} />
      <Route path="/resources" component={ResourcesHub} />
      <Route component={NotFound} />
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
      <ThemeProvider defaultTheme="dark" storageKey="revive-theme">
        <CartProvider>
          <TooltipProvider>
            <PreventScrollbarHiding />
            <AgeVerificationModal />
            <AffiliateTracker />
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-background text-foreground select-none">
              <FreeShippingBanner />
              <Navigation />
              <div className="flex-1">
                <Router />
              </div>
              <Footer />
            </div>
            <ChatBot />
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
