'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Stack, Title, TextInput, Textarea, Select, MultiSelect, Button, Group, Card, Text, Switch, Grid, Divider, Loader, Center } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { MediaSelector } from '@/components/MediaSelector';
import { useUpdatePost } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from 'react-query';
import { useDisclosure } from '@mantine/hooks';
import { IconPhoto, IconX } from '@tabler/icons-react';
import { Image } from '@mantine/core';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isAuthor } = useAuth();
  const updatePost = useUpdatePost();
  const { data: categories } = useCategories({ limit: 100 });
  const { data: tags } = useTags({ limit: 100 });
  
  const slug = params.slug as string;
  
  // Fetch the full post with content
  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      // First, get all posts to find the post ID by slug
      const postsResponse = await fetch('http://localhost:3002/api/posts?status=published');
      const postsData = await postsResponse.json();
      const foundPost = postsData.posts?.find((p: any) => p.slug === slug);
      
      if (!foundPost?.id) {
        throw new Error('Post not found');
      }
      
      // Then fetch the full post with content
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/posts/${foundPost.id}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      return data.post;
    },
    enabled: !!slug,
  });
  
  const post = postData;
  
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
      status: 'published',
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      content: (value) => (!value || value.trim() === '<p></p>' ? 'Content is required' : null),
    },
  });

  // Load post data when available - use a ref to prevent re-loading
  const postLoadedRef = useRef(false);
  
  useEffect(() => {
    if (post && post.id && !postLoadedRef.current) {
      console.log('Loading post data:', { 
        id: post.id, 
        hasContent: !!post.content, 
        contentLength: post.content?.length,
        contentPreview: post.content?.substring(0, 100)
      });
      
      // Set form values, ensuring content is properly set
      const formValues = {
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featuredImageUrl: post.featured_image_url || '',
        metaTitle: post.meta_title || '',
        metaDescription: post.meta_description || '',
        categories: post.categories?.map((c: any) => c.id || c) || [],
        tags: post.tags?.map((t: any) => t.id || t) || [],
        status: post.status || 'published',
      };
      
      console.log('Setting form values:', {
        title: formValues.title,
        hasContent: !!formValues.content,
        contentLength: formValues.content?.length,
        contentPreview: formValues.content?.substring(0, 100)
      });
      
      form.setValues(formValues);
      
      if (post.scheduled_at) {
        setIsScheduled(true);
        setScheduledAt(new Date(post.scheduled_at));
      }
      
      postLoadedRef.current = true;
    }
  }, [post, form]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!isAuthenticated || !isAuthor) {
      notifications.show({
        title: 'Permission Denied',
        message: 'You do not have permission to edit this post',
        color: 'red',
      });
      return;
    }

    if (!post?.id) {
      notifications.show({
        title: 'Error',
        message: 'Post not found',
        color: 'red',
      });
      return;
    }

    try {
      // Ensure content is always included, even if empty
      const postData = {
        title: values.title,
        content: values.content || '',
        excerpt: values.excerpt || '',
        featuredImageUrl: values.featuredImageUrl || '',
        metaTitle: values.metaTitle || '',
        metaDescription: values.metaDescription || '',
        categories: values.categories || [],
        tags: values.tags || [],
        status: (isScheduled ? 'scheduled' : values.status) as 'published' | 'scheduled' | 'draft',
        scheduledAt: isScheduled ? scheduledAt?.toISOString() : undefined,
      };

      console.log('Submitting post update:', { 
        postId: post.id, 
        hasContent: !!postData.content, 
        contentLength: postData.content?.length,
        contentPreview: postData.content?.substring(0, 100)
      });
      
      const result = await updatePost.mutateAsync({ postId: post.id, data: postData });
      
      console.log('Update result:', result);
      
      notifications.show({
        title: 'Success!',
        message: 'Post updated successfully',
        color: 'green',
      });
      
      // Use the updated post's slug (in case title changed)
      const updatedSlug = result?.post?.slug || post.slug;
      setTimeout(() => {
        router.push(`/posts/${updatedSlug}`);
      }, 500);
    } catch (error: any) {
      console.error('Failed to update post:', error);
      
      const errorMessage = error.message || 'Failed to update post. Please try again.';
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      
      // If authentication failed, redirect to login
      if (errorMessage.includes('Authentication') || errorMessage.includes('log in')) {
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    }
  };

  if (!isAuthenticated || !isAuthor) {
    return (
      <Container size="md" py="xl">
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <Title order={2}>Permission Denied</Title>
            <Text c="dimmed" ta="center">
              You need to be logged in as an author to edit posts.
            </Text>
            <Button component="a" href="/auth/login" variant="filled">
              Login
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (postLoading || !post) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading post...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} size="2.5rem" mb="xs">Edit Post</Title>
          <Text c="dimmed" size="lg">Update your post content and settings</Text>
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
                    </div>

                    <div>
                      <Text fw={600} mb="xs" size="md">Content</Text>
                      <TipTapEditor
                        content={form.values.content}
                        onChange={(content) => form.setFieldValue('content', content)}
                        placeholder="Start writing your post here..."
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
                    <Textarea
                      label="Excerpt"
                      description="A brief summary of your post"
                      placeholder="Write a brief description..."
                      rows={3}
                      {...form.getInputProps('excerpt')}
                    />
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
                    
                    <Select
                      label="Status"
                      data={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' },
                      ]}
                      {...form.getInputProps('status')}
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
                        disabled={updatePost.isLoading}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="submit"
                        loading={updatePost.isLoading}
                        disabled={updatePost.isLoading || !form.values.title || !form.values.content || form.values.content.trim() === '<p></p>'}
                        color="wso2-orange"
                      >
                        Update
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
                    <Title order={4}>Featured Image</Title>
                    
                    <TextInput
                      label="Image URL"
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
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid #e0e0e0',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </Stack>
                </Card>

                {/* SEO Settings */}
                <Card withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="md">
                    <Title order={4}>SEO Settings</Title>
                    
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

        {/* Media Selector Modal */}
        <MediaSelector
          opened={mediaSelectorOpened}
          onClose={closeMediaSelector}
          onSelect={(url) => {
            form.setFieldValue('featuredImageUrl', url);
            closeMediaSelector();
          }}
          title="Select Featured Image"
        />
      </Stack>
    </Container>
  );
}

