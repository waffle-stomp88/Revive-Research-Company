import { Lock } from "lucide-react";
import { useLocation } from "wouter";

interface BlurredGateProps {
  previewContent: React.ReactNode;
  title?: string;
  description?: string;
  testId?: string;
  customOverlay?: React.ReactNode;
}

export function BlurredGate({ previewContent, title, description, testId, customOverlay }: BlurredGateProps) {
  const [location, setLocation] = useLocation();

  const overlay = customOverlay ?? (title ? (
    <div
      className="rounded-xl px-4 py-3 text-center"
      style={{
        background: "rgba(26,26,31,0.92)",
        border: "1px solid rgba(231,251,16,0.25)",
        boxShadow: "0 0 20px rgba(231,251,16,0.06)",
      }}
    >
      <Lock className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#E7FB10" }} />
      <p className="text-sm font-semibold text-white leading-snug mb-0.5">{title}</p>
      {description && (
        <p className="text-xs text-white/50 mb-2 leading-snug">{description}</p>
      )}
      <button
        onClick={() =>
          setLocation(`/login?returnTo=${encodeURIComponent(location)}&mode=signup`)
        }
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-black"
        style={{ background: "#E7FB10" }}
        data-testid="button-blurred-gate-signin"
      >
        Create Free Account
      </button>
      <button
        onClick={() =>
          setLocation(`/login?returnTo=${encodeURIComponent(location)}`)
        }
        className="block w-full text-center text-[11px] mt-1.5 transition-colors"
        style={{ color: "#21d8ff" }}
        data-testid="button-blurred-gate-login"
      >
        Already a researcher? Sign in
      </button>
    </div>
  ) : null);

  return (
    <div className="relative rounded-xl overflow-hidden" data-testid={testId}>
      <div className="blur-sm pointer-events-none select-none opacity-40" aria-hidden="true">
        {previewContent}
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #1a1a1f80 55%, #1a1a1f 100%)",
        }}
      />
      {overlay && (
        <div className="relative mt-2 px-2 pb-2">
          {overlay}
        </div>
      )}
    </div>
  );
}
