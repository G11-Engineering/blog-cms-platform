'use client';

import { Inter } from 'next/font/google';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from 'react-query';
import ClientAuthProvider from '@/components/ClientAuthProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { theme } from '@/theme';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={theme}>
            <ModalsProvider>
              <ClientAuthProvider>
                <AuthProvider>
                  <Navigation />
                  <Notifications />
                  <div style={{ flex: 1 }}>
                    {children}
                  </div>
                  <Footer />
                </AuthProvider>
              </ClientAuthProvider>
            </ModalsProvider>
          </MantineProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
