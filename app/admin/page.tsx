import type { Metadata } from 'next';
import { Download, FileText, Inbox, Mail, MapPin, Phone } from 'lucide-react';
import { resumeBucket, serviceClient, storageConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
// force-dynamic alone only opts the route out of static rendering — Next still
// caches the fetches supabase-js makes, which would serve a stale list. This
// opts those out too, so every load reads the current applications.
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Applications',
  robots: { index: false, follow: false },
};


/** Resume links are short-lived signed URLs — the bucket stays private. */
const SIGNED_URL_TTL_SECONDS = 30 * 60;
const PAGE_SIZE = 200;

interface Application {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
  experience: string | null;
  resume_path: string;
  resume_name: string;
  resume_size: number;
  status: string;
  created_at: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Deterministic UTC formatting — toLocaleString is unreliable in server runtimes.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ` +
         `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-[#eef4ff] text-[#1d4ed8] border-[#cddcfb]',
  reviewing: 'bg-[#fffaf0] text-[#8a6413] border-[#f3d9a4]',
  contacted: 'bg-[#f5f0ff] text-[#6b3fd4] border-[#ddd0f8]',
  rejected:  'bg-[#fdf3f3] text-[#9b2c2c] border-[#f2c6c6]',
  hired:     'bg-[#f2fbf6] text-[#0a5c3a] border-[#bfe6cf]',
};

async function loadApplications(): Promise<{
  rows: Application[];
  links: Record<string, string>;
  error: string | null;
}> {
  if (!storageConfigured()) {
    return { rows: [], links: {}, error: 'not-configured' };
  }

  const supabase = serviceClient();

  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    console.error('Applications query error:', error);
    return { rows: [], links: {}, error: error.message };
  }

  const rows = (data ?? []) as Application[];
  const links: Record<string, string> = {};

  if (rows.length) {
    const { data: signed } = await supabase.storage
      .from(resumeBucket())
      .createSignedUrls(rows.map(r => r.resume_path), SIGNED_URL_TTL_SECONDS);

    for (const entry of signed ?? []) {
      if (entry.path && entry.signedUrl) links[entry.path] = entry.signedUrl;
    }
  }

  return { rows, links, error: null };
}

export default async function AdminApplicationsPage() {
  const { rows, links, error } = await loadApplications();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-strong">Applications</h1>
          <p className="mt-1 text-sm text-subtle">
            Submissions from the careers form.
          </p>
        </div>
        {!error && (
          <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-subtle">
            {rows.length}
            {rows.length === PAGE_SIZE ? '+' : ''} total
          </span>
        )}
      </header>

      {error === 'not-configured' && (
        <div className="panel mt-6 p-6">
          <p className="font-semibold text-ink-strong">Supabase is not configured</p>
          <p className="mt-1.5 text-sm leading-relaxed text-body">
            Set <span className="font-mono text-ink-deep">NEXT_PUBLIC_SUPABASE_URL</span> and{' '}
            <span className="font-mono text-ink-deep">SUPABASE_SERVICE_ROLE_KEY</span>, then run{' '}
            <span className="font-mono text-ink-deep">supabase/schema.sql</span>. Until then the
            careers form declines submissions instead of storing them.
          </p>
        </div>
      )}

      {error && error !== 'not-configured' && (
        <div className="panel mt-6 border-[#f2c6c6] p-6">
          <p className="font-semibold text-[#9b2c2c]">Could not load applications</p>
          <p className="mt-1.5 text-sm text-body">{error}</p>
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="panel mt-6 flex flex-col items-center p-10 text-center">
          <Inbox className="mb-3 h-8 w-8 text-faint" aria-hidden />
          <p className="font-semibold text-ink-strong">No applications yet</p>
          <p className="mt-1 text-sm text-subtle">
            New submissions appear here as soon as they come in.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {rows.map(row => {
          const href = links[row.resume_path];
          return (
            <article key={row.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink-strong">
                    {row.first_name} {row.last_name}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-faint">
                    {row.reference} · {formatDate(row.created_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    STATUS_STYLES[row.status] ?? 'border-line bg-canvas-raised text-subtle'
                  }`}
                >
                  {row.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <a
                  href={`mailto:${row.email}`}
                  className="flex items-center gap-2 text-body transition-colors hover:text-brand-blue"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
                  <span className="truncate">{row.email}</span>
                </a>
                <a
                  href={`tel:${row.phone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-2 text-body transition-colors hover:text-brand-blue"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
                  <span className="truncate">{row.phone}</span>
                </a>
                <p className="flex items-center gap-2 text-body">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
                  <span className="truncate">
                    {row.location} · {row.timezone}
                  </span>
                </p>
              </div>

              {row.experience && (
                <p className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-canvas-raised p-3 text-sm leading-relaxed text-body">
                  {row.experience}
                </p>
              )}

              <div className="mt-4 flex items-center gap-3 border-t border-line-soft pt-4">
                <FileText className="h-4 w-4 shrink-0 text-faint" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm text-body">
                  {row.resume_name}
                  <span className="text-faint"> · {formatSize(row.resume_size)}</span>
                </span>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink-deep px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d3a5c]"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    Resume
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-faint">Link unavailable</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {rows.length > 0 && (
        <p className="mt-6 text-xs text-faint">
          Resume links are signed and expire after {SIGNED_URL_TTL_SECONDS / 60} minutes — reload
          this page to get fresh ones.
        </p>
      )}
    </div>
  );
}
