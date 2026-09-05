import { COMPANY, POSITION } from '@/lib/data';
import { siteUrl } from '@/lib/site';

/** schema.org JobPosting, so job search engines can read the ad rather than
 *  guessing at it. Only facts already on the page go in here. */
export function JobPostingSchema() {
  const base = siteUrl();

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: POSITION.title,
    description: [
      POSITION.summary,
      `Responsibilities: ${POSITION.responsibilities.join('; ')}.`,
      `Requirements: ${POSITION.requirements.join('; ')}. ${POSITION.requirementsNote}`,
    ].join(' '),
    datePosted: POSITION.postedDate,
    employmentType: ['FULL_TIME', 'PART_TIME'],
    hiringOrganization: {
      '@type': 'Organization',
      name: COMPANY.name,
      ...(base ? { sameAs: base } : {}),
    },
    // Remote roles describe where the applicant may live, not an office.
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: { '@type': 'Country', name: 'USA' },
    industry: 'Real Estate',
    occupationalCategory: POSITION.department,
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: { '@type': 'QuantitativeValue', value: 40, unitText: 'HOUR' },
    },
    ...(base ? { url: base } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // The object is built here from our own constants — no external input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
