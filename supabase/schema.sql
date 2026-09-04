-- ─────────────────────────────────────────────────────────────────────────────
-- Levy Real Estate — Careers schema
-- Run this once in the Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── JOB APPLICATIONS ────────────────────────────────────────────────────────
-- Holds personal data (name, contact details, resume). RLS is enabled with no
-- policies, so only the service role — i.e. the /apply route — can read
-- or write it. Resumes live in the private `job-applications` storage bucket;
-- `resume_path` is the object path inside that bucket.

CREATE TABLE job_applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference   TEXT NOT NULL UNIQUE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  location    TEXT NOT NULL,
  timezone    TEXT NOT NULL,
  experience  TEXT,
  resume_path TEXT NOT NULL,
  resume_name TEXT NOT NULL,
  resume_size INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','reviewing','contacted','rejected','hired')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_job_applications_created ON job_applications(created_at DESC);
CREATE INDEX idx_job_applications_email   ON job_applications(email);

-- Private bucket for uploaded resumes (no public policies — service role only).
-- The size and MIME limits mirror RESUME_RULES in app/careers/data.ts, so the
-- bucket rejects anything oversized or non-PDF/Word even if it gets past the
-- /careers/apply route.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-applications',
  'job-applications',
  false,
  5242880,  -- 5MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- If the bucket already exists (created before these limits were added), apply
-- them with:
--
--   UPDATE storage.buckets
--      SET file_size_limit = 5242880,
--          allowed_mime_types = ARRAY[
--            'application/pdf',
--            'application/msword',
--            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
--          ]
--    WHERE id = 'job-applications';
