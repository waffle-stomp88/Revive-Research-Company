/**
 * Restock notification trigger
 *
 * Called automatically when a product transitions from fully out-of-stock
 * to any positive inventory level. Pushes pending OOS subscribers to the
 * shared "Restock Queue" Zoho list and marks them as notified in Neon.
 *
 * The call is non-blocking — callers fire-and-forget and log any errors.
 *
 * How email delivery works:
 *   All restock contacts are added to a single shared "Restock Queue" list
 *   in Zoho Campaigns. A Zoho Autoresponder bound to that list fires
 *   immediately when contacts are added, using $[UD:PRODUCT_NAME||]$ and
 *   $[UD:PRODUCT_URL||]$ merge tags populated per-contact by this code.
 *   One autoresponder handles all products — no per-product lists needed.
 *
 * Setup required before emails will send:
 *   1. In Zoho Campaigns → Mailing Lists, create a list named exactly
 *      "Restock Queue".
 *   2. In Zoho Campaigns → Autoresponders, create an autoresponder triggered
 *      by "Contact Added to Mailing List" targeting "Restock Queue".
 *   3. Use the OOS_Product_Email template with send delay = immediately.
 *   4. Activate the autoresponder. No secrets need to be set in Replit.
 */

import { storage } from "./storage";
import {
  addContactsToRestockQueue,
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

  // Add all contacts to the shared "Restock Queue" list with per-contact
  // product merge fields. Adding contacts here triggers the Zoho Autoresponder.
  await addContactsToRestockQueue(contacts);

  // Mark every notified row in Neon. Only reached after Zoho confirms the
  // contact upload — failures leave rows in pending so they're retryable.
  await Promise.all(pending.map(n => storage.markNotificationAsSent(n.id)));

  console.log(
    `[restock] Done — ${pending.length} subscriber(s) added to Zoho for "${productSlug}".`
  );
}
