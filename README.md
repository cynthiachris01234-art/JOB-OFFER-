# Levy Real Estate — Careers

A standalone Next.js site for a single job posting and its application form.

- `/` — the job posting and application form
- `/apply` — `POST` endpoint that validates a submission, stores the resume in a
  private Supabase bucket and writes a `job_applications` row
- `/admin` — the applications view, behind HTTP Basic auth

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # → http://localhost:3000
```

## Configuration

Applications are only accepted when Supabase is configured. Without it the form
returns a clear "not available" message rather than accepting and discarding
someone's CV.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service-role key — **server only**, never prefix with `NEXT_PUBLIC_` |
| `CAREERS_RESUME_BUCKET` | no | Resume bucket name (default `job-applications`) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | for `/admin` | Basic-auth credentials; with either unset, `/admin` is refused |
| `NEXT_PUBLIC_SITE_URL` | no | Public URL, used for metadata |

### Database

Run `supabase/schema.sql` once in the Supabase SQL Editor. It creates:

- the `job_applications` table, with RLS enabled and **no** policies — only the
  service role can read it
- the private `job-applications` storage bucket, with a 5MB size limit and a
  PDF/Word MIME allowlist

## Editing the posting

All copy lives in `lib/data.ts` — company name, job title, summary,
responsibilities, requirements, the highlight strip, the time-zone options and
the resume rules. The page, the metadata and the apply route all read from it,
so changing a value there is enough.

## How a submission is validated

The form checks size and extension before uploading. The `/apply` route then
re-checks everything server-side: required fields and length caps, email shape,
phone digits, the time zone against the allowed list, the consent checkbox, and
the resume's extension, declared type and magic bytes (`%PDF`, zip, OLE2). The
file is stored with the content type derived from its extension, because
browsers commonly report `application/octet-stream` for Word documents.

If the row insert fails after the upload succeeds, the uploaded file is removed
so no orphans accumulate.

## Notes

- Resumes are served to `/admin` through 30-minute signed URLs; the bucket
  itself stays private.
- `/admin` and `/apply` are excluded in `robots.ts`.
- The logo is an inline SVG monogram in `components/BrandMark.tsx` — swap it for
  a real asset when you have one.
