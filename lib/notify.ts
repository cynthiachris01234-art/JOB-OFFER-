// ─── WhatsApp notification ────────────────────────────────────────────────────
// Sends a WhatsApp message when a new application arrives, via CallMeBot.
//
// Notifying is best-effort and never blocks a submission: the applicant's data
// is already stored by the time this runs, so a failure here is logged and the
// application still succeeds.

import { POSITION } from './data';
import { siteUrl } from './site';

const ENDPOINT = process.env.CALLMEBOT_ENDPOINT ?? 'https://api.callmebot.com/whatsapp.php';
const TIMEOUT_MS = 8000;

/** Longest slice of the applicant's own text to include in the message. */
const EXPERIENCE_LIMIT = 400;

export interface ApplicationNotification {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
  experience: string | null;
  resumeName: string;
}

export type NotifyResult =
  | { sent: true }
  | { sent: false; reason: 'not-configured' | 'failed'; detail?: string };

export function whatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_NUMBER && process.env.CALLMEBOT_API_KEY);
}

function truncate(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > limit ? `${clean.slice(0, limit - 1)}…` : clean;
}

export function buildMessage(app: ApplicationNotification): string {
  const base = siteUrl();

  return [
    `NEW APPLICATION ${app.reference}`,
    '---',
    `Position: ${POSITION.title}`,
    `Name: ${app.firstName} ${app.lastName}`,
    `Email: ${app.email}`,
    `Phone: ${app.phone}`,
    `Location: ${app.location} (${app.timezone})`,
    `Resume: ${app.resumeName}`,
    app.experience ? '---' : null,
    app.experience ? `Experience: ${truncate(app.experience, EXPERIENCE_LIMIT)}` : null,
    '---',
    base ? `Open: ${base}/admin` : 'Open the admin page to download the resume.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

/** Sends arbitrary text and reports what the relay actually said. CallMeBot
 *  answers 200 with an explanatory body for several failure modes — a number
 *  that never completed activation, a wrong key — so the body matters as much
 *  as the status code. */
export async function sendWhatsApp(
  text: string,
): Promise<NotifyResult & { status?: number; body?: string }> {
  // Numbers get copied in as "+44 7529 718679"; the relay wants no separators.
  const phone = process.env.WHATSAPP_NUMBER?.replace(/[\s()\-.]/g, '');
  const apiKey = process.env.CALLMEBOT_API_KEY?.trim();
  if (!phone || !apiKey) return { sent: false, reason: 'not-configured' };

  const url =
    `${ENDPOINT}?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(text)}` +
    `&apikey=${encodeURIComponent(apiKey)}`;

  try {
    // A slow or unreachable relay must not hold up the applicant's response.
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const body = (await res.text().catch(() => '')).slice(0, 400);

    // A 200 whose body describes a problem is still a failure.
    const rejected = /error|invalid|not\s*(found|allowed|authorized)|apikey/i.test(body);
    if (!res.ok || rejected) {
      console.error('WhatsApp notification rejected:', res.status, body);
      return {
        sent: false,
        reason: 'failed',
        detail: `HTTP ${res.status}`,
        status: res.status,
        body,
      };
    }
    return { sent: true, status: res.status, body };
  } catch (err) {
    console.error('WhatsApp notification failed:', err);
    return {
      sent: false,
      reason: 'failed',
      detail: err instanceof Error ? err.message : 'unknown error',
    };
  }
}

export async function notifyNewApplication(
  app: ApplicationNotification,
): Promise<NotifyResult> {
  return sendWhatsApp(buildMessage(app));
}
