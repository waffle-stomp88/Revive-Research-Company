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
  const needle = listName.trim().toLowerCase();
  console.log(
    `[zoho] getmailinglists returned ${items.length} list(s):`,
    items.map((l) => JSON.stringify(l.listname))
  );
  const match = items.find(
    (l) => typeof l.listname === "string" && l.listname.trim().toLowerCase() === needle
  );
  if (!match) {
    console.warn(`[zoho] findListKeyByName: no match for "${listName}" among returned list names`);
  }
  return match?.listkey ?? null;
}

/**
 * Deletes the product's Zoho restock list (and clears cache).
 * Called at the start of each restock cycle so old subscribers aren't
 * re-emailed on the next send — only the current pending batch is added.
 */
/**
 * SAFETY GUARD — enforced in code, not just by convention.
 *
 * deletemailinglist may ONLY be called when the resolved list name starts with
 * "Restock:". Any attempt to delete a list whose name does NOT match this prefix
 * throws immediately — no soft warning, no fallback. This prevents accidentally
 * deleting production marketing lists (e.g. "Research List") during testing or
 * an unexpected API response.
 */
function assertRestockListName(listName: string): void {
  if (!listName.startsWith("Restock:")) {
    throw new Error(
      `[zoho] SAFETY ABORT: deletemailinglist was about to target "${listName}", ` +
      `which does not start with "Restock:". Only restock lists may be deleted programmatically.`
    );
  }
}

export async function deleteProductRestockList(
  productSlug: string,
  productName: string
): Promise<void> {
  listKeyCache.delete(productSlug);
  const token    = await getAccessToken();
  const listName = buildListName(productName);

  // Hard guard — throws if listName doesn't start with "Restock:"
  // buildListName always produces "Restock: {name}", but this is a second line
  // of defence against future refactors or bad arguments.
  assertRestockListName(listName);

  const listKey = await findListKeyByName(token, listName);
  if (!listKey) {
    console.log(`[zoho] No existing list found for "${productSlug}", nothing to delete.`);
    return;
  }
  const res = await zohoGet("/deletemailinglist", token, { listkey: listKey });
  if (isZohoError(res)) {
    console.warn(`[zoho] deletemailinglist warning for "${productSlug}":`, JSON.stringify(res).slice(0, 200));
  } else {
    console.log(`[zoho] Deleted restock list "${listName}" (${listKey})`);
  }
}

function buildListName(productName: string): string {
  return `Restock: ${productName}`.slice(0, 100);
}

// ---------------------------------------------------------------------------
// Contact upload
// ---------------------------------------------------------------------------

export interface RestockContact {
  email: string;
  productName: string;
  productUrl: string;
}

/**
 * Serialises a contact array into the JSON string Zoho expects for the
 * `contactinfo` parameter of addlistandcontacts / addlistsubscribersinbulk.
 *
 * Column names (PRODUCT_NAME, PRODUCT_URL) match the custom contact fields
 * created in Zoho Campaigns. In email templates the merge tags are:
 *   $[UD:PRODUCT_NAME||]$  and  $[UD:PRODUCT_URL||]$
 */
function buildContactInfo(contacts: RestockContact[]): string {
  return JSON.stringify(
    contacts.map(c => ({
      "Contact Email": c.email.toLowerCase().trim(),
      "PRODUCT_NAME":  c.productName,
      "PRODUCT_URL":   c.productUrl,
    }))
  );
}

/**
 * Adds a batch of contacts (with product merge-field data) to the product's
 * Zoho restock list. If the list doesn't exist yet, creates it using
 * addlistandcontacts. Returns the listKey.
 *
 * NOTE on re-email prevention:
 *   This function only receives contacts that are currently "pending" in Neon
 *   (i.e., not yet notified). The caller (deleteProductRestockList) deletes
 *   the old list first so only the current pending batch ends up in Zoho.
 *   This ensures only fresh sign-ups receive the campaign email.
 */
