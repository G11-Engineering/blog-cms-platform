import { useQuery, useMutation, useQueryClient } from 'react-query';

interface UsePostsParams {
  status?: string;
  limit?: number;
  sortBy?: string;
  search?: string;
  category?: string;
  tag?: string;
}

export function usePosts(params: UsePostsParams = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.search) searchParams.append('search', params.search);
      if (params.category) searchParams.append('category', params.category);
      if (params.tag) searchParams.append('tag', params.tag);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3002/api/posts?${searchParams.toString()}`, {
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  categories?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt?: string;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:3002/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create post' }));
        throw new Error(error.message || 'Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/posts/${postId}/publish`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to publish post' }));
        throw new Error(error.message || 'Failed to publish post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: any }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/posts/${postId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update post' }));
        const errorMessage = errorData.message || errorData.error?.message || 'Failed to update post';
        
        // If 401, it's likely an authentication issue
        if (response.status === 401) {
          // Clear potentially invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          throw new Error('Authentication failed. Please log in again.');
        }
        
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Also invalidate any post-specific queries
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/posts/${postId}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      return data.post;
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePostBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['post', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // First, get the post ID from the list
      const listResponse = await fetch(`http://localhost:3002/api/posts?status=published`);
      if (!listResponse.ok) {
        throw new Error('Failed to fetch posts');
      }
      const listData = await listResponse.json();
      const foundPost = listData.posts?.find((p: any) => p.slug === slug);
      
      if (!foundPost?.id) {
        throw new Error('Post not found');
      }
      
      // Then fetch the full post with content
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/posts/${foundPost.id}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      return data.post;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/posts/${postId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete post' }));
        throw new Error(error.message || 'Failed to delete post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}