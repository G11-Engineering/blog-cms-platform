'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Stack, Title, TextInput, Textarea, Select, MultiSelect, Button, Group, Card, Text, Switch, Grid, Divider } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { MediaSelector } from '@/components/MediaSelector';
import { useCreatePost } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/contexts/AuthContext';
import { useDisclosure } from '@mantine/hooks';
import { IconPhoto, IconX } from '@tabler/icons-react';
import { Image } from '@mantine/core';

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated, asgardeoSignIn } = useAuth();
  const createPost = useCreatePost();
  const { data: categories } = useCategories({ limit: 100 });
  const { data: tags } = useTags({ limit: 100 });
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [mediaSelectorOpened, { open: openMediaSelector, close: closeMediaSelector }] = useDisclosure(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !isAuthenticated) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Only auto-save if there's actual content
    if (form.values.title || form.values.content) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        // Auto-save to localStorage as draft
        const draftData = {
          ...form.values,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('post-draft', JSON.stringify(draftData));
        notifications.show({
          title: 'Auto-saved',
          message: 'Draft saved locally',
          color: 'blue',
          autoClose: 2000,
        });
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form.values, autoSaveEnabled, isAuthenticated]);

  // Load draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('post-draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          // Ask user if they want to restore
          if (confirm('Found a saved draft. Would you like to restore it?')) {
            form.setValues({
              title: draft.title || '',
              content: draft.content || '',
              excerpt: draft.excerpt || '',
              featuredImageUrl: draft.featuredImageUrl || '',
              metaTitle: draft.metaTitle || '',
              metaDescription: draft.metaDescription || '',
              categories: draft.categories || [],
              tags: draft.tags || [],
            });
            // Clear the draft after restoring
            localStorage.removeItem('post-draft');
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    if (!isAuthenticated) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to create a post',
        color: 'red',
      });
      return;
    }

    try {
      // Clear draft on successful publish
      if (typeof window !== 'undefined') {
        localStorage.removeItem('post-draft');
      }

      const postData = {
        ...values,
        status: (isScheduled ? 'scheduled' : 'published') as 'published' | 'scheduled',
        scheduledAt: isScheduled ? scheduledAt?.toISOString() : undefined,
      };

      const result = await createPost.mutateAsync(postData);
      
      notifications.show({
        title: 'Success!',
        message: isScheduled ? 'Post scheduled successfully' : 'Post created successfully',
        color: 'green',
      });
      
      // Wait a moment for the query to invalidate, then navigate
      setTimeout(() => {
        router.push('/posts');
      }, 500);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to create post. Please try again.';
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      
      if (error.message?.includes('401') || error.message?.includes('Authentication')) {
        // Redirect to login if not authenticated
        setTimeout(() => router.push('/auth/login'), 2000);
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
              You need to be logged in to create posts.
            </Text>
            <Button onClick={asgardeoSignIn} variant="filled" size="lg">
              Login Now
            </Button>
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
                  onClick={asgardeoSignIn}
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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} size="2.5rem" mb="xs">Create New Post</Title>
          <Text c="dimmed" size="lg">Write and share your content with the world</Text>
        </div>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            {/* Main Content Column */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="md">
                {/* Title and Content */}
                <Card withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="lg">
                    <div>
                      <TextInput
                        label="Post Title"
                        placeholder="Enter a catchy title for your post..."
                        required
                        size="lg"
                        style={{ fontSize: '1.1rem' }}
                        {...form.getInputProps('title')}
                      />
                      <Text size="xs" c="dimmed" mt={4}>
                        A good title helps readers find your content
                      </Text>
                    </div>

                    <div>
                      <Text fw={600} mb="xs" size="md">Content</Text>
                      <Text size="xs" c="dimmed" mb="sm">
                        Write your post content using the rich text editor below
                      </Text>
                      <TipTapEditor
                        content={form.values.content}
                        onChange={(content) => form.setFieldValue('content', content)}
                        placeholder="Start writing your post here... You can use formatting, add images, links, and more!"
                      />
                      {form.errors.content && (
                        <Text size="xs" c="red" mt={4}>{form.errors.content}</Text>
                      )}
                    </div>
                  </Stack>
                </Card>

                {/* Excerpt */}
                <Card withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="sm">
                    <div>
                      <Textarea
                        label="Excerpt"
                        description="A brief summary of your post (shown in previews and search results)"
                        placeholder="Write a brief description that will entice readers to click..."
                        rows={3}
                        {...form.getInputProps('excerpt')}
                      />
                    </div>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>

            {/* Sidebar Column */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="md">
                {/* Publish Options */}
                <Card withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="md">
                    <Title order={4}>Publish</Title>
                    
                    <Switch
                      label="Auto-save Draft"
                      description="Automatically save your work every 30 seconds"
                      checked={autoSaveEnabled}
                      onChange={(event) => setAutoSaveEnabled(event.currentTarget.checked)}
                    />
                    
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

                    <Divider my="sm" />

                    <Group grow>
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
                        disabled={createPost.isLoading || !form.values.title || !form.values.content || form.values.content.trim() === '<p></p>'}
                        color="wso2-orange"
                      >
                        {isScheduled ? 'Schedule' : 'Publish'}
                      </Button>
                    </Group>
                  </Stack>
                </Card>

                {/* Categories & Tags */}
                <Card withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="md">
                    <Title order={4}>Categories & Tags</Title>
                    
                    <MultiSelect
                      label="Categories"
                      description="Select one or more categories"
                      placeholder="Choose categories..."
                      data={categories?.categories?.map((cat: any) => ({
                        value: cat.id,
                        label: cat.name,
                      })) || []}
                      searchable
                      {...form.getInputProps('categories')}
                    />

                    <MultiSelect
                      label="Tags"
                      description="Add tags to help readers find your post"
                      placeholder="Add tags..."
                      data={tags?.tags?.map((tag: any) => ({
                        value: tag.id,
                        label: tag.name,
                      })) || []}
                      searchable
                      {...form.getInputProps('tags')}
                    />
                  </Stack>
                </Card>

                {/* Featured Image */}
                <Card withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Title order={4}>Featured Image</Title>
                      <Button
                        variant="light"
                        size="sm"
                        leftSection={<IconPhoto size={16} />}
                        onClick={openMediaSelector}
                      >
                        Select from Media
                      </Button>
                    </Group>
                    
                    <TextInput
                      label="Image URL"
                      placeholder="https://example.com/image.jpg or select from media library"
                      {...form.getInputProps('featuredImageUrl')}
                    />
                    
                    {form.values.featuredImageUrl && (
                      <div style={{ position: 'relative' }}>
                        <Text size="sm" fw={500} mb="xs">Preview:</Text>
                        <Image
                          src={form.values.featuredImageUrl}
                          alt="Featured image preview"
                          height={200}
                          fit="cover"
                          radius="md"
                          style={{
                            border: '1px solid #e0e0e0',
                          }}
                          onError={() => {
                            // Handle error gracefully
                          }}
                        />
                        <Button
                          variant="subtle"
                          color="red"
                          size="xs"
                          leftSection={<IconX size={14} />}
                          onClick={() => form.setFieldValue('featuredImageUrl', '')}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    <Text size="xs" c="dimmed">
                      Add a featured image to make your post stand out. You can upload or select from media library.
                    </Text>
                  </Stack>
                </Card>

                {/* SEO Settings */}
                <Card withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="md">
                    <Title order={4}>SEO Settings</Title>
                    <Text size="xs" c="dimmed" mb="sm">
                      Improve how your post appears in search results
                    </Text>
                    
                    <TextInput
                      label="Meta Title"
                      placeholder="SEO optimized title"
                      {...form.getInputProps('metaTitle')}
                    />
                    
                    <Textarea
                      label="Meta Description"
                      placeholder="Brief description for search engines"
                      rows={2}
                      {...form.getInputProps('metaDescription')}
                    />
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </form>
      </Stack>
    </Container>
  );
}
