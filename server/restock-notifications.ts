/**
 * Restock notification trigger
 *
 * Called automatically when a product transitions from fully out-of-stock
 * to any positive inventory level. Pushes pending OOS subscribers to Zoho
 * Campaigns and marks them as notified in Neon.
 *
 * The call is non-blocking — callers fire-and-forget and log any errors.
 *
 * How email delivery works:
 *   Adding contacts to the per-product Zoho list ("Restock: {Product Name}")
 *   triggers a Zoho Autoresponder configured to fire on "Contact Added to
 *   Mailing List". The autoresponder template uses $[UD:PRODUCT_NAME||]$ and
 *   $[UD:PRODUCT_URL||]$ merge tags which are populated per-contact by this
 *   code. No API campaign-trigger call is needed — Zoho fires automatically.
 *
 * Setup required before emails will send:
 *   1. In Zoho Campaigns → Autoresponders, create an autoresponder triggered
 *      by "Contact Added to Mailing List" targeting "Restock:" lists.
 *   2. Use the OOS_Product_Email template with send delay = immediately.
 *   3. Activate the autoresponder. No secrets need to be set.
 */

import { storage } from "./storage";
import {
  deleteProductRestockList,
  addContactsToList,
  type RestockContact,
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

  const contacts: RestockContact[] = pending.map(n => ({
    email:      n.email,
    productName,
    productUrl: `https://reviveresearch.co/products/${productSlug}`,
  }));

  // Step 1 — Delete the old list so only the current pending batch gets the email.
  //           (Prevents re-emailing addresses that were notified in previous OOS cycles.)
  await deleteProductRestockList(productSlug, productName);

  // Step 2 — Create a fresh list and bulk-add the current pending batch with
  //           product merge fields (PRODUCT_NAME, PRODUCT_URL) populated.
  //           Adding contacts here automatically triggers the Zoho Autoresponder.
  await addContactsToList(productSlug, productName, contacts);

  // Step 3 — Mark every notified row in Neon. Reached only after Zoho confirms
  //           the contact upload, so failures leave rows retryable.
  await Promise.all(pending.map(n => storage.markNotificationAsSent(n.id)));

  console.log(
    `[restock] Done — ${pending.length} subscriber(s) added to Zoho for "${productSlug}".`
  );
}
