'use client';

import { useState } from 'react';
import { Container, Stack, Title, Text, Card, TextInput, PasswordInput, Button, Group, Anchor, Divider, Alert, ActionIcon, Box, Center, Paper, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconInfoCircle, IconEye, IconEyeOff, IconBookmark, IconShield, IconRocket, IconMail, IconLock, IconUser, IconLogin, IconSparkles } from '@tabler/icons-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      router.push('/');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
        form.setValues({
          email: 'admin@wso2.com',
          password: 'admin123'
        });
    setShowDemo(false);
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 50%, #cc7000 100%)', // Softer WSO2 Orange gradient
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Container size={480} style={{ width: '100%' }}>
        <Stack gap="xl">
          {/* Branding Header */}
          <Center>
            <Stack align="center" gap="md">
              <Group gap="xs" justify="center">
                <ThemeIcon
                  size={80}
                  radius="xl"
                  color="wso2-orange"
                  variant="filled"
                  style={{
                    background: 'white',
                    color: '#ff8c00',
                    boxShadow: '0 8px 32px rgba(255, 140, 0, 0.4)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <IconBookmark size={40} />
                </ThemeIcon>
                <ThemeIcon
                  size={60}
                  radius="lg"
                  variant="light"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <IconSparkles size={30} />
                </ThemeIcon>
              </Group>
              <div style={{ textAlign: 'center' }}>
                <Title order={1} c="white" size="2.5rem" fw={700} style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' }}>
                  WSO2 Blog Platform
                </Title>
                <Text c="white" size="lg" opacity={0.95} fw={500} mt="xs">
                  Welcome Back to WSO2 Community
                </Text>
              </div>
            </Stack>
          </Center>

          {/* Login Form */}
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
                <Group justify="center" gap="xs" mb="sm">
                  <IconUser size={24} color="#ff8c00" />
                  <Title order={2} c="dark" size="1.8rem" fw={600}>
                    Sign In
                  </Title>
                </Group>
                <Text c="dimmed" size="md" mt="xs">
                  Access your account to start writing
                </Text>
              </div>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email"
                    required
                    size="md"
                    radius="md"
                    leftSection={<IconMail size={18} />}
                    {...form.getInputProps('email')}
                    styles={{
                      label: { color: '#1F2937', fontWeight: 600 },
                      input: { 
                        border: '2px solid #E5E7EB',
                        transition: 'all 0.2s',
                      },
                    }}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    required
                    size="md"
                    radius="md"
                    leftSection={<IconLock size={18} />}
                    {...form.getInputProps('password')}
                    styles={{
                      label: { color: '#1F2937', fontWeight: 600 },
                      input: { 
                        border: '2px solid #E5E7EB',
                        transition: 'all 0.2s',
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    radius="md"
                    loading={loading}
                    disabled={!form.isValid()}
                    leftSection={!loading && <IconLogin size={20} />}
                    style={{
                      background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)',
                      border: 'none',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 15px rgba(255, 140, 0, 0.3)',
                      transition: 'all 0.3s',
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(255, 140, 0, 0.4)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Stack>
              </form>

              <Divider my="md" />

              <Group justify="center">
                  <Text size="sm" c="dimmed">
                    Don't have an account?{' '}
                    <Anchor 
                      component={Link} 
                      href="/auth/register" 
                      size="sm"
                      c="wso2-orange.6"
                      fw={600}
                    >
                      Create Account
                    </Anchor>
                  </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Demo Credentials */}
          <Paper
            shadow="lg"
            radius="lg"
            p="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <ThemeIcon size="sm" color="white" variant="transparent">
                  <IconShield size={16} />
                </ThemeIcon>
                <Text size="sm" fw={600} c="white">
                  Demo Access
                </Text>
              </Group>
              <ActionIcon
                variant="transparent"
                color="white"
                onClick={() => setShowDemo(!showDemo)}
                size="sm"
              >
                {showDemo ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </ActionIcon>
            </Group>
            
            {showDemo && (
              <Stack gap="sm">
                <Box
                  p="sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Text size="xs" c="white" opacity={0.9}>
                    <strong>Email:</strong> admin@wso2.com<br />
                    <strong>Password:</strong> admin123
                  </Text>
                </Box>
                <Button
                  size="sm"
                  variant="white"
                  color="wso2-orange"
                  onClick={fillDemoCredentials}
                  fullWidth
                  radius="md"
                  leftSection={<IconRocket size={16} />}
                  style={{ fontWeight: 600 }}
                >
                  Use Demo Credentials
                </Button>
              </Stack>
            )}
          </Paper>

          {/* Info Alert */}
          <Alert 
            icon={<IconInfoCircle size={20} />} 
            color="blue" 
            variant="light"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Text size="sm" c="dark">
              <strong>New to our blog platform?</strong> Use the demo credentials above to explore all features, or create a new account to start sharing your stories with our community.
            </Text>
          </Alert>
        </Stack>
      </Container>
    </Box>
  );
}