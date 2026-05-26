/**
 * Zoho Campaigns REST API v1.1 client
 *
 * Confirmed working endpoints (all probed against live account):
 *   POST getmailinglists           — list all mailing lists
 *   GET  deletemailinglist         — delete a list by listkey
 *   POST addlistandcontacts        — create new list + seed contacts (emailids param)
 *   POST addlistsubscribersinbulk  — bulk-add emails to existing list (emailids param)
 *   GET  getlistsubscribers        — read contacts in a list
 *   POST sendcampaign              — trigger a pre-built campaign by campaignkey
 *
 * Environment variables required:
 *   ZOHO_CLIENT_ID       — from Zoho API Console
 *   ZOHO_CLIENT_SECRET   — from Zoho API Console
 *   ZOHO_REFRESH_TOKEN   — obtained via OAuth code exchange
 *
 * Optional:
 *   ZOHO_RESTOCK_CAMPAIGN_KEY — campaign key to trigger after adding contacts
 *                               (set this after building your email template in Zoho UI)
 */

const BASE_URL   = "https://campaigns.zoho.com/api/v1.1";
const TOKEN_URL  = "https://accounts.zoho.com/oauth/v2/token";
const TIMEOUT_MS = 20_000;
const BATCH_SIZE = 250;

// ---------------------------------------------------------------------------
// In-process cache: productSlug → Zoho list key
// ---------------------------------------------------------------------------
const listKeyCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

async function getAccessToken(): Promise<string> {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error(
      "[zoho] ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN must all be set"
    );
  }
  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "refresh_token",
      client_id:     ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      refresh_token: ZOHO_REFRESH_TOKEN,
    }).toString(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json() as any;
  if (!data.access_token) {
    throw new Error(`[zoho] Token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token as string;
}

// ---------------------------------------------------------------------------
// Low-level request helpers
// ---------------------------------------------------------------------------

async function zohoGet(path: string, token: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("resfmt", "JSON");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
    signal:  AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    throw new Error(`[zoho] Non-JSON response from ${path}: ${text.slice(0, 200)}`);
  }
}

async function zohoPost(path: string, token: string, body: Record<string, string>): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method:  "POST",
    headers: {
      Authorization:  `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ resfmt: "JSON", ...body }).toString(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    throw new Error(`[zoho] Non-JSON response from ${path}: ${text.slice(0, 200)}`);
  }
}

function isZohoError(data: any): boolean {
  return data?.status === "error" || (data?.code !== undefined && data.code !== "0" && String(data.code) !== "0");
}

// ---------------------------------------------------------------------------
// List management
// ---------------------------------------------------------------------------

/**
 * Looks up the Zoho list key for a product's restock waitlist by list name.
 * Searches existing lists; does NOT create — use addContactsToList for that.
 */
async function findListKeyByName(token: string, listName: string): Promise<string | null> {
  const res = await zohoPost("/getmailinglists", token, { range: "100" });
  const items: any[] = res?.list_of_details ?? [];
  const match = items.find((l) => l.listname === listName);
  return match?.listkey ?? null;
}

/**
 * Deletes the product's Zoho restock list (and clears cache).
 * Called at the start of each restock cycle so old subscribers aren't
 * re-emailed on the next send — only the current pending batch is added.
 */
export async function deleteProductRestockList(
  productSlug: string,
  productName: string
): Promise<void> {
  listKeyCache.delete(productSlug);
  const token    = await getAccessToken();
  const listName = buildListName(productName);
  const listKey  = await findListKeyByName(token, listName);
  if (!listKey) {
    console.log(`[zoho] No existing list found for "${productSlug}", nothing to delete.`);
    return;
  }
  const res = await zohoGet("/deletemailinglist", token, { listkey: listKey });
  if (isZohoError(res)) {
    console.warn(`[zoho] deletemailinglist warning for "${productSlug}":`, JSON.stringify(res).slice(0, 200));
  } else {
    console.log(`[zoho] Deleted list "${listName}" (${listKey})`);
  }
}

function buildListName(productName: string): string {
  return `Restock: ${productName}`.slice(0, 100);
}

// ---------------------------------------------------------------------------
// Contact upload
// ---------------------------------------------------------------------------

