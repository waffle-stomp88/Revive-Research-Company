import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Dna, Atom, FlaskConical } from "lucide-react";

function FloatingMolecule({ delay, x, size, color }: { delay: number; x: string; size: number; color: string }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: '50%' }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: [0, 0.8, 0.8, 0],
        y: [-50, -150, -250, -350],
        x: [0, 20, -10, 30],
        rotate: [0, 180, 360, 540]
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div 
        className="rounded-full"
        style={{ 
          width: size, 
          height: size, 
          background: color,
          filter: `blur(${size * 0.1}px) drop-shadow(0 0 ${size}px ${color})`
        }}
      />
    </motion.div>
  );
}

function DNAHelix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative w-full h-48 flex items-center justify-center">
      <svg 
        viewBox="0 0 400 120" 
        className="w-full max-w-2xl h-auto"
      >
        <defs>
          <linearGradient id="homeStrandGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E7FB10" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#21d8ff" stopOpacity="1" />
            <stop offset="50%" stopColor="#9d4edd" stopOpacity="1" />
            <stop offset="75%" stopColor="#ec4899" stopOpacity="1" />
            <stop offset="100%" stopColor="#E7FB10" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="homeStrandGradient2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#21d8ff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#E7FB10" stopOpacity="1" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
            <stop offset="75%" stopColor="#9d4edd" stopOpacity="1" />
            <stop offset="100%" stopColor="#21d8ff" stopOpacity="0.9" />
          </linearGradient>
          <filter id="homeGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <motion.path
          d="M 0 60 Q 40 10, 80 60 Q 120 110, 160 60 Q 200 10, 240 60 Q 280 110, 320 60 Q 360 10, 400 60"
          fill="none"
          stroke="url(#homeStrandGradient1)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#homeGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M 0 60 Q 40 110, 80 60 Q 120 10, 160 60 Q 200 110, 240 60 Q 280 10, 320 60 Q 360 110, 400 60"
          fill="none"
          stroke="url(#homeStrandGradient2)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#homeGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
        />
        
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x, index) => {
          const colors = ['#E7FB10', '#21d8ff', '#9d4edd', '#ec4899', '#f97316'];
          const color = colors[index % colors.length];
          const y1 = index % 2 === 0 ? 35 : 85;
          const y2 = index % 2 === 0 ? 85 : 35;
          
          return (
            <motion.g key={x}>
              <motion.line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                style={{ transformOrigin: `${x}px 60px` }}
              />
              <motion.circle
                cx={x}
                cy={y1}
                r={5}
                fill={color}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 1.2 + index * 0.1, type: "spring" }}
              />
              <motion.circle
                cx={x}
                cy={y2}
                r={5}
                fill={color}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 1.3 + index * 0.1, type: "spring" }}
              />
            </motion.g>
          );
        })}
      </svg>
      
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            top: '50%',
            left: `${10 + i * 20}%`,
            background: ['#E7FB10', '#21d8ff', '#9d4edd', '#ec4899', '#f97316'][i]
          }}
          animate={{
            x: [0, 100, 200, 300],
            y: [-30 + i * 10, 30 - i * 10, -30 + i * 10, 30 - i * 10],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.8
          }}
        />
      ))}
    </div>
  );
}

export function MolecularDNAVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#9d4edd]/5 to-background" />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#21d8ff]/10 rounded-full blur-[150px]"
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E7FB10]/10 rounded-full blur-[120px]"
          animate={{ 
            opacity: [0.15, 0.35, 0.15],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#9d4edd]/10 rounded-full blur-[100px]"
          animate={{ 
            opacity: [0.1, 0.25, 0.1],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.1) 0%, rgba(231, 251, 16, 0.05) 100%)',
              borderColor: 'rgba(33, 216, 255, 0.4)',
              boxShadow: '0 0 25px rgba(33, 216, 255, 0.2)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Dna className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
            <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent">
              Precision Engineered Peptides
            </span>
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#9d4edd]">
              The Building Blocks of Innovation
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Scan the QR. View the lab results. Know exactly what you're working with. 
            No guesswork, no blind trust—just verifiable science.
          </p>
        </motion.div>
        
        <DNAHelix />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-3xl mx-auto"
        >
          {[
            { icon: FlaskConical, label: "Lab Synthesized", value: "99%+ Pure", color: "#E7FB10" },
            { icon: Atom, label: "Quality Verified", value: "3rd Party", color: "#21d8ff" },
            { icon: Dna, label: "Research Grade", value: "Certified", color: "#9d4edd" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.7 + index * 0.1 }}
              >
                <motion.div
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-2xl flex items-center justify-center mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${item.color}25 0%, ${item.color}10 100%)`,
                    border: `2px solid ${item.color}50`,
                    boxShadow: `0 0 30px ${item.color}30`
                  }}
                  whileHover={{ scale: 1.1, boxShadow: `0 0 50px ${item.color}50` }}
                >
                  <Icon className="h-10 w-10 md:h-12 md:w-12" style={{ color: item.color, filter: `drop-shadow(0 0 6px ${item.color})` }} />
                </motion.div>
                <div className="font-display text-xl md:text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">{item.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { delay: 0, x: '10%', size: 6, color: '#E7FB10' },
          { delay: 2, x: '25%', size: 8, color: '#21d8ff' },
          { delay: 4, x: '40%', size: 5, color: '#9d4edd' },
          { delay: 1, x: '60%', size: 7, color: '#ec4899' },
          { delay: 3, x: '75%', size: 6, color: '#f97316' },
          { delay: 5, x: '90%', size: 8, color: '#E7FB10' },
        ].map((props, i) => (
          <FloatingMolecule key={i} {...props} />
        ))}
      </div>
    </section>
  );
}
