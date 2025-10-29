import { useQuery, useMutation, useQueryClient } from 'react-query';
import { categoryApi } from '@/services/categoryApi';
import { notifications } from '@mantine/notifications';

interface UseCategoriesParams {
  search?: string;
  sortBy?: string;
  limit?: number;
}

export function useCategories(params: UseCategoriesParams = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getCategory(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation(categoryApi.createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      notifications.show({
        title: 'Success',
        message: 'Category created successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to create category',
        color: 'red',
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => categoryApi.updateCategory(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['categories']);
        queryClient.invalidateQueries(['category', id]);
        notifications.show({
          title: 'Success',
          message: 'Category updated successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to update category',
          color: 'red',
        });
      },
    }
  );
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation(categoryApi.deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      notifications.show({
        title: 'Success',
        message: 'Category deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to delete category',
        color: 'red',
      });
    },
  });
}