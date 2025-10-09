'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Stack, Title, TextInput, Textarea, Select, MultiSelect, Button, Group, Card, Text, Switch } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { useCreatePost } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/contexts/AuthContext';

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const createPost = useCreatePost();
  const { data: categories } = useCategories({ limit: 100 });
  const { data: tags } = useTags({ limit: 100 });
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  const form = useForm({
    initialValues: {
      title: '',
      content: '',
      excerpt: '',
      featuredImageUrl: '',
      metaTitle: '',
      metaDescription: '',
      categories: [] as string[],
      tags: [] as string[],
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      content: (value) => (!value || value.trim() === '<p></p>' ? 'Content is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const postData = {
        ...values,
        scheduledAt: isScheduled ? scheduledAt?.toISOString() : undefined,
      };

      await createPost.mutateAsync(postData);
      router.push('/posts');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Container size="md" py="xl">
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <Title order={2}>Login Required</Title>
            <Text c="dimmed" ta="center">
              You need to be logged in to create posts. Please log in with your account or use the demo credentials below.
            </Text>
            <Group>
              <Button component="a" href="/auth/login" variant="filled" size="lg">
                Login Now
              </Button>
              <Button component="a" href="/auth/register" variant="outline" size="lg">
                Sign Up
              </Button>
            </Group>
            <Card withBorder p="md" bg="blue.0" style={{ width: '100%' }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} ta="center">Quick Demo Access</Text>
                <Text size="xs" c="dimmed" ta="center">
                  Email: admin@cms.com<br/>
                  Password: admin123
                </Text>
                <Button 
                  size="sm" 
                  variant="light" 
                  fullWidth
                  onClick={() => window.location.href = '/auth/login'}
                >
                  Use Demo Credentials
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Create New Post</Title>
          <Text c="dimmed">Write and publish your content</Text>
        </div>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Card withBorder p="md">
              <Stack gap="md">
                <TextInput
                  label="Title"
                  placeholder="Enter post title"
                  required
                  {...form.getInputProps('title')}
                />

                <Textarea
                  label="Excerpt"
                  placeholder="Brief description of the post"
                  rows={3}
                  {...form.getInputProps('excerpt')}
                />

                <Group grow>
                  <TextInput
                    label="Featured Image URL"
                    placeholder="https://example.com/image.jpg"
                    {...form.getInputProps('featuredImageUrl')}
                  />
                  
                  {form.values.featuredImageUrl && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">Preview:</Text>
                      <img
                        src={form.values.featuredImageUrl}
                        alt="Featured image preview"
                        style={{
                          width: '100%',
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </Group>

                <Group grow>
                  <TextInput
                    label="Meta Title"
                    placeholder="SEO title"
                    {...form.getInputProps('metaTitle')}
                  />
                  
                  <Textarea
                    label="Meta Description"
                    placeholder="SEO description"
                    rows={2}
                    {...form.getInputProps('metaDescription')}
                  />
                </Group>

                <Group grow>
                  <MultiSelect
                    label="Categories"
                    placeholder="Select categories"
                    data={categories?.categories?.map((cat: any) => ({
                      value: cat.id,
                      label: cat.name,
                    })) || []}
                    {...form.getInputProps('categories')}
                  />

                  <MultiSelect
                    label="Tags"
                    placeholder="Select tags"
                    data={tags?.tags?.map((tag: any) => ({
                      value: tag.id,
                      label: tag.name,
                    })) || []}
                    {...form.getInputProps('tags')}
                  />
                </Group>
              </Stack>
            </Card>

            <Card withBorder p="md">
              <Stack gap="md">
                <div>
                  <Text fw={500} mb="xs">Content</Text>
                  <TipTapEditor
                    content={form.values.content}
                    onChange={(content) => form.setFieldValue('content', content)}
                    placeholder="Write your post content here..."
                  />
                </div>
              </Stack>
            </Card>

            <Card withBorder p="md">
              <Stack gap="md">
                <Switch
                  label="Schedule Post"
                  description="Publish this post at a specific time"
                  checked={isScheduled}
                  onChange={(event) => setIsScheduled(event.currentTarget.checked)}
                />

                {isScheduled && (
                  <DateTimePicker
                    label="Publish Date & Time"
                    placeholder="Select date and time"
                    value={scheduledAt}
                    onChange={setScheduledAt}
                    minDate={new Date()}
                  />
                )}
              </Stack>
            </Card>

            <Group justify="flex-end" gap="md">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={createPost.isLoading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                loading={createPost.isLoading}
                disabled={!form.isValid()}
              >
                {isScheduled ? 'Schedule Post' : 'Create Post'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
