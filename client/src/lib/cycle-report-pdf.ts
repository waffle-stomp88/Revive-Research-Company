import jsPDF from "jspdf";
import type { ResearchNote } from "@shared/schema";

export interface CycleReportData {
  cycleName: string;
  compoundLabel: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed";
  totalDoses: number;
  daysRunning: number;
  averageDose: number | null;
  averageDoseUnit: string | null;
  dosesPerWeek: number | null;
  entries: ResearchNote[];
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtDateTime(d: Date): string {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function generateCyclePDF(data: CycleReportData): Blob {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor("#0d0d10");
  doc.text("Cycle Report", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#71717a");
  doc.text("Research-use only · Personal logbook export", margin, y + 16);

  doc.setDrawColor("#D4FF1F");
  doc.setLineWidth(2);
  doc.line(margin, y + 28, pageW - margin, y + 28);

  y += 56;

  // Cycle title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#0d0d10");
  doc.text(data.cycleName, margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor("#3f3f46");
  doc.text(data.compoundLabel, margin, y);
  y += 18;

  // Status badge text
  doc.setFontSize(10);
  doc.setTextColor(data.status === "active" ? "#16a34a" : "#71717a");
  doc.text(`Status: ${data.status === "active" ? "Active" : "Completed"}`, margin, y);
  y += 28;

  // Stats grid
  const drawRow = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#71717a");
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#0d0d10");
    doc.text(value, margin, y + 16);
    y += 36;
  };

  drawRow("Date Range", `${fmtDate(data.startDate)} — ${fmtDate(data.endDate)}`);
  drawRow("Total Doses", String(data.totalDoses));
  drawRow("Days Running", String(data.daysRunning));
  if (data.averageDose != null && data.averageDoseUnit) {
    drawRow(
      "Average Dose",
      `${data.averageDose.toFixed(2)} ${data.averageDoseUnit}`,
    );
  }
  if (data.dosesPerWeek != null) {
    drawRow("Doses Per Week", data.dosesPerWeek.toFixed(1));
  }

  // Entries section
  y += 12;
  doc.setDrawColor("#e4e4e7");
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor("#0d0d10");
  doc.text("Entries", margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#3f3f46");

  // Sort entries chronologically (oldest first)
  const sorted = [...data.entries].sort((a, b) => {
    const ta = (a.administeredAt ?? a.createdAt) as unknown as string | Date | null;
    const tb = (b.administeredAt ?? b.createdAt) as unknown as string | Date | null;
    const da = ta ? new Date(ta).getTime() : 0;
    const db = tb ? new Date(tb).getTime() : 0;
    return da - db;
  });

  for (const entry of sorted) {
    if (y > pageH - margin - 80) {
      doc.addPage();
      y = margin;
    }
    const when = (entry.administeredAt ?? entry.createdAt) as unknown as string | Date | null;
    const whenStr = when ? fmtDateTime(new Date(when)) : "—";
    const dose =
      entry.dose && entry.doseUnit
        ? `${entry.dose} ${entry.doseUnit}`
        : entry.dose
        ? String(entry.dose)
        : "";
    const route = entry.route ? ` · ${entry.route}` : "";
    const marker =
      entry.cycleMarker === "start"
        ? " · CYCLE START"
        : entry.cycleMarker === "end"
        ? " · CYCLE END"
        : "";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor("#0d0d10");
    doc.text(whenStr, margin, y);

    if (dose || route || marker) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#3f3f46");
      doc.text(`${dose}${route}${marker}`, margin + 180, y);
    }
    y += 14;

    if (entry.title) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#3f3f46");
      doc.text(doc.splitTextToSize(entry.title, pageW - margin * 2), margin, y);
      y += 12;
    }

    if (entry.content) {
      const lines = doc.splitTextToSize(entry.content, pageW - margin * 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor("#71717a");
      const sliced = (lines as string[]).slice(0, 6);
      for (const line of sliced) {
        if (y > pageH - margin - 20) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 11;
      }
    }

    y += 10;
    doc.setDrawColor("#f4f4f5");
    doc.line(margin, y - 4, pageW - margin, y - 4);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#a1a1aa");
    doc.text(
      `Generated ${fmtDate(new Date())} · Page ${i} of ${pageCount}`,
      margin,
      pageH - 20,
    );
  }

  return doc.output("blob");
}
