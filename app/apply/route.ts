import { NextResponse } from 'next/server';
import { RESUME_CONTENT_TYPES, RESUME_RULES, TIME_ZONES, type ResumeExtension } from '@/lib/data';
import { notifyNewApplication } from '@/lib/notify';
import { resumeBucket, serviceClient, storageConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
}

/** Cheap magic-byte check so a renamed file can't ride in on its extension.
 *  PDFs start with "%PDF"; .docx is a zip ("PK\x03\x04") and legacy .doc is an
 *  OLE2 compound file. */
function looksLikeResume(bytes: Buffer, extension: ResumeExtension): boolean {
  if (bytes.length < 8) return false;
  const header = bytes.subarray(0, 8);
  if (extension === '.pdf') return header.subarray(0, 4).toString('latin1') === '%PDF';
  const zip  = header.subarray(0, 4).toString('hex') === '504b0304';
  const ole2 = header.toString('hex') === 'd0cf11e0a1b11ae1';
  return zip || ole2;
}

// POST /apply — receive a job application (multipart/form-data)
export async function POST(req: Request) {
  if (!storageConfigured()) {
    return bad(
      'Online applications are not available right now. Please contact us through ' +
        'our official channels to apply.',
      503,
    );
  }

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return bad('We could not read your application. Please try again.');
  }

  const firstName  = field(data, 'firstName');
  const lastName   = field(data, 'lastName');
  const email      = field(data, 'email');
  const phone      = field(data, 'phone');
  const location   = field(data, 'location');
  const timezone   = field(data, 'timezone');
  const experience = field(data, 'experience');
  const consent    = field(data, 'consent');

  if (!firstName || !lastName)     return bad('Please provide your first and last name.');
  if (firstName.length > 80 || lastName.length > 80) return bad('Name fields are too long.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    return bad('Please provide a valid email address.');
  }
  if ((phone.match(/\d/g) ?? []).length < 7 || phone.length > 40) {
    return bad('Please provide a valid phone number.');
  }
  if (!location || location.length > 120) return bad('Please provide your current city and state.');
  if (!(TIME_ZONES as readonly string[]).includes(timezone)) {
    return bad('Please select your time zone.');
  }
  if (experience.length > 4000) return bad('Please shorten your experience summary.');
  if (!consent) return bad('Please confirm that the information provided is accurate.');

  const resume = data.get('resume');
  if (!(resume instanceof File) || resume.size === 0) {
    return bad('Please attach your resume or CV.');
  }
  if (resume.size > RESUME_RULES.maxBytes) {
    return bad(
      `Your resume is larger than ${Math.round(RESUME_RULES.maxBytes / 1024 / 1024)}MB.`,
    );
  }
  const lowerName = resume.name.toLowerCase();
  const extension = RESUME_RULES.extensions.find(ext => lowerName.endsWith(ext));
  // A browser that reports nothing useful (empty or octet-stream, common for
  // Word files) is fine — the extension and the file's own header decide.
  const declaredTypeOk =
    !resume.type ||
    resume.type === 'application/octet-stream' ||
    RESUME_RULES.mimeTypes.includes(resume.type);
  if (!extension || !declaredTypeOk) {
    return bad(`Resumes must be one of: ${RESUME_RULES.extensions.join(', ')}.`);
  }

  const bytes = Buffer.from(await resume.arrayBuffer());
  if (!looksLikeResume(bytes, extension)) {
    return bad('That file does not look like a PDF or Word document.');
  }

  const reference = `APP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  try {
    const supabase = serviceClient();

    const path = `${reference}/${safeFileName(resume.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(resumeBucket())
      .upload(path, bytes, {
        contentType: RESUME_CONTENT_TYPES[extension],
        upsert: false,
      });

    if (uploadError) {
      console.error('Resume upload error:', uploadError);
      return bad('We could not store your resume. Please try again in a moment.', 502);
    }

    const { error: insertError } = await supabase.from('job_applications').insert({
      reference,
      first_name:  firstName,
      last_name:   lastName,
      email,
      phone,
      location,
      timezone,
      experience:  experience || null,
      resume_path: path,
      resume_name: resume.name,
      resume_size: resume.size,
    });

    if (insertError) {
      // Don't leave an orphaned file behind if the row could not be written.
      await supabase.storage.from(resumeBucket()).remove([path]).catch(() => {});
      console.error('Application insert error:', insertError);
      return bad('We could not save your application. Please try again in a moment.', 502);
    }

    // The application is safely stored by this point. Notifying is best-effort
    // and never throws: a WhatsApp failure must not tell an applicant their
    // submission failed.
    await notifyNewApplication({
      reference,
      firstName,
      lastName,
      email,
      phone,
      location,
      timezone,
      experience: experience || null,
      resumeName: resume.name,
    });

    return NextResponse.json({ ok: true, reference });
  } catch (err) {
    console.error('Application submission error:', err);
    return bad('Something went wrong submitting your application. Please try again.', 500);
  }
}
