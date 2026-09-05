'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ATTESTATIONS, RESUME_RULES, TIME_ZONES } from '@/lib/data';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; reference: string | null };

const FIELD = 'field';
const LABEL = 'mb-1.5 block text-sm font-medium text-[#33455c]';

export function ApplicationForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const busy = status.kind === 'submitting';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Client-side resume checks so people get feedback before the upload starts.
    const resume = data.get('resume');
    if (!(resume instanceof File) || resume.size === 0) {
      setStatus({ kind: 'error', message: 'Please attach your resume or CV.' });
      return;
    }
    if (resume.size > RESUME_RULES.maxBytes) {
      setStatus({
        kind: 'error',
        message: `Your resume is larger than ${Math.round(RESUME_RULES.maxBytes / 1024 / 1024)}MB. Please upload a smaller file.`,
      });
      return;
    }
    if (!RESUME_RULES.extensions.some(ext => resume.name.toLowerCase().endsWith(ext))) {
      setStatus({
        kind: 'error',
        message: `Resumes must be one of: ${RESUME_RULES.extensions.join(', ')}.`,
      });
      return;
    }

    setStatus({ kind: 'submitting' });
    try {
      const res = await fetch('/apply', { method: 'POST', body: data });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.ok) {
        setStatus({
          kind: 'error',
          message:
            payload?.error ??
            'We could not submit your application. Please try again in a moment.',
        });
        return;
      }

      form.reset();
      setStatus({ kind: 'success', reference: payload.reference ?? null });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Network error — please check your connection and try again.',
      });
    }
  }

  if (status.kind === 'success') {
    return (
      <div className="mt-6 flex gap-3 rounded-xl border border-[#bfe6cf] bg-[#f2fbf6] p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
        <div>
          <h3 className="text-base font-semibold text-[#0a5c3a]">Application received</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#2f6b52]">
            Thank you for applying. If your background matches what the team is looking
            for, someone will contact you using the details you provided.
          </p>
          {status.reference && (
            <p className="mt-3 text-xs text-[#4a7a64]">
              Reference: <span className="font-mono">{status.reference}</span>
            </p>
          )}
          <button
            type="button"
            onClick={() => setStatus({ kind: 'idle' })}
            className="mt-4 text-sm font-medium text-brand-green underline underline-offset-4"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="firstName">First Name *</label>
          <input
            className={FIELD} id="firstName" name="firstName" type="text"
            autoComplete="given-name" maxLength={80}
            placeholder="Enter your first name" required disabled={busy}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="lastName">Last Name *</label>
          <input
            className={FIELD} id="lastName" name="lastName" type="text"
            autoComplete="family-name" maxLength={80}
            placeholder="Enter your last name" required disabled={busy}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="email">Email Address *</label>
          <input
            className={FIELD} id="email" name="email" type="email"
            autoComplete="email" maxLength={160} inputMode="email"
            placeholder="Enter your email address" required disabled={busy}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="phone">Phone Number *</label>
          <input
            className={FIELD} id="phone" name="phone" type="tel"
            autoComplete="tel" maxLength={40} inputMode="tel"
            placeholder="Enter your phone number" required disabled={busy}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="location">Current City &amp; State *</label>
          <input
            className={FIELD} id="location" name="location" type="text"
            autoComplete="address-level2" maxLength={120}
            placeholder="e.g. Dallas, Texas" required disabled={busy}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="timezone">Time Zone *</label>
          <select
            className={FIELD} id="timezone" name="timezone"
            defaultValue="" required disabled={busy}
          >
            <option value="" disabled>Select your time zone</option>
            {TIME_ZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="experience">Relevant Experience</label>
        <textarea
          className={`${FIELD} min-h-[130px] resize-y`} id="experience" name="experience"
          rows={5} maxLength={4000}
          placeholder="Tell us about your relevant experience..." disabled={busy}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="resume">Upload Resume / CV *</label>
        <input
          className="w-full rounded-lg border border-dashed border-line-field bg-canvas-raised px-3.5 py-2.5 text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-ink-deep file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-[#1d3a5c] disabled:opacity-60"
          id="resume" name="resume" type="file"
          accept={RESUME_RULES.extensions.join(',')} required disabled={busy}
        />
        <p className="mt-1.5 text-xs text-faint">
          PDF or Word document, up to {Math.round(RESUME_RULES.maxBytes / 1024 / 1024)}MB.
        </p>
      </div>

      {ATTESTATIONS.map(item => (
        <label
          key={item.name}
          className="flex cursor-pointer items-start gap-3 rounded-xl bg-canvas-raised p-4 text-sm leading-relaxed text-body"
        >
          <input
            type="checkbox" name={item.name} value="yes"
            className="mt-0.5 h-4 w-4 shrink-0 accent-ink-deep"
            required disabled={busy}
          />
          <span>{item.label}</span>
        </label>
      ))}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-canvas-raised p-4 text-sm leading-relaxed text-body">
        <input
          type="checkbox" name="consent" value="yes"
          className="mt-0.5 h-4 w-4 shrink-0 accent-ink-deep"
          required disabled={busy}
        />
        <span>
          I confirm that the information provided is accurate and understand that
          submitting an application does not guarantee employment.
        </span>
      </label>

      {status.kind === 'error' && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[#f2c6c6] bg-[#fdf3f3] px-4 py-3 text-sm text-[#9b2c2c]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{status.message}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-deep px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#1d3a5c] focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {busy ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  );
}
