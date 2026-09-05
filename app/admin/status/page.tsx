import type { Metadata } from 'next';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  resumeBucket,
  serviceClient,
  serviceRoleKey,
  storageConfigured,
  supabaseUrl,
} from '@/lib/supabase';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Status',
  robots: { index: false, follow: false },
};

// Deliberately reports only whether things are set and whether they work —
// never a secret's value. It sits behind the same Basic auth as /admin.

type Check = { label: string; ok: boolean; detail: string };

function host(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url ? 'unparseable' : '';
  }
}

/** The project a URL like https://abcd.supabase.co belongs to. */
function refFromUrl(url: string): string {
  return host(url).split('.')[0] ?? '';
}

/** Supabase keys are JWTs carrying a "ref" claim naming their project. Reading
 *  it lets us say "this key is for a different project" instead of leaving the
 *  reader with Supabase's opaque "signature verification failed". */
function refFromKey(key: string): string {
  const payload = key.split('.')[1];
  if (!payload) return '';
  try {
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    const claims = JSON.parse(json);
    return typeof claims.ref === 'string' ? claims.ref : '';
  } catch {
    return '';
  }
}

async function runChecks(): Promise<{ checks: Check[]; build: Check[] }> {
  const url = supabaseUrl();
  const key = serviceRoleKey();
  const bucket = resumeBucket();
  const urlRef = refFromUrl(url);
  const keyRef = refFromKey(key);

  const checks: Check[] = [
    {
      label: 'Supabase URL',
      ok: Boolean(url),
      detail: url ? host(url) : 'not set — needs NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL',
    },
    {
      label: 'Service role key',
      ok: Boolean(key) && (!keyRef || !urlRef || keyRef === urlRef),
      detail: !key
        ? 'not set — needs SUPABASE_SERVICE_ROLE_KEY'
        : keyRef && urlRef && keyRef !== urlRef
          ? `set, but it belongs to Supabase project "${keyRef}" while the URL points at "${urlRef}" — copy both from the same project`
          : `set (${key.length} characters)${keyRef ? ` · project ${keyRef}` : ''}`,
    },
    {
      label: 'Resume bucket name',
      ok: true,
      detail: bucket,
    },
    {
      label: 'WhatsApp number',
      ok: Boolean(process.env.WHATSAPP_NUMBER),
      detail: process.env.WHATSAPP_NUMBER ? 'set' : 'not set — no message will be sent',
    },
    {
      label: 'CallMeBot key',
      ok: Boolean(process.env.CALLMEBOT_API_KEY),
      detail: process.env.CALLMEBOT_API_KEY ? 'set' : 'not set — no message will be sent',
    },
    {
      label: 'Site URL',
      ok: Boolean(siteUrl()),
      detail: siteUrl() ?? 'not set — the WhatsApp message will have no admin link',
    },
  ];

  // Live checks, only worth attempting once the credentials exist.
  if (storageConfigured()) {
    const supabase = serviceClient();

    const { error: tableError } = await supabase
      .from('job_applications')
      .select('id', { count: 'exact', head: true });
    checks.push({
      label: 'job_applications table',
      ok: !tableError,
      detail: tableError ? tableError.message : 'reachable',
    });

    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
    checks.push({
      label: `Storage bucket "${bucket}"`,
      ok: Boolean(bucketData) && !bucketError,
      detail: bucketError
        ? bucketError.message
        : `exists · ${bucketData?.public ? 'PUBLIC — should be private' : 'private'}`,
    });
  } else {
    checks.push({
      label: 'Database checks',
      ok: false,
      detail: 'skipped — Supabase credentials incomplete',
    });
  }

  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? '';
  const build: Check[] = [
    {
      label: 'Deployed commit',
      ok: Boolean(sha),
      detail: sha ? sha.slice(0, 7) : 'unknown (not a Vercel build)',
    },
    {
      label: 'Deployment environment',
      ok: true,
      detail: process.env.VERCEL_ENV ?? 'local',
    },
  ];

  return { checks, build };
}

export default async function StatusPage() {
  const { checks, build } = await runChecks();
  const allOk = checks.every(c => c.ok);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-strong">Status</h1>
      <p className="mt-1 text-sm text-subtle">
        What this deployment can actually see. Values are never shown — only whether
        each one is present and working.
      </p>

      <div
        className={`panel mt-6 p-5 ${allOk ? 'border-[#bfe6cf]' : 'border-[#f2c6c6]'}`}
      >
        <p className={`font-semibold ${allOk ? 'text-brand-green' : 'text-[#9b2c2c]'}`}>
          {allOk ? 'Everything is configured' : 'Something is missing'}
        </p>
        <p className="mt-1 text-sm text-body">
          {allOk
            ? 'Applications will store, appear in /admin, and send a WhatsApp message.'
            : 'Each failing row below names the variable or step that needs fixing.'}
        </p>
      </div>

      <Table title="Configuration" rows={checks} />
      <Table title="Build" rows={build} />
    </div>
  );
}

function Table({ title, rows }: { title: string; rows: Check[] }) {
  return (
    <section className="panel mt-6 overflow-hidden">
      <h2 className="border-b border-line-soft px-5 py-3 text-sm font-semibold text-ink-strong">
        {title}
      </h2>
      <ul>
        {rows.map(row => (
          <li
            key={row.label}
            className="flex items-start gap-3 border-b border-line-soft px-5 py-3 last:border-b-0"
          >
            {row.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9b2c2c]" aria-hidden />
            )}
            <span className="w-56 shrink-0 text-sm font-medium text-ink-deep">{row.label}</span>
            <span className="min-w-0 flex-1 break-words font-mono text-xs text-body">
              {row.detail}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
