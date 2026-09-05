// ─── Careers content ──────────────────────────────────────────────────────────
// Single source of truth for the careers page. Edit the values here to change
// the posting — the page, its metadata and the application form all read from
// it, so nothing needs touching in the layout.

export const COMPANY = {
  name: 'Levy Real Estate',
  shortName: 'Levy',
  copyrightYear: 2026,
} as const;

export const POSITION = {
  title: 'Remote Property Data Entry Assistant — USA',
  department: 'Property Operations',
  employmentType: 'Full-time / Part-time',
  workplace: 'United States — Remote',

  aboutHeading: 'About the role',
  summary:
    'Levy Real Estate is seeking a detail-oriented individual to support our ' +
    'property operations team with the accurate entry and maintenance of property ' +
    'information across our digital systems.',

  /** Rendered as the highlight strip under the job title. */
  highlights: [
    { label: 'Training', value: 'Provided' },
    { label: 'Paid Training', value: '$40 per hour', emphasis: true },
    { label: 'Experience', value: 'Entry level welcome' },
  ],

  responsibilities: [
    'Enter property information into company databases',
    'Update listing details, prices and availability',
    'Upload and organize property photographs and descriptions',
    'Review records for accuracy and completeness',
    'Maintain spreadsheets and digital property records',
    'Follow established data-entry and quality-control procedures',
    'Communicate with the property operations team regarding listing updates',
  ],

  requirements: [
    'Strong attention to detail',
    'Basic computer skills',
    'Comfortable working with spreadsheets and online systems',
    'Good written communication',
    'Reliable internet connection',
    'Ability to work independently in a remote environment',
  ],
  requirementsNote:
    'Previous real-estate or data-entry experience is helpful but not essential.',

  provided: {
    heading: 'What we provide',
    paragraphs: [
      'Successful candidates will receive the systems, software and equipment ' +
        'required for the role, where applicable. Company-provided equipment will be ' +
        'supplied through Levy Real Estate’s established onboarding process.',
      'Training and onboarding will be provided before the employee begins ' +
        'independent work.',
    ],
  },

  compensation: {
    heading: 'Compensation & Training',
    payLabel: 'Paid Training',
    payValue: '$40 per hour',
    paragraphs: [
      'Selected candidates will receive paid training as part of the onboarding ' +
        'process. The company will provide the equipment and systems required for the ' +
        'position through its standard employee onboarding process.',
    ],
  },

  equipment: {
    heading: 'Equipment Provided',
    intro: 'Where required for the position, company equipment may include:',
    items: [
      'Company laptop',
      'External monitor',
      'Professional headset',
      'Keyboard and mouse',
      'Webcam',
      'Required software and systems',
      'Security/authentication equipment',
      'Other necessary work accessories',
    ],
    notes: [
      'Equipment will be provided through the company’s established delivery and ' +
        'onboarding process.',
      'No payment is required to apply for or participate in the training.',
    ],
  },

  application: {
    heading: 'Application',
    intro: 'Interested candidates should submit:',
    items: [
      'Full name',
      'Email address',
      'Phone number',
      'Current U.S. location',
      'CV/resume',
      'Relevant experience',
    ],
  },

  /** Fed to the JobPosting structured data. Update when the ad is refreshed. */
  postedDate: '2026-09-05',

  notice:
    'Levy Real Estate does not require applicants to pay a fee to apply for ' +
    'employment. Applicants should verify recruitment communications through the ' +
    'company’s official contact channels.',
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
