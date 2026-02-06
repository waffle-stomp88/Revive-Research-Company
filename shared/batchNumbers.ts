export const MANUFACTURER_PRODUCT_IDS: Record<string, { product: string; dosage: string }> = {
  "BA3": { product: "Bacteriostatic Water", dosage: "3ML" },
  "BA10": { product: "Bacteriostatic Water", dosage: "10ML" },
  "BC10": { product: "BPC-157", dosage: "10mg" },
  "CU50": { product: "GHK-Cu", dosage: "50mg" },
  "MS10": { product: "MOTS-c", dosage: "10mg" },
  "RT10": { product: "Retatrutide", dosage: "10mg" },
  "BT5": { product: "TB-500", dosage: "5mg" },
};

export const PRODUCT_TO_MFG_ID: Record<string, string> = {
  "Bacteriostatic Water|3ML": "BA3",
  "Bacteriostatic Water|10ML": "BA10",
  "BPC-157|10mg": "BC10",
  "GHK-Cu|50mg": "CU50",
  "GHK-Cu|50MG": "CU50",
  "MOTS-c|10mg": "MS10",
  "Retatrutide|10mg": "RT10",
  "TB-500|5mg": "BT5",
};

export const BATCH_NUMBER_REGEX = /^[A-Z]{2,4}\d{1,4}-\d{4}[A-Z]$/;

export function validateBatchNumber(batchNumber: string): boolean {
  return BATCH_NUMBER_REGEX.test(batchNumber);
}

export function generateBatchNumber(mfgId: string, year: number, month: number, cycle: string = "A"): string {
  const yy = String(year).slice(-2);
  const mm = String(month).padStart(2, "0");
  return `${mfgId}-${yy}${mm}${cycle.toUpperCase()}`;
}

export function parseBatchNumber(batchNumber: string): { mfgId: string; year: number; month: number; cycle: string } | null {
  const match = batchNumber.match(/^([A-Z]{2,4}\d{1,4})-(\d{2})(\d{2})([A-Z])$/);
  if (!match) return null;
  return {
    mfgId: match[1],
    year: 2000 + parseInt(match[2]),
    month: parseInt(match[3]),
    cycle: match[4],
  };
}

export function getMfgIdForProduct(productName: string, dosage?: string): string | null {
  if (dosage) {
    const key = `${productName}|${dosage}`;
    if (PRODUCT_TO_MFG_ID[key]) return PRODUCT_TO_MFG_ID[key];
  }
  const matches = getAllMfgIdsForProduct(productName);
  if (matches.length === 1) return matches[0].mfgId;
  return null;
}

export function getAllMfgIdsForProduct(productName: string): { mfgId: string; dosage: string }[] {
  const results: { mfgId: string; dosage: string }[] = [];
  for (const [key, mfgId] of Object.entries(PRODUCT_TO_MFG_ID)) {
    if (key.startsWith(`${productName}|`)) {
      const dosage = key.split("|")[1];
      if (!results.find(r => r.mfgId === mfgId)) {
        results.push({ mfgId, dosage });
      }
    }
  }
  return results;
}

export function getNextCycleLetter(existingBatchNumbers: string[], mfgId: string, year: number, month: number): string {
  const yy = String(year).slice(-2);
  const mm = String(month).padStart(2, "0");
  const prefix = `${mfgId}-${yy}${mm}`;
  const existingCycles = existingBatchNumbers
    .filter(bn => bn.startsWith(prefix))
    .map(bn => bn.charAt(bn.length - 1))
    .sort();
  if (existingCycles.length === 0) return "A";
  const lastCycle = existingCycles[existingCycles.length - 1];
  return String.fromCharCode(lastCycle.charCodeAt(0) + 1);
}

export function formatBatchNumberDisplay(batchNumber: string): string {
  const parsed = parseBatchNumber(batchNumber);
  if (!parsed) return batchNumber;
  const info = MANUFACTURER_PRODUCT_IDS[parsed.mfgId];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[parsed.month - 1] || "???";
  if (info) {
    return `${batchNumber} (${info.product} ${info.dosage} - ${monthName} ${parsed.year}, Cycle ${parsed.cycle})`;
  }
  return `${batchNumber} (${monthName} ${parsed.year}, Cycle ${parsed.cycle})`;
}
