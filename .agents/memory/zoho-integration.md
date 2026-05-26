---
name: Zoho Campaigns integration
description: Key quirks and lessons for the Zoho Campaigns REST API client in server/zoho-campaigns.ts
---

## findListKeyByName must be fuzzy, not strict

The `getmailinglists` API can return list names with trailing whitespace or unexpected casing. The original `===` match silently returned null for a valid list, causing all contacts to be dropped without any error. The fix: always `trim().toLowerCase()` both sides before comparing.

**Why:** Zoho UI allows names with trailing spaces; the API echoes them back verbatim. Strict equality will silently fail.

**How to apply:** Any place that matches a Zoho list name by string must use case-insensitive trimmed comparison.

## ignored_contacts is Zoho deliverability filtering, not a bug

When `addlistsubscribersinbulk` returns an email in `ignored_contacts` with `status: "success"` and `code: "0"`, it means Zoho's deliverability system rejected the address — not that our code failed. Common triggers: addresses with "debug", "probe", "test", "seed" in the local part, disposable domains (yopmail, mailinator, etc.), and Gmail `+` alias addresses. Real user email addresses (normal Gmail, real domains) pass through cleanly with empty `ignored_contacts`.

**Why:** Zoho protects sender reputation by pre-screening addresses before adding them to lists.

**How to apply:** Do not treat ignored_contacts as a code error. Log it as a warning. It is expected for test addresses used during development.

## addlistsubscribersinbulk requires emailids even when contactinfo is present

`addlistsubscribersinbulk` with only `contactinfo` (no `emailids`) returns code 903 "No mandatory fields in this URL" — even when the JSON is correctly formatted. The fix is to pass BOTH:
- `emailids`: comma-separated email list (mandatory)
- `contactinfo`: JSON array with `"Contact Email"`, `PRODUCT_NAME`, `PRODUCT_URL` (for custom fields)

Confirmed working for the API call itself, but see the next entry for a major limitation.

## contactinfo custom fields are NOT applied to existing Zoho contacts

When a contact already exists anywhere in Zoho (i.e. they're in any other list), `addlistsubscribersinbulk` adds them to the target list but silently ignores the `contactinfo` field values — the contact shows up in `existing_contacts` in the response, and their custom fields remain empty in the Zoho UI. There is no Zoho REST API v1.1 endpoint to update contact custom fields after the fact (all such endpoints return 1004).

**Why:** Zoho's `addlistsubscribersinbulk` only sets custom field values when creating brand-new contacts. For contacts already in their database, it treats the add as a list-membership update only.

**How to apply:** Do NOT rely on Zoho custom fields (e.g. `PRODUCT_NAME`, `PRODUCT_URL`) for per-contact personalization in autoresponder emails. Any user who ever signed up for the newsletter will hit this path. Use SES directly for transactional emails that need per-contact data.

## Restock emails migrated to SES — Zoho autoresponder approach abandoned

The "Restock Signups" autoresponder and "Restock Queue" autoresponder approaches were abandoned because Zoho's merge tags (`$[UD:PRODUCT_NAME||]$`, `$[UD:PRODUCT_URL||]$`) render empty for all existing Zoho contacts.

Replacement architecture (implemented):
- **OOS signup confirmation**: `sendRestockSignupConfirmationEmail` in `server/email.ts` — called fire-and-forget from `POST /api/stock-notifications` in `routes.ts`
- **Restock notification**: `sendRestockNotificationEmail` in `server/email.ts` — called per-subscriber in `triggerRestockNotifications` in `server/restock-notifications.ts`

Both use Amazon SES (nodemailer) with full branded dark HTML templates. Product name and URL are injected server-side — no merge tags, no Zoho contact field dependency.

**Why:** SES is already the infrastructure for order confirmations and shipping emails. Moving restock emails there gives 100% reliability for all users regardless of Zoho contact history.

## sendcampaign only works for Autoresponder/Automated campaign types

Regular draft email campaigns have `campaign_key: "null"` and CANNOT be triggered via the `sendcampaign` REST API endpoint. The Zoho campaign listing endpoints (`getallcampaigns`, `getcampaigns`, `getemailcampaigns`, etc.) all return 1004 in REST v1.1.

**How to apply:** For any Zoho-triggered email, use Autoresponders on list-add events. For transactional emails with per-user data, use SES directly.

## getcampaigndetails works with campaignid (numeric), not campaignkey param

`POST /getcampaigndetails` with `campaignkey=<numeric_id>` returns "Invalid Campaignkey".
`POST /getcampaigndetails` with `campaignid=<numeric_id>` returns the full campaign object with code 0.

## Zoho still used for newsletter (Research List) — not for restock

`addContactToResearchList` in `server/zoho-campaigns.ts` is still called for newsletter signups and is working. The only functions removed from active use are `addContactToRestockSignups` and `addContactsToRestockQueue` — both replaced by SES. Those functions remain in the file in case they're needed for CRM list-building in the future, but are not called from any route.

## Disposable domains and + aliases are filtered by Zoho

Both `yopmail.com` (disposable domain) and `name+alias@gmail.com` (Gmail subaddress) end up in `ignored_contacts` and are never added to any Zoho list. Use real email accounts for any Zoho integration testing.

## Fire-and-forget hides all errors

`addContactToResearchList` is called non-blocking. All errors are caught internally and only logged to console. Use the debug endpoint `POST /api/admin/debug/zoho-newsletter` (admin-only) for diagnosis rather than relying on server logs.
