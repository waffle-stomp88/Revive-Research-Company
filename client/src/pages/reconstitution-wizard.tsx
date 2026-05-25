import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Droplet,
  FlaskConical,
  Link as LinkIcon,
  Search,
  Share2,
  Sparkles,
  Syringe,
  Target,
  AlertTriangle,
  CheckCircle,
  Calculator,
  RotateCcw,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/seo-head";
import { SyringeSVG } from "@/components/syringe-svg";
import {
  COMMON_BAC_WATER_ML,
  COMMON_VIALS_MG,
  FREQUENCY_LABELS,
  SYRINGES,
  computeReconstitution,
  decodeWizardState,
  encodeWizardState,
  type DoseUnit,
  type Frequency,
} from "@/lib/reconstitution-math";
import type { Product } from "@shared/schema";

type WizardState = {
  peptideName: string;
  peptideSlug: string;
  vialMg: number;
  bacWaterMl: number;
  doseValue: number;
  doseUnit: DoseUnit;
  syringeMl: number;
  frequency: Frequency;
};

const DEFAULT_STATE: WizardState = {
  peptideName: "",
  peptideSlug: "",
  vialMg: 10,
  bacWaterMl: 2,
  doseValue: 250,
  doseUnit: "mcg",
  syringeMl: 1,
  frequency: "once_daily",
};

const STEP_TITLES = [
  { id: 1, title: "Peptide", icon: Search, color: "#a855f7" },
  { id: 2, title: "Vial & Water", icon: Droplet, color: "#21d8ff" },
  { id: 3, title: "Syringe & Dose", icon: Syringe, color: "#22c55e" },
  { id: 4, title: "Result", icon: Sparkles, color: "#D4FF1F" },
];

