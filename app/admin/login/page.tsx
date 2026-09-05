'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, Lock } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/admin';

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: String(data.get('username') ?? ''),
          password: String(data.get('password') ?? ''),
        }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.ok) {
        setError(payload?.error ?? 'Could not sign in. Please try again.');
        setBusy(false);
        return;
      }

      // The cookie is set; a refresh lets the middleware see it.
      router.replace(from.startsWith('/admin') ? from : '/admin');
      router.refresh();
    } catch {
      setError('Network error — please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-16">
      <div className="panel p-6 md:p-8">
        <div className="flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-faint" aria-hidden />
          <h1 className="text-lg font-semibold tracking-tight text-ink-strong">Sign in</h1>
        </div>
        <p className="mt-1.5 text-sm text-subtle">
          Applications contain personal data, so this area is restricted.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#33455c]" htmlFor="username">
              Username
            </label>
            <input
              className="field"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#33455c]" htmlFor="password">
              Password
            </label>
            <input
              className="field"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-[#f2c6c6] bg-[#fdf3f3] px-4 py-3 text-sm text-[#9b2c2c]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-deep px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#1d3a5c] focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// useSearchParams needs a Suspense boundary, or the build fails prerendering.
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
