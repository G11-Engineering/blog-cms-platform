'use client';

import { useState, useEffect } from 'react';
import { Container, Stack, Title, Text, Button, Card, Group } from '@mantine/core';

export default function DebugPage() {
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3002/api/posts?status=published');
      const data = await response.json();
      console.log('Direct API call result:', data);
      setPosts(data);
    } catch (err) {
      console.error('Direct API call error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Title order={1}>Debug Page</Title>
        <Text>Testing direct API connection to content service</Text>
        
        <Button onClick={fetchPosts} loading={loading}>
          Fetch Posts
        </Button>

        {error && (
          <Card withBorder p="md" style={{ backgroundColor: '#ffebee' }}>
            <Text c="red">Error: {error}</Text>
          </Card>
        )}

        {posts && (
          <Card withBorder p="md">
            <Title order={3}>API Response:</Title>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(posts, null, 2)}
            </pre>
          </Card>
        )}

        {loading && <Text>Loading...</Text>}
      </Stack>
    </Container>
  );
}