'use client';

import { useState } from 'react';
import { Container, Stack, Title, Text, Card, TextInput, PasswordInput, Button, Group, Anchor, Divider, Box, Center, Paper, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconBookmark, IconUserPlus } from '@tabler/icons-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) => (value !== values.password ? 'Passwords do not match' : null),
      firstName: (value) => (!value ? 'First name is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await register({
        email: values.email,
        username: values.username,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      router.push('/');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
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
              <ThemeIcon
                size={80}
                radius="xl"
                color="blue"
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
                  Start sharing your WSO2 stories
                </Text>
              </div>
            </Stack>
          </Center>

          {/* Registration Form */}
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
                  Create Account
                </Title>
                <Text c="dimmed" size="md" mt="xs">
                  Join the WSO2 community of writers and readers
                </Text>
              </div>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <Group grow>
                    <TextInput
                      label="First Name"
                      placeholder="John"
                      required
                      size="md"
                      radius="md"
                      {...form.getInputProps('firstName')}
                      styles={{
                        label: { color: '#1F2937', fontWeight: 600 },
                      }}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      required
                      size="md"
                      radius="md"
                      {...form.getInputProps('lastName')}
                      styles={{
                        label: { color: '#1F2937', fontWeight: 600 },
                      }}
                    />
                  </Group>

                  <TextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    required
                    size="md"
                    radius="md"
                    {...form.getInputProps('email')}
                    styles={{
                      label: { color: '#1F2937', fontWeight: 600 },
                    }}
                  />

                  <TextInput
                    label="Username"
                    placeholder="johndoe"
                    required
                    size="md"
                    radius="md"
                    {...form.getInputProps('username')}
                    styles={{
                      label: { color: '#1F2937', fontWeight: 600 },
                    }}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Create a strong password"
                    required
                    size="md"
                    radius="md"
                    {...form.getInputProps('password')}
                    styles={{
                      label: { color: '#1F2937', fontWeight: 600 },
                    }}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    required
                    size="md"
                    radius="md"
                    {...form.getInputProps('confirmPassword')}
                    styles={{
                      label: { color: '#1F2937', fontWeight: 600 },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    radius="md"
                    loading={loading}
                    disabled={!form.isValid()}
                    leftSection={<IconUserPlus size={20} />}
                    style={{
                      background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)', // Softer orange
                      border: 'none',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Stack>
              </form>

              <Divider my="md" />

              <Group justify="center">
                <Text size="sm" c="dimmed">
                  Already have an account?{' '}
                    <Anchor 
                      component={Link} 
                      href="/auth/login" 
                      size="sm"
                      c="wso2-orange.6"
                      fw={600}
                    >
                      Sign In
                    </Anchor>
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}