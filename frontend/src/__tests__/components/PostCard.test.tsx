import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { PostCard } from '@/components/PostCard';

const mockPost = {
  id: '1',
  title: 'Test Post',
  excerpt: 'This is a test post excerpt',
  slug: 'test-post',
  status: 'published',
  view_count: 10,
  published_at: '2024-01-01T00:00:00Z',
  categories: [
    { id: '1', name: 'Technology', slug: 'technology' }
  ],
  tags: [
    { id: '1', name: 'React', slug: 'react' }
  ]
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    {children}
  </MantineProvider>
);

describe('PostCard', () => {
  it('renders post title', () => {
    render(
      <TestWrapper>
        <PostCard post={mockPost} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders post excerpt', () => {
    render(
      <TestWrapper>
        <PostCard post={mockPost} />
      </TestWrapper>
    );
    
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
  });

  it('renders categories', () => {
    render(
      <TestWrapper>
        <PostCard post={mockPost} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(
      <TestWrapper>
        <PostCard post={mockPost} />
      </TestWrapper>
    );
    
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders view count', () => {
    render(
      <TestWrapper>
        <PostCard post={mockPost} />
      </TestWrapper>
    );
    
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
