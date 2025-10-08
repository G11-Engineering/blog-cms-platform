'use client';

import { useState } from 'react';
import { Container, Stack, Title, Button, Text, Card, Group } from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';

export default function TestPage() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      await login('test@example.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Title order={1}>Test Page</Title>
        
        <Card withBorder p="md">
          <Stack gap="md">
            <Text fw={500}>Authentication Status:</Text>
            <Text>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
            {user && (
              <div>
                <Text>User: {user.firstName} {user.lastName}</Text>
                <Text>Email: {user.email}</Text>
                <Text>Role: {user.role}</Text>
              </div>
            )}
            
            <Group>
              {!isAuthenticated ? (
                <Button onClick={handleTestLogin} loading={loading}>
                  Test Login
                </Button>
              ) : (
                <Button onClick={logout} color="red">
                  Logout
                </Button>
              )}
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
