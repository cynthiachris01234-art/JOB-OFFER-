'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

type Result = {
  ok: boolean;
  reason?: string | null;
  detail?: string | null;
  status?: number | null;
  body?: string | null;
};

export function WhatsAppTest() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function send() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin-whatsapp-test', { method: 'POST' });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, detail: 'Could not reach the server.' });
    }
    setBusy(false);
  }

  return (
    <section className="panel mt-6 p-5">
      <h2 className="text-sm font-semibold text-ink-strong">WhatsApp</h2>
      <p className="mt-1 text-sm text-body">
        Sends a test message to the configured number and shows exactly what the relay
        replies — including the reasons it gives for refusing.
      </p>

      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-deep px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d3a5c] disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {busy ? 'Sending…' : 'Send test message'}
      </button>

      {result && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            result.ok
              ? 'border-[#bfe6cf] bg-[#f2fbf6] text-[#0a5c3a]'
              : 'border-[#f2c6c6] bg-[#fdf3f3] text-[#9b2c2c]'
          }`}
        >
          <p className="font-semibold">
            {result.ok ? 'Accepted by the relay — check your phone' : 'The relay refused it'}
          </p>
          {result.detail && <p className="mt-1 font-mono text-xs">{result.detail}</p>}
          {result.status != null && (
            <p className="mt-1 font-mono text-xs">HTTP {result.status}</p>
          )}
          {result.body && (
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs opacity-90">
              {result.body}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
