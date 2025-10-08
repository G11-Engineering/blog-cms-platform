import { Card, Text, Group, Badge, Button, Stack } from '@mantine/core';
import { IconEye, IconCalendar } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    excerpt?: string;
    slug: string;
    status: string;
    view_count?: number;
    published_at?: string;
    created_at: string;
    categories?: Array<{ id: string; name: string; slug: string }>;
    tags?: Array<{ id: string; name: string; slug: string }>;
    featured_image_url?: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card withBorder shadow="sm" radius="md">
      <Stack gap="sm" p="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} lineClamp={2} style={{ flex: 1 }}>
            {post.title}
          </Text>
          <Badge variant="light" color="blue">
            {post.status}
          </Badge>
        </Group>
        
        {post.excerpt && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {post.excerpt}
          </Text>
        )}
        
        <Group gap="xs" mb="xs">
          {post.categories?.slice(0, 2).map((category) => (
            <Badge key={category.id} variant="outline" color="gray" size="sm">
              {category.name}
            </Badge>
          ))}
          {post.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="light" color="blue" size="sm">
              {tag.name}
            </Badge>
          ))}
        </Group>
        
        <Group justify="space-between" c="dimmed">
          <Group gap="xs">
            <IconEye size={16} />
            <Text size="sm">
              {post.view_count || 0}
            </Text>
          </Group>
          <Group gap="xs">
            <IconCalendar size={16} />
            <Text size="sm">
              {formatDistanceToNow(new Date(post.published_at || post.created_at), { addSuffix: true })}
            </Text>
          </Group>
        </Group>
        
        <Button
          component={Link}
          href={`/posts/${post.slug}`}
          variant="light"
          fullWidth
        >
          Read More
        </Button>
      </Stack>
    </Card>
  );
}
