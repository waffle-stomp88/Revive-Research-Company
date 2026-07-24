/**
 * Unit tests for resolvePromoUserId — the identity-resolution helper used by
 * POST /api/promo/bac-water-declined.
 *
 * Background:
 *   The endpoint was fixed to prefer the auth-provider `sub` claim over the
 *   session `userId`.  Without tests, a future refactor could silently
 *   reintroduce the split-identity bug, writing promo records under the session
 *   ID instead of the canonical provider sub.
 *
 * What these tests guard:
 *   1. Authenticated path — req.user.claims.sub MUST be used, even when a
 *      different session.userId is present.
 *   2. Session-only (unauthenticated) fallback — session.userId is used when
 *      no auth claim is available.
 *   3. Completely anonymous request — returns undefined so no record is written.
 *   4. Edge cases that could cause the wrong branch to be taken (isAuthenticated
 *      missing, sub empty string, session userId undefined, etc.).
 *
 * Relevant files:
 *   server/lib/promo-identity.ts   — pure function under test
 *   server/routes.ts               — POST /api/promo/bac-water-declined (caller)
 */

import { describe, it, expect } from "vitest";
import { resolvePromoUserId } from "../server/lib/promo-identity";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Authenticated request: isAuthenticated() === true, claims.sub present. */
function authedReq(sub: string, sessionUserId?: string) {
  return {
    isAuthenticated: () => true,
    user: { claims: { sub } },
    session: sessionUserId ? { userId: sessionUserId } : {},
  };
}

/** Session-only request: no OIDC auth, but session.userId is set. */
function sessionOnlyReq(sessionUserId: string) {
  return {
    isAuthenticated: () => false,
    user: undefined,
    session: { userId: sessionUserId },
  };
}

/** Completely anonymous request — no auth, no session userId. */
function anonReq() {
  return {
    isAuthenticated: () => false,
    user: undefined,
    session: {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Authenticated path — auth-provider sub must win
// ─────────────────────────────────────────────────────────────────────────────

describe("resolvePromoUserId — authenticated (OIDC) path", () => {
  it("returns the auth-provider sub when authenticated and sub is present", () => {
    const req = authedReq("provider-sub-abc123");
    expect(resolvePromoUserId(req)).toBe("provider-sub-abc123");
  });

  it("prefers the auth-provider sub over a different session.userId", () => {
    // This is the critical regression guard: session userId must NOT be used
    // when the auth-provider sub is available.
    const req = authedReq("provider-sub-abc123", "session-user-xyz789");
    const result = resolvePromoUserId(req);
    expect(result).toBe("provider-sub-abc123");
    expect(result).not.toBe("session-user-xyz789");
  });

  it("returns the sub even when session.userId is undefined", () => {
    const req = authedReq("provider-sub-only");
    expect(resolvePromoUserId(req)).toBe("provider-sub-only");
  });

  it("returns the sub when session is absent entirely", () => {
    const req = {
      isAuthenticated: () => true,
      user: { claims: { sub: "sub-no-session" } },
    };
    expect(resolvePromoUserId(req)).toBe("sub-no-session");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Session-only / unauthenticated fallback
// ─────────────────────────────────────────────────────────────────────────────

describe("resolvePromoUserId — session-only (unauthenticated) fallback", () => {
  it("returns session.userId when isAuthenticated() is false", () => {
    const req = sessionOnlyReq("session-user-fallback");
    expect(resolvePromoUserId(req)).toBe("session-user-fallback");
  });

  it("returns session.userId when isAuthenticated is not a function", () => {
    const req = {
      isAuthenticated: undefined,
      user: undefined,
      session: { userId: "session-only-user" },
    };
    expect(resolvePromoUserId(req)).toBe("session-only-user");
  });

  it("returns session.userId when claims.sub is an empty string", () => {
    // An empty sub should not be treated as a valid auth identity.
    const req = {
      isAuthenticated: () => true,
      user: { claims: { sub: "" } },
      session: { userId: "fallback-session-id" },
    };
    expect(resolvePromoUserId(req)).toBe("fallback-session-id");
  });

  it("returns session.userId when req.user is undefined despite isAuthenticated true", () => {
    const req = {
      isAuthenticated: () => true,
      user: undefined,
      session: { userId: "session-when-user-missing" },
    };
    expect(resolvePromoUserId(req)).toBe("session-when-user-missing");
  });

  it("returns session.userId when req.user.claims is undefined", () => {
    const req = {
      isAuthenticated: () => true,
      user: { claims: undefined },
      session: { userId: "session-claims-missing" },
    };
    expect(resolvePromoUserId(req)).toBe("session-claims-missing");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Anonymous / no identity → no record written
// ─────────────────────────────────────────────────────────────────────────────

describe("resolvePromoUserId — anonymous request", () => {
  it("returns undefined when neither auth sub nor session.userId is present", () => {
    expect(resolvePromoUserId(anonReq())).toBeUndefined();
  });

  it("returns undefined when req has no session at all", () => {
    const req = { isAuthenticated: () => false, user: undefined };
    expect(resolvePromoUserId(req)).toBeUndefined();
  });

  it("returns undefined when session.userId is an empty string", () => {
    const req = {
      isAuthenticated: () => false,
      user: undefined,
      session: { userId: "" },
    };
    expect(resolvePromoUserId(req)).toBeUndefined();
  });
});
