import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";

const EMAIL_CAPTURED_KEY = "email_captured";
const EXIT_POPUP_COOKIE = "exit_popup_shown";
const SCROLL_POPUP_SHOWN_KEY = "scroll_popup_shown_session";
const SITE_ENTER_TIME_KEY = "site_enter_time";

export function initSiteEnterTime() {
  if (!sessionStorage.getItem(SITE_ENTER_TIME_KEY)) {
    sessionStorage.setItem(SITE_ENTER_TIME_KEY, Date.now().toString());
  }
}

export function getTimeOnSite(): number {
  const enterTime = sessionStorage.getItem(SITE_ENTER_TIME_KEY);
  if (!enterTime) return 0;
  return (Date.now() - parseInt(enterTime, 10)) / 1000;
}

export function isEmailCaptured(): boolean {
  return !!localStorage.getItem(EMAIL_CAPTURED_KEY);
}

export function markEmailCaptured(email: string) {
  localStorage.setItem(EMAIL_CAPTURED_KEY, email);
}

export function getCapturedEmail(): string | null {
  return localStorage.getItem(EMAIL_CAPTURED_KEY);
}

export function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function isExitPopupSuppressed(): boolean {
  return !!getCookie(EXIT_POPUP_COOKIE);
}

export function suppressExitPopup() {
  setCookie(EXIT_POPUP_COOKIE, "1", 7);
}

export function isScrollPopupShownThisSession(): boolean {
  return !!sessionStorage.getItem(SCROLL_POPUP_SHOWN_KEY);
}

export function markScrollPopupShown() {
  sessionStorage.setItem(SCROLL_POPUP_SHOWN_KEY, "1");
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type WaitlistSource = "hero" | "exit" | "scroll" | "oos" | "product";

interface CaptureResult {
  success: boolean;
  foundingMember: boolean;
  duplicate: boolean;
  totalCount: number;
  error?: string;
}

export async function captureEmail(
  email: string,
  source: WaitlistSource,
  productId?: string | null,
  optsInMarketing: boolean = false
): Promise<CaptureResult> {
  if (!validateEmail(email)) {
    return { success: false, foundingMember: false, duplicate: false, totalCount: 0, error: "Please enter a valid email address." };
  }

  if (isEmailCaptured() && !productId) {
    return { success: true, foundingMember: false, duplicate: true, totalCount: 0, error: "You're already on the list!" };
  }

  try {
    const response = await apiRequest("POST", "/api/waitlist/signup", {
      email: email.trim().toLowerCase(),
      source,
      productInterest: productId ? [productId] : null,
      optsInMarketing,
    });
    const data = await response.json();

    if (data.success) {
      markEmailCaptured(email.trim().toLowerCase());
      trackEvent(`${source}_email_signup`, "lead_capture", email);
      return {
        success: true,
        foundingMember: data.foundingMember ?? false,
        duplicate: data.duplicate ?? false,
        totalCount: data.totalCount ?? 0,
      };
    }
    return { success: false, foundingMember: false, duplicate: false, totalCount: 0, error: "Something went wrong. Please try again." };
  } catch (err: any) {
    return { success: false, foundingMember: false, duplicate: false, totalCount: 0, error: "Something went wrong. Please try again." };
  }
}
