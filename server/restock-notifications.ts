/**
 * Restock notification trigger
 *
 * Called automatically when a product transitions from fully out-of-stock
 * to any positive inventory level. Sends restock notification emails via
 * Amazon SES directly to each pending subscriber, then marks them as
 * notified in Neon.
 *
 * Emails are sent individually so a single failure doesn't block the batch.
 * All results are logged; the function throws only if the Neon mark-as-sent
 * step fails (so rows remain retryable on next restock).
 */

import { storage } from "./storage";
import { sendRestockNotificationEmail } from "./email";
import { addContactsToRestockQueue, type RestockContact } from "./zoho-campaigns";

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

  const productUrl = `https://reviveresearch.co/products/${productSlug}`;
  let sent = 0;
  let failed = 0;

  // Send individually so one bad address doesn't block the rest
  for (const notification of pending) {
    const result = await sendRestockNotificationEmail({
      email: notification.email,
      productName,
      productUrl,
    });
    if (result.success) {
      sent++;
    } else {
      failed++;
      console.error(`[restock] Failed to email ${notification.email}:`, result.error);
    }
  }

  // Mark all rows as sent regardless of individual email failures.
  // A failed SES send is logged above; we don't want to re-notify on next restock.
  await Promise.all(pending.map(n => storage.markNotificationAsSent(n.id)));

  console.log(`[restock] Done — ${sent} sent, ${failed} failed for "${productSlug}".`);

  // Fire-and-forget: add contacts to Zoho "Restock Queue" for CRM visibility.
  // The Zoho autoresponder for this list should be disabled — SES handles delivery.
  const zohoContacts: RestockContact[] = pending.map(n => ({
    email:      n.email,
    productName,
    productUrl,
  }));
  addContactsToRestockQueue(zohoContacts).catch(err => {
    console.error(`[restock] Zoho CRM add failed for "${productSlug}":`, err?.message ?? String(err));
  });
}
