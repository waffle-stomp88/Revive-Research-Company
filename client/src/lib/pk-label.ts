/**
 * Shared helpers for PK label display and estimate detection.
 *
 * Centralising these here prevents duplication between pharmacokinetics-chart.tsx
 * and pk-catalog.tsx, and ensures that every proxy/estimate pattern is caught in
 * one place rather than silently diverging over time.
 */

/**
 * Returns true when the label carries a scientific-transparency qualifier such as
 * "(SC estimate)", "(estimated)", or "(inhaled-route proxy …)".
 * All three patterns indicate that the half-life value is not from a direct,
 * compound-specific plasma PK study and should be visually flagged.
 */
export function isEstimatedLabel(label?: string): boolean {
  if (!label) return false;
  return (
    /\(SC estimate\)/i.test(label) ||
    /\(estimated\)/i.test(label) ||
    /\(inhaled-route proxy[^)]*\)/i.test(label)
  );
}

/**
 * Strips all estimate/proxy qualifier suffixes from a PK label so it can be
 * displayed cleanly.  The amber Info icon (rendered by the caller) conveys the
 * qualifier instead.
 */
export function formatPKLabel(label: string): string {
  return label
    .replace(/\s*\(SC estimate\)/gi, "")
    .replace(/\s*\(estimated\)/gi, "")
    .replace(/\s*\(inhaled-route proxy[^)]*\)/gi, "")
    .trim();
}

/**
 * Returns an appropriate tooltip string for the kind of estimate detected in
 * the label, so that the amber Info icon can show context-specific text.
 */
export function getEstimateTooltip(label?: string): string {
  if (!label) return "";
  if (/\(inhaled-route proxy/i.test(label)) {
    return "Inhaled-route proxy — half-life extrapolated from an analogous inhaled compound or route; no direct compound-specific inhaled PK study was identified.";
  }
  return "SC estimate — extrapolated from IV data or class-level pharmacokinetics; no direct SC plasma PK study was identified.";
}

/**
 * Returns a short human-readable label for the kind of estimate detected in
 * the label. Used for visible badge text and aria-labels where the full tooltip
 * string would be too long.
 */
export function getEstimateShortLabel(label?: string): string {
  if (!label) return "SC estimate";
  if (/\(inhaled-route proxy/i.test(label)) return "Inhaled proxy";
  return "SC estimate";
}
