'use client';

import { Container, Grid, Stack, Title, Text, Button, Group, Card, Image, Badge, TextInput, Select, Box, Center, ThemeIcon, Divider, Pagination } from '@mantine/core';
import { IconCategory, IconSearch, IconFilter, IconTrendingUp, IconClock, IconEye, IconBookmark, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { usePosts } from '@/hooks/usePosts';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sample categories data for demonstration
  const sampleCategories = [
    { id: '1', name: 'API Management', slug: 'api-management', description: 'Everything about API design, management, and governance', color: '#ff8c00', postCount: 15 },
    { id: '2', name: 'Integration', slug: 'integration', description: 'Enterprise integration patterns and solutions', color: '#3B82F6', postCount: 12 },
    { id: '3', name: 'Identity & Access', slug: 'identity-access', description: 'Identity management and access control', color: '#10B981', postCount: 8 },
    { id: '4', name: 'Microservices', slug: 'microservices', description: 'Microservices architecture and patterns', color: '#8B5CF6', postCount: 20 },
    { id: '5', name: 'DevOps', slug: 'devops', description: 'DevOps practices and automation', color: '#F59E0B', postCount: 10 },
    { id: '6', name: 'Security', slug: 'security', description: 'Security best practices and solutions', color: '#EF4444', postCount: 18 },
    { id: '7', name: 'Cloud', slug: 'cloud', description: 'Cloud computing and deployment', color: '#06B6D4', postCount: 14 },
    { id: '8', name: 'Analytics', slug: 'analytics', description: 'Data analytics and business intelligence', color: '#84CC16', postCount: 6 },
  ];

  // Sample posts data for demonstration
  const samplePosts = [
    { id: '1', title: 'Getting Started with WSO2 API Manager', excerpt: 'Learn the basics of API management with WSO2', categoryId: '1', tags: ['wso2', 'api-gateway'], view_count: 1250, published_at: '2024-01-15' },
    { id: '2', title: 'Microservices Architecture Patterns', excerpt: 'Best practices for building microservices', categoryId: '4', tags: ['microservices', 'architecture'], view_count: 980, published_at: '2024-01-12' },
    { id: '3', title: 'Identity and Access Management', excerpt: 'Implementing IAM solutions with WSO2 Identity Server', categoryId: '3', tags: ['identity', 'security'], view_count: 750, published_at: '2024-01-10' },
    { id: '4', title: 'Enterprise Integration Patterns', excerpt: 'Common patterns for enterprise integration', categoryId: '2', tags: ['integration', 'enterprise'], view_count: 650, published_at: '2024-01-08' },
    { id: '5', title: 'DevOps Best Practices', excerpt: 'Streamlining your development workflow', categoryId: '5', tags: ['devops', 'automation'], view_count: 890, published_at: '2024-01-05' },
    { id: '6', title: 'Security in API Management', excerpt: 'Securing your APIs with proper authentication', categoryId: '6', tags: ['security', 'api'], view_count: 1100, published_at: '2024-01-03' },
  ];

  const { data: categories, isLoading: categoriesLoading } = useCategories({ 
    search: searchTerm,
    sortBy,
    limit: 50
  });

  const { data: posts, isLoading: postsLoading } = usePosts({
    status: 'published',
    category: selectedCategory,
    limit: 6
  });

  // Use sample data if API data is not available
  const displayCategories = categories?.categories || sampleCategories;
  const displayPosts = posts?.posts || samplePosts;

  const filteredCategories = displayCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(displayCategories.length / itemsPerPage);

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
              <IconCategory size={40} />
            </ThemeIcon>
          </Center>
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            Browse Categories
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Explore content organized by categories and discover posts that match your interests.
          </Text>
        </Stack>

        {/* Search and Filter */}
        <Card withBorder shadow="sm" p="lg" radius="lg">
          <Stack gap="md">
            <Title order={3} c="wso2-black.9">Find Categories</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <TextInput
                  placeholder="Search categories..."
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
                    { value: 'name', label: 'Name A-Z' },
                    { value: 'post_count', label: 'Most Posts' },
                    { value: 'created_at', label: 'Recently Added' },
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value || 'name')}
                  size="md"
                  leftSection={<IconFilter size={16} />}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Selected Category Posts */}
        {selectedCategory && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={2} c="wso2-black.9" size="1.8rem">
                Posts in "{selectedCategory}"
              </Title>
              <Button 
                variant="subtle"
                onClick={() => setSelectedCategory('')}
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
                              {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
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

        {/* Categories Grid */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2} c="wso2-black.9" size="1.8rem">
              All Categories
            </Title>
            <Text size="sm" c="dimmed">
              {displayCategories.length} categories found
            </Text>
          </Group>
          
          {categoriesLoading ? (
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
                {filteredCategories.map((category: any) => (
                  <Grid.Col key={category.id} span={{ base: 6, sm: 4, md: 3, lg: 2 }}>
                    <Card
                      withBorder
                      shadow="sm"
                      radius="md"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: selectedCategory === category.slug ? '2px solid #ff8c00' : '1px solid #e9ecef' // Softer orange
                      }}
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      <Stack align="center" gap="sm" p="md">
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            backgroundColor: category.color || '#ff8c00', // Softer orange
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text c="white" fw={600} size="lg">
                            {category.name.charAt(0).toUpperCase()}
                          </Text>
                        </div>
                        <Text fw={500} ta="center" size="sm">
                          {category.name}
                        </Text>
                        {category.description && (
                          <Text size="xs" c="dimmed" ta="center" lineClamp={2}>
                            {category.description}
                          </Text>
                        )}
                        <Group gap="xs">
                          <IconBookmark size={14} />
                          <Text size="xs" c="dimmed">
                            {category.post_count || 0} posts
                          </Text>
                        </Group>
                        <Button
                          variant="light"
                          size="xs"
                          rightSection={<IconArrowRight size={12} />}
                          color="wso2-orange"
                          fullWidth
                        >
                          Explore
                        </Button>
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

        {/* Popular Categories Quick Access */}
        {categories?.categories?.slice(0, 8).length > 0 && (
          <Stack gap="md">
            <Title order={2} c="wso2-black.9" size="1.8rem">
              🔥 Popular Categories
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
                          backgroundColor: category.color || '#FF7300',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text c="white" fw={600} size="sm">
                          {category.name.charAt(0).toUpperCase()}
                        </Text>
                      </div>
                      <Text fw={500} ta="center" size="sm">
                        {category.name}
                      </Text>
                      <Group gap="xs">
                        <IconBookmark size={14} />
                        <Text size="xs" c="dimmed">
                          {category.post_count || 0} posts
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}