import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { ReconResult } from "./reconstitution-math";

interface VialCardData {
  peptideName: string;
  peptideSlug?: string;
  vialMg: number;
  bacWaterMl: number;
  doseDisplay: string;
  syringeMl: number;
  result: ReconResult;
  reconstitutionDate?: Date;
  shareUrl?: string;
}

export async function generateVialCardPDF(data: VialCardData): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor("#0d0d10");
  doc.text("Vial Card", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#71717a");
  doc.text("Reconstitution reference - keep with your vial", margin, y + 16);

  doc.setDrawColor("#D4FF1F");
  doc.setLineWidth(2);
  doc.line(margin, y + 28, pageW - margin, y + 28);

  y += 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor("#0d0d10");
  doc.text(data.peptideName, margin, y);

  y += 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor("#3f3f46");

  const drawRow = (label: string, value: string, accent?: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#71717a");
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(accent ?? "#0d0d10");
    doc.text(value, margin, y + 16);
    y += 38;
  };

  drawRow("Vial Strength", `${data.vialMg} mg`);
  drawRow("BAC Water", `${data.bacWaterMl} mL`);
  drawRow("Concentration", `${data.result.concentrationMgPerMl.toFixed(2)} mg/mL  (${data.result.concentrationMcgPerMl.toFixed(0)} mcg/mL)`);
  drawRow("Target Dose", data.doseDisplay);
  drawRow("Syringe", `${data.syringeMl} mL  (${data.result.syringeUnits}u)`);
  drawRow(
    "Draw To",
    `${data.result.unitsToDraw.toFixed(1)} units  (${data.result.volumeToDrawMl.toFixed(3)} mL)`,
    "#22c55e"
  );
  drawRow("Total Doses Per Vial", String(data.result.totalDoses));

  if (data.reconstitutionDate) {
    drawRow(
      "Reconstituted",
      data.reconstitutionDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    );
    const expiry = new Date(data.reconstitutionDate);
    expiry.setDate(expiry.getDate() + 30);
    drawRow("Best Used By (4°C)", expiry.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }));
  }

  // Big "Draw" callout box
  const boxY = y + 8;
  doc.setFillColor("#D4FF1F");
  doc.rect(margin, boxY, pageW - margin * 2, 70, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor("#0d0d10");
  doc.text(
    `Draw to ${data.result.unitsToDraw.toFixed(1)} units`,
    pageW / 2,
    boxY + 46,
    { align: "center" }
  );

  y = boxY + 100;

  // QR Code linking back to the wizard with full state (so the recipe can be reopened)
  try {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const qrTarget = data.shareUrl || `${baseUrl}/reconstitution-wizard`;
    const qrDataUrl = await QRCode.toDataURL(qrTarget, { width: 160, margin: 1 });
    doc.addImage(qrDataUrl, "PNG", pageW - margin - 80, y, 80, 80);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#71717a");
    doc.text("Scan to reopen this recipe", pageW - margin - 80, y + 90);
  } catch {
    // QR optional - skip silently
  }

  // Storage tips
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor("#0d0d10");
  doc.text("Storage", margin, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#3f3f46");
  const storage = [
    "- Store reconstituted vial at 2-8°C (refrigerator)",
    "- Use within 30 days for best stability",
    "- Keep away from light and freezing temperatures",
    "- Wipe stopper with alcohol before each draw",
  ];
  storage.forEach((line, i) => {
    doc.text(line, margin, y + 28 + i * 12);
  });

  // Warnings
  if (data.result.warnings.length > 0) {
    y += 90;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor("#b45309");
    doc.text("Notes", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#3f3f46");
    data.result.warnings.forEach((w, i) => {
      const lines = doc.splitTextToSize(`- ${w}`, pageW - margin * 2);
      doc.text(lines, margin, y + 14 + i * 24);
    });
  }

  // Footer / RUO
  const footerY = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor("#e4e4e7");
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageW - margin, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor("#dc2626");
  doc.text("RESEARCH USE ONLY", margin, footerY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#71717a");
  doc.text(
    "For laboratory research purposes only. Not for human or veterinary use. Not a drug, food, or cosmetic.",
    margin,
    footerY + 30
  );
  doc.text(
    `Generated by Revive Research - ${new Date().toLocaleDateString()}`,
    margin,
    footerY + 42
  );

  return doc.output("blob");
}
