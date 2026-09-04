import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Project URL. Only ever read on the server, so the NEXT_PUBLIC_ prefix is not
 *  required — `SUPABASE_URL` works too, and reads less alarming in a dashboard
 *  than a name that implies the value is shipped to browsers. */
export function supabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ''
  ).trim();
}

export function serviceRoleKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
}

export function resumeBucket(): string {
  return (process.env.CAREERS_RESUME_BUCKET ?? 'job-applications').trim();
}

/** Applications carry personal data, so we never accept them unless there is a
 *  configured place to put them — a silent drop would lose someone's CV. */
export function storageConfigured(): boolean {
  const key = serviceRoleKey();
  return Boolean(supabaseUrl() && key && !key.includes('placeholder'));
}

export function serviceClient(): SupabaseClient {
  return createClient(supabaseUrl(), serviceRoleKey(), {
    auth: { persistSession: false },
  });
}
