/**
 * Restock notification trigger
 *
 * Called automatically when a product transitions from fully out-of-stock
 * to any positive inventory level. Pushes pending OOS subscribers to Zoho
 * Campaigns and marks them as notified in Neon — but ONLY after the Zoho
 * campaign send is confirmed. If the campaign key is not configured, the
 * function exits without touching Neon so all pending rows remain retryable.
 *
 * The call is non-blocking — callers fire-and-forget and log any errors.
 *
 * Setup required before emails will send:
 *   1. Build a restock email campaign in Zoho Campaigns UI.
 *   2. Set its "To" list to "Restock: {Product Name}".
 *   3. Copy the campaign key and store it as ZOHO_RESTOCK_CAMPAIGN_KEY.
 */

import { storage } from "./storage";
import {
  deleteProductRestockList,
  addContactsToList,
  triggerCampaignSend,
} from "./zoho-campaigns";

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

  // Guard: campaign key must be set before we do anything irreversible.
  // Without it we cannot send the email, so we leave all rows in "pending"
  // so they are picked up on the next restock trigger once the key is added.
  const campaignKey = process.env.ZOHO_RESTOCK_CAMPAIGN_KEY;
  if (!campaignKey) {
    console.warn(
      `[restock] ZOHO_RESTOCK_CAMPAIGN_KEY is not set — ${pending.length} subscriber(s) ` +
      `for "${productSlug}" remain pending. Set ZOHO_RESTOCK_CAMPAIGN_KEY and retrigger ` +
      `(e.g. by bumping stock to 0 then back up) to send the notification email.`
    );
    return;
  }

  const emails = pending.map(n => n.email);

  // Step 1 — Delete the old list so only the current pending batch gets the email.
  //           (Prevents re-emailing addresses that were notified in previous OOS cycles.)
  await deleteProductRestockList(productSlug, productName);

  // Step 2 — Create a fresh list and bulk-add the current pending batch.
  await addContactsToList(productSlug, productName, emails);

  // Step 3 — Trigger the Zoho campaign. Throws on API error, so if this
  //           succeeds we know Zoho accepted the send request.
  await triggerCampaignSend(campaignKey);

  // Step 4 — Mark every notified row in Neon (only reached after Zoho confirms).
  await Promise.all(pending.map(n => storage.markNotificationAsSent(n.id)));

  console.log(
    `[restock] Done — notified ${pending.length} subscriber(s) for "${productSlug}".`
  );
}
