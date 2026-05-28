# REPLIT TECHNICAL BRIEF: Server-Side Rendering / Prerender Fix
**Priority: CRITICAL — This is blocking all SEO growth and external tool access**
**Date: May 27, 2026**
**From: Grayson (Revive Research founder)**

---

## THE PROBLEM IN ONE SENTENCE

When any bot, crawler, or external tool requests any page on reviveresearch.co, they receive an empty `<div id="root"></div>` with no body content. Google, Bing, AI assistants, link preview generators, and social media embeds all see a blank page. Only the `<head>` meta tags are visible.

---

## WHY THIS MATTERS RIGHT NOW

1. **Google can't index our pages properly.** We have 62 compound profiles, 40+ Education Center articles, a Synergy Engine, a reconstitution wizard, product pages, and body system pages. Google sees none of this content. Rankings are unstable because Google's JavaScript renderer sometimes executes our React bundle and sometimes doesn't.

2. **No external tool can read our site.** When I paste reviveresearch.co into ChatGPT, Claude, or any AI assistant, they get an empty page. When someone shares our link on Discord, Slack, or iMessage, the preview shows nothing useful. When a potential partner or journalist visits via a link aggregator, they may see a blank screen.

3. **Our competitors on Shopify don't have this problem.** Shopify serves fully rendered HTML to every request. A competitor site (sanctumvials.com, launched 2024, 14 SKUs) is fully crawlable and indexable because Shopify handles server-side rendering automatically. We have 62 compounds, 40+ articles, and a Synergy Engine, but Google can see their 14 products and can't see our 62.

4. **We've tried to fix this three times.** Meta tag injection into server/seo.ts, server/write.ts, and server/static.ts was implemented in February 2026. The age gate blocking Googlebot was flagged in March 2026. A prerender recommendation was made in May 2026. The meta tags ARE being served correctly now (title, description, OG tags all work). But the page body content is still not being rendered server-side. The `<head>` is fixed. The `<body>` is still empty to crawlers.

---

## WHAT NEEDS TO HAPPEN

### The Core Fix: Pre-render page body content for all routes

Every route on the site needs to serve actual HTML content in the initial server response, not just meta tags. When a request hits the server, the response HTML should contain the actual text, headings, product descriptions, article content, and navigation that a user would see after React hydrates.

### Two Implementation Paths (pick one)

**PATH A: react-snap (Recommended — fastest to implement)**

react-snap is a zero-config pre-renderer that runs your React app at build time, visits every route with a headless browser, captures the rendered HTML, and saves it as static files. On subsequent requests, the server serves the pre-rendered HTML, then React hydrates on top of it client-side.

```bash
npm install react-snap
```

Add to package.json:
```json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "source": "build",
    "inlineCss": true
  }
}
```

This generates a static HTML file for every route at build time. The server serves that HTML immediately. React hydrates on top of it. Google sees the full content. Users see no difference.

**Pros:** No architecture change. Works with existing Vite + React + Express setup. Can be implemented in hours.

**Cons:** Build time increases. Any new page requires a rebuild. Dynamic content (like user-specific cart or account state) still hydrates client-side, which is fine.

**PATH B: Prerender.io middleware (Alternative — zero build change)**

Prerender.io is a service that intercepts requests from known bots (Googlebot, Bingbot, social media crawlers, AI assistants), renders your page in a headless browser, caches the result, and serves the cached HTML. Non-bot requests get the normal SPA.

```javascript
// In your Express server
const prerender = require('prerender-node');
app.use(prerender.set('prerenderToken', 'YOUR_TOKEN'));
```

**Pros:** Zero build process change. Works immediately. Handles bot detection automatically.

**Cons:** External dependency. Monthly cost (~$9-99/mo depending on volume). Adds ~200ms latency for first bot request per page (subsequent requests cached).

### What About Next.js Migration?

A full Next.js migration is the long-term best solution (native SSR, automatic image optimization, `generateMetadata` API, better performance). But it's a significant architecture change that could take weeks. The pre-render fix above can be done in hours and solves the immediate problem. We can plan the Next.js migration separately.

---

## SPECIFIC PAGES THAT MUST BE PRE-RENDERED

At minimum, these route patterns need server-rendered HTML:

| Route Pattern | Example | Content That Must Be in HTML |
|---|---|---|
| `/` | Homepage | Hero text, featured compounds, trust signals, value proposition |
| `/shop` | Shop/catalog | Product grid with names, prices, purity badges |
| `/peptides/:slug` | `/peptides/bpc-157` | Product name, description, price, purity, COA link, "Works Well With" section |
| `/guides/:slug` | `/guides/how-to-verify-peptide-quality` | Full article text, headings, citations |
| `/systems/:slug` | `/systems/musculoskeletal` | Body system overview, linked compounds |
| `/education` | Education Center landing | Article list with titles and summaries |
| `/tools/reconstitution` | Reconstitution wizard | Wizard intro text and RUO disclaimer |
| `/tools/synergy` | Synergy Engine | Engine intro text and description |
| `/about` | About page | Founder info, mission, trust signals |
| `/pricing` | Pricing transparency | Pricing philosophy content |

---

## THE AGE GATE PROBLEM (SEPARATE BUT RELATED)

Our age verification modal currently mounts into `#root` and replaces all page content before React renders the actual page. This means even if we pre-render the HTML, the age gate JavaScript overwrites it on mount.

**The fix:** The age gate must be a CSS overlay on top of pre-rendered content, not a replacement of it. The HTML body content should exist in the DOM regardless of whether the user has passed the age gate. The age gate modal sits on top visually for human visitors. Bots read the HTML underneath.

Implementation:
- Pre-rendered HTML lives in `#root` as normal page content
- Age gate modal renders as a fixed-position overlay with `z-index` above all content
- When user clicks "Enter Site" or passes verification, the overlay is removed via CSS/state
- The underlying page content is always in the DOM, always readable by crawlers

**Do NOT gate content behind JavaScript state checks for bot access.** The content should be structurally present in HTML. The age gate is a visual layer only.

---

## HOW TO VERIFY THE FIX IS WORKING

After implementation, run these tests:

### Test 1: curl the homepage
```bash
curl -s https://reviveresearch.co/ | head -100
```
You should see actual HTML content (headings, text, product names) in the response, not just `<div id="root"></div>`.

### Test 2: curl a product page
```bash
curl -s https://reviveresearch.co/peptides/bpc-157 | head -100
```
You should see the product name, description, price, and purity in the HTML.

### Test 3: curl a guide page
```bash
curl -s https://reviveresearch.co/guides/how-to-verify-peptide-quality | head -100
```
You should see the article title, headings, and body text in the HTML.

### Test 4: Google Search Console URL Inspection
After deploying, use Google Search Console's URL Inspection tool on 5-10 key pages. Click "Test Live URL." The rendered HTML should show full page content, not the age gate modal.

### Test 5: Social media link preview
Paste a product page URL into a Discord chat, Slack message, or iMessage. The preview should show the product name, description, and image, not a blank card.

### Test 6: View Source
Right-click any page in Chrome, click "View Page Source." The raw HTML should contain actual text content, not just JavaScript bundle references and an empty div.

---

## WHAT'S ALREADY WORKING (DON'T BREAK THESE)

- Meta tag injection via server/seo.ts is working correctly. `<title>`, `<meta description>`, OG tags, and Twitter cards are all being served server-side. This is good. Don't change this.
- robots.txt has been cleaned up. `/api/education` and `/api/products` are no longer blocked. Don't re-block them.
- The age gate RUO attestation with timestamp is working correctly for users. Don't remove it — just make it a visual overlay instead of a content gate.
- URL structure is clean (`/peptides/bpc-157`, `/guides/how-to-verify-peptide-quality`). No hash routing. Don't change this.

---

## TIMELINE

This is blocking SEO growth, external tool access, and social sharing for the entire site. Every day this isn't fixed, Google is either failing to render our pages or rendering them inconsistently, which causes ranking instability.

**Requested timeline: implement within 1 week.**

After deployment:
1. I'll request re-indexing in Google Search Console for top 20 pages
2. I'll verify with the curl tests above
3. I'll monitor Search Console for 2 weeks to confirm stable indexing
4. We can then plan the Next.js migration as a separate project

---

## QUESTIONS? 

If anything in this brief is unclear, message me before implementing. Don't guess on the age gate behavior — that's the piece that's been partially fixed and partially broken across three attempts. The body content pre-rendering is the new piece that hasn't been attempted yet.