export default function ReconstitutionWizard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);
  const [productSearch, setProductSearch] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Hydrate from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("s");
    if (encoded) {
      const decoded = decodeWizardState<WizardState>(encoded);
      if (decoded) {
        setState({ ...DEFAULT_STATE, ...decoded });
        setStep(4);
      }
    }
  }, []);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = productSearch.trim().toLowerCase();
    const inStock = products.filter((p) => p.inStock !== false);
    if (!q) return inStock.slice(0, 8);
    return inStock
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.slug ?? "").toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [products, productSearch]);

  const result = useMemo(
    () =>
      computeReconstitution({
        doseValue: state.doseValue,
        doseUnit: state.doseUnit,
        vialMg: state.vialMg,
        bacWaterMl: state.bacWaterMl,
        syringeMl: state.syringeMl,
        frequency: state.frequency,
      }),
    [state]
  );

  const update = (patch: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...patch }));

  const canAdvance = useMemo(() => {
    if (step === 1) return state.peptideName.trim().length > 0;
    if (step === 2) return state.vialMg > 0 && state.bacWaterMl > 0;
    if (step === 3) return state.doseValue > 0 && state.syringeMl > 0;
    return true;
  }, [step, state]);

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const reset = () => {
    setState(DEFAULT_STATE);
    setStep(1);
    setProductSearch("");
    window.history.replaceState({}, "", "/reconstitution-wizard");
  };

  const shareUrl = useMemo(() => {
    if (!result) return "";
    const encoded = encodeWizardState(state);
    return `${window.location.origin}/reconstitution-wizard?s=${encoded}`;
  }, [state, result]);

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Share this link to send your exact reconstitution plan.",
      });
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Select the URL bar to copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setIsGeneratingPDF(true);
    try {
      const { generateVialCardPDF } = await import("@/lib/vial-card-pdf");
      const blob = await generateVialCardPDF({
        peptideName: state.peptideName,
        peptideSlug: state.peptideSlug,
        vialMg: state.vialMg,
        bacWaterMl: state.bacWaterMl,
        doseDisplay: `${state.doseValue} ${state.doseUnit}`,
        syringeMl: state.syringeMl,
        result,
        reconstitutionDate: new Date(),
        shareUrl,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = state.peptideName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      a.download = `vial-card-${safeName || "peptide"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({
        title: "Vial Card downloaded",
        description: "Print or save it next to your vial.",
      });
    } catch (err) {
      toast({
        title: "PDF generation failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const headerColor = STEP_TITLES[step - 1].color;
  const HeaderIcon = STEP_TITLES[step - 1].icon;

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-32 md:pb-16">
      <SEOHead
        title="Peptide Reconstitution Wizard - Step-by-Step Guide"
        description="Guided peptide reconstitution wizard with animated syringe visualization. Get exact draw-to-mark instructions and a printable Vial Card."
        canonicalPath="/reconstitution-wizard"
      />

      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4FF1F]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#21d8ff]/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link href="/tools/peptide-reconstitution-calculator">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2" data-testid="button-back-calculator">
              <ArrowLeft className="h-4 w-4" />
              Quick calculator
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4FF1F]/10 border border-[#D4FF1F]/20 mb-4"
          >
            <Sparkles className="h-4 w-4 text-[#D4FF1F]" />
            <span className="text-sm text-[#D4FF1F]">Guided Reconstitution Wizard</span>
          </motion.div>
          <h1 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-2" data-testid="heading-wizard">
            Reconstitute With Confidence
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A step-by-step guide. We'll show you exactly which mark to draw to and give you a printable Vial Card.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HeaderIcon className="h-4 w-4" style={{ color: headerColor }} />
              <span className="text-sm font-medium" style={{ color: headerColor }}>
                Step {step} of 4 · {STEP_TITLES[step - 1].title}
              </span>
            </div>
            <span className="text-xs text-muted-foreground" data-testid="text-progress">
              {Math.round((step / 4) * 100)}%
            </span>
          </div>
          <Progress value={(step / 4) * 100} className="h-1.5" />
          <div className="flex justify-between mt-3">
            {STEP_TITLES.map((s, i) => {
              const reached = step >= s.id;
              const StepIcon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => reached && setStep(s.id)}
                  disabled={!reached}
                  className="flex flex-col items-center gap-1 group"
                  data-testid={`button-step-${s.id}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      reached ? "ring-2" : "opacity-40"
                    }`}
                    style={{
                      backgroundColor: reached ? `${s.color}20` : "transparent",
                      borderColor: reached ? s.color : "transparent",
                      borderWidth: 1,
                      borderStyle: "solid",
                      ...(reached && step === s.id ? { boxShadow: `0 0 0 2px ${s.color}30` } : {}),
                    }}
                  >
                    <StepIcon className="h-4 w-4" style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider hidden md:block" style={{ color: reached ? s.color : "#71717a" }}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main step content */}
          <Card className="border-[#2a2a32] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="p-6 md:p-8"
              >
                {step === 1 && (
                  <Step1Peptide
                    state={state}
                    update={update}
                    products={filteredProducts}
                    productSearch={productSearch}
                    setProductSearch={setProductSearch}
                  />
                )}
                {step === 2 && <Step2VialAndWater state={state} update={update} />}
                {step === 3 && <Step3SyringeAndDose state={state} update={update} />}
                {step === 4 && (
                  <Step4Result
                    state={state}
                    result={result}
                    onDownload={handleDownloadPDF}
                    onShare={handleShare}
                    onReset={reset}
                    isGeneratingPDF={isGeneratingPDF}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Step nav */}
            <div className="flex items-center justify-between p-4 border-t border-[#2a2a32] bg-[#0d0d10]/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={goPrev}
                disabled={step === 1}
                data-testid="button-prev"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              {step < 4 ? (
                <Button
                  size="sm"
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="bg-[#D4FF1F] text-black hover:bg-[#D4FF1F]/90 font-display"
                  data-testid="button-next"
                >
                  Next: {STEP_TITLES[step].title}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={reset}
                  data-testid="button-restart"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Start over
                </Button>
              )}
            </div>
          </Card>

          {/* Sticky summary - desktop */}
          <aside className="hidden lg:block">
            <Card className="border-[#2a2a32] p-5 sticky top-32 z-30" data-testid="card-summary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold uppercase text-sm tracking-wider">Summary</h3>
                <Badge variant="outline" className="text-[10px]">Live</Badge>
              </div>
              <SummaryRows state={state} result={result} />

              <div className="mt-5 pt-4 border-t border-border space-y-2">
                <Link href="/tools/peptide-reconstitution-calculator">
                  <Button variant="outline" size="sm" className="w-full gap-2" data-testid="link-quick-calculator">
                    <Calculator className="h-3.5 w-3.5" />
                    Quick calculator
                  </Button>
                </Link>
                <Link href="/tools/peptide-pk-catalog">
                  <Button variant="outline" size="sm" className="w-full gap-2 border-[#21d8ff]/30 text-[#21d8ff]" data-testid="link-pk-catalog-wizard">
                    <Activity className="h-3.5 w-3.5" />
                    Half-Life Catalog
                  </Button>
                </Link>
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  Compare IV vs SC half-lives for 57 compounds.
                </p>
              </div>
            </Card>
          </aside>
        </div>

        {/* RUO footer */}
        <div className="mt-8 max-w-6xl mx-auto">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-950/30 border border-red-500/40">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">
              <span className="font-bold">RESEARCH USE ONLY.</span> This wizard is a calculation tool for laboratory research. Outputs are mathematical conversions of values you enter — they are not medical guidance and are not intended for human or veterinary use.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile bottom summary bar */}
      {step === 4 && result && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 px-4">
          <Card className="border-[#D4FF1F]/30 bg-background/95 backdrop-blur-md p-3 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Draw to</p>
                <p className="font-display text-xl font-bold text-[#D4FF1F]" data-testid="text-mobile-units">
                  {result.unitsToDraw.toFixed(1)} units
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-[#D4FF1F] text-black hover:bg-[#D4FF1F]/90"
                data-testid="button-mobile-download"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}

// =====================
// Summary panel rows
// =====================
function SummaryRows({
  state,
  result,
}: {
  state: WizardState;
  result: ReturnType<typeof computeReconstitution>;
}) {
  const rows = [
    { label: "Peptide", value: state.peptideName || "Not selected", set: !!state.peptideName },
    { label: "Vial", value: `${state.vialMg} mg`, set: true },
    { label: "BAC Water", value: `${state.bacWaterMl} mL`, set: true },
    { label: "Dose", value: `${state.doseValue} ${state.doseUnit}`, set: state.doseValue > 0 },
    { label: "Syringe", value: `${state.syringeMl} mL (${SYRINGES.find((s) => s.value === String(state.syringeMl))?.units}u)`, set: true },
  ];

  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">{r.label}</span>
          <span className={r.set ? "font-medium" : "text-muted-foreground/60 italic"}>
            {r.value}
          </span>
        </div>
      ))}

      {result && (
        <>
          <div className="border-t border-border my-3" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Concentration</span>
            <span className="font-mono text-sm text-[#21d8ff]">{result.concentrationMgPerMl.toFixed(2)} mg/mL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Draw</span>
            <span className="font-display font-bold text-[#D4FF1F] text-base">{result.unitsToDraw.toFixed(1)} u</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Doses / vial</span>
            <span className="font-mono text-sm">{result.totalDoses}</span>
          </div>
          {result.daysOfSupply !== null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Days supply</span>
              <span className="font-mono text-sm">{result.daysOfSupply}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =====================
// Step 1: Peptide
// =====================
function Step1Peptide({
  state,
  update,
  products,
  productSearch,
  setProductSearch,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  products: Product[];
  productSearch: string;
  setProductSearch: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-[#a855f7]/10 flex items-center justify-center">
          <Search className="h-5 w-5 text-[#a855f7]" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Pick your peptide</h2>
          <p className="text-sm text-muted-foreground">Search our catalog or enter any peptide name.</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Search catalog
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Try BPC-157, Semaglutide..."
              className="pl-10 h-11"
              data-testid="input-peptide-search"
            />
          </div>
        </div>

        {products.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {products.map((p) => {
              const isSelected = state.peptideSlug === (p.slug ?? "");
              return (
                <button
                  key={p.id}
                  onClick={() =>
                    update({ peptideName: p.name, peptideSlug: p.slug ?? "" })
                  }
                  className={`text-left p-3 rounded-lg border-2 transition-all hover-elevate active-elevate-2 ${
                    isSelected
                      ? "border-[#a855f7] bg-[#a855f7]/5"
                      : "border-border"
                  }`}
                  data-testid={`button-product-${p.slug ?? p.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      {p.category && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {p.category}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#a855f7] flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="border-t border-border pt-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Or enter manually
          </Label>
          <Input
            value={state.peptideName}
            onChange={(e) => update({ peptideName: e.target.value, peptideSlug: "" })}
            placeholder="Custom peptide name"
            className="h-11"
            data-testid="input-peptide-manual"
          />
        </div>
      </div>
    </div>
  );
}

// =====================
// Step 2: Vial & Water
// =====================
function Step2VialAndWater({
  state,
  update,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
}) {
  const concentration = state.vialMg / state.bacWaterMl;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-[#21d8ff]/10 flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-[#21d8ff]" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Vial & BAC water</h2>
          <p className="text-sm text-muted-foreground">Tell us how much peptide is in the vial and how much water you'll add.</p>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {/* Vial size */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Vial strength (mg)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {COMMON_VIALS_MG.map((mg) => {
              const sel = state.vialMg === mg;
              return (
                <button
                  key={mg}
                  onClick={() => update({ vialMg: mg })}
                  className={`h-12 rounded-lg border-2 font-display font-bold transition-all hover-elevate active-elevate-2 ${
                    sel ? "border-[#21d8ff] bg-[#21d8ff]/10 text-[#21d8ff]" : "border-border"
                  }`}
                  data-testid={`button-vial-${mg}`}
                >
                  {mg}mg
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              value={state.vialMg || ""}
              onChange={(e) => update({ vialMg: parseFloat(e.target.value) || 0 })}
              onFocus={(e) => e.target.select()}
              placeholder="Custom mg"
              className="h-9"
              data-testid="input-custom-vial"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">or custom</span>
          </div>
        </div>

        {/* BAC water */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            BAC water (mL)
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {COMMON_BAC_WATER_ML.map((ml) => {
              const sel = state.bacWaterMl === ml;
              return (
                <button
                  key={ml}
                  onClick={() => update({ bacWaterMl: ml })}
                  className={`h-12 rounded-lg border-2 font-display font-bold transition-all hover-elevate active-elevate-2 ${
                    sel ? "border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]" : "border-border"
                  }`}
                  data-testid={`button-bac-${ml}`}
                >
                  {ml}mL
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              step="0.5"
              value={state.bacWaterMl || ""}
              onChange={(e) => update({ bacWaterMl: parseFloat(e.target.value) || 0 })}
              onFocus={(e) => e.target.select()}
              placeholder="Custom mL"
              className="h-9"
              data-testid="input-custom-bac"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">or custom</span>
          </div>
        </div>
      </div>

      {/* Live concentration display */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#21d8ff]/10 via-transparent to-[#a855f7]/10 border border-[#21d8ff]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Resulting concentration</p>
            <p className="font-display text-2xl md:text-3xl font-bold text-[#21d8ff] mt-1" data-testid="text-concentration">
              {concentration > 0 ? concentration.toFixed(2) : "—"} mg/mL
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ({(concentration * 1000).toFixed(0)} mcg per mL)
            </p>
          </div>
          <FlaskConical className="h-12 w-12 text-[#21d8ff]/40" />
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
        <p className="font-medium mb-1">Tip</p>
        <p>More BAC water makes small doses easier to measure but means more volume per injection. 2mL is a common starting point for 10mg vials.</p>
      </div>
    </div>
  );
}

// =====================
// Step 3: Syringe & Dose
// =====================
function Step3SyringeAndDose({
  state,
  update,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
          <Syringe className="h-5 w-5 text-[#22c55e]" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Syringe & target dose</h2>
          <p className="text-sm text-muted-foreground">Pick your syringe size and the dose you want per administration.</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Syringe */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Insulin syringe
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {SYRINGES.map((s) => {
              const sel = state.syringeMl === parseFloat(s.value);
              return (
                <button
                  key={s.value}
                  onClick={() => update({ syringeMl: parseFloat(s.value) })}
                  className={`h-16 rounded-lg border-2 transition-all hover-elevate active-elevate-2 flex flex-col items-center justify-center ${
                    sel ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]" : "border-border"
                  }`}
                  data-testid={`button-syringe-${s.value}`}
                >
                  <span className="font-display font-bold text-base">{s.label}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">{s.units} units</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dose */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Target dose
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={state.doseValue || ""}
              onChange={(e) => update({ doseValue: parseFloat(e.target.value) || 0 })}
              onFocus={(e) => e.target.select()}
              className="h-12 text-lg flex-1"
              data-testid="input-dose"
            />
            <Tabs value={state.doseUnit} onValueChange={(v) => update({ doseUnit: v as DoseUnit })}>
              <TabsList className="h-12">
                <TabsTrigger value="mcg" className="px-4 data-[state=active]:bg-[#D4FF1F]/20 data-[state=active]:text-[#D4FF1F]" data-testid="tab-mcg">
                  mcg
                </TabsTrigger>
                <TabsTrigger value="mg" className="px-4 data-[state=active]:bg-[#D4FF1F]/20 data-[state=active]:text-[#D4FF1F]" data-testid="tab-mg">
                  mg
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            How often will you administer?
            <span className="text-[10px] ml-1 text-muted-foreground/70 normal-case tracking-normal">
              (used to estimate days of supply)
            </span>
          </Label>
          <Select
            value={state.frequency}
            onValueChange={(v) => update({ frequency: v as Frequency })}
          >
            <SelectTrigger className="h-11" data-testid="select-frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {FREQUENCY_LABELS[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
          <p className="font-medium mb-1">Note</p>
          <p>You set the target dose. We don't recommend doses — that's between you and your research protocol. We just do the math accurately.</p>
        </div>
      </div>
    </div>
  );
}

// =====================
// Step 4: Result
// =====================
function Step4Result({
  state,
  result,
  onDownload,
  onShare,
  onReset,
  isGeneratingPDF,
}: {
  state: WizardState;
  result: ReturnType<typeof computeReconstitution>;
  onDownload: () => void;
  onShare: () => void;
  onReset: () => void;
  isGeneratingPDF: boolean;
}) {
  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Fill in the prior steps to see your result.</p>
      </div>
    );
  }

  const overCapacity = result.unitsToDraw > result.syringeUnits;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#D4FF1F]/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#D4FF1F]" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Your draw</h2>
          <p className="text-sm text-muted-foreground" data-testid="text-result-summary">
            {state.peptideName} · {state.vialMg}mg vial in {state.bacWaterMl}mL BAC water
          </p>
        </div>
      </div>

      {/* Big draw callout */}
      <div className="mt-4 p-6 rounded-xl bg-gradient-to-br from-[#D4FF1F]/10 via-[#D4FF1F]/5 to-transparent border-2 border-[#D4FF1F]/30">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Draw to</p>
        <div className="flex items-baseline gap-3 mt-1 flex-wrap">
          <p className="font-display text-5xl md:text-7xl font-black text-[#D4FF1F] leading-none" data-testid="text-units-to-draw">
            {result.unitsToDraw.toFixed(1)}
          </p>
          <p className="font-display text-2xl text-[#D4FF1F]/80">units</p>
          <p className="text-sm text-muted-foreground ml-2">
            ({result.volumeToDrawMl.toFixed(3)} mL)
          </p>
        </div>

        {overCapacity && (
          <div className="mt-3 flex items-center gap-2 text-amber-400 text-xs">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Volume exceeds your selected syringe. Use a larger syringe or more BAC water.</span>
          </div>
        )}
      </div>

      {/* Animated syringe */}
      <div className="mt-6 p-4 rounded-xl bg-[#0d0d10]/40 border border-[#2a2a32]">
        <SyringeSVG
          fillUnits={result.unitsToDraw}
          maxUnits={result.syringeUnits}
        />
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-muted/20 border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Concentration</p>
          <p className="font-display text-lg font-bold text-[#21d8ff] mt-0.5">
            {result.concentrationMgPerMl.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground">mg/mL</p>
        </Card>
        <Card className="p-3 bg-muted/20 border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Doses / vial</p>
          <p className="font-display text-lg font-bold text-[#a855f7] mt-0.5" data-testid="text-total-doses">
            {result.totalDoses}
          </p>
          <p className="text-[10px] text-muted-foreground">at this dose</p>
        </Card>
        <Card className="p-3 bg-muted/20 border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Days supply</p>
          <p className="font-display text-lg font-bold text-[#22c55e] mt-0.5" data-testid="text-days-supply">
            {result.daysOfSupply ?? "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">at chosen freq.</p>
        </Card>
        <Card className="p-3 bg-muted/20 border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Best by (4°C)</p>
          <p className="font-display text-lg font-bold mt-0.5">
            30
          </p>
          <p className="text-[10px] text-muted-foreground">days from mix</p>
        </Card>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <Button
          size="lg"
          onClick={onDownload}
          disabled={isGeneratingPDF}
          className="bg-[#D4FF1F] text-black hover:bg-[#D4FF1F]/90 font-display gap-2 shadow-[0_0_20px_rgba(212, 255, 31,0.3)]"
          data-testid="button-download-pdf"
        >
          <Download className="h-5 w-5" />
          {isGeneratingPDF ? "Generating..." : "Download Vial Card (PDF)"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onShare}
          className="font-display gap-2 hover:border-[#21d8ff] hover:text-[#21d8ff]"
          data-testid="button-share"
        >
          <Share2 className="h-5 w-5" />
          Copy Share Link
        </Button>
      </div>

      {/* Linked peptide */}
      {state.peptideSlug && (
        <Link href={`/peptides/${state.peptideSlug}`}>
          <Button variant="ghost" size="sm" className="mt-3 w-full gap-2" data-testid="link-peptide-page">
            <LinkIcon className="h-3.5 w-3.5" />
            View {state.peptideName} product page
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      )}

      {/* Discover synergies in 3D */}
      <Link href="/galaxy">
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full gap-2 text-[#D4FF1F]/80 hover:text-[#D4FF1F]"
          data-testid="link-galaxy-from-wizard"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Discover synergies in 3D — Synergy Galaxy
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </Link>

      {/* Success state */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[#22c55e]">
        <CheckCircle className="h-4 w-4" />
        <span>Calculation complete. Verify before drawing.</span>
      </div>
    </div>
  );
}
