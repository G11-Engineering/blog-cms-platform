'use client';

import { useEffect } from 'react';
import { Container, Stack, Title, Text, Group, Badge, Avatar, Button, Card, Divider, Textarea, ActionIcon, Modal, TextInput } from '@mantine/core';
import { IconHeart, IconMessageCircle, IconEye, IconCalendar, IconUser, IconEdit, IconTrash, IconShare } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useParams, useRouter } from 'next/navigation';
import { usePostBySlug, usePublishPost, useDeletePost, useUpdatePost } from '@/hooks/usePosts';
import { useComments, useCreateComment, useLikeComment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
// TipTap editor saves HTML, not Markdown, so we render HTML directly

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isAuthor } = useAuth();
  const [commentModalOpened, { open: openCommentModal, close: closeCommentModal }] = useDisclosure(false);
  
  const slug = params.slug as string;
  
  // Fetch the full post with content by slug
  const { data: post, isLoading: postLoading } = usePostBySlug(slug);
  
  const { data: comments } = useComments({ postId: post?.id });
  const createComment = useCreateComment();
  const likeComment = useLikeComment();
  const publishPost = usePublishPost();
  const deletePost = useDeletePost();

  const commentForm = useForm({
    initialValues: {
      content: '',
      authorName: '',
      authorEmail: '',
      authorWebsite: '',
    },
    validate: {
      content: (value) => (!value ? 'Comment is required' : null),
      authorName: (value) => (!isAuthenticated && !value ? 'Name is required' : null),
      authorEmail: (value) => (!isAuthenticated && !value ? 'Email is required' : null),
    },
  });

  useEffect(() => {
    if (post?.id) {
      // Increment view count
      fetch(`http://localhost:3002/api/posts/${post.id}/views`, {
        method: 'POST',
      }).catch(console.error);
    }
  }, [post?.id]);

  const handleCommentSubmit = async (values: typeof commentForm.values) => {
    if (!post?.id) return;

    try {
      await createComment.mutateAsync({
        postId: post.id,
        content: values.content,
        authorName: values.authorName,
        authorEmail: values.authorEmail,
        authorWebsite: values.authorWebsite,
      });
      
      commentForm.reset();
      closeCommentModal();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handlePublish = async () => {
    if (!post?.id) return;
    
    try {
      await publishPost.mutateAsync(post.id);
    } catch (error) {
      console.error('Failed to publish post:', error);
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;
    
    try {
      await deletePost.mutateAsync(post.id);
      router.push('/posts');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (postLoading) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" gap="md">
          <Text>Loading post...</Text>
        </Stack>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" gap="md">
          <Title order={2}>Post Not Found</Title>
          <Text c="dimmed">The post you're looking for doesn't exist.</Text>
          <Button component="a" href="/posts">
            Browse Posts
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Post Header */}
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Title order={1} size="2.5rem" mb="md">
                {post.title}
              </Title>
              
              <Group gap="md" mb="md">
                <Badge variant="light" color="blue">
                  {post.status}
                </Badge>
                {post.categories?.map((category: any) => (
                  <Badge key={category.id} variant="outline" color="gray">
                    {category.name}
                  </Badge>
                ))}
              </Group>
              
              <Group gap="lg" c="dimmed" mb="md">
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text size="sm">
                    {formatDistanceToNow(new Date(post.published_at || post.created_at), { addSuffix: true })}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconEye size={16} />
                  <Text size="sm">{post.view_count || 0} views</Text>
                </Group>
                <Group gap="xs">
                  <IconMessageCircle size={16} />
                  <Text size="sm">{comments?.comments?.length || 0} comments</Text>
                </Group>
              </Group>
            </div>
            
            {isAuthor && (
              <Group gap="xs">
                <Button
                  variant="outline"
                  size="sm"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => router.push(`/posts/${post.slug}/edit`)}
                >
                  Edit
                </Button>
                {post.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={handlePublish}
                    loading={publishPost.isLoading}
                  >
                    Publish
                  </Button>
                )}
                <Button
                  variant="outline"
                  color="red"
                  size="sm"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDelete}
                  loading={deletePost.isLoading}
                >
                  Delete
                </Button>
              </Group>
            )}
          </Group>
          
          {post.featured_image_url && (
            <img
              src={post.featured_image_url}
              alt={post.title}
              style={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          )}
        </Stack>

        {/* Post Content */}
        <Card withBorder p="xl">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
            style={{
              // Ensure images are responsive
              maxWidth: '100%',
            }}
          />
        </Card>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Group gap="sm">
            <Text fw={500}>Tags:</Text>
            {post.tags.map((tag: any) => (
              <Badge key={tag.id} variant="light" color="gray">
                {tag.name}
              </Badge>
            ))}
          </Group>
        )}

        {/* Comments Section */}
        <Card withBorder p="xl">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Comments ({comments?.comments?.length || 0})</Title>
              <Button onClick={openCommentModal}>
                Add Comment
              </Button>
            </Group>
            
            <Divider />
            
            {comments?.comments?.map((comment: any) => (
              <Card key={comment.id} withBorder p="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Avatar size="sm" color="blue">
                        {comment.author_name?.charAt(0) || 'A'}
                      </Avatar>
                      <div>
                        <Text fw={500} size="sm">
                          {comment.author_name || 'Anonymous'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </Text>
                      </div>
                    </Group>
                    
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => likeComment.mutate(comment.id)}
                      >
                        <IconHeart size={16} />
                      </ActionIcon>
                      <Text size="sm" c="dimmed">
                        {comment.like_count || 0}
                      </Text>
                    </Group>
                  </Group>
                  
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: comment.content || '' }}
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      </Stack>

      {/* Comment Modal */}
      <Modal opened={commentModalOpened} onClose={closeCommentModal} title="Add Comment">
        <form onSubmit={commentForm.onSubmit(handleCommentSubmit)}>
          <Stack gap="md">
            {!isAuthenticated && (
              <Group grow>
                <TextInput
                  label="Name"
                  placeholder="Your name"
                  {...commentForm.getInputProps('authorName')}
                />
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  type="email"
                  {...commentForm.getInputProps('authorEmail')}
                />
              </Group>
            )}
            
            <TextInput
              label="Website"
              placeholder="https://yourwebsite.com (optional)"
              {...commentForm.getInputProps('authorWebsite')}
            />
            
            <Textarea
              label="Comment"
              placeholder="Write your comment..."
              rows={4}
              required
              {...commentForm.getInputProps('content')}
            />
            
            <Group justify="flex-end" gap="md">
              <Button variant="outline" onClick={closeCommentModal}>
                Cancel
              </Button>
              <Button type="submit" loading={createComment.isLoading}>
                Post Comment
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
