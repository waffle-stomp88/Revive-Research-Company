---
name: Zoho Campaigns integration
description: Key quirks and lessons for the Zoho Campaigns REST API client in server/zoho-campaigns.ts
---

## findListKeyByName must be fuzzy, not strict

The `getmailinglists` API can return list names with trailing whitespace or unexpected casing. The original `===` match silently returned null for a valid list, causing all contacts to be dropped without any error. The fix: always `trim().toLowerCase()` both sides before comparing.

**Why:** Zoho UI allows names with trailing spaces; the API echoes them back verbatim. Strict equality will silently fail.

**How to apply:** Any place that matches a Zoho list name by string must use case-insensitive trimmed comparison.

## ignored_contacts is Zoho deliverability filtering, not a bug

When `addlistsubscribersinbulk` returns an email in `ignored_contacts` with `status: "success"` and `code: "0"`, it means Zoho's deliverability system rejected the address — not that our code failed. Common triggers: addresses with "debug", "probe", "test", "seed" in the local part, or fake domains like @test.com.

Real user email addresses (normal Gmail, real domains) pass through cleanly with empty `ignored_contacts`.

**Why:** Zoho protects sender reputation by pre-screening addresses before adding them to lists.

**How to apply:** Do not treat ignored_contacts as a code error. Log it as a warning. It is expected for test addresses used during development.

## sendcampaign only works for Autoresponder/Automated campaign types

Regular draft email campaigns have `campaign_key: "null"` and CANNOT be triggered via the `sendcampaign` REST API endpoint. Confirmed by calling `getcampaigndetails` with `campaignid=<numeric_id>` — full campaign object returned with `campaign_key: "null"`.

The Zoho campaign listing endpoints (`getallcampaigns`, `getcampaigns`, `getemailcampaigns`, etc.) all return 1004 in REST v1.1 — there is no working programmatic campaign listing endpoint.

**Why:** Zoho Campaigns REST API v1.1 `sendcampaign` is designed for automation/autoresponder campaigns, not one-off drafts.

**How to apply:** For restock notifications, use a Zoho **Autoresponder** configured to trigger on "Contact Added to Mailing List" targeting "Restock:" lists. When our code adds contacts via `addContactsToList`, Zoho fires the autoresponder automatically. No campaign key or trigger API call needed.

## getcampaigndetails works with campaignid (numeric), not campaignkey param

`POST /getcampaigndetails` with `campaignkey=<numeric_id>` returns "Invalid Campaignkey".
`POST /getcampaigndetails` with `campaignid=<numeric_id>` returns the full campaign object with code 0.

**How to apply:** Use `campaignid` (not `campaignkey`) as the parameter name for campaign detail lookups.

## Custom contact fields use contactinfo JSON, not emailids

`addlistsubscribersinbulk` and `addlistandcontacts` support a `contactinfo` JSON array parameter as an alternative to `emailids`. Use this to pass custom field values per contact.

Format: `[{"Contact Email": "...", "PRODUCT_NAME": "...", "PRODUCT_URL": "..."}]`

Column names `PRODUCT_NAME` and `PRODUCT_URL` were created as custom Zoho contact fields. The merge tags in templates are `$[UD:PRODUCT_NAME||]$` and `$[UD:PRODUCT_URL||]$` (two pipes required — `$[UD:FIELD|default|]$` format).

**Why:** The `emailids` approach only carries email addresses; `contactinfo` carries full contact data including custom fields needed for per-product merge tags.

## Debug endpoint for diagnosing silent failures

`POST /api/admin/debug/zoho-newsletter` (admin-only) runs the full subscribe flow synchronously and returns:
- `tokenOk` — OAuth refresh success/failure
- `listCount` / `listNames` — every list Zoho returned (exact strings for diagnosing name mismatches)
- `researchListFound` / `researchListKey` — whether the lookup succeeded
- `subscribeRaw` — raw Zoho API response including ignored_contacts

Use this whenever newsletter signups appear to succeed in Neon but contacts are missing from Zoho.

## Fire-and-forget hides all errors

`addContactToResearchList` is called non-blocking from the newsletter route. All errors are caught internally and only logged to console. If the server log buffer isn't captured (common in dev after restarts), failures are completely invisible. Always use the debug endpoint for diagnosis rather than relying on server logs.
