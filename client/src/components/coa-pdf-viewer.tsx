import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface CoaPdfViewerProps {
  pdfUrl: string;
  batchNumber: string;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Scan a canvas for the tight bounding box of non-white content and return
 * a new cropped canvas. A pixel is considered "white" if R,G,B are all ≥ 245.
 */
function cropWhitespace(src: HTMLCanvasElement, padding = 8): HTMLCanvasElement {
  const ctx = src.getContext("2d");
  if (!ctx) return src;
  const { width, height } = src;
  const data = ctx.getImageData(0, 0, width, height).data;

  const isWhite = (idx: number) =>
    data[idx] >= 245 && data[idx + 1] >= 245 && data[idx + 2] >= 245;

  let top = 0, bottom = height - 1, left = 0, right = width - 1;

  outer: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isWhite((y * width + x) * 4)) { top = y; break outer; }
    }
  }
  outer: for (let y = height - 1; y >= top; y--) {
    for (let x = 0; x < width; x++) {
      if (!isWhite((y * width + x) * 4)) { bottom = y; break outer; }
    }
  }
  outer: for (let x = 0; x < width; x++) {
    for (let y = top; y <= bottom; y++) {
      if (!isWhite((y * width + x) * 4)) { left = x; break outer; }
    }
  }
  outer: for (let x = width - 1; x >= left; x--) {
    for (let y = top; y <= bottom; y++) {
      if (!isWhite((y * width + x) * 4)) { right = x; break outer; }
    }
  }

  // Add small padding so content doesn't touch edge
  top    = Math.max(0, top - padding);
  bottom = Math.min(height - 1, bottom + padding);
  left   = Math.max(0, left - padding);
  right  = Math.min(width - 1, right + padding);

  const cw = right - left + 1;
  const ch = bottom - top + 1;

  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const outCtx = out.getContext("2d")!;
  outCtx.drawImage(src, left, top, cw, ch, 0, 0, cw, ch);
  return out;
}

export function CoaPdfViewer({
  pdfUrl,
  batchNumber,
  maxWidth = 560,
  maxHeight = 720,
}: CoaPdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "rendered" | "error">("loading");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      setStatus("loading");
      setDataUrl(null);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjsLib.getDocument({ url: pdfUrl, isEvalSupported: false, useSystemFonts: true }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        if (cancelled) return;

        const unscaled = page.getViewport({ scale: 1 });

        // ── Hi-res render for lightbox (1000 px wide) → crop → JPEG data URL ──
        const hiScale = 1000 / unscaled.width;
        const hiViewport = page.getViewport({ scale: hiScale });
        const hiRaw = document.createElement("canvas");
        hiRaw.width = Math.round(hiViewport.width);
        hiRaw.height = Math.round(hiViewport.height);
        await page.render({ canvasContext: hiRaw.getContext("2d")!, viewport: hiViewport } as any).promise;
        if (cancelled) return;
        const hiCropped = cropWhitespace(hiRaw);
        setDataUrl(hiCropped.toDataURL("image/jpeg", 0.93));

        // ── Thumbnail → crop → draw into persistent canvas ref ──
        const thumbScale = Math.min(maxWidth / unscaled.width, maxHeight / unscaled.height);
        const thumbViewport = page.getViewport({ scale: thumbScale });
        const thumbRaw = document.createElement("canvas");
        thumbRaw.width = Math.round(thumbViewport.width);
        thumbRaw.height = Math.round(thumbViewport.height);
        await page.render({ canvasContext: thumbRaw.getContext("2d")!, viewport: thumbViewport } as any).promise;
        if (cancelled) return;
        const thumbCropped = cropWhitespace(thumbRaw);

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = thumbCropped.width;
        canvas.height = thumbCropped.height;
        canvas.getContext("2d")!.drawImage(thumbCropped, 0, 0);
        if (!cancelled) setStatus("rendered");
      } catch (err) {
        console.error("[CoaPdfViewer]", err);
        if (!cancelled) setStatus("error");
      }
    }

    renderPdf();
    return () => { cancelled = true; };
  }, [pdfUrl, maxWidth, maxHeight]);

  return (
    <>
      {/* ── Thumbnail ── */}
      <div className="w-full flex flex-col items-center bg-[#1a1a1f]" data-testid="coa-inline-pdf-viewer">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-16 w-full">
            <Loader2 className="h-7 w-7 text-[#D4FF1F] animate-spin" />
            <p className="text-sm text-gray-400">Loading COA document…</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-14 w-full">
            <AlertCircle className="h-7 w-7 text-red-400" />
            <p className="text-sm text-gray-500">Unable to preview document</p>
          </div>
        )}

        {/* Wrapper visibility is CSS-toggled — canvas stays in DOM so ref is stable */}
        <div
          className={`relative group cursor-zoom-in w-full ${status === "rendered" ? "block" : "invisible h-0 overflow-hidden"}`}
          onClick={() => { setZoom(1); setLightboxOpen(true); }}
          data-testid="coa-thumbnail-click-target"
          title="Click to enlarge"
        >
          <canvas
            ref={canvasRef}
            className="h-auto shadow-lg block mx-auto"
            style={{ maxWidth: "100%" }}
            data-testid="canvas-coa-pdf"
            aria-label={`Certificate of Analysis — ${batchNumber}`}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/15">
            <span className="flex items-center gap-1.5 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow">
              <ZoomIn className="h-3.5 w-3.5" />
              Click to enlarge
            </span>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-5xl w-full p-0 bg-[#111] border-white/10 overflow-hidden"
          data-testid="dialog-coa-lightbox"
        >
          <VisuallyHidden>
            <DialogTitle>Certificate of Analysis — {batchNumber}</DialogTitle>
          </VisuallyHidden>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1a1a1f]">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#D4FF1F]">Certificate of Analysis</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{batchNumber}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" aria-label="Zoom out" data-testid="button-lightbox-zoom-out"><ZoomOut className="h-4 w-4" /></button>
              <span className="text-xs font-mono text-muted-foreground w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" aria-label="Zoom in" data-testid="button-lightbox-zoom-in"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => setZoom(1)} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" aria-label="Reset zoom"><RotateCcw className="h-3.5 w-3.5" /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={() => setLightboxOpen(false)} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" aria-label="Close" data-testid="button-lightbox-close"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Zoomable image */}
          <div className="overflow-auto bg-[#111]" style={{ maxHeight: "82vh" }}>
            {dataUrl ? (
              <div className="flex justify-center py-4 px-4">
                <img
                  src={dataUrl}
                  alt={`Certificate of Analysis — ${batchNumber}`}
                  draggable={false}
                  data-testid="img-lightbox-coa"
                  style={{ width: `${Math.round(900 * zoom)}px`, maxWidth: "none", height: "auto", display: "block" }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