/**
 * Adds a batch of emails to the product's Zoho restock list.
 * If the list doesn't exist yet, creates it using addlistandcontacts.
 * Returns the listKey (needed to trigger a campaign send if desired).
 *
 * NOTE on re-email prevention:
 *   This function only receives emails that are currently "pending" in Neon
 *   (i.e., not yet notified). The Zoho list may contain historical contacts
 *   from previous restocks, but the caller (deleteProductRestockList) deletes
 *   the list first so only the current pending batch ends up in Zoho. This
 *   ensures only fresh sign-ups receive the campaign email.
 */
export async function addContactsToList(
  productSlug: string,
  productName: string,
  emails: string[]
): Promise<string> {
  if (emails.length === 0) throw new Error("[zoho] addContactsToList called with empty emails");

  const token    = await getAccessToken();
  const listName = buildListName(productName);

  // Check cache first
  let listKey = listKeyCache.get(productSlug) ?? null;

  // Verify the cached key still refers to a real list
  if (listKey) {
    const existing = await findListKeyByName(token, listName);
    if (!existing) listKey = null; // list was deleted externally
  }

  const [firstBatch, ...remainingBatches] = chunkEmails(emails, BATCH_SIZE);

  if (!listKey) {
    // Create new list + seed with first batch
    const createRes = await zohoPost("/addlistandcontacts", token, {
      listname:  listName,
      listdesc:  `Auto-managed restock waitlist. slug:${productSlug}`,
      emailids:  firstBatch.join(","),
    });
    if (isZohoError(createRes)) {
      throw new Error(`[zoho] addlistandcontacts failed: ${JSON.stringify(createRes)}`);
    }
    console.log(`[zoho] Created list "${listName}" and added ${firstBatch.length} email(s)`);

    // Retrieve the new list key (addlistandcontacts doesn't return it)
    const newKey = await findListKeyByName(token, listName);
    if (!newKey) {
      throw new Error(`[zoho] Created list "${listName}" but could not find its key via getmailinglists`);
    }
    listKey = newKey;
    listKeyCache.set(productSlug, listKey);
  } else {
    // List exists — add first batch directly
    await bulkAddEmails(token, listKey, firstBatch);
  }

  // Add any remaining batches
  for (const batch of remainingBatches) {
    await bulkAddEmails(token, listKey, batch);
  }

  console.log(`[zoho] Added ${emails.length} contact(s) to list "${listName}" (${listKey})`);
  return listKey;
}

async function bulkAddEmails(token: string, listKey: string, emails: string[]): Promise<void> {
  const res = await zohoPost("/addlistsubscribersinbulk", token, {
    listkey:  listKey,
    emailids: emails.join(","),
  });
  if (isZohoError(res)) {
    throw new Error(`[zoho] addlistsubscribersinbulk failed: ${JSON.stringify(res)}`);
  }
  const ignored  = (res.ignored_contacts  ?? []).length;
  const existing = (res.existing_contacts ?? []).length;
  const added    = emails.length - ignored - existing;
  console.log(`[zoho] Bulk add: ${added} new, ${existing} existing, ${ignored} ignored`);
}

function chunkEmails(emails: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < emails.length; i += size) {
    chunks.push(emails.slice(i, i + size));
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Campaign trigger
// ---------------------------------------------------------------------------

/**
 * Triggers an immediate send for the given Zoho campaign key.
 *
 * Setup in Zoho UI:
 *   1. Create an email campaign template for each product
 *   2. Set the campaign's "To" list to "Restock: {Product Name}"
 *   3. Copy the campaign key from the campaign settings
 *   4. Store it as ZOHO_RESTOCK_CAMPAIGN_KEY (or per-product in a future config)
 *
 * If no key is set, logs a warning — contacts have been added to their list
 * and a Zoho autoresponder (if configured) may still send automatically.
 */
export async function triggerCampaignSend(campaignKey: string | undefined): Promise<void> {
  if (!campaignKey) {
    console.warn(
      "[zoho] ZOHO_RESTOCK_CAMPAIGN_KEY is not set — contacts were added to the list " +
      "but no campaign was triggered. Set ZOHO_RESTOCK_CAMPAIGN_KEY to enable auto-sends."
    );
    return;
  }

  const token  = await getAccessToken();
  const result = await zohoPost("/sendcampaign", token, {
    campaignkey: campaignKey,
  });

  console.log("[zoho] sendcampaign result:", JSON.stringify(result).slice(0, 300));

  if (isZohoError(result)) {
    throw new Error(`[zoho] Campaign send failed for key "${campaignKey}": ${JSON.stringify(result)}`);
  }
}
