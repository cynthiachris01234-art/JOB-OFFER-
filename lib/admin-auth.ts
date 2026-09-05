/** Admin sign-in.
 *
 *  Previously this was HTTP Basic auth, which relies on the browser's own
 *  credential popup — invisible or dismissed often enough that it left people
 *  locked out with nowhere to type. Now a normal login form sets a cookie, and
 *  the cookie carries a hash of the configured credentials rather than the
 *  credentials themselves.
 */

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD);
}

/** SHA-256 of "user:password". Available in both the Edge middleware and the
 *  Node route handler, so both sides derive the same value independently. */
export async function expectedToken(): Promise<string> {
  const raw = `${process.env.ADMIN_USER ?? ''}:${process.env.ADMIN_PASSWORD ?? ''}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Length-independent comparison, so a mismatch doesn't leak by timing. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
