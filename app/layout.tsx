import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { UserProvider } from '@/components/auth/UserProvider';
import { AuthModalProvider } from '@/components/auth/AuthModalContext';
import AuthModal from '@/components/auth/AuthModal';
import { ToastProvider } from '@/components/ui/toast-provider';
import { ProfileProvider } from '@/components/auth/ProfileContext';
import { NotificationsProvider } from '@/components/notifications/NotificationsContext';
import { SearchProvider } from '@/components/search/SearchContext';
import { UserModeProvider } from '@/components/profile/UserModeContext';
import { NavigationLoading } from "@/components/ui/navigation-loading";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BizList - Find Local Service Providers',
  description: 'Connect with top-rated local service providers for your projects and tasks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NavigationLoading />
        <ToastProvider>
          <UserProvider>
            <ProfileProvider>
              <NotificationsProvider>
                <UserModeProvider>
                  <AuthModalProvider>
                      <SearchProvider>
                        <ThemeProvider attribute="class" defaultTheme="light">
                          <Header />
                          <main className="min-h-screen" style={{ marginTop: '72px' }}>{children}</main>
                          <Footer />
                            <AuthModal />
                        </ThemeProvider>
                      </SearchProvider>
                  </AuthModalProvider>
                </UserModeProvider>
              </NotificationsProvider>
            </ProfileProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}