export async function addContactsToList(
  productSlug: string,
  productName: string,
  contacts: RestockContact[]
): Promise<string> {
  if (contacts.length === 0) throw new Error("[zoho] addContactsToList called with empty contacts");

  const token    = await getAccessToken();
  const listName = buildListName(productName);

  // Check cache first
  let listKey = listKeyCache.get(productSlug) ?? null;

  // Verify the cached key still refers to a real list
  if (listKey) {
    const existing = await findListKeyByName(token, listName);
    if (!existing) listKey = null; // list was deleted externally
  }

  const [firstBatch, ...remainingBatches] = chunkContacts(contacts, BATCH_SIZE);

  if (!listKey) {
    // Create new list + seed with first batch (contactinfo carries product fields)
    const createRes = await zohoPost("/addlistandcontacts", token, {
      listname:    listName,
      listdesc:    `Auto-managed restock waitlist. slug:${productSlug}`,
      contactinfo: buildContactInfo(firstBatch),
    });
    if (isZohoError(createRes)) {
      throw new Error(`[zoho] addlistandcontacts failed: ${JSON.stringify(createRes)}`);
    }
    console.log(`[zoho] Created list "${listName}" and added ${firstBatch.length} contact(s)`);

    // Retrieve the new list key (addlistandcontacts doesn't return it)
    const newKey = await findListKeyByName(token, listName);
    if (!newKey) {
      throw new Error(`[zoho] Created list "${listName}" but could not find its key via getmailinglists`);
    }
    listKey = newKey;
    listKeyCache.set(productSlug, listKey);
  } else {
    // List exists — add first batch directly
    await bulkAddContacts(token, listKey, firstBatch);
  }

  // Add any remaining batches
  for (const batch of remainingBatches) {
    await bulkAddContacts(token, listKey, batch);
  }

  console.log(`[zoho] Added ${contacts.length} contact(s) to list "${listName}" (${listKey})`);
  return listKey;
}

async function bulkAddContacts(token: string, listKey: string, contacts: RestockContact[]): Promise<void> {
  const res = await zohoPost("/addlistsubscribersinbulk", token, {
    listkey:     listKey,
    contactinfo: buildContactInfo(contacts),
  });
  if (isZohoError(res)) {
    throw new Error(`[zoho] addlistsubscribersinbulk failed: ${JSON.stringify(res)}`);
  }
  const ignored  = (res.ignored_contacts  ?? []).length;
  const existing = (res.existing_contacts ?? []).length;
  const added    = contacts.length - ignored - existing;
  console.log(`[zoho] Bulk add: ${added} new, ${existing} existing, ${ignored} ignored`);
}

