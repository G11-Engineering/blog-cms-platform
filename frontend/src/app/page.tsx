'use client';

import { Container, Grid, Stack, Title, Text, Button, Group, Card, Box, Center, ThemeIcon, Divider, Badge } from '@mantine/core';
import { IconBookmark, IconUser, IconTrendingUp, IconClock, IconTag, IconCategory } from '@tabler/icons-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Hero Section */}
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
                    boxShadow: '0 8px 32px rgba(255, 140, 0, 0.2)', // Softer shadow
                  }}
            >
              <IconBookmark size={40} />
            </ThemeIcon>
          </Center>
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            WSO2 Blog Platform
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Discover enterprise insights, technical stories, and innovative solutions from the WSO2 community.
          </Text>
          <Group>
            <Button 
              component={Link} 
              href="/posts" 
              size="lg"
              leftSection={<IconBookmark size={20} />}
                  style={{
                    background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)', // Softer orange
                    border: 'none',
                  }}
            >
              Explore Posts
            </Button>
            <Button 
              component={Link} 
              href="/auth/register" 
              size="lg"
              variant="outline"
              leftSection={<IconUser size={20} />}
              style={{
                borderColor: '#FF7300',
                color: '#FF7300',
              }}
            >
              Join Community
            </Button>
          </Group>
        </Stack>

        {/* Features Section */}
        <Stack gap="md">
          <Title order={2} c="wso2-black.9" size="1.8rem" ta="center">
            🔥 Trending Posts
          </Title>
          
          <Grid>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                <Card withBorder shadow="sm" radius="md" h="100%">
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
                  <Stack gap="sm" p="md" justify="space-between" h="100%">
                    <div>
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Text fw={600} lineClamp={2} size="sm">
                          Sample Trending Post {i + 1}
                        </Text>
                        <Badge variant="light" color="red" size="xs">
                          🔥 Trending
                        </Badge>
                      </Group>
                      
                      <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
                        This is a sample trending post description that shows how content would appear in the WSO2 blog platform.
                      </Text>
                    </div>
                    
                    <div>
                      <Group justify="space-between" mb="sm">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">👁️ 1,234</Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">📅 2 days ago</Text>
                        </Group>
                      </Group>
                      
                      <Button
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
        </Stack>

        <Divider />

        {/* Latest Posts */}
        <Stack gap="md">
          <Title order={2} c="wso2-black.9" size="1.8rem">
            📝 Latest Posts
          </Title>
          
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder shadow="sm" radius="md">
                  <Card.Section>
                    <div 
                      style={{ 
                        height: 200, 
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem'
                      }}
                    >
                      📰
                    </div>
                  </Card.Section>
                  <Stack gap="sm" p="md">
                    <Group justify="space-between" align="flex-start">
                      <Text fw={500} lineClamp={2}>
                        Sample Latest Post {i + 1}
                      </Text>
                      <Badge variant="light" color="blue" size="sm">
                        Published
                      </Badge>
                    </Group>
                    
                    <Text size="sm" c="dimmed" lineClamp={3}>
                      This is a sample latest post description that demonstrates the content structure of the WSO2 blog platform.
                    </Text>
                    
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">👁️ 456</Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">📅 1 day ago</Text>
                      </Group>
                    </Group>
                    
                    <Button
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
        </Stack>

        <Divider />

        {/* Categories */}
        <Stack gap="md">
          <Title order={2} c="wso2-black.9" size="1.8rem">
            📂 Categories
          </Title>
          <Grid>
            {[
              { name: 'API Management', color: '#FF7300' },
              { name: 'Integration', color: '#3B82F6' },
              { name: 'Identity & Access', color: '#10B981' },
              { name: 'Microservices', color: '#8B5CF6' },
              { name: 'DevOps', color: '#F59E0B' },
              { name: 'Security', color: '#EF4444' },
            ].map((category, i) => (
              <Grid.Col key={i} span={{ base: 6, sm: 4, md: 2 }}>
                <Card
                  component={Link}
                  href={`/categories/${category.name.toLowerCase()}`}
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
                        backgroundColor: category.color,
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
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>

        {/* Popular Tags */}
        <Stack gap="md">
          <Title order={2} c="wso2-black.9" size="1.8rem">
            🏷️ Popular Tags
          </Title>
          <Group gap="sm">
            {[
              'WSO2', 'API Gateway', 'Microservices', 'Integration', 'Identity',
              'Security', 'DevOps', 'Cloud', 'Enterprise', 'Open Source'
            ].map((tag, i) => (
              <Badge
                key={i}
                component={Link}
                href={`/tags/${tag.toLowerCase()}`}
                variant="light"
                color="wso2-orange"
                style={{ textDecoration: 'none' }}
                size="lg"
                leftSection={<IconTag size={14} />}
              >
                {tag}
              </Badge>
            ))}
          </Group>
        </Stack>

        {/* Call to Action */}
        <Box
          p="xl"
          style={{
            background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)', // Softer orange
            borderRadius: '16px',
            color: 'white',
          }}
        >
          <Stack align="center" gap="md">
            <Title order={2} c="white" ta="center">
              Ready to Share Your Story?
            </Title>
            <Text c="white" ta="center" maw={500} opacity={0.9}>
              Join the WSO2 community and share your technical insights, experiences, and innovative solutions.
            </Text>
            <Group>
              <Button 
                component={Link} 
                href="/auth/register" 
                size="lg"
                variant="white"
                color="wso2-orange"
                leftSection={<IconUser size={20} />}
                style={{
                  background: 'white',
                  color: '#FF7300',
                  fontWeight: 600,
                }}
              >
                Start Writing
              </Button>
              <Button 
                component={Link} 
                href="/auth/login" 
                size="lg"
                variant="outline"
                c="white"
                leftSection={<IconBookmark size={20} />}
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                Sign In
              </Button>
            </Group>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}