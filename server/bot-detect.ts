const BOT_PATTERN = /googlebot|google-inspectiontool|google web preview|mediapartners-google|adsbot-google|apis-google|feedfetcher-google|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|rogerbot|seznambot/i;

export function isSearchBot(userAgent?: string): boolean {
  if (!userAgent) return false;
  return BOT_PATTERN.test(userAgent);
}
