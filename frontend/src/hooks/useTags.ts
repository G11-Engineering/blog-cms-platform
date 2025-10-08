import { useQuery } from 'react-query';

interface UseTagsParams {
  search?: string;
  sortBy?: string;
  limit?: number;
}

export function useTags(params: UseTagsParams = {}) {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params.search) searchParams.append('search', params.search);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`http://localhost:3004/api/tags?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}