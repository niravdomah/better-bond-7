import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/toast/ToastContainer';
import { SessionProvider } from '@/components/auth/session-provider';
import { auth } from '@/lib/auth/auth';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'BetterBond Commission Payments',
  description:
    'BetterBond Commission Payments POC — manage commission payments across the agency network',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider session={session}>
          <ThemeProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
              <ToastContainer />
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
