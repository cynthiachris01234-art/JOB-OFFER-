import type { Metadata } from 'next';
import { Briefcase, Check, MapPin, Package, ShieldAlert } from 'lucide-react';
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

        <h2 className="mt-6 text-base font-semibold text-ink-strong">
          {POSITION.aboutHeading}
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-body">
          {POSITION.summary}
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {POSITION.highlights.map(item => (
            <div
              key={item.label}
              className="rounded-xl border border-[#e5eaf1] bg-canvas-raised px-4 py-3"
            >
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

      {/* ── Responsibilities and requirements ────────────────────────────── */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <RoleList title="Responsibilities" items={POSITION.responsibilities} />
        <RoleList
          title="Requirements"
          items={POSITION.requirements}
          note={POSITION.requirementsNote}
        />
      </section>

      {/* ── What we provide ──────────────────────────────────────────────── */}
      <section className="panel mt-6 p-6 md:p-8">
        <h2 className="text-base font-semibold text-ink-strong">{POSITION.provided.heading}</h2>
        {POSITION.provided.paragraphs.map(text => (
          <p key={text} className="mt-3 max-w-3xl text-[15px] leading-relaxed text-body">
            {text}
          </p>
        ))}
      </section>

      {/* ── Compensation ─────────────────────────────────────────────────── */}
      <section className="panel mt-6 p-6 md:p-8">
        <h2 className="text-base font-semibold text-ink-strong">
          {POSITION.compensation.heading}
        </h2>
        <p className="mt-3 text-lg font-semibold text-brand-green">
          {POSITION.compensation.payLabel}: {POSITION.compensation.payValue}
        </p>
        {POSITION.compensation.paragraphs.map(text => (
          <p key={text} className="mt-3 max-w-3xl text-[15px] leading-relaxed text-body">
            {text}
          </p>
        ))}
      </section>

      {/* ── Equipment ────────────────────────────────────────────────────── */}
      <section className="panel mt-6 p-6 md:p-8">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink-strong">
          <Package className="h-4 w-4 text-faint" aria-hidden />
          {POSITION.equipment.heading}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          {POSITION.equipment.intro}
        </p>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {POSITION.equipment.items.map(item => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-body">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {POSITION.equipment.notes.map(text => (
          <p key={text} className="mt-3 max-w-3xl text-sm leading-relaxed text-subtle">
            {text}
          </p>
        ))}
      </section>

      {/* ── Application form ─────────────────────────────────────────────── */}
      <section id="apply" className="panel mt-6 p-6 md:p-8">
        <div className="border-b border-line-soft pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
            {POSITION.application.heading}
          </h2>
          <p className="mt-1.5 text-sm text-subtle">{POSITION.application.intro}</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {POSITION.application.items.map(item => (
              <li key={item} className="flex items-center gap-1.5 text-sm text-body">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand-green" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <ApplicationForm />
      </section>

      {/* ── Applicant safety notice ──────────────────────────────────────── */}
      <aside className="mt-6 flex gap-3 rounded-2xl border border-[#f3d9a4] bg-[#fffaf0] p-5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#b7791f]" aria-hidden />
        <p className="text-sm leading-relaxed text-[#6b5424]">
          <strong className="font-semibold text-[#5a4415]">Important:</strong>{' '}
          {POSITION.notice}
        </p>
      </aside>
    </div>
  );
}

function RoleList({
  title,
  items,
  note,
}: {
  title: string;
  items: readonly string[];
  note?: string;
}) {
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
      {note && <p className="mt-4 text-sm leading-relaxed text-subtle">{note}</p>}
    </div>
  );
}
