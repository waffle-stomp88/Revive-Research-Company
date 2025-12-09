import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Droplet, Syringe, FlaskConical, AlertTriangle, Info, Beaker, Target, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const COMMON_VIAL_STRENGTHS = [
  { value: "1", label: "1mg" },
  { value: "2", label: "2mg" },
  { value: "5", label: "5mg" },
  { value: "10", label: "10mg" },
  { value: "15", label: "15mg" },
  { value: "custom", label: "Custom" },
];

const SYRINGE_SIZES = [
  { value: "0.3", label: "0.3mL", units: 30, desc: "30u" },
  { value: "0.5", label: "0.5mL", units: 50, desc: "50u" },
  { value: "1", label: "1mL", units: 100, desc: "100u" },
];

export default function DosageCalculator() {
  const [doseValue, setDoseValue] = useState<string>("250");
  const [doseUnit, setDoseUnit] = useState<"mcg" | "mg">("mcg");
  const [vialStrength, setVialStrength] = useState<string>("5");
  const [customVialStrength, setCustomVialStrength] = useState<string>("");
  const [waterVolume, setWaterVolume] = useState<string>("2");
  const [syringeSize, setSyringeSize] = useState<string>("1");

  const calculations = useMemo(() => {
    const dose = parseFloat(doseValue) || 0;
    const doseInMg = doseUnit === "mcg" ? dose / 1000 : dose;
    const vial = vialStrength === "custom" ? parseFloat(customVialStrength) || 0 : parseFloat(vialStrength) || 0;
    const water = parseFloat(waterVolume) || 0;
    const syringe = parseFloat(syringeSize) || 1;
    const syringeUnits = SYRINGE_SIZES.find(s => s.value === syringeSize)?.units || 100;

    if (vial === 0 || water === 0 || doseInMg === 0) {
      return null;
    }

    const concentration = vial / water;
    const volumeToDraw = doseInMg / concentration;
    const unitsToDrawRaw = volumeToDraw * 100;
    const unitsToDraw = Math.round(unitsToDrawRaw * 10) / 10;
    const totalDoses = Math.floor(vial / doseInMg);
    const fillPercentage = Math.min((volumeToDraw / syringe) * 100, 100);

    const warnings: string[] = [];
    if (unitsToDraw < 5) {
      warnings.push("Dose is very small and may be difficult to measure accurately.");
    }
    if (unitsToDraw > syringeUnits) {
      warnings.push(`Volume exceeds syringe capacity. Use a larger syringe or increase water volume.`);
    }

    return {
      concentration,
      concentrationMcg: concentration * 1000,
      volumeToDraw,
      unitsToDraw,
      totalDoses,
      fillPercentage,
      warnings,
      syringeUnits,
    };
  }, [doseValue, doseUnit, vialStrength, customVialStrength, waterVolume, syringeSize]);

  return (
    <div className="min-h-screen bg-[#0d0d10] pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E7FB10]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#21d8ff]/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-[#a855f7]/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#22c55e]/5 rounded-full blur-[90px]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/20 mb-4"
            >
              <Sparkles className="h-4 w-4 text-[#E7FB10]" />
              <span className="text-sm text-[#E7FB10]">Precision Research Tool</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Peptide Dosage Calculator
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Calculate exact volumes for your research peptides with real-time results
            </p>
          </div>

          {/* Main Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-[#18181c] to-[#131316] rounded-2xl border border-[#E7FB10]/20 overflow-hidden shadow-2xl shadow-[#E7FB10]/5"
          >
            {/* Input Section */}
            <div className="p-6 border-b border-[#2a2a32] bg-gradient-to-r from-[#E7FB10]/5 via-transparent to-[#21d8ff]/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Dose Input */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Target className="h-3 w-3 text-[#E7FB10]" />
                    Dose
                  </Label>
                  <div className="flex">
                    <Input
                      type="number"
                      value={doseValue}
                      onChange={(e) => setDoseValue(e.target.value)}
                      className="bg-[#0d0d10] border-[#2a2a32] text-white rounded-r-none h-9 text-sm focus:border-[#E7FB10] focus:ring-[#E7FB10]/20"
                      data-testid="input-dose-value"
                    />
                    <Tabs value={doseUnit} onValueChange={(v) => setDoseUnit(v as "mcg" | "mg")}>
                      <TabsList className="h-9 rounded-l-none bg-[#1a1a1f] border border-l-0 border-[#2a2a32]">
                        <TabsTrigger value="mcg" className="text-xs h-7 px-2 data-[state=active]:bg-[#E7FB10]/20 data-[state=active]:text-[#E7FB10]" data-testid="tab-dose-mcg">mcg</TabsTrigger>
                        <TabsTrigger value="mg" className="text-xs h-7 px-2 data-[state=active]:bg-[#E7FB10]/20 data-[state=active]:text-[#E7FB10]" data-testid="tab-dose-mg">mg</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* Vial Strength */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <FlaskConical className="h-3 w-3 text-[#21d8ff]" />
                    Vial
                  </Label>
                  {vialStrength === "custom" ? (
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        value={customVialStrength}
                        onChange={(e) => setCustomVialStrength(e.target.value)}
                        placeholder="mg"
                        className="bg-[#0d0d10] border-[#2a2a32] text-white h-9 text-sm flex-1"
                        data-testid="input-custom-vial-strength"
                      />
                      <button 
                        onClick={() => setVialStrength("5")}
                        className="px-2 h-9 text-xs text-gray-400 hover:text-white bg-[#1a1a1f] border border-[#2a2a32] rounded-md"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select value={vialStrength} onValueChange={setVialStrength}>
                      <SelectTrigger className="bg-[#0d0d10] border-[#2a2a32] text-white h-9 text-sm focus:border-[#21d8ff] focus:ring-[#21d8ff]/20" data-testid="select-vial-strength">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1f] border-[#2a2a32]">
                        {COMMON_VIAL_STRENGTHS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Water Volume */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Droplet className="h-3 w-3 text-[#a855f7]" />
                    BAC Water
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={waterVolume}
                      onChange={(e) => setWaterVolume(e.target.value)}
                      className="bg-[#0d0d10] border-[#2a2a32] text-white h-9 text-sm pr-8 focus:border-[#a855f7] focus:ring-[#a855f7]/20"
                      data-testid="input-water-volume"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">mL</span>
                  </div>
                </div>

                {/* Syringe Size */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Syringe className="h-3 w-3 text-[#22c55e]" />
                    Syringe
                  </Label>
                  <div className="flex gap-1">
                    {SYRINGE_SIZES.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setSyringeSize(size.value)}
                        className={`flex-1 h-9 text-xs rounded-md border transition-all ${
                          syringeSize === size.value
                            ? "bg-[#22c55e]/20 border-[#22c55e]/50 text-[#22c55e]"
                            : "bg-[#0d0d10] border-[#2a2a32] text-gray-400 hover:border-[#3a3a42]"
                        }`}
                        data-testid={`radio-syringe-${size.value}`}
                      >
                        {size.desc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {calculations ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  {/* Warnings */}
                  {calculations.warnings.length > 0 && (
                    <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
                      {calculations.warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-amber-400 text-xs">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Result Display */}
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Syringe Visual */}
                    <div className="flex-1 w-full">
                      <EnhancedSyringeVisual
                        fillPercentage={calculations.fillPercentage}
                        units={calculations.unitsToDraw}
                        maxUnits={calculations.syringeUnits}
                        volumeMl={calculations.volumeToDraw}
                      />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                      <ResultCard
                        label="Draw"
                        value={`${calculations.unitsToDraw}`}
                        unit="units"
                        subtext={`${calculations.volumeToDraw.toFixed(3)} mL`}
                        color="#E7FB10"
                        testId="result-units"
                      />
                      <ResultCard
                        label="Conc."
                        value={`${calculations.concentration.toFixed(1)}`}
                        unit="mg/mL"
                        subtext={`${calculations.concentrationMcg.toFixed(0)} mcg/mL`}
                        color="#21d8ff"
                        testId="result-concentration"
                      />
                      <ResultCard
                        label="Total"
                        value={`${calculations.totalDoses}`}
                        unit="doses"
                        subtext="per vial"
                        color="#a855f7"
                        testId="result-total-doses"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a1a1f] mb-3">
                    <Calculator className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-sm">Enter parameters to calculate</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Formula Reference - Premium Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-white text-lg font-semibold mb-1 flex items-center justify-center gap-2">
                <Beaker className="h-5 w-5 text-[#21d8ff]" />
                How the Math Works
              </h3>
              <p className="text-gray-500 text-xs">Follow these three simple steps</p>
            </div>
            
            {/* Timeline Connector */}
            <div className="relative">
              {/* Animated connector line - desktop only */}
              <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#a855f7] rounded-full" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#a855f7] rounded-full blur-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <PremiumFormulaCard
                    step="1"
                    title="CONCENTRATION"
                    description="Divide peptide amount by water volume to get how much peptide is in each mL"
                    example="5mg ÷ 2mL = 2.5 mg/mL"
                    color="#E7FB10"
                    icon={<FlaskConical className="h-4 w-4" />}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PremiumFormulaCard
                    step="2"
                    title="VOLUME"
                    description="Divide your desired dose by the concentration to find how much liquid to draw"
                    example="0.25mg ÷ 2.5 = 0.1 mL"
                    color="#21d8ff"
                    icon={<Droplet className="h-4 w-4" />}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <PremiumFormulaCard
                    step="3"
                    title="UNITS"
                    description="Multiply mL by 100 to get syringe units (the marks on your insulin syringe)"
                    example="0.1 mL × 100 = 10 units"
                    color="#a855f7"
                    icon={<Syringe className="h-4 w-4" />}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-start gap-3 bg-red-500/10 rounded-xl border border-red-500/30 p-4"
          >
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h4 className="text-red-400 text-sm font-medium mb-1">Research Use Only</h4>
              <p className="text-red-300/70 text-xs leading-relaxed">
                This calculator is for research and educational purposes only. All peptides are strictly for laboratory research.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, unit, subtext, color, testId }: {
  label: string;
  value: string;
  unit: string;
  subtext: string;
  color: string;
  testId: string;
}) {
  return (
    <div 
      className="bg-[#0d0d10] rounded-xl p-3 border border-[#2a2a32] text-center min-w-[90px]"
      style={{ borderColor: `${color}20` }}
    >
      <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color }} data-testid={testId}>{value}</div>
      <div className="text-gray-400 text-[10px]">{unit}</div>
      <div className="text-gray-600 text-[9px] mt-1">{subtext}</div>
    </div>
  );
}

function PremiumFormulaCard({ step, title, description, example, color, icon }: {
  step: string;
  title: string;
  description: string;
  example: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div 
      className="relative group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect */}
      <div 
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
        style={{ background: `linear-gradient(135deg, ${color}40, transparent)` }}
      />
      
      {/* Card */}
      <div 
        className="relative bg-gradient-to-b from-[#1c1c22] to-[#141418] rounded-2xl border overflow-hidden"
        style={{ borderColor: `${color}25` }}
      >
        {/* Top accent line */}
        <div 
          className="h-0.5 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
        
        <div className="p-5">
          {/* Step badge */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2"
                style={{ 
                  backgroundColor: `${color}15`,
                  borderColor: `${color}50`,
                  color,
                  boxShadow: `0 0 20px ${color}30`
                }}
              >
                {step}
              </div>
              {/* Icon badge */}
              <div 
                className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <div className="text-black">
                  {icon}
                </div>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h4 
            className="text-center text-sm font-bold tracking-wider mb-3"
            style={{ color }}
          >
            {title}
          </h4>
          
          {/* Description */}
          <p className="text-gray-400 text-xs leading-relaxed text-center mb-4">
            {description}
          </p>
          
          {/* Example box */}
          <div 
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
          >
            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Example</div>
            <code 
              className="font-mono text-sm font-medium"
              style={{ color }}
            >
              {example}
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EnhancedSyringeVisual({ fillPercentage, units, maxUnits, volumeMl }: {
  fillPercentage: number;
  units: number;
  maxUnits: number;
  volumeMl: number;
}) {
  const isOverflow = units > maxUnits;
  const clampedFill = Math.min(Math.max(fillPercentage, 0), 100);
  
  return (
    <div className={`relative rounded-xl p-4 ${isOverflow ? 'bg-red-500/5 border border-red-500/20' : 'bg-[#0d0d10]'}`}>
      <div className="flex items-center gap-4">
        {/* 3D-style Syringe */}
        <div className="flex-1">
          <svg viewBox="0 0 320 60" className="w-full h-auto">
            <defs>
              <linearGradient id="syringeBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a3a42" />
                <stop offset="50%" stopColor="#2a2a32" />
                <stop offset="100%" stopColor="#1a1a1f" />
              </linearGradient>
              <linearGradient id="liquidFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isOverflow ? "#ef4444" : "#E7FB10"} stopOpacity="0.9" />
                <stop offset="100%" stopColor={isOverflow ? "#dc2626" : "#21d8ff"} stopOpacity="0.9" />
              </linearGradient>
              <filter id="innerGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="dropShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>
            
            {/* Plunger */}
            <rect x="10" y="18" width="20" height="24" rx="3" fill="#2a2a32" filter="url(#dropShadow)" />
            <rect x="12" y="20" width="16" height="20" rx="2" fill="url(#syringeBody)" />
            
            {/* Main Barrel */}
            <rect x="30" y="15" width="230" height="30" rx="4" fill="url(#syringeBody)" filter="url(#dropShadow)" />
            <rect x="32" y="17" width="226" height="26" rx="3" fill="#1a1a1f" />
            
            {/* Liquid Fill */}
            <motion.rect
              x="34"
              y="19"
              height="22"
              rx="2"
              fill="url(#liquidFill)"
              filter="url(#innerGlow)"
              initial={{ width: 0 }}
              animate={{ width: Math.max((clampedFill / 100) * 222, 0) }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            
            {/* Needle Hub */}
            <rect x="260" y="22" width="25" height="16" rx="2" fill="#4a4a52" />
            
            {/* Needle */}
            <rect x="285" y="27" width="30" height="6" rx="1" fill="#6a6a72" />
            <polygon points="315,30 325,30 315,27 315,33" fill="#8a8a92" />
            
            {/* Tick Marks */}
            {[0, 25, 50, 75, 100].map((tick, i) => (
              <g key={tick}>
                <line
                  x1={34 + (tick / 100) * 222}
                  y1="42"
                  x2={34 + (tick / 100) * 222}
                  y2={i % 2 === 0 ? 50 : 46}
                  stroke="#4a4a52"
                  strokeWidth="1"
                />
                {i % 2 === 0 && (
                  <text
                    x={34 + (tick / 100) * 222}
                    y="58"
                    fill="#6a6a72"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {Math.round((tick / 100) * maxUnits)}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Units Display */}
        <div className="text-right min-w-[70px]">
          {isOverflow ? (
            <>
              <div className="text-xl font-bold text-red-400 line-through">{units}</div>
              <div className="text-[10px] text-red-400">overflow</div>
            </>
          ) : (
            <>
              <motion.div
                key={units}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold text-[#E7FB10]"
                data-testid="result-volume"
              >
                {units}
              </motion.div>
              <div className="text-[10px] text-gray-500">units</div>
            </>
          )}
        </div>
      </div>

      {isOverflow && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>Exceeds capacity — increase water or use larger syringe</span>
        </div>
      )}
    </div>
  );
}