function chunkContacts(contacts: RestockContact[], size: number): RestockContact[][] {
  const chunks: RestockContact[][] = [];
  for (let i = 0; i < contacts.length; i += size) {
    chunks.push(contacts.slice(i, i + size));
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Newsletter list helper
// ---------------------------------------------------------------------------

/**
 * Adds a single email address to the "Research List" mailing list in Zoho
 * Campaigns via the authenticated REST API.
 *
 * This is the server-side replacement for the old client-side weboptin.zc
 * hidden-form hack (zoho-form-submit.ts / zoho-optin.ts). Those approaches
 * depended on hardcoded form tokens that are tied to a specific Zoho signup
 * form — when that form is recreated the tokens change and signups stop
 * landing. This path uses our long-lived OAuth credentials instead.
 *
 * Non-throwing: logs on failure and resolves cleanly so a Zoho hiccup
 * never breaks the user-facing newsletter subscribe response.
 */
export async function addContactToResearchList(email: string): Promise<void> {
  const RESEARCH_LIST_NAME = "Research List";
  try {
    const token   = await getAccessToken();
    const listKey = await findListKeyByName(token, RESEARCH_LIST_NAME);
    if (!listKey) {
      console.warn(`[zoho] addContactToResearchList: "${RESEARCH_LIST_NAME}" not found in Zoho — contact not added. Check that the list exists.`);
      return;
    }
    const res = await zohoPost("/addlistsubscribersinbulk", token, {
      listkey:  listKey,
      emailids: email.toLowerCase().trim(),
    });
    if (isZohoError(res)) {
      console.error(`[zoho] addContactToResearchList failed for ${email}:`, JSON.stringify(res).slice(0, 200));
    } else {
      const ignored  = (res.ignored_contacts  ?? []).length;
      const existing = (res.existing_contacts ?? []).length;
      if (ignored > 0) {
        console.warn(`[zoho] Research List: ${email} was ignored (invalid/suppressed address)`);
      } else if (existing > 0) {
        console.log(`[zoho] Research List: ${email} already subscribed`);
      } else {
        console.log(`[zoho] Research List: ${email} added successfully`);
      }
    }
  } catch (err: any) {
    console.error(`[zoho] addContactToResearchList error for ${email}:`, err?.message ?? String(err));
  }
}

// ---------------------------------------------------------------------------
// Debug helper (admin-only, synchronous — for diagnosing Zoho integration)
// ---------------------------------------------------------------------------

/**
 * Runs the full newsletter-subscribe Zoho flow synchronously and returns a
 * structured diagnostic object instead of logging to console.
 * Used by POST /api/admin/debug/zoho-newsletter to diagnose silent failures.
 */
export async function debugZohoNewsletter(email: string): Promise<{
  tokenOk: boolean;
  tokenError?: string;
  listCount: number;
  listNames: string[];
  researchListFound: boolean;
  researchListKey?: string;
  subscribeRaw?: unknown;
  subscribeError?: string;
}> {
  const result = {
    tokenOk: false as boolean,
    tokenError: undefined as string | undefined,
    listCount: 0,
    listNames: [] as string[],
    researchListFound: false as boolean,
    researchListKey: undefined as string | undefined,
    subscribeRaw: undefined as unknown,
    subscribeError: undefined as string | undefined,
  };

  let token: string;
  try {
    token = await getAccessToken();
    result.tokenOk = true;
  } catch (err: any) {
    result.tokenError = err?.message ?? String(err);
    return result;
  }

  const listsRes = await zohoPost("/getmailinglists", token, { range: "100" });
  const items: any[] = listsRes?.list_of_details ?? [];
  result.listCount = items.length;
  result.listNames = items.map((l) => l.listname ?? "(no listname field)");

  const needle = "research list";
  const match = items.find(
    (l) => typeof l.listname === "string" && l.listname.trim().toLowerCase() === needle
  );

  if (!match) {
    return result;
  }

  result.researchListFound = true;
  result.researchListKey = match.listkey;

  try {
    const addRes = await zohoPost("/addlistsubscribersinbulk", token, {
      listkey: match.listkey,
      emailids: email.toLowerCase().trim(),
    });
    result.subscribeRaw = addRes;
  } catch (err: any) {
    result.subscribeError = err?.message ?? String(err);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Campaign trigger
// ---------------------------------------------------------------------------

/**
 * Triggers an immediate send for the given Zoho campaign key.
 *
 * Setup in Zoho UI:
 *   1. Create an email campaign template for each product.
 *   2. Set the campaign's "To" list to "Restock: {Product Name}".
 *   3. Copy the campaign key from the campaign settings.
 *   4. Store it as ZOHO_RESTOCK_CAMPAIGN_KEY.
 *
 * Requires a non-empty key — callers must check for ZOHO_RESTOCK_CAMPAIGN_KEY
 * and abort early if it is unset (see restock-notifications.ts).
 * Throws on API error so the caller can distinguish "sent" from "failed".
 */
export async function triggerCampaignSend(campaignKey: string): Promise<void> {
  const token  = await getAccessToken();
  const result = await zohoPost("/sendcampaign", token, {
    campaignkey: campaignKey,
  });

  console.log("[zoho] sendcampaign result:", JSON.stringify(result).slice(0, 300));

  if (isZohoError(result)) {
    throw new Error(`[zoho] Campaign send failed for key "${campaignKey}": ${JSON.stringify(result)}`);
  }
}
