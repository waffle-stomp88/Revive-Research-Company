import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Droplet, Syringe, FlaskConical, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  { value: "0.3", label: "0.3mL (30 units)", units: 30 },
  { value: "0.5", label: "0.5mL (50 units)", units: 50 },
  { value: "1", label: "1mL (100 units)", units: 100 },
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
    <div className="min-h-screen bg-[#1a1a1f] pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="h-10 w-10 text-[#E7FB10]" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Peptide Dosage Calculator
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Calculate the exact volume to draw for your research peptides. Enter your parameters below for instant, accurate results.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-[#232329] border-[#2a2a32]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-[#21d8ff]" />
                  Input Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-gray-300 flex items-center gap-2">
                    Desired Dose
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The amount of peptide you want per injection</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={doseValue}
                      onChange={(e) => setDoseValue(e.target.value)}
                      placeholder="Enter dose"
                      className="bg-[#1a1a1f] border-[#3a3a42] text-white flex-1"
                      data-testid="input-dose-value"
                    />
                    <Tabs value={doseUnit} onValueChange={(v) => setDoseUnit(v as "mcg" | "mg")} className="w-32">
                      <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1f]">
                        <TabsTrigger value="mcg" className="text-xs" data-testid="tab-dose-mcg">mcg</TabsTrigger>
                        <TabsTrigger value="mg" className="text-xs" data-testid="tab-dose-mg">mg</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300 flex items-center gap-2">
                    Peptide Vial Strength
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total amount of peptide in your vial (in mg)</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select value={vialStrength} onValueChange={setVialStrength}>
                    <SelectTrigger className="bg-[#1a1a1f] border-[#3a3a42] text-white" data-testid="select-vial-strength">
                      <SelectValue placeholder="Select vial strength" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_VIAL_STRENGTHS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vialStrength === "custom" && (
                    <Input
                      type="number"
                      value={customVialStrength}
                      onChange={(e) => setCustomVialStrength(e.target.value)}
                      placeholder="Enter custom strength (mg)"
                      className="bg-[#1a1a1f] border-[#3a3a42] text-white"
                      data-testid="input-custom-vial-strength"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-[#21d8ff]" />
                    Bacteriostatic Water Volume (mL)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Amount of bacteriostatic water added to reconstitute the peptide</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={waterVolume}
                    onChange={(e) => setWaterVolume(e.target.value)}
                    placeholder="Enter water volume"
                    className="bg-[#1a1a1f] border-[#3a3a42] text-white"
                    data-testid="input-water-volume"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-[#a855f7]" />
                    Syringe Size
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>U-100 insulin syringes (100 units = 1mL)</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <RadioGroup value={syringeSize} onValueChange={setSyringeSize} className="flex flex-wrap gap-3">
                    {SYRINGE_SIZES.map((size) => (
                      <div key={size.value} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={size.value} 
                          id={`syringe-${size.value}`}
                          className="border-[#3a3a42] text-[#E7FB10]"
                          data-testid={`radio-syringe-${size.value}`}
                        />
                        <Label htmlFor={`syringe-${size.value}`} className="text-gray-300 text-sm cursor-pointer">
                          {size.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-[#232329] border-[#2a2a32]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                    Calculation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calculations ? (
                    <div className="space-y-6">
                      {calculations.warnings.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                          {calculations.warnings.map((warning, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-amber-400 text-sm">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1a1a1f] rounded-lg p-4 border border-[#E7FB10]/20">
                          <div className="text-gray-400 text-sm mb-1">Volume to Draw</div>
                          <div className="text-2xl font-bold text-[#E7FB10]" data-testid="result-volume">
                            {calculations.volumeToDraw.toFixed(3)} mL
                          </div>
                          <div className="text-lg text-white mt-1" data-testid="result-units">
                            = {calculations.unitsToDraw} units
                          </div>
                        </div>

                        <div className="bg-[#1a1a1f] rounded-lg p-4 border border-[#21d8ff]/20">
                          <div className="text-gray-400 text-sm mb-1">Concentration</div>
                          <div className="text-xl font-bold text-[#21d8ff]" data-testid="result-concentration">
                            {calculations.concentration.toFixed(2)} mg/mL
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            ({calculations.concentrationMcg.toFixed(0)} mcg/mL)
                          </div>
                        </div>

                        <div className="bg-[#1a1a1f] rounded-lg p-4 border border-[#a855f7]/20 col-span-2">
                          <div className="text-gray-400 text-sm mb-1">Total Doses per Vial</div>
                          <div className="text-2xl font-bold text-[#a855f7]" data-testid="result-total-doses">
                            {calculations.totalDoses} doses
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-[#3a3a42]" />

                      <div>
                        <div className="text-gray-400 text-sm mb-4">Visual Syringe Guide</div>
                        <SyringeVisual 
                          fillPercentage={calculations.fillPercentage}
                          units={calculations.unitsToDraw}
                          maxUnits={calculations.syringeUnits}
                          volumeMl={calculations.volumeToDraw}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Enter your parameters to see calculations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-[#232329] border-[#2a2a32] mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-[#21d8ff]" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30">Step 1</Badge>
                  <h4 className="text-white font-medium">Calculate Concentration</h4>
                  <p className="text-gray-400 text-sm">
                    Divide the peptide amount by water volume to get the concentration (mg/mL).
                  </p>
                  <code className="block bg-[#1a1a1f] text-[#21d8ff] text-xs p-2 rounded mt-2">
                    Concentration = Peptide (mg) ÷ Water (mL)
                  </code>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">Step 2</Badge>
                  <h4 className="text-white font-medium">Calculate Volume to Draw</h4>
                  <p className="text-gray-400 text-sm">
                    Divide your desired dose by the concentration to find the volume.
                  </p>
                  <code className="block bg-[#1a1a1f] text-[#21d8ff] text-xs p-2 rounded mt-2">
                    Volume (mL) = Dose (mg) ÷ Concentration
                  </code>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30">Step 3</Badge>
                  <h4 className="text-white font-medium">Convert to Syringe Units</h4>
                  <p className="text-gray-400 text-sm">
                    Multiply by 100 to convert mL to insulin syringe units.
                  </p>
                  <code className="block bg-[#1a1a1f] text-[#21d8ff] text-xs p-2 rounded mt-2">
                    Units = Volume (mL) × 100
                  </code>
                </div>
              </div>

              <Separator className="bg-[#3a3a42] my-6" />

              <div className="bg-[#1a1a1f] rounded-lg p-4 border border-[#3a3a42]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Research Use Only</h4>
                    <p className="text-gray-400 text-sm">
                      This calculator is provided for research and educational purposes only. 
                      All peptides sold are strictly for laboratory research use. 
                      Consult with a qualified professional before conducting any research.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function SyringeVisual({ fillPercentage, units, maxUnits, volumeMl }: { 
  fillPercentage: number; 
  units: number; 
  maxUnits: number;
  volumeMl: number;
}) {
  const isOverflow = units > maxUnits;
  const clampedFill = Math.min(Math.max(fillPercentage, 0), 100);
  const displayUnits = isOverflow ? maxUnits : units;
  
  return (
    <div className={`relative bg-[#1a1a1f] rounded-lg p-6 border ${isOverflow ? 'border-red-500/50' : 'border-[#3a3a42]'}`}>
      <div className="flex items-center gap-6">
        <div className="relative w-full max-w-md">
          <svg viewBox="0 0 400 80" className="w-full h-auto">
            <defs>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isOverflow ? "#ef4444" : "#E7FB10"} stopOpacity="0.8" />
                <stop offset="100%" stopColor={isOverflow ? "#dc2626" : "#21d8ff"} stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect x="50" y="25" width="300" height="30" rx="4" fill="#2a2a32" stroke={isOverflow ? "#ef4444" : "#3a3a42"} strokeWidth="2" />
            
            <motion.rect 
              x="52" 
              y="27" 
              width={Math.max((clampedFill / 100) * 296, 0)}
              height="26" 
              rx="2" 
              fill="url(#liquidGradient)"
              filter="url(#glow)"
              initial={{ width: 0 }}
              animate={{ width: Math.max((clampedFill / 100) * 296, 0) }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            
            <rect x="30" y="20" width="25" height="40" rx="2" fill="#3a3a42" stroke="#4a4a52" strokeWidth="1" />
            
            <rect x="350" y="35" width="40" height="10" rx="2" fill="#4a4a52" />
            <circle cx="395" cy="40" r="4" fill="#5a5a62" />
            
            {[0, 25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line 
                  x1={50 + (tick / 100) * 300} 
                  y1="55" 
                  x2={50 + (tick / 100) * 300} 
                  y2="62" 
                  stroke="#6a6a72" 
                  strokeWidth="1" 
                />
                <text 
                  x={50 + (tick / 100) * 300} 
                  y="74" 
                  fill="#8a8a92" 
                  fontSize="10" 
                  textAnchor="middle"
                >
                  {Math.round((tick / 100) * maxUnits)}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        <div className="text-right flex-shrink-0">
          {isOverflow ? (
            <>
              <div className="text-2xl font-bold text-red-400 line-through">{units}</div>
              <div className="text-sm text-red-400">exceeds {maxUnits} unit limit</div>
              <div className="text-gray-500 text-xs mt-1">({volumeMl.toFixed(3)} mL)</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-[#E7FB10]">{units}</div>
              <div className="text-gray-400 text-sm">units</div>
              <div className="text-gray-500 text-xs mt-1">({volumeMl.toFixed(3)} mL)</div>
            </>
          )}
        </div>
      </div>
      
      {isOverflow && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Volume exceeds syringe capacity. Use a larger syringe (try 0.5mL or 1mL) or add more bacteriostatic water to dilute.</span>
        </div>
      )}
    </div>
  );
}
