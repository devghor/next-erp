import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Point of Sale',
  description: 'Cashier point-of-sale screen',
  robots: {
    index: false,
    follow: false
  }
};

/**
 * Full-screen POS shell — deliberately skips `AppSidebar`/`Header`/`KBar`/
 * `InfobarProvider` from `app/dashboard/layout.tsx`; the cashier screen is a
 * top-level route with its own chrome, not nested in the dashboard shell.
 *
 * No `QueryClientProvider`/`SessionProvider`/`Toaster` here — those are
 * already mounted once, app-wide, by the root `app/layout.tsx` (via
 * `components/layout/providers.tsx`); mounting a second `Toaster` would
 * double-render every toast.
 */
export default function PosLayout({ children }: { children: React.ReactNode }) {
  return <div className='bg-background flex h-dvh w-full flex-col overflow-hidden'>{children}</div>;
}
