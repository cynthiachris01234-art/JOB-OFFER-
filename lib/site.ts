/** NEXT_PUBLIC_SITE_URL is typed in by hand in a hosting dashboard, so it
 *  arrives as often as not without a scheme ("example.vercel.app") or with a
 *  trailing slash. Passing that straight to `new URL()` throws ERR_INVALID_URL
 *  at module scope, which fails the whole build — so normalise it here and
 *  treat anything unusable as simply unset.
 *
 *  Returns the origin (no trailing slash), or null when nothing usable is set.
 */
export function siteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(candidate).origin;
  } catch {
    console.warn(`Ignoring unusable NEXT_PUBLIC_SITE_URL: ${raw}`);
    return null;
  }
}

/** Same value, with a localhost fallback for anything that needs a real URL. */
export function siteUrlOrLocal(): string {
  return siteUrl() ?? 'http://localhost:3000';
}
