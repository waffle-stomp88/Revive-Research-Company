import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AgeVerificationModal } from "@/components/age-verification-modal";
import { FreeShippingBanner } from "@/components/free-shipping-banner";
import { ProtectedRoute } from "@/components/protected-route";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";

import Home from "@/pages/home";
import Products from "@/pages/products";
import BulkPacks from "@/pages/bulk-packs";
import Wholesale from "@/pages/wholesale";
import ProductDetail from "@/pages/product-detail";
import BundleDetail from "@/pages/bundle-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import CoaVerification from "@/pages/coa";
import CoaLibrary from "@/pages/coa-library";
import Dashboard from "@/pages/dashboard";
import AccountSettings from "@/pages/account-settings";
import Admin from "@/pages/admin";
import Affiliate from "@/pages/affiliate";
import AffiliateDashboard from "@/pages/affiliate-dashboard";
import FAQ from "@/pages/faq";
import Shipping from "@/pages/shipping";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import Disclaimer from "@/pages/disclaimer";
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
import DosageCalculator from "@/pages/dosage-calculator";
import ResearchStacks from "@/pages/research-stacks";
import ResearchStackDetail from "@/pages/research-stack-detail";
import Academy from "@/pages/academy";
import DevLogin from "@/pages/dev-login";
import Unsubscribe from "@/pages/unsubscribe";
import SubscriptionSuccess from "@/pages/subscription-success";
import OrderConfirmation from "@/pages/order-confirmation";
import NotFound from "@/pages/not-found";

import CoaTrust from "@/pages/guides/coa-trust";
import BatchTesting from "@/pages/guides/batch-testing";
import ResearchUseOnly from "@/pages/guides/research-use-only";
import VerifyQuality from "@/pages/guides/verify-quality";
import PurityExplained from "@/pages/guides/purity-explained";
import CheapPeptides from "@/pages/guides/cheap-peptides";

