import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/analytics";
import { X } from "lucide-react";
import { submitToZohoResearchList } from "@/lib/zoho-form-submit";

const DISMISSED_KEY = "revive_sticky_dismissed";
const CAPTURED_KEY = "revive_email_captured";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SUPPRESSED_PATHS = ["/cart", "/checkout"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_BREAKPOINT = 768;

function isMobileViewport(): boolean {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const expiry = parseInt(raw, 10);
    if (isNaN(expiry)) return false;
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

function isCaptured(): boolean {
  try {
    return localStorage.getItem(CAPTURED_KEY) === "true";
  } catch {
    return false;
  }
}

export function MobileStickyEmailBar() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [slideDown, setSlideDown] = useState(false);

  const shownEventFired = useRef(false);
  const lastScrollY = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = !visible ? 0 : expanded ? 96 : 52;
    document.documentElement.style.setProperty("--sticky-email-bar-h", `${h}px`);
    return () => {
      document.documentElement.style.setProperty("--sticky-email-bar-h", "0px");
    };
  }, [visible, expanded]);

  const isSuppressedPath = SUPPRESSED_PATHS.some(
    (p) => location === p || location.startsWith(p + "/")
  );

  const shouldSuppressBar =
    isSuppressedPath || isAuthenticated || isCaptured();

  const checkScrollDepth = useCallback(() => {
    if (shouldSuppressBar || !isMobileViewport()) return;

    const scrolled = window.scrollY;
    // Show after user has scrolled past ~80vh from the top of the page
    const heroThreshold = window.innerHeight * 0.8;

    if (scrolled >= heroThreshold && !isDismissed() && !isCaptured()) {
      setVisible(true);
      if (!shownEventFired.current) {
        trackEvent("email_sticky_bar_shown");
        shownEventFired.current = true;
      }
    }

    const delta = scrolled - lastScrollY.current;
    if (delta > 4) {
      setSlideDown(true);
    } else if (delta < -4) {
      setSlideDown(false);
    }
    lastScrollY.current = scrolled;
  }, [shouldSuppressBar]);

  useEffect(() => {
    if (shouldSuppressBar) {
      setVisible(false);
      return;
    }
    window.addEventListener("scroll", checkScrollDepth, { passive: true });
    return () => window.removeEventListener("scroll", checkScrollDepth);
  }, [shouldSuppressBar, checkScrollDepth]);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleExpand = () => {
    setExpanded(true);
    trackEvent("email_sticky_bar_expanded");
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem(
        DISMISSED_KEY,
        String(Date.now() + DISMISS_DURATION_MS)
      );
    } catch {}
    setVisible(false);
    trackEvent("email_sticky_bar_dismissed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "sticky_bar_mobile" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      try {
        localStorage.setItem(CAPTURED_KEY, "true");
      } catch {}
      trackEvent("email_sticky_bar_submitted");
      submitToZohoResearchList(email);

      setTimeout(() => {
        setVisible(false);
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 block md:hidden"
      style={{
        bottom: "4rem",
        transform: slideDown ? "translateY(4px)" : "translateY(0)",
        transition: "transform 150ms ease-out",
      }}
      data-testid="mobile-sticky-email-bar"
    >
      <div
        className="bg-[#1a1a1f] border-t border-[#21d8ff]/40"
        style={{
          transition: "min-height 150ms ease-out",
          minHeight: submitted ? "56px" : expanded ? "96px" : "52px",
        }}
      >
        {submitted ? (
          <div className="flex items-center justify-center h-14 px-4">
            <span
              className="text-sm font-semibold text-[#21d8ff]"
              data-testid="text-sticky-submitted"
            >
              You&apos;re in. Welcome to Revive.
            </span>
          </div>
        ) : !expanded ? (
          <div
            className="flex items-center justify-between h-[52px] px-4 pr-[76px] gap-3 cursor-pointer"
            onClick={handleExpand}
            data-testid="button-sticky-expand"
          >
            <span className="text-sm text-white/80 font-medium flex-1 truncate">
              Join the Research List
            </span>
            {/* No onClick here — parent div handles expand to avoid double-fire */}
            <span
              className="text-xs font-bold text-[#D4FF1F] whitespace-nowrap shrink-0"
              data-testid="button-sticky-join"
            >
              Join &rarr;
            </span>
            <button
              type="button"
              className="text-white/50 hover:text-white shrink-0 p-1"
              onClick={handleDismiss}
              aria-label="Dismiss"
              data-testid="button-sticky-dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center gap-1.5 h-24 px-4 pb-1"
            data-testid="form-sticky-email"
          >
            <div className="flex items-center gap-2">
              <label htmlFor="sticky-email-input" className="sr-only">
                Email address
              </label>
              <input
                ref={inputRef}
                id="sticky-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Your email"
                autoComplete="email"
                aria-label="Email address"
                className="flex-1 h-9 rounded-md bg-black/50 border border-[#21d8ff]/30 text-white placeholder:text-white/40 text-sm px-3 focus:outline-none focus:border-[#21d8ff]/70"
                data-testid="input-sticky-email"
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="h-9 px-4 rounded-md bg-[#D4FF1F] text-black text-sm font-bold disabled:opacity-50 shrink-0"
                data-testid="button-sticky-submit"
              >
                {isLoading ? "..." : "Join the Research List \u2192"}
              </button>
              <button
                type="button"
                className="text-white/50 hover:text-white p-1 shrink-0"
                onClick={handleDismiss}
                aria-label="Dismiss"
                data-testid="button-sticky-dismiss-expanded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-[10px] leading-tight" data-testid="text-sticky-error">{error}</p>
            )}
            <p className="text-[10px] text-white/30 leading-tight">
              For 21+ researchers only
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
