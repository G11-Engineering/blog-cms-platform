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

      const response = await fetch(`http://localhost:3002/api/posts?${searchParams.toString()}`);
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
      const response = await fetch('http://localhost:3002/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
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
      const response = await fetch(`http://localhost:3002/api/posts/${postId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
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

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`http://localhost:3002/api/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
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