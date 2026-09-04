import type { Metadata } from 'next';
import { Briefcase, Check, MapPin, ShieldAlert } from 'lucide-react';
import { ApplicationForm } from '@/components/ApplicationForm';
import { COMPANY, POSITION } from '@/lib/data';

export const metadata: Metadata = {
  title: POSITION.title,
  description: `${COMPANY.name} is hiring a ${POSITION.title} (${POSITION.workplace}). ${POSITION.summary}`,
};

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
      {/* ── Job header ───────────────────────────────────────────────────── */}
      <section className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-subtle">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1 text-[#1d4ed8]">
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            {POSITION.employmentType}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {POSITION.workplace}
          </span>
          <span className="rounded-full bg-[#f1f5f9] px-3 py-1">{POSITION.department}</span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-strong md:text-3xl">
          {POSITION.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">{POSITION.summary}</p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {POSITION.highlights.map(item => (
            <div key={item.label} className="rounded-xl border border-[#e5eaf1] bg-canvas-raised px-4 py-3">
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
                {item.label}
              </dt>
              <dd
                className={
                  'mt-1 text-base font-semibold ' +
                  ('emphasis' in item && item.emphasis ? 'text-brand-green' : 'text-ink-deep')
                }
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Role detail ──────────────────────────────────────────────────── */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <RoleList title="What you'll do" items={POSITION.responsibilities} />
        <RoleList title="What we're looking for" items={POSITION.requirements} />
      </section>

      {/* ── Application form ─────────────────────────────────────────────── */}
      <section id="apply" className="panel mt-6 p-6 md:p-8">
        <div className="border-b border-line-soft pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
            Apply for This Position
          </h2>
          <p className="mt-1.5 text-sm text-subtle">
            Please complete the form below to submit your application.
          </p>
        </div>

        <ApplicationForm />
      </section>

      {/* ── Applicant safety notice ──────────────────────────────────────── */}
      <aside className="mt-6 flex gap-3 rounded-2xl border border-[#f3d9a4] bg-[#fffaf0] p-5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#b7791f]" aria-hidden />
        <p className="text-sm leading-relaxed text-[#6b5424]">
          <strong className="font-semibold text-[#5a4415]">Applicant Safety Notice:</strong>{' '}
          Applicants should independently verify recruitment communications through the
          company&apos;s official channels. No applicant should be required to pay a fee to
          apply for employment.
        </p>
      </aside>
    </div>
  );
}

function RoleList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="panel p-6">
      <h2 className="text-base font-semibold text-ink-strong">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map(item => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-body">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
