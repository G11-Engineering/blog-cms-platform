'use client';

import { useEffect } from 'react';
import { Box, Center, Loader, Text, Stack } from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconShield } from '@tabler/icons-react';

export default function LoginPage() {
  const { asgardeoSignIn, isAuthenticated } = useAuth();
  const router = useRouter();

  // Auto-redirect to Asgardeo login on page load
  useEffect(() => {
    const initiateLogin = async () => {
      // If already authenticated, redirect to home
      if (isAuthenticated) {
        router.push('/');
        return;
      }

      // Otherwise, trigger Asgardeo sign-in
      try {
        console.log('🔐 Redirecting to Asgardeo sign-in...');
        await asgardeoSignIn();
      } catch (error) {
        console.error('❌ Sign-in error:', error);
        // Error notification is already handled in AuthContext
      }
    };

    initiateLogin();
  }, [asgardeoSignIn, isAuthenticated, router]);

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 50%, #cc7000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Center>
        <Stack align="center" gap="lg">
          <IconShield size={64} color="white" />
          <Text c="white" size="xl" fw={600}>
            Redirecting to Asgardeo...
          </Text>
          <Loader color="white" size="lg" />
          <Text c="white" size="sm" opacity={0.8}>
            You will be redirected to secure login
          </Text>
        </Stack>
      </Center>
    </Box>
  );
}
