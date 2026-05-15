import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { ResearchStackApiResponse } from "@/lib/research-stacks-api";

interface RelatedStacksProps {
  peptideNames: string[];
}

export function RelatedStacks({ peptideNames }: RelatedStacksProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const { data: apiStacks } = useQuery<ResearchStackApiResponse[]>({
    queryKey: ["/api/research-stacks"],
  });

  const normalised = peptideNames.map((n) => n.toLowerCase());

  const stacks = (apiStacks ?? [])
    .filter((s) =>
      s.showOnPage &&
      Array.isArray(s.peptideDetails) &&
      s.peptideDetails.some((p) => normalised.includes(p.name.toLowerCase()))
    )
    .sort((a, b) => {
      const countA = (a.peptideDetails ?? []).filter((p) => normalised.includes(p.name.toLowerCase())).length;
      const countB = (b.peptideDetails ?? []).filter((p) => normalised.includes(p.name.toLowerCase())).length;
      return countB - countA;
    });

  if (stacks.length === 0) return null;

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="section-related-stacks">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Research Stacks Featuring These Compounds
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {stacks.map((stack, i) => (
          <motion.div
            key={stack.id}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12 }}
          >
            <Card
              className="p-5 h-full border flex flex-col gap-3"
              style={{
                borderColor: `${stack.color}40`,
                background: `${stack.color}0a`,
              }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: stack.color }}
                >
                  {stack.subtitle}
                </p>
                <p className="font-semibold text-base leading-snug">{stack.name}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(stack.peptideDetails ?? []).map((peptide) => (
                  <span
                    key={peptide.name}
                    className="text-xs px-2 py-0.5 rounded-full border font-mono"
                    style={{
                      borderColor: `${stack.color}50`,
                      color: stack.color,
                      background: `${stack.color}18`,
                    }}
                  >
                    {peptide.name}
                  </span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {stack.description}
              </p>

              <Link href={`/research-stacks/${stack.id}`} data-testid={`link-related-stack-${stack.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  style={{ borderColor: `${stack.color}50`, color: stack.color }}
                >
                  View Stack Details
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 font-mono">
        Research compound stacks · For research use only · Not medical advice
      </p>
      <div className="mt-4 text-center">
        <Link
          href="/research-stacks"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="link-view-all-stacks"
        >
          Browse all research stacks →
        </Link>
      </div>
    </div>
  );
}
