'use client';

import { Container, Grid, Stack, Title, Text, Button, Group, Card, Image, Badge, TextInput, Select, Box, Center, ThemeIcon, Divider, Pagination, Textarea } from '@mantine/core';
import { IconBookmark, IconSearch, IconFilter, IconTrendingUp, IconClock, IconTag, IconCategory, IconUser, IconEye, IconHeart, IconMessageCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function PostsPage() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sample posts data for demonstration
  const samplePosts = [
    { id: '1', title: 'Getting Started with WSO2 API Manager', excerpt: 'Learn the basics of API management with WSO2', category: 'API Management', tags: ['wso2', 'api-gateway'], view_count: 1250, published_at: '2024-01-15', author: 'John Doe', featured_image_url: null },
    { id: '2', title: 'Microservices Architecture Patterns', excerpt: 'Best practices for building microservices', category: 'Microservices', tags: ['microservices', 'architecture'], view_count: 980, published_at: '2024-01-12', author: 'Jane Smith', featured_image_url: null },
    { id: '3', title: 'Identity and Access Management', excerpt: 'Implementing IAM solutions with WSO2 Identity Server', category: 'Identity & Access', tags: ['identity', 'security'], view_count: 750, published_at: '2024-01-10', author: 'Mike Johnson', featured_image_url: null },
    { id: '4', title: 'Enterprise Integration Patterns', excerpt: 'Common patterns for enterprise integration', category: 'Integration', tags: ['integration', 'enterprise'], view_count: 650, published_at: '2024-01-08', author: 'Sarah Wilson', featured_image_url: null },
    { id: '5', title: 'DevOps Best Practices', excerpt: 'Streamlining your development workflow', category: 'DevOps', tags: ['devops', 'automation'], view_count: 890, published_at: '2024-01-05', author: 'David Brown', featured_image_url: null },
    { id: '6', title: 'Security in API Management', excerpt: 'Securing your APIs with proper authentication', category: 'Security', tags: ['security', 'api'], view_count: 1100, published_at: '2024-01-03', author: 'Lisa Davis', featured_image_url: null },
    { id: '7', title: 'Cloud Deployment Strategies', excerpt: 'Best practices for cloud deployment', category: 'Cloud', tags: ['cloud', 'deployment'], view_count: 720, published_at: '2024-01-01', author: 'Tom Wilson', featured_image_url: null },
    { id: '8', title: 'Data Analytics with WSO2', excerpt: 'Implementing analytics solutions', category: 'Analytics', tags: ['analytics', 'data'], view_count: 580, published_at: '2023-12-28', author: 'Emma Taylor', featured_image_url: null },
  ];

  // Sample categories data
  const sampleCategories = [
    { id: '1', name: 'API Management', slug: 'api-management' },
    { id: '2', name: 'Integration', slug: 'integration' },
    { id: '3', name: 'Identity & Access', slug: 'identity-access' },
    { id: '4', name: 'Microservices', slug: 'microservices' },
    { id: '5', name: 'DevOps', slug: 'devops' },
    { id: '6', name: 'Security', slug: 'security' },
    { id: '7', name: 'Cloud', slug: 'cloud' },
    { id: '8', name: 'Analytics', slug: 'analytics' },
  ];

  // Sample tags data
  const sampleTags = [
    { id: '1', name: 'WSO2', slug: 'wso2' },
    { id: '2', name: 'API Gateway', slug: 'api-gateway' },
    { id: '3', name: 'Microservices', slug: 'microservices' },
    { id: '4', name: 'Integration', slug: 'integration' },
    { id: '5', name: 'Identity', slug: 'identity' },
    { id: '6', name: 'Security', slug: 'security' },
    { id: '7', name: 'DevOps', slug: 'devops' },
    { id: '8', name: 'Cloud', slug: 'cloud' },
  ];

  const { data: posts, isLoading: postsLoading } = usePosts({ 
    status: 'published',
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    tag: selectedTag || undefined,
    sortBy,
    limit: itemsPerPage
  });

  const { data: categories } = useCategories({ limit: 20 });
  const { data: tags } = useTags({ limit: 20 });

  // Use API data if available, otherwise show sample data (only if not loading and no API data)
  const displayPosts = postsLoading ? [] : (posts?.posts ? posts.posts : (posts === undefined ? samplePosts : []));
  const displayCategories = categories?.categories || sampleCategories;
  const displayTags = tags?.tags || sampleTags;

  const totalPages = Math.ceil((posts?.pagination?.total || (displayPosts.length > 0 ? displayPosts.length : samplePosts.length)) / itemsPerPage);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack align="center" gap="md" py="xl">
          <Center>
            <ThemeIcon
              size={80}
              radius="xl"
              color="wso2-orange"
              variant="filled"
              style={{
                background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)', // Softer orange
                color: 'white',
                boxShadow: '0 8px 32px rgba(255, 115, 0, 0.3)',
              }}
            >
              <IconBookmark size={40} />
            </ThemeIcon>
          </Center>
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            All Posts
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Discover all published content from the WSO2 community.
          </Text>
        </Stack>

        {/* Search and Filter */}
        <Card withBorder shadow="sm" p="lg" radius="lg">
          <Stack gap="md">
            <Title order={3} c="wso2-black.9">Filter Posts</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  placeholder="Search posts, authors, topics..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  placeholder="Category"
                  data={displayCategories.map((cat: any) => ({ value: cat.slug, label: cat.name }))}
                  value={selectedCategory}
                  onChange={(value) => setSelectedCategory(value || '')}
                  size="md"
                  leftSection={<IconCategory size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  placeholder="Tag"
                  data={displayTags.map((tag: any) => ({ value: tag.slug, label: tag.name }))}
                  value={selectedTag}
                  onChange={(value) => setSelectedTag(value || '')}
                  size="md"
                  leftSection={<IconTag size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Select
                  placeholder="Sort by"
                  data={[
                    { value: 'created_at', label: 'Latest' },
                    { value: 'view_count', label: 'Most Popular' },
                    { value: 'title', label: 'Title A-Z' },
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value || 'created_at')}
                  size="md"
                  leftSection={<IconFilter size={16} />}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Posts Grid */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2} c="wso2-black.9" size="1.8rem">
              {searchTerm || selectedCategory || selectedTag ? 'Filtered Posts' : 'All Posts'}
            </Title>
            <Text size="sm" c="dimmed">
              {postsLoading ? 'Loading...' : `${displayPosts.length} ${displayPosts.length === 1 ? 'post' : 'posts'} found`}
            </Text>
          </Group>
          
          {!postsLoading && displayPosts.length === 0 && posts?.posts?.length === 0 && (
            <Card withBorder p="xl" ta="center">
              <Stack gap="md" align="center">
                <Text size="xl" c="dimmed">No posts found</Text>
                <Text size="sm" c="dimmed">
                  {isAuthenticated ? (
                    <>
                      You haven't created any posts yet. <Link href="/posts/create" style={{ color: '#ff8c00' }}>Create your first post</Link>
                    </>
                  ) : (
                    'Be the first to create a post!'
                  )}
                </Text>
              </Stack>
            </Card>
          )}
          
          {postsLoading ? (
            <Grid>
              {Array.from({ length: 12 }).map((_, i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card withBorder>
                    <Card.Section>
                      <div style={{ height: 200, backgroundColor: '#f8f9fa' }} />
                    </Card.Section>
                    <Stack gap="sm" p="md">
                      <div style={{ height: 20, backgroundColor: '#f8f9fa', borderRadius: 4 }} />
                      <div style={{ height: 16, backgroundColor: '#f8f9fa', borderRadius: 4, width: '70%' }} />
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <>
              <Grid>
                {displayPosts.map((post: any) => (
                  <Grid.Col key={post.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card withBorder shadow="sm" radius="md" h="100%">
                      {post.featured_image_url ? (
                        <Card.Section>
                          <Image
                            src={post.featured_image_url}
                            height={200}
                            alt={post.title}
                            style={{ objectFit: 'cover' }}
                          />
                        </Card.Section>
                      ) : (
                        <Card.Section>
                          <div 
                            style={{ 
                              height: 200, 
                              background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)', // Softer orange
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '2rem'
                            }}
                          >
                            📝
                          </div>
                        </Card.Section>
                      )}
                      
                      <Stack gap="sm" p="md" justify="space-between" h="100%">
                        <div>
                          <Group justify="space-between" align="flex-start" mb="xs">
                            <Text fw={600} lineClamp={2} size="sm">
                              {post.title}
                            </Text>
                            <Badge variant="light" color="blue" size="xs">
                              {post.status}
                            </Badge>
                          </Group>
                          
                          {post.excerpt && (
                            <Text size="xs" c="dimmed" lineClamp={3} mb="sm">
                              {post.excerpt}
                            </Text>
                          )}

                          {/* Categories and Tags */}
                          <Group gap="xs" mb="sm">
                            {post.categories?.slice(0, 2).map((category: any, idx: number) => (
                              <Badge key={category?.id || `cat-${idx}`} variant="light" color="wso2-orange" size="xs">
                                {category?.name || category}
                              </Badge>
                            ))}
                            {post.tags?.slice(0, 2).map((tag: any, idx: number) => (
                              <Badge key={tag?.id || `tag-${idx}`} variant="light" color="wso2-blue" size="xs">
                                #{tag?.name || tag}
                              </Badge>
                            ))}
                          </Group>
                        </div>
                        
                        <div>
                          <Group justify="space-between" mb="sm">
                            <Group gap="xs">
                              <IconEye size={14} />
                              <Text size="xs" c="dimmed">
                                {post.view_count || 0}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <IconClock size={14} />
                              <Text size="xs" c="dimmed">
                                {new Date(post.published_at).toLocaleDateString()}
                              </Text>
                            </Group>
                          </Group>
                          
                          <Button
                            component={Link}
                            href={`/posts/${post.slug}`}
                            variant="light"
                            fullWidth
                            size="xs"
                            color="wso2-orange"
                          >
                            Read More
                          </Button>
                        </div>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Center mt="xl">
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    color="wso2-orange"
                    size="md"
                  />
                </Center>
              )}
            </>
          )}
        </Stack>

        {/* Popular Categories */}
        {categories && categories.categories?.length > 0 && (
          <Stack gap="md">
            <Title order={2} c="wso2-black.9" size="1.8rem">
              📂 Browse by Category
            </Title>
            <Grid>
              {categories.categories.slice(0, 8).map((category: any) => (
                <Grid.Col key={category.id} span={{ base: 6, sm: 4, md: 3 }}>
                  <Card
                    component={Link}
                    href={`/categories/${category.slug}`}
                    withBorder
                    shadow="sm"
                    radius="md"
                    style={{ textDecoration: 'none' }}
                  >
                    <Stack align="center" gap="sm" p="md">
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: category.color || '#ff8c00', // Softer orange
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text c="white" fw={600} size="sm">
                          {category.name.charAt(0)}
                        </Text>
                      </div>
                      <Text fw={500} ta="center" size="sm">
                        {category.name}
                      </Text>
                      <Text size="xs" c="dimmed" ta="center">
                        {category.post_count || 0} posts
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        )}

        {/* Popular Tags */}
        {tags && tags.tags?.length > 0 && (
          <Stack gap="md">
            <Title order={2} c="wso2-black.9" size="1.8rem">
              🏷️ Popular Tags
            </Title>
            <Group gap="sm">
              {tags.tags.slice(0, 15).map((tag: any) => (
                <Badge
                  key={tag.id}
                  component={Link}
                  href={`/tags/${tag.slug}`}
                  variant="light"
                  color="wso2-orange"
                  style={{ textDecoration: 'none' }}
                  size="lg"
                  leftSection={<IconTag size={14} />}
                >
                  {tag.name} ({tag.usage_count || 0})
                </Badge>
              ))}
            </Group>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}