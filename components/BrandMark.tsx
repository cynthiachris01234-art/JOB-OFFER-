import { COMPANY } from '@/lib/data';

// Inline monogram so the careers pages don't depend on a binary logo asset.
export function BrandMark({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const fg = tone === 'light' ? '#ffffff' : '#0f2a43';
  const bg = tone === 'light' ? 'rgba(255,255,255,0.12)' : '#e8eef5';

  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" fill="none" aria-hidden>
        <rect width="40" height="40" rx="9" fill={bg} />
        <path d="M11 27.5V12.5h3.4v12.1h7.1v2.9H11Z" fill={fg} />
        <path d="M24.2 12.5h4.3l-3.6 7.4 3.8 7.6h-4.4l-3.6-7.6 3.5-7.4Z" fill={fg} opacity="0.55" />
      </svg>
      <span
        className="text-[15px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: tone === 'light' ? '#ffffff' : '#0f2a43' }}
      >
        {COMPANY.name}
      </span>
    </span>
  );
}
