// ─── Careers content ──────────────────────────────────────────────────────────
// Single source of truth for the /careers page. Edit the values here to change
// the posting — the page, the JSON-LD and the application form all read from it.

export const COMPANY = {
  name: 'Levy Real Estate',
  shortName: 'Levy',
  copyrightYear: 2026,
} as const;

export const POSITION = {
  title: 'Client Services Associate',
  department: 'Client Services',
  employmentType: 'Full-time',
  workplace: 'Remote (United States)',
  summary:
    'Support our client services team with scheduling, listing coordination and ' +
    'day-to-day communication with buyers, sellers and agents. Training is provided, ' +
    'so this is a good fit for someone organised and personable who is early in their career.',
  responsibilities: [
    'Respond to client enquiries by email and phone during your scheduled hours.',
    'Coordinate viewings, follow-ups and calendar updates for the agent team.',
    'Keep listing details, documents and contact records accurate and up to date.',
    'Prepare simple weekly summaries of open enquiries and their status.',
  ],
  requirements: [
    'Reliable internet connection and a quiet place to work during your shift.',
    'Clear written and spoken English.',
    'Comfortable with email, spreadsheets and a shared calendar.',
    'No prior real estate experience required — training is provided.',
  ],
  /** Rendered as the highlight strip under the job title. */
  highlights: [
    { label: 'Training', value: 'Paid Training' },
    { label: 'Pay Rate', value: '$40 / Hour', emphasis: true },
    { label: 'Experience', value: 'Entry level welcome' },
  ],
} as const;

/** Time-zone options offered in the application form. */
export const TIME_ZONES = [
  'Eastern Time',
  'Central Time',
  'Mountain Time',
  'Pacific Time',
  'Alaska Time',
  'Hawaii-Aleutian Time',
] as const;

/** Canonical content type per accepted extension. Browsers are unreliable about
 *  the type they report for Word uploads (often `application/octet-stream`), so
 *  the extension — not the browser — decides what we store the file as. */
export const RESUME_CONTENT_TYPES = {
  '.pdf':  'application/pdf',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

export type ResumeExtension = keyof typeof RESUME_CONTENT_TYPES;

export const RESUME_RULES = {
  maxBytes: 5 * 1024 * 1024,
  extensions: Object.keys(RESUME_CONTENT_TYPES) as ResumeExtension[],
  mimeTypes: Object.values(RESUME_CONTENT_TYPES) as string[],
};
