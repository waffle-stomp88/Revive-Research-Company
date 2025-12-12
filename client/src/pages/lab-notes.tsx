import { motion } from "framer-motion";
import { SEOHead, SEO_CONFIG } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Beaker,
  FlaskConical,
  Microscope,
  Thermometer,
  Shield,
  Droplets,
  Sparkles,
  Clock,
} from "lucide-react";

const labNotes = [
  {
    id: 1,
    title: "Why We Test for Endotoxins",
    icon: Microscope,
    color: "#ef4444",
    date: "2024-11-15",
    content: "Endotoxins are bacterial cell wall components that can cause severe immune reactions in research subjects. Even small amounts (measured in EU/mg) can compromise research results. We test every batch to ensure levels remain well below research-safe thresholds, typically targeting <0.5 EU/mg.",
    category: "Testing",
  },
  {
    id: 2,
    title: "Understanding Lyophilization",
    icon: Thermometer,
    color: "#21d8ff",
    date: "2024-11-10",
    content: "Lyophilization (freeze-drying) removes water from peptide solutions while frozen. This process preserves molecular structure and creates a stable powder that can be stored for years. The key is controlled freezing at -80°C followed by vacuum sublimation—a process that takes 24-48 hours per batch.",
    category: "Process",
  },
  {
    id: 3,
    title: "What Purity Percentage Really Means",
    icon: FlaskConical,
    color: "#E7FB10",
    date: "2024-11-05",
    content: "When we say 98%+ purity, we're measuring via HPLC (High-Performance Liquid Chromatography). This tells us what percentage of the sample is the target peptide versus synthesis byproducts or impurities. For research applications, 95%+ is acceptable; we target 98%+ for consistency.",
    category: "Quality",
  },
  {
    id: 4,
    title: "Why Peptide Color Can Vary",
    icon: Droplets,
    color: "#9d4edd",
    date: "2024-10-28",
    content: "Lyophilized peptides range from pure white to off-white to slightly cream-colored. This variation is normal and depends on the amino acid sequence, synthesis conditions, and lyophilization parameters. Color alone doesn't indicate purity—that's what COA testing confirms.",
    category: "Quality",
  },
  {
    id: 5,
    title: "How We Prevent Cross-Contamination",
    icon: Shield,
    color: "#22c55e",
    date: "2024-10-20",
    content: "Each peptide batch is handled in dedicated equipment or thoroughly cleaned between runs. We use separate weighing stations, dedicated reconstitution areas, and strict protocols to ensure no batch carries traces of another compound. This is critical for research integrity.",
    category: "Process",
  },
  {
    id: 6,
    title: "The Role of Mass Spectrometry",
    icon: Beaker,
    color: "#f97316",
    date: "2024-10-15",
    content: "Mass spectrometry (MS) confirms molecular identity by measuring exact molecular weight. While HPLC tells us purity percentage, MS tells us we have the right molecule. The observed mass should match the expected mass within 0.5 daltons—any significant deviation indicates a synthesis error.",
    category: "Testing",
  },
  {
    id: 7,
    title: "Why Storage Temperature Matters",
    icon: Thermometer,
    color: "#ec4899",
    date: "2024-10-08",
    content: "Peptides degrade through hydrolysis and oxidation—both accelerated by heat and moisture. Lyophilized powder at -20°C is extremely stable (2+ years). After reconstitution, 2-8°C storage limits bacterial growth and slows degradation, giving you 2-4 weeks of reliable use.",
    category: "Storage",
  },
  {
    id: 8,
    title: "Batch-to-Batch Consistency",
    icon: Sparkles,
    color: "#21d8ff",
    date: "2024-10-01",
    content: "Every batch undergoes identical synthesis protocols, quality checks, and testing procedures. While minor variations in appearance are normal, the purity, identity, and potency should be consistent. This is why we test every batch individually rather than relying on historical data.",
    category: "Quality",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Testing": return "#ef4444";
    case "Process": return "#21d8ff";
    case "Quality": return "#E7FB10";
    case "Storage": return "#ec4899";
    default: return "#9d4edd";
  }
};

export default function LabNotes() {
  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead {...SEO_CONFIG.labNotes} canonicalPath="/lab-notes" />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
            Technical Insights
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-lab-notes-title">
            Lab Notes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Short, technical insights about peptide production, testing, and quality. 
            Understanding the science behind your research compounds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent">
            <div className="flex items-start gap-4">
              <Beaker className="h-8 w-8 text-[#9d4edd] flex-shrink-0" />
              <div>
                <h2 className="font-display text-xl font-bold mb-2">What Are Lab Notes?</h2>
                <p className="text-muted-foreground">
                  These are concise technical explanations of the processes, testing, and 
                  science behind peptide research compounds. Written for researchers who 
                  want to understand what they're working with.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {labNotes.map((note, index) => {
            const Icon = note.icon;
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card 
                  className="p-6"
                  style={{ borderColor: `${note.color}30` }}
                  data-testid={`card-note-${note.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${note.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: note.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: getCategoryColor(note.category), color: getCategoryColor(note.category) }}
                        >
                          {note.category}
                        </Badge>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold mb-2" style={{ color: note.color }}>
                        {note.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Separator className="my-12" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-muted-foreground">
            Have a technical question we should cover? <a href="/contact" className="text-[#21d8ff] hover:underline" data-testid="link-contact-us">Let us know</a>.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
