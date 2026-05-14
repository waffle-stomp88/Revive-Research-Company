interface BlurredGateProps {
  previewContent: React.ReactNode;
  title?: string;
  description?: string;
  testId?: string;
}

export function BlurredGate({ previewContent, testId }: BlurredGateProps) {
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
    </div>
  );
}
