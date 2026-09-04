import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// /admin shows applicants' personal data, so it is gated by HTTP Basic auth.
// With no credentials configured the page is refused outright rather than
// served openly.
const USER = process.env.ADMIN_USER ?? '';
const PASSWORD = process.env.ADMIN_PASSWORD ?? '';

/** Length-independent comparison, so a mismatch doesn't leak length by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function unauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Applications", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest) {
  if (!USER || !PASSWORD) {
    return new NextResponse(
      'Admin access is not configured. Set ADMIN_USER and ADMIN_PASSWORD.',
      { status: 503 },
    );
  }

  const header = req.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return unauthorized();

  let decoded = '';
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) return unauthorized();

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  // Evaluate both before combining, so a correct username can't be detected
  // by short-circuiting.
  const userOk = safeEqual(user, USER);
  const passwordOk = safeEqual(password, PASSWORD);
  return userOk && passwordOk ? NextResponse.next() : unauthorized();
}

export const config = {
  matcher: ['/admin/:path*'],
};
