/**
 * Resolves the canonical user ID for promo-recording endpoints.
 *
 * When Replit Auth (OIDC) is active the identity provider assigns a stable
 * `sub` claim that survives token refreshes. That value must take precedence
 * over the session `userId` written at login time so that promo records are
 * always stored under a consistent, provider-issued identifier.
 *
 * Rule:
 *   - If `req.isAuthenticated()` returns truthy AND `req.user.claims.sub` is
 *     a non-empty string → use the auth-provider sub.
 *   - Otherwise fall back to `req.session.userId` (guest / session-only path).
 *   - If neither is available → return undefined (no promo record written).
 */
export function resolvePromoUserId(req: {
  isAuthenticated?: () => boolean;
  user?: { claims?: { sub?: string } };
  session?: { userId?: string };
}): string | undefined {
  const authSub =
    typeof req.isAuthenticated === "function" &&
    req.isAuthenticated() &&
    req.user?.claims?.sub
      ? req.user.claims.sub
      : undefined;

  if (authSub) return authSub;

  const sessionUserId = req.session?.userId;
  return sessionUserId || undefined;
}
