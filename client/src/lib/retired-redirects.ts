import { trackEvent } from "./analytics";

const STORAGE_KEY_PREFIX = "retired-redirect";
const VISITOR_ID_KEY = "rr-visitor-id";

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export type RetiredContentType = "product" | "guide" | "bundle";

export function flagRetiredContent(type: RetiredContentType, slug?: string): void {
  sessionStorage.setItem(`${STORAGE_KEY_PREFIX}-${type}`, "1");
  if (slug) {
    trackEvent("dead_link_visit", "retirement", `${type}:${slug}`);
    fetch("/api/dead-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Visitor-ID": getOrCreateVisitorId(),
      },
      body: JSON.stringify({ type, slug }),
    }).catch(() => {});
  }
}

export function consumeRetiredFlag(type: RetiredContentType): boolean {
  const key = `${STORAGE_KEY_PREFIX}-${type}`;
  const wasSet = sessionStorage.getItem(key) === "1";
  if (wasSet) {
    sessionStorage.removeItem(key);
  }
  return wasSet;
}

export const RETIRED_PRODUCT_SLUGS: string[] = [];

export const RETIRED_GUIDE_SLUGS: string[] = [];

export const RETIRED_BUNDLE_SLUGS: string[] = [];
