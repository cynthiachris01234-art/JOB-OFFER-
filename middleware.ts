import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  adminConfigured,
  expectedToken,
  safeEqual,
} from '@/lib/admin-auth';

// /admin shows applicants' personal data, so it needs a signed-in session.
// With no credentials configured the pages are refused outright rather than
// served openly.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!adminConfigured()) {
    return new NextResponse(
      'Admin access is not configured. Set ADMIN_USER and ADMIN_PASSWORD in your ' +
        'hosting environment, then redeploy.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  // The login page itself has to stay reachable.
  if (pathname === '/admin/login') return NextResponse.next();

  const cookie = req.cookies.get(SESSION_COOKIE)?.value ?? '';
  if (cookie && safeEqual(cookie, await expectedToken())) {
    return NextResponse.next();
  }

  const login = new URL('/admin/login', req.url);
  login.searchParams.set('from', pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin/:path*'],
};
