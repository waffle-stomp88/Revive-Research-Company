/**
 * Zoho Campaigns REST API v1.1 client
 *
 * Confirmed working endpoints (all probed against live account):
 *   POST getmailinglists           — list all mailing lists
 *   POST addlistandcontacts        — create new list + seed contacts (contactinfo param)
 *   POST addlistsubscribersinbulk  — bulk-add contacts to existing list (contactinfo param)
 *   GET  getlistsubscribers        — read contacts in a list
 *
 * Restock notification architecture:
 *   All restock waitlist contacts are added to a single shared "Restock Queue"
 *   Zoho list (created once in the Zoho UI). A Zoho Autoresponder bound to that
 *   list fires immediately for each new contact, using $[UD:PRODUCT_NAME||]$ and
 *   $[UD:PRODUCT_URL||]$ merge tags that are populated per-contact by this code.
 *   No campaign key or sendcampaign API call is needed.
 *
 * Environment variables required:
 *   ZOHO_CLIENT_ID       — from Zoho API Console
 *   ZOHO_CLIENT_SECRET   — from Zoho API Console
 *   ZOHO_REFRESH_TOKEN   — obtained via OAuth code exchange
 */

const BASE_URL   = "https://campaigns.zoho.com/api/v1.1";
const TOKEN_URL  = "https://accounts.zoho.com/oauth/v2/token";
const TIMEOUT_MS = 20_000;
const BATCH_SIZE = 250;

const RESTOCK_QUEUE_LIST_NAME = "Restock Queue";

// ---------------------------------------------------------------------------
// Shared list key cache — resolved once, reused for the process lifetime
// ---------------------------------------------------------------------------
let restockQueueListKey: string | null = null;

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
// List lookup
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Restock Queue — shared list management
// ---------------------------------------------------------------------------

/**
 * Returns the Zoho list key for the shared "Restock Queue" list.
 * Resolves once via getmailinglists and caches for the process lifetime.
 * Throws clearly if the list doesn't exist — it must be created in the Zoho UI.
 */
export async function getRestockQueueListKey(): Promise<string> {
  if (restockQueueListKey) return restockQueueListKey;

  const token = await getAccessToken();
  const key   = await findListKeyByName(token, RESTOCK_QUEUE_LIST_NAME);
  if (!key) {
    throw new Error(
      `[zoho] "${RESTOCK_QUEUE_LIST_NAME}" list not found in Zoho Campaigns. ` +
      `Create it in the Zoho UI (Mailing Lists → New List → name it exactly "${RESTOCK_QUEUE_LIST_NAME}") ` +
      `then configure an Autoresponder to fire on "Contact Added to Mailing List" targeting that list.`
    );
  }
  restockQueueListKey = key;
  return key;
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
 * `contactinfo` parameter of addlistsubscribersinbulk.
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
 * Adds a batch of restock contacts to the shared "Restock Queue" Zoho list.
 * Each contact carries PRODUCT_NAME and PRODUCT_URL custom field values so
 * the autoresponder template can personalise per-product. Adding contacts
 * here automatically triggers the bound Zoho Autoresponder.
 */
export async function addContactsToRestockQueue(contacts: RestockContact[]): Promise<void> {
  if (contacts.length === 0) throw new Error("[zoho] addContactsToRestockQueue called with empty contacts");

  const listKey = await getRestockQueueListKey();

  for (const batch of chunkContacts(contacts, BATCH_SIZE)) {
    await bulkAddContacts(listKey, batch);
  }

  console.log(`[zoho] Added ${contacts.length} contact(s) to "${RESTOCK_QUEUE_LIST_NAME}" (${listKey})`);
}

async function bulkAddContacts(listKey: string, contacts: RestockContact[]): Promise<void> {
  const token = await getAccessToken();
  const res   = await zohoPost("/addlistsubscribersinbulk", token, {
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
