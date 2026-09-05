import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, adminConfigured, expectedToken, safeEqual } from '@/lib/admin-auth';
import { sendWhatsApp } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin-whatsapp-test — send a test message and report the relay's
// reply verbatim. Lives under /api so the middleware doesn't gate it, so it
// checks the admin session itself.
export async function POST() {
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, error: 'Admin access is not configured.' }, { status: 503 });
  }

  const cookie = cookies().get(SESSION_COOKIE)?.value ?? '';
  if (!cookie || !safeEqual(cookie, await expectedToken())) {
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 });
  }

  const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const result = await sendWhatsApp(
    `TEST MESSAGE\nSent from the careers site at ${stamp} UTC.\n` +
      'If you can read this, application alerts will arrive here too.',
  );

  return NextResponse.json({
    ok: result.sent,
    reason: result.sent ? null : result.reason,
    detail: 'detail' in result ? result.detail : null,
    status: 'status' in result ? result.status : null,
    body: 'body' in result ? result.body : null,
  });
}
