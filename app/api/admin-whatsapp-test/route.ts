import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, adminConfigured, expectedToken, safeEqual } from '@/lib/admin-auth';
import { buildMessage, sendWhatsApp } from '@/lib/notify';

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

  // Send the real application format with sample data, not a short line of
  // text: a plain message can succeed while the longer, multi-line, URL-bearing
  // application alert is refused, and only the second one matters.
  const result = await sendWhatsApp(
    buildMessage({
      reference: 'APP-TEST-0000',
      firstName: 'Test',
      lastName: 'Applicant',
      email: 'test.applicant@example.com',
      phone: '+1 (555) 010-0100',
      location: 'Dallas, Texas',
      timezone: 'Central Time',
      experience:
        'Sample experience text, included so this test is the same shape and ' +
        'length as a real application alert.',
      resumeName: 'test_applicant_cv.pdf',
    }),
  );

  return NextResponse.json({
    ok: result.sent,
    reason: result.sent ? null : result.reason,
    detail: 'detail' in result ? result.detail : null,
    status: 'status' in result ? result.status : null,
    body: 'body' in result ? result.body : null,
  });
}
