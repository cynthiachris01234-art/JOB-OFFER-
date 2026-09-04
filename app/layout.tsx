import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BrandMark } from '@/components/BrandMark';
import { COMPANY, POSITION } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Careers — ${COMPANY.name}`,
    template: `%s | ${COMPANY.name}`,
  },
  description: `${COMPANY.name} is hiring a ${POSITION.title} (${POSITION.workplace}).`,
  openGraph: {
    siteName: COMPANY.name,
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <BrandMark />
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              Careers
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 py-8 text-center">
            <BrandMark />
            <p className="text-xs text-subtle">
              © {COMPANY.copyrightYear} {COMPANY.name}. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
