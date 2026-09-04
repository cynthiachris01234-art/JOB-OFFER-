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
| `NEXT_PUBLIC_SUPABASE_URL` *or* `SUPABASE_URL` | yes | Supabase project URL. Either name is accepted — it is only read on the server, so the `NEXT_PUBLIC_` prefix isn't required. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service-role key — **server only**, never prefix with `NEXT_PUBLIC_` |
| `CAREERS_RESUME_BUCKET` | no | Resume bucket name (default `job-applications`) |
| `WHATSAPP_NUMBER` / `CALLMEBOT_API_KEY` | for WhatsApp | Notify this number of each new application |
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

## WhatsApp notifications

Each stored application triggers a WhatsApp message with the applicant's name,
contact details, location, time zone, resume filename, a trimmed extract of
their experience, and a link to `/admin` to download the CV.

Delivery goes through [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/):
message **+34 644 51 95 23** on WhatsApp with *"I allow callmebot to send me
messages"*, and it replies with the API key for `CALLMEBOT_API_KEY`. Put your
own number in `WHATSAPP_NUMBER` in international format.

Two things worth knowing:

- **Notifying never blocks a submission.** The applicant's data is stored first;
  if WhatsApp is unreachable the failure is logged, the request still succeeds,
  and the application is waiting in `/admin`. Treat WhatsApp as an alert, not as
  the system of record.
- **The message passes through CallMeBot's servers,** so the applicant's contact
  details reach a third party. The resume itself never leaves Supabase — only a
  link does. To avoid the relay entirely you would need the official WhatsApp
  Cloud API or Twilio, both of which require an approved message template for
  business-initiated messages.

## Notes

- Resumes are served to `/admin` through 30-minute signed URLs; the bucket
  itself stays private.
- `/admin` and `/apply` are excluded in `robots.ts`.
- The logo is an inline SVG monogram in `components/BrandMark.tsx` — swap it for
  a real asset when you have one.
