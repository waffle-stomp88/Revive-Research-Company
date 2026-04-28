const STORAGE_KEY_PREFIX = "retired-redirect";

export type RetiredContentType = "product" | "guide";

export function flagRetiredContent(type: RetiredContentType): void {
  sessionStorage.setItem(`${STORAGE_KEY_PREFIX}-${type}`, "1");
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
