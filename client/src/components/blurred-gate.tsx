import { AuthGate } from "@/components/auth-gate";

interface BlurredGateProps {
  previewContent: React.ReactNode;
  title: string;
  description: string;
  testId?: string;
}

export function BlurredGate({ previewContent, title, description, testId }: BlurredGateProps) {
  return (
    <div className="relative py-4 overflow-hidden" data-testid={testId}>
      <div className="blur-sm pointer-events-none select-none opacity-75" aria-hidden="true">
        {previewContent}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a1f]/60 to-[#1a1a1f]" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-4 pt-24">
        <div className="w-full max-w-sm">
          <AuthGate inline inlineTitle={title} inlineDescription={description} />
        </div>
      </div>
    </div>
  );
}
