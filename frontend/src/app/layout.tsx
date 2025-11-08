'use client';

import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { theme } from '@/theme';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const inter = Inter({ subsets: ['latin'] });

// Dynamically import ClientAuthProvider to avoid SSR issues with Asgardeo
const ClientAuthProvider = dynamic(
  () => import('@/components/ClientAuthProvider'),
  { ssr: false, loading: () => <div>Loading...</div> }
);

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
