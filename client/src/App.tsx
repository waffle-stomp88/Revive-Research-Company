import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef, lazy, Suspense } from "react";
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
import NotFound from "@/pages/not-found";

const Products = lazy(() => import("@/pages/products"));
const BulkPacks = lazy(() => import("@/pages/bulk-packs"));
const Wholesale = lazy(() => import("@/pages/wholesale"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const BundleDetail = lazy(() => import("@/pages/bundle-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const CheckoutSuccess = lazy(() => import("@/pages/checkout-success"));
const CoaVerification = lazy(() => import("@/pages/coa"));
const CoaLibrary = lazy(() => import("@/pages/coa-library"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AccountSettings = lazy(() => import("@/pages/account-settings"));
const Admin = lazy(() => import("@/pages/admin"));
const CompoundAudit = lazy(() => import("@/pages/admin/compound-audit"));
const BlendAudit = lazy(() => import("@/pages/admin/blend-audit"));
const Affiliate = lazy(() => import("@/pages/affiliate"));
const AffiliateDashboard = lazy(() => import("@/pages/affiliate-dashboard"));
const FAQ = lazy(() => import("@/pages/faq"));
const Shipping = lazy(() => import("@/pages/shipping"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const Disclaimer = lazy(() => import("@/pages/disclaimer"));
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
const ReconstitutionWizard = lazy(() => import("@/pages/reconstitution-wizard"));
const ResearchStacks = lazy(() => import("@/pages/research-stacks"));
const ResearchStackDetail = lazy(() => import("@/pages/research-stack-detail"));
const StackShare = lazy(() => import("@/pages/stack-share"));
const Academy = lazy(() => import("@/pages/academy"));
const DevLogin = lazy(() => import("@/pages/dev-login"));
const Unsubscribe = lazy(() => import("@/pages/unsubscribe"));
const SubscriptionSuccess = lazy(() => import("@/pages/subscription-success"));
const OrderConfirmation = lazy(() => import("@/pages/order-confirmation"));

const CoaTrust = lazy(() => import("@/pages/guides/coa-trust"));
const BatchTesting = lazy(() => import("@/pages/guides/batch-testing"));
const ResearchUseOnly = lazy(() => import("@/pages/guides/research-use-only"));
const VerifyQuality = lazy(() => import("@/pages/guides/verify-quality"));
const PurityExplained = lazy(() => import("@/pages/guides/purity-explained"));
const CheapPeptides = lazy(() => import("@/pages/guides/cheap-peptides"));

const ChatBot = lazy(() => import("@/components/chatbot").then(m => ({ default: m.ChatBot })));
const BackToTopButton = lazy(() => import("@/components/back-to-top-button").then(m => ({ default: m.BackToTopButton })));

function RouteFallback() {
  return <div className="min-h-[60vh]" aria-hidden="true" />;
}

function ScrollManager() {
  const [location] = useLocation();
  const isPopState = useRef(false);
  const prevLocation = useRef(location);

  useEffect(() => {
    const handlePopState = () => { isPopState.current = true; };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const flush = () => {
      clearTimeout(timer);
      sessionStorage.setItem('scroll:' + location, String(window.scrollY));
    };
    const save = () => {
      clearTimeout(timer);
      timer = setTimeout(flush, 100);
    };
    window.addEventListener('scroll', save, { passive: true });
    window.addEventListener('pagehide', flush);
    const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('scroll', save);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flush();
    };
  }, [location]);

  useEffect(() => {
    if (location === prevLocation.current) return;
    prevLocation.current = location;

    if (window.location.hash) {
      isPopState.current = false;
      return;
    }

    if (isPopState.current) {
      const saved = sessionStorage.getItem('scroll:' + location);
      requestAnimationFrame(() => window.scrollTo(0, saved ? parseInt(saved, 10) : 0));
      isPopState.current = false;
    } else {
      window.scrollTo(0, 0);
    }
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
      <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop" component={ProductsHub} />
        <Route path="/peptides" component={Products} />
        <Route path="/peptides/:id" component={ProductDetail} />
        <Route path="/products">{() => { window.location.replace("/peptides"); return null; }}</Route>
        <Route path="/products/:id">{({ id }) => { window.location.replace(`/peptides/${id}`); return null; }}</Route>
        <Route path="/bulk-packs" component={BulkPacks} />
        <Route path="/wholesale" component={Wholesale} />
        <Route path="/research-stacks" component={ResearchStacks} />
        <Route path="/research-stacks/:id" component={ResearchStackDetail} />
        <Route path="/stacks/:shareCode" component={StackShare} />
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
        <Route path="/admin/compound-audit" component={CompoundAudit} />
        <Route path="/admin/blend-audit" component={BlendAudit} />
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
        {/* Catch-all: compound-name guide URLs intentionally not routed — do not create */}
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
        <Route path="/reconstitution-wizard" component={ReconstitutionWizard} />
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
        {/* Compound-name product URLs intentionally not routed — do not create */}
        <Route component={NotFound} />
      </Switch>
      </Suspense>
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
              <ScrollManager />
              <div className="min-h-screen flex flex-col bg-background text-foreground [overflow-x:clip]">
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
