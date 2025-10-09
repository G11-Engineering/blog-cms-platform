'use client';

import { Container, Grid, Stack, Title, Text, Button, Group, Card, Badge, TextInput, Select, Box, Center, ThemeIcon, Divider, Pagination, Image } from '@mantine/core';
import { IconTag, IconSearch, IconFilter, IconTrendingUp, IconClock, IconEye, IconBookmark } from '@tabler/icons-react';
import Link from 'next/link';
import { useTags } from '@/hooks/useTags';
import { usePosts } from '@/hooks/usePosts';
import { useState } from 'react';

export default function TagsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('usage_count');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sample tags data for demonstration
  const sampleTags = [
    { id: '1', name: 'WSO2', slug: 'wso2', description: 'WSO2 platform and products', usage_count: 45, color: '#ff8c00' },
    { id: '2', name: 'API Gateway', slug: 'api-gateway', description: 'API Gateway solutions and patterns', usage_count: 32, color: '#3B82F6' },
    { id: '3', name: 'Microservices', slug: 'microservices', description: 'Microservices architecture and design', usage_count: 38, color: '#8B5CF6' },
    { id: '4', name: 'Integration', slug: 'integration', description: 'Enterprise integration solutions', usage_count: 28, color: '#10B981' },
    { id: '5', name: 'Identity', slug: 'identity', description: 'Identity and access management', usage_count: 25, color: '#EF4444' },
    { id: '6', name: 'Security', slug: 'security', description: 'Security best practices and solutions', usage_count: 35, color: '#F59E0B' },
    { id: '7', name: 'DevOps', slug: 'devops', description: 'DevOps practices and automation', usage_count: 22, color: '#06B6D4' },
    { id: '8', name: 'Cloud', slug: 'cloud', description: 'Cloud computing and deployment', usage_count: 18, color: '#84CC16' },
    { id: '9', name: 'Enterprise', slug: 'enterprise', description: 'Enterprise solutions and patterns', usage_count: 30, color: '#8B5CF6' },
    { id: '10', name: 'Open Source', slug: 'open-source', description: 'Open source technologies and tools', usage_count: 15, color: '#10B981' },
    { id: '11', name: 'Analytics', slug: 'analytics', description: 'Data analytics and business intelligence', usage_count: 12, color: '#F59E0B' },
    { id: '12', name: 'Performance', slug: 'performance', description: 'Performance optimization and monitoring', usage_count: 20, color: '#EF4444' },
  ];

  // Sample posts data for demonstration
  const samplePosts = [
    { id: '1', title: 'Getting Started with WSO2 API Manager', excerpt: 'Learn the basics of API management with WSO2', tags: ['wso2', 'api-gateway'], view_count: 1250, published_at: '2024-01-15' },
    { id: '2', title: 'Microservices Architecture Patterns', excerpt: 'Best practices for building microservices', tags: ['microservices', 'architecture'], view_count: 980, published_at: '2024-01-12' },
    { id: '3', title: 'Identity and Access Management', excerpt: 'Implementing IAM solutions with WSO2 Identity Server', tags: ['identity', 'security'], view_count: 750, published_at: '2024-01-10' },
    { id: '4', title: 'Enterprise Integration Patterns', excerpt: 'Common patterns for enterprise integration', tags: ['integration', 'enterprise'], view_count: 650, published_at: '2024-01-08' },
    { id: '5', title: 'DevOps Best Practices', excerpt: 'Streamlining your development workflow', tags: ['devops', 'automation'], view_count: 890, published_at: '2024-01-05' },
    { id: '6', title: 'Security in API Management', excerpt: 'Securing your APIs with proper authentication', tags: ['security', 'api'], view_count: 1100, published_at: '2024-01-03' },
  ];

  const { data: tags, isLoading: tagsLoading } = useTags({ 
    search: searchTerm,
    sortBy,
    limit: 50
  });

  const { data: posts, isLoading: postsLoading } = usePosts({
    status: 'published',
    tag: selectedTag,
    limit: 6
  });

  // Use sample data if API data is not available
  const displayTags = tags?.tags || sampleTags;
  const displayPosts = posts?.posts || samplePosts;

  const filteredTags = displayTags.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(displayTags.length / itemsPerPage);

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
              <IconTag size={40} />
            </ThemeIcon>
          </Center>
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            Explore Tags
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Discover topics and find content by exploring our comprehensive tag collection.
          </Text>
        </Stack>

        {/* Search and Filter */}
        <Card withBorder shadow="sm" p="lg" radius="lg">
          <Stack gap="md">
            <Title order={3} c="wso2-black.9">Find Tags</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <TextInput
                  placeholder="Search tags..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  placeholder="Sort by"
                  data={[
                    { value: 'usage_count', label: 'Most Used' },
                    { value: 'name', label: 'Name A-Z' },
                    { value: 'created_at', label: 'Recently Added' },
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value || 'usage_count')}
                  size="md"
                  leftSection={<IconFilter size={16} />}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Selected Tag Posts */}
        {selectedTag && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={2} c="wso2-black.9" size="1.8rem">
                Posts tagged with "{selectedTag}"
              </Title>
              <Button 
                variant="subtle"
                onClick={() => setSelectedTag('')}
                c="wso2-orange.6"
              >
                Clear Filter
              </Button>
            </Group>
            
            {postsLoading ? (
              <Grid>
                {Array.from({ length: 6 }).map((_, i) => (
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
              <Grid>
                {posts?.posts?.map((post: any) => (
                  <Grid.Col key={post.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card withBorder shadow="sm" radius="md">
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
                      <Stack gap="sm" p="md">
                        <Text fw={500} lineClamp={2}>
                          {post.title}
                        </Text>
                        
                        {post.excerpt && (
                          <Text size="sm" c="dimmed" lineClamp={3}>
                            {post.excerpt}
                          </Text>
                        )}
                        
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconEye size={16} />
                            <Text size="sm" c="dimmed">
                              {post.view_count || 0}
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <IconClock size={16} />
                            <Text size="sm" c="dimmed">
                              {new Date(post.published_at).toLocaleDateString()}
                            </Text>
                          </Group>
                        </Group>
                        
                        <Button
                          component={Link}
                          href={`/posts/${post.slug}`}
                          variant="light"
                          fullWidth
                          color="wso2-orange"
                        >
                          Read More
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
            
            <Divider />
          </Stack>
        )}

        {/* Tags Grid */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2} c="wso2-black.9" size="1.8rem">
              All Tags
            </Title>
            <Text size="sm" c="dimmed">
              {displayTags.length} tags found
            </Text>
          </Group>
          
          {tagsLoading ? (
            <Grid>
              {Array.from({ length: 12 }).map((_, i) => (
                <Grid.Col key={i} span={{ base: 6, sm: 4, md: 3, lg: 2 }}>
                  <Card withBorder>
                    <Stack align="center" gap="sm" p="md">
                      <div style={{ height: 40, width: 40, backgroundColor: '#f8f9fa', borderRadius: '50%' }} />
                      <div style={{ height: 16, backgroundColor: '#f8f9fa', borderRadius: 4, width: '80%' }} />
                      <div style={{ height: 12, backgroundColor: '#f8f9fa', borderRadius: 4, width: '60%' }} />
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <>
              <Grid>
                {filteredTags.map((tag: any) => (
                  <Grid.Col key={tag.id} span={{ base: 6, sm: 4, md: 3, lg: 2 }}>
                    <Card
                      withBorder
                      shadow="sm"
                      radius="md"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: selectedTag === tag.slug ? '2px solid #ff8c00' : '1px solid #e9ecef' // Softer orange
                      }}
                      onClick={() => setSelectedTag(tag.slug)}
                    >
                      <Stack align="center" gap="sm" p="md">
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: tag.color || '#ff8c00', // Softer orange
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text c="white" fw={600} size="sm">
                            {tag.name.charAt(0).toUpperCase()}
                          </Text>
                        </div>
                        <Text fw={500} ta="center" size="sm">
                          {tag.name}
                        </Text>
                        <Group gap="xs">
                          <IconBookmark size={14} />
                          <Text size="xs" c="dimmed">
                            {tag.usage_count || 0} posts
                          </Text>
                        </Group>
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

        {/* Popular Tags Quick Access */}
        {tags?.tags?.slice(0, 10).length > 0 && (
          <Stack gap="md">
            <Title order={2} c="wso2-black.9" size="1.8rem">
              🔥 Popular Tags
            </Title>
            <Group gap="sm">
              {tags.tags.slice(0, 10).map((tag: any) => (
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
