import { AuthGate } from "@/components/auth-gate";

interface BlurredGateProps {
  previewContent: React.ReactNode;
  title: string;
  description: string;
  testId?: string;
  customOverlay?: React.ReactNode;
}

export function BlurredGate({ previewContent, title, description, testId, customOverlay }: BlurredGateProps) {
  return (
    <div className="relative py-4 overflow-hidden" data-testid={testId}>
      {/* Blurred preview content */}
      <div className="blur-sm pointer-events-none select-none opacity-60" aria-hidden="true">
        {previewContent}
      </div>

      {/* Layered gradient fade — more atmospheric, less flat */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, transparent 0%, #1a1a1f22 30%, #1a1a1f88 55%, #1a1a1f 75%)"
        }} />
        {/* Subtle neon glow seeping up from the card */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-32 blur-3xl rounded-full pointer-events-none"
          style={{ background: "#E7FB1008" }} />
      </div>

      {/* Gate card */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-4 pt-20">
        <div className="w-full max-w-sm">
          {customOverlay ?? <AuthGate inline inlineTitle={title} inlineDescription={description} />}
        </div>
      </div>
    </div>
  );
}
