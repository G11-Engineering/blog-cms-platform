import { useQuery } from 'react-query';

interface UseCategoriesParams {
  search?: string;
  sortBy?: string;
  limit?: number;
}

export function useCategories(params: UseCategoriesParams = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params.search) searchParams.append('search', params.search);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`http://localhost:3004/api/categories?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}