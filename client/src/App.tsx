import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MobileStickyEmailBar } from "@/components/mobile-sticky-email-bar";
import { AgeVerificationModal } from "@/components/age-verification-modal";
import { RuoAttestationModal } from "@/components/ruo-attestation-modal";
import { FreeShippingBanner } from "@/components/free-shipping-banner";
import { ProtectedRoute } from "@/components/protected-route";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";

import Home from "@/pages/home";

const Products = lazy(() => import("@/pages/products"));
const Wholesale = lazy(() => import("@/pages/wholesale"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const BundleDetail = lazy(() => import("@/pages/bundle-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const CoaVerification = lazy(() => import("@/pages/coa"));
const CoaLibrary = lazy(() => import("@/pages/coa-library"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const DashboardSummary = lazy(() => import("@/pages/dashboard-summary"));
const DashboardOrders = lazy(() => import("@/pages/dashboard-orders"));
const DashboardStacks = lazy(() => import("@/pages/dashboard-stacks"));
const DashboardLogbook = lazy(() => import("@/pages/dashboard-logbook"));
const DashboardCycles = lazy(() => import("@/pages/dashboard-cycles"));
const DashboardAcademy = lazy(() => import("@/pages/dashboard-academy"));
const DashboardWishlist = lazy(() => import("@/pages/dashboard-wishlist"));
const DashboardSettings = lazy(() => import("@/pages/dashboard-settings"));
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
const InfographicBuilder = lazy(() => import("@/pages/infographic-builder"));
const PkCatalog = lazy(() => import("@/pages/pk-catalog"));
const ResearchStacks = lazy(() => import("@/pages/research-stacks"));
const GalaxyPage = lazy(() => import("@/pages/galaxy"));
const ResearchStackDetail = lazy(() => import("@/pages/research-stack-detail"));
const StackShare = lazy(() => import("@/pages/stack-share"));
const Academy = lazy(() => import("@/pages/academy"));
const Login = lazy(() => import("@/pages/login"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const Unsubscribe = lazy(() => import("@/pages/unsubscribe"));
const OrderConfirmation = lazy(() => import("@/pages/order-confirmation"));
const NotFound = lazy(() => import("@/pages/not-found"));

const CoaTrust = lazy(() => import("@/pages/guides/coa-trust"));
const BatchTesting = lazy(() => import("@/pages/guides/batch-testing"));
const ResearchUseOnly = lazy(() => import("@/pages/guides/research-use-only"));
const VerifyQuality = lazy(() => import("@/pages/guides/verify-quality"));
const PurityExplained = lazy(() => import("@/pages/guides/purity-explained"));
const CheapPeptides = lazy(() => import("@/pages/guides/cheap-peptides"));
const HormonalPeptidesGuide = lazy(() => import("@/pages/guides/hormonal-peptides"));
const HealingPeptidesGuide = lazy(() => import("@/pages/guides/healing-peptides"));
const MetabolicPeptidesGuide = lazy(() => import("@/pages/guides/metabolic-peptides"));
const GrowthPeptidesGuide = lazy(() => import("@/pages/guides/growth-peptides"));
const GrowthHormonePeptidesGuide = lazy(() => import("@/pages/guides/growth-hormone-peptides"));
const CognitivePeptidesGuide = lazy(() => import("@/pages/guides/cognitive-peptides"));
const SkinPeptidesGuide = lazy(() => import("@/pages/guides/skin-peptides"));
const LongevityPeptidesGuide = lazy(() => import("@/pages/guides/longevity-peptides"));
const SystemHub = lazy(() => import("@/pages/systems/system-hub"));

const ChatBot = lazy(() => import("@/components/chatbot").then(m => ({ default: m.ChatBot })));
const BackToTopButton = lazy(() => import("@/components/back-to-top-button").then(m => ({ default: m.BackToTopButton })));

const PageFallback = () => <div className="min-h-screen bg-[#1a1a1f]" />;

function Lazy({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
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
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop">{() => <Lazy component={ProductsHub} />}</Route>
        <Route path="/peptides">{() => <Lazy component={Products} />}</Route>
        <Route path="/peptides/:id">{() => <Lazy component={ProductDetail} />}</Route>
        <Route path="/products">{() => { window.location.replace("/peptides" + window.location.search); return null; }}</Route>
        <Route path="/products/:id">{({ id }) => { window.location.replace(`/peptides/${id}`); return null; }}</Route>
        <Route path="/bulk-packs">{() => { window.location.replace("/peptides"); return null; }}</Route>
        <Route path="/wholesale">{() => <Lazy component={Wholesale} />}</Route>
        <Route path="/research-stacks">{() => <Lazy component={ResearchStacks} />}</Route>
        <Route path="/research-stacks/:id">{() => <Lazy component={ResearchStackDetail} />}</Route>
        <Route path="/galaxy">
          <Suspense fallback={<div className="min-h-screen bg-[#0d0d10]" />}>
            <GalaxyPage />
          </Suspense>
        </Route>
        <Route path="/stacks/:shareCode">{() => <Lazy component={StackShare} />}</Route>
        <Route path="/bundles/:id">{() => <Lazy component={BundleDetail} />}</Route>
        <Route path="/cart">
          <ProtectedRoute title="Your Cart" description="Sign in to view your cart and complete your research compound order.">
            <Suspense fallback={<PageFallback />}><Cart /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/checkout">
          <ProtectedRoute title="Checkout" description="Sign in to complete your order. First-time customers receive a free 3ml BAC water with their first order.">
            <Suspense fallback={<PageFallback />}><Checkout /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/order-confirmation">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><OrderConfirmation /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/coa/verify-certificate-of-analysis">{() => <Lazy component={CoaVerification} />}</Route>
        <Route path="/coa-library">
          <ProtectedRoute title="COA Library" description="Access our complete library of Certificates of Analysis for verified research compounds.">
            <Suspense fallback={<PageFallback />}><CoaLibrary /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/summary">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardSummary /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/orders">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardOrders /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/stacks">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardStacks /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/logbook">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardLogbook /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/cycles">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardCycles /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/academy">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardAcademy /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/wishlist">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardWishlist /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/settings">
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}><DashboardSettings /></Suspense>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard">{() => <Lazy component={Dashboard} />}</Route>
        <Route path="/account-settings">{() => <Lazy component={AccountSettings} />}</Route>
        <Route path="/admin/compound-audit">{() => <Lazy component={CompoundAudit} />}</Route>
        <Route path="/admin/blend-audit">{() => <Lazy component={BlendAudit} />}</Route>
        <Route path="/admin">{() => <Lazy component={Admin} />}</Route>
        <Route path="/affiliate">{() => <Lazy component={Affiliate} />}</Route>
        <Route path="/affiliate-dashboard">{() => <Lazy component={AffiliateDashboard} />}</Route>
        <Route path="/terms-of-service">{() => <Lazy component={TermsOfService} />}</Route>
        <Route path="/terms">{() => { window.location.replace("/terms-of-service"); return null; }}</Route>
        <Route path="/privacy">{() => <Lazy component={PrivacyPolicy} />}</Route>
        <Route path="/disclaimer">{() => <Lazy component={Disclaimer} />}</Route>
        <Route path="/contact">{() => <Lazy component={Contact} />}</Route>
        <Route path="/legal">{() => <Lazy component={Legal} />}</Route>
        {/* Specific /guides/ pages (must come before catch-all /guides/:slug) */}
        <Route path="/guides/peptide-vendor-ethics-standards">{() => <Lazy component={WhatWeDontDo} />}</Route>
        <Route path="/guides/peptide-quality-assurance-process">{() => <Lazy component={QualityProcess} />}</Route>
        <Route path="/guides/peptide-package-arrived-warm">{() => <Lazy component={PackageWarm} />}</Route>
        <Route path="/guides/peptide-pricing-breakdown">{() => <Lazy component={EthicalPricing} />}</Route>
        <Route path="/guides/peptide-vendor-checklist">{() => <Lazy component={BuyerChecklist} />}</Route>
        <Route path="/guides/peptide-handling-troubleshooting">{() => <Lazy component={Troubleshooting} />}</Route>
        <Route path="/guides/peptide-lab-research-archive">{() => <Lazy component={LabNotes} />}</Route>
        <Route path="/guides/are-peptide-coas-trustworthy">{() => <Lazy component={CoaTrust} />}</Route>
        <Route path="/guides/how-batch-testing-works">{() => <Lazy component={BatchTesting} />}</Route>
        <Route path="/guides/what-research-use-only-means">{() => <Lazy component={ResearchUseOnly} />}</Route>
        <Route path="/guides/how-to-verify-peptide-quality">{() => <Lazy component={VerifyQuality} />}</Route>
        <Route path="/guides/peptide-purity-explained">{() => <Lazy component={PurityExplained} />}</Route>
        <Route path="/guides/why-cheap-peptides-are-cheap">{() => <Lazy component={CheapPeptides} />}</Route>
        <Route path="/guides/healing-peptides">{() => <Lazy component={HealingPeptidesGuide} />}</Route>
        <Route path="/guides/metabolic-peptides">{() => <Lazy component={MetabolicPeptidesGuide} />}</Route>
        <Route path="/guides/growth-peptides">{() => <Lazy component={GrowthPeptidesGuide} />}</Route>
        <Route path="/guides/growth-hormone-peptides">{() => <Lazy component={GrowthHormonePeptidesGuide} />}</Route>
        <Route path="/guides/cognitive-peptides">{() => <Lazy component={CognitivePeptidesGuide} />}</Route>
        <Route path="/guides/skin-peptides">{() => <Lazy component={SkinPeptidesGuide} />}</Route>
        <Route path="/guides/longevity-peptides">{() => <Lazy component={LongevityPeptidesGuide} />}</Route>
        <Route path="/guides/hormonal-peptides">{() => <Lazy component={HormonalPeptidesGuide} />}</Route>
        <Route path="/guides/peptide-education-center">{() => <Lazy component={Education} />}</Route>
        {/* Catch-all: compound-name guide URLs intentionally not routed — do not create */}
        {/* Catch-all for individual peptide article pages (e.g. /guides/what-is-bpc-157-peptide) */}
        <Route path="/guides/:slug">{() => <Lazy component={Education} />}</Route>
        <Route path="/login">{() => <Lazy component={Login} />}</Route>
        <Route path="/academy">{() => <Lazy component={Academy} />}</Route>
        <Route path="/about/our-transparency-commitment">{() => <Lazy component={Transparency} />}</Route>
        <Route path="/coa/batch-testing-archive">{() => <Lazy component={BatchArchive} />}</Route>
        <Route path="/tools/peptide-reconstitution-calculator">{() => <Lazy component={DosageCalculator} />}</Route>
        <Route path="/tools/infographic-builder">{() => <Lazy component={InfographicBuilder} />}</Route>
        <Route path="/tools/peptide-pk-catalog">
          <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
            <PkCatalog />
          </Suspense>
        </Route>
        <Route path="/reconstitution-wizard">{() => <Lazy component={ReconstitutionWizard} />}</Route>
        <Route path="/peptide-research-resources">{() => <Lazy component={ResourcesHub} />}</Route>
        <Route path="/peptide-research-faq">{() => <Lazy component={FAQ} />}</Route>
        <Route path="/peptide-shipping-and-handling">{() => <Lazy component={Shipping} />}</Route>
        <Route path="/unsubscribe">{() => <Lazy component={Unsubscribe} />}</Route>
        <Route path="/auth/callback">{() => <Lazy component={AuthCallback} />}</Route>

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
        {/* Body System Hub pages */}
        <Route path="/systems/:slug">{() => <Lazy component={SystemHub} />}</Route>
        {/* Compound-name product URLs intentionally not routed — do not create */}
        <Route>{() => <Lazy component={NotFound} />}</Route>
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

const STANDALONE_ROUTES = ["/login"];

function AppShell() {
  const [location] = useLocation();
  const isStandalone = STANDALONE_ROUTES.some(r => location === r || location.startsWith(r + "?"));

  if (isStandalone) {
    return (
      <>
        <ScrollManager />
        <Router />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <PreventScrollbarHiding />
      <AgeVerificationModal />
      <RuoAttestationModal />
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
      <MobileStickyEmailBar />
      <MobileBottomNav />
      <Suspense fallback={null}>
        {!location.startsWith('/cart') && !location.startsWith('/checkout') && <ChatBot />}
        <BackToTopButton />
      </Suspense>
      <Toaster />
    </>
  );
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
            <AppShell />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
