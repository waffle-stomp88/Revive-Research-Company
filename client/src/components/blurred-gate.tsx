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
    <div className="relative" data-testid={testId}>
      {/* Blurred preview — fades out at the bottom */}
      <div className="relative overflow-hidden">
        <div className="blur-sm pointer-events-none select-none opacity-50" aria-hidden="true">
          {previewContent}
        </div>
        {/* Gradient wipe over the blurred content */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, transparent 10%, #1a1a1f90 60%, #1a1a1f 100%)"
        }} />
      </div>

      {/* Gate card — always fully visible, in flow below blur */}
      <div className="relative -mt-2 px-1 pb-2">
        {customOverlay ?? <AuthGate inline inlineTitle={title} inlineDescription={description} />}
      </div>
    </div>
  );
}
