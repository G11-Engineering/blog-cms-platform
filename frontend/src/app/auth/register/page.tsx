'use client';

import { useEffect, useState } from 'react';
import { Container, Stack, Title, Text, Card, Button, Box, Center, Paper, ThemeIcon, Alert, Timeline, List } from '@mantine/core';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconBookmark, IconInfoCircle, IconUserPlus, IconMail, IconLogin, IconPencil } from '@tabler/icons-react';
import { redirectToAsgardeoSelfRegister } from '@/utils/asgardeoHelpers';

export default function RegisterPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!autoRedirect) return;

    // Auto-redirect countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect when countdown reaches 0
      redirectToAsgardeoSelfRegister();
    }
  }, [countdown, autoRedirect]);

  const handleManualRedirect = () => {
    redirectToAsgardeoSelfRegister();
  };

  const handleCancelAutoRedirect = () => {
    setAutoRedirect(false);
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 50%, #cc7000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Container size={600} style={{ width: '100%' }}>
        <Stack gap="xl">
          {/* Branding Header */}
          <Center>
            <Stack align="center" gap="md">
              <ThemeIcon
                size={80}
                radius="xl"
                variant="filled"
                style={{
                  background: 'white',
                  color: '#3B82F6',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                }}
              >
                <IconBookmark size={40} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Title order={1} c="white" size="2.5rem" fw={700}>
                  Join WSO2 Blog
                </Title>
                <Text c="white" size="lg" opacity={0.9}>
                  Create your account via Asgardeo SSO
                </Text>
              </div>
            </Stack>
          </Center>

          {/* Registration Information */}
          <Paper
            shadow="xl"
            radius="xl"
            p="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Stack gap="lg">
              <div style={{ textAlign: 'center' }}>
                <Title order={2} c="dark" size="1.8rem" fw={600}>
                  Create Your Account
                </Title>
                <Text c="dimmed" size="md" mt="xs">
                  Secure registration powered by WSO2 Asgardeo
                </Text>
              </div>

              <Alert icon={<IconInfoCircle size={20} />} color="blue" variant="light">
                <Stack gap="xs">
                  <Text size="sm" fw={600}>
                    You'll be redirected to Asgardeo's login page
                  </Text>
                  <Text size="sm" c="dimmed">
                    Click the "Sign Up" or "Create Account" link on the Asgardeo login page to register
                  </Text>
                  {autoRedirect && (
                    <Text size="sm" c="dimmed">
                      Auto-redirecting in {countdown} seconds...
                    </Text>
                  )}
                </Stack>
              </Alert>

              <Timeline active={4} bulletSize={32} lineWidth={2} color="orange">
                <Timeline.Item
                  bullet={<IconUserPlus size={16} />}
                  title={<Text fw={600}>Step 1: Create Account</Text>}
                >
                  <Text size="sm" c="dimmed">
                    Fill in your details on Asgardeo's secure registration page
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  bullet={<IconMail size={16} />}
                  title={<Text fw={600}>Step 2: Verify Email</Text>}
                >
                  <Text size="sm" c="dimmed">
                    Check your email and click the verification link
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  bullet={<IconLogin size={16} />}
                  title={<Text fw={600}>Step 3: Login</Text>}
                >
                  <Text size="sm" c="dimmed">
                    Return to this platform and click "Login" to access your account
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  bullet={<IconPencil size={16} />}
                  title={<Text fw={600}>Step 4: Start Writing</Text>}
                >
                  <Text size="sm" c="dimmed">
                    You'll be assigned the "Author" role and can start creating posts immediately
                  </Text>
                </Timeline.Item>
              </Timeline>

              <Card withBorder padding="md" radius="md" style={{ background: '#FFF7ED' }}>
                <Text size="sm" fw={600} mb="xs">
                  What you can do as an Author:
                </Text>
                <List size="sm" spacing="xs" withPadding>
                  <List.Item>Create and publish blog posts</List.Item>
                  <List.Item>Upload and manage media files</List.Item>
                  <List.Item>Edit your own content</List.Item>
                  <List.Item>Respond to comments on your posts</List.Item>
                </List>
              </Card>

              <Stack gap="md">
                <Button
                  fullWidth
                  size="lg"
                  radius="md"
                  leftSection={<IconUserPlus size={20} />}
                  onClick={handleManualRedirect}
                  style={{
                    background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)',
                    border: 'none',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {autoRedirect ? 'Continue to Registration Now' : 'Go to Registration'}
                </Button>

                {autoRedirect && (
                  <Button
                    fullWidth
                    variant="subtle"
                    size="md"
                    onClick={handleCancelAutoRedirect}
                    c="dimmed"
                  >
                    Cancel Auto-Redirect
                  </Button>
                )}
              </Stack>

              <Center>
                <Text size="sm" c="dimmed">
                  Already have an account?{' '}
                  <Text
                    component={Link}
                    href="/"
                    size="sm"
                    c="orange"
                    fw={600}
                    style={{ textDecoration: 'none' }}
                  >
                    Sign In
                  </Text>
                </Text>
              </Center>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