const ChatBot = lazy(() => import("@/components/chatbot").then(m => ({ default: m.ChatBot })));
const BackToTopButton = lazy(() => import("@/components/back-to-top-button").then(m => ({ default: m.BackToTopButton })));

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
        <Route path="/research-stacks" component={ResearchStacks} />
        <Route path="/research-stacks/:id" component={ResearchStackDetail} />
        <Route path="/bundles/:id" component={BundleDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/subscription/success" component={SubscriptionSuccess} />
        <Route path="/order-confirmation" component={OrderConfirmation} />
        <Route path="/coa/verify-certificate-of-analysis" component={CoaVerification} />
        <Route path="/coa-library">
          <ProtectedRoute title="COA Library" description="Access our complete library of Certificates of Analysis for verified research compounds.">
            <CoaLibrary />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/account-settings" component={AccountSettings} />
        <Route path="/admin" component={Admin} />
        <Route path="/affiliate" component={Affiliate} />
        <Route path="/affiliate-dashboard" component={AffiliateDashboard} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/terms">{() => { window.location.replace("/terms-of-service"); return null; }}</Route>
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/contact" component={Contact} />
        <Route path="/legal" component={Legal} />
        {/* Specific /guides/ pages (must come before catch-all /guides/:slug) */}
        <Route path="/guides/peptide-vendor-ethics-standards" component={WhatWeDontDo} />
        <Route path="/guides/peptide-quality-assurance-process" component={QualityProcess} />
        <Route path="/guides/peptide-package-arrived-warm" component={PackageWarm} />
        <Route path="/guides/peptide-pricing-breakdown" component={EthicalPricing} />
        <Route path="/guides/peptide-vendor-checklist" component={BuyerChecklist} />
        <Route path="/guides/peptide-handling-troubleshooting" component={Troubleshooting} />
        <Route path="/guides/peptide-lab-research-archive" component={LabNotes} />
        <Route path="/guides/are-peptide-coas-trustworthy" component={CoaTrust} />
        <Route path="/guides/how-batch-testing-works" component={BatchTesting} />
        <Route path="/guides/what-research-use-only-means" component={ResearchUseOnly} />
        <Route path="/guides/how-to-verify-peptide-quality" component={VerifyQuality} />
        <Route path="/guides/peptide-purity-explained" component={PurityExplained} />
        <Route path="/guides/why-cheap-peptides-are-cheap" component={CheapPeptides} />
        <Route path="/guides/peptide-education-center" component={Education} />
        {/* Catch-all for individual peptide article pages (e.g. /guides/what-is-bpc-157-peptide) */}
        <Route path="/guides/:slug" component={Education} />
        <Route path="/academy">
          <ProtectedRoute title="Peptide Research Academy" description="Access exclusive educational content, courses, and earn achievements as you learn.">
            <Academy />
          </ProtectedRoute>
        </Route>
        <Route path="/about/our-transparency-commitment" component={Transparency} />
        <Route path="/coa/batch-testing-archive" component={BatchArchive} />
        <Route path="/tools/peptide-reconstitution-calculator" component={DosageCalculator} />
        <Route path="/peptide-research-resources" component={ResourcesHub} />
        <Route path="/peptide-research-faq" component={FAQ} />
        <Route path="/peptide-shipping-and-handling" component={Shipping} />
        <Route path="/unsubscribe" component={Unsubscribe} />
        <Route path="/rx-panel-7v3k" component={DevLogin} />

        {/* 301 Redirects for old URLs */}
        <Route path="/coa">{() => { window.location.replace("/coa/verify-certificate-of-analysis"); return null; }}</Route>
        <Route path="/faq">{() => { window.location.replace("/peptide-research-faq"); return null; }}</Route>
        <Route path="/shipping">{() => { window.location.replace("/peptide-shipping-and-handling"); return null; }}</Route>
        <Route path="/what-we-dont-do">{() => { window.location.replace("/guides/peptide-vendor-ethics-standards"); return null; }}</Route>
        <Route path="/education/:slug">{(params: { slug: string }) => { window.location.replace(`/guides/${params.slug}`); return null; }}</Route>
        <Route path="/education">{() => { window.location.replace("/guides/peptide-education-center"); return null; }}</Route>
        <Route path="/quality-process">{() => { window.location.replace("/guides/peptide-quality-assurance-process"); return null; }}</Route>
        <Route path="/package-warm">{() => { window.location.replace("/guides/peptide-package-arrived-warm"); return null; }}</Route>
        <Route path="/transparency">{() => { window.location.replace("/about/our-transparency-commitment"); return null; }}</Route>
        <Route path="/ethical-pricing">{() => { window.location.replace("/guides/peptide-pricing-breakdown"); return null; }}</Route>
        <Route path="/buyer-checklist">{() => { window.location.replace("/guides/peptide-vendor-checklist"); return null; }}</Route>
        <Route path="/troubleshooting">{() => { window.location.replace("/guides/peptide-handling-troubleshooting"); return null; }}</Route>
        <Route path="/batch-archive">{() => { window.location.replace("/coa/batch-testing-archive"); return null; }}</Route>
        <Route path="/lab-notes">{() => { window.location.replace("/guides/peptide-lab-research-archive"); return null; }}</Route>
        <Route path="/dosage-calculator">{() => { window.location.replace("/tools/peptide-reconstitution-calculator"); return null; }}</Route>
        <Route path="/resources">{() => { window.location.replace("/peptide-research-resources"); return null; }}</Route>
        <Route path="/peptides/retatrutide">{() => { window.location.replace("/peptides/rr-a3"); return null; }}</Route>
        <Route path="/products/retatrutide">{() => { window.location.replace("/products/rr-a3"); return null; }}</Route>
        <Route path="/guides/what-is-retatrutide-peptide">{() => { window.location.replace("/guides/what-is-rr-a3-peptide"); return null; }}</Route>
        
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function PreventScrollbarHiding() {
  useEffect(() => {
    const stripScrollLockStyles = (el: HTMLElement) => {
      // Remove any inline styles that could cause layout shift
      if (el.style.cssText) {
        el.style.cssText = '';
      }
      if (el.hasAttribute('style')) {
        el.removeAttribute('style');
      }
      // Remove data attributes that Radix uses for scroll lock
      if (el.hasAttribute('data-scroll-locked')) {
        el.removeAttribute('data-scroll-locked');
      }
    };
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const target = mutation.target as HTMLElement;
        if (target === document.body || target === document.documentElement) {
          stripScrollLockStyles(target);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked'],
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

  // Auth0 configuration with fallback values for production builds
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-5xq04wwsd1n7xn2n.us.auth0.com';
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'yOXwbImbiTsHffDetLDjqo38XhCKXtzU';

  return (
    <Auth0Provider
      domain={auth0Domain || ''}
      clientId={auth0ClientId || ''}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        window.location.replace(appState?.returnTo || window.location.pathname);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CartProvider>
            <TooltipProvider>
              <PreventScrollbarHiding />
              <AgeVerificationModal />
              <AffiliateTracker />
              <ScrollToTop />
              <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
                <FreeShippingBanner />
                <Navigation />
                <div className="flex-1 pb-16 md:pb-0">
                  <Router />
                </div>
                <Footer className="hidden md:block" />
              </div>
              <MobileBottomNav />
              <Suspense fallback={null}>
                <ChatBot />
                <BackToTopButton />
              </Suspense>
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Auth0Provider>
  );
}

export default App;
