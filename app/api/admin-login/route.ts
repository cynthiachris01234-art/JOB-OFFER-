import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  adminConfigured,
  expectedToken,
  safeEqual,
} from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin-login — exchange credentials for a session cookie.
// Deliberately outside /admin so the middleware doesn't gate the way in.
export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Admin access is not configured on this deployment.' },
      { status: 503 },
    );
  }

  let username = '';
  let password = '';
  try {
    const body = await req.json();
    username = typeof body.username === 'string' ? body.username : '';
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  // Evaluate both before combining, so a correct username can't be detected
  // by short-circuiting.
  const userOk = safeEqual(username, process.env.ADMIN_USER ?? '');
  const passwordOk = safeEqual(password, process.env.ADMIN_PASSWORD ?? '');

  if (!userOk || !passwordOk) {
    return NextResponse.json(
      { ok: false, error: 'Incorrect username or password.' },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await expectedToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

// DELETE /api/admin-login — sign out.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
