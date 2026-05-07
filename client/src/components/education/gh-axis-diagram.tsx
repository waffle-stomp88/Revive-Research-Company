import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Brain, ArrowDown, Zap, Target, Info } from "lucide-react";

interface AxisNode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  color: string;
  position: { y: number };
}

interface PeptideTarget {
  name: string;
  target: string;
  color: string;
  mechanism: string;
}

const ghAxisNodes: AxisNode[] = [
  {
    id: "hypothalamus",
    name: "Hypothalamus",
    fullName: "Hypothalamus",
    description: "Releases GHRH (stimulates GH) and Somatostatin (inhibits GH)",
    color: "#9d4edd",
    position: { y: 10 }
  },
  {
    id: "pituitary",
    name: "Pituitary",
    fullName: "Anterior Pituitary",
    description: "Produces and releases Growth Hormone into bloodstream",
    color: "#21d8ff",
    position: { y: 40 }
  },
  {
    id: "liver",
    name: "Liver",
    fullName: "Liver / Tissues",
    description: "Converts GH to IGF-1; GH acts directly on tissues",
    color: "#E7FB10",
    position: { y: 70 }
  }
];

const peptideTargets: PeptideTarget[] = [
  {
    name: "CJC-1295",
    target: "hypothalamus",
    color: "#21d8ff",
    mechanism: "GHRH analog - stimulates pituitary to release GH"
  },
  {
    name: "Ipamorelin",
    target: "pituitary",
    color: "#E7FB10",
    mechanism: "Ghrelin mimetic - directly stimulates GH secretion"
  },
  {
    name: "Tesamorelin",
    target: "hypothalamus",
    color: "#ec4899",
    mechanism: "Modified GHRH - extended duration GH stimulation"
  }
];

export function GHAxisDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showPeptides, setShowPeptides] = useState(false);

  return (
    <div ref={ref} className="py-8" data-testid="gh-axis-diagram">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          The Growth Hormone Axis
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Understanding how GHRH analogs and secretagogues stimulate natural GH production
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-card border rounded-xl p-6"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <div className="relative" style={{ height: "350px" }}>
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="axisGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#9d4edd" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#21d8ff" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#E7FB10" stopOpacity="0.5" />
                </linearGradient>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" fillOpacity="0.3" />
                </marker>
              </defs>
              
              <motion.line
                x1="50%"
                y1="15%"
                x2="50%"
                y2="85%"
                stroke="url(#axisGradient)"
                strokeWidth="3"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.5 }}
              />

              <motion.line
                x1="50%"
                y1="25%"
                x2="50%"
                y2="42%"
                stroke="currentColor" strokeOpacity="0.3"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1 }}
              />
              <motion.line
                x1="50%"
                y1="55%"
                x2="50%"
                y2="72%"
                stroke="currentColor" strokeOpacity="0.3"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 }}
              />
            </svg>

            {ghAxisNodes.map((node, i) => {
              const isActive = activeNode === node.id;
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.2 }}
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{ top: `${node.position.y}%` }}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  data-testid={`gh-node-${node.id}`}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    className="relative"
                  >
                    <div
                      className="w-32 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: `${node.color}15`,
                        border: `2px solid ${node.color}`,
                        boxShadow: isActive ? `0 0 30px ${node.color}40` : "none"
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: node.color }}>
                        {node.name}
                      </span>
                      {i === 0 && <Brain className="h-4 w-4 mt-1" style={{ color: node.color }} />}
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-20 w-56"
                      >
                        <div 
                          className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-xl"
                          style={{ borderColor: `${node.color}40` }}
                        >
                          <h4 className="font-bold text-sm mb-1" style={{ color: node.color }}>
                            {node.fullName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {node.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 }}
              className="absolute right-4 top-1/4 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1 mb-1">
                <ArrowDown className="h-3 w-3" />
                <span>GHRH</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDown className="h-3 w-3" />
                <span>GH → IGF-1</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPeptides(!showPeptides);
            }}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/30 text-[#21d8ff] hover:bg-[#21d8ff]/20 transition-colors"
            data-testid="button-toggle-peptides"
          >
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">
              {showPeptides ? "Hide" : "Show"} Where Peptides Act
            </span>
          </button>

          {showPeptides && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 grid gap-3"
            >
              {peptideTargets.map((peptide, i) => (
                <motion.div
                  key={peptide.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border"
                  style={{ borderColor: `${peptide.color}30` }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${peptide.color}20` }}
                  >
                    <Zap className="h-4 w-4" style={{ color: peptide.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: peptide.color }}>
                      {peptide.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {peptide.mechanism}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4 }}
          className="mt-6 p-4 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/20"
        >
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-[#E7FB10] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Key concept:</strong> GHRH analogs (CJC-1295, Tesamorelin) 
              mimic the hypothalamus signal, while secretagogues (Ipamorelin) directly stimulate the pituitary. 
              Both approaches result in natural, pulsatile GH release rather than exogenous GH replacement.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
