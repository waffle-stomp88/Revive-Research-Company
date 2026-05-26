/**
 * Restock notification trigger
 *
 * Called automatically when a product transitions from fully out-of-stock
 * to any positive inventory level. Pushes pending OOS subscribers to Zoho
 * Campaigns and marks them as notified in Neon once the send succeeds.
 *
 * The call is non-blocking — callers fire-and-forget and log any errors.
 */

import { storage } from "./storage";
import {
  deleteProductRestockList,
  addContactsToList,
  triggerCampaignSend,
} from "./zoho-campaigns";

const SITE_URL = "https://reviveresearch.co";

export async function triggerRestockNotifications(
  productSlug: string,
  productName: string
): Promise<void> {
  console.log(`[restock] Checking pending notifications for "${productSlug}"…`);

  const allPending = await storage.getPendingStockNotifications();
  const pending    = allPending.filter(n => n.productId === productSlug);

  if (pending.length === 0) {
    console.log(`[restock] No pending notifications for "${productSlug}", nothing to do.`);
    return;
  }

  console.log(`[restock] ${pending.length} subscriber(s) to notify for "${productSlug}"`);

  const campaignKey = process.env.ZOHO_RESTOCK_CAMPAIGN_KEY;
  const emails      = pending.map(n => n.email);

  // Step 1 — Delete the old list so only the current pending batch gets the email.
  //           (Prevents re-emailing addresses that were notified in previous OOS cycles.)
  await deleteProductRestockList(productSlug, productName);

  // Step 2 — Create a fresh list and bulk-add the current pending batch.
  //           Returns the new list key (created internally if needed).
  await addContactsToList(productSlug, productName, emails);

  // Step 3 — Trigger the Zoho campaign (no-op with a warning if key not set yet).
  //           In Zoho UI: create an email campaign, set its "To" list to
  //           "Restock: {Product Name}", copy the campaign key, and store it
  //           in the ZOHO_RESTOCK_CAMPAIGN_KEY environment variable.
  await triggerCampaignSend(campaignKey);

  // Step 4 — Mark every notified row in Neon (only after Zoho succeeds).
  await Promise.all(pending.map(n => storage.markNotificationAsSent(n.id)));

  console.log(
    `[restock] Done — notified ${pending.length} subscriber(s) for "${productSlug}" ` +
    `(campaignKey=${campaignKey ?? "not set"})`
  );
}